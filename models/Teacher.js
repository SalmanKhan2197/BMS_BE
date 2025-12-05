const { getPool } = require('../config/database');

class Teacher {
  constructor(data) {
    this.id = data.id;
    this.teacher_id = data.teacher_id;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.email = data.email;
    this.phone = data.phone;
    this.date_of_birth = data.date_of_birth;
    this.gender = data.gender;
    this.subject = data.subject;
    this.qualification = data.qualification;
    this.experience_years = data.experience_years;
    this.address = data.address;
    this.emergency_contact = data.emergency_contact;
    this.joining_date = data.joining_date;
    this.salary = data.salary;
    this.status = data.status || 'Active';
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Generate unique teacher ID
  static async generateTeacherId() {
    try {
      const pool = getPool();
      const [rows] = await pool.execute(
        'SELECT teacher_id FROM teachers ORDER BY id DESC LIMIT 1'
      );

      if (rows.length === 0) {
        return 'TCH000001';
      }

      const lastId = rows[0].teacher_id;
      const number = parseInt(lastId.replace('TCH', '')) + 1;
      return `TCH${String(number).padStart(6, '0')}`;
    } catch (error) {
      throw error;
    }
  }

  // Find teacher by email
  static async findByEmail(email) {
    try {
      const pool = getPool();
      const [rows] = await pool.execute(
        'SELECT * FROM teachers WHERE email = ?',
        [email.toLowerCase().trim()]
      );

      if (rows.length === 0) {
        return null;
      }

      return new Teacher(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find teacher by ID
  static async findById(id) {
    try {
      const pool = getPool();
      const [rows] = await pool.execute(
        'SELECT * FROM teachers WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        return null;
      }

      return new Teacher(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Create new teacher
  static async create(teacherData) {
    try {
      const pool = getPool();
      const teacherId = await Teacher.generateTeacherId();

      const [result] = await pool.execute(
        `INSERT INTO teachers (
          teacher_id, first_name, last_name, email, phone, date_of_birth,
          gender, subject, qualification, experience_years, address,
          emergency_contact, joining_date, salary, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          teacherId,
          teacherData.first_name,
          teacherData.last_name,
          teacherData.email.toLowerCase().trim(),
          teacherData.phone,
          teacherData.date_of_birth,
          teacherData.gender,
          teacherData.subject,
          teacherData.qualification,
          teacherData.experience_years,
          teacherData.address,
          teacherData.emergency_contact,
          teacherData.joining_date || new Date().toISOString().split('T')[0],
          teacherData.salary,
          teacherData.status || 'Active',
        ]
      );

      return await Teacher.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      teacher_id: this.teacher_id,
      first_name: this.first_name,
      last_name: this.last_name,
      email: this.email,
      phone: this.phone,
      date_of_birth: this.date_of_birth,
      gender: this.gender,
      subject: this.subject,
      qualification: this.qualification,
      experience_years: this.experience_years,
      address: this.address,
      emergency_contact: this.emergency_contact,
      joining_date: this.joining_date,
      salary: this.salary,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Teacher;

