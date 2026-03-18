const crypto = require('crypto');

/**
 * Generate a secure random password
 * @param {number} length - Length of the password (default: 12)
 * @returns {string} - Generated password
 */
const generatePassword = (length = 12) => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';

    const allChars = uppercase + lowercase + numbers + symbols;

    let password = '';

    
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    
    return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Generate a unique employee ID
 * @param {number} count - Current employee count
 * @returns {string} - Generated employee ID (e.g., EMP001, EMP002)
 */
const generateEmployeeId = (count) => {
    const paddedNumber = String(count + 1).padStart(3, '0');
    return `EMP${paddedNumber}`;
};

module.exports = {
    generatePassword,
    generateEmployeeId
};
