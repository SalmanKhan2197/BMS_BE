// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: {
        message: errors[0] || 'Validation error',
        code: 'VALIDATION_ERROR',
        details: errors,
      },
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Email already exists',
        code: 'DUPLICATE_EMAIL',
      },
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
      code: err.code || 'SERVER_ERROR',
    },
  });
};

module.exports = errorHandler;

