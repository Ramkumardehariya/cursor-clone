import { create } from 'zustand';
import { fileAPI } from '../services/api';
import debug, { createPerformanceMonitor } from '../utils/debug';

const useFileStore = create((set, get) => ({
  // State
  files: [],
  openFiles: [],
  activeFile: null,
  fileTree: [],
  isLoading: false,
  error: null,
  lastFetchedWorkspaceId: null,

  // Actions
  fetchFiles: async (workspaceId, options = {}) => {
    const { force = false } = options;
    const state = get();

    if (!workspaceId) {
      return [];
    }

    if (!force && state.lastFetchedWorkspaceId === workspaceId && state.files.length > 0) {
      debug.store('file', 'fetchFiles:skipped', workspaceId, 'already fetched');
      return state.files;
    }

    debug.store('file', 'fetchFiles:start', workspaceId);
    const monitor = createPerformanceMonitor('fetchFiles');

    set({ isLoading: true, error: null, lastFetchedWorkspaceId: workspaceId });
    try {
      const response = await fileAPI.getWorkspaceFiles(workspaceId);
      const { data } = response.data;

      debug.success('file', `Fetched ${data.length} files`);
      set({
        files: data,
        fileTree: buildFileTree(data),
        isLoading: false
      });

      monitor.end();
      return data;
    } catch (error) {
      console.error('Failed to fetch files:', error);
      debug.error('file', error?.response?.data?.error || error?.message || 'Failed to fetch files');
      set({
        error: error.response?.data?.error || error?.message || 'Failed to fetch files',
        isLoading: false
      });
      monitor.end();
      return [];
    }
  },

  fetchFile: async (fileId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fileAPI.getFile(fileId);
      const { data } = response.data;
      
      set((state) => ({
        files: state.files.map(f => f._id === fileId ? data : f),
        isLoading: false
      }));
      
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to fetch file',
        isLoading: false
      });
      return null;
    }
  },

  createFile: async (fileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fileAPI.createFile(fileData);
      const { data } = response.data;

      set((state) => {
        const files = [...state.files, data];
        return {
          files,
          fileTree: buildFileTree(files),
          isLoading: false
        };
      });

      const workspaceId = fileData.workspaceId;
      await get().fetchFiles(workspaceId, { force: true });

      return { success: true, data };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to create file',
        isLoading: false
      });
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create file'
      };
    }
  },

  updateFile: async (fileId, fileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fileAPI.updateFile(fileId, fileData);
      const { data } = response.data;
      
      set((state) => ({
        files: state.files.map(f => f._id === fileId ? data : f),
        fileTree: buildFileTree(state.files.map(f => f._id === fileId ? data : f)),
        openFiles: state.openFiles.map(f => f._id === fileId ? data : f),
        activeFile: state.activeFile?._id === fileId ? data : state.activeFile,
        isLoading: false
      }));
      
      return { success: true, data };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to update file',
        isLoading: false
      });
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update file' 
      };
    }
  },

  deleteFile: async (fileId) => {
    set({ isLoading: true, error: null });
    try {
      await fileAPI.deleteFile(fileId);
      
      set((state) => {
        const newFiles = state.files.filter(f => f._id !== fileId);
        const newOpenFiles = state.openFiles.filter(f => f._id !== fileId);
        const newActiveFile = state.activeFile?._id === fileId 
          ? (newOpenFiles.length > 0 ? newOpenFiles[0] : null)
          : state.activeFile;
        
        return {
          files: newFiles,
          fileTree: buildFileTree(newFiles),
          openFiles: newOpenFiles,
          activeFile: newActiveFile,
          isLoading: false
        };
      });
      
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to delete file',
        isLoading: false
      });
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to delete file' 
      };
    }
  },

  renameFile: async (fileId, newName) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fileAPI.renameFile(fileId, newName);
      const { data } = response.data;
      
      set((state) => ({
        files: state.files.map(f => f._id === fileId ? data : f),
        fileTree: buildFileTree(state.files.map(f => f._id === fileId ? data : f)),
        openFiles: state.openFiles.map(f => f._id === fileId ? data : f),
        activeFile: state.activeFile?._id === fileId ? data : state.activeFile,
        isLoading: false
      }));
      
      return { success: true, data };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to rename file',
        isLoading: false
      });
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to rename file' 
      };
    }
  },

  moveFile: async (fileId, newParentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fileAPI.moveFile(fileId, newParentId || null);
      const { data } = response.data;

      set((state) => {
        const files = state.files.map(f => f._id === fileId ? data : f);
        return {
          files,
          fileTree: buildFileTree(files),
          openFiles: state.openFiles.map(f => f._id === fileId ? data : f),
          activeFile: state.activeFile?._id === fileId ? data : state.activeFile,
          isLoading: false
        };
      });

      const movedWorkspaceId = data.workspaceId && typeof data.workspaceId === 'object'
        ? data.workspaceId._id
        : data.workspaceId;
      if (movedWorkspaceId || get().lastFetchedWorkspaceId) {
        await get().fetchFiles(movedWorkspaceId || get().lastFetchedWorkspaceId, { force: true });
      }

      return { success: true, data };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to move file',
        isLoading: false
      });
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to move file'
      };
    }
  },

  openFile: (file) => {
    set((state) => {
      const isOpen = state.openFiles.some(f => f._id === file._id);
      const newOpenFiles = isOpen 
        ? state.openFiles 
        : [...state.openFiles, file];
      
      return {
        openFiles: newOpenFiles,
        activeFile: file
      };
    });
  },

  closeFile: (fileId) => {
    set((state) => {
      const newOpenFiles = state.openFiles.filter(f => f._id !== fileId);
      const newActiveFile = state.activeFile?._id === fileId 
        ? (newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null)
        : state.activeFile;
      
      return {
        openFiles: newOpenFiles,
        activeFile: newActiveFile
      };
    });
  },

  setActiveFile: (file) => {
    set({ activeFile: file });
  },

  updateFileContent: (fileId, content) => {
    set((state) => ({
      files: state.files.map(f => f._id === fileId ? { ...f, content } : f),
      openFiles: state.openFiles.map(f => f._id === fileId ? { ...f, content } : f),
      activeFile: state.activeFile?._id === fileId ? { ...state.activeFile, content } : state.activeFile
    }));
  },

  clearFiles: () => {
    set({
      files: [],
      openFiles: [],
      activeFile: null,
      fileTree: []
    });
  },

  clearError: () => {
    set({ error: null });
  }
}));

// Helper function to build file tree
function buildFileTree(files) {
  const tree = [];
  const map = {};

  // Create a map of files
  files.forEach(file => {
    if (file?._id) {
      map[file._id] = { ...file, children: [] };
    }
  });

  // Build the tree structure
  files.forEach(file => {
    if (!file?._id) return;

    const parentId = file.parentId && typeof file.parentId === 'object'
      ? file.parentId._id
      : file.parentId;
    const parentKey = parentId ? parentId.toString() : null;

    if (parentKey && map[parentKey]) {
      map[parentKey].children.push(map[file._id]);
    } else if (!parentKey) {
      tree.push(map[file._id]);
    }
  });

  const sortNodes = (nodes) => {
    nodes.sort((a, b) => {
      if (a.isFolder !== b.isFolder) {
        return a.isFolder ? -1 : 1;
      }

      return a.name.localeCompare(b.name);
    });

    nodes.forEach(node => sortNodes(node.children));
  };

  sortNodes(tree);

  return tree;
}

export default useFileStore;
