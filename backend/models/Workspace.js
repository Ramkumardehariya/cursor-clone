const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a workspace name'],
    trim: true,
    maxlength: [100, 'Workspace name cannot be more than 100 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  settings: {
    theme: {
      type: String,
      enum: ['dark', 'light', 'vs-dark', 'vs-light'],
      default: 'dark'
    },
    fontSize: {
      type: Number,
      min: 10,
      max: 32,
      default: 14
    },
    tabSize: {
      type: Number,
      min: 2,
      max: 8,
      default: 4
    },
    wordWrap: {
      type: String,
      enum: ['on', 'off', 'wordWrapColumn', 'bounded'],
      default: 'on'
    },
    minimap: {
      type: Boolean,
      default: true
    },
    lineNumbers: {
      type: String,
      enum: ['on', 'off', 'relative', 'interval'],
      default: 'on'
    },
    autoSave: {
      type: Boolean,
      default: true
    },
    autoSaveDelay: {
      type: Number,
      min: 100,
      max: 10000,
      default: 1000
    },
    formatOnSave: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  collaborators: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['read', 'write', 'admin'],
      default: 'read'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,
    default: null
  },
  projectType: {
    type: String,
    enum: ['javascript', 'typescript', 'python', 'java', 'cpp', 'go', 'rust', 'php', 'ruby', 'other'],
    default: 'javascript'
  },
  framework: {
    type: String,
    enum: ['react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'express', 'django', 'flask', 'spring', 'laravel', 'none'],
    default: 'none'
  },
  buildCommand: {
    type: String,
    default: ''
  },
  runCommand: {
    type: String,
    default: ''
  },
  dependencies: [{
    name: String,
    version: String,
    type: {
      type: String,
      enum: ['npm', 'yarn', 'pip', 'maven', 'gradle', 'cargo', 'composer'],
      default: 'npm'
    }
  }],
  environment: {
    node: {
      type: String,
      default: '18'
    },
    python: {
      type: String,
      default: '3.9'
    }
  }
}, {
  timestamps: true
});

// Update last accessed time
workspaceSchema.methods.updateLastAccessed = function() {
  this.lastAccessed = new Date();
  return this.save();
};

// Index for faster queries
workspaceSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('Workspace', workspaceSchema);
