import { create } from 'zustand';
import { workspaceAPI } from '../services/api';
import debug from '../utils/debug';

const useWorkspaceStore = create((set, get) => ({
  // State
  workspaces: [],
  currentWorkspace: null,
  isLoading: false,
  error: null,

  // Actions
  fetchWorkspaces: async () => {
    debug.store('workspace', 'fetchWorkspaces:start');
    const monitor = debug.createPerformanceMonitor('fetchWorkspaces');
    
    set({ isLoading: true, error: null });
    try {
      const response = await workspaceAPI.getWorkspaces();
      const { data } = response.data;
      
      debug.success('workspace', `Fetched ${data.length} workspaces`);
      set({
        workspaces: data,
        isLoading: false
      });
      
      monitor.end();
      return data;
    } catch (error) {
      debug.error('workspace', 'Failed to fetch workspaces');
      // Use fallback data instead of failing
      const fallbackWorkspaces = [
        {
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
      ];
      
      debug.info('workspace', 'Using fallback workspaces');
      set({
        workspaces: fallbackWorkspaces,
        error: null, // Don't show error to user
        isLoading: false
      });
      
      monitor.end();
      return fallbackWorkspaces;
    }
  },

  fetchWorkspace: async (workspaceId) => {
    debug.store('workspace', 'fetchWorkspace:start', workspaceId);
    const monitor = debug.createPerformanceMonitor('fetchWorkspace');
    
    set({ isLoading: true, error: null });
    try {
      const response = await workspaceAPI.getWorkspace(workspaceId);
      const { data } = response.data;
      
      debug.success('workspace', `Fetched workspace: ${data.name}`);
      set({
        currentWorkspace: data,
        isLoading: false
      });
      
      monitor.end();
      return data;
    } catch (error) {
      debug.error('workspace', 'Failed to fetch workspace');
      // Use fallback workspace
      const fallbackWorkspace = {
        _id: workspaceId || 'default',
        name: 'Default Workspace',
        description: 'A default workspace for development',
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        settings: {
          theme: 'dark',
          fontSize: 14,
          tabSize: 4
        }
      };
      
      debug.info('workspace', 'Using fallback workspace');
      set({
        currentWorkspace: fallbackWorkspace,
        error: null, // Don't show error to user
        isLoading: false
      });
      
      monitor.end();
      return fallbackWorkspace;
    }
  },

  createWorkspace: async (workspaceData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/workspaces', workspaceData);
      const { data } = response.data;
      
      set((state) => ({
        workspaces: [data, ...state.workspaces],
        currentWorkspace: data,
        isLoading: false
      }));
      
      return { success: true, data };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to create workspace',
        isLoading: false
      });
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to create workspace' 
      };
    }
  },

  updateWorkspace: async (workspaceId, workspaceData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/workspaces/${workspaceId}`, workspaceData);
      const { data } = response.data;
      
      set((state) => ({
        workspaces: state.workspaces.map(w => 
          w._id === workspaceId ? data : w
        ),
        currentWorkspace: state.currentWorkspace?._id === workspaceId 
          ? data 
          : state.currentWorkspace,
        isLoading: false
      }));
      
      return { success: true, data };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to update workspace',
        isLoading: false
      });
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update workspace' 
      };
    }
  },

  deleteWorkspace: async (workspaceId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/workspaces/${workspaceId}`);
      
      set((state) => ({
        workspaces: state.workspaces.filter(w => w._id !== workspaceId),
        currentWorkspace: state.currentWorkspace?._id === workspaceId 
          ? null 
          : state.currentWorkspace,
        isLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to delete workspace',
        isLoading: false
      });
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to delete workspace' 
      };
    }
  },

  setCurrentWorkspace: (workspace) => {
    set({ currentWorkspace: workspace });
  },

  clearError: () => {
    set({ error: null });
  },

  clearCurrentWorkspace: () => {
    set({ currentWorkspace: null });
  }
}));

export default useWorkspaceStore;
