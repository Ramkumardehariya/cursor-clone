#!/usr/bin/env node

/**
 * Cross-platform development server launcher for Cursor Clone
 * Supports Windows, macOS, and Linux
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Helper function to colorize output
const colorize = (text, color) => `${colors[color]}${text}${colors.reset}`;

// Platform detection
const platform = os.platform();
const isWindows = platform === 'win32';
const isMacOS = platform === 'darwin';
const isLinux = platform === 'linux';

// Log platform info
console.log(colorize(`🖥️  Platform: ${platform}`, 'cyan'));

// Check if required directories exist
const checkDirectories = () => {
  const backendDir = path.join(__dirname, 'backend');
  const frontendDir = path.join(__dirname, 'frontend');
  
  if (!fs.existsSync(backendDir)) {
    console.error(colorize('❌ Backend directory not found!', 'red'));
    process.exit(1);
  }
  
  if (!fs.existsSync(frontendDir)) {
    console.error(colorize('❌ Frontend directory not found!', 'red'));
    process.exit(1);
  }
  
  return { backendDir, frontendDir };
};

// Check if node_modules exist and install if needed
const checkDependencies = async (backendDir, frontendDir) => {
  const backendNodeModules = path.join(backendDir, 'node_modules');
  const frontendNodeModules = path.join(frontendDir, 'node_modules');
  
  const installDependencies = (dir, name) => {
    return new Promise((resolve, reject) => {
      console.log(colorize(`📦 Installing ${name} dependencies...`, 'yellow'));
      
      const npm = isWindows ? 'npm.cmd' : 'npm';
      const child = spawn(npm, ['install'], {
        cwd: dir,
        stdio: 'pipe'
      });
      
      child.stdout.on('data', (data) => {
        process.stdout.write(data);
      });
      
      child.stderr.on('data', (data) => {
        process.stderr.write(data);
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          console.log(colorize(`✅ ${name} dependencies installed successfully`, 'green'));
          resolve();
        } else {
          console.error(colorize(`❌ Failed to install ${name} dependencies`, 'red'));
          reject(new Error(`Installation failed with code ${code}`));
        }
      });
    });
  };
  
  if (!fs.existsSync(backendNodeModules)) {
    await installDependencies(backendDir, 'backend');
  }
  
  if (!fs.existsSync(frontendNodeModules)) {
    await installDependencies(frontendDir, 'frontend');
  }
};

// Start development servers with platform-specific handling
const startDevServers = (backendDir, frontendDir) => {
  console.log(colorize('🚀 Starting Cursor Clone Development Servers', 'cyan'));
  console.log(colorize('━'.repeat(60), 'cyan'));
  
  const npm = isWindows ? 'npm.cmd' : 'npm';
  
  // Backend server
  const backend = spawn(npm, ['run', 'dev'], {
    cwd: backendDir,
    stdio: 'pipe',
    shell: isWindows
  });
  
  // Frontend server
  const frontend = spawn(npm, ['run', 'dev'], {
    cwd: frontendDir,
    stdio: 'pipe',
    shell: isWindows
  });
  
  let backendReady = false;
  let frontendReady = false;
  
  // Handle backend output
  backend.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      console.log(colorize('[BACKEND]', 'green'), output);
      
      // Check if backend is ready
      if (output.includes('Server running on port') || output.includes('listening')) {
        backendReady = true;
        checkAndShowReadyMessage();
      }
    }
  });
  
  backend.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      console.log(colorize('[BACKEND ERROR]', 'red'), output);
    }
  });
  
  // Handle frontend output
  frontend.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      console.log(colorize('[FRONTEND]', 'blue'), output);
      
      // Check if frontend is ready
      if (output.includes('Local:') || output.includes('ready in')) {
        frontendReady = true;
        checkAndShowReadyMessage();
      }
    }
  });
  
  frontend.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      console.log(colorize('[FRONTEND ERROR]', 'red'), output);
    }
  });
  
  // Check and show ready message when both servers are ready
  const checkAndShowReadyMessage = () => {
    if (backendReady && frontendReady) {
      console.log(colorize('━'.repeat(60), 'cyan'));
      console.log(colorize('✅ Development servers are ready!', 'green'));
      console.log(colorize('🌐 Frontend:', 'cyan'), colorize('http://localhost:5173', 'bright'));
      console.log(colorize('🔧 Backend API:', 'cyan'), colorize('http://localhost:5000', 'bright'));
      console.log(colorize('📖 Health Check:', 'cyan'), colorize('http://localhost:5000/health', 'bright'));
      console.log(colorize('━'.repeat(60), 'cyan'));
      console.log(colorize('💡 Press Ctrl+C to stop all servers', 'yellow'));
      console.log('');
    }
  };
  
  // Handle process termination
  const cleanup = () => {
    console.log(colorize('\n🛑 Shutting down servers...', 'yellow'));
    
    if (isWindows) {
      exec('taskkill /F /IM node.exe', (error) => {
        if (error && !error.message.includes('not found')) {
          console.error(colorize('Error killing processes:', 'red'), error.message);
        }
      });
    } else {
      backend.kill('SIGTERM');
      frontend.kill('SIGTERM');
    }
    
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  };
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  
  // Handle server errors
  backend.on('error', (error) => {
    console.error(colorize('❌ Backend server error:', 'red'), error.message);
    cleanup();
  });
  
  frontend.on('error', (error) => {
    console.error(colorize('❌ Frontend server error:', 'red'), error.message);
    cleanup();
  });
  
  // Handle server exit
  backend.on('close', (code) => {
    if (code !== 0) {
      console.error(colorize('❌ Backend server exited with code:', 'red'), code);
      cleanup();
    }
  });
  
  frontend.on('close', (code) => {
    if (code !== 0) {
      console.error(colorize('❌ Frontend server exited with code:', 'red'), code);
      cleanup();
    }
  });
};

// Main execution
const main = async () => {
  try {
    console.log(colorize('🔍 Checking project structure...', 'yellow'));
    const { backendDir, frontendDir } = checkDirectories();
    
    console.log(colorize('🔍 Checking dependencies...', 'yellow'));
    await checkDependencies(backendDir, frontendDir);
    
    console.log(colorize('🎯 Starting servers...', 'yellow'));
    startDevServers(backendDir, frontendDir);
  } catch (error) {
    console.error(colorize('❌ Error starting development servers:', 'red'), error.message);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(colorize('❌ Uncaught Exception:', 'red'), error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(colorize('❌ Unhandled Rejection at:', 'red'), promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
main();
