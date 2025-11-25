/**
 * Generate bcrypt password hash
 *
 * Usage:
 *   node scripts/generate-password-hash.js "Password123!"
 */

const password = process.argv[2] || 'Password123!';

// Generate hash using Node's crypto (since bcrypt might not be available)
// This is a placeholder - in production, use bcrypt
const crypto = require('crypto');

// Simple hash for demonstration (NOT SECURE - use bcrypt in production)
const hash = crypto.pbkdf2Sync(password, 'salt', 100000, 64, 'sha512').toString('hex');

console.log('Password:', password);
console.log('Hash:', hash);
console.log('');
console.log('Note: This is a PBKDF2 hash. For production, use bcrypt.');
console.log('To generate bcrypt hash:');
console.log('  npm install bcrypt');
console.log('  node -e "require(\'bcrypt\').hash(\'Password123!\', 10).then(console.log)"');
