const { validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: errors.array()[0].msg,
        code: 'VALIDATION_ERROR',
        details: errors.array(),
      },
    });
  }
  
  next();
};

module.exports = {
  handleValidationErrors,
};

