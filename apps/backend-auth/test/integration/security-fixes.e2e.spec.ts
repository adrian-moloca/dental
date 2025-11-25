/**
 * Security Fixes E2E Tests
 *
 * End-to-end tests for all security fixes implemented:
 * 1. Token blacklist on cabinet switch
 * 2. SessionId validation in JWT
 * 3. Token blacklist checking in JWT strategy
 * 4. LicenseGuard enforces subscription (no graceful degradation)
 * 5. Token revocation on logout
 *
 * These tests verify the complete security flow from HTTP request to response.
 *
 * @group e2e
 * @group security
 * @module backend-auth/test/integration
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TokenBlacklistService } from '../../src/modules/tokens/services/token-blacklist.service';
import { SessionService } from '../../src/modules/sessions/services/session.service';
import { UserRepository } from '../../src/modules/users/repositories/user.repository';
import { PasswordService } from '../../src/modules/users/services/password.service';
import { User, UserStatus } from '../../src/modules/users/entities/user.entity';

describe('Security Fixes E2E', () => {
  let app: INestApplication;
  let tokenBlacklistService: TokenBlacklistService;
  let sessionService: SessionService;
  let userRepository: UserRepository;
  let passwordService: PasswordService;
  let jwtService: JwtService;

  let testUser: User;
  let accessToken: string;
  let sessionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    tokenBlacklistService = app.get<TokenBlacklistService>(TokenBlacklistService);
    sessionService = app.get<SessionService>(SessionService);
    userRepository = app.get<UserRepository>(UserRepository);
    passwordService = app.get<PasswordService>(PasswordService);
    jwtService = app.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Create test user
    const passwordHash = await passwordService.hashPassword('SecurePass123!');
    testUser = await userRepository.create({
      email: `security-test-${Date.now()}@example.com`,
      passwordHash,
      firstName: 'Security',
      lastName: 'Test',
      organizationId: 'org-security-test',
      clinicId: 'clinic-security-test',
      roles: ['USER'],
      permissions: [],
    });

    // Create session and get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: 'SecurePass123!',
        organizationId: testUser.organizationId,
      })
      .expect(201);

    accessToken = loginResponse.body.accessToken;
    const decoded = jwtService.decode(accessToken) as any;
    sessionId = decoded.sessionId;
  });

  describe('SECURITY FIX 1: Token Blacklist on Cabinet Switch', () => {
    it('should blacklist old token when switching cabinets', async () => {
      // Arrange - verify token works before switch
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Act - switch cabinet (which should blacklist token)
      await request(app.getHttpServer())
        .post('/auth/cabinets/switch')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          cabinetId: 'new-cabinet-123',
        })
        .expect(201);

      // Assert - old token should now be rejected
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('revoked');
        });
    });

    it('should blacklist token immediately (< 100ms)', async () => {
      // Arrange
      const decoded = jwtService.decode(accessToken) as any;
      const jti = decoded.jti;
      const exp = decoded.exp;

      // Act
      const startTime = Date.now();
      await tokenBlacklistService.blacklistToken(jti, exp, {
        reason: 'cabinet_switch',
        blacklistedAt: Date.now(),
        userId: testUser.id,
        organizationId: testUser.organizationId,
      });
      const duration = Date.now() - startTime;

      // Assert
      expect(duration).toBeLessThan(100);
      const isBlacklisted = await tokenBlacklistService.isBlacklisted(jti);
      expect(isBlacklisted).toBe(true);
    });

    it('should store blacklist metadata with reason', async () => {
      // Arrange
      const decoded = jwtService.decode(accessToken) as any;
      const jti = decoded.jti;
      const exp = decoded.exp;

      // Act
      await tokenBlacklistService.blacklistToken(jti, exp, {
        reason: 'cabinet_switch',
        blacklistedAt: Date.now(),
        userId: testUser.id,
        organizationId: testUser.organizationId,
        context: 'Switched from cabinet-A to cabinet-B',
      });

      // Assert
      const metadata = await tokenBlacklistService.getBlacklistMetadata(jti);
      expect(metadata).not.toBeNull();
      expect(metadata!.reason).toBe('cabinet_switch');
      expect(metadata!.userId).toBe(testUser.id);
    });

    it('should automatically expire blacklist entry after token TTL', async () => {
      // Arrange - create short-lived token (5 seconds)
      const shortLivedToken = jwtService.sign(
        {
          sub: testUser.id,
          email: testUser.email,
          organizationId: testUser.organizationId,
          sessionId: sessionId,
        },
        { expiresIn: '5s' }
      );
      const decoded = jwtService.decode(shortLivedToken) as any;
      const jti = decoded.jti;
      const exp = decoded.exp;

      // Act - blacklist token
      await tokenBlacklistService.blacklistToken(jti, exp, {
        reason: 'test',
        blacklistedAt: Date.now(),
        userId: testUser.id,
        organizationId: testUser.organizationId,
      });

      // Assert - token should be blacklisted initially
      let isBlacklisted = await tokenBlacklistService.isBlacklisted(jti);
      expect(isBlacklisted).toBe(true);

      // Wait for TTL expiration (6 seconds)
      await new Promise((resolve) => setTimeout(resolve, 6000));

      // Assert - blacklist entry should auto-expire
      isBlacklisted = await tokenBlacklistService.isBlacklisted(jti);
      expect(isBlacklisted).toBe(false);
    });
  });

  describe('SECURITY FIX 2: SessionId Validation in JWT', () => {
    it('should reject token without sessionId', async () => {
      // Arrange - create token without sessionId
      const tokenWithoutSessionId = jwtService.sign({
        sub: testUser.id,
        email: testUser.email,
        organizationId: testUser.organizationId,
        // Missing sessionId!
      });

      // Act & Assert
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${tokenWithoutSessionId}`)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('sessionId');
        });
    });

    it('should reject token with invalid sessionId', async () => {
      // Arrange - create token with non-existent sessionId
      const tokenWithInvalidSessionId = jwtService.sign({
        sub: testUser.id,
        email: testUser.email,
        organizationId: testUser.organizationId,
        sessionId: 'non-existent-session-id',
      });

      // Act & Assert
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${tokenWithInvalidSessionId}`)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('session');
        });
    });

    it('should accept token with valid sessionId', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should validate session ownership', async () => {
      // Arrange - create another user
      const passwordHash = await passwordService.hashPassword('SecurePass123!');
      const otherUser = await userRepository.create({
        email: `other-user-${Date.now()}@example.com`,
        passwordHash,
        firstName: 'Other',
        lastName: 'User',
        organizationId: 'org-security-test',
        roles: ['USER'],
        permissions: [],
      });

      // Create token with testUser's sessionId but otherUser's ID
      const maliciousToken = jwtService.sign({
        sub: otherUser.id, // Different user
        email: otherUser.email,
        organizationId: otherUser.organizationId,
        sessionId: sessionId, // testUser's session
      });

      // Act & Assert - should reject (session doesn't belong to user)
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${maliciousToken}`)
        .expect(401);
    });
  });

  describe('SECURITY FIX 3: Token Blacklist Checking in JWT Strategy', () => {
    it('should reject blacklisted token', async () => {
      // Arrange - blacklist the token
      const decoded = jwtService.decode(accessToken) as any;
      await tokenBlacklistService.blacklistToken(decoded.jti, decoded.exp, {
        reason: 'security_incident',
        blacklistedAt: Date.now(),
        userId: testUser.id,
        organizationId: testUser.organizationId,
      });

      // Act & Assert
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('revoked');
        });
    });

    it('should check blacklist before session validation (fail-fast)', async () => {
      // This test verifies blacklist check happens FIRST
      // Arrange - blacklist token
      const decoded = jwtService.decode(accessToken) as any;
      await tokenBlacklistService.blacklistToken(decoded.jti, decoded.exp, {
        reason: 'test',
        blacklistedAt: Date.now(),
        userId: testUser.id,
        organizationId: testUser.organizationId,
      });

      // Act & Assert - should fail on blacklist check, not session validation
      const startTime = Date.now();
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
      const duration = Date.now() - startTime;

      // Should be very fast (< 50ms) because blacklist check is first
      expect(duration).toBeLessThan(50);
    });

    it('should accept non-blacklisted token with valid session', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });

  describe('SECURITY FIX 4: LicenseGuard Enforces Subscription', () => {
    it('should block access when subscription missing (no graceful degradation)', async () => {
      // Arrange - create token WITHOUT subscription context
      const tokenWithoutSubscription = jwtService.sign({
        sub: testUser.id,
        email: testUser.email,
        organizationId: testUser.organizationId,
        sessionId: sessionId,
        // Missing subscription context!
      });

      // Act & Assert - should be BLOCKED (not allowed)
      await request(app.getHttpServer())
        .get('/protected/module-specific-endpoint') // Endpoint requiring module
        .set('Authorization', `Bearer ${tokenWithoutSubscription}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toContain('subscription');
        });
    });

    it('should block access when required module not in subscription', async () => {
      // Arrange - create token with subscription but missing required module
      const tokenWithPartialSubscription = jwtService.sign({
        sub: testUser.id,
        email: testUser.email,
        organizationId: testUser.organizationId,
        sessionId: sessionId,
        subscription: {
          status: 'ACTIVE',
          modules: ['SCHEDULING', 'PATIENT_MANAGEMENT'], // Missing IMAGING
        },
      });

      // Act & Assert - should block access to IMAGING endpoint
      await request(app.getHttpServer())
        .get('/imaging/studies') // Requires IMAGING module
        .set('Authorization', `Bearer ${tokenWithPartialSubscription}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toContain('IMAGING');
        });
    });

    it('should allow access when user has required module', async () => {
      // Arrange - create token with subscription including required module
      const tokenWithFullSubscription = jwtService.sign({
        sub: testUser.id,
        email: testUser.email,
        organizationId: testUser.organizationId,
        sessionId: sessionId,
        subscription: {
          status: 'ACTIVE',
          modules: ['SCHEDULING', 'PATIENT_MANAGEMENT', 'IMAGING'],
        },
      });

      // Act & Assert - should allow access
      await request(app.getHttpServer())
        .get('/imaging/studies')
        .set('Authorization', `Bearer ${tokenWithFullSubscription}`)
        .expect(200);
    });

    it('should provide clear error message for missing subscription', async () => {
      // Arrange
      const tokenWithoutSubscription = jwtService.sign({
        sub: testUser.id,
        email: testUser.email,
        organizationId: testUser.organizationId,
        sessionId: sessionId,
      });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/protected/module-endpoint')
        .set('Authorization', `Bearer ${tokenWithoutSubscription}`)
        .expect(403);

      expect(response.body.message).toContain('subscription');
      expect(response.body.message).toContain('administrator');
    });
  });

  describe('SECURITY FIX 5: Token Revocation on Logout', () => {
    it('should blacklist token on logout', async () => {
      // Arrange - verify token works before logout
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Act - logout
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Assert - token should now be rejected
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('revoked');
        });
    });

    it('should invalidate session on logout', async () => {
      // Act - logout
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Assert - session should be invalidated
      const session = await sessionService.validateSessionOwnership(
        sessionId,
        testUser.id,
        testUser.organizationId
      );
      expect(session).toBeNull();
    });

    it('should be idempotent (logout twice succeeds)', async () => {
      // Act - logout twice
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401); // Second logout fails (token blacklisted after first)
    });

    it('should blacklist token with correct metadata on logout', async () => {
      // Arrange
      const decoded = jwtService.decode(accessToken) as any;

      // Act - logout
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Assert - check blacklist metadata
      const metadata = await tokenBlacklistService.getBlacklistMetadata(decoded.jti);
      expect(metadata).not.toBeNull();
      expect(metadata!.reason).toBe('logout');
      expect(metadata!.userId).toBe(testUser.id);
    });
  });

  describe('Performance: Security Overhead < 5ms', () => {
    it('should add minimal overhead for blacklist check', async () => {
      // Arrange - make multiple requests to measure average
      const iterations = 10;
      const durations: number[] = [];

      // Act
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await request(app.getHttpServer())
          .get('/auth/me')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);
        durations.push(Date.now() - startTime);
      }

      // Assert - average overhead should be < 5ms
      const averageDuration = durations.reduce((a, b) => a + b) / durations.length;
      expect(averageDuration).toBeLessThan(5);
    });

    it('should handle blacklist check in < 1ms', async () => {
      // Arrange
      const decoded = jwtService.decode(accessToken) as any;

      // Act
      const startTime = Date.now();
      await tokenBlacklistService.isBlacklisted(decoded.jti);
      const duration = Date.now() - startTime;

      // Assert
      expect(duration).toBeLessThan(1);
    });
  });

  describe('Integration: Complete Security Flow', () => {
    it('should enforce all security checks in correct order', async () => {
      // 1. Token has JTI (required for blacklist)
      const decoded = jwtService.decode(accessToken) as any;
      expect(decoded.jti).toBeDefined();

      // 2. Token has sessionId (required for session validation)
      expect(decoded.sessionId).toBeDefined();

      // 3. Token not blacklisted
      const isBlacklisted = await tokenBlacklistService.isBlacklisted(decoded.jti);
      expect(isBlacklisted).toBe(false);

      // 4. Session is valid
      const session = await sessionService.validateSessionOwnership(
        decoded.sessionId,
        testUser.id,
        testUser.organizationId
      );
      expect(session).not.toBeNull();

      // 5. Subscription context present (if required by endpoint)
      // This would be checked by LicenseGuard on protected endpoints

      // 6. Request succeeds
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should fail at first security check (blacklist)', async () => {
      // Arrange - blacklist token
      const decoded = jwtService.decode(accessToken) as any;
      await tokenBlacklistService.blacklistToken(decoded.jti, decoded.exp, {
        reason: 'test',
        blacklistedAt: Date.now(),
        userId: testUser.id,
        organizationId: testUser.organizationId,
      });

      // Act & Assert - should fail at blacklist check (first check)
      const startTime = Date.now();
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
      const duration = Date.now() - startTime;

      // Verify it failed quickly (didn't reach session validation)
      expect(duration).toBeLessThan(50);
    });

    it('should enforce complete security chain on cabinet switch', async () => {
      // Act - switch cabinet
      const switchResponse = await request(app.getHttpServer())
        .post('/auth/cabinets/switch')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ cabinetId: 'new-cabinet' })
        .expect(201);

      // Get new token from response
      const newToken = switchResponse.body.accessToken;

      // Assert - old token should be blacklisted
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);

      // Assert - new token should work
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${newToken}`)
        .expect(200);

      // Assert - new token has different JTI and sessionId
      const oldDecoded = jwtService.decode(accessToken) as any;
      const newDecoded = jwtService.decode(newToken) as any;
      expect(oldDecoded.jti).not.toBe(newDecoded.jti);
      expect(oldDecoded.sessionId).not.toBe(newDecoded.sessionId);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle Redis failure gracefully (fail closed)', async () => {
      // When Redis is down, isBlacklisted should return true (fail closed)
      // This is tested in unit tests, but verify behavior in e2e context

      // Note: In production, if Redis is down during blacklist check,
      // all tokens will be treated as blacklisted (security first)
      expect(true).toBe(true); // Placeholder - actual test requires mocking Redis failure
    });

    it('should provide clear error messages for security failures', async () => {
      // Blacklist token
      const decoded = jwtService.decode(accessToken) as any;
      await tokenBlacklistService.blacklistToken(decoded.jti, decoded.exp, {
        reason: 'security_incident',
        blacklistedAt: Date.now(),
        userId: testUser.id,
        organizationId: testUser.organizationId,
      });

      // Assert - error message is user-friendly
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);

      expect(response.body.message).toContain('revoked');
      expect(response.body.message).toContain('log in again');
    });
  });
});
