const File = require('../models/File');
const Workspace = require('../models/Workspace');
const { validationResult } = require('express-validator');
const path = require('path');

function toId(value) {
  if (!value) return null;
  return value._id ? value._id.toString() : value.toString();
}

function buildChildPath(parentPath, name) {
  if (!parentPath || parentPath === '/') {
    return `/${name}`;
  }

  return `${parentPath.replace(/\/$/, '')}/${name}`;
}

async function updateDescendantPaths(parentId, parentPath) {
  const children = await File.find({ parentId, isDeleted: false });

  for (const child of children) {
    const childPath = buildChildPath(parentPath, child.name);
    child.path = childPath;
    await child.save();

    if (child.isFolder) {
      await updateDescendantPaths(child._id, childPath);
    }
  }
}

async function isDescendantFolder(folderId, possibleAncestorId) {
  let current = await File.findById(folderId).select('parentId');

  while (current?.parentId) {
    const currentParentId = current.parentId.toString();
    if (currentParentId === possibleAncestorId.toString()) {
      return true;
    }

    current = await File.findById(current.parentId).select('parentId');
  }

  return false;
}

// @desc    Get all files in a workspace
// @route   GET /api/files/workspace/:workspaceId
// @access  Private
const getWorkspaceFiles = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    
    // Handle 'default' workspace ID gracefully
    if (workspaceId === 'default') {
      return res.status(404).json({
        success: false,
        error: 'Default workspace is not supported. Please create a real workspace.'
      });
    }
    
    // Verify workspace belongs to user
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      userId: req.user._id,
      isActive: true
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Workspace not found'
      });
    }

    const files = await File.find({
      workspaceId,
      isDeleted: false
    })
    .sort({ isFolder: -1, name: 1 })
    .populate('parentId', 'name path isFolder');

    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('Get workspace files error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single file
// @route   GET /api/files/:id
// @access  Private
const getFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
      .populate('workspaceId', 'userId name')
      .populate('parentId', 'name path');

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Verify workspace belongs to user
    if (file.workspaceId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    if (file.isDeleted) {
      return res.status(404).json({
        success: false,
        error: 'File has been deleted'
      });
    }

    res.json({
      success: true,
      data: file
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create new file or folder
// @route   POST /api/files
// @access  Private
const createFile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, workspaceId, content, language, path: filePath, isFolder } = req.body;
    const parentId = req.body.parentId || null;

    // Verify workspace belongs to user
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      userId: req.user._id,
      isActive: true
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Workspace not found'
      });
    }

    let parentFolder = null;

    if (parentId) {
      parentFolder = await File.findOne({
        _id: parentId,
        workspaceId,
        isFolder: true,
        isDeleted: false
      });

      if (!parentFolder) {
        return res.status(400).json({
          success: false,
          error: 'Parent folder not found'
        });
      }
    }

    // Check if file/folder already exists in the same location
    const existingFile = await File.findOne({
      name,
      workspaceId,
      parentId,
      isDeleted: false
    });

    if (existingFile) {
      return res.status(400).json({
        success: false,
        error: `${isFolder ? 'Folder' : 'File'} with this name already exists`
      });
    }

    // Build the correct path based on the saved parent relationship.
    const finalPath = parentFolder
      ? buildChildPath(parentFolder.path, name)
      : (filePath || `/${name}`);

    const fileData = {
      name,
      workspaceId,
      path: finalPath,
      isFolder: isFolder || false,
      parentId
    };

    if (!isFolder) {
      fileData.content = content || '';
      fileData.language = language || detectLanguage(name);
    }

    const file = await File.create(fileData);

    const populatedFile = await File.findById(file._id)
      .populate('parentId', 'name path');

    res.status(201).json({
      success: true,
      data: populatedFile
    });
  } catch (error) {
    console.error('Create file error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update file
// @route   PUT /api/files/:id
// @access  Private
const updateFile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const file = await File.findById(req.params.id)
      .populate('workspaceId', 'userId');

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Verify workspace belongs to user
    if (file.workspaceId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    if (file.isDeleted) {
      return res.status(404).json({
        success: false,
        error: 'File has been deleted'
      });
    }

    const { name, content, language, cursorPosition, isOpen } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (content !== undefined) updateData.content = content;
    if (language) updateData.language = language;
    if (cursorPosition) updateData.cursorPosition = cursorPosition;
    if (isOpen !== undefined) updateData.isOpen = isOpen;

    const updatedFile = await File.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('parentId', 'name path');

    res.json({
      success: true,
      data: updatedFile
    });
  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete file (soft delete)
// @route   DELETE /api/files/:id
// @access  Private
const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
      .populate('workspaceId', 'userId');

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Verify workspace belongs to user
    if (file.workspaceId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    if (file.isDeleted) {
      return res.status(400).json({
        success: false,
        error: 'File already deleted'
      });
    }

    // If it's a folder, delete all children
    if (file.isFolder) {
      await File.deleteRecursive(file._id);
    }

    // Soft delete the file
    await File.findByIdAndUpdate(req.params.id, { isDeleted: true });

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Rename file
// @route   PUT /api/files/:id/rename
// @access  Private
const renameFile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name } = req.body;

    const file = await File.findById(req.params.id)
      .populate('workspaceId', 'userId');

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Verify workspace belongs to user
    if (file.workspaceId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Check if new name already exists in the same location
    const existingFile = await File.findOne({
      name,
      workspaceId: file.workspaceId._id,
      parentId: file.parentId,
      _id: { $ne: req.params.id },
      isDeleted: false
    });

    if (existingFile) {
      return res.status(400).json({
        success: false,
        error: `${file.isFolder ? 'Folder' : 'File'} with this name already exists`
      });
    }

    const updatedFile = await File.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    ).populate('parentId', 'name path');

    res.json({
      success: true,
      data: updatedFile
    });
  } catch (error) {
    console.error('Rename file error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Helper function to detect language from file extension
function detectLanguage(filename) {
  const ext = path.extname(filename).toLowerCase();
  const languageMap = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.html': 'html',
    '.htm': 'html',
    '.css': 'css',
    '.scss': 'css',
    '.sass': 'css',
    '.less': 'css',
    '.json': 'json',
    '.py': 'python',
    '.cpp': 'cpp',
    '.c': 'c',
    '.java': 'java',
    '.php': 'php',
    '.rb': 'ruby',
    '.go': 'go',
    '.rs': 'rust',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.scala': 'scala',
    '.r': 'r',
    '.sql': 'sql',
    '.md': 'markdown',
    '.markdown': 'markdown',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.xml': 'xml',
    '.txt': 'plaintext',
    '.sh': 'shell',
    '.bash': 'shell',
    '.zsh': 'shell',
    '.fish': 'shell',
    '.ps1': 'powershell',
    '.dockerfile': 'dockerfile',
    '.graphql': 'graphql',
    '.gql': 'graphql',
    '.lua': 'lua',
    '.pl': 'perl'
  };

  return languageMap[ext] || 'plaintext';
}

// @desc    Search files in workspace
// @route   GET /api/files/search/:workspaceId
// @access  Private
const searchFiles = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { query, type, language } = req.query;

    // Verify workspace belongs to user
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      userId: req.user._id,
      isActive: true
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Workspace not found'
      });
    }

    const searchQuery = {
      workspaceId,
      isDeleted: false
    };

    if (query) {
      searchQuery.name = { $regex: query, $options: 'i' };
    }

    if (type === 'folder') {
      searchQuery.isFolder = true;
    } else if (type === 'file') {
      searchQuery.isFolder = false;
    }

    if (language) {
      searchQuery.language = language;
    }

    const files = await File.find(searchQuery)
      .sort({ isFolder: -1, name: 1 })
      .populate('parentId', 'name path')
      .limit(100);

    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('Search files error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Move file/folder
// @route   PUT /api/files/:id/move
// @access  Private
const moveFile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const newParentId = req.body.newParentId || null;

    const file = await File.findById(req.params.id)
      .populate('workspaceId', 'userId');

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Verify workspace belongs to user
    if (file.workspaceId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    if (file.isDeleted) {
      return res.status(404).json({
        success: false,
        error: 'File has been deleted'
      });
    }

    if (file.isFolder && file.path === '/' && !file.parentId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot move the workspace root folder'
      });
    }

    // Check if moving to itself (prevent circular reference)
    if (newParentId === file._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot move a file/folder into itself'
      });
    }

    let destination = null;

    // Check if destination exists and is a folder
    if (newParentId) {
      destination = await File.findById(newParentId);
      if (
        !destination ||
        destination.isDeleted ||
        !destination.isFolder ||
        destination.workspaceId.toString() !== file.workspaceId._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          error: 'Destination folder not found'
        });
      }

      if (file.isFolder && await isDescendantFolder(destination._id, file._id)) {
        return res.status(400).json({
          success: false,
          error: 'Cannot move a folder into one of its descendants'
        });
      }
    }

    if (toId(file.parentId) === newParentId) {
      const unchangedFile = await File.findById(file._id)
        .populate('parentId', 'name path isFolder');

      return res.json({
        success: true,
        data: unchangedFile
      });
    }

    // Check if file with same name already exists in destination
    const existingFile = await File.findOne({
      name: file.name,
      workspaceId: file.workspaceId._id,
      parentId: newParentId || null,
      _id: { $ne: req.params.id },
      isDeleted: false
    });

    if (existingFile) {
      return res.status(400).json({
        success: false,
        error: `${file.isFolder ? 'Folder' : 'File'} with this name already exists in destination`
      });
    }

    const newPath = destination
      ? buildChildPath(destination.path, file.name)
      : `/${file.name}`;

    const updatedFile = await File.findByIdAndUpdate(
      req.params.id,
      {
        parentId: newParentId,
        path: newPath
      },
      { new: true, runValidators: true }
    ).populate('parentId', 'name path isFolder');

    if (updatedFile.isFolder) {
      await updateDescendantPaths(updatedFile._id, updatedFile.path);
    }

    res.json({
      success: true,
      data: updatedFile
    });
  } catch (error) {
    console.error('Move file error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Duplicate file/folder
// @route   POST /api/files/:id/duplicate
// @access  Private
const duplicateFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
      .populate('workspaceId', 'userId');

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Verify workspace belongs to user
    if (file.workspaceId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Generate unique name
    let newName = file.name;
    let counter = 1;
    
    while (true) {
      const existingFile = await File.findOne({
        name: newName,
        workspaceId: file.workspaceId._id,
        parentId: file.parentId,
        isDeleted: false
      });

      if (!existingFile) break;
      
      const ext = path.extname(file.name);
      const baseName = path.basename(file.name, ext);
      newName = `${baseName}_copy${counter}${ext}`;
      counter++;
    }

    // Create duplicate
    const duplicateData = {
      name: newName,
      workspaceId: file.workspaceId._id,
      path: file.path.replace(file.name, newName),
      isFolder: file.isFolder,
      parentId: file.parentId,
      content: file.content || '',
      language: file.language,
      tags: [...(file.tags || [])],
      isReadonly: false // Duplicates are not readonly
    };

    const duplicate = await File.create(duplicateData);

    // If it's a folder, duplicate all children
    if (file.isFolder) {
      await duplicateFolderContents(file._id, duplicate._id, file.workspaceId._id);
    }

    const populatedDuplicate = await File.findById(duplicate._id)
      .populate('parentId', 'name path');

    res.status(201).json({
      success: true,
      data: populatedDuplicate
    });
  } catch (error) {
    console.error('Duplicate file error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get file statistics
// @route   GET /api/files/stats/:workspaceId
// @access  Private
const getFileStats = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // Verify workspace belongs to user
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      userId: req.user._id,
      isActive: true
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Workspace not found'
      });
    }

    const stats = await File.aggregate([
      { $match: { workspaceId: workspace._id, isDeleted: false } },
      {
        $group: {
          _id: null,
          totalFiles: { $sum: { $cond: [{ $eq: ['$isFolder', false] }, 1, 0] } },
          totalFolders: { $sum: { $cond: [{ $eq: ['$isFolder', true] }, 1, 0] } },
          totalSize: { $sum: '$size' },
          languages: { $addToSet: '$language' }
        }
      }
    ]);

    const languageStats = await File.aggregate([
      { $match: { workspaceId: workspace._id, isDeleted: false, isFolder: false } },
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const recentFiles = await File.find({
      workspaceId,
      isDeleted: false,
      isFolder: false
    })
    .sort({ lastModified: -1 })
    .limit(10)
    .select('name path lastModified language size');

    res.json({
      success: true,
      data: {
        overview: stats[0] || { totalFiles: 0, totalFolders: 0, totalSize: 0, languages: [] },
        languageBreakdown: languageStats,
        recentFiles
      }
    });
  } catch (error) {
    console.error('Get file stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Helper function to duplicate folder contents recursively
async function duplicateFolderContents(sourceFolderId, targetFolderId, workspaceId) {
  const children = await File.find({ parentId: sourceFolderId, isDeleted: false });
  
  for (const child of children) {
    const duplicateData = {
      name: child.name,
      workspaceId,
      path: child.path,
      isFolder: child.isFolder,
      parentId: targetFolderId,
      content: child.content || '',
      language: child.language,
      tags: [...(child.tags || [])],
      isReadonly: false
    };

    const duplicate = await File.create(duplicateData);
    
    if (child.isFolder) {
      await duplicateFolderContents(child._id, duplicate._id, workspaceId);
    }
  }
}

// Add recursive delete method to File schema
File.schema.methods.deleteRecursive = async function(fileId) {
  const children = await File.find({ parentId: fileId, isDeleted: false });
  
  for (const child of children) {
    if (child.isFolder) {
      await File.deleteRecursive(child._id);
    }
    await File.findByIdAndUpdate(child._id, { isDeleted: true });
  }
};

module.exports = {
  getWorkspaceFiles,
  getFile,
  createFile,
  updateFile,
  deleteFile,
  renameFile,
  searchFiles,
  moveFile,
  duplicateFile,
  getFileStats
};
