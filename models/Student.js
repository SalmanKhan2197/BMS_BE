const { getPool } = require('../config/database');

class Student {
  constructor(data) {
    this.id = data.id;
    this.student_id = data.student_id;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.email = data.email;
    this.date_of_birth = data.date_of_birth;
    this.gender = data.gender;
    this.grade = data.grade;
    this.contact_number = data.contact_number;
    this.address = data.address;
    this.enrollment_date = data.enrollment_date;
    this.status = data.status || 'Active';
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Generate unique student ID
  static async generateStudentId() {
    try {
      const pool = getPool();
      const [rows] = await pool.execute(
        'SELECT student_id FROM students ORDER BY id DESC LIMIT 1'
      );

      if (rows.length === 0) {
        return 'STU000001';
      }

      const lastId = rows[0].student_id;
      const number = parseInt(lastId.replace('STU', '')) + 1;
      return `STU${String(number).padStart(6, '0')}`;
    } catch (error) {
      throw error;
    }
  }

  // Find student by email
  static async findByEmail(email) {
    try {
      const pool = getPool();
      const [rows] = await pool.execute(
        'SELECT * FROM students WHERE email = ?',
        [email.toLowerCase().trim()]
      );

      if (rows.length === 0) {
        return null;
      }

      return new Student(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find student by ID
  static async findById(id) {
    try {
      const pool = getPool();
      const [rows] = await pool.execute(
        'SELECT * FROM students WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        return null;
      }

      return new Student(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Create new student
  static async create(studentData) {
    try {
      const pool = getPool();
      const studentId = await Student.generateStudentId();

      const [result] = await pool.execute(
        `INSERT INTO students (
          student_id, first_name, last_name, email, date_of_birth, 
          gender, grade, contact_number, address, enrollment_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          studentId,
          studentData.first_name,
          studentData.last_name,
          studentData.email.toLowerCase().trim(),
          studentData.date_of_birth,
          studentData.gender,
          studentData.grade,
          studentData.contact_number,
          studentData.address,
          studentData.enrollment_date || new Date().toISOString().split('T')[0],
          studentData.status || 'Active',
        ]
      );

      return await Student.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      student_id: this.student_id,
      first_name: this.first_name,
      last_name: this.last_name,
      email: this.email,
      date_of_birth: this.date_of_birth,
      gender: this.gender,
      grade: this.grade,
      contact_number: this.contact_number,
      address: this.address,
      enrollment_date: this.enrollment_date,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Student;

