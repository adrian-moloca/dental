import * as crypto from 'crypto';

/**
 * Field-Level Encryption Service
 *
 * Provides AES-256-GCM encryption for sensitive PII fields like CNP.
 * Uses authenticated encryption to prevent tampering.
 *
 * Security Features:
 * - AES-256-GCM (authenticated encryption)
 * - Unique IV per encryption operation
 * - Key derivation using HKDF (optional)
 * - Deterministic encryption mode for searchable fields
 *
 * GDPR Compliance:
 * - Encryption at rest for PII
 * - Key rotation support
 * - Secure key management integration
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM recommended IV length
const AUTH_TAG_LENGTH = 16; // GCM auth tag length
const KEY_LENGTH = 32; // AES-256 key length

/**
 * Encrypted field format:
 * IV (12 bytes) + AuthTag (16 bytes) + Ciphertext (variable)
 * Base64 encoded for storage
 */

export interface EncryptionOptions {
  /**
   * Encryption key (32 bytes for AES-256)
   * Should be loaded from secure key management (AWS KMS, HashiCorp Vault)
   */
  key: Buffer | string;

  /**
   * Use deterministic encryption (same plaintext = same ciphertext)
   * WARNING: Less secure, only use for fields that need exact-match search
   */
  deterministic?: boolean;

  /**
   * Additional authenticated data (AAD) for context binding
   * e.g., tenantId to prevent cross-tenant decryption
   */
  aad?: string;
}

/**
 * Normalize key to Buffer
 */
function normalizeKey(key: Buffer | string): Buffer {
  if (Buffer.isBuffer(key)) {
    if (key.length !== KEY_LENGTH) {
      throw new Error(`Encryption key must be ${KEY_LENGTH} bytes`);
    }
    return key;
  }

  // If string, assume hex or base64
  let keyBuffer: Buffer;
  if (key.length === KEY_LENGTH * 2) {
    // Hex encoded
    keyBuffer = Buffer.from(key, 'hex');
  } else {
    // Base64 encoded
    keyBuffer = Buffer.from(key, 'base64');
  }

  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(`Encryption key must be ${KEY_LENGTH} bytes after decoding`);
  }

  return keyBuffer;
}

/**
 * Generate a deterministic IV from plaintext (for searchable encryption)
 * Uses HMAC-SHA256 of the plaintext truncated to IV_LENGTH
 */
function generateDeterministicIv(plaintext: string, key: Buffer): Buffer {
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(plaintext);
  return hmac.digest().subarray(0, IV_LENGTH);
}

/**
 * Encrypt a string value using AES-256-GCM
 *
 * @param plaintext - The value to encrypt
 * @param options - Encryption options including key
 * @returns Base64 encoded ciphertext (IV + AuthTag + Ciphertext)
 */
export function encryptField(plaintext: string, options: EncryptionOptions): string {
  const key = normalizeKey(options.key);

  // Generate IV
  const iv = options.deterministic
    ? generateDeterministicIv(plaintext, key)
    : crypto.randomBytes(IV_LENGTH);

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  // Add AAD if provided
  if (options.aad) {
    cipher.setAAD(Buffer.from(options.aad, 'utf8'));
  }

  // Encrypt
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  // Get auth tag
  const authTag = cipher.getAuthTag();

  // Combine: IV + AuthTag + Ciphertext
  const combined = Buffer.concat([iv, authTag, ciphertext]);

  return combined.toString('base64');
}

/**
 * Decrypt a field encrypted with encryptField
 *
 * @param encryptedValue - Base64 encoded encrypted value
 * @param options - Encryption options (must match encryption options)
 * @returns Decrypted plaintext
 */
export function decryptField(encryptedValue: string, options: EncryptionOptions): string {
  const key = normalizeKey(options.key);

  // Decode from base64
  const combined = Buffer.from(encryptedValue, 'base64');

  // Validate minimum length
  const minLength = IV_LENGTH + AUTH_TAG_LENGTH + 1;
  if (combined.length < minLength) {
    throw new Error('Invalid encrypted value: too short');
  }

  // Extract components
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  // Set auth tag
  decipher.setAuthTag(authTag);

  // Add AAD if provided
  if (options.aad) {
    decipher.setAAD(Buffer.from(options.aad, 'utf8'));
  }

  // Decrypt
  try {
    const plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return plaintext.toString('utf8');
  } catch (error) {
    throw new Error('Decryption failed: invalid key, corrupted data, or tampered ciphertext');
  }
}

/**
 * Generate a secure encryption key
 * Use this for initial key generation, then store in key management system
 */
export function generateEncryptionKey(): { hex: string; base64: string } {
  const key = crypto.randomBytes(KEY_LENGTH);
  return {
    hex: key.toString('hex'),
    base64: key.toString('base64'),
  };
}

/**
 * Derive a field-specific key from master key using HKDF
 * Allows using different keys for different fields without managing multiple keys
 */
export function deriveFieldKey(
  masterKey: Buffer | string,
  fieldName: string,
  tenantId?: string,
): Buffer {
  const key = normalizeKey(masterKey);

  // Create info string for HKDF
  const info = tenantId
    ? `field:${fieldName}:tenant:${tenantId}`
    : `field:${fieldName}`;

  // Use HKDF to derive field-specific key
  const derived = crypto.hkdfSync('sha256', key, '', Buffer.from(info), KEY_LENGTH);
  return Buffer.from(derived);
}

/**
 * Create a searchable hash for encrypted fields
 * Allows searching without decrypting, but reveals equality
 */
export function createSearchableHash(
  plaintext: string,
  options: EncryptionOptions,
): string {
  const key = normalizeKey(options.key);

  const hmac = crypto.createHmac('sha256', key);
  hmac.update(plaintext);

  if (options.aad) {
    hmac.update(options.aad);
  }

  return hmac.digest('hex');
}

/**
 * CNP-specific encryption utilities
 */
export class CnpEncryption {
  private readonly key: Buffer;
  private readonly tenantId?: string;

  constructor(key: Buffer | string, tenantId?: string) {
    this.key = normalizeKey(key);
    this.tenantId = tenantId;
  }

  /**
   * Encrypt CNP with tenant-scoped AAD
   */
  encrypt(cnp: string): string {
    return encryptField(cnp, {
      key: this.key,
      aad: this.tenantId,
    });
  }

  /**
   * Decrypt CNP
   */
  decrypt(encryptedCnp: string): string {
    return decryptField(encryptedCnp, {
      key: this.key,
      aad: this.tenantId,
    });
  }

  /**
   * Create searchable hash for CNP lookup
   * Allows finding patients by CNP without decrypting all records
   */
  createSearchHash(cnp: string): string {
    return createSearchableHash(cnp, {
      key: this.key,
      aad: this.tenantId,
    });
  }

  /**
   * Encrypt CNP deterministically for exact-match lookups
   * WARNING: Same CNP will always produce same ciphertext (less secure)
   */
  encryptDeterministic(cnp: string): string {
    return encryptField(cnp, {
      key: this.key,
      aad: this.tenantId,
      deterministic: true,
    });
  }
}

/**
 * Generic PII field encryption
 */
export class PiiEncryption {
  private readonly masterKey: Buffer;

  constructor(masterKey: Buffer | string) {
    this.masterKey = normalizeKey(masterKey);
  }

  /**
   * Encrypt a PII field with field-specific derived key
   */
  encryptField(
    fieldName: string,
    value: string,
    tenantId?: string,
  ): string {
    const fieldKey = deriveFieldKey(this.masterKey, fieldName, tenantId);

    return encryptField(value, {
      key: fieldKey,
      aad: tenantId,
    });
  }

  /**
   * Decrypt a PII field
   */
  decryptField(
    fieldName: string,
    encryptedValue: string,
    tenantId?: string,
  ): string {
    const fieldKey = deriveFieldKey(this.masterKey, fieldName, tenantId);

    return decryptField(encryptedValue, {
      key: fieldKey,
      aad: tenantId,
    });
  }

  /**
   * Create searchable hash for a field
   */
  createSearchHash(
    fieldName: string,
    value: string,
    tenantId?: string,
  ): string {
    const fieldKey = deriveFieldKey(this.masterKey, fieldName, tenantId);

    return createSearchableHash(value, {
      key: fieldKey,
      aad: tenantId,
    });
  }
}
