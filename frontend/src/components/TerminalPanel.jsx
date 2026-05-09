import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTerminal, FiX, FiCommand, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { TERMINAL_COMMANDS } from '../utils/constants';
import useTerminalStore from '../store/terminalStore';

const TerminalPanel = ({ workspaceId, onClose }) => {
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showCommandHelp, setShowCommandHelp] = useState(false);
  
  const { 
    output, 
    isRunning, 
    sessionId, 
    runCommand, 
    createSession, 
    closeSession 
  } = useTerminalStore();

  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (workspaceId && !sessionId) {
      createSession({ workspaceId });
    }
    
    return () => {
      if (sessionId) {
        closeSession(sessionId);
      }
    };
  }, [workspaceId, sessionId, createSession, closeSession]);

  useEffect(() => {
    // Auto-scroll to bottom when new output arrives
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const handleCommandSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!command.trim() || isRunning) return;

    // Add to history
    const newHistory = [command, ...commandHistory.slice(0, 49)];
    setCommandHistory(newHistory);
    setHistoryIndex(-1);

    // Run command
    await runCommand({
      command,
      workspaceId,
      sessionId
    });

    setCommand('');
  }, [command, commandHistory, isRunning, runCommand, workspaceId, sessionId]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab completion (could be enhanced)
      const commonCommands = ['npm', 'git', 'node', 'ls', 'cd', 'pwd'];
      const match = commonCommands.find(cmd => cmd.startsWith(command));
      if (match) {
        setCommand(match);
      }
    }
  }, [command, commandHistory, historyIndex]);

  const clearTerminal = () => {
    // Clear output logic would go here
    setCommand('');
  };

  const insertCommand = (cmd) => {
    setCommand(cmd);
    inputRef.current?.focus();
  };

  return (
    <motion.div
      initial={{ height: 300, opacity: 0 }}
      animate={{ height: isMinimized ? 40 : 300, opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-editor-bg border-t border-editor-border flex flex-col"
    >
      {/* Header */}
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FiTerminal className="text-editor-accent" />
          <h3 className="font-semibold text-editor-text">Terminal</h3>
          {isRunning && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-500">Running</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {!isMinimized && (
            <>
              <button
                onClick={() => setShowCommandHelp(!showCommandHelp)}
                className="p-1 hover:bg-editor-hover rounded text-editor-text-dim"
                title="Command Help"
              >
                <FiCommand size={14} />
              </button>
              
              <button
                onClick={clearTerminal}
                className="p-1 hover:bg-editor-hover rounded text-editor-text-dim"
                title="Clear Terminal"
              >
                Clear
              </button>
              
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 hover:bg-editor-hover rounded text-editor-text-dim"
                title="Minimize"
              >
                <FiChevronDown size={14} />
              </button>
            </>
          )}
          
          <button
            onClick={onClose}
            className="p-1 hover:bg-editor-hover rounded text-editor-text-dim"
            title="Close"
          >
            <FiX size={14} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Command Help */}
          <AnimatePresence>
            {showCommandHelp && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-editor-border overflow-hidden"
              >
                <div className="p-3">
                  <h4 className="text-sm font-medium text-editor-text mb-2">Common Commands</h4>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {TERMINAL_COMMANDS.slice(0, 8).map((cmd) => (
                      <button
                        key={cmd.command}
                        onClick={() => insertCommand(cmd.command)}
                        className="text-left px-2 py-1 rounded text-xs hover:bg-editor-hover text-editor-text"
                      >
                        <span className="font-mono text-editor-accent">{cmd.command}</span>
                        <span className="text-editor-text-dim ml-2">{cmd.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Terminal Output */}
          <div 
            ref={terminalRef}
            className="flex-1 overflow-y-auto p-3 font-mono text-sm"
            style={{ minHeight: '150px' }}
          >
            {output.length === 0 ? (
              <div className="text-editor-text-dim">
                <p>Welcome to the integrated terminal.</p>
                <p>Type a command and press Enter to execute.</p>
                <p>Use ↑↓ arrows to navigate command history.</p>
              </div>
            ) : (
              output.map((line, index) => (
                <div key={index} className="terminal-output">
                  {line.output}
                </div>
              ))
            )}
            
            {isRunning && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400">Processing...</span>
              </div>
            )}
          </div>

          {/* Command Input */}
          <div className="border-t border-editor-border p-3">
            <form onSubmit={handleCommandSubmit} className="flex items-center space-x-2">
              <span className="text-green-400 font-mono text-sm">$</span>
              <input
                ref={inputRef}
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter command..."
                className="flex-1 bg-transparent text-green-400 font-mono text-sm outline-none"
                disabled={isRunning}
                autoComplete="off"
                spellCheck="false"
              />
              <button
                type="submit"
                disabled={!command.trim() || isRunning}
                className="p-1 text-editor-text-dim hover:text-editor-text disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiTerminal size={14} />
              </button>
            </form>
            
            {/* Command History Navigation */}
            {commandHistory.length > 0 && (
              <div className="mt-2 text-xs text-editor-text-dim">
                History: {historyIndex >= 0 ? `${historyIndex + 1}/${commandHistory.length}` : `${commandHistory.length} commands`}
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Minimized State */}
      {isMinimized && (
        <div className="flex-1 flex items-center justify-center">
          <button
            onClick={() => setIsMinimized(false)}
            className="p-2 hover:bg-editor-hover rounded text-editor-text"
            title="Expand Terminal"
          >
            <FiChevronUp size={20} />
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default TerminalPanel;
