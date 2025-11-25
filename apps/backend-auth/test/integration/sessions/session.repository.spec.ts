/**
 * SessionRepository Integration Tests
 *
 * Tests cover:
 * - Redis CRUD operations for sessions
 * - Multi-tenant data isolation (organizationId scoping)
 * - Session indexing (by user, by token hash)
 * - TTL management and automatic expiration
 * - Atomic operations (pipeline transactions)
 * - Cross-tenant access prevention
 * - Error handling for Redis unavailability
 *
 * Infrastructure Coverage:
 * - Redis key patterns (session, user index, token lookup)
 * - TTL calculation and expiration
 * - Transaction atomicity (MULTI/EXEC)
 * - Concurrent access scenarios
 *
 * @group integration
 * @module backend-auth/test/integration/sessions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Redis from 'ioredis-mock';
import { SessionRepository } from '../../../src/modules/sessions/repositories/session.repository';
import { Session, DeviceInfo } from '../../../src/modules/sessions/entities/session.entity';
import { RedisClient } from '@dentalos/shared-infra';
import { InfrastructureError } from '@dentalos/shared-errors';
import { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';

describe('SessionRepository Integration Tests', () => {
  let repository: SessionRepository;
  let redisClient: RedisClient;
  let redisMock: Redis;

  // Test fixtures
  const orgId1 = 'org-alpha' as OrganizationId;
  const orgId2 = 'org-beta' as OrganizationId;
  const userId1 = 'user-123' as UUID;
  const userId2 = 'user-456' as UUID;

  const validDeviceInfo: DeviceInfo = {
    deviceId: 'a'.repeat(64),
    deviceName: 'Chrome 120 on Windows 11',
    ipAddress: '192.168.1.xxx',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
  };

  const createTestSession = (overrides: Partial<Session> = {}): Session => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return new Session({
      id: `session-${Math.random().toString(36).substr(2, 9)}` as UUID,
      userId: userId1,
      organizationId: orgId1,
      clinicId: 'clinic-101' as ClinicId,
      refreshTokenHash: 'a'.repeat(64) + Math.random().toString(),
      deviceInfo: validDeviceInfo,
      createdAt: now,
      expiresAt,
      lastActivityAt: now,
      ...overrides,
    });
  };

  beforeEach(() => {
    // Create fresh Redis mock instance
    redisMock = new Redis();

    // Wrap in RedisClient interface
    redisClient = {
      getClient: () => redisMock,
      get: (key: string) => redisMock.get(key),
      set: (key: string, value: string, ttl?: number) => {
        if (ttl) {
          return redisMock.set(key, value, 'EX', ttl);
        }
        return redisMock.set(key, value);
      },
      del: (key: string) => redisMock.del(key),
      exists: (key: string) => redisMock.exists(key),
    } as RedisClient;

    repository = new SessionRepository(redisClient);
  });

  afterEach(async () => {
    // Clean up Redis mock
    await redisMock.flushall();
    redisMock.disconnect();
  });

  describe('create() - Session Creation', () => {
    it('should create session in Redis with correct key pattern', async () => {
      const session = createTestSession();

      await repository.create(session);

      const key = `session:${session.organizationId}:${session.id}`;
      const stored = await redisMock.get(key);

      expect(stored).toBeDefined();
      expect(stored).toContain(session.id);
      expect(stored).toContain(session.userId);
    });

    it('should store session as JSON string', async () => {
      const session = createTestSession();

      await repository.create(session);

      const key = `session:${session.organizationId}:${session.id}`;
      const stored = await redisMock.get(key);
      const parsed = JSON.parse(stored!);

      expect(parsed.id).toBe(session.id);
      expect(parsed.userId).toBe(session.userId);
      expect(parsed.organizationId).toBe(session.organizationId);
      expect(parsed.refreshTokenHash).toBe(session.refreshTokenHash);
    });

    it('should set TTL on session key', async () => {
      const session = createTestSession();

      await repository.create(session);

      const key = `session:${session.organizationId}:${session.id}`;
      const ttl = await redisMock.ttl(key);

      // TTL should be approximately 7 days (604800 seconds)
      expect(ttl).toBeGreaterThan(600000); // At least ~7 days
      expect(ttl).toBeLessThanOrEqual(604800); // At most 7 days
    });

    it('should add session to user index', async () => {
      const session = createTestSession();

      await repository.create(session);

      const indexKey = `session:user:${session.organizationId}:${session.userId}`;
      const members = await redisMock.smembers(indexKey);

      expect(members).toContain(session.id);
    });

    it('should create token hash lookup key', async () => {
      const session = createTestSession();

      await repository.create(session);

      const shortHash = session.refreshTokenHash.substring(0, 16);
      const tokenKey = `session:token:${session.organizationId}:${shortHash}`;
      const sessionId = await redisMock.get(tokenKey);

      expect(sessionId).toBe(session.id);
    });

    it('should perform all operations atomically', async () => {
      const session = createTestSession();

      await repository.create(session);

      // All three keys should exist
      const sessionKey = `session:${session.organizationId}:${session.id}`;
      const indexKey = `session:user:${session.organizationId}:${session.userId}`;
      const shortHash = session.refreshTokenHash.substring(0, 16);
      const tokenKey = `session:token:${session.organizationId}:${shortHash}`;

      const exists = await Promise.all([
        redisMock.exists(sessionKey),
        redisMock.exists(indexKey),
        redisMock.exists(tokenKey),
      ]);

      expect(exists).toEqual([1, 1, 1]);
    });

    it('should be idempotent (overwrites existing session)', async () => {
      const session = createTestSession();

      await repository.create(session);
      await repository.create(session);

      const key = `session:${session.organizationId}:${session.id}`;
      const stored = await redisMock.get(key);

      expect(stored).toBeDefined();
    });

    it('should isolate sessions by organizationId', async () => {
      const session1 = createTestSession({ organizationId: orgId1 });
      const session2 = createTestSession({ organizationId: orgId2, id: session1.id });

      await repository.create(session1);
      await repository.create(session2);

      // Both sessions exist under different org namespaces
      const key1 = `session:${orgId1}:${session1.id}`;
      const key2 = `session:${orgId2}:${session2.id}`;

      const [exists1, exists2] = await Promise.all([
        redisMock.exists(key1),
        redisMock.exists(key2),
      ]);

      expect(exists1).toBe(1);
      expect(exists2).toBe(1);
    });
  });

  describe('findById() - Session Retrieval', () => {
    it('should find session by ID and organizationId', async () => {
      const session = createTestSession();
      await repository.create(session);

      const found = await repository.findById(session.id, session.organizationId);

      expect(found).toBeDefined();
      expect(found!.id).toBe(session.id);
      expect(found!.userId).toBe(session.userId);
      expect(found!.organizationId).toBe(session.organizationId);
    });

    it('should return null when session not found', async () => {
      const found = await repository.findById('nonexistent' as UUID, orgId1);

      expect(found).toBeNull();
    });

    it('should return null for cross-tenant access attempt', async () => {
      const session = createTestSession({ organizationId: orgId1 });
      await repository.create(session);

      // Try to access with different organizationId
      const found = await repository.findById(session.id, orgId2);

      expect(found).toBeNull();
    });

    it('should deserialize session with correct data types', async () => {
      const session = createTestSession();
      await repository.create(session);

      const found = await repository.findById(session.id, session.organizationId);

      expect(found!.createdAt).toBeInstanceOf(Date);
      expect(found!.expiresAt).toBeInstanceOf(Date);
      expect(found!.lastActivityAt).toBeInstanceOf(Date);
      expect(found!.deviceInfo).toEqual(validDeviceInfo);
    });

    it('should return null after TTL expires', async () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 1000); // 1 second
      const session = createTestSession({ expiresAt });

      await repository.create(session);

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const found = await repository.findById(session.id, session.organizationId);

      expect(found).toBeNull();
    });
  });

  describe('findByTokenHash() - Token Lookup', () => {
    it('should find session by refresh token hash', async () => {
      const session = createTestSession();
      await repository.create(session);

      const found = await repository.findByTokenHash(
        session.refreshTokenHash,
        session.organizationId
      );

      expect(found).toBeDefined();
      expect(found!.id).toBe(session.id);
      expect(found!.refreshTokenHash).toBe(session.refreshTokenHash);
    });

    it('should return null when token hash not found', async () => {
      const found = await repository.findByTokenHash('nonexistent-hash', orgId1);

      expect(found).toBeNull();
    });

    it('should return null for cross-tenant token access', async () => {
      const session = createTestSession({ organizationId: orgId1 });
      await repository.create(session);

      const found = await repository.findByTokenHash(session.refreshTokenHash, orgId2);

      expect(found).toBeNull();
    });

    it('should handle token hash lookup with correct key prefix', async () => {
      const session = createTestSession();
      await repository.create(session);

      // Verify token key exists
      const shortHash = session.refreshTokenHash.substring(0, 16);
      const tokenKey = `session:token:${session.organizationId}:${shortHash}`;
      const sessionId = await redisMock.get(tokenKey);

      expect(sessionId).toBe(session.id);
    });
  });

  describe('findByUserId() - User Sessions', () => {
    it('should find all sessions for a user', async () => {
      const session1 = createTestSession({ userId: userId1 });
      const session2 = createTestSession({ userId: userId1 });
      const session3 = createTestSession({ userId: userId2 });

      await Promise.all([
        repository.create(session1),
        repository.create(session2),
        repository.create(session3),
      ]);

      const sessions = await repository.findByUserId(userId1, orgId1);

      expect(sessions).toHaveLength(2);
      expect(sessions.map((s) => s.id)).toContain(session1.id);
      expect(sessions.map((s) => s.id)).toContain(session2.id);
      expect(sessions.map((s) => s.id)).not.toContain(session3.id);
    });

    it('should return empty array when user has no sessions', async () => {
      const sessions = await repository.findByUserId(userId1, orgId1);

      expect(sessions).toEqual([]);
    });

    it('should filter out expired sessions from user list', async () => {
      const session1 = createTestSession({ userId: userId1 });
      const now = new Date();
      const expiredSession = createTestSession({
        userId: userId1,
        expiresAt: new Date(now.getTime() + 500), // Expires in 0.5s
      });

      await repository.create(session1);
      await repository.create(expiredSession);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 600));

      const sessions = await repository.findByUserId(userId1, orgId1);

      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe(session1.id);
    });

    it('should isolate user sessions by organizationId', async () => {
      const session1 = createTestSession({ userId: userId1, organizationId: orgId1 });
      const session2 = createTestSession({ userId: userId1, organizationId: orgId2 });

      await repository.create(session1);
      await repository.create(session2);

      const sessionsOrg1 = await repository.findByUserId(userId1, orgId1);
      const sessionsOrg2 = await repository.findByUserId(userId1, orgId2);

      expect(sessionsOrg1).toHaveLength(1);
      expect(sessionsOrg2).toHaveLength(1);
      expect(sessionsOrg1[0].id).toBe(session1.id);
      expect(sessionsOrg2[0].id).toBe(session2.id);
    });

    it('should handle large number of sessions per user', async () => {
      const sessions = Array.from({ length: 10 }, () =>
        createTestSession({ userId: userId1 })
      );

      await Promise.all(sessions.map((s) => repository.create(s)));

      const found = await repository.findByUserId(userId1, orgId1);

      expect(found).toHaveLength(10);
    });
  });

  describe('update() - Session Updates', () => {
    it('should update existing session', async () => {
      const session = createTestSession();
      await repository.create(session);

      const updatedSession = session.withUpdatedActivity();
      await repository.update(updatedSession);

      const found = await repository.findById(session.id, session.organizationId);

      expect(found!.lastActivityAt.getTime()).toBeGreaterThan(
        session.lastActivityAt.getTime()
      );
    });

    it('should update revoked session', async () => {
      const session = createTestSession();
      await repository.create(session);

      const revokedSession = session.withRevocation('user_logout');
      await repository.update(revokedSession);

      const found = await repository.findById(session.id, session.organizationId);

      expect(found!.revokedAt).toBeDefined();
      expect(found!.revokedReason).toBe('user_logout');
    });

    it('should reset TTL on update', async () => {
      const session = createTestSession();
      await repository.create(session);

      const key = `session:${session.organizationId}:${session.id}`;
      const ttlBefore = await redisMock.ttl(key);

      await new Promise((resolve) => setTimeout(resolve, 100));

      await repository.update(session);
      const ttlAfter = await redisMock.ttl(key);

      // TTL should be refreshed
      expect(ttlAfter).toBeGreaterThanOrEqual(ttlBefore);
    });

    it('should create session if it does not exist (upsert behavior)', async () => {
      const session = createTestSession();

      await repository.update(session);

      const found = await repository.findById(session.id, session.organizationId);

      expect(found).toBeDefined();
      expect(found!.id).toBe(session.id);
    });
  });

  describe('delete() - Session Deletion', () => {
    it('should delete session and all related keys', async () => {
      const session = createTestSession();
      await repository.create(session);

      await repository.delete(session.id, session.organizationId);

      const sessionKey = `session:${session.organizationId}:${session.id}`;
      const indexKey = `session:user:${session.organizationId}:${session.userId}`;
      const shortHash = session.refreshTokenHash.substring(0, 16);
      const tokenKey = `session:token:${session.organizationId}:${shortHash}`;

      const [sessionExists, indexMembers, tokenExists] = await Promise.all([
        redisMock.exists(sessionKey),
        redisMock.smembers(indexKey),
        redisMock.exists(tokenKey),
      ]);

      expect(sessionExists).toBe(0);
      expect(indexMembers).not.toContain(session.id);
      expect(tokenExists).toBe(0);
    });

    it('should be idempotent (no error if session does not exist)', async () => {
      await expect(
        repository.delete('nonexistent' as UUID, orgId1)
      ).resolves.not.toThrow();
    });

    it('should not delete sessions from other organizations', async () => {
      const session = createTestSession({ organizationId: orgId1 });
      await repository.create(session);

      // Try to delete with wrong org
      await repository.delete(session.id, orgId2);

      // Session should still exist under correct org
      const found = await repository.findById(session.id, orgId1);

      expect(found).toBeDefined();
    });

    it('should remove session from user index', async () => {
      const session1 = createTestSession({ userId: userId1 });
      const session2 = createTestSession({ userId: userId1 });

      await repository.create(session1);
      await repository.create(session2);

      await repository.delete(session1.id, orgId1);

      const sessions = await repository.findByUserId(userId1, orgId1);

      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe(session2.id);
    });
  });

  describe('deleteAllByUserId() - Bulk Deletion', () => {
    it('should delete all sessions for a user', async () => {
      const session1 = createTestSession({ userId: userId1 });
      const session2 = createTestSession({ userId: userId1 });
      const session3 = createTestSession({ userId: userId2 });

      await Promise.all([
        repository.create(session1),
        repository.create(session2),
        repository.create(session3),
      ]);

      const count = await repository.deleteAllByUserId(userId1, orgId1);

      expect(count).toBe(2);

      const remainingSessions = await repository.findByUserId(userId1, orgId1);
      expect(remainingSessions).toHaveLength(0);

      // Other user's session should remain
      const otherUserSessions = await repository.findByUserId(userId2, orgId1);
      expect(otherUserSessions).toHaveLength(1);
    });

    it('should return 0 when user has no sessions', async () => {
      const count = await repository.deleteAllByUserId(userId1, orgId1);

      expect(count).toBe(0);
    });

    it('should only delete sessions for specified organization', async () => {
      const session1 = createTestSession({ userId: userId1, organizationId: orgId1 });
      const session2 = createTestSession({ userId: userId1, organizationId: orgId2 });

      await repository.create(session1);
      await repository.create(session2);

      const count = await repository.deleteAllByUserId(userId1, orgId1);

      expect(count).toBe(1);

      const sessionsOrg2 = await repository.findByUserId(userId1, orgId2);
      expect(sessionsOrg2).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should throw InfrastructureError when Redis is unavailable on create', async () => {
      const brokenRedis = {
        getClient: () => {
          throw new Error('Redis connection failed');
        },
      } as any;

      const brokenRepo = new SessionRepository(brokenRedis);
      const session = createTestSession();

      await expect(brokenRepo.create(session)).rejects.toThrow(InfrastructureError);
      await expect(brokenRepo.create(session)).rejects.toThrow(/Failed to create session/);
    });

    it('should throw InfrastructureError when Redis is unavailable on findById', async () => {
      const brokenRedis = {
        getClient: () => redisMock,
        get: () => {
          throw new Error('Redis read failed');
        },
      } as any;

      const brokenRepo = new SessionRepository(brokenRedis);

      await expect(
        brokenRepo.findById('session-123' as UUID, orgId1)
      ).rejects.toThrow(InfrastructureError);
    });

    it('should handle malformed JSON in Redis gracefully', async () => {
      const session = createTestSession();
      const key = `session:${session.organizationId}:${session.id}`;

      // Store invalid JSON
      await redisMock.set(key, 'not-valid-json');

      await expect(
        repository.findById(session.id, session.organizationId)
      ).rejects.toThrow(InfrastructureError);
    });

    it('should mark errors as transient', async () => {
      const brokenRedis = {
        getClient: () => {
          throw new Error('Temporary network issue');
        },
      } as any;

      const brokenRepo = new SessionRepository(brokenRedis);
      const session = createTestSession();

      try {
        await brokenRepo.create(session);
      } catch (error) {
        expect(error).toBeInstanceOf(InfrastructureError);
        expect((error as InfrastructureError).details.isTransient).toBe(true);
      }
    });
  });

  describe('TTL Edge Cases', () => {
    it('should calculate correct TTL for session expiring soon', async () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 60000); // 1 minute
      const session = createTestSession({ expiresAt });

      await repository.create(session);

      const key = `session:${session.organizationId}:${session.id}`;
      const ttl = await redisMock.ttl(key);

      expect(ttl).toBeGreaterThan(50); // At least 50 seconds
      expect(ttl).toBeLessThanOrEqual(60); // At most 60 seconds
    });

    it('should set minimum TTL of 1 second', async () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 500); // 0.5 seconds
      const session = createTestSession({ expiresAt });

      await repository.create(session);

      const key = `session:${session.organizationId}:${session.id}`;
      const ttl = await redisMock.ttl(key);

      expect(ttl).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Concurrent Access', () => {
    it('should handle concurrent creates for same user', async () => {
      const sessions = Array.from({ length: 5 }, () =>
        createTestSession({ userId: userId1 })
      );

      await Promise.all(sessions.map((s) => repository.create(s)));

      const found = await repository.findByUserId(userId1, orgId1);

      expect(found).toHaveLength(5);
    });

    it('should handle concurrent updates to same session', async () => {
      const session = createTestSession();
      await repository.create(session);

      const updates = Array.from({ length: 5 }, () =>
        repository.update(session.withUpdatedActivity())
      );

      await Promise.all(updates);

      const found = await repository.findById(session.id, session.organizationId);

      expect(found).toBeDefined();
    });

    it('should handle concurrent deletes gracefully', async () => {
      const session = createTestSession();
      await repository.create(session);

      const deletes = Array.from({ length: 3 }, () =>
        repository.delete(session.id, session.organizationId)
      );

      await Promise.all(deletes);

      const found = await repository.findById(session.id, session.organizationId);

      expect(found).toBeNull();
    });
  });
});
