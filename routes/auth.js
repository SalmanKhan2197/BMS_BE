const express = require('express');
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { handleValidationErrors } = require('../middleware/validation');
const { sendWelcomeEmail } = require('../utils/emailService');

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('first_name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('First name must be between 1 and 255 characters'),
    body('last_name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Last name must be between 1 and 255 characters'),
    body('phone_number')
      .optional()
      .trim()
      .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
      .withMessage('Please provide a valid phone number'),
    body('role')
      .optional()
      .isIn(['admin', 'staff', 'student'])
      .withMessage('Role must be one of: admin, staff, student'),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password, first_name, last_name, phone_number, role, avatar_url } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Email already exists',
            code: 'DUPLICATE_EMAIL',
          },
        });
      }

      // Set default role to student if not provided
      const userRole = role || 'student';

      // Create new user
      const user = await User.create({
        email,
        password,
        first_name,
        last_name,
        phone_number,
        role: userRole,
        avatar_url,
      });

      // Generate JWT token
      const token = generateToken(user.id);

      // Prepare response data
      const responseData = user.toResponse();
      responseData.token = token;

      // Send welcome email for admin, staff, and student roles
      if (['admin', 'staff', 'student'].includes(userRole.toLowerCase())) {
        // Send email asynchronously (don't wait for it)
        sendWelcomeEmail({
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: userRole,
        }).catch((emailError) => {
          console.error('Failed to send welcome email:', emailError);
          // Don't fail registration if email fails
        });
      }

      res.status(201).json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      console.error('Register error:', error);
      
      // Handle duplicate email error from database
      if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Duplicate entry')) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Email already exists',
            code: 'DUPLICATE_EMAIL',
          },
        });
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Server error during registration',
          code: 'SERVER_ERROR',
        },
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 1 })
      .withMessage('Password cannot be empty'),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findByEmail(email);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Invalid email or password',
            code: 'INVALID_CREDENTIALS',
          },
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Account is deactivated',
            code: 'ACCOUNT_DEACTIVATED',
          },
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Invalid email or password',
            code: 'INVALID_CREDENTIALS',
          },
        });
      }

      // Generate JWT token
      const token = generateToken(user.id);

      // Prepare response data
      const responseData = user.toResponse();
      responseData.token = token;

      res.status(200).json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Server error during login',
          code: 'SERVER_ERROR',
        },
      });
    }
  }
);

module.exports = router;

