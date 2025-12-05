const dotenv = require('dotenv');
const { connectDB } = require('../config/database');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const createTestUser = async () => {
  try {
    // Connect to MySQL
    await connectDB();
    console.log('Connected to MySQL');

    // Check if user already exists
    const existingUser = await User.findByEmail('admin@school.com');
    
    if (existingUser) {
      console.log('Test user already exists');
      process.exit(0);
      return;
    }

    // Create test user
    const user = await User.create({
      email: 'admin@school.com',
      password: 'admin123', // Will be hashed automatically
      role: 'admin',
      first_name: 'Admin',
      last_name: 'User',
    });

    console.log('✅ Test user created successfully!');
    console.log('Email: admin@school.com');
    console.log('Password: admin123');
    console.log(`User ID: ${user.id}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    process.exit(1);
  }
};

createTestUser();
