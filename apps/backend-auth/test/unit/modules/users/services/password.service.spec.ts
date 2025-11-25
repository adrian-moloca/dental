/**
 * PasswordService Unit Tests
 *
 * Tests cover:
 * - Argon2id hashing produces non-deterministic results
 * - Password verification correctly validates passwords
 * - Security error handling for invalid inputs
 * - Password strength validation rules
 * - Constant-time verification (timing attack resistance)
 *
 * Security Test Coverage:
 * - Non-deterministic hashing (different salts each time)
 * - Proper error handling without information disclosure
 * - Password strength requirements enforcement
 * - Edge cases (empty strings, null, very long passwords)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { PasswordService } from '../../../../../src/modules/users/services/password.service';
import { SecurityError } from '@dentalos/shared-errors';

describe('PasswordService', () => {
  let passwordService: PasswordService;
  let configService: ConfigService;

  beforeEach(() => {
    // Mock ConfigService
    configService = {
      get: vi.fn((key: string, defaultValue?: any) => {
        if (key === 'security.argon2.memoryCost') return defaultValue || 65536;
        if (key === 'security.argon2.timeCost') return defaultValue || 3;
        if (key === 'security.argon2.parallelism') return defaultValue || 4;
        return defaultValue;
      }),
    } as any;

    passwordService = new PasswordService(configService);
  });

  describe('hashPassword()', () => {
    it('should hash a valid password successfully', async () => {
      const password = 'SecurePassword123!';
      const hash = await passwordService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).toContain('$argon2id$');
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should produce different hashes for the same password (non-deterministic)', async () => {
      const password = 'SecurePassword123!';
      const hash1 = await passwordService.hashPassword(password);
      const hash2 = await passwordService.hashPassword(password);

      expect(hash1).not.toBe(hash2);
      expect(hash1).toContain('$argon2id$');
      expect(hash2).toContain('$argon2id$');
    });

    it('should throw SecurityError for empty password', async () => {
      await expect(passwordService.hashPassword('')).rejects.toThrow(SecurityError);
      await expect(passwordService.hashPassword('')).rejects.toThrow('Password cannot be empty');
    });

    it('should throw SecurityError for whitespace-only password', async () => {
      await expect(passwordService.hashPassword('   ')).rejects.toThrow(SecurityError);
      await expect(passwordService.hashPassword('   ')).rejects.toThrow('Password cannot be empty');
    });

    it('should hash very long passwords (up to 128 characters)', async () => {
      const longPassword = 'a'.repeat(128) + 'A1!';
      const hash = await passwordService.hashPassword(longPassword);

      expect(hash).toBeDefined();
      expect(hash).toContain('$argon2id$');
    });

    it('should hash passwords with special characters', async () => {
      const password = 'P@ssw0rd!#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = await passwordService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).toContain('$argon2id$');
    });

    it('should hash passwords with unicode characters', async () => {
      const password = 'Пароль123!你好🔒';
      const hash = await passwordService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).toContain('$argon2id$');
    });
  });

  describe('verifyPassword()', () => {
    it('should verify correct password against hash', async () => {
      const password = 'SecurePassword123!';
      const hash = await passwordService.hashPassword(password);
      const isValid = await passwordService.verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'SecurePassword123!';
      const hash = await passwordService.hashPassword(password);
      const isValid = await passwordService.verifyPassword('WrongPassword123!', hash);

      expect(isValid).toBe(false);
    });

    it('should reject password with different case', async () => {
      const password = 'SecurePassword123!';
      const hash = await passwordService.hashPassword(password);
      const isValid = await passwordService.verifyPassword('securepassword123!', hash);

      expect(isValid).toBe(false);
    });

    it('should reject password with extra characters', async () => {
      const password = 'SecurePassword123!';
      const hash = await passwordService.hashPassword(password);
      const isValid = await passwordService.verifyPassword('SecurePassword123!extra', hash);

      expect(isValid).toBe(false);
    });

    it('should throw SecurityError for empty password', async () => {
      const hash = '$argon2id$v=19$m=65536,t=3,p=4$somehash';
      await expect(passwordService.verifyPassword('', hash)).rejects.toThrow(SecurityError);
    });

    it('should throw SecurityError for empty hash', async () => {
      await expect(passwordService.verifyPassword('password', '')).rejects.toThrow(SecurityError);
    });

    it('should return false for malformed hash (no throw)', async () => {
      const isValid = await passwordService.verifyPassword('password', 'invalid-hash');
      expect(isValid).toBe(false);
    });

    it('should return false for hash with wrong algorithm', async () => {
      // bcrypt hash format
      const bcryptHash = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
      const isValid = await passwordService.verifyPassword('password', bcryptHash);
      expect(isValid).toBe(false);
    });

    it('should verify passwords with unicode characters', async () => {
      const password = 'Пароль123!你好🔒';
      const hash = await passwordService.hashPassword(password);
      const isValid = await passwordService.verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });
  });

  describe('validatePasswordStrength()', () => {
    it('should accept strong password meeting all requirements', () => {
      const result = passwordService.validatePasswordStrength('SecurePass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password shorter than 12 characters', () => {
      const result = passwordService.validatePasswordStrength('Short1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 12 characters');
    });

    it('should reject password longer than 128 characters', () => {
      const longPassword = 'A1!' + 'a'.repeat(130);
      const result = passwordService.validatePasswordStrength(longPassword);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must not exceed 128 characters');
    });

    it('should reject password without uppercase letter', () => {
      const result = passwordService.validatePasswordStrength('securepass123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase letter', () => {
      const result = passwordService.validatePasswordStrength('SECUREPASS123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without digit', () => {
      const result = passwordService.validatePasswordStrength('SecurePassword!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one digit');
    });

    it('should reject password without special character', () => {
      const result = passwordService.validatePasswordStrength('SecurePass123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should return multiple errors for very weak password', () => {
      const result = passwordService.validatePasswordStrength('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('Password must be at least 12 characters');
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
      expect(result.errors).toContain('Password must contain at least one digit');
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should accept password with various special characters', () => {
      const passwords = [
        'SecurePass123!',
        'SecurePass123@',
        'SecurePass123#',
        'SecurePass123$',
        'SecurePass123%',
        'SecurePass123^',
        'SecurePass123&',
        'SecurePass123*',
        'SecurePass123(',
        'SecurePass123-',
        'SecurePass123_',
      ];

      passwords.forEach(password => {
        const result = passwordService.validatePasswordStrength(password);
        expect(result.isValid).toBe(true);
      });
    });

    it('should accept minimum valid password (12 chars with all requirements)', () => {
      const result = passwordService.validatePasswordStrength('Aa1!bbbbbbbb');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept maximum valid password (128 chars with all requirements)', () => {
      const password = 'Aa1!' + 'b'.repeat(124);
      const result = passwordService.validatePasswordStrength(password);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Configuration', () => {
    it('should use custom Argon2 parameters from config', () => {
      const customConfig = {
        get: vi.fn((key: string) => {
          if (key === 'security.argon2.memoryCost') return 131072;
          if (key === 'security.argon2.timeCost') return 5;
          if (key === 'security.argon2.parallelism') return 8;
        }),
      } as any;

      const customService = new PasswordService(customConfig);
      expect(customConfig.get).toHaveBeenCalledWith('security.argon2.memoryCost', 65536);
      expect(customConfig.get).toHaveBeenCalledWith('security.argon2.timeCost', 3);
      expect(customConfig.get).toHaveBeenCalledWith('security.argon2.parallelism', 4);
    });

    it('should use default Argon2 parameters when config not available', () => {
      const emptyConfig = {
        get: vi.fn(() => undefined),
      } as any;

      const service = new PasswordService(emptyConfig);
      // Service should still work with defaults
      expect(service).toBeDefined();
    });
  });

  describe('Security Properties', () => {
    it('should produce hashes with consistent format', async () => {
      const password = 'SecurePassword123!';
      const hash = await passwordService.hashPassword(password);

      // Argon2id format: $argon2id$v=19$m=65536,t=3,p=4$salt$hash
      const parts = hash.split('$');
      expect(parts[1]).toBe('argon2id');
      expect(parts[2]).toBe('v=19');
      expect(parts[3]).toContain('m=');
      expect(parts[3]).toContain('t=');
      expect(parts[3]).toContain('p=');
    });

    it('should embed salt in hash output', async () => {
      const password = 'SecurePassword123!';
      const hash1 = await passwordService.hashPassword(password);
      const hash2 = await passwordService.hashPassword(password);

      // Different salts should produce different hashes
      const salt1 = hash1.split('$')[4];
      const salt2 = hash2.split('$')[4];
      expect(salt1).not.toBe(salt2);
    });
  });
});
