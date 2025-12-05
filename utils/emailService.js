const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // Use environment variables for email configuration
  // For Gmail, you can use an App Password
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Send welcome email
const sendWelcomeEmail = async (userData) => {
  try {
    // Only send email if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('⚠️  Email not sent: SMTP credentials not configured');
      return { success: false, message: 'SMTP not configured' };
    }

    const transporter = createTransporter();

    // Role-specific welcome messages
    const roleMessages = {
      admin: {
        subject: 'Welcome to BMS - Admin Account Created',
        message: `
          <h2>Welcome to the School Management System!</h2>
          <p>Dear ${userData.first_name || 'Admin'},</p>
          <p>Your admin account has been successfully created. You now have full access to manage the school management system.</p>
          <p><strong>Your Account Details:</strong></p>
          <ul>
            <li>Email: ${userData.email}</li>
            <li>Role: Administrator</li>
          </ul>
          <p>You can now log in to the system and start managing the platform.</p>
          <p>Best regards,<br>BMS Team</p>
        `,
      },
      staff: {
        subject: 'Welcome to BMS - Staff Account Created',
        message: `
          <h2>Welcome to the School Management System!</h2>
          <p>Dear ${userData.first_name || 'Staff Member'},</p>
          <p>Your staff account has been successfully created. You can now access the school management system.</p>
          <p><strong>Your Account Details:</strong></p>
          <ul>
            <li>Email: ${userData.email}</li>
            <li>Role: Staff</li>
          </ul>
          <p>You can now log in to the system and start using the platform.</p>
          <p>Best regards,<br>BMS Team</p>
        `,
      },
      student: {
        subject: 'Welcome to BMS - Student Account Created',
        message: `
          <h2>Welcome to the School Management System!</h2>
          <p>Dear ${userData.first_name || 'Student'},</p>
          <p>Your student account has been successfully created. You can now access the school management system.</p>
          <p><strong>Your Account Details:</strong></p>
          <ul>
            <li>Email: ${userData.email}</li>
            <li>Role: Student</li>
          </ul>
          <p>You can now log in to the system and start exploring the platform.</p>
          <p>Best regards,<br>BMS Team</p>
        `,
      },
    };

    const roleConfig = roleMessages[userData.role?.toLowerCase()] || roleMessages.student;

    const mailOptions = {
      from: `"BMS System" <${process.env.SMTP_USER}>`,
      to: userData.email,
      subject: roleConfig.subject,
      html: roleConfig.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${userData.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    // Don't throw error, just log it - registration should still succeed
    return { success: false, error: error.message };
  }
};

// Send enrollment credentials email
const sendEnrollmentCredentials = async (userData, password, role) => {
  try {
    // Only send email if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('⚠️  Email not sent: SMTP credentials not configured');
      return { success: false, message: 'SMTP not configured' };
    }

    const transporter = createTransporter();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const loginUrl = `${frontendUrl}/login`;

    // Role-specific email templates
    const roleConfigs = {
      student: {
        subject: 'Welcome to School Management System - Your Student Account Credentials',
        roleName: 'Student',
      },
      teacher: {
        subject: 'Welcome to School Management System - Your Teacher Account Credentials',
        roleName: 'Teacher',
      },
    };

    const config = roleConfigs[role?.toLowerCase()] || roleConfigs.student;
    const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'User';

    const htmlMessage = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .credentials { background-color: white; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to School Management System</h1>
          </div>
          <div class="content">
            <p>Hello ${fullName},</p>
            <p>Your ${config.roleName} account has been successfully created. Below are your login credentials:</p>
            
            <div class="credentials">
              <p><strong>Username/Email:</strong> ${userData.email}</p>
              <p><strong>Password:</strong> <code style="background-color: #f0f0f0; padding: 5px 10px; border-radius: 3px; font-size: 14px;">${password}</code></p>
            </div>

            <div class="warning">
              <p><strong>⚠️ Important:</strong> Please change your password after your first login for security purposes.</p>
            </div>

            <p style="text-align: center;">
              <a href="${loginUrl}" class="button">Login to Your Account</a>
            </p>

            <p>If you have any questions or need assistance, please contact the administration.</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} School Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"School Management System" <${process.env.SMTP_USER}>`,
      to: userData.email,
      subject: config.subject,
      html: htmlMessage,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Enrollment credentials email sent to ${userData.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending enrollment credentials email:', error.message);
    // Don't throw error, just log it - enrollment should still succeed
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendEnrollmentCredentials,
};

