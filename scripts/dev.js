#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper function to colorize output
const colorize = (text, color) => `${colors[color]}${text}${colors.reset}`;

// Check if required directories exist
const checkDirectories = () => {
  const backendDir = path.join(__dirname, '..', 'backend');
  const frontendDir = path.join(__dirname, '..', 'frontend');
  
  if (!fs.existsSync(backendDir)) {
    console.error(colorize('Backend directory not found!', 'red'));
    process.exit(1);
  }
  
  if (!fs.existsSync(frontendDir)) {
    console.error(colorize('Frontend directory not found!', 'red'));
    process.exit(1);
  }
  
  return { backendDir, frontendDir };
};

// Check if node_modules exist
const checkDependencies = (backendDir, frontendDir) => {
  const backendNodeModules = path.join(backendDir, 'node_modules');
  const frontendNodeModules = path.join(frontendDir, 'node_modules');
  
  if (!fs.existsSync(backendNodeModules)) {
    console.log(colorize('Installing backend dependencies...', 'yellow'));
    spawn('npm', ['install'], { stdio: 'inherit', cwd: backendDir });
  }
  
  if (!fs.existsSync(frontendNodeModules)) {
    console.log(colorize('Installing frontend dependencies...', 'yellow'));
    spawn('npm', ['install'], { stdio: 'inherit', cwd: frontendDir });
  }
};

// Start development servers
const startDevServers = (backendDir, frontendDir) => {
  console.log(colorize('🚀 Starting Cursor Clone Development Servers', 'cyan'));
  console.log(colorize('━'.repeat(50), 'cyan'));
  
  // Backend server
  const backend = spawn('npm', ['run', 'dev'], {
    cwd: backendDir,
    stdio: 'pipe'
  });
  
  // Frontend server
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: frontendDir,
    stdio: 'pipe'
  });
  
  // Handle backend output
  backend.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      console.log(colorize('[BACKEND]', 'green'), output);
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
    }
  });
  
  frontend.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      console.log(colorize('[FRONTEND ERROR]', 'red'), output);
    }
  });
  
  // Handle process termination
  const cleanup = () => {
    console.log(colorize('\n🛑 Shutting down servers...', 'yellow'));
    backend.kill('SIGTERM');
    frontend.kill('SIGTERM');
    process.exit(0);
  };
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  
  // Handle server errors
  backend.on('error', (error) => {
    console.error(colorize('Backend server error:', 'red'), error.message);
    cleanup();
  });
  
  frontend.on('error', (error) => {
    console.error(colorize('Frontend server error:', 'red'), error.message);
    cleanup();
  });
  
  // Wait for servers to start and show URLs
  setTimeout(() => {
    console.log(colorize('━'.repeat(50), 'cyan'));
    console.log(colorize('✅ Development servers are ready!', 'green'));
    console.log(colorize('🌐 Frontend:', 'cyan'), colorize('http://localhost:5173', 'bright'));
    console.log(colorize('🔧 Backend API:', 'cyan'), colorize('http://localhost:5000', 'bright'));
    console.log(colorize('📖 API Docs:', 'cyan'), colorize('http://localhost:5000/health', 'bright'));
    console.log(colorize('━'.repeat(50), 'cyan'));
    console.log(colorize('Press Ctrl+C to stop all servers', 'yellow'));
  }, 3000);
};

// Main execution
const main = () => {
  try {
    const { backendDir, frontendDir } = checkDirectories();
    checkDependencies(backendDir, frontendDir);
    startDevServers(backendDir, frontendDir);
  } catch (error) {
    console.error(colorize('Error starting development servers:', 'red'), error.message);
    process.exit(1);
  }
};

// Run the script
main();
