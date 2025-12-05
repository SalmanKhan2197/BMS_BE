const crypto = require('crypto');

/**
 * Generate a secure random password
 * @param {number} length - Password length (default: 12)
 * @returns {string} Generated password
 */
const generatePassword = (length = 12) => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + special;

  // Ensure at least one character from each type
  let password = '';
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += special[crypto.randomInt(0, special.length)];

  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(0, allChars.length)];
  }

  // Shuffle the password to avoid predictable pattern
  return password
    .split('')
    .sort(() => crypto.randomInt(0, 2) - 1)
    .join('');
};

/**
 * Generate username from email or name
 * @param {string} email - User email
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} Generated username
 */
const generateUsername = (email, firstName = '', lastName = '') => {
  // Extract email prefix (part before @)
  const emailPrefix = email.split('@')[0];

  // If email prefix is reasonable length (<= 30 chars), use it
  if (emailPrefix.length <= 30) {
    return emailPrefix;
  }

  // Otherwise, use firstname.lastname format
  const nameUsername = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z0-9.]/g, '');
  
  // If name username is too short or empty, use email prefix truncated
  if (nameUsername.length < 3) {
    return emailPrefix.substring(0, 30);
  }

  return nameUsername.substring(0, 30);
};

module.exports = {
  generatePassword,
  generateUsername,
};

