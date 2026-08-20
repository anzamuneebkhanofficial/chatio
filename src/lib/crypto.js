import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey() {
  const secret = process.env.OWNER_SESSION_SECRET || process.env.MONGODB_URI || 'chatio-by-anza-secret-key-32bytes';
  return crypto.createHash('sha256').update(secret).digest();
}

/** Password Hashing via bcryptjs */
export function hashPassword(password) {
  if (!password) return '';
  return bcrypt.hashSync(password, 10);
}

/** Password Verification via bcryptjs */
export function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;
  try {
    if (storedHash.startsWith('$2')) {
      return bcrypt.compareSync(password, storedHash);
    }
    // Fallback for legacy hashes
    const legacy = crypto.pbkdf2Sync(password, 'smart_switch_user_salt', 10000, 64, 'sha512').toString('hex');
    return legacy === storedHash;
  } catch {
    return false;
  }
}

/** Encrypt sensitive API Keys at rest (AES-256-GCM) */
export function encryptText(text) {
  if (!text) return '';
  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch {
    return text;
  }
}

/** Decrypt sensitive API Keys (AES-256-GCM) */
export function decryptText(encryptedString) {
  if (!encryptedString || !encryptedString.includes(':')) return encryptedString || '';
  try {
    const [ivHex, authTagHex, encrypted] = encryptedString.split(':');
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
  } catch {
    return encryptedString;
  }
}

/** Mask API key for UI preview */
export function maskKey(key) {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

/** Validate standard email format */
export function isValidEmail(email) {
  return Boolean(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase().trim()));
}
