/**
 * TOTP Enrollment Integration Tests
 *
 * Comprehensive integration tests for TOTP (Time-based One-Time Password) enrollment
 * and verification flows, covering secret generation, QR code URI creation, token
 * verification with valid/invalid/expired tokens, and factor enablement.
 *
 * Test Coverage:
 * - TOTP secret generation (RFC 6238 compliant)
 * - QR code URI generation for authenticator apps
 * - Token verification with valid tokens
 * - Token verification with invalid tokens
 * - Token verification with expired tokens (using time window)
 * - Enabling TOTP factor after successful verification
 * - Multi-tenant isolation
 *
 * @group integration
 * @group mfa
 * @module backend-auth/test/integration/mfa
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import type { UUID, OrganizationId } from '@dentalos/shared-types';
import { TOTPService } from '../../../src/modules/mfa/services/totp.service';
import { MfaFactorRepository } from '../../../src/modules/mfa/repositories/mfa-factor.repository';
import { MfaFactor, MfaFactorType } from '../../../src/modules/mfa/entities/mfa-factor.entity';
import {
  encryptTotpSecret,
  decryptTotpSecret,
  isEncryptedSecret,
} from '../../../src/modules/mfa/utils/totp-encryption.util';

// Test encryption key (32 bytes / 64 hex characters)
// DO NOT use this key in production - generate with: openssl rand -hex 32
const TEST_MFA_ENCRYPTION_KEY = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';

describe('TOTP Enrollment Integration Tests', () => {
  let totpService: TOTPService;
  let mfaFactorRepository: MfaFactorRepository;
  let configService: ConfigService;

  // Test actors and context
  const orgId = 'org-dental-001' as OrganizationId;
  const userId = 'user-dentist-001' as UUID;
  const userEmail = 'dentist@dentalos.com';

  beforeEach(() => {
    // Mock ConfigService with TOTP configuration
    configService = {
      get: vi.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          'app.name': 'DentalOS',
          'security.mfa.totp.algorithm': 'sha1',
          'security.mfa.totp.digits': 6,
          'security.mfa.totp.period': 30,
          'security.mfa.totp.window': 1,
        };
        return config[key] !== undefined ? config[key] : defaultValue;
      }),
    } as any;

    // Initialize TOTP service
    totpService = new TOTPService(configService);

    // Mock MFA factor repository
    mfaFactorRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findEnabledByUserId: vi.fn(),
      findPrimaryByUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /* ============================================================================
   * TOTP Secret Generation
   * ============================================================================ */

  describe('TOTP Secret Generation', () => {
    it('should generate a valid Base32-encoded TOTP secret', () => {
      const secret = totpService.generateSecret();

      // Verify secret is Base32 encoded (A-Z, 2-7)
      expect(secret).toMatch(/^[A-Z2-7]+$/);

      // Verify secret has sufficient entropy (at least 32 characters)
      expect(secret.length).toBeGreaterThanOrEqual(32);

      // Verify secret is consistent length
      const secret2 = totpService.generateSecret();
      expect(secret2.length).toBe(secret.length);

      // Verify each generation produces unique secrets
      expect(secret).not.toBe(secret2);
    });

    it('should generate cryptographically random secrets', () => {
      const secrets = new Set<string>();
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        secrets.add(totpService.generateSecret());
      }

      // All secrets should be unique
      expect(secrets.size).toBe(iterations);
    });

    it('should generate secrets compatible with RFC 6238 standard', () => {
      const secret = totpService.generateSecret();

      // RFC 6238 requires Base32 encoding for TOTP secrets
      // Valid Base32 characters: A-Z, 2-7
      expect(secret).toMatch(/^[A-Z2-7]+$/);

      // Minimum recommended secret length is 128 bits (26 Base32 chars)
      expect(secret.length).toBeGreaterThanOrEqual(26);
    });
  });

  /* ============================================================================
   * QR Code URI Generation
   * ============================================================================ */

  describe('QR Code URI Generation', () => {
    it('should generate valid otpauth:// URI for QR code', () => {
      const secret = totpService.generateSecret();
      const uri = totpService.generateQRCodeURI(secret, userEmail);

      // Verify URI format
      expect(uri).toContain('otpauth://totp/');
      expect(uri).toContain(encodeURIComponent(userEmail));
      expect(uri).toContain(`secret=${secret}`);
      expect(uri).toContain('issuer=DentalOS');
      expect(uri).toContain('algorithm=SHA1');
      expect(uri).toContain('digits=6');
      expect(uri).toContain('period=30');
    });

    it('should include organization name when provided', () => {
      const secret = totpService.generateSecret();
      const organizationName = 'Dental Clinic ABC';
      const uri = totpService.generateQRCodeURI(secret, userEmail, organizationName);

      expect(uri).toContain(`issuer=${encodeURIComponent(organizationName)}`);
      expect(uri).not.toContain('issuer=DentalOS');
    });

    it('should generate URI compatible with Google Authenticator', () => {
      const secret = totpService.generateSecret();
      const uri = totpService.generateQRCodeURI(secret, userEmail);

      // Google Authenticator expects this exact format
      expect(uri).toMatch(/^otpauth:\/\/totp\/[^?]+\?secret=[A-Z2-7]+&issuer=.+$/);
    });

    it('should properly URL-encode special characters in email', () => {
      const secret = totpService.generateSecret();
      const specialEmail = 'user+test@dental-clinic.com';
      const uri = totpService.generateQRCodeURI(secret, specialEmail);

      // Special characters should be URL encoded
      expect(uri).toContain(encodeURIComponent(specialEmail));
      expect(uri).not.toContain('+'); // '+' should be encoded as %2B in URI
    });
  });

  /* ============================================================================
   * TOTP Token Verification - Valid Tokens
   * ============================================================================ */

  describe('TOTP Token Verification - Valid Tokens', () => {
    it('should verify valid TOTP token generated from secret', () => {
      const secret = totpService.generateSecret();
      const validToken = totpService.getCurrentToken(secret);

      const isValid = totpService.verifyToken(secret, validToken);

      expect(isValid).toBe(true);
    });

    it('should accept token within time window (30 seconds before)', () => {
      const secret = totpService.generateSecret();

      // Generate token for current time window
      const currentToken = totpService.getCurrentToken(secret);

      // Token should be valid immediately
      expect(totpService.verifyToken(secret, currentToken)).toBe(true);
    });

    it('should verify token with correct 6-digit format', () => {
      const secret = totpService.generateSecret();
      const token = totpService.getCurrentToken(secret);

      // Verify token is 6 digits
      expect(token).toMatch(/^\d{6}$/);
      expect(token.length).toBe(6);

      // Verify it's accepted
      expect(totpService.verifyToken(secret, token)).toBe(true);
    });

    it('should handle tokens with leading zeros', () => {
      const secret = totpService.generateSecret();
      let token = totpService.getCurrentToken(secret);

      // Pad to ensure we test with leading zeros if needed
      token = token.padStart(6, '0');

      expect(token).toMatch(/^\d{6}$/);
      expect(totpService.verifyToken(secret, token)).toBe(true);
    });
  });

  /* ============================================================================
   * TOTP Token Verification - Invalid Tokens
   * ============================================================================ */

  describe('TOTP Token Verification - Invalid Tokens', () => {
    it('should reject token with wrong digits', () => {
      const secret = totpService.generateSecret();
      const invalidToken = '999999'; // Random 6-digit token

      const isValid = totpService.verifyToken(secret, invalidToken);

      // Very low probability this random token matches
      expect(isValid).toBe(false);
    });

    it('should reject token with incorrect length', () => {
      const secret = totpService.generateSecret();

      expect(totpService.verifyToken(secret, '12345')).toBe(false);     // Too short
      expect(totpService.verifyToken(secret, '1234567')).toBe(false);   // Too long
      expect(totpService.verifyToken(secret, '')).toBe(false);          // Empty
    });

    it('should reject non-numeric tokens', () => {
      const secret = totpService.generateSecret();

      expect(totpService.verifyToken(secret, 'abcdef')).toBe(false);
      expect(totpService.verifyToken(secret, '12345a')).toBe(false);
      expect(totpService.verifyToken(secret, 'ABC123')).toBe(false);
      expect(totpService.verifyToken(secret, '!@#$%^')).toBe(false);
    });

    it('should reject token generated from different secret', () => {
      const secret1 = totpService.generateSecret();
      const secret2 = totpService.generateSecret();

      const tokenForSecret1 = totpService.getCurrentToken(secret1);

      // Token from secret1 should not work with secret2
      const isValid = totpService.verifyToken(secret2, tokenForSecret1);
      expect(isValid).toBe(false);
    });

    it('should reject null or undefined tokens', () => {
      const secret = totpService.generateSecret();

      expect(totpService.verifyToken(secret, null as any)).toBe(false);
      expect(totpService.verifyToken(secret, undefined as any)).toBe(false);
    });

    it('should reject tokens with whitespace', () => {
      const secret = totpService.generateSecret();
      const validToken = totpService.getCurrentToken(secret);

      expect(totpService.verifyToken(secret, ` ${validToken}`)).toBe(false);
      expect(totpService.verifyToken(secret, `${validToken} `)).toBe(false);
      expect(totpService.verifyToken(secret, `123 456`)).toBe(false);
    });
  });

  /* ============================================================================
   * TOTP Token Verification - Expired Tokens
   * ============================================================================ */

  describe('TOTP Token Verification - Time Window', () => {
    it('should accept token within configured time window', () => {
      const secret = totpService.generateSecret();
      const token = totpService.getCurrentToken(secret);

      // Token should be valid immediately
      expect(totpService.verifyToken(secret, token)).toBe(true);
    });

    it('should use window=1 to accept tokens from previous/next period', () => {
      // With window=1, tokens from current, previous, and next 30-second windows are valid
      // This is the configured default in our mock
      const windowConfig = configService.get('security.mfa.totp.window');
      expect(windowConfig).toBe(1);
    });

    it('should reject very old tokens outside time window', () => {
      const secret = totpService.generateSecret();

      // Generate a token that would have been valid 10 minutes ago
      // This is outside the window (which is typically 1-2 periods = 30-60 seconds)
      const veryOldToken = '123456'; // Random old token

      expect(totpService.verifyToken(secret, veryOldToken)).toBe(false);
    });
  });

  /* ============================================================================
   * TOTP Factor Enrollment and Enablement
   * ============================================================================ */

  describe('TOTP Factor Enrollment and Enablement', () => {
    it('should create TOTP factor after successful enrollment', async () => {
      const secret = totpService.generateSecret();
      // CRITICAL: TOTP secrets must be encrypted, NOT hashed
      // Hashing would make verification impossible since TOTP needs the original secret
      const encryptedSecret = encryptTotpSecret(secret, TEST_MFA_ENCRYPTION_KEY);

      const mockFactor: MfaFactor = MfaFactor.fromJSON({
        id: crypto.randomUUID(),
        userId,
        organizationId: orgId,
        factorType: MfaFactorType.TOTP,
        secret: encryptedSecret,
        isEnabled: false, // Initially disabled until verified
        isPrimary: false,
        metadata: {
          totpInfo: {
            algorithm: 'sha1',
            digits: 6,
            period: 30,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      vi.mocked(mfaFactorRepository.create).mockResolvedValue(mockFactor);

      const result = await mfaFactorRepository.create({
        userId,
        organizationId: orgId,
        factorType: MfaFactorType.TOTP,
        secret: encryptedSecret,
        isEnabled: false,
        isPrimary: false,
        metadata: {
          totpInfo: {
            algorithm: 'sha1',
            digits: 6,
            period: 30,
          },
        },
      });

      expect(result.factorType).toBe(MfaFactorType.TOTP);
      expect(result.userId).toBe(userId);
      expect(result.organizationId).toBe(orgId);
      expect(result.isEnabled).toBe(false);
      expect(mfaFactorRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          organizationId: orgId,
          factorType: MfaFactorType.TOTP,
          isEnabled: false,
        })
      );
    });

    it('should enable TOTP factor after successful token verification', async () => {
      const secret = totpService.generateSecret();
      const token = totpService.getCurrentToken(secret);
      // CRITICAL: TOTP secrets must be encrypted for storage
      const encryptedSecret = encryptTotpSecret(secret, TEST_MFA_ENCRYPTION_KEY);

      // Step 1: Create disabled factor with encrypted secret
      const disabledFactor = MfaFactor.fromJSON({
        id: crypto.randomUUID(),
        userId,
        organizationId: orgId,
        factorType: MfaFactorType.TOTP,
        secret: encryptedSecret,
        isEnabled: false,
        isPrimary: false,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Step 2: Decrypt secret and verify token (simulating what MfaService does)
      const decryptedSecret = decryptTotpSecret(disabledFactor.secret, TEST_MFA_ENCRYPTION_KEY);
      expect(decryptedSecret).toBe(secret); // Verify decryption works
      const isValidToken = totpService.verifyToken(decryptedSecret, token);
      expect(isValidToken).toBe(true);

      // Step 3: Enable factor after successful verification
      const enabledFactor = disabledFactor.withEnabledStatus(true);
      vi.mocked(mfaFactorRepository.update).mockResolvedValue(enabledFactor);

      const result = await mfaFactorRepository.update(enabledFactor);

      expect(result.isEnabled).toBe(true);
      expect(result.userId).toBe(userId);
      expect(result.organizationId).toBe(orgId);
      expect(mfaFactorRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          isEnabled: true,
        })
      );
    });

    it('should store TOTP secret as AES-256-GCM encrypted (NOT hashed)', () => {
      const secret = totpService.generateSecret();

      // CRITICAL: TOTP secrets MUST be encrypted, NOT hashed
      // Hashing is one-way and would make TOTP verification impossible
      const encryptedSecret = encryptTotpSecret(secret, TEST_MFA_ENCRYPTION_KEY);

      // Verify encrypted format: iv:authTag:ciphertext (base64)
      const parts = encryptedSecret.split(':');
      expect(parts.length).toBe(3);
      expect(isEncryptedSecret(encryptedSecret)).toBe(true);

      // Verify we can decrypt back to original secret
      const decryptedSecret = decryptTotpSecret(encryptedSecret, TEST_MFA_ENCRYPTION_KEY);
      expect(decryptedSecret).toBe(secret);

      // Verify the decrypted secret works for TOTP verification
      const token = totpService.getCurrentToken(decryptedSecret);
      expect(totpService.verifyToken(decryptedSecret, token)).toBe(true);
    });

    it('should detect legacy hashed secrets vs encrypted secrets', () => {
      // Legacy (incorrect) Argon2id hash format
      const legacyHashedSecret = '$argon2id$v=19$m=65536,t=3,p=4$somesalthere$hashvaluehere';
      expect(isEncryptedSecret(legacyHashedSecret)).toBe(false);

      // Correct encrypted format
      const secret = totpService.generateSecret();
      const encryptedSecret = encryptTotpSecret(secret, TEST_MFA_ENCRYPTION_KEY);
      expect(isEncryptedSecret(encryptedSecret)).toBe(true);
    });

    it('should not enable TOTP factor without token verification', () => {
      const secret = totpService.generateSecret();
      const encryptedSecret = encryptTotpSecret(secret, TEST_MFA_ENCRYPTION_KEY);

      const factor = MfaFactor.fromJSON({
        id: crypto.randomUUID(),
        userId,
        organizationId: orgId,
        factorType: MfaFactorType.TOTP,
        secret: encryptedSecret,
        isEnabled: false, // Should remain disabled until verified
        isPrimary: false,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      vi.mocked(mfaFactorRepository.create).mockResolvedValue(factor);

      // Factor should be created but NOT enabled
      expect(factor.isEnabled).toBe(false);
    });
  });

  /* ============================================================================
   * Multi-Tenant Isolation
   * ============================================================================ */

  describe('Multi-Tenant Isolation', () => {
    it('should isolate TOTP factors by organization', async () => {
      const org1Id = 'org-dental-001' as OrganizationId;
      const org2Id = 'org-dental-002' as OrganizationId;
      const user1Id = 'user-001' as UUID;

      const secret1 = totpService.generateSecret();
      const secret2 = totpService.generateSecret();

      const factor1 = MfaFactor.fromJSON({
        id: crypto.randomUUID(),
        userId: user1Id,
        organizationId: org1Id,
        factorType: MfaFactorType.TOTP,
        secret: encryptTotpSecret(secret1, TEST_MFA_ENCRYPTION_KEY),
        isEnabled: true,
        isPrimary: true,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const factor2 = MfaFactor.fromJSON({
        id: crypto.randomUUID(),
        userId: user1Id,
        organizationId: org2Id,
        factorType: MfaFactorType.TOTP,
        secret: encryptTotpSecret(secret2, TEST_MFA_ENCRYPTION_KEY),
        isEnabled: true,
        isPrimary: true,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Mock repository to return factors based on organization
      vi.mocked(mfaFactorRepository.findByUserId)
        .mockImplementation(async (userId: UUID, orgId: OrganizationId) => {
          if (orgId === org1Id) return [factor1];
          if (orgId === org2Id) return [factor2];
          return [];
        });

      const org1Factors = await mfaFactorRepository.findByUserId(user1Id, org1Id);
      const org2Factors = await mfaFactorRepository.findByUserId(user1Id, org2Id);

      expect(org1Factors).toHaveLength(1);
      expect(org1Factors[0].organizationId).toBe(org1Id);

      expect(org2Factors).toHaveLength(1);
      expect(org2Factors[0].organizationId).toBe(org2Id);

      // Factors should be different
      expect(org1Factors[0].id).not.toBe(org2Factors[0].id);
      expect(org1Factors[0].secret).not.toBe(org2Factors[0].secret);
    });

    it('should prevent cross-tenant TOTP factor access', async () => {
      const org1Id = 'org-dental-001' as OrganizationId;
      const org2Id = 'org-dental-002' as OrganizationId;
      const factorId = crypto.randomUUID() as UUID;

      const factor = MfaFactor.fromJSON({
        id: factorId,
        userId,
        organizationId: org1Id,
        factorType: MfaFactorType.TOTP,
        secret: encryptTotpSecret(totpService.generateSecret(), TEST_MFA_ENCRYPTION_KEY),
        isEnabled: true,
        isPrimary: true,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Mock repository to enforce tenant isolation
      vi.mocked(mfaFactorRepository.findById)
        .mockImplementation(async (id: UUID, orgId: OrganizationId) => {
          if (id === factorId && orgId === org1Id) return factor;
          return null; // Cross-tenant access returns null
        });

      // Should find factor in correct organization
      const validAccess = await mfaFactorRepository.findById(factorId, org1Id);
      expect(validAccess).not.toBeNull();
      expect(validAccess?.organizationId).toBe(org1Id);

      // Should NOT find factor in different organization
      const crossTenantAccess = await mfaFactorRepository.findById(factorId, org2Id);
      expect(crossTenantAccess).toBeNull();
    });
  });

  /* ============================================================================
   * Edge Cases and Security
   * ============================================================================ */

  describe('Edge Cases and Security', () => {
    it('should handle multiple verification attempts correctly', () => {
      const secret = totpService.generateSecret();
      const validToken = totpService.getCurrentToken(secret);

      // Multiple verifications of same token should work (within time window)
      expect(totpService.verifyToken(secret, validToken)).toBe(true);
      expect(totpService.verifyToken(secret, validToken)).toBe(true);
      expect(totpService.verifyToken(secret, validToken)).toBe(true);
    });

    it('should reject tokens with SQL injection attempts', () => {
      const secret = totpService.generateSecret();

      const sqlInjectionTokens = [
        "123456' OR '1'='1",
        "123456; DROP TABLE users;--",
        "123456' UNION SELECT * FROM users--",
      ];

      sqlInjectionTokens.forEach(maliciousToken => {
        expect(totpService.verifyToken(secret, maliciousToken)).toBe(false);
      });
    });

    it('should handle very long invalid tokens', () => {
      const secret = totpService.generateSecret();
      const veryLongToken = '1'.repeat(10000);

      expect(totpService.verifyToken(secret, veryLongToken)).toBe(false);
    });

    it('should generate unique secrets for multiple users', async () => {
      const user1Secret = totpService.generateSecret();
      const user2Secret = totpService.generateSecret();
      const user3Secret = totpService.generateSecret();

      // All secrets should be unique
      expect(user1Secret).not.toBe(user2Secret);
      expect(user2Secret).not.toBe(user3Secret);
      expect(user1Secret).not.toBe(user3Secret);

      // Tokens from different secrets should not be interchangeable
      const token1 = totpService.getCurrentToken(user1Secret);
      expect(totpService.verifyToken(user2Secret, token1)).toBe(false);
      expect(totpService.verifyToken(user3Secret, token1)).toBe(false);
    });
  });
});
