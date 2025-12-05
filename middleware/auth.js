const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware t
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'No token provided, authorization denied',
          code: 'NO_TOKEN',
        },
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User not found or inactive',
          code: 'USER_NOT_FOUND',
        },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token',
          code: 'INVALID_TOKEN',
        },
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token expired',
          code: 'TOKEN_EXPIRED',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Server error during authentication',
        code: 'AUTH_ERROR',
      },
    });
  }
};

module.exports = {
  authenticate,
};

