const crypto = require('crypto');

// Replace 'your-secret-key-here' with your actual secret key
const secretKey = Buffer.from(process.env.SECRET_ENCRYPT_SESSION_KEY, 'hex');

// Fixed initialization vector (IV) for AES-256-CBC
const IV = Buffer.from('0123456789abcdef0123456789abcdef', 'hex');

// Function to encrypt session ID
function encryptSessionId(sessionId) {
  const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, IV); // Use AES-256 in CBC mode
  let encrypted = cipher.update(sessionId.toString(), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Function to decrypt session ID
function decryptSessionId(encryptedSessionId) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, IV);
  let decrypted = decipher.update(encryptedSessionId, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { encryptSessionId, decryptSessionId };