const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.cookies.token || req.headers.authorization?.startsWith('Bearer')) {
    try {
      // Get token from cookie or header
      token = req.cookies.token || req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized, no token provided'
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if user is active
      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Account is deactivated'
        });
      }

      // Update last login time
      req.user.lastLogin = new Date();
      await req.user.save();

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }
      
      return res.status(401).json({
        success: false,
        error: 'Not authorized, token failed'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token'
    });
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.subscription.plan)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this resource'
      });
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.cookies.token || req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.cookies.token || req.headers.authorization.split(' ')[1];

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        
        if (req.user && req.user.isActive) {
          req.user.lastLogin = new Date();
          await req.user.save();
        }
      }
    } catch (error) {
      // Ignore errors for optional auth
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
};

// Workspace ownership verification
const verifyWorkspaceAccess = async (req, res, next) => {
  try {
    const Workspace = require('../models/Workspace');
    const workspaceId = req.params.workspaceId || req.body.workspaceId;
    
    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        error: 'Workspace ID is required'
      });
    }

    const workspace = await Workspace.findById(workspaceId);
    
    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Workspace not found'
      });
    }

    // Check if user is owner or collaborator
    const isOwner = workspace.userId.toString() === req.user._id.toString();
    const isCollaborator = workspace.collaborators.some(
      collab => collab.userId.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this workspace'
      });
    }

    req.workspace = workspace;
    req.isWorkspaceOwner = isOwner;
    
    next();
  } catch (error) {
    console.error('Workspace access verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Rate limiting for API endpoints
const createRateLimit = (windowMs, max, message) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip + (req.user ? `_${req.user._id}` : '');
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [ip, data] of requests.entries()) {
      if (data.timestamp < windowStart) {
        requests.delete(ip);
      }
    }

    const requestData = requests.get(key);

    if (!requestData) {
      requests.set(key, { count: 1, timestamp: now });
      return next();
    }

    if (requestData.count >= max) {
      return res.status(429).json({
        success: false,
        error: message || 'Too many requests, please try again later'
      });
    }

    requestData.count++;
    next();
  };
};

// AI usage tracking
const trackAIUsage = async (req, res, next) => {
  try {
    if (req.user && req.path.startsWith('/ai/')) {
      // Update user's AI usage
      req.user.usage.totalTokens += 1;
      req.user.usage.monthlyTokens += 1;
      await req.user.save();
    }
    next();
  } catch (error) {
    console.error('AI usage tracking error:', error);
    next(); // Don't block the request
  }
};

module.exports = { 
  protect, 
  authorize, 
  optionalAuth, 
  verifyWorkspaceAccess,
  createRateLimit,
  trackAIUsage
};
