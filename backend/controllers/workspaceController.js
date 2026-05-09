const Workspace = require('../models/Workspace');
const File = require('../models/File');
const { validationResult } = require('express-validator');

// @desc    Get all workspaces for a user
// @route   GET /api/workspaces
// @access  Private
const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({ 
      userId: req.user._id, 
      isActive: true 
    })
    .sort({ lastAccessed: -1 })
    .select('-__v');

    res.json({
      success: true,
      data: workspaces
    });
  } catch (error) {
    console.error('Get workspaces error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single workspace
// @route   GET /api/workspaces/:id
// @access  Private
const getWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    }).populate({
      path: 'files',
      match: { isDeleted: false },
      options: { sort: { name: 1 } }
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Workspace not found'
      });
    }

    // Update last accessed
    await workspace.updateLastAccessed();

    res.json({
      success: true,
      data: workspace
    });
  } catch (error) {
    console.error('Get workspace error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create new workspace
// @route   POST /api/workspaces
// @access  Private
const createWorkspace = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, description, settings } = req.body;

    const workspace = await Workspace.create({
      name,
      description,
      userId: req.user._id,
      settings: settings || {}
    });

    // Create root folder
    await File.create({
      name: 'root',
      workspaceId: workspace._id,
      path: '/',
      isFolder: true,
      parentId: null
    });

    const populatedWorkspace = await Workspace.findById(workspace._id);

    res.status(201).json({
      success: true,
      data: populatedWorkspace
    });
  } catch (error) {
    console.error('Create workspace error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update workspace
// @route   PUT /api/workspaces/:id
// @access  Private
const updateWorkspace = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, description, settings } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (settings) updateData.settings = { ...settings };

    const workspace = await Workspace.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
        isActive: true
      },
      updateData,
      { new: true, runValidators: true }
    );

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Workspace not found'
      });
    }

    res.json({
      success: true,
      data: workspace
    });
  } catch (error) {
    console.error('Update workspace error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete workspace (soft delete)
// @route   DELETE /api/workspaces/:id
// @access  Private
const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
        isActive: true
      },
      { isActive: false },
      { new: true }
    );

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Workspace not found'
      });
    }

    // Soft delete all files in workspace
    await File.updateMany(
      { workspaceId: req.params.id },
      { isDeleted: true }
    );

    res.json({
      success: true,
      message: 'Workspace deleted successfully'
    });
  } catch (error) {
    console.error('Delete workspace error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get workspace statistics
// @route   GET /api/workspaces/:id/stats
// @access  Private
const getWorkspaceStats = async (req, res) => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
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
      {
        $match: {
          workspaceId: workspace._id,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          totalFiles: {
            $sum: { $cond: [{ $eq: ['$isFolder', false] }, 1, 0] }
          },
          totalFolders: {
            $sum: { $cond: [{ $eq: ['$isFolder', true] }, 1, 0] }
          },
          totalSize: { $sum: '$size' },
          languageStats: {
            $push: {
              language: '$language',
              count: 1
            }
          }
        }
      }
    ]);

    const languageCounts = {};
    if (stats.length > 0 && stats[0].languageStats) {
      stats[0].languageStats.forEach(item => {
        languageCounts[item.language] = (languageCounts[item.language] || 0) + 1;
      });
    }

    const result = {
      totalFiles: stats.length > 0 ? stats[0].totalFiles : 0,
      totalFolders: stats.length > 0 ? stats[0].totalFolders : 0,
      totalSize: stats.length > 0 ? stats[0].totalSize : 0,
      languageCounts,
      createdAt: workspace.createdAt,
      lastAccessed: workspace.lastAccessed
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get workspace stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  getWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceStats
};
