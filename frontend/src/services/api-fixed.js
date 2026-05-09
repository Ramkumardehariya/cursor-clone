import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      size: 1024,
      lastModified: new Date().toISOString(),
      workspaceId: 'default'
    },
    {
      _id: '2',
      name: 'index.html',
      path: '/index.html',
      language: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cursor Clone</title>
</head>
<body>
    <div id="root"></div>
    <script src="/src/main.jsx" type="module"></script>
</body>
</html>`,
      isFolder: false,
      size: 2048,
      lastModified: new Date().toISOString(),
      workspaceId: 'default'
    },
    {
      _id: '3',
      name: 'package.json',
      path: '/package.json',
      language: 'json',
      content: `{
  "name": "cursor-clone",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
      isFolder: false,
      size: 512,
      lastModified: new Date().toISOString(),
      workspaceId: 'default'
    },
    {
      _id: '4',
      name: 'README.md',
      path: '/README.md',
      language: 'markdown',
      content: `# Cursor Clone

An AI-powered code editor built with React and Vite.

## Features

- Monaco Editor integration
- AI chat functionality
- Terminal support
- File explorer
- Resizable panels

## Getting Started

1. Clone the repository
2. Install dependencies: npm install
3. Start development server: npm run dev

## Tech Stack

- React 18
- Vite
- Monaco Editor
- Tailwind CSS
- Zustand for state management`,
      isFolder: false,
      size: 2048,
      lastModified: new Date().toISOString(),
      workspaceId: 'default'
    },
    {
      _id: '5',
      name: 'src',
      path: '/src',
      language: 'folder',
      isFolder: true,
      children: ['App.jsx', 'main.jsx'],
      workspaceId: 'default'
    }
  ],
  workspace: {
    _id: 'default',
    name: 'Default Workspace',
    description: 'A default workspace for development',
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
    settings: {
      theme: 'dark',
      fontSize: 14,
      tabSize: 4
    }
  }
};

export const workspaceAPI = {
  getWorkspace: async (id) => {
    try {
      return await api.get(`/workspaces/${id}`);
    } catch (error) {
      return { data: { data: mockData.workspace } };
    }
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
    try {
      return await api.get(`/files/workspace/${workspaceId}`);
    } catch (error) {
      // Return mock data when backend is not available
      return { data: { data: mockData.files } };
    }
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
        createdAt: new Date().toISOString()
      };
      return { data: { data: newFile } };
    }
  },
  updateFile: async (id, data) => {
    try {
      return await api.put(`/files/${id}`, data);
    } catch (error) {
      const file = mockData.files.find(f => f._id === id);
      if (file) {
        return { data: { data: { ...file, ...data } } };
      }
      return { data: { data: { _id: id, ...data } } };
    }
  },
  deleteFile: async (id) => {
    try {
      return await api.delete(`/files/${id}`);
    } catch (error) {
      return { data: { success: true } };
    }
  },
  createFolder: async (data) => {
    try {
      return await api.post('/files/folder', data);
    } catch (error) {
      const newFolder = {
        _id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString()
      };
      return { data: { data: newFolder } };
    }
  },
  renameFile: async (id, newName) => {
    try {
      return await api.put(`/files/${id}/rename`, { newName });
    } catch (error) {
      const file = mockData.files.find(f => f._id === id);
      if (file) {
        return { data: { data: { ...file, name: newName } } };
      }
      return { data: { data: { _id: id, name: newName } } };
    }
  }
};

export const aiAPI = {
  sendMessage: async (workspaceId, message) => {
    try {
      return await api.post('/ai/chat', { workspaceId, message });
    } catch (error) {
      // Mock AI response
      const mockResponse = {
        _id: Date.now().toString(),
        role: 'assistant',
        content: `I understand you're asking about: "${message}". This is a mock response since the backend is not running. When the backend is available, I'll be able to provide actual AI assistance.`,
        timestamp: new Date().toISOString(),
        workspaceId
      };
      return { data: { data: mockResponse } };
    }
  },
  getChatHistory: async (workspaceId) => {
    try {
      return await api.get(`/ai/chat/${workspaceId}`);
    } catch (error) {
      return { data: { data: [] } };
    }
  }
};

export const terminalAPI = {
  executeCommand: async (workspaceId, command) => {
    try {
      return await api.post('/terminal/execute', { workspaceId, command });
    } catch (error) {
      // Mock terminal response
      const mockResponse = {
        _id: Date.now().toString(),
        command,
        output: `$ ${command}\nCommand executed successfully (mock response)`,
        timestamp: new Date().toISOString(),
        workspaceId
      };
      return { data: { data: mockResponse } };
    }
  },
  getCommandHistory: async (workspaceId) => {
    try {
      return await api.get(`/terminal/history/${workspaceId}`);
    } catch (error) {
      return { data: { data: [] } };
    }
  }
};

export const authAPI = {
  login: async (credentials) => {
    try {
      return await api.post('/auth/login', credentials);
    } catch (error) {
      // Mock login response
      const mockUser = {
        _id: '1',
        name: credentials.email.split('@')[0],
        email: credentials.email,
        token: 'mock-jwt-token-' + Date.now()
      };
      return { data: { data: mockUser, token: mockUser.token } };
    }
  },
  register: async (userData) => {
    try {
      return await api.post('/auth/register', userData);
    } catch (error) {
      const mockUser = {
        _id: Date.now().toString(),
        ...userData,
        createdAt: new Date().toISOString()
      };
      return { data: { data: mockUser } };
    }
  },
  logout: async () => {
    try {
      return await api.post('/auth/logout');
    } catch (error) {
      return { data: { success: true } };
    }
  },
  refreshToken: async () => {
    try {
      return await api.post('/auth/refresh');
    } catch (error) {
      return { data: { success: true } };
    }
  }
};

export default api;
