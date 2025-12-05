# API cURL Commands

Base URL: `http://localhost:5000` (or your configured port)

## 1. Health Check

### GET /api/health
Check if the server is running.

```bash
curl -X GET http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 2. User Registration

### POST /api/auth/register
Register a new user account.

**Basic Registration (Student):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"student@school.com\", \"password\": \"password123\", \"first_name\": \"John\", \"last_name\": \"Doe\"}"
```

**Registration with Role (Admin):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"admin@school.com\", \"password\": \"password123\", \"first_name\": \"Jane\", \"last_name\": \"Smith\", \"role\": \"admin\"}"
```

**Registration with Role (Staff):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"staff@school.com\", \"password\": \"password123\", \"first_name\": \"Bob\", \"last_name\": \"Wilson\", \"role\": \"staff\"}"
```

**Full Registration (All Fields including Phone Number):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"user@school.com\", \"password\": \"password123\", \"first_name\": \"Alice\", \"last_name\": \"Johnson\", \"phone_number\": \"+1234567890\", \"role\": \"student\", \"avatar_url\": \"https://example.com/avatar.jpg\"}"
```

**Registration with Phone Number:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"student2@school.com\", \"password\": \"password123\", \"first_name\": \"Mike\", \"last_name\": \"Davis\", \"phone_number\": \"+1-555-123-4567\"}"
```

**Expected Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "2",
      "email": "student@school.com",
      "role": "student"
    },
    "profile": {
      "first_name": "John",
      "last_name": "Doe",
      "phone_number": "+1234567890",
      "role": "student",
      "avatar_url": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Note:** A welcome email will be automatically sent to users with roles: `admin`, `staff`, or `student` upon successful registration.

**Expected Error Response (400) - Duplicate Email:**
```json
{
  "success": false,
  "error": {
    "message": "Email already exists",
    "code": "DUPLICATE_EMAIL"
  }
}
```

**Expected Error Response (400) - Validation Error:**
```json
{
  "success": false,
  "error": {
    "message": "Password must be at least 6 characters long",
    "code": "VALIDATION_ERROR"
  }
}
```

**Request Body Fields:**
- `email` (required): Valid email address
- `password` (required): Minimum 6 characters
- `first_name` (optional): User's first name
- `last_name` (optional): User's last name
- `phone_number` (optional): Valid phone number (e.g., +1234567890, (555) 123-4567)
- `role` (optional): One of `admin`, `staff`, `student` (defaults to `student`)
  - **Note:** Welcome emails are automatically sent for `admin`, `staff`, and `student` roles
- `avatar_url` (optional): URL to user's avatar image

---

## 3. User Login

### POST /api/auth/login
Authenticate a user and receive a JWT token.

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"admin@school.com\", \"password\": \"admin123\"}"
```

**Expected Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@school.com",
    "role": "admin",
    "first_name": "Admin",
    "last_name": "User",
    "avatar_url": null,
    "isActive": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Expected Error Response (401):**
```json
{
  "success": false,
  "error": {
    "message": "Invalid email or password",
    "code": "INVALID_CREDENTIALS"
  }
}
```

**With Pretty Print (jq):**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"admin@school.com\", \"password\": \"admin123\"}" \
  | jq
```

**Save Token to Variable (PowerShell):**
```powershell
$response = curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\": \"admin@school.com\", \"password\": \"admin123\"}' | ConvertFrom-Json
$token = $response.data.token
```

**Save Token to Variable (Bash/Linux):**
```bash
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@school.com", "password": "admin123"}' \
  | jq -r '.data.token')
echo $TOKEN
```

---

## 4. Student Enrollment

### POST /api/enrollment/student
Enroll a new student with automatic account creation and credential generation.

```bash
curl -X POST http://localhost:5000/api/enrollment/student \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Raj",
    "last_name": "Kumar",
    "email": "raj.kumar@example.com",
    "date_of_birth": "2010-05-15",
    "gender": "Male",
    "grade": "10th",
    "contact_number": "9876543210",
    "address": "123 Main Street, Mumbai",
    "enrollment_date": "2024-01-15"
  }'
```

**Expected Success Response (201):**
```json
{
  "success": true,
  "message": "Student enrolled successfully. Login credentials have been sent to their email.",
  "data": {
    "student": {
      "id": 1,
      "student_id": "STU000001",
      "first_name": "Raj",
      "last_name": "Kumar",
      "email": "raj.kumar@example.com",
      "date_of_birth": "2010-05-15",
      "gender": "Male",
      "grade": "10th",
      "contact_number": "9876543210",
      "address": "123 Main Street, Mumbai",
      "enrollment_date": "2024-01-15",
      "status": "Active"
    }
  }
}
```

**Request Body Fields:**
- `first_name` (required): Student's first name
- `last_name` (required): Student's last name
- `email` (required): Valid email address (must be unique)
- `date_of_birth` (required): Date in YYYY-MM-DD format
- `gender` (required): Student's gender
- `grade` (required): Student's grade/class
- `contact_number` (optional): Contact phone number
- `address` (optional): Student's address
- `enrollment_date` (optional): Enrollment date in YYYY-MM-DD format (defaults to today)

**Note:** 
- A user account is automatically created with role 'student'
- Login credentials (email and auto-generated password) are sent via email
- Student ID is auto-generated in format: STU000001, STU000002, etc.

**Expected Error Response (409) - Email Exists:**
```json
{
  "success": false,
  "error": {
    "message": "Student with this email already exists",
    "code": "EMAIL_EXISTS"
  }
}
```

---

## 5. Teacher Enrollment

### POST /api/enrollment/teacher
Enroll a new teacher with automatic account creation and credential generation.

```bash
curl -X POST http://localhost:5000/api/enrollment/teacher \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Dr. Sunita",
    "last_name": "Verma",
    "email": "sunita.verma@school.com",
    "phone": "9876543210",
    "date_of_birth": "1985-03-15",
    "gender": "Female",
    "subject": "Mathematics",
    "qualification": "Ph.D. in Mathematics",
    "experience_years": 12,
    "address": "123 Teacher'\''s Colony, Mumbai",
    "emergency_contact": "9876543299",
    "joining_date": "2024-01-15",
    "salary": 75000
  }'
```

**Expected Success Response (201):**
```json
{
  "success": true,
  "message": "Teacher enrolled successfully. Login credentials have been sent to their email.",
  "data": {
    "teacher": {
      "id": 1,
      "teacher_id": "TCH000001",
      "first_name": "Dr. Sunita",
      "last_name": "Verma",
      "email": "sunita.verma@school.com",
      "phone": "9876543210",
      "date_of_birth": "1985-03-15",
      "gender": "Female",
      "subject": "Mathematics",
      "qualification": "Ph.D. in Mathematics",
      "experience_years": 12,
      "address": "123 Teacher'\''s Colony, Mumbai",
      "emergency_contact": "9876543299",
      "joining_date": "2024-01-15",
      "salary": 75000,
      "status": "Active"
    }
  }
}
```

**Request Body Fields:**
- `first_name` (required): Teacher's first name
- `last_name` (required): Teacher's last name
- `email` (required): Valid email address (must be unique)
- `phone` (optional): Phone number
- `date_of_birth` (required): Date in YYYY-MM-DD format
- `gender` (required): Teacher's gender
- `subject` (required): Subject taught
- `qualification` (optional): Educational qualifications
- `experience_years` (optional): Years of experience (defaults to 0)
- `address` (optional): Teacher's address
- `emergency_contact` (optional): Emergency contact number
- `joining_date` (optional): Joining date in YYYY-MM-DD format (defaults to today)
- `salary` (optional): Salary amount

**Note:** 
- A user account is automatically created with role 'teacher'
- Login credentials (email and auto-generated password) are sent via email
- Teacher ID is auto-generated in format: TCH000001, TCH000002, etc.

**Expected Error Response (409) - Email Exists:**
```json
{
  "success": false,
  "error": {
    "message": "Teacher with this email already exists",
    "code": "EMAIL_EXISTS"
  }
}
```

**Expected Error Response (422) - Validation Error:**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "errors": [
      {
        "field": "email",
        "message": "Please provide a valid email address"
      }
    ]
  }
}
```

---

## Notes

- Replace `localhost:5000` with your actual server URL and port if different
- Default test user credentials:
  - Email: `admin@school.com`
  - Password: `admin123`
- The JWT token from login can be used for authenticated endpoints (when implemented)
- For Windows PowerShell, use backticks (`) for line continuation instead of backslashes (\)

## Email Configuration

The registration API automatically sends welcome emails to users with roles: `admin`, `staff`, or `student`. To enable email functionality, add the following to your `.env` file:

```env
# SMTP Email Configuration (for welcome emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**For Gmail:**
1. Enable 2-Step Verification on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the generated App Password as `SMTP_PASSWORD`

**Note:** If SMTP is not configured, registration will still succeed, but welcome emails will not be sent (a warning will be logged).

## Enrollment API Features

### Automatic Credential Generation
- **Username**: Generated from email prefix (part before @) or firstname.lastname format
- **Password**: Auto-generated 12-character secure password with:
  - Uppercase letters (A-Z)
  - Lowercase letters (a-z)
  - Numbers (0-9)
  - Special characters (!@#$%^&*)
  - Ensures at least one character from each type

### Email Notifications
- Enrollment credentials are automatically sent via email
- Email includes:
  - Username (email address)
  - Auto-generated password
  - Login link
  - Security reminder to change password on first login
- Email sending is asynchronous and doesn't block enrollment
- If email fails, enrollment still succeeds (credentials can be retrieved by admin)

### Database Operations
- All enrollment operations use database transactions for data consistency
- Student/Teacher records are created in respective tables
- User accounts are automatically created and linked via `user_profiles` table
- All passwords are hashed using bcrypt before storage
- Passwords are NEVER returned in API responses - only sent via email

### Environment Variables for Enrollment
Add to your `.env` file for enrollment emails:
```env
FRONTEND_URL=http://localhost:3000
```
This URL is used in the login link sent via email.

