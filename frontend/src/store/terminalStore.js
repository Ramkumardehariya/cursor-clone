import { create } from 'zustand';
import api from '../services/api';

const useTerminalStore = create((set, get) => ({
  // State
  sessions: [],
  currentSession: null,
  output: [],
  isRunning: false,
  error: null,

  // Actions
  createSession: async (sessionData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/terminal/session', sessionData);
      const { data } = response.data;
      
      set((state) => ({
        sessions: [...state.sessions, data],
        currentSession: data,
        output: [],
        isLoading: false
      }));
      
      return { success: true, data };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to create terminal session',
        isLoading: false
      });
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to create terminal session' 
      };
    }
  },

  runCommand: async (commandData) => {
    set({ isRunning: true, error: null });
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/terminal/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')).state.token : ''}`
        },
        body: JSON.stringify(commandData)
      });

      if (!response.ok) {
        throw new Error('Failed to run command');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let commandOutput = [];

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'complete') {
                // Add final output
                if (data.finalOutput) {
                  commandOutput.push({
                    type: 'stdout',
                    output: data.finalOutput,
                    timestamp: new Date()
                  });
                }
                
                if (data.finalError) {
                  commandOutput.push({
                    type: 'stderr',
                    output: data.finalError,
                    timestamp: new Date()
                  });
                }
                
                set((state) => ({
                  output: [...state.output, ...commandOutput],
                  isRunning: false
                }));
                
                return { success: true };
              } else if (data.output) {
                // Add streaming output
                const outputLine = {
                  type: data.type || 'stdout',
                  output: data.output,
                  timestamp: new Date()
                };
                
                commandOutput.push(outputLine);
                
                set((state) => ({
                  output: [...state.output, outputLine]
                }));
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.error('Parse error:', parseError);
            }
          }
        }
      }
    } catch (error) {
      set({
        error: error.message || 'Failed to run command',
        isRunning: false
      });
      
      return { 
        success: false, 
        error: error.message || 'Failed to run command' 
      };
    }
  },

  closeSession: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/terminal/session/${sessionId}`);
      
      set((state) => ({
        sessions: state.sessions.filter(s => s.sessionId !== sessionId),
        currentSession: state.currentSession?.sessionId === sessionId ? null : state.currentSession,
        output: state.currentSession?.sessionId === sessionId ? [] : state.output,
        isLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to close terminal session',
        isLoading: false
      });
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to close terminal session' 
      };
    }
  },

  getSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/terminal/sessions');
      const { data } = response.data;
      
      set({
        sessions: data,
        isLoading: false
      });
      
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to get terminal sessions',
        isLoading: false
      });
      return [];
    }
  },

  getSystemInfo: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/terminal/system-info');
      const { data } = response.data;
      
      set({ isLoading: false });
      return { success: true, data };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to get system info',
        isLoading: false
      });
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to get system info' 
      };
    }
  },

  getCommandHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/terminal/history');
      const { data } = response.data;
      
      set({ isLoading: false });
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to get command history',
        isLoading: false
      });
      return [];
    }
  },

  setCurrentSession: (session) => {
    set({ 
      currentSession: session,
      output: []
    });
  },

  clearOutput: () => {
    set({ output: [] });
  },

  clearError: () => {
    set({ error: null });
  }
}));

export default useTerminalStore;
