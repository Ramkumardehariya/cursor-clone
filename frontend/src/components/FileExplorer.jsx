import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFolder, 
  FiFile, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiChevronRight, 
  FiChevronDown,
  FiSearch,
  FiMoreVertical
} from 'react-icons/fi';
import useFileStore from '../store/fileStore';
import { getFileIcon, formatFileSize, formatDate } from '../utils/helpers';

const FileExplorer = ({ workspaceId, onFileSelect, activeFile }) => {
  const { files, fileTree, fetchFiles, createFile, deleteFile, renameFile, isLoading } = useFileStore();
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [contextMenu, setContextMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState('file');
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    if (workspaceId) {
      fetchFiles(workspaceId);
    }
  }, [workspaceId, fetchFiles]);

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleFileClick = (file) => {
    if (file.isFolder) {
      toggleFolder(file._id);
    } else {
      onFileSelect(file);
      setSelectedFile(file._id);
    }
  };

  const handleContextMenu = (e, file) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      file
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleCreateFile = async () => {
    if (!newFileName.trim()) return;

    const fileData = {
      name: newFileName,
      workspaceId,
      isFolder: newFileType === 'folder',
      content: newFileType === 'file' ? '' : null
    };

    const result = await createFile(fileData);
    if (result.success) {
      setShowNewFileDialog(false);
      setNewFileName('');
      setNewFileType('file');
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteFile(fileId);
      closeContextMenu();
    }
  };

  const handleRenameFile = async (fileId) => {
    if (!editingName.trim()) return;

    const result = await renameFile(fileId, editingName);
    if (result.success) {
      setEditingFile(null);
      setEditingName('');
    }
  };

  const startEditing = (file) => {
    setEditingFile(file._id);
    setEditingName(file.name);
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderFileTree = (tree, level = 0) => {
    return tree.map((file) => (
      <div key={file._id}>
        <div
          className={`file-tree-item ${selectedFile === file._id ? 'file-tree-item-active' : ''}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => handleFileClick(file)}
          onContextMenu={(e) => handleContextMenu(e, file)}
        >
          <div className="flex items-center space-x-2 flex-1">
            {file.isFolder && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(file._id);
                }}
                className="p-0.5 hover:bg-editor-hover rounded"
              >
                {expandedFolders.has(file._id) ? (
                  <FiChevronDown size={12} />
                ) : (
                  <FiChevronRight size={12} />
                )}
              </button>
            )}
            
            <span className="text-lg">
              {file.isFolder 
                ? (expandedFolders.has(file._id) ? getFileIcon('folder_open', true) : getFileIcon('folder', true))
                : getFileIcon(file.language, false)
              }
            </span>

            {editingFile === file._id ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleRenameFile(file._id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameFile(file._id);
                  } else if (e.key === 'Escape') {
                    setEditingFile(null);
                    setEditingName('');
                  }
                }}
                className="bg-editor-sidebar border border-editor-accent rounded px-1 py-0.5 text-sm text-editor-text outline-none"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="flex-1 text-sm truncate">{file.name}</span>
            )}
          </div>
        </div>
        
        {file.isFolder && expandedFolders.has(file._id) && file.children && (
          <div>
            {renderFileTree(file.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col bg-editor-sidebar border-r border-editor-border">
      {/* Header */}
      <div className="p-3 border-b border-editor-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-editor-text">Explorer</h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowNewFileDialog(true)}
              className="p-1 hover:bg-editor-hover rounded text-editor-text-dim hover:text-editor-text"
              title="New File"
            >
              <FiPlus size={14} />
            </button>
            <button
              className="p-1 hover:bg-editor-hover rounded text-editor-text-dim hover:text-editor-text"
              title="Refresh"
            >
              <FiSearch size={14} />
            </button>
          </div>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-editor-toolbar border border-editor-border rounded px-2 py-1 text-xs text-editor-text placeholder-editor-text-dim focus:outline-none focus:border-editor-accent"
          />
          <FiSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-editor-text-dim" size={12} />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="loading-spinner w-4 h-4"></div>
          </div>
        ) : fileTree.length > 0 ? (
          renderFileTree(fileTree)
        ) : (
          <div className="text-center py-8">
            <FiFile className="mx-auto text-editor-text-dim mb-2" size={24} />
            <p className="text-xs text-editor-text-dim">No files yet</p>
            <button
              onClick={() => setShowNewFileDialog(true)}
              className="mt-2 text-xs text-editor-accent hover:text-blue-400"
            >
              Create your first file
            </button>
          </div>
        )}
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bg-editor-sidebar border border-editor-border rounded-lg shadow-lg py-1 z-50"
            style={{
              left: contextMenu.x,
              top: contextMenu.y
            }}
            onClick={closeContextMenu}
          >
            <button
              onClick={() => startEditing(contextMenu.file)}
              className="w-full px-3 py-1.5 text-left text-xs text-editor-text hover:bg-editor-hover flex items-center space-x-2"
            >
              <FiEdit2 size={12} />
              <span>Rename</span>
            </button>
            
            {!contextMenu.file.isFolder && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(contextMenu.file.content || '');
                  closeContextMenu();
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-editor-text hover:bg-editor-hover flex items-center space-x-2"
              >
                <FiFile size={12} />
                <span>Copy Content</span>
              </button>
            )}
            
            <button
              onClick={() => handleDeleteFile(contextMenu.file._id)}
              className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-900/20 flex items-center space-x-2"
            >
              <FiTrash2 size={12} />
              <span>Delete</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New File Dialog */}
      <AnimatePresence>
        {showNewFileDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowNewFileDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="panel w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="panel-header">
                <h3 className="font-semibold text-editor-text">Create New</h3>
              </div>
              <div className="panel-content space-y-4">
                <div>
                  <label className="block text-sm font-medium text-editor-text mb-2">
                    Type
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setNewFileType('file')}
                      className={`flex-1 py-2 px-3 rounded border ${
                        newFileType === 'file'
                          ? 'bg-editor-accent border-editor-accent text-white'
                          : 'bg-editor-sidebar border-editor-border text-editor-text'
                      }`}
                    >
                      File
                    </button>
                    <button
                      onClick={() => setNewFileType('folder')}
                      className={`flex-1 py-2 px-3 rounded border ${
                        newFileType === 'folder'
                          ? 'bg-editor-accent border-editor-accent text-white'
                          : 'bg-editor-sidebar border-editor-border text-editor-text'
                      }`}
                    >
                      Folder
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-editor-text mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder={newFileType === 'folder' ? 'Folder name' : 'File name'}
                    className="input-field w-full"
                    autoFocus
                  />
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => setShowNewFileDialog(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateFile}
                    disabled={!newFileName.trim()}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileExplorer;
