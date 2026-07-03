import React, { useState, useEffect, useRef } from 'react';
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
  FiMove
} from 'react-icons/fi';
import useFileStore from '../store/fileStore';
import { getFileIcon } from '../utils/helpers';
import toast from 'react-hot-toast';

const FileExplorer = ({ workspaceId, onFileSelect, activeFile }) => {
  const { files, fileTree, fetchFiles, createFile, deleteFile, renameFile, moveFile, isLoading } = useFileStore();
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [contextMenu, setContextMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState('file');
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [parentFolderId, setParentFolderId] = useState(null);
  const [fileToMove, setFileToMove] = useState(null);
  const [moveDestinationId, setMoveDestinationId] = useState('');
  const [draggedFileId, setDraggedFileId] = useState(null);
  const [dragOverFolderId, setDragOverFolderId] = useState(null);
  const requestedWorkspaceRef = useRef(null);

  const getId = (value) => {
    if (!value) return null;
    return value._id || value;
  };

  const workspaceRootFolder = files.find(file => file.isFolder && file.path === '/' && !getId(file.parentId));

  const getSelectedFolderId = () => {
    const selected = files.find(file => file._id === selectedFile);
    return selected?.isFolder ? selected._id : null;
  };

  const getParentId = (file) => getId(file?.parentId);

  const isRootFolder = (file) => file?.isFolder && file.path === '/' && !getParentId(file);

  const isDescendant = (possibleDescendantId, possibleAncestorId) => {
    let current = files.find(file => file._id === possibleDescendantId);

    while (current) {
      const parentId = getParentId(current);
      if (!parentId) return false;
      if (parentId === possibleAncestorId) return true;
      current = files.find(file => file._id === parentId);
    }

    return false;
  };

  const canMoveTo = (file, destinationId) => {
    if (!file || isRootFolder(file)) return false;
    const normalizedDestinationId = destinationId || null;

    if (normalizedDestinationId === file._id) return false;
    if (getParentId(file) === normalizedDestinationId) return false;
    if (!normalizedDestinationId) return true;

    const destination = files.find(item => item._id === normalizedDestinationId);
    if (!destination?.isFolder) return false;

    return !(file.isFolder && isDescendant(normalizedDestinationId, file._id));
  };

  const folderOptionsForMove = (file) => {
    const options = [];

    if (!workspaceRootFolder || canMoveTo(file, workspaceRootFolder._id)) {
      options.push({
        _id: workspaceRootFolder?._id || '',
        name: 'Workspace Root',
        path: '/'
      });
    }

    files
      .filter(item => item.isFolder && !isRootFolder(item) && canMoveTo(file, item._id))
      .sort((a, b) => a.path.localeCompare(b.path))
      .forEach(folder => options.push(folder));

    return options;
  };

  useEffect(() => {
    if (!workspaceId || workspaceId === 'default') {
      return;
    }

    if (requestedWorkspaceRef.current === workspaceId) {
      return;
    }

    requestedWorkspaceRef.current = workspaceId;
    console.log('Calling fetchFiles for:', workspaceId);
    fetchFiles(workspaceId);
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
    setSelectedFile(file._id);

    if (file.isFolder) {
      toggleFolder(file._id);
    } else {
      onFileSelect(file);
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
      isFolder: newFileType === 'folder'
    };

    if (newFileType === 'file') {
      fileData.content = '';
    }

    if (parentFolderId) {
      fileData.parentId = parentFolderId;
    }

    const result = await createFile(fileData);

    if (result.success) {
      toast.success(`${newFileType === 'folder' ? 'Folder' : 'File'} created successfully!`);
      setShowNewFileDialog(false);
      setNewFileName('');
      setNewFileType('file');

      if (parentFolderId) {
        setExpandedFolders(prev => new Set([...prev, parentFolderId]));
      }

      setParentFolderId(null);
    } else {
      console.error('Create failed:', result.error);
      toast.error(result.error || 'Failed to create file');
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const result = await deleteFile(fileId);
      if (result.success) {
        toast.success('Item deleted successfully!');
        closeContextMenu();
      } else {
        toast.error(result.error || 'Failed to delete item');
      }
    }
  };

  const handleRenameFile = async (fileId) => {
    if (!editingName.trim()) return;

    const result = await renameFile(fileId, editingName);
    if (result.success) {
      toast.success('Renamed successfully!');
      setEditingFile(null);
      setEditingName('');
    } else {
      toast.error(result.error || 'Failed to rename');
    }
  };

  const startEditing = (file) => {
    setEditingFile(file._id);
    setEditingName(file.name);
  };

  const handleNewFileInFolder = (folder) => {
    setParentFolderId(folder._id);
    setNewFileType('file');
    setNewFileName('');
    setShowNewFileDialog(true);
    closeContextMenu();
  };

  const handleNewFolderInFolder = (folder) => {
    setParentFolderId(folder._id);
    setNewFileType('folder');
    setNewFileName('');
    setShowNewFileDialog(true);
    closeContextMenu();
  };

  const openCreateDialog = (type, folderId = null) => {
    setParentFolderId(folderId);
    setNewFileType(type);
    setNewFileName('');
    setShowNewFileDialog(true);
  };

  const handleMove = async (file, destinationId) => {
    if (!canMoveTo(file, destinationId)) {
      toast.error('That move is not allowed');
      return;
    }

    const result = await moveFile(file._id, destinationId || null);

    if (result.success) {
      toast.success(`${file.isFolder ? 'Folder' : 'File'} moved successfully!`);
      if (destinationId) {
        setExpandedFolders(prev => new Set([...prev, destinationId]));
      }
      setShowMoveDialog(false);
      setFileToMove(null);
      setMoveDestinationId('');
      closeContextMenu();
    } else {
      toast.error(result.error || 'Failed to move item');
    }
  };

  const openMoveDialog = (file) => {
    setFileToMove(file);
    setMoveDestinationId(workspaceRootFolder?._id || '');
    setShowMoveDialog(true);
    closeContextMenu();
  };

  const handleDragStart = (e, file) => {
    if (isRootFolder(file)) {
      e.preventDefault();
      return;
    }

    setDraggedFileId(file._id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', file._id);
  };

  const handleDragOverFolder = (e, folder) => {
    const draggedFile = files.find(file => file._id === draggedFileId);
    if (!draggedFile || !canMoveTo(draggedFile, folder._id)) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolderId(folder._id);
  };

  const handleDropOnFolder = async (e, folder) => {
    e.preventDefault();
    e.stopPropagation();

    const fileId = e.dataTransfer.getData('text/plain') || draggedFileId;
    const draggedFile = files.find(file => file._id === fileId);

    setDraggedFileId(null);
    setDragOverFolderId(null);

    if (!draggedFile) return;
    await handleMove(draggedFile, folder._id);
  };

  const visibleTree = searchTerm.trim()
    ? files.filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : fileTree;

  const renderFileTree = (tree, level = 0) => {
    return tree.map((file) => (
      <div key={file._id}>
        <div
          className={`file-tree-item ${selectedFile === file._id ? 'file-tree-item-active' : ''} ${
            dragOverFolderId === file._id ? 'bg-editor-accent/30' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => handleFileClick(file)}
          onContextMenu={(e) => handleContextMenu(e, file)}
          draggable={!isRootFolder(file)}
          onDragStart={(e) => handleDragStart(e, file)}
          onDragEnd={() => {
            setDraggedFileId(null);
            setDragOverFolderId(null);
          }}
          onDragOver={file.isFolder ? (e) => handleDragOverFolder(e, file) : undefined}
          onDragLeave={() => setDragOverFolderId(null)}
          onDrop={file.isFolder ? (e) => handleDropOnFolder(e, file) : undefined}
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
              onClick={() => {
                openCreateDialog('file', getSelectedFolderId());
              }}
              className="p-1 hover:bg-editor-hover rounded text-editor-text-dim hover:text-editor-text"
              title="New File"
            >
              <FiPlus size={14} />
            </button>
            <button
              onClick={() => fetchFiles(workspaceId, { force: true })}
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
        ) : visibleTree.length > 0 ? (
          renderFileTree(visibleTree)
        ) : (
          <div className="text-center py-8">
            <FiFile className="mx-auto text-editor-text-dim mb-2" size={24} />
            <p className="text-xs text-editor-text-dim">No files yet</p>
            <button
              onClick={() => openCreateDialog('file')}
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

            {!isRootFolder(contextMenu.file) && (
              <button
                onClick={() => openMoveDialog(contextMenu.file)}
                className="w-full px-3 py-1.5 text-left text-xs text-editor-text hover:bg-editor-hover flex items-center space-x-2"
              >
                <FiMove size={12} />
                <span>Move To...</span>
              </button>
            )}
            
            {contextMenu.file.isFolder && (
              <>
                <button
                  onClick={() => handleNewFileInFolder(contextMenu.file)}
                  className="w-full px-3 py-1.5 text-left text-xs text-editor-text hover:bg-editor-hover flex items-center space-x-2"
                >
                  <FiFile size={12} />
                  <span>New File</span>
                </button>
                <button
                  onClick={() => handleNewFolderInFolder(contextMenu.file)}
                  className="w-full px-3 py-1.5 text-left text-xs text-editor-text hover:bg-editor-hover flex items-center space-x-2"
                >
                  <FiFolder size={12} />
                  <span>New Folder</span>
                </button>
              </>
            )}
            
            {!contextMenu.file.isFolder && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(contextMenu.file.content || '');
                  closeContextMenu();
                  toast.success('Content copied to clipboard!');
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

      {/* Move Dialog */}
      <AnimatePresence>
        {showMoveDialog && fileToMove && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowMoveDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="panel w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="panel-header">
                <h3 className="font-semibold text-editor-text">Move To...</h3>
              </div>
              <div className="panel-content space-y-4">
                <div>
                  <label className="block text-sm font-medium text-editor-text mb-2">
                    Destination
                  </label>
                  <select
                    value={moveDestinationId}
                    onChange={(e) => setMoveDestinationId(e.target.value)}
                    className="input-field w-full"
                    autoFocus
                  >
                    {folderOptionsForMove(fileToMove).map(folder => (
                      <option key={folder._id || 'workspace-root'} value={folder._id}>
                        {folder.path === '/' ? folder.name : folder.path}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => setShowMoveDialog(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleMove(fileToMove, moveDestinationId)}
                    disabled={!canMoveTo(fileToMove, moveDestinationId)}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Move
                  </button>
                </div>
              </div>
            </motion.div>
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
