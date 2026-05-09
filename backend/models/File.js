const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a file name'],
    trim: true,
    maxlength: [255, 'File name cannot be more than 255 characters']
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    enum: [
      'javascript', 'typescript', 'html', 'css', 'json', 'python', 
      'cpp', 'c', 'java', 'php', 'ruby', 'go', 'rust', 'swift',
      'kotlin', 'scala', 'r', 'sql', 'markdown', 'yaml', 'xml',
      'plaintext', 'shell', 'powershell', 'dockerfile', 'graphql',
      'lua', 'perl', 'bash', 'zsh', 'fish', 'vue', 'svelte',
      'jsx', 'tsx', 'scss', 'sass', 'less', 'toml', 'ini'
    ],
    default: 'plaintext'
  },
  path: {
    type: String,
    required: true,
    trim: true
  },
  isFolder: {
    type: Boolean,
    default: false
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    default: null
  },
  size: {
    type: Number,
    default: 0
  },
  encoding: {
    type: String,
    enum: ['utf8', 'utf16le', 'latin1', 'ascii', 'base64', 'hex'],
    default: 'utf8'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  isOpen: {
    type: Boolean,
    default: false
  },
  cursorPosition: {
    line: {
      type: Number,
      default: 1
    },
    column: {
      type: Number,
      default: 1
    }
  },
  version: {
    type: Number,
    default: 1
  },
  tags: [{
    type: String,
    trim: true
  }],
  bookmarks: [{
    line: Number,
    column: Number,
    label: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  breakpoints: [{
    line: Number,
    condition: String,
    enabled: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isReadonly: {
    type: Boolean,
    default: false
  },
  isBinary: {
    type: Boolean,
    default: false
  },
  mimeType: {
    type: String,
    default: 'text/plain'
  },
  checksum: {
    type: String,
    default: ''
  },
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  lockedAt: {
    type: Date,
    default: null
  },
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['read', 'write', 'comment'],
      default: 'read'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  aiContext: {
    lastAnalysis: {
      type: Date,
      default: null
    },
    suggestions: [{
      type: String
    }],
    issues: [{
      line: Number,
      column: Number,
      severity: {
        type: String,
        enum: ['error', 'warning', 'info'],
        default: 'info'
      },
      message: String,
      rule: String
    }]
  }
}, {
  timestamps: true
});

// Update last modified time
fileSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.lastModified = new Date();
    this.size = this.content ? Buffer.byteLength(this.content, this.encoding) : 0;
  }
  next();
});

// Virtual for full path
fileSchema.virtual('fullPath').get(function() {
  return this.path + (this.isFolder ? '/' : '');
});

// Indexes for faster queries
fileSchema.index({ workspaceId: 1, isDeleted: 1 });
fileSchema.index({ workspaceId: 1, parentId: 1 });
fileSchema.index({ workspaceId: 1, path: 1 });

module.exports = mongoose.model('File', fileSchema);
