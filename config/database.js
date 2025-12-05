const mysql = require('mysql2/promise');

let pool = null;



const connectDB = async () => {
  try {
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
      console.error('❌ Error: Database configuration is missing in .env file');
      console.error('Please set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, and DB_PORT in .env');
      process.exit(1);
    }

    // Create connection pool
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management#',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log(`✅ MySQL Connected: ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    connection.release();

    // Initialize database tables if they don't exist
    await initializeTables();
  } catch (error) {
    console.error(`❌ MySQL Connection Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 MySQL server is not running. Please start MySQL:');
      console.error('   Option 1: Start MySQL service: net start MySQL80 (or MySQL)');
      console.error('   Option 2: Check if MySQL is installed and running');
      console.error('   Option 3: Verify DB_HOST, DB_PORT in .env file');
    }
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Access denied. Check your DB_USER and DB_PASSWORD in .env file');
    }

    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`\n💡 Database "${process.env.DB_NAME}" does not exist. Please create it first.`);
    }
    
    process.exit(1);
  }
};

// Initialize database tables
const initializeTables = async () => {
  try {
    // Create users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'teacher', 'student', 'staff') NOT NULL DEFAULT 'student',
        first_name VARCHAR(255) DEFAULT NULL,
        last_name VARCHAR(255) DEFAULT NULL,
        phone_number VARCHAR(20) DEFAULT NULL,
        avatar_url VARCHAR(500) DEFAULT NULL,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Add phone_number column if it doesn't exist (for existing databases)
    try {
      const [columns] = await pool.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'phone_number'
      `, [process.env.DB_NAME]);
      
      if (columns.length === 0) {
        await pool.execute(`
          ALTER TABLE users 
          ADD COLUMN phone_number VARCHAR(20) DEFAULT NULL
        `);
        console.log('✅ Added phone_number column to users table');
      }
    } catch (error) {
      // Column might already exist, ignore error
      if (!error.message.includes('Duplicate column name')) {
        console.warn('Warning: Could not add phone_number column:', error.message);
      }
    }
    
    // Create students table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(20) NOT NULL UNIQUE,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        date_of_birth DATE NOT NULL,
        gender VARCHAR(50) NOT NULL,
        grade VARCHAR(50) NOT NULL,
        contact_number VARCHAR(20) DEFAULT NULL,
        address TEXT DEFAULT NULL,
        enrollment_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'Active',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_student_id (student_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create teachers table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id VARCHAR(20) NOT NULL UNIQUE,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20) DEFAULT NULL,
        date_of_birth DATE NOT NULL,
        gender VARCHAR(50) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        qualification TEXT DEFAULT NULL,
        experience_years INT DEFAULT 0,
        address TEXT DEFAULT NULL,
        emergency_contact VARCHAR(20) DEFAULT NULL,
        joining_date DATE NOT NULL,
        salary DECIMAL(10, 2) DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'Active',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_teacher_id (teacher_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create user_profiles table (links users to students/teachers)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        student_id INT DEFAULT NULL,
        teacher_id INT DEFAULT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_student_id (student_id),
        INDEX idx_teacher_id (teacher_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Error initializing tables:', error.message);
    throw error;
  }
};

// Get database pool
const getPool = () => {
  if (!pool) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return pool;
};

module.exports = { connectDB, getPool };
