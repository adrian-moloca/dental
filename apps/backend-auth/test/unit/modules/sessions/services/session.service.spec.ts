/**
 * SessionService Unit Tests
 *
 * Tests cover:
 * - Session creation with device tracking
 * - Session limit enforcement (max 5 per user)
 * - Refresh token validation (hash verification)
 * - Session rotation (activity updates)
 * - Session invalidation (logout, revocation)
 * - Bulk session invalidation (all devices)
 * - Active session listing
 * - Multi-tenant isolation
 *
 * Security Test Coverage:
 * - Token hash verification with Argon2id
 * - Expired session rejection
 * - Revoked session rejection
 * - Session limit prevents resource exhaustion
 * - Oldest sessions revoked when limit exceeded
 *
 * @group unit
 * @module backend-auth/test/unit/modules/sessions/services
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { SessionService } from '../../../../../src/modules/sessions/services/session.service';
import { SessionRepository } from '../../../../../src/modules/sessions/repositories/session.repository';
import { PasswordService } from '../../../../../src/modules/users/services/password.service';
import { Session, DeviceInfo } from '../../../../../src/modules/sessions/entities/session.entity';
import { AuthenticationError } from '@dentalos/shared-errors';
import { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';

describe('SessionService', () => {
  let sessionService: SessionService;
  let sessionRepository: SessionRepository;
  let passwordService: PasswordService;
  let configService: ConfigService;

  // Test fixtures
  const orgId = 'org-123' as OrganizationId;
  const userId = 'user-456' as UUID;
  const clinicId = 'clinic-789' as ClinicId;
  const refreshToken = 'refresh-token-abc123';
  const tokenHash = 'a'.repeat(97); // Typical Argon2id hash length

  const validDeviceInfo: DeviceInfo = {
    deviceId: 'b'.repeat(64),
    deviceName: 'Chrome 120 on Windows 11',
    ipAddress: '192.168.1.xxx',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
  };

  const createMockRequest = (): Request => {
    return {
      headers: {
        'user-agent': validDeviceInfo.userAgent,
      },
      ip: '192.168.1.100',
    } as unknown as Request;
  };

  const createTestSession = (overrides: Partial<Session> = {}): Session => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return new Session({
      id: `session-${Math.random().toString(36).substr(2, 9)}` as UUID,
      userId,
      organizationId: orgId,
      clinicId,
      refreshTokenHash: tokenHash,
      deviceInfo: validDeviceInfo,
      createdAt: now,
      expiresAt,
      lastActivityAt: now,
      ...overrides,
    });
  };

  beforeEach(() => {
    // Mock SessionRepository
    sessionRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByTokenHash: vi.fn(),
      findByUserId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteAllByUserId: vi.fn(),
    } as any;

    // Mock PasswordService
    passwordService = {
      hashPassword: vi.fn().mockResolvedValue(tokenHash),
      verifyPassword: vi.fn().mockResolvedValue(true),
    } as any;

    // Mock ConfigService
    configService = {
      get: vi.fn((key: string, defaultValue?: any) => {
        if (key === 'session.maxPerUser') return defaultValue || 5;
        if (key === 'session.ttlDays') return defaultValue || 7;
        return defaultValue;
      }),
    } as any;

    sessionService = new SessionService(
      sessionRepository,
      passwordService,
      configService
    );
  });

  describe('createSession() - Session Creation', () => {
    it('should create session with valid parameters', async () => {
      const request = createMockRequest();
      const session = createTestSession();

      vi.mocked(sessionRepository.create).mockResolvedValue(session);
      vi.mocked(sessionRepository.findByUserId).mockResolvedValue([]);

      const created = await sessionService.createSession({
        userId,
        organizationId: orgId,
        clinicId,
        refreshToken,
        request,
      });

      expect(created).toBeDefined();
      expect(sessionRepository.create).toHaveBeenCalled();
      expect(passwordService.hashPassword).toHaveBeenCalledWith(refreshToken);
    });

    it('should hash refresh token before storage', async () => {
      const request = createMockRequest();
      vi.mocked(sessionRepository.findByUserId).mockResolvedValue([]);

      await sessionService.createSession({
        userId,
        organizationId: orgId,
        refreshToken,
        request,
      });

      expect(passwordService.hashPassword).toHaveBeenCalledWith(refreshToken);
      expect(sessionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          refreshTokenHash: tokenHash,
        })
      );
    });

    it('should extract device metadata from request', async () => {
      const request = createMockRequest();
      vi.mocked(sessionRepository.findByUserId).mockResolvedValue([]);

      await sessionService.createSession({
        userId,
        organizationId: orgId,
        refreshToken,
        request,
      });

      expect(sessionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          deviceInfo: expect.objectContaining({
            deviceId: expect.stringMatching(/^[a-f0-9]{64}$/i),
            deviceName: expect.any(String),
            ipAddress: expect.stringContaining('xxx'),
            userAgent: expect.any(String),
          }),
        })
      );
    });

    it('should set expiration date based on configured TTL', async () => {
      const request = createMockRequest();
      vi.mocked(sessionRepository.findByUserId).mockResolvedValue([]);

      await sessionService.createSession({
        userId,
        organizationId: orgId,
        refreshToken,
        request,
      });

      expect(sessionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresAt: expect.any(Date),
        })
      );

      const createCall = vi.mocked(sessionRepository.create).mock.calls[0][0];
      const ttlDays = Math.floor(
        (createCall.expiresAt.getTime() - createCall.createdAt.getTime()) /
          (24 * 60 * 60 * 1000)
      );

      expect(ttlDays).toBe(7);
    });

    it('should create session without clinicId (optional)', async () => {
      const request = createMockRequest();
      vi.mocked(sessionRepository.findByUserId).mockResolvedValue([]);

      await sessionService.createSession({
        userId,
        organizationId: orgId,
        refreshToken,
        request,
      });

      expect(sessionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          organizationId: orgId,
          clinicId: undefined,
        })
      );
    });

    it('should enforce session limit before creating new session', async () => {
      const request = createMockRequest();
      const existingSessions = Array.from({ length: 5 }, () => createTestSession());

      vi.mocked(sessionRepository.findByUserId).mockResolvedValue(existingSessions);

      await sessionService.createSession({
        userId,
        organizationId: orgId,
        refreshToken,
        request,
      });

      // Should revoke oldest session
      expect(sessionRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          revokedAt: expect.any(Date),
          revokedReason: 'session_limit_exceeded',
        })
      );
    });

    it('should revoke oldest sessions when limit exceeded', async () => {
      const request = createMockRequest();
      const now = new Date();

      // Create 5 existing sessions with different creation times
      const existingSessions = Array.from({ length: 5 }, (_, i) =>
        createTestSession({
          createdAt: new Date(now.getTime() - (5 - i) * 60000), // Oldest to newest
        })
      );

      vi.mocked(sessionRepository.findByUserId).mockResolvedValue(existingSessions);

      await sessionService.createSession({
        userId,
        organizationId: orgId,
        refreshToken,
        request,
      });

      // Should revoke the oldest session (first one)
      expect(sessionRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existingSessions[0].id,
          revokedReason: 'session_limit_exceeded',
        })
      );
    });

    it('should not revoke sessions if below limit', async () => {
      const request = createMockRequest();
      const existingSessions = Array.from({ length: 3 }, () => createTestSession());

      vi.mocked(sessionRepository.findByUserId).mockResolvedValue(existingSessions);

      await sessionService.createSession({
        userId,
        organizationId: orgId,
        refreshToken,
        request,
      });

      // Should not call update for revocation
      expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it('should only count active sessions for limit enforcement', async () => {
      const request = createMockRequest();
      const activeSessions = Array.from({ length: 3 }, () => createTestSession());
      const revokedSessions = Array.from({ length: 2 }, () =>
        createTestSession({
          revokedAt: new Date(),
          revokedReason: 'user_logout',
        })
      );

      vi.mocked(sessionRepository.findByUserId).mockResolvedValue([
        ...activeSessions,
        ...revokedSessions,
      ]);

      await sessionService.createSession({
        userId,
        organizationId: orgId,
        refreshToken,
        request,
      });

      // Should not revoke any sessions (only 3 active)
      expect(sessionRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('validateRefreshToken() - Token Validation', () => {
    it('should validate correct refresh token', async () => {
      const session = createTestSession();

      vi.mocked(sessionRepository.findByTokenHash).mockResolvedValue(session);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(true);

      const result = await sessionService.validateRefreshToken(refreshToken, orgId);

      expect(result).toEqual(session);
      expect(passwordService.hashPassword).toHaveBeenCalledWith(refreshToken);
      expect(passwordService.verifyPassword).toHaveBeenCalledWith(
        refreshToken,
        session.refreshTokenHash
      );
    });

    it('should throw AuthenticationError for invalid token hash', async () => {
      vi.mocked(sessionRepository.findByTokenHash).mockResolvedValue(null);

      await expect(
        sessionService.validateRefreshToken(refreshToken, orgId)
      ).rejects.toThrow(AuthenticationError);

      await expect(
        sessionService.validateRefreshToken(refreshToken, orgId)
      ).rejects.toThrow(/Invalid refresh token/);
    });

    it('should throw AuthenticationError for expired session', async () => {
      const now = new Date();
      const expiredSession = createTestSession({
        expiresAt: new Date(now.getTime() - 1000), // Expired 1 second ago
      });

      vi.mocked(sessionRepository.findByTokenHash).mockResolvedValue(expiredSession);

      await expect(
        sessionService.validateRefreshToken(refreshToken, orgId)
      ).rejects.toThrow(AuthenticationError);

      await expect(
        sessionService.validateRefreshToken(refreshToken, orgId)
      ).rejects.toThrow(/Session expired/);
    });

    it('should throw AuthenticationError for revoked session', async () => {
      const revokedSession = createTestSession({
        revokedAt: new Date(),
        revokedReason: 'user_logout',
      });

      vi.mocked(sessionRepository.findByTokenHash).mockResolvedValue(revokedSession);

      await expect(
        sessionService.validateRefreshToken(refreshToken, orgId)
      ).rejects.toThrow(AuthenticationError);

      await expect(
        sessionService.validateRefreshToken(refreshToken, orgId)
      ).rejects.toThrow(/Session revoked/);
    });

    it('should throw AuthenticationError when hash verification fails', async () => {
      const session = createTestSession();

      vi.mocked(sessionRepository.findByTokenHash).mockResolvedValue(session);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(false);

      await expect(
        sessionService.validateRefreshToken(refreshToken, orgId)
      ).rejects.toThrow(AuthenticationError);

      await expect(
        sessionService.validateRefreshToken(refreshToken, orgId)
      ).rejects.toThrow(/Invalid refresh token/);
    });

    it('should respect tenant isolation in token lookup', async () => {
      await sessionService.validateRefreshToken(refreshToken, orgId);

      expect(sessionRepository.findByTokenHash).toHaveBeenCalledWith(
        expect.any(String),
        orgId
      );
    });

    it('should include revocation reason in error message', async () => {
      const revokedSession = createTestSession({
        revokedAt: new Date(),
        revokedReason: 'password_changed',
      });

      vi.mocked(sessionRepository.findByTokenHash).mockResolvedValue(revokedSession);

      await expect(
        sessionService.validateRefreshToken(refreshToken, orgId)
      ).rejects.toThrow(/password_changed/);
    });
  });

  describe('rotateSession() - Session Rotation', () => {
    it('should update session activity timestamp', async () => {
      const session = createTestSession();
      const updatedSession = session.withUpdatedActivity();

      vi.mocked(sessionRepository.findById).mockResolvedValue(session);
      vi.mocked(sessionRepository.update).mockResolvedValue(updatedSession);

      const result = await sessionService.rotateSession(session.id, orgId);

      expect(result.lastActivityAt.getTime()).toBeGreaterThan(
        session.lastActivityAt.getTime()
      );
      expect(sessionRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          lastActivityAt: expect.any(Date),
        })
      );
    });

    it('should throw AuthenticationError when session not found', async () => {
      vi.mocked(sessionRepository.findById).mockResolvedValue(null);

      await expect(
        sessionService.rotateSession('nonexistent' as UUID, orgId)
      ).rejects.toThrow(AuthenticationError);

      await expect(
        sessionService.rotateSession('nonexistent' as UUID, orgId)
      ).rejects.toThrow(/Session not found/);
    });

    it('should throw AuthenticationError when session is expired', async () => {
      const now = new Date();
      const expiredSession = createTestSession({
        expiresAt: new Date(now.getTime() - 1000),
      });

      vi.mocked(sessionRepository.findById).mockResolvedValue(expiredSession);

      await expect(
        sessionService.rotateSession(expiredSession.id, orgId)
      ).rejects.toThrow(AuthenticationError);

      await expect(
        sessionService.rotateSession(expiredSession.id, orgId)
      ).rejects.toThrow(/no longer active/);
    });

    it('should throw AuthenticationError when session is revoked', async () => {
      const revokedSession = createTestSession({
        revokedAt: new Date(),
        revokedReason: 'user_logout',
      });

      vi.mocked(sessionRepository.findById).mockResolvedValue(revokedSession);

      await expect(
        sessionService.rotateSession(revokedSession.id, orgId)
      ).rejects.toThrow(AuthenticationError);

      await expect(
        sessionService.rotateSession(revokedSession.id, orgId)
      ).rejects.toThrow(/no longer active/);
    });

    it('should preserve all session fields except lastActivityAt', async () => {
      const session = createTestSession();
      const originalCreatedAt = session.createdAt.getTime();

      vi.mocked(sessionRepository.findById).mockResolvedValue(session);

      await sessionService.rotateSession(session.id, orgId);

      const updateCall = vi.mocked(sessionRepository.update).mock.calls[0][0];

      expect(updateCall.id).toBe(session.id);
      expect(updateCall.userId).toBe(session.userId);
      expect(updateCall.refreshTokenHash).toBe(session.refreshTokenHash);
      expect(updateCall.createdAt.getTime()).toBe(originalCreatedAt);
    });
  });

  describe('invalidateSession() - Single Session Revocation', () => {
    it('should revoke session with default reason', async () => {
      const session = createTestSession();
      const revokedSession = session.withRevocation('user_logout');

      vi.mocked(sessionRepository.findById).mockResolvedValue(session);
      vi.mocked(sessionRepository.update).mockResolvedValue(revokedSession);

      await sessionService.invalidateSession(session.id, orgId);

      expect(sessionRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          revokedAt: expect.any(Date),
          revokedReason: 'user_logout',
        })
      );
    });

    it('should revoke session with custom reason', async () => {
      const session = createTestSession();

      vi.mocked(sessionRepository.findById).mockResolvedValue(session);

      await sessionService.invalidateSession(session.id, orgId, 'admin_revoked');

      expect(sessionRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          revokedReason: 'admin_revoked',
        })
      );
    });

    it('should be idempotent (no error if session not found)', async () => {
      vi.mocked(sessionRepository.findById).mockResolvedValue(null);

      await expect(
        sessionService.invalidateSession('nonexistent' as UUID, orgId)
      ).resolves.not.toThrow();
    });

    it('should update already revoked session with new reason', async () => {
      const session = createTestSession({
        revokedAt: new Date(),
        revokedReason: 'user_logout',
      });

      vi.mocked(sessionRepository.findById).mockResolvedValue(session);

      await sessionService.invalidateSession(session.id, orgId, 'admin_revoked');

      expect(sessionRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          revokedReason: 'admin_revoked',
        })
      );
    });

    it('should respect all revocation reasons', async () => {
      const session = createTestSession();
      const reasons: Array<'user_logout' | 'admin_revoked' | 'password_changed'> = [
        'user_logout',
        'admin_revoked',
        'password_changed',
      ];

      vi.mocked(sessionRepository.findById).mockResolvedValue(session);

      for (const reason of reasons) {
        await sessionService.invalidateSession(session.id, orgId, reason);

        expect(sessionRepository.update).toHaveBeenCalledWith(
          expect.objectContaining({
            revokedReason: reason,
          })
        );
      }
    });
  });

  describe('invalidateAllUserSessions() - Bulk Revocation', () => {
    it('should invalidate all active sessions for user', async () => {
      const activeSessions = Array.from({ length: 3 }, () => createTestSession());

      vi.mocked(sessionRepository.findByUserId).mockResolvedValue(activeSessions);

      const count = await sessionService.invalidateAllUserSessions(userId, orgId);

      expect(count).toBe(3);
      expect(sessionRepository.update).toHaveBeenCalledTimes(3);
    });

    it('should only invalidate active sessions (skip revoked)', async () => {
      const activeSessions = Array.from({ length: 2 }, () => createTestSession());
      const revokedSessions = Array.from({ length: 2 }, () =>
        createTestSession({
          revokedAt: new Date(),
          revokedReason: 'user_logout',
        })
      );

      vi.mocked(sessionRepository.findByUserId).mockResolvedValue([
        ...activeSessions,
        ...revokedSessions,
      ]);

      const count = await sessionService.invalidateAllUserSessions(userId, orgId);

      expect(count).toBe(2);
      expect(sessionRepository.update).toHaveBeenCalledTimes(2);
    });

    it('should only invalidate non-expired sessions', async () => {
      const now = new Date();
      const activeSessions = Array.from({ length: 2 }, () => createTestSession());
      const expiredSessions = Array.from({ length: 1 }, () =>
        createTestSession({
          expiresAt: new Date(now.getTime() - 1000),
        })
      );

      vi.mocked(sessionRepository.findByUserId).mockResolvedValue([
        ...activeSessions,
        ...expiredSessions,
      ]);

      const count = await sessionService.invalidateAllUserSessions(userId, orgId);

      expect(count).toBe(2);
    });

    it('should return 0 when user has no active sessions', async () => {
      vi.mocked(sessionRepository.findByUserId).mockResolvedValue([]);

      const count = await sessionService.invalidateAllUserSessions(userId, orgId);

      expect(count).toBe(0);
      expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it('should use provided revocation reason for all sessions', async () => {
      const sessions = Array.from({ length: 2 }, () => createTestSession());

      vi.mocked(sessionRepository.findByUserId).mockResolvedValue(sessions);

      await sessionService.invalidateAllUserSessions(userId, orgId, 'password_changed');

      expect(sessionRepository.update).toHaveBeenCalledTimes(2);
      expect(sessionRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          revokedReason: 'password_changed',
        })
      );
    });

    it('should respect tenant isolation', async () => {
      await sessionService.invalidateAllUserSessions(userId, orgId);

      expect(sessionRepository.findByUserId).toHaveBeenCalledWith(userId, orgId);
    });
  });

  describe('getUserActiveSessions() - Session Listing', () => {
    it('should return all active sessions for user', async () => {
      const activeSessions = Array.from({ length: 3 }, () => createTestSession());

      vi.mocked(sessionRepository.findByUserId).mockResolvedValue(activeSessions);

      const dtos = await sessionService.getUserActiveSessions(userId, orgId);

      expect(dtos).toHaveLength(3);
      expect(dtos[0]).toHaveProperty('id');
      expect(dtos[0]).toHaveProperty('userId');
      expect(dtos[0]).toHaveProperty('deviceInfo');
      expect(dtos[0]).toHaveProperty('isActive');
    });

    it('should filter out revoked sessions', async () => {
      const activeSessions = Array.from({ length: 2 }, () => createTestSession());
      const revokedSessions = Array.from({ length: 1 }, () =>
        createTestSession({
          revokedAt: new Date(),
          revokedReason: 'user_logout',
        })
      );

      vi.mocked(sessionRepository.findByUserId).mockResolvedValue([
        ...activeSessions,
        ...revokedSessions,
      ]);

      const dtos = await sessionService.getUserActiveSessions(userId, orgId);

      expect(dtos).toHaveLength(2);
    });

    it('should filter out expired sessions', async () => {
      const now = new Date();
      const activeSessions = Array.from({ length: 2 }, () => createTestSession());
      const expiredSessions = Array.from({ length: 1 }, () =>
        createTestSession({
          expiresAt: new Date(now.getTime() - 1000),
        })
      );

      vi.mocked(sessionRepository.findByUserId).mockResolvedValue([
        ...activeSessions,
        ...expiredSessions,
      ]);

      const dtos = await sessionService.getUserActiveSessions(userId, orgId);

      expect(dtos).toHaveLength(2);
    });

    it('should exclude refreshTokenHash from DTOs', async () => {
      const sessions = [createTestSession()];

      vi.mocked(sessionRepository.findByUserId).mockResolvedValue(sessions);

      const dtos = await sessionService.getUserActiveSessions(userId, orgId);

      expect(dtos[0]).not.toHaveProperty('refreshTokenHash');
    });

    it('should return empty array when user has no active sessions', async () => {
      vi.mocked(sessionRepository.findByUserId).mockResolvedValue([]);

      const dtos = await sessionService.getUserActiveSessions(userId, orgId);

      expect(dtos).toEqual([]);
    });

    it('should include isActive status in DTOs', async () => {
      const sessions = [createTestSession()];

      vi.mocked(sessionRepository.findByUserId).mockResolvedValue(sessions);

      const dtos = await sessionService.getUserActiveSessions(userId, orgId);

      expect(dtos[0].isActive).toBe(true);
    });

    it('should include device information in DTOs', async () => {
      const sessions = [createTestSession()];

      vi.mocked(sessionRepository.findByUserId).mockResolvedValue(sessions);

      const dtos = await sessionService.getUserActiveSessions(userId, orgId);

      expect(dtos[0].deviceInfo).toEqual(validDeviceInfo);
      expect(dtos[0].deviceInfo.deviceName).toBeDefined();
      expect(dtos[0].deviceInfo.ipAddress).toBeDefined();
    });
  });

  describe('Configuration', () => {
    it('should use custom session limit from config', () => {
      const customConfig = {
        get: vi.fn((key: string) => {
          if (key === 'session.maxPerUser') return 10;
          if (key === 'session.ttlDays') return 7;
        }),
      } as any;

      const customService = new SessionService(
        sessionRepository,
        passwordService,
        customConfig
      );

      expect(customConfig.get).toHaveBeenCalledWith('session.maxPerUser', 5);
    });

    it('should use custom TTL from config', () => {
      const customConfig = {
        get: vi.fn((key: string) => {
          if (key === 'session.maxPerUser') return 5;
          if (key === 'session.ttlDays') return 30;
        }),
      } as any;

      const customService = new SessionService(
        sessionRepository,
        passwordService,
        customConfig
      );

      expect(customConfig.get).toHaveBeenCalledWith('session.ttlDays', 7);
    });

    it('should use default values when config not available', () => {
      const emptyConfig = {
        get: vi.fn((key: string, defaultValue: any) => defaultValue),
      } as any;

      const service = new SessionService(
        sessionRepository,
        passwordService,
        emptyConfig
      );

      expect(service).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle session creation with minimal request data', async () => {
      const minimalRequest = {
        headers: {},
        ip: undefined,
      } as unknown as Request;

      vi.mocked(sessionRepository.findByUserId).mockResolvedValue([]);

      await sessionService.createSession({
        userId,
        organizationId: orgId,
        refreshToken,
        request: minimalRequest,
      });

      expect(sessionRepository.create).toHaveBeenCalled();
    });

    it('should handle concurrent session limit enforcement', async () => {
      const request = createMockRequest();
      const sessions = Array.from({ length: 5 }, () => createTestSession());

      vi.mocked(sessionRepository.findByUserId).mockResolvedValue(sessions);

      await Promise.all([
        sessionService.createSession({
          userId,
          organizationId: orgId,
          refreshToken: 'token1',
          request,
        }),
        sessionService.createSession({
          userId,
          organizationId: orgId,
          refreshToken: 'token2',
          request,
        }),
      ]);

      // Should attempt to revoke oldest sessions
      expect(sessionRepository.update).toHaveBeenCalled();
    });

    it('should handle very long refresh tokens', async () => {
      const longToken = 'a'.repeat(1000);
      const request = createMockRequest();

      vi.mocked(sessionRepository.findByUserId).mockResolvedValue([]);

      await sessionService.createSession({
        userId,
        organizationId: orgId,
        refreshToken: longToken,
        request,
      });

      expect(passwordService.hashPassword).toHaveBeenCalledWith(longToken);
    });

    it('should handle sessions at exact limit boundary', async () => {
      const request = createMockRequest();
      const sessions = Array.from({ length: 4 }, () => createTestSession());

      vi.mocked(sessionRepository.findByUserId).mockResolvedValue(sessions);

      await sessionService.createSession({
        userId,
        organizationId: orgId,
        refreshToken,
        request,
      });

      // Should not revoke any sessions (4 < 5)
      expect(sessionRepository.update).not.toHaveBeenCalled();
    });
  });
});
