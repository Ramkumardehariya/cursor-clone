import { create } from 'zustand';
import { workspaceAPI } from '../services/api';
import debug, { createPerformanceMonitor } from '../utils/debug';

const useWorkspaceStore = create((set, get) => ({
  // State
  workspaces: [],
  currentWorkspace: null,
  isLoading: false,
  error: null,

  // Actions
  fetchWorkspaces: async () => {
    debug.store('workspace', 'fetchWorkspaces:start');
    const monitor = createPerformanceMonitor('fetchWorkspaces');
    
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
      debug.error('workspace', 'Failed to fetch workspaces', error);
      set({
        error: error.response?.data?.error || 'Failed to fetch workspaces',
        isLoading: false
      });
      
      monitor.end();
      throw error;
    }
  },

  fetchWorkspace: async (workspaceId) => {
    debug.store('workspace', 'fetchWorkspace:start', workspaceId);
    const monitor = createPerformanceMonitor('fetchWorkspace');
    
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
      debug.error('workspace', 'Failed to fetch workspace', error);
      set({
        error: error.response?.data?.error || 'Failed to fetch workspace',
        isLoading: false
      });
      
      monitor.end();
      throw error;
    }
  },

  createWorkspace: async (workspaceData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await workspaceAPI.createWorkspace(workspaceData);
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
      const response = await workspaceAPI.updateWorkspace(workspaceId, workspaceData);
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
      await workspaceAPI.deleteWorkspace(workspaceId);
      
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
