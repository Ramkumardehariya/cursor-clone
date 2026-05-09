const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Store connected users and their sessions
const connectedUsers = new Map();
const workspaceSessions = new Map();

// Socket.IO authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
};

const socketHandler = (io) => {
  // Use authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.email} (${socket.id})`);
    
    // Store user connection
    connectedUsers.set(socket.user._id.toString(), {
      socketId: socket.id,
      user: socket.user,
      connectedAt: new Date()
    });

    // Join user to their personal room
    socket.join(`user_${socket.user._id}`);

    // Handle workspace join
    socket.on('join-workspace', (workspaceId) => {
      socket.join(`workspace_${workspaceId}`);
      
      // Track workspace session
      if (!workspaceSessions.has(workspaceId)) {
        workspaceSessions.set(workspaceId, new Set());
      }
      workspaceSessions.get(workspaceId).add(socket.user._id.toString());
      
      console.log(`User ${socket.user.email} joined workspace ${workspaceId}`);
      
      // Notify others in workspace
      socket.to(`workspace_${workspaceId}`).emit('user-joined', {
        userId: socket.user._id,
        userName: socket.user.name,
        userEmail: socket.user.email
      });
    });

    // Handle workspace leave
    socket.on('leave-workspace', (workspaceId) => {
      socket.leave(`workspace_${workspaceId}`);
      
      if (workspaceSessions.has(workspaceId)) {
        workspaceSessions.get(workspaceId).delete(socket.user._id.toString());
        if (workspaceSessions.get(workspaceId).size === 0) {
          workspaceSessions.delete(workspaceId);
        }
      }
      
      console.log(`User ${socket.user.email} left workspace ${workspaceId}`);
      
      // Notify others in workspace
      socket.to(`workspace_${workspaceId}`).emit('user-left', {
        userId: socket.user._id,
        userName: socket.user.name,
        userEmail: socket.user.email
      });
    });

    // Handle file operations
    socket.on('file-change', (data) => {
      const { workspaceId, fileId, content, cursorPosition } = data;
      
      // Broadcast to other users in the workspace
      socket.to(`workspace_${workspaceId}`).emit('file-updated', {
        fileId,
        content,
        cursorPosition,
        updatedBy: {
          id: socket.user._id,
          name: socket.user.name,
          email: socket.user.email
        },
        timestamp: new Date()
      });
    });

    // Handle cursor position updates
    socket.on('cursor-move', (data) => {
      const { workspaceId, fileId, position } = data;
      
      // Broadcast to other users in the workspace
      socket.to(`workspace_${workspaceId}`).emit('cursor-updated', {
        fileId,
        position,
        user: {
          id: socket.user._id,
          name: socket.user.name,
          email: socket.user.email
        },
        timestamp: new Date()
      });
    });

    // Handle file selection
    socket.on('file-select', (data) => {
      const { workspaceId, fileId } = data;
      
      // Broadcast to other users in the workspace
      socket.to(`workspace_${workspaceId}`).emit('file-selected', {
        fileId,
        selectedBy: {
          id: socket.user._id,
          name: socket.user.name,
          email: socket.user.email
        },
        timestamp: new Date()
      });
    });

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      const { workspaceId, fileId } = data;
      
      socket.to(`workspace_${workspaceId}`).emit('user-typing', {
        fileId,
        user: {
          id: socket.user._id,
          name: socket.user.name,
          email: socket.user.email
        },
        isTyping: true
      });
    });

    socket.on('typing-stop', (data) => {
      const { workspaceId, fileId } = data;
      
      socket.to(`workspace_${workspaceId}`).emit('user-typing', {
        fileId,
        user: {
          id: socket.user._id,
          name: socket.user.name,
          email: socket.user.email
        },
        isTyping: false
      });
    });

    // Handle AI chat streaming
    socket.on('ai-chat-start', (data) => {
      const { workspaceId, chatId } = data;
      
      // Join AI chat room for this workspace
      socket.join(`ai_chat_${workspaceId}`);
    });

    socket.on('ai-chat-message', (data) => {
      const { workspaceId, message, chatId } = data;
      
      // Broadcast to all users in workspace AI chat
      io.to(`ai_chat_${workspaceId}`).emit('ai-chat-response', {
        message,
        chatId,
        from: {
          id: socket.user._id,
          name: socket.user.name,
          email: socket.user.email
        },
        timestamp: new Date()
      });
    });

    // Handle terminal output streaming
    socket.on('terminal-session-start', (data) => {
      const { workspaceId, sessionId } = data;
      
      socket.join(`terminal_${workspaceId}`);
    });

    socket.on('terminal-output', (data) => {
      const { workspaceId, sessionId, output, type } = data;
      
      // Broadcast terminal output to workspace
      socket.to(`terminal_${workspaceId}`).emit('terminal-output', {
        sessionId,
        output,
        type,
        from: {
          id: socket.user._id,
          name: socket.user.name,
          email: socket.user.email
        },
        timestamp: new Date()
      });
    });

    // Handle workspace settings changes
    socket.on('workspace-settings-update', (data) => {
      const { workspaceId, settings } = data;
      
      // Broadcast settings update to all users in workspace
      io.to(`workspace_${workspaceId}`).emit('workspace-settings-changed', {
        workspaceId,
        settings,
        updatedBy: {
          id: socket.user._id,
          name: socket.user.name,
          email: socket.user.email
        },
        timestamp: new Date()
      });
    });

    // Handle workspace file tree changes
    socket.on('file-tree-change', (data) => {
      const { workspaceId, change } = data;
      
      // Broadcast file tree changes to workspace
      socket.to(`workspace_${workspaceId}`).emit('file-tree-updated', {
        workspaceId,
        change,
        changedBy: {
          id: socket.user._id,
          name: socket.user.name,
          email: socket.user.email
        },
        timestamp: new Date()
      });
    });

    // Handle presence updates
    socket.on('presence-update', (data) => {
      const { workspaceId, status } = data;
      
      // Update user presence in workspace
      socket.to(`workspace_${workspaceId}`).emit('presence-changed', {
        userId: socket.user._id,
        userName: socket.user.name,
        status,
        timestamp: new Date()
      });
    });

    // Handle custom events
    socket.on('custom-event', (data) => {
      const { workspaceId, eventType, payload } = data;
      
      // Broadcast custom event to workspace
      socket.to(`workspace_${workspaceId}`).emit('custom-event', {
        eventType,
        payload,
        from: {
          id: socket.user._id,
          name: socket.user.name,
          email: socket.user.email
        },
        timestamp: new Date()
      });
    });

    // Handle AI assistant events
    socket.on('ai-assistant-request', (data) => {
      const { workspaceId, requestId, type, payload } = data;
      
      // Join AI assistant room
      socket.join(`ai_assistant_${workspaceId}`);
      
      // Broadcast to other users that AI is being used
      socket.to(`ai_assistant_${workspaceId}`).emit('ai-assistant-active', {
        requestId,
        type,
        user: {
          id: socket.user._id,
          name: socket.user.name,
          email: socket.user.email
        },
        timestamp: new Date()
      });
    });

    // Handle code collaboration events
    socket.on('code-suggestion', (data) => {
      const { workspaceId, fileId, suggestion, position } = data;
      
      socket.to(`workspace_${workspaceId}`).emit('code-suggestion-received', {
        fileId,
        suggestion,
        position,
        from: {
          id: socket.user._id,
          name: socket.user.name,
          email: socket.user.email
        },
        timestamp: new Date()
      });
    });

    // Handle workspace sharing events
    socket.on('workspace-share', (data) => {
      const { workspaceId, shareToken, permissions } = data;
      
      // Broadcast share event to workspace
      io.to(`workspace_${workspaceId}`).emit('workspace-shared', {
        workspaceId,
        shareToken,
        permissions,
        sharedBy: {
          id: socket.user._id,
          name: socket.user.name,
          email: socket.user.email
        },
        timestamp: new Date()
      });
    });

    // Handle notification events
    socket.on('notification', (data) => {
      const { userId, type, message, payload } = data;
      
      // Send notification to specific user
      io.to(`user_${userId}`).emit('notification-received', {
        type,
        message,
        payload,
        from: {
          id: socket.user._id,
          name: socket.user.name,
          email: socket.user.email
        },
        timestamp: new Date()
      });
    });

    // Handle heartbeat for connection monitoring
    socket.on('heartbeat', () => {
      socket.emit('heartbeat-response', {
        timestamp: new Date(),
        status: 'connected'
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.email} (${socket.id})`);
      
      // Remove from connected users
      connectedUsers.delete(socket.user._id.toString());
      
      // Remove from all workspace sessions
      for (const [workspaceId, users] of workspaceSessions.entries()) {
        if (users.has(socket.user._id.toString())) {
          users.delete(socket.user._id.toString());
          
          // Notify others in workspace
          socket.to(`workspace_${workspaceId}`).emit('user-left', {
            userId: socket.user._id,
            userName: socket.user.name,
            userEmail: socket.user.email
          });
          
          // Clean up empty workspace sessions
          if (users.size === 0) {
            workspaceSessions.delete(workspaceId);
          }
        }
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.user.email}:`, error);
    });
  });

  // Helper functions for external use
  io.getConnectedUsers = () => {
    return Array.from(connectedUsers.values()).map(user => ({
      userId: user.user._id,
      userName: user.user.name,
      userEmail: user.user.email,
      socketId: user.socketId,
      connectedAt: user.connectedAt
    }));
  };

  io.getWorkspaceUsers = (workspaceId) => {
    const users = workspaceSessions.get(workspaceId);
    if (!users) return [];
    
    return Array.from(users).map(userId => {
      const user = connectedUsers.get(userId);
      return user ? {
        userId: user.user._id,
        userName: user.user.name,
        userEmail: user.user.email,
        socketId: user.socketId,
        connectedAt: user.connectedAt
      } : null;
    }).filter(Boolean);
  };

  io.broadcastToWorkspace = (workspaceId, event, data) => {
    io.to(`workspace_${workspaceId}`).emit(event, {
      ...data,
      timestamp: new Date()
    });
  };

  io.broadcastToUser = (userId, event, data) => {
    io.to(`user_${userId}`).emit(event, {
      ...data,
      timestamp: new Date()
    });
  };

  // Additional helper functions
  io.getUserStatus = (userId) => {
    const user = connectedUsers.get(userId.toString());
    return user ? {
      isConnected: true,
      socketId: user.socketId,
      connectedAt: user.connectedAt,
      user: {
        id: user.user._id,
        name: user.user.name,
        email: user.user.email
      }
    } : {
      isConnected: false
    };
  };

  io.getActiveWorkspaces = () => {
    return Array.from(workspaceSessions.entries()).map(([workspaceId, users]) => ({
      workspaceId,
      activeUsers: users.size,
      users: Array.from(users).map(userId => {
        const user = connectedUsers.get(userId);
        return user ? {
          id: user.user._id,
          name: user.user.name,
          email: user.user.email
        } : null;
      }).filter(Boolean)
    }));
  };

  io.sendSystemNotification = (userId, type, message, payload = {}) => {
    io.to(`user_${userId}`).emit('system-notification', {
      type,
      message,
      payload,
      timestamp: new Date()
    });
  };

  io.disconnectUser = (userId) => {
    const user = connectedUsers.get(userId.toString());
    if (user) {
      // Find and disconnect the socket
      const socket = io.sockets.sockets.get(user.socketId);
      if (socket) {
        socket.disconnect();
      }
    }
  };

  console.log('Socket.IO server initialized');
};

module.exports = socketHandler;
