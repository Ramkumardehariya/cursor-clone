export const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', extensions: ['.js', '.jsx'] },
  { value: 'typescript', label: 'TypeScript', extensions: ['.ts', '.tsx'] },
  { value: 'html', label: 'HTML', extensions: ['.html', '.htm'] },
  { value: 'css', label: 'CSS', extensions: ['.css', '.scss', '.sass', '.less'] },
  { value: 'json', label: 'JSON', extensions: ['.json'] },
  { value: 'python', label: 'Python', extensions: ['.py'] },
  { value: 'cpp', label: 'C++', extensions: ['.cpp', '.cc', '.cxx'] },
  { value: 'c', label: 'C', extensions: ['.c'] },
  { value: 'java', label: 'Java', extensions: ['.java'] },
  { value: 'php', label: 'PHP', extensions: ['.php'] },
  { value: 'ruby', label: 'Ruby', extensions: ['.rb'] },
  { value: 'go', label: 'Go', extensions: ['.go'] },
  { value: 'rust', label: 'Rust', extensions: ['.rs'] },
  { value: 'swift', label: 'Swift', extensions: ['.swift'] },
  { value: 'kotlin', label: 'Kotlin', extensions: ['.kt'] },
  { value: 'scala', label: 'Scala', extensions: ['.scala'] },
  { value: 'r', label: 'R', extensions: ['.r'] },
  { value: 'sql', label: 'SQL', extensions: ['.sql'] },
  { value: 'markdown', label: 'Markdown', extensions: ['.md', '.markdown'] },
  { value: 'yaml', label: 'YAML', extensions: ['.yaml', '.yml'] },
  { value: 'xml', label: 'XML', extensions: ['.xml'] },
  { value: 'plaintext', label: 'Plain Text', extensions: ['.txt'] },
  { value: 'shell', label: 'Shell', extensions: ['.sh', '.bash', '.zsh', '.fish'] },
  { value: 'powershell', label: 'PowerShell', extensions: ['.ps1'] },
  { value: 'dockerfile', label: 'Dockerfile', extensions: ['Dockerfile', '.dockerfile'] },
  { value: 'graphql', label: 'GraphQL', extensions: ['.graphql', '.gql'] },
  { value: 'lua', label: 'Lua', extensions: ['.lua'] },
  { value: 'perl', label: 'Perl', extensions: ['.pl'] },
];

export const MONACO_THEMES = [
  { value: 'vs-dark', label: 'Dark (Default)' },
  { value: 'vs-light', label: 'Light' },
  { value: 'hc-black', label: 'High Contrast' },
];

export const FONT_SIZES = [
  { value: 10, label: '10px' },
  { value: 12, label: '12px' },
  { value: 14, label: '14px' },
  { value: 16, label: '16px' },
  { value: 18, label: '18px' },
  { value: 20, label: '20px' },
  { value: 22, label: '22px' },
  { value: 24, label: '24px' },
  { value: 28, label: '28px' },
  { value: 32, label: '32px' },
];

export const TAB_SIZES = [
  { value: 2, label: '2 spaces' },
  { value: 4, label: '4 spaces' },
  { value: 6, label: '6 spaces' },
  { value: 8, label: '8 spaces' },
];

export const WORD_WRAP_OPTIONS = [
  { value: 'on', label: 'On' },
  { value: 'off', label: 'Off' },
  { value: 'wordWrapColumn', label: 'At Column' },
  { value: 'bounded', label: 'Bounded' },
];

export const AI_PROMPT_TEMPLATES = [
  {
    name: 'Create React Component',
    template: 'Create a React component for {description}. Make it functional with hooks and include PropTypes.',
    category: 'React'
  },
  {
    name: 'Create API Endpoint',
    template: 'Create a REST API endpoint for {description}. Include error handling and validation.',
    category: 'Backend'
  },
  {
    name: 'Fix Bug',
    template: 'Fix the bug in this code: {code}. The issue is: {issue}',
    category: 'Debugging'
  },
  {
    name: 'Explain Code',
    template: 'Explain what this code does: {code}',
    category: 'Learning'
  },
  {
    name: 'Refactor Code',
    template: 'Refactor this code to improve readability and performance: {code}',
    category: 'Refactoring'
  },
  {
    name: 'Add Tests',
    template: 'Write unit tests for this function: {code}',
    category: 'Testing'
  },
  {
    name: 'Optimize Performance',
    template: 'Optimize this code for better performance: {code}',
    category: 'Performance'
  },
  {
    name: 'Add Documentation',
    template: 'Add comprehensive documentation for this code: {code}',
    category: 'Documentation'
  },
];

export const TERMINAL_COMMANDS = [
  { command: 'ls', description: 'List directory contents' },
  { command: 'cd', description: 'Change directory' },
  { command: 'pwd', description: 'Print working directory' },
  { command: 'mkdir', description: 'Create directory' },
  { command: 'rm', description: 'Remove files or directories' },
  { command: 'cp', description: 'Copy files or directories' },
  { command: 'mv', description: 'Move or rename files' },
  { command: 'cat', description: 'Display file contents' },
  { command: 'grep', description: 'Search text patterns' },
  { command: 'find', description: 'Find files' },
  { command: 'npm install', description: 'Install npm packages' },
  { command: 'npm run', description: 'Run npm scripts' },
  { command: 'git status', description: 'Show git status' },
  { command: 'git add', description: 'Add files to git' },
  { command: 'git commit', description: 'Commit changes' },
  { command: 'git push', description: 'Push to remote' },
  { command: 'git pull', description: 'Pull from remote' },
];

export const KEYBOARD_SHORTCUTS = {
  // File operations
  NEW_FILE: 'Ctrl+N',
  OPEN_FILE: 'Ctrl+O',
  SAVE_FILE: 'Ctrl+S',
  SAVE_AS: 'Ctrl+Shift+S',
  CLOSE_FILE: 'Ctrl+W',
  
  // Editor operations
  UNDO: 'Ctrl+Z',
  REDO: 'Ctrl+Y',
  CUT: 'Ctrl+X',
  COPY: 'Ctrl+C',
  PASTE: 'Ctrl+V',
  SELECT_ALL: 'Ctrl+A',
  FIND: 'Ctrl+F',
  REPLACE: 'Ctrl+H',
  
  // View operations
  TOGGLE_SIDEBAR: 'Ctrl+B',
  TOGGLE_TERMINAL: 'Ctrl+`',
  TOGGLE_AI_CHAT: 'Ctrl+Shift+/',
  ZOOM_IN: 'Ctrl+=',
  ZOOM_OUT: 'Ctrl+-',
  RESET_ZOOM: 'Ctrl+0',
  
  // Window operations
  NEW_WINDOW: 'Ctrl+Shift+N',
  CLOSE_WINDOW: 'Ctrl+Shift+W',
  
  // AI operations
  AI_CHAT: 'Ctrl+Shift+C',
  AI_GENERATE: 'Ctrl+Shift+G',
  AI_EXPLAIN: 'Ctrl+Shift+E',
  AI_FIX_BUGS: 'Ctrl+Shift+F',
};

export const FILE_ICONS = {
  javascript: '🟨',
  typescript: '🔷',
  html: '🌐',
  css: '🎨',
  json: '📄',
  python: '🐍',
  cpp: '⚙️',
  c: '⚙️',
  java: '☕',
  php: '🐘',
  ruby: '💎',
  go: '🐹',
  rust: '🦀',
  swift: '🍎',
  kotlin: '🎯',
  scala: '📜',
  r: '📊',
  sql: '🗃️',
  markdown: '📝',
  yaml: '📋',
  xml: '🏷️',
  plaintext: '📄',
  shell: '🐚',
  powershell: '💻',
  dockerfile: '🐳',
  graphql: '🔺',
  lua: '🌙',
  perl: '🐪',
  folder: '📁',
  folder_open: '📂',
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_ERROR: 'Authentication failed. Please log in again.',
  FILE_NOT_FOUND: 'File not found.',
  WORKSPACE_NOT_FOUND: 'Workspace not found.',
  PERMISSION_DENIED: 'Permission denied.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Invalid input. Please check your data.',
  AI_SERVICE_ERROR: 'AI service is currently unavailable.',
  TERMINAL_ERROR: 'Terminal command failed.',
};

export const SUCCESS_MESSAGES = {
  FILE_SAVED: 'File saved successfully.',
  WORKSPACE_CREATED: 'Workspace created successfully.',
  WORKSPACE_DELETED: 'Workspace deleted successfully.',
  FILE_CREATED: 'File created successfully.',
  FILE_DELETED: 'File deleted successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  COMMAND_EXECUTED: 'Command executed successfully.',
};
