/**
 * Field-Level Encryption Module
 *
 * Provides AES-256-GCM encryption for sensitive PII fields.
 * GDPR compliant encryption at rest for personal data.
 */

export {
  encryptField,
  decryptField,
  generateEncryptionKey,
  deriveFieldKey,
  createSearchableHash,
  CnpEncryption,
  PiiEncryption,
  type EncryptionOptions,
} from './field-encryption.service';
