# BMS Backend API

Backend API for School Management System built with Node.js, Express, and MySQL.

## Features

- User authentication with JWT
- MySQL database integration
- Password hashing with bcrypt
- Input validation with express-validator
- Error handling middleware
- CORS support
- Automatic database table creation

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher, or MariaDB)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

3. Update the `.env` file with your MySQL configuration:
```env
# MySQL Database
DB_HOST=localhost
DB_NAME=school_management#
DB_USER=root
DB_PASSWORD=your_password
DB_PORT=3306

# JWT
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

4. Create the database (if it doesn't exist):
```sql
CREATE DATABASE IF NOT EXISTS `school_management#` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or use the provided SQL file:
```bash
mysql -u root -p < database/schema.sql
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in `.env`).

**Note:** The database tables will be created automatically on first connection if they don't exist.

## API Endpoints

### POST /api/auth/login

Login endpoint for user authentication.

**Request:**
```json
{
  "email": "admin@school.com",
  "password": "admin123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "admin@school.com",
      "role": "admin"
    },
    "profile": {
      "first_name": "Admin",
      "last_name": "User",
      "role": "admin",
      "avatar_url": null
    },
    "token": "jwt-token"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": {
    "message": "Invalid email or password",
    "code": "INVALID_CREDENTIALS"
  }
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'teacher', 'student', 'staff') NOT NULL DEFAULT 'student',
  first_name VARCHAR(255) DEFAULT NULL,
  last_name VARCHAR(255) DEFAULT NULL,
  avatar_url VARCHAR(500) DEFAULT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);
```

## Creating a Test User

Use the provided script to create a test user:

```bash
npm run create-user
```

This will create a user with:
- Email: `admin@school.com`
- Password: `admin123`
- Role: `admin`
- First Name: `Admin`
- Last Name: `User`

Or manually insert using MySQL:

```sql
-- Password is hashed: 'admin123'
INSERT INTO users (email, password, role, first_name, last_name) 
VALUES ('admin@school.com', '$2a$10$...', 'admin', 'Admin', 'User');
```

**Note:** Passwords are automatically hashed using bcrypt when using the User.create() method.

## Project Structure

```
.
├── config/
│   └── database.js          # MySQL connection pool
├── database/
│   └── schema.sql           # Database schema SQL file
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   ├── errorHandler.js      # Global error handler
│   └── validation.js        # Validation error handler
├── models/
│   └── User.js              # User model (MySQL)
├── routes/
│   └── auth.js              # Authentication routes
├── scripts/
│   ├── createTestUser.js   # Script to create test user
│   └── updateMongoConnection.js  # (Legacy - can be removed)
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore file
├── package.json             # Dependencies
├── README.md                # This file
└── server.js                # Main server file
```

## Security Notes

- Passwords are automatically hashed using bcrypt before saving
- JWT tokens are used for authentication
- Passwords are excluded from user responses
- Input validation is performed on all requests
- CORS is configured for security
- SQL injection protection via parameterized queries

## Error Codes

- `VALIDATION_ERROR` - Input validation failed
- `INVALID_CREDENTIALS` - Wrong email or password
- `ACCOUNT_DEACTIVATED` - User account is inactive
- `NO_TOKEN` - No authentication token provided
- `INVALID_TOKEN` - Invalid or malformed token
- `TOKEN_EXPIRED` - Token has expired
- `DUPLICATE_EMAIL` - Email already exists
- `SERVER_ERROR` - Internal server error
- `NOT_FOUND` - Route not found

## Troubleshooting

### MySQL Connection Issues

1. **ECONNREFUSED**: MySQL server is not running
   - Start MySQL service: `net start MySQL80` (Windows) or `sudo systemctl start mysql` (Linux)
   - Check if MySQL is installed and running

2. **ER_ACCESS_DENIED_ERROR**: Wrong username or password
   - Verify `DB_USER` and `DB_PASSWORD` in `.env` file

3. **ER_BAD_DB_ERROR**: Database doesn't exist
   - Create the database: `CREATE DATABASE \`school_management#\`;`
   - Or run: `mysql -u root -p < database/schema.sql`

4. **Port 3306 in use**: Change `DB_PORT` in `.env` if using a different port

## License

ISC
