const { spawn } = require('child_process');
const { validationResult } = require('express-validator');
const path = require('path');
const os = require('os');
const fs = require('fs').promises;
const crypto = require('crypto');

// Store active terminal sessions
const terminalSessions = new Map();

// Command history storage (in production, use database)
const commandHistory = new Map();

// Enhanced terminal session class
class TerminalSession {
  constructor(sessionId, workspaceId, userId) {
    this.sessionId = sessionId;
    this.workspaceId = workspaceId;
    this.userId = userId;
    this.createdAt = new Date();
    this.lastActivity = new Date();
    this.history = [];
    this.currentDirectory = process.cwd();
    this.environment = { ...process.env, TERM: 'xterm-256color' };
    this.shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    this.isRunning = false;
    this.terminal = null;
  }

  async start() {
    try {
      this.terminal = spawn(this.shell, [], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: this.currentDirectory,
        env: this.environment,
        shell: false
      });

      this.isRunning = true;

      // Handle terminal output
      this.terminal.stdout.on('data', (data) => {
        this.lastActivity = new Date();
        // Emit via Socket.IO or store for polling
        this.handleOutput(data, 'stdout');
      });

      this.terminal.stderr.on('data', (data) => {
        this.lastActivity = new Date();
        this.handleOutput(data, 'stderr');
      });

      this.terminal.on('close', (code) => {
        this.isRunning = false;
        this.handleClose(code);
      });

      this.terminal.on('error', (error) => {
        this.isRunning = false;
        this.handleError(error);
      });

      return true;
    } catch (error) {
      console.error('Failed to start terminal session:', error);
      return false;
    }
  }

  handleOutput(data, type) {
    const output = data.toString();
    // Store output for retrieval
    if (!this.outputBuffer) {
      this.outputBuffer = [];
    }
    this.outputBuffer.push({
      type,
      content: output,
      timestamp: new Date()
    });

    // Keep buffer size manageable
    if (this.outputBuffer.length > 1000) {
      this.outputBuffer = this.outputBuffer.slice(-500);
    }
  }

  handleClose(code) {
    this.handleOutput(`Process exited with code ${code}\n`, 'system');
  }

  handleError(error) {
    this.handleOutput(`Terminal error: ${error.message}\n`, 'error');
  }

  async executeCommand(command) {
    if (!this.isRunning || !this.terminal) {
      throw new Error('Terminal session is not active');
    }

    // Add to history
    this.history.push({
      command,
      timestamp: new Date(),
      directory: this.currentDirectory
    });

    // Keep history size manageable
    if (this.history.length > 1000) {
      this.history = this.history.slice(-500);
    }

    // Write command to terminal
    this.terminal.stdin.write(command + '\n');
    this.lastActivity = new Date();

    return {
      sessionId: this.sessionId,
      command,
      timestamp: new Date()
    };
  }

  async changeDirectory(directory) {
    try {
      await fs.access(directory);
      this.currentDirectory = directory;
      return true;
    } catch (error) {
      throw new Error(`Directory not accessible: ${directory}`);
    }
  }

  getOutput() {
    return this.outputBuffer || [];
  }

  getHistory(limit = 50) {
    return this.history.slice(-limit);
  }

  async kill() {
    if (this.terminal && this.isRunning) {
      this.terminal.kill();
      this.isRunning = false;
    }
  }
}

// Security validation for commands
const validateCommand = (command) => {
  const dangerousCommands = [
    'rm -rf /',
    'sudo rm',
    'format',
    'del /f /q',
    'rmdir /s /q',
    'shutdown',
    'reboot',
    'halt',
    'poweroff',
    'mkfs',
    'fdisk',
    'dd if=/dev/zero'
  ];

  const isDangerous = dangerousCommands.some(dangerous => 
    command.toLowerCase().includes(dangerous.toLowerCase())
  );

  return !isDangerous;
};

// @desc    Run terminal command
// @route   POST /api/terminal/run
// @access  Private
const runCommand = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { command, workspaceId, sessionId } = req.body;

    // Security validation
    if (!validateCommand(command)) {
      return res.status(400).json({
        success: false,
        error: 'Dangerous command detected and blocked'
      });
    }

    // Set up streaming response
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    let session;
    
    if (sessionId && terminalSessions.has(sessionId)) {
      session = terminalSessions.get(sessionId);
    } else {
      const newSessionId = sessionId || crypto.randomUUID();
      session = new TerminalSession(newSessionId, workspaceId, req.user._id);
      
      const started = await session.start();
      if (!started) {
        res.write(`data: ${JSON.stringify({ 
          error: 'Failed to start terminal session',
          type: 'error'
        })}\n\n`);
        res.end();
        return;
      }
      
      terminalSessions.set(newSessionId, session);
    }

    try {
      await session.executeCommand(command);
      
      // Stream output
      const outputInterval = setInterval(() => {
        const output = session.getOutput();
        if (output.length > 0) {
          const latestOutput = output.slice(-10); // Get last 10 outputs
          latestOutput.forEach(item => {
            res.write(`data: ${JSON.stringify({
              output: item.content,
              type: item.type,
              sessionId: session.sessionId,
              timestamp: item.timestamp
            })}\n\n`);
          });
        }
        
        if (!session.isRunning) {
          clearInterval(outputInterval);
          res.write(`data: ${JSON.stringify({ 
            output: '',
            type: 'complete',
            sessionId: session.sessionId
          })}\n\n`);
          res.end();
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(outputInterval);
        res.write(`data: ${JSON.stringify({ 
          output: '',
          type: 'complete',
          sessionId: session.sessionId
        })}\n\n`);
        res.end();
      }, 30000);

    } catch (error) {
      res.write(`data: ${JSON.stringify({ 
        error: 'Command execution error: ' + error.message,
        type: 'error',
        sessionId: session.sessionId
      })}\n\n`);
      res.end();
    }

  } catch (error) {
    console.error('Run command error:', error);
    res.write(`data: ${JSON.stringify({ 
      error: 'Terminal error: ' + error.message,
      type: 'error'
    })}\n\n`);
    res.end();
  }
};

// @desc    Create new terminal session
// @route   POST /api/terminal/session
// @access  Private
const createSession = async (req, res) => {
  try {
    const { workspaceId } = req.body;

    const sessionId = crypto.randomUUID();
    const session = new TerminalSession(sessionId, workspaceId, req.user._id);
    
    const started = await session.start();
    if (!started) {
      return res.status(500).json({
        success: false,
        error: 'Failed to start terminal session'
      });
    }

    terminalSessions.set(sessionId, session);

    res.json({
      success: true,
      data: {
        sessionId,
        shell: session.shell,
        platform: os.platform(),
        currentDirectory: session.currentDirectory,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create terminal session'
    });
  }
};

// @desc    Close terminal session
// @route   DELETE /api/terminal/session/:sessionId
// @access  Private
const closeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (terminalSessions.has(sessionId)) {
      const session = terminalSessions.get(sessionId);
      await session.kill();
      terminalSessions.delete(sessionId);

      res.json({
        success: true,
        message: 'Terminal session closed'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Terminal session not found'
      });
    }
  } catch (error) {
    console.error('Close session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to close terminal session'
    });
  }
};

// @desc    Get active terminal sessions
// @route   GET /api/terminal/sessions
// @access  Private
const getSessions = async (req, res) => {
  try {
    const sessions = Array.from(terminalSessions.values())
      .filter(session => session.userId.toString() === req.user._id.toString())
      .map(session => ({
        sessionId: session.sessionId,
        workspaceId: session.workspaceId,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        isRunning: session.isRunning,
        shell: session.shell,
        currentDirectory: session.currentDirectory
      }));

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get terminal sessions'
    });
  }
};

// @desc    Get system info
// @route   GET /api/terminal/system-info
// @access  Private
const getSystemInfo = async (req, res) => {
  try {
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      hostname: os.hostname(),
      homedir: os.homedir(),
      tmpdir: os.tmpdir(),
      totalmem: os.totalmem(),
      freemem: os.freemem(),
      cpus: os.cpus(),
      loadavg: os.loadavg(),
      uptime: os.uptime(),
      shell: os.platform() === 'win32' ? 'powershell.exe' : 'bash'
    };

    res.json({
      success: true,
      data: systemInfo
    });
  } catch (error) {
    console.error('Get system info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system info'
    });
  }
};

// @desc    Get command history for a session
// @route   GET /api/terminal/history/:sessionId?
// @access  Private
const getCommandHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50 } = req.query;

    if (sessionId && terminalSessions.has(sessionId)) {
      const session = terminalSessions.get(sessionId);
      const history = session.getHistory(parseInt(limit));
      
      res.json({
        success: true,
        data: history
      });
    } else {
      // Get global command history for user
      const userHistory = Array.from(terminalSessions.values())
        .filter(session => session.userId.toString() === req.user._id.toString())
        .flatMap(session => session.getHistory(parseInt(limit)))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, parseInt(limit));

      res.json({
        success: true,
        data: userHistory
      });
    }
  } catch (error) {
    console.error('Get command history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get command history'
    });
  }
};

// @desc    Change directory in terminal session
// @route   POST /api/terminal/cd
// @access  Private
const changeDirectory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { sessionId, directory } = req.body;

    if (!terminalSessions.has(sessionId)) {
      return res.status(404).json({
        success: false,
        error: 'Terminal session not found'
      });
    }

    const session = terminalSessions.get(sessionId);
    
    try {
      await session.changeDirectory(directory);
      res.json({
        success: true,
        data: {
          sessionId,
          currentDirectory: session.currentDirectory
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  } catch (error) {
    console.error('Change directory error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change directory'
    });
  }
};

// @desc    Get terminal output buffer
// @route   GET /api/terminal/output/:sessionId
// @access  Private
const getTerminalOutput = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 100 } = req.query;

    if (!terminalSessions.has(sessionId)) {
      return res.status(404).json({
        success: false,
        error: 'Terminal session not found'
      });
    }

    const session = terminalSessions.get(sessionId);
    const output = session.getOutput().slice(-parseInt(limit));

    res.json({
      success: true,
      data: output
    });
  } catch (error) {
    console.error('Get terminal output error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get terminal output'
    });
  }
};

// Clean up inactive sessions periodically
setInterval(() => {
  const now = new Date();
  for (const [sessionId, session] of terminalSessions.entries()) {
    // Close sessions inactive for more than 30 minutes
    if (now - session.lastActivity > 30 * 60 * 1000) {
      session.kill();
      terminalSessions.delete(sessionId);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes

module.exports = {
  runCommand,
  createSession,
  closeSession,
  getSessions,
  getSystemInfo,
  getCommandHistory,
  changeDirectory,
  getTerminalOutput
};
