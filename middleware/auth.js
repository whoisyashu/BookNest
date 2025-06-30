const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

// Protect routes - verify oken
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    throw new UnauthorizedError('Not authorized to access this route');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      sellerId: decoded.sellerId,
      buyerId: decoded.buyerId
    };
    
    next();
  } catch (error) {
    throw new UnauthorizedError('Not authorized to access this route');
  }
});

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }
    
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(`User role ${req.user.role} is not authorized to access this route`);
    }
    
    next();
  };
};

// Optional authentication - doesn't throw error if no token
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        sellerId: decoded.sellerId,
        buyerId: decoded.buyerId
      };
    } catch (error) {
      // Token is invalid, but we don't throw error for optional auth
    }
  }
  
  next();
});

module.exports = {
  protect,
  authorize,
  optionalAuth
}; 