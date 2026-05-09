# Cursor Clone Frontend

AI-powered code editor frontend built with React, Vite, and Monaco Editor. A modern, responsive interface for intelligent coding assistance.

## 🚀 Features

- **Modern UI/UX**: Professional dark theme inspired by Cursor AI
- **Monaco Editor**: Full-featured code editor with syntax highlighting
- **AI Chat Panel**: Real-time AI assistance with streaming responses
- **File Explorer**: VS Code-like file management system
- **Terminal Panel**: Integrated terminal with command execution
- **Workspace Management**: Organize projects efficiently
- **Real-time Collaboration**: Live updates with Socket.IO
- **Responsive Design**: Works on desktop and tablet devices
- **State Management**: Efficient state management with Zustand
- **Authentication**: Secure user authentication system

## 🛠 Tech Stack

- **Framework**: React 18 with Vite
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS with custom dark theme
- **Editor**: Monaco Editor with custom themes
- **State Management**: Zustand
- **Routing**: React Router DOM
- **HTTP Client**: Axios with interceptors
- **Real-time**: Socket.IO Client
- **Animations**: Framer Motion
- **Markdown**: React Markdown with syntax highlighting
- **Icons**: React Icons
- **Notifications**: React Hot Toast
- **UI Components**: Custom component library

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html           # HTML template
├── src/
│   ├── api/                 # API service layer
│   │   └── index.js         # Axios configuration
│   ├── assets/              # Static assets
│   ├── components/          # Reusable components
│   │   ├── MonacoEditor.jsx # Monaco editor wrapper
│   │   ├── FileExplorer.jsx # File tree component
│   │   ├── Tabs.jsx         # File tabs
│   │   ├── AIChatPanel.jsx  # AI chat interface
│   │   ├── TerminalPanel.jsx # Terminal interface
│   │   ├── Header.jsx       # Application header
│   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   ├── ProtectedRoute.jsx # Auth guard
│   │   └── LoadingSpinner.jsx # Loading component
│   ├── context/             # React contexts
│   ├── hooks/               # Custom React hooks
│   ├── layouts/             # Layout components
│   │   ├── MainLayout.jsx   # Main application layout
│   │   └── AuthLayout.jsx   # Authentication layout
│   ├── pages/               # Page components
│   │   ├── LoginPage.jsx    # Login page
│   │   ├── RegisterPage.jsx # Registration page
│   │   ├── DashboardPage.jsx # Dashboard
│   │   ├── WorkspacePage.jsx # Main workspace
│   │   └── SettingsPage.jsx # Settings page
│   ├── routes/              # Route configuration
│   ├── services/            # External services
│   │   └── api.js          # API service
│   ├── store/               # State management
│   │   ├── authStore.js     # Authentication state
│   │   ├── workspaceStore.js # Workspace state
│   │   ├── fileStore.js     # File management state
│   │   ├── chatStore.js     # Chat state
│   │   └── terminalStore.js # Terminal state
│   ├── styles/              # Global styles
│   │   └── globals.css      # Tailwind + custom styles
│   ├── utils/               # Utility functions
│   │   ├── constants.js      # App constants
│   │   └── helpers.js       # Helper functions
│   ├── App.jsx              # Main application component
│   └── main.jsx             # Application entry point
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
└── postcss.config.js        # PostCSS configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Backend server running on port 5000

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd cursor-clone/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   touch .env
   ```

4. **Configure environment variables**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The application will start on `http://localhost:5173`

### Build for Production

```bash
# Build application
npm run build

# Preview production build
npm run preview
```

## 📚 Component Documentation

### MonacoEditor Component

Feature-rich code editor with Monaco Editor integration.

**Props:**
- `value`: Editor content
- `onChange`: Content change handler
- `language`: Programming language
- `theme`: Editor theme
- `options`: Editor configuration
- `height`: Editor height
- `readOnly`: Read-only mode
- `onSave`: Save handler

**Features:**
- Syntax highlighting for 25+ languages
- Custom themes (dark/light)
- Auto-completion
- Code folding
- Minimap
- Keyboard shortcuts
- Auto-save functionality

**Usage:**
```jsx
<MonacoEditor
  value={code}
  onChange={setCode}
  language="javascript"
  theme="vs-dark"
  onSave={handleSave}
  height="100%"
/>
```

### FileExplorer Component

VS Code-like file management system.

**Props:**
- `workspaceId`: Current workspace ID
- `onFileSelect`: File selection handler
- `activeFile`: Currently active file

**Features:**
- File tree navigation
- Create/rename/delete files
- Folder expansion
- Search functionality
- Context menus
- File icons

**Usage:**
```jsx
<FileExplorer
  workspaceId={workspaceId}
  onFileSelect={handleFileSelect}
  activeFile={activeFile}
/>
```

### AIChatPanel Component

AI-powered chat interface with streaming responses.

**Props:**
- `workspaceId`: Current workspace ID
- `onClose`: Close handler

**Features:**
- Real-time streaming responses
- Markdown rendering
- Code syntax highlighting
- Prompt templates
- Chat history
- Quick actions

**Usage:**
```jsx
<AIChatPanel
  workspaceId={workspaceId}
  onClose={() => setShowAIChat(false)}
/>
```

### TerminalPanel Component

Integrated terminal with command execution.

**Props:**
- `workspaceId`: Current workspace ID
- `onClose`: Close handler

**Features:**
- Command execution
- Command history
- Output streaming
- Command help
- Session management

**Usage:**
```jsx
<TerminalPanel
  workspaceId={workspaceId}
  onClose={() => setShowTerminal(false)}
/>
```

## 🗂 State Management

### Auth Store

User authentication and profile management.

**State:**
```javascript
{
  user: Object,
  token: String,
  isAuthenticated: Boolean,
  isLoading: Boolean
}
```

**Actions:**
- `login(email, password)`
- `register(name, email, password)`
- `logout()`
- `updateProfile(data)`
- `checkAuth()`

### Workspace Store

Workspace and project management.

**State:**
```javascript
{
  workspaces: Array,
  currentWorkspace: Object,
  isLoading: Boolean,
  error: String
}
```

**Actions:**
- `fetchWorkspaces()`
- `fetchWorkspace(id)`
- `createWorkspace(data)`
- `updateWorkspace(id, data)`
- `deleteWorkspace(id)`

### File Store

File and folder management.

**State:**
```javascript
{
  files: Array,
  openFiles: Array,
  activeFile: Object,
  fileTree: Array,
  isLoading: Boolean
}
```

**Actions:**
- `fetchFiles(workspaceId)`
- `createFile(data)`
- `updateFile(id, data)`
- `deleteFile(id)`
- `openFile(file)`
- `closeFile(fileId)`

### Chat Store

AI chat and conversation management.

**State:**
```javascript
{
  chats: Array,
  currentChat: Object,
  messages: Array,
  isLoading: Boolean,
  isStreaming: Boolean
}
```

**Actions:**
- `sendMessage(workspaceId, message)`
- `generateCode(prompt, language)`
- `explainCode(code, language)`
- `refactorCode(code, language)`
- `fixBugs(code, language)`

## 🎨 Styling System

### Tailwind CSS Configuration

Custom color palette and utilities for the dark theme.

**Colors:**
```javascript
colors: {
  'editor': {
    'bg': '#1e1e1e',
    'sidebar': '#252526',
    'toolbar': '#2d2d30',
    'border': '#3e3e42',
    'text': '#cccccc',
    'text-dim': '#969696',
    'accent': '#007acc',
    'success': '#4ec9b0',
    'warning': '#ce9178',
    'error': '#f48771'
  }
}
```

### Custom Components

Reusable component classes:

```css
.btn-primary      /* Primary button style */
.btn-secondary    /* Secondary button style */
.input-field      /* Input field style */
.panel           /* Card/panel style */
.sidebar-item    /* Sidebar navigation */
.file-tree-item  /* File tree items */
.tab             /* File tabs */
.ai-message      /* Chat messages */
.terminal-output /* Terminal output */
```

## 🔄 Routing

### Protected Routes

Authentication-protected routes using custom guard component.

**Routes:**
- `/dashboard` - Main dashboard
- `/workspace/:id` - Workspace editor
- `/settings` - User settings

**Public Routes:**
- `/login` - Login page
- `/register` - Registration page

### Route Structure

```jsx
<Routes>
  <Route path="/" element={<AuthLayout />}>
    <Route index element={<LoginPage />} />
    <Route path="login" element={<LoginPage />} />
    <Route path="register" element={<RegisterPage />} />
  </Route>
  
  <Route path="/*" element={<ProtectedRoute />}>
    <Route path="dashboard" element={<DashboardPage />} />
    <Route path="workspace/:id" element={<WorkspacePage />} />
    <Route path="settings" element={<SettingsPage />} />
  </Route>
</Routes>
```

## 🔌 API Integration

### Axios Configuration

Centralized API client with interceptors for authentication and error handling.

**Features:**
- Automatic token injection
- Response/error interceptors
- Request/response logging
- Timeout handling

**Usage:**
```javascript
import api from './services/api';

// GET request
const response = await api.get('/workspaces');

// POST request
const result = await api.post('/auth/login', credentials);
```

### API Services

Organized API service methods:

```javascript
// Authentication
authAPI.login(credentials)
authAPI.register(userData)
authAPI.logout()

// Workspaces
workspaceAPI.getWorkspaces()
workspaceAPI.createWorkspace(data)

// Files
fileAPI.getWorkspaceFiles(workspaceId)
fileAPI.createFile(data)

// AI
aiAPI.chat(data)
aiAPI.generateCode(data)
```

## 🎭 Animations

### Framer Motion Integration

Smooth animations and transitions throughout the application.

**Page Transitions:**
```javascript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Page content */}
</motion.div>
```

**Component Animations:**
- Page transitions
- Modal animations
- Hover effects
- Loading states
- Panel sliding

## 🎯 Performance Optimization

### Code Splitting

Lazy loading for better performance:

```javascript
const WorkspacePage = lazy(() => import('./pages/WorkspacePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
```

### State Optimization

- Efficient re-renders with Zustand
- Debounced API calls
- Memoized components
- Virtual scrolling for large lists

### Bundle Optimization

- Tree shaking
- Code splitting
- Asset optimization
- Minification

## 🛠 Development Tools

### Vite Configuration

Optimized build configuration with development and production modes.

**Features:**
- Fast HMR (Hot Module Replacement)
- Source maps
- Bundle analysis
- Environment variables

### ESLint Configuration

Code quality and consistency:

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ]
}
```

## 📱 Responsive Design

### Breakpoints

```css
sm: 640px   /* Small screens */
md: 768px   /* Medium screens */
lg: 1024px  /* Large screens */
xl: 1280px  /* Extra large screens */
2xl: 1536px /* 2X large screens */
```

### Responsive Components

- Adaptive layouts
- Mobile-friendly navigation
- Touch-friendly interactions
- Responsive typography

## 🔧 Configuration Files

### Vite Config

```javascript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
```

### Tailwind Config

```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'editor': { /* custom colors */ }
      }
    }
  }
}
```

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
2. **Configure environment variables**
3. **Deploy automatically**

### Netlify Deployment

1. **Build application**
2. **Deploy to Netlify**
3. **Configure redirects**

### Environment Variables

```bash
VITE_API_URL=https://your-api.com/api
```

## 🧪 Testing

### Component Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### E2E Testing

```bash
# Run E2E tests
npm run test:e2e
```

## 📝 Best Practices

### Code Organization

- Feature-based folder structure
- Reusable components
- Custom hooks for logic
- Consistent naming conventions

### Performance

- Lazy loading
- Code splitting
- Memoization
- Efficient state management

### Accessibility

- Semantic HTML
- Keyboard navigation
- Screen reader support
- ARIA labels

## 🔮 Future Enhancements

- **PWA Support**: Progressive Web App features
- **Offline Mode**: Service worker implementation
- **Plugin System**: Extensible architecture
- **Theme System**: Multiple theme options
- **Voice Commands**: Voice-controlled interface
- **Mobile App**: React Native version
- **Desktop App**: Electron version
- **Advanced AI**: More AI capabilities

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Follow coding standards
4. Add tests
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: GitHub Issues
- **Documentation**: Component docs
- **Examples**: Code examples

## 🔄 Version History

- **v1.0.0** - Initial release
- **v1.1.0** - Enhanced UI/UX
- **v1.2.0** - Performance improvements
- **v1.3.0** - New features and fixes
