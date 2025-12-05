const express = require('express');
const { body } = require('express-validator');
const bcrypt = require('bcryptjs');
const { getPool } = require('../config/database');
const { handleValidationErrors } = require('../middleware/validation');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const { generatePassword, generateUsername } = require('../utils/passwordGenerator');
const { sendEnrollmentCredentials } = require('../utils/emailService');

const router = express.Router();

// @route   POST /api/enrollment/student
// @desc    Enroll a new student
// @access  Public (should be protected in production)
router.post(
  '/student',
  [
    body('first_name')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 1, max: 255 })
      .withMessage('First name must be between 1 and 255 characters'),
    body('last_name')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ min: 1, max: 255 })
      .withMessage('Last name must be between 1 and 255 characters'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('date_of_birth')
      .isISO8601()
      .withMessage('Please provide a valid date of birth (YYYY-MM-DD)'),
    body('gender')
      .trim()
      .notEmpty()
      .withMessage('Gender is required'),
    body('grade')
      .trim()
      .notEmpty()
      .withMessage('Grade is required'),
    body('contact_number')
      .optional()
      .trim()
      .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
      .withMessage('Please provide a valid contact number'),
    body('address')
      .optional()
      .trim(),
    body('enrollment_date')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid enrollment date (YYYY-MM-DD)'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const connection = await getPool().getConnection();
    
    try {
      await connection.beginTransaction();

      const {
        first_name,
        last_name,
        email,
        date_of_birth,
        gender,
        grade,
        contact_number,
        address,
        enrollment_date,
      } = req.body;

      // Check if student with this email already exists
      const existingStudent = await Student.findByEmail(email);
      if (existingStudent) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          error: {
            message: 'Student with this email already exists',
            code: 'EMAIL_EXISTS',
          },
        });
      }

      // Check if user account with this email already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          error: {
            message: 'User account with this email already exists',
            code: 'USER_EXISTS',
          },
        });
      }

      // Generate credentials
      const password = generatePassword(12);
      const username = generateUsername(email, first_name, last_name);
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate student ID
      const studentId = await Student.generateStudentId();
      
      // Create student record using the same connection
      const enrollmentDate = enrollment_date || new Date().toISOString().split('T')[0];
      
      const [studentResult] = await connection.execute(
        `INSERT INTO students (
          student_id, first_name, last_name, email, date_of_birth, 
          gender, grade, contact_number, address, enrollment_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          studentId,
          first_name,
          last_name,
          email.toLowerCase().trim(),
          date_of_birth,
          gender,
          grade,
          contact_number || null,
          address || null,
          enrollmentDate,
          'Active',
        ]
      );
      
      // Fetch the created student using the same connection
      const [studentRows] = await connection.execute(
        'SELECT * FROM students WHERE id = ?',
        [studentResult.insertId]
      );
      const student = new Student(studentRows[0]);

      // Create user account using the same connection
      const [userResult] = await connection.execute(
        `INSERT INTO users (email, password, role, first_name, last_name, phone_number, isActive)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          email.toLowerCase().trim(),
          hashedPassword,
          'student',
          first_name,
          last_name,
          contact_number || null,
          true,
        ]
      );
      const user = await User.findById(userResult.insertId);

      // Link user to student in user_profiles
      await connection.execute(
        'INSERT INTO user_profiles (user_id, student_id) VALUES (?, ?)',
        [user.id, student.id]
      );

      await connection.commit();

      // Send enrollment email (async, don't wait)
      sendEnrollmentCredentials(
        {
          email: student.email,
          first_name: student.first_name,
          last_name: student.last_name,
        },
        password,
        'student'
      ).catch((emailError) => {
        console.error('Failed to send enrollment email:', emailError);
      });

      res.status(201).json({
        success: true,
        message: 'Student enrolled successfully. Login credentials have been sent to their email.',
        data: {
          student: student.toJSON(),
        },
      });
    } catch (error) {
      await connection.rollback();
      console.error('Student enrollment error:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          error: {
            message: 'Student with this email or student ID already exists',
            code: 'DUPLICATE_ENTRY',
          },
        });
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error during student enrollment',
          code: 'INTERNAL_ERROR',
        },
      });
    } finally {
      connection.release();
    }
  }
);

// @route   POST /api/enrollment/teacher
// @desc    Enroll a new teacher
// @access  Public (should be protected in production)
router.post(
  '/teacher',
  [
    body('first_name')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 1, max: 255 })
      .withMessage('First name must be between 1 and 255 characters'),
    body('last_name')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ min: 1, max: 255 })
      .withMessage('Last name must be between 1 and 255 characters'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('phone')
      .optional()
      .trim()
      .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
      .withMessage('Please provide a valid phone number'),
    body('date_of_birth')
      .isISO8601()
      .withMessage('Please provide a valid date of birth (YYYY-MM-DD)'),
    body('gender')
      .trim()
      .notEmpty()
      .withMessage('Gender is required'),
    body('subject')
      .trim()
      .notEmpty()
      .withMessage('Subject is required'),
    body('qualification')
      .optional()
      .trim(),
    body('experience_years')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Experience years must be a non-negative integer'),
    body('address')
      .optional()
      .trim(),
    body('emergency_contact')
      .optional()
      .trim(),
    body('joining_date')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid joining date (YYYY-MM-DD)'),
    body('salary')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Salary must be a non-negative number'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const connection = await getPool().getConnection();
    
    try {
      await connection.beginTransaction();

      const {
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        gender,
        subject,
        qualification,
        experience_years,
        address,
        emergency_contact,
        joining_date,
        salary,
      } = req.body;

      // Check if teacher with this email already exists
      const existingTeacher = await Teacher.findByEmail(email);
      if (existingTeacher) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          error: {
            message: 'Teacher with this email already exists',
            code: 'EMAIL_EXISTS',
          },
        });
      }

      // Check if user account with this email already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          error: {
            message: 'User account with this email already exists',
            code: 'USER_EXISTS',
          },
        });
      }

      // Generate credentials
      const password = generatePassword(12);
      const username = generateUsername(email, first_name, last_name);
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate teacher ID
      const teacherId = await Teacher.generateTeacherId();
      
      // Create teacher record using the same connection
      const joiningDate = joining_date || new Date().toISOString().split('T')[0];
      
      const [teacherResult] = await connection.execute(
        `INSERT INTO teachers (
          teacher_id, first_name, last_name, email, phone, date_of_birth,
          gender, subject, qualification, experience_years, address,
          emergency_contact, joining_date, salary, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          teacherId,
          first_name,
          last_name,
          email.toLowerCase().trim(),
          phone || null,
          date_of_birth,
          gender,
          subject,
          qualification || null,
          experience_years || 0,
          address || null,
          emergency_contact || null,
          joiningDate,
          salary || null,
          'Active',
        ]
      );
      
      // Fetch the created teacher using the same connection
      const [teacherRows] = await connection.execute(
        'SELECT * FROM teachers WHERE id = ?',
        [teacherResult.insertId]
      );
      const teacher = new Teacher(teacherRows[0]);

      // Create user account using the same connection
      const [userResult] = await connection.execute(
        `INSERT INTO users (email, password, role, first_name, last_name, phone_number, isActive)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          email.toLowerCase().trim(),
          hashedPassword,
          'teacher',
          first_name,
          last_name,
          phone || null,
          true,
        ]
      );
      const user = await User.findById(userResult.insertId);

      // Link user to teacher in user_profiles
      await connection.execute(
        'INSERT INTO user_profiles (user_id, teacher_id) VALUES (?, ?)',
        [user.id, teacher.id]
      );

      await connection.commit();

      // Send enrollment email (async, don't wait)
      sendEnrollmentCredentials(
        {
          email: teacher.email,
          first_name: teacher.first_name,
          last_name: teacher.last_name,
        },
        password,
        'teacher'
      ).catch((emailError) => {
        console.error('Failed to send enrollment email:', emailError);
      });

      res.status(201).json({
        success: true,
        message: 'Teacher enrolled successfully. Login credentials have been sent to their email.',
        data: {
          teacher: teacher.toJSON(),
        },
      });
    } catch (error) {
      await connection.rollback();
      console.error('Teacher enrollment error:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          error: {
            message: 'Teacher with this email or teacher ID already exists',
            code: 'DUPLICATE_ENTRY',
          },
        });
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error during teacher enrollment',
          code: 'INTERNAL_ERROR',
        },
      });
    } finally {
      connection.release();
    }
  }
);

module.exports = router;

