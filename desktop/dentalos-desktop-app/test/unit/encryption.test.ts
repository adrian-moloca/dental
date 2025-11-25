import { EncryptionService } from '../../src/sync/encryption';

describe('EncryptionService', () => {
  let encryption: EncryptionService;

  beforeEach(() => {
    encryption = new EncryptionService('test-key-minimum-32-characters-long');
  });

  test('should encrypt and decrypt data', () => {
    const data = { foo: 'bar', num: 123 };
    const encrypted = encryption.encrypt(data);
    const decrypted = encryption.decrypt(encrypted);

    expect(decrypted).toEqual(data);
  });

  test('should encrypt batch of items', () => {
    const items = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' }
    ];

    const encrypted = encryption.encryptBatch(items);
    expect(encrypted.length).toBe(2);

    const decrypted = encryption.decryptBatch(encrypted);
    expect(decrypted).toEqual(items);
  });

  test('should hash data consistently', () => {
    const data = 'test-data';
    const hash1 = encryption.hash(data);
    const hash2 = encryption.hash(data);

    expect(hash1).toBe(hash2);
  });

  test('should generate unique keys', () => {
    const key1 = encryption.generateKey();
    const key2 = encryption.generateKey();

    expect(key1).not.toBe(key2);
    expect(key1.length).toBeGreaterThanOrEqual(32);
  });

  test('should throw on short key', () => {
    expect(() => {
      new EncryptionService('short');
    }).toThrow('Encryption key must be at least 32 characters');
  });
});
