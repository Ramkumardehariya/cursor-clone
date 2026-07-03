import axios from 'axios';
import debug, { setupApiDebugging } from '../utils/debug';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 5000, // Increased timeout to allow proper response
  // Allow sending cookies (httpOnly token) from the browser
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup debugging
setupApiDebugging(api);

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
      window.location.href = '/auth/login';
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
    return await api.get('/workspaces');
  },
  getWorkspace: async (id) => {
    return await api.get(`/workspaces/${id}`);
  },
  createWorkspace: async (data) => {
    return await api.post('/workspaces', data);
  },
  updateWorkspace: async (id, data) => {
    return await api.put(`/workspaces/${id}`, data);
  },
  deleteWorkspace: async (id) => {
    return await api.delete(`/workspaces/${id}`);
  },
  getWorkspaceStats: async (id) => {
    return await api.get(`/workspaces/${id}/stats`);
  },
};

export const fileAPI = {
  getWorkspaceFiles: async (workspaceId) => {
    return await api.get(`/files/workspace/${workspaceId}`);
  },
  getFile: async (id) => {
    return await api.get(`/files/${id}`);
  },
  createFile: async (data) => {
    return await api.post('/files', data);
  },
  updateFile: async (id, fileData) => {
    return await api.put(`/files/${id}`, fileData);
  },
  deleteFile: async (id) => {
    return await api.delete(`/files/${id}`);
  },
  renameFile: async (id, name) => {
    return await api.put(`/files/${id}/rename`, { name });
  },
  moveFile: async (id, newParentId) => {
    return await api.put(`/files/${id}/move`, { newParentId });
  },
};

export const aiAPI = {
  chat: async (data) => {
    return await api.post('/ai/chat', data);
  },
  generateCode: async (data) => {
    return await api.post('/ai/generate', data);
  },
  explainCode: async (data) => {
    return await api.post('/ai/explain', data);
  },
  refactorCode: async (data) => {
    return await api.post('/ai/refactor', data);
  },
  fixBugs: async (data) => {
    return await api.post('/ai/fix-bugs', data);
  },
  codeCompletion: async (data) => {
    return await api.post('/ai/complete', data);
  },
  reviewCode: async (data) => {
    return await api.post('/ai/review', data);
  },
  getChatHistory: async (workspaceId) => {
    return await api.get(`/ai/chats/${workspaceId}`);
  },
  getChat: async (workspaceId, chatId) => {
    return await api.get(`/ai/chats/${workspaceId}/${chatId}`);
  },
  deleteChat: async (workspaceId, chatId) => {
    return await api.delete(`/ai/chats/${workspaceId}/${chatId}`);
  },
  getModelInfo: async () => {
    return await api.get('/ai/model-info');
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
