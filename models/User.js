const { getPool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.phone_number = data.phone_number;
    this.avatar_url = data.avatar_url;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const pool = getPool();
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email.toLowerCase().trim()]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return new User(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const pool = getPool();
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return new User(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Create new user
  static async create(userData) {
    try {
      const pool = getPool();
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const [result] = await pool.execute(
        `INSERT INTO users (email, password, role, first_name, last_name, phone_number, avatar_url, isActive)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userData.email.toLowerCase().trim(),
          hashedPassword,
          userData.role || 'student',
          userData.first_name || null,
          userData.last_name || null,
          userData.phone_number || null,
          userData.avatar_url || null,
          userData.isActive !== undefined ? userData.isActive : true,
        ]
      );
      
      return await User.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Compare password
  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  // Convert to JSON (exclude password)
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      profile: {
        first_name: this.first_name,
        last_name: this.last_name,
        phone_number: this.phone_number,
        role: this.role,
        avatar_url: this.avatar_url,
      },
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Get user data for response (without password)
  toResponse() {
    return {
      user: {
        id: this.id.toString(),
        email: this.email,
        role: this.role,
      },
      profile: {
        first_name: this.first_name || null,
        last_name: this.last_name || null,
        phone_number: this.phone_number || null,
        role: this.role,
        avatar_url: this.avatar_url || null,
      },
    };
  }
}

module.exports = User;
