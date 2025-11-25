import CryptoJS from 'crypto-js';

export class EncryptionService {
  private key: string;

  constructor(key: string) {
    if (!key || key.length < 32) {
      throw new Error('Encryption key must be at least 32 characters');
    }
    this.key = key;
  }

  encrypt(data: any): string {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, this.key);
    return encrypted.toString();
  }

  decrypt(encryptedData: string): any {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, this.key);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(jsonString);
  }

  encryptBatch(items: any[]): string[] {
    return items.map(item => this.encrypt(item));
  }

  decryptBatch(encryptedItems: string[]): any[] {
    return encryptedItems.map(item => this.decrypt(item));
  }

  hash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  generateKey(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  }
}
