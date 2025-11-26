/**
 * TOTP Secret Encryption Utility
 *
 * Provides AES-256-GCM encryption for TOTP secrets.
 *
 * CRITICAL SECURITY NOTE:
 * TOTP secrets MUST be encrypted, NOT hashed.
 * - Hashing (Argon2, bcrypt, etc.) is one-way and cannot be reversed
 * - TOTP verification REQUIRES the original plaintext secret to compute HMAC
 * - Using hashing for TOTP secrets makes verification mathematically impossible
 *
 * This module uses AES-256-GCM which provides:
 * - Confidentiality: Secret is encrypted and unreadable without the key
 * - Integrity: GCM authentication tag detects tampering
 * - Unique IVs: Each encryption uses a random 12-byte IV
 *
 * Storage Format: `iv:authTag:ciphertext` (all base64-encoded)
 *
 * @module totp-encryption.util
 * @security HIPAA requires encryption of authentication secrets
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * Encryption algorithm configuration
 * AES-256-GCM is the recommended symmetric encryption for sensitive data
 */
const ALGORITHM = 'aes-256-gcm' as const;
const IV_LENGTH = 12; // 96 bits - NIST recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits - maximum security

/**
 * Encrypted secret structure
 */
interface EncryptedSecret {
  /** Base64-encoded initialization vector */
  iv: string;
  /** Base64-encoded authentication tag */
  authTag: string;
  /** Base64-encoded ciphertext */
  ciphertext: string;
}

/**
 * Encrypt a TOTP secret using AES-256-GCM
 *
 * @param secret - Plaintext TOTP secret (base32-encoded string)
 * @param encryptionKey - 32-byte hex-encoded encryption key
 * @returns Encrypted secret in format: `iv:authTag:ciphertext`
 *
 * @throws Error if encryption key is invalid
 *
 * @example
 * const encrypted = encryptTotpSecret('JBSWY3DPEHPK3PXP', process.env.MFA_ENCRYPTION_KEY);
 * // Returns: "base64iv:base64tag:base64ciphertext"
 */
export function encryptTotpSecret(secret: string, encryptionKey: string): string {
  validateEncryptionKey(encryptionKey);

  // Generate a unique IV for this encryption operation
  // IV uniqueness is critical for GCM security
  const iv = randomBytes(IV_LENGTH);
  const key = Buffer.from(encryptionKey, 'hex');

  // Create cipher with AES-256-GCM
  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  // Encrypt the secret
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);

  // Get the authentication tag (integrity verification)
  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:ciphertext (all base64)
  const encryptedSecret: EncryptedSecret = {
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    ciphertext: encrypted.toString('base64'),
  };

  return `${encryptedSecret.iv}:${encryptedSecret.authTag}:${encryptedSecret.ciphertext}`;
}

/**
 * Decrypt a TOTP secret using AES-256-GCM
 *
 * @param encryptedSecret - Encrypted secret in format: `iv:authTag:ciphertext`
 * @param encryptionKey - 32-byte hex-encoded encryption key
 * @returns Plaintext TOTP secret (base32-encoded string)
 *
 * @throws Error if decryption fails (wrong key, tampered data, or invalid format)
 *
 * @security This function will throw if:
 * - The encryption key is incorrect
 * - The encrypted data has been tampered with
 * - The format is invalid
 *
 * @example
 * const secret = decryptTotpSecret(encryptedSecret, process.env.MFA_ENCRYPTION_KEY);
 * // Returns: "JBSWY3DPEHPK3PXP"
 */
export function decryptTotpSecret(encryptedSecret: string, encryptionKey: string): string {
  validateEncryptionKey(encryptionKey);

  const parts = encryptedSecret.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted secret format: expected iv:authTag:ciphertext');
  }

  const [ivBase64, authTagBase64, ciphertextBase64] = parts;

  // Decode from base64
  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');
  const ciphertext = Buffer.from(ciphertextBase64, 'base64');
  const key = Buffer.from(encryptionKey, 'hex');

  // Validate IV length
  if (iv.length !== IV_LENGTH) {
    throw new Error(`Invalid IV length: expected ${IV_LENGTH}, got ${iv.length}`);
  }

  // Validate auth tag length
  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error(`Invalid auth tag length: expected ${AUTH_TAG_LENGTH}, got ${authTag.length}`);
  }

  // Create decipher
  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  // Set the authentication tag for verification
  decipher.setAuthTag(authTag);

  try {
    // Decrypt - this will throw if auth tag verification fails
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    // GCM authentication failed - either wrong key or tampered data
    // Do not expose specific error details to prevent oracle attacks
    throw new Error('TOTP secret decryption failed: authentication verification failed');
  }
}

/**
 * Validate that the encryption key meets security requirements
 *
 * @param key - Hex-encoded encryption key
 * @throws Error if key is invalid
 *
 * @security Key requirements:
 * - Must be exactly 64 hex characters (32 bytes / 256 bits)
 * - Must be valid hexadecimal
 */
function validateEncryptionKey(key: string): void {
  if (!key) {
    throw new Error('MFA encryption key is required');
  }

  if (key.length !== 64) {
    throw new Error(`MFA encryption key must be 64 hex characters (32 bytes), got ${key.length}`);
  }

  if (!/^[0-9a-fA-F]+$/.test(key)) {
    throw new Error('MFA encryption key must be a valid hexadecimal string');
  }
}

/**
 * Check if a stored secret is encrypted (vs. the old hashed format)
 *
 * This helper is useful during migration from hashed to encrypted secrets.
 * Argon2id hashes start with '$argon2' while our encrypted format is 'iv:tag:ct'.
 *
 * @param storedSecret - The secret value from the database
 * @returns true if the secret appears to be encrypted, false if hashed
 */
export function isEncryptedSecret(storedSecret: string): boolean {
  // Argon2id hashes start with $argon2
  if (storedSecret.startsWith('$argon2')) {
    return false;
  }

  // Our encrypted format has exactly 3 colon-separated parts
  const parts = storedSecret.split(':');
  if (parts.length !== 3) {
    return false;
  }

  // Each part should be valid base64
  const base64Regex = /^[A-Za-z0-9+/]+=*$/;
  return parts.every((part) => base64Regex.test(part));
}
