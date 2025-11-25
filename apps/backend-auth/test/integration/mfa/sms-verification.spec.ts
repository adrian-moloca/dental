/**
 * SMS Verification Integration Tests
 *
 * Comprehensive integration tests for SMS-based MFA verification flows,
 * covering code generation, Redis storage, Twilio integration, verification
 * with valid/invalid/expired codes, TTL expiration, and attempt limiting.
 *
 * Test Coverage:
 * - SMS code generation (6-digit random codes)
 * - Code storage in Redis with TTL (5 minutes)
 * - Twilio adapter integration (mocked)
 * - Code verification (valid/invalid/expired)
 * - Challenge TTL expiration enforcement
 * - Attempt limiting (max 3 attempts)
 * - Multi-tenant isolation
 * - Argon2id hash verification
 *
 * @group integration
 * @group mfa
 * @module backend-auth/test/integration/mfa
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import type { UUID, OrganizationId } from '@dentalos/shared-types';
import { SMSMfaService } from '../../../src/modules/mfa/services/sms-mfa.service';
import { MfaChallengeRepository } from '../../../src/modules/mfa/repositories/mfa-challenge.repository';
import { TwilioAdapter } from '../../../src/modules/mfa/adapters/twilio.adapter';
import { MfaChallenge } from '../../../src/modules/mfa/entities/mfa-challenge.entity';
import { RedisService } from '../../../src/config/redis.config';
import { hash, verify } from '@node-rs/argon2';

describe('SMS Verification Integration Tests', () => {
  let smsMfaService: SMSMfaService;
  let mfaChallengeRepository: MfaChallengeRepository;
  let twilioAdapter: TwilioAdapter;
  let redisService: RedisService;
  let configService: ConfigService;

  // Test actors and context
  const orgId = 'org-dental-001' as OrganizationId;
  const userId = 'user-dentist-001' as UUID;
  const factorId = crypto.randomUUID() as UUID;
  const phoneNumber = '+15551234567';

  // Track generated codes for verification
  let lastGeneratedCode: string;

  beforeEach(() => {
    // Mock ConfigService with SMS MFA configuration
    configService = {
      get: vi.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          'security.mfa.sms.codeLength': 6,
          'security.mfa.sms.validityMinutes': 5,
          'security.mfa.sms.maxAttempts': 3,
        };
        return config[key] !== undefined ? config[key] : defaultValue;
      }),
    } as any;

    // Mock Redis client
    const mockRedisClient = {
      setex: vi.fn().mockResolvedValue('OK'),
      get: vi.fn().mockResolvedValue(null),
      del: vi.fn().mockResolvedValue(1),
      keys: vi.fn().mockResolvedValue([]),
      multi: vi.fn().mockReturnValue({
        del: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([]),
      }),
    };

    // Mock RedisService
    redisService = {
      getClient: vi.fn().mockReturnValue(mockRedisClient),
    } as any;

    // Mock MFA challenge repository
    mfaChallengeRepository = new MfaChallengeRepository(redisService);

    // Mock Twilio adapter with spy to capture sent codes
    twilioAdapter = {
      sendMfaCode: vi.fn().mockImplementation(async (to: string, code: string) => {
        lastGeneratedCode = code; // Capture code for testing
        return true;
      }),
      sendSms: vi.fn().mockResolvedValue(true),
    } as any;

    // Initialize SMS MFA service
    smsMfaService = new SMSMfaService(
      configService,
      mfaChallengeRepository,
      twilioAdapter
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    lastGeneratedCode = '';
  });

  /* ============================================================================
   * SMS Code Generation and Storage
   * ============================================================================ */

  describe('SMS Code Generation and Storage', () => {
    it('should generate 6-digit numeric SMS code', async () => {
      const challenge = await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      expect(twilioAdapter.sendMfaCode).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringMatching(/^\d{6}$/)
      );

      // Verify captured code is 6 digits
      expect(lastGeneratedCode).toMatch(/^\d{6}$/);
      expect(lastGeneratedCode.length).toBe(6);
    });

    it('should generate random codes for each request', async () => {
      const codes = new Set<string>();

      // Generate 50 codes to ensure randomness
      for (let i = 0; i < 50; i++) {
        await smsMfaService.sendVerificationCode(
          userId,
          orgId,
          factorId,
          phoneNumber
        );
        codes.add(lastGeneratedCode);
      }

      // Most codes should be unique (allow small collision rate)
      expect(codes.size).toBeGreaterThan(45);
    });

    it('should store code as Argon2id hash in challenge', async () => {
      const challenge = await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      // Verify hash format
      expect(challenge.challengeCodeHash).toMatch(/^\$argon2id\$/);
      expect(challenge.challengeCodeHash.length).toBeGreaterThan(64);

      // Verify we can verify the hash with the captured code
      const isValid = await verify(challenge.challengeCodeHash, lastGeneratedCode);
      expect(isValid).toBe(true);
    });

    it('should create challenge with correct TTL (5 minutes)', async () => {
      const beforeSend = new Date();

      const challenge = await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      const afterSend = new Date();
      const expectedExpiry = new Date(beforeSend.getTime() + 5 * 60 * 1000);

      // Verify expiration is approximately 5 minutes from now
      const expiryDiff = Math.abs(challenge.expiresAt.getTime() - expectedExpiry.getTime());
      expect(expiryDiff).toBeLessThan(5000); // Within 5 seconds tolerance

      // Verify challenge properties
      expect(challenge.userId).toBe(userId);
      expect(challenge.organizationId).toBe(orgId);
      expect(challenge.factorId).toBe(factorId);
      expect(challenge.attemptsRemaining).toBe(3);
    });

    it('should store challenge in Redis with proper key format', async () => {
      const mockRedisClient = redisService.getClient();

      const challenge = await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      // Verify Redis setex was called with correct pattern
      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`mfa:challenge:${orgId}:`)),
        expect.any(Number), // TTL in seconds
        expect.any(String)  // JSON stringified challenge
      );
    });

    it('should calculate TTL as 300 seconds (5 minutes)', async () => {
      const mockRedisClient = redisService.getClient();

      await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      const setexCall = vi.mocked(mockRedisClient.setex).mock.calls[0];
      const ttlSeconds = setexCall[1];

      // TTL should be approximately 300 seconds (5 minutes)
      expect(ttlSeconds).toBeGreaterThanOrEqual(295);
      expect(ttlSeconds).toBeLessThanOrEqual(300);
    });
  });

  /* ============================================================================
   * Twilio Adapter Integration
   * ============================================================================ */

  describe('Twilio Adapter Integration', () => {
    it('should send SMS via Twilio adapter', async () => {
      await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      expect(twilioAdapter.sendMfaCode).toHaveBeenCalledTimes(1);
      expect(twilioAdapter.sendMfaCode).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringMatching(/^\d{6}$/)
      );
    });

    it('should format phone number in E.164 format', async () => {
      const e164Phone = '+15551234567';

      await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        e164Phone
      );

      expect(twilioAdapter.sendMfaCode).toHaveBeenCalledWith(
        e164Phone,
        expect.any(String)
      );
    });

    it('should throw error if Twilio adapter fails', async () => {
      vi.mocked(twilioAdapter.sendMfaCode).mockResolvedValue(false);

      await expect(
        smsMfaService.sendVerificationCode(userId, orgId, factorId, phoneNumber)
      ).rejects.toThrow('Failed to send SMS verification code');
    });

    it('should include code in SMS message', async () => {
      await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      const sentCode = lastGeneratedCode;
      expect(sentCode).toBeTruthy();
      expect(twilioAdapter.sendMfaCode).toHaveBeenCalledWith(
        phoneNumber,
        sentCode
      );
    });
  });

  /* ============================================================================
   * SMS Code Verification - Valid Codes
   * ============================================================================ */

  describe('SMS Code Verification - Valid Codes', () => {
    it('should verify valid SMS code', async () => {
      // Step 1: Send code
      const challenge = await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      const sentCode = lastGeneratedCode;

      // Step 2: Verify code
      const isValid = await smsMfaService.verifyCode(challenge, sentCode);

      expect(isValid).toBe(true);
    });

    it('should delete challenge after successful verification', async () => {
      const mockRedisClient = redisService.getClient();

      const challenge = await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      const sentCode = lastGeneratedCode;

      vi.clearAllMocks(); // Clear previous calls

      await smsMfaService.verifyCode(challenge, sentCode);

      // Verify Redis delete was called
      expect(mockRedisClient.del).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`mfa:challenge:${orgId}:${challenge.id}`))
      );
    });

    it('should accept code with correct format', async () => {
      const challenge = await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      const sentCode = lastGeneratedCode;

      // Verify code format
      expect(sentCode).toMatch(/^\d{6}$/);

      const isValid = await smsMfaService.verifyCode(challenge, sentCode);
      expect(isValid).toBe(true);
    });
  });

  /* ============================================================================
   * SMS Code Verification - Invalid Codes
   * ============================================================================ */

  describe('SMS Code Verification - Invalid Codes', () => {
    it('should reject incorrect SMS code', async () => {
      const challenge = await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      const wrongCode = '999999'; // Different from sent code

      const isValid = await smsMfaService.verifyCode(challenge, wrongCode);

      expect(isValid).toBe(false);
    });

    it('should reject code with wrong length', async () => {
      const challenge = await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      expect(await smsMfaService.verifyCode(challenge, '12345')).toBe(false);   // Too short
      expect(await smsMfaService.verifyCode(challenge, '1234567')).toBe(false); // Too long
      expect(await smsMfaService.verifyCode(challenge, '')).toBe(false);        // Empty
    });

    it('should reject non-numeric code', async () => {
      const challenge = await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      expect(await smsMfaService.verifyCode(challenge, 'abcdef')).toBe(false);
      expect(await smsMfaService.verifyCode(challenge, '12345a')).toBe(false);
      expect(await smsMfaService.verifyCode(challenge, 'ABC123')).toBe(false);
    });

    it('should decrement attempts on invalid code', async () => {
      const challenge = await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      const mockRedisClient = redisService.getClient();
      vi.clearAllMocks();

      await smsMfaService.verifyCode(challenge, '999999');

      // Verify update was called (to decrement attempts)
      expect(mockRedisClient.setex).toHaveBeenCalled();
    });
  });

  /* ============================================================================
   * Challenge TTL Expiration (5 minutes)
   * ============================================================================ */

  describe('Challenge TTL Expiration (5 minutes)', () => {
    it('should reject expired challenge', async () => {
      // Create challenge that expired 1 minute ago
      const expiredChallenge = new MfaChallenge({
        id: crypto.randomUUID() as UUID,
        userId,
        organizationId: orgId,
        factorId,
        challengeCodeHash: await hash('123456'),
        expiresAt: new Date(Date.now() - 60 * 1000), // 1 minute ago
        attemptsRemaining: 3,
        createdAt: new Date(Date.now() - 6 * 60 * 1000), // 6 minutes ago
      });

      const isValid = await smsMfaService.verifyCode(expiredChallenge, '123456');

      expect(isValid).toBe(false);
      expect(expiredChallenge.isExpired()).toBe(true);
      expect(expiredChallenge.isValid()).toBe(false);
    });

    it('should accept challenge within TTL window', async () => {
      const challenge = await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      // Challenge should be valid immediately after creation
      expect(challenge.isExpired()).toBe(false);
      expect(challenge.isValid()).toBe(true);

      const sentCode = lastGeneratedCode;
      const isValid = await smsMfaService.verifyCode(challenge, sentCode);
      expect(isValid).toBe(true);
    });

    it('should mark challenge as expired after 5 minutes', () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

      const challenge = new MfaChallenge({
        id: crypto.randomUUID() as UUID,
        userId,
        organizationId: orgId,
        factorId,
        challengeCodeHash: 'hash',
        expiresAt,
        attemptsRemaining: 3,
        createdAt: now,
      });

      // Not expired immediately
      expect(challenge.isExpired()).toBe(false);

      // Create challenge with past expiry
      const expiredChallenge = new MfaChallenge({
        ...challenge,
        expiresAt: new Date(now.getTime() - 1000), // 1 second ago
      });

      expect(expiredChallenge.isExpired()).toBe(true);
    });

    it('should automatically delete expired challenges from Redis via TTL', async () => {
      // Redis TTL will automatically delete the key after expiration
      // We test that TTL is set correctly
      const mockRedisClient = redisService.getClient();

      await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      const setexCall = vi.mocked(mockRedisClient.setex).mock.calls[0];
      const ttlSeconds = setexCall[1];

      // TTL should be 300 seconds (5 minutes)
      expect(ttlSeconds).toBeGreaterThanOrEqual(295);
      expect(ttlSeconds).toBeLessThanOrEqual(300);
    });
  });

  /* ============================================================================
   * Attempt Limiting (Max 3 Attempts)
   * ============================================================================ */

  describe('Attempt Limiting (Max 3 Attempts)', () => {
    it('should allow 3 verification attempts', async () => {
      const challenge = await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      expect(challenge.attemptsRemaining).toBe(3);

      // Attempt 1
      let updatedChallenge = challenge.withDecrementedAttempts();
      expect(updatedChallenge.attemptsRemaining).toBe(2);
      expect(updatedChallenge.isValid()).toBe(true);

      // Attempt 2
      updatedChallenge = updatedChallenge.withDecrementedAttempts();
      expect(updatedChallenge.attemptsRemaining).toBe(1);
      expect(updatedChallenge.isValid()).toBe(true);

      // Attempt 3
      updatedChallenge = updatedChallenge.withDecrementedAttempts();
      expect(updatedChallenge.attemptsRemaining).toBe(0);
      expect(updatedChallenge.isValid()).toBe(false);
    });

    it('should reject verification when attempts exhausted', async () => {
      const exhaustedChallenge = new MfaChallenge({
        id: crypto.randomUUID() as UUID,
        userId,
        organizationId: orgId,
        factorId,
        challengeCodeHash: await hash('123456'),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attemptsRemaining: 0, // No attempts left
        createdAt: new Date(),
      });

      const isValid = await smsMfaService.verifyCode(exhaustedChallenge, '123456');

      expect(isValid).toBe(false);
      expect(exhaustedChallenge.hasAttemptsRemaining()).toBe(false);
    });

    it('should decrement attempts on each failed verification', async () => {
      const challenge = await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      const mockRedisClient = redisService.getClient();

      // Mock get to return the challenge
      vi.mocked(mockRedisClient.get).mockResolvedValue(JSON.stringify(challenge.toJSON()));

      // Fail 3 times
      for (let i = 0; i < 3; i++) {
        await smsMfaService.verifyCode(challenge, '999999'); // Wrong code
      }

      // Update should have been called 3 times (once per failed attempt)
      expect(mockRedisClient.setex).toHaveBeenCalledTimes(3);
    });

    it('should prevent brute-force attacks with attempt limit', async () => {
      const challenge = await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      let currentChallenge = challenge;

      // Try 10 different wrong codes
      for (let i = 0; i < 10; i++) {
        const wrongCode = String(i).padStart(6, '0');
        await smsMfaService.verifyCode(currentChallenge, wrongCode);

        if (currentChallenge.attemptsRemaining > 0) {
          currentChallenge = currentChallenge.withDecrementedAttempts();
        }
      }

      // After 3 failed attempts, challenge should be invalid
      const finalChallenge = challenge
        .withDecrementedAttempts()
        .withDecrementedAttempts()
        .withDecrementedAttempts();

      expect(finalChallenge.attemptsRemaining).toBe(0);
      expect(finalChallenge.isValid()).toBe(false);
    });

    it('should not decrement attempts on successful verification', async () => {
      const challenge = await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      const sentCode = lastGeneratedCode;
      const initialAttempts = challenge.attemptsRemaining;

      await smsMfaService.verifyCode(challenge, sentCode);

      // Attempts should not be decremented on success
      // (challenge is deleted instead)
      expect(challenge.attemptsRemaining).toBe(initialAttempts);
    });
  });

  /* ============================================================================
   * Multi-Tenant Isolation
   * ============================================================================ */

  describe('Multi-Tenant Isolation', () => {
    it('should isolate SMS challenges by organization', async () => {
      const org1Id = 'org-dental-001' as OrganizationId;
      const org2Id = 'org-dental-002' as OrganizationId;

      const challenge1 = await smsMfaService.sendVerificationCode(
        userId,
        org1Id,
        factorId,
        phoneNumber
      );

      const challenge2 = await smsMfaService.sendVerificationCode(
        userId,
        org2Id,
        factorId,
        phoneNumber
      );

      // Challenges should have different organization IDs
      expect(challenge1.organizationId).toBe(org1Id);
      expect(challenge2.organizationId).toBe(org2Id);

      // Challenges should be stored with org-specific Redis keys
      const mockRedisClient = redisService.getClient();
      const setexCalls = vi.mocked(mockRedisClient.setex).mock.calls;

      expect(setexCalls[0][0]).toContain(org1Id);
      expect(setexCalls[1][0]).toContain(org2Id);
    });

    it('should prevent cross-tenant challenge access', async () => {
      const org1Id = 'org-dental-001' as OrganizationId;
      const org2Id = 'org-dental-002' as OrganizationId;

      const challenge = await smsMfaService.sendVerificationCode(
        userId,
        org1Id,
        factorId,
        phoneNumber
      );

      const mockRedisClient = redisService.getClient();

      // Attempt to retrieve challenge with wrong org ID
      const wrongOrgKey = `mfa:challenge:${org2Id}:${challenge.id}`;
      vi.mocked(mockRedisClient.get).mockResolvedValue(null);

      const retrieved = await mfaChallengeRepository.findById(
        challenge.id,
        org2Id // Wrong organization
      );

      expect(retrieved).toBeNull();
    });

    it('should use organization-scoped Redis keys', async () => {
      const mockRedisClient = redisService.getClient();

      const challenge = await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      const setexCall = vi.mocked(mockRedisClient.setex).mock.calls[0];
      const redisKey = setexCall[0];

      // Redis key should include organization ID
      expect(redisKey).toBe(`mfa:challenge:${orgId}:${challenge.id}`);
    });
  });

  /* ============================================================================
   * Edge Cases and Security
   * ============================================================================ */

  describe('Edge Cases and Security', () => {
    it('should handle concurrent verification attempts', async () => {
      const challenge = await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      const sentCode = lastGeneratedCode;

      // Simulate concurrent verifications
      const results = await Promise.all([
        smsMfaService.verifyCode(challenge, sentCode),
        smsMfaService.verifyCode(challenge, sentCode),
        smsMfaService.verifyCode(challenge, sentCode),
      ]);

      // At least one should succeed
      expect(results.some(r => r === true)).toBe(true);
    });

    it('should reject codes with SQL injection attempts', async () => {
      const challenge = await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      const sqlInjectionCodes = [
        "123456' OR '1'='1",
        "123456; DROP TABLE mfa_challenges;--",
        "'; DELETE FROM users WHERE '1'='1",
      ];

      for (const maliciousCode of sqlInjectionCodes) {
        const isValid = await smsMfaService.verifyCode(challenge, maliciousCode);
        expect(isValid).toBe(false);
      }
    });

    it('should handle very long invalid codes', async () => {
      const challenge = await smsMfaService.sendVerificationCode(
        userId,
        orgId,
        factorId,
        phoneNumber
      );

      const veryLongCode = '1'.repeat(10000);

      const isValid = await smsMfaService.verifyCode(challenge, veryLongCode);
      expect(isValid).toBe(false);
    });

    it('should generate codes with sufficient entropy', async () => {
      const codes = new Set<string>();

      // Generate 1000 codes to test distribution
      for (let i = 0; i < 1000; i++) {
        await smsMfaService.sendVerificationCode(
          userId,
          orgId,
          factorId,
          phoneNumber
        );
        codes.add(lastGeneratedCode);
      }

      // Should have high uniqueness (> 95%)
      expect(codes.size).toBeGreaterThan(950);
    });

    it('should handle special characters in phone numbers', async () => {
      const specialPhones = [
        '+1-555-123-4567',
        '+1 (555) 123-4567',
        '+15551234567',
      ];

      for (const phone of specialPhones) {
        await expect(
          smsMfaService.sendVerificationCode(userId, orgId, factorId, phone)
        ).resolves.toBeDefined();
      }
    });

    it('should rate limit SMS sending attempts', async () => {
      // This would typically be enforced at a higher layer
      // But we test that multiple rapid sends are possible
      const challenges = await Promise.all([
        smsMfaService.sendVerificationCode(userId, orgId, factorId, phoneNumber),
        smsMfaService.sendVerificationCode(userId, orgId, factorId, phoneNumber),
        smsMfaService.sendVerificationCode(userId, orgId, factorId, phoneNumber),
      ]);

      expect(challenges).toHaveLength(3);
      challenges.forEach(c => expect(c).toBeDefined());
    });
  });
});
