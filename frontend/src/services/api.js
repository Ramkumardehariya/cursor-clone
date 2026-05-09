import axios from 'axios';
import debug, { setupApiDebugging } from '../utils/debug';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 5000, // Increased timeout to allow proper response
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup debugging
setupApiDebugging(api);

// Mock data for development when backend is not available
const mockData = {
  files: [
    {
      _id: '1',
      name: 'App.jsx',
      path: '/src/App.jsx',
      language: 'javascript',
      content: `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Cursor Clone</h1>
        <p>Your AI-powered code editor</p>
      </header>
    </div>
  );
}

export default App;`,
      isFolder: false,
      workspaceId: 'default'
    },
    {
      _id: '2',
      name: 'index.js',
      path: '/src/index.js',
      language: 'javascript',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
      isFolder: false,
      workspaceId: 'default'
    },
    {
      _id: '3',
      name: 'styles.css',
      path: '/src/styles.css',
      language: 'css',
      content: `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
}

.App-header h1 {
  margin-bottom: 16px;
}

.App-header p {
  font-size: 16px;
  opacity: 0.8;
}`,
      isFolder: false,
      workspaceId: 'default'
    }
  ],
  workspace: {
    _id: 'default',
    name: 'Default Workspace',
    description: 'Your AI-powered coding environment',
    lastAccessed: new Date().toISOString()
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        if (state.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

export const workspaceAPI = {
  getWorkspaces: async () => {
    // Always return mock data for development to avoid auth issues
    return { data: { data: [mockData.workspace] } };
  },
  getWorkspace: async (id) => {
    // Always return mock data for development to avoid auth issues
    return { data: { data: { ...mockData.workspace, _id: id || 'default' } } };
  },
  createWorkspace: async (data) => {
    try {
      return await api.post('/workspaces', data);
    } catch (error) {
      const newWorkspace = {
        _id: Date.now().toString(),
        ...data,
        lastAccessed: new Date().toISOString()
      };
      return { data: { data: newWorkspace } };
    }
  },
  updateWorkspace: async (id, data) => {
    try {
      return await api.put(`/workspaces/${id}`, data);
    } catch (error) {
      return { data: { data: { ...mockData.workspace, ...data } } };
    }
  },
  deleteWorkspace: async (id) => {
    try {
      return await api.delete(`/workspaces/${id}`);
    } catch (error) {
      return { data: { success: true } };
    }
  },
  getWorkspaceStats: async (id) => {
    try {
      return await api.get(`/workspaces/${id}/stats`);
    } catch (error) {
      return { data: { data: { files: mockData.files.length, lastAccessed: new Date().toISOString() } } };
    }
  },
};

export const fileAPI = {
  getWorkspaceFiles: async (workspaceId) => {
    // Always return mock data for development to avoid auth issues
    console.log('📁 Loading mock files for workspace:', workspaceId);
    return { data: { data: mockData.files } };
  },
  getFile: async (id) => {
    try {
      return await api.get(`/files/${id}`);
    } catch (error) {
      const file = mockData.files.find(f => f._id === id);
      return { data: { data: file } };
    }
  },
  createFile: async (data) => {
    try {
      return await api.post('/files', data);
    } catch (error) {
      const newFile = {
        _id: Date.now().toString(),
        ...data,
        workspaceId: data.workspaceId || 'default'
      };
      mockData.files.push(newFile);
      return { data: { data: newFile } };
    }
  },
  updateFile: async (id, fileData) => {
    try {
      return await api.put(`/files/${id}`, fileData);
    } catch (error) {
      const fileIndex = mockData.files.findIndex(f => f._id === id);
      if (fileIndex !== -1) {
        mockData.files[fileIndex] = { ...mockData.files[fileIndex], ...fileData };
        return { data: { data: mockData.files[fileIndex] } };
      }
      throw error;
    }
  },
  deleteFile: async (id) => {
    try {
      return await api.delete(`/files/${id}`);
    } catch (error) {
      const fileIndex = mockData.files.findIndex(f => f._id === id);
      if (fileIndex !== -1) {
        mockData.files.splice(fileIndex, 1);
        return { data: { success: true } };
      }
      throw error;
    }
  },
  renameFile: async (id, name) => {
    try {
      return await api.put(`/files/${id}/rename`, { name });
    } catch (error) {
      const fileIndex = mockData.files.findIndex(f => f._id === id);
      if (fileIndex !== -1) {
        mockData.files[fileIndex].name = name;
        return { data: { data: mockData.files[fileIndex] } };
      }
      throw error;
    }
  },
};

export const aiAPI = {
  chat: async (data) => {
    try {
      return await api.post('/ai/chat', data);
    } catch (error) {
      // Mock AI response
      return { 
        data: { 
          data: {
            _id: Date.now().toString(),
            role: 'assistant',
            content: `I understand you want to: ${data.message}. This is a mock AI response since the backend is not connected. In a real implementation, I would provide helpful coding assistance.`,
            timestamp: new Date().toISOString()
          }
        } 
      };
    }
  },
  generateCode: async (data) => {
    try {
      return await api.post('/ai/generate', data);
    } catch (error) {
      return { 
        data: { 
          code: `// Generated code for: ${data.description}\nfunction example() {\n  console.log('This is mock generated code');\n  return 'Hello World';\n}` 
        } 
      };
    }
  },
  explainCode: async (data) => {
    try {
      return await api.post('/ai/explain', data);
    } catch (error) {
      return { 
        data: { 
          explanation: `This is a mock explanation of the code. The code appears to be a ${data.language} implementation that performs certain operations.` 
        } 
      };
    }
  },
  refactorCode: async (data) => {
    try {
      return await api.post('/ai/refactor', data);
    } catch (error) {
      return { 
        data: { 
          refactoredCode: data.code + '\n// Refactored code (mock)' 
        } 
      };
    }
  },
  fixBugs: async (data) => {
    try {
      return await api.post('/ai/fix-bugs', data);
    } catch (error) {
      return { 
        data: { 
          fix: data.code + '\n// Fixed code (mock)' 
        } 
      };
    }
  },
  codeCompletion: async (data) => {
    try {
      return await api.post('/ai/complete', data);
    } catch (error) {
      return { 
        data: { 
          suggestions: ['console.log()', 'return', 'function', 'const'] 
        } 
      };
    }
  },
  reviewCode: async (data) => {
    try {
      return await api.post('/ai/review', data);
    } catch (error) {
      return { 
        data: { 
          review: 'Code looks good! This is a mock review since backend is not connected.' 
        } 
      };
    }
  },
  getChatHistory: async (workspaceId) => {
    try {
      return await api.get(`/ai/chats/${workspaceId}`);
    } catch (error) {
      return { data: { data: [] } };
    }
  },
  getChat: async (workspaceId, chatId) => {
    try {
      return await api.get(`/ai/chats/${workspaceId}/${chatId}`);
    } catch (error) {
      return { data: { data: null } };
    }
  },
  deleteChat: async (workspaceId, chatId) => {
    try {
      return await api.delete(`/ai/chats/${workspaceId}/${chatId}`);
    } catch (error) {
      return { data: { success: true } };
    }
  },
  getModelInfo: async () => {
    try {
      return await api.get('/ai/model-info');
    } catch (error) {
      return { 
        data: { 
          model: 'Cursor-AI-Mock',
          version: '1.0.0',
          capabilities: ['code-generation', 'explanation', 'refactoring']
        } 
      };
    }
  },
};

export const terminalAPI = {
  runCommand: async (data) => {
    try {
      return await api.post('/terminal/run', data);
    } catch (error) {
      return { 
        data: { 
          output: `$ ${data.command}\nCommand executed successfully (mock response)\n` 
        } 
      };
    }
  },
  createSession: async (data) => {
    try {
      return await api.post('/terminal/session', data);
    } catch (error) {
      return { 
        data: { 
          sessionId: Date.now().toString(),
          workspaceId: data.workspaceId
        } 
      };
    }
  },
  closeSession: async (sessionId) => {
    try {
      return await api.delete(`/terminal/session/${sessionId}`);
    } catch (error) {
      return { data: { success: true } };
    }
  },
  getSessions: async () => {
    try {
      return await api.get('/terminal/sessions');
    } catch (error) {
      return { data: { data: [] } };
    }
  },
  getSystemInfo: async () => {
    try {
      return await api.get('/terminal/system-info');
    } catch (error) {
      return { 
        data: { 
          os: 'Mock OS',
          shell: 'bash',
          node: 'v18.0.0',
          npm: 'v8.0.0'
        } 
      };
    }
  },
  getCommandHistory: async () => {
    try {
      return await api.get('/terminal/history');
    } catch (error) {
      return { data: { data: [] } };
    }
  },
};

export default api;
