const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  tokens: {
    type: Number,
    default: 0
  },
  model: {
    type: String,
    default: 'gpt-4'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const chatSchema = new mongoose.Schema({
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Chat title cannot be more than 200 characters']
  },
  messages: [messageSchema],
  totalTokens: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  settings: {
    temperature: {
      type: Number,
      min: 0,
      max: 2,
      default: 0.7
    },
    maxTokens: {
      type: Number,
      min: 1,
      max: 4096,
      default: 2048
    },
    systemPrompt: {
      type: String,
      default: 'You are a helpful AI programming assistant. Provide clear, concise, and accurate coding assistance.'
    }
  }
}, {
  timestamps: true
});

// Update last message time and total tokens
chatSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.lastMessageAt = new Date();
    this.totalTokens = this.messages.reduce((total, msg) => total + (msg.tokens || 0), 0);
  }
  next();
});

// Add message helper
chatSchema.methods.addMessage = function(role, content, metadata = {}) {
  this.messages.push({
    role,
    content,
    metadata
  });
  return this.save();
};

// Get recent messages
chatSchema.methods.getRecentMessages = function(limit = 50) {
  return this.messages.slice(-limit);
};

// Indexes for faster queries
chatSchema.index({ workspaceId: 1, isActive: 1 });
chatSchema.index({ workspaceId: 1, lastMessageAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
