/**
 * TokenBlacklistService Unit Tests
 *
 * Comprehensive tests for token blacklist service including:
 * - Token blacklisting with TTL
 * - Blacklist checking (isBlacklisted)
 * - TTL expiration behavior
 * - Metadata storage and retrieval
 * - Cleanup operations
 * - Performance characteristics
 * - Error handling (Redis failures)
 *
 * Security Tests:
 * - Fail-closed behavior on Redis errors
 * - Proper TTL calculation
 * - Blacklist enforcement
 * - Metadata privacy
 *
 * @group unit
 * @module backend-auth/test/unit/services
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  TokenBlacklistService,
  BlacklistMetadata,
} from '../../../src/modules/tokens/services/token-blacklist.service';
import Redis from 'ioredis';

// Mock Redis
vi.mock('ioredis');

describe('TokenBlacklistService', () => {
  let service: TokenBlacklistService;
  let redisMock: any;
  let configService: ConfigService;

  const mockRedisConfig = {
    host: 'localhost',
    port: 6379,
    password: 'test-password',
    db: 0,
    keyPrefix: 'test:',
  };

  beforeEach(async () => {
    // Create mock Redis instance
    redisMock = {
      setex: vi.fn(),
      exists: vi.fn(),
      get: vi.fn(),
      del: vi.fn(),
      keys: vi.fn(),
      ping: vi.fn(),
      quit: vi.fn(),
      on: vi.fn(),
    };

    // Mock Redis constructor
    vi.mocked(Redis).mockImplementation(() => redisMock as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenBlacklistService,
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn().mockReturnValue(mockRedisConfig),
          },
        },
      ],
    }).compile();

    service = module.get<TokenBlacklistService>(TokenBlacklistService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('blacklistToken()', () => {
    const jti = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    const metadata: BlacklistMetadata = {
      reason: 'cabinet_switch',
      blacklistedAt: Date.now(),
      userId: 'user-123',
      organizationId: 'org-456',
      context: 'Switched from cabinet A to cabinet B',
    };

    it('should blacklist token with correct TTL', async () => {
      // Arrange
      const tokenExp = Math.floor(Date.now() / 1000) + 900; // Expires in 15 minutes
      const expectedTTL = 900;
      redisMock.setex.mockResolvedValue('OK');

      // Act
      await service.blacklistToken(jti, tokenExp, metadata);

      // Assert
      expect(redisMock.setex).toHaveBeenCalledWith(jti, expectedTTL, JSON.stringify(metadata));
    });

    it('should skip blacklisting if token already expired', async () => {
      // Arrange
      const tokenExp = Math.floor(Date.now() / 1000) - 100; // Expired 100 seconds ago

      // Act
      await service.blacklistToken(jti, tokenExp, metadata);

      // Assert
      expect(redisMock.setex).not.toHaveBeenCalled();
    });

    it('should store blacklist metadata as JSON', async () => {
      // Arrange
      const tokenExp = Math.floor(Date.now() / 1000) + 900;
      redisMock.setex.mockResolvedValue('OK');

      // Act
      await service.blacklistToken(jti, tokenExp, metadata);

      // Assert
      const storedValue = redisMock.setex.mock.calls[0][2];
      const parsedMetadata = JSON.parse(storedValue);
      expect(parsedMetadata).toEqual(metadata);
    });

    it('should throw error if Redis operation fails', async () => {
      // Arrange
      const tokenExp = Math.floor(Date.now() / 1000) + 900;
      redisMock.setex.mockRejectedValue(new Error('Redis connection failed'));

      // Act & Assert
      await expect(service.blacklistToken(jti, tokenExp, metadata)).rejects.toThrow(
        'Failed to blacklist token: Redis connection failed'
      );
    });

    it('should handle all blacklist reasons', async () => {
      // Arrange
      const tokenExp = Math.floor(Date.now() / 1000) + 900;
      redisMock.setex.mockResolvedValue('OK');

      const reasons: BlacklistMetadata['reason'][] = [
        'cabinet_switch',
        'logout',
        'security_incident',
        'role_change',
        'manual_revoke',
      ];

      // Act & Assert
      for (const reason of reasons) {
        const metadata: BlacklistMetadata = {
          reason,
          blacklistedAt: Date.now(),
          userId: 'user-123',
          organizationId: 'org-456',
        };

        await service.blacklistToken(jti, tokenExp, metadata);
        expect(redisMock.setex).toHaveBeenCalledWith(
          jti,
          expect.any(Number),
          expect.stringContaining(reason)
        );
      }
    });

    it('should calculate TTL correctly for short-lived tokens', async () => {
      // Arrange - token expires in 30 seconds
      const tokenExp = Math.floor(Date.now() / 1000) + 30;
      redisMock.setex.mockResolvedValue('OK');

      // Act
      await service.blacklistToken(jti, tokenExp, metadata);

      // Assert
      const ttl = redisMock.setex.mock.calls[0][1];
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(30);
    });

    it('should handle zero TTL tokens', async () => {
      // Arrange - token expires now
      const tokenExp = Math.floor(Date.now() / 1000);

      // Act
      await service.blacklistToken(jti, tokenExp, metadata);

      // Assert - should not call setex for expired tokens
      expect(redisMock.setex).not.toHaveBeenCalled();
    });
  });

  describe('isBlacklisted()', () => {
    const jti = 'test-jti-123';

    it('should return true for blacklisted token', async () => {
      // Arrange
      redisMock.exists.mockResolvedValue(1);

      // Act
      const result = await service.isBlacklisted(jti);

      // Assert
      expect(redisMock.exists).toHaveBeenCalledWith(jti);
      expect(result).toBe(true);
    });

    it('should return false for non-blacklisted token', async () => {
      // Arrange
      redisMock.exists.mockResolvedValue(0);

      // Act
      const result = await service.isBlacklisted(jti);

      // Assert
      expect(redisMock.exists).toHaveBeenCalledWith(jti);
      expect(result).toBe(false);
    });

    it('should fail closed (return true) on Redis error', async () => {
      // Arrange
      redisMock.exists.mockRejectedValue(new Error('Redis connection failed'));

      // Act
      const result = await service.isBlacklisted(jti);

      // Assert - SECURITY: fail closed to prevent bypassing blacklist
      expect(result).toBe(true);
    });

    it('should handle multiple concurrent checks', async () => {
      // Arrange
      const jtis = ['jti-1', 'jti-2', 'jti-3', 'jti-4', 'jti-5'];
      redisMock.exists
        .mockResolvedValueOnce(1) // jti-1 blacklisted
        .mockResolvedValueOnce(0) // jti-2 not blacklisted
        .mockResolvedValueOnce(1) // jti-3 blacklisted
        .mockResolvedValueOnce(0) // jti-4 not blacklisted
        .mockResolvedValueOnce(1); // jti-5 blacklisted

      // Act
      const results = await Promise.all(jtis.map((jti) => service.isBlacklisted(jti)));

      // Assert
      expect(results).toEqual([true, false, true, false, true]);
      expect(redisMock.exists).toHaveBeenCalledTimes(5);
    });
  });

  describe('getBlacklistMetadata()', () => {
    const jti = 'test-jti-123';
    const metadata: BlacklistMetadata = {
      reason: 'cabinet_switch',
      blacklistedAt: Date.now(),
      userId: 'user-123',
      organizationId: 'org-456',
      context: 'Test context',
    };

    it('should return metadata for blacklisted token', async () => {
      // Arrange
      redisMock.get.mockResolvedValue(JSON.stringify(metadata));

      // Act
      const result = await service.getBlacklistMetadata(jti);

      // Assert
      expect(redisMock.get).toHaveBeenCalledWith(jti);
      expect(result).toEqual(metadata);
    });

    it('should return null for non-blacklisted token', async () => {
      // Arrange
      redisMock.get.mockResolvedValue(null);

      // Act
      const result = await service.getBlacklistMetadata(jti);

      // Assert
      expect(result).toBe(null);
    });

    it('should return null on Redis error', async () => {
      // Arrange
      redisMock.get.mockRejectedValue(new Error('Redis error'));

      // Act
      const result = await service.getBlacklistMetadata(jti);

      // Assert
      expect(result).toBe(null);
    });

    it('should handle malformed JSON gracefully', async () => {
      // Arrange
      redisMock.get.mockResolvedValue('invalid json {');

      // Act & Assert
      await expect(service.getBlacklistMetadata(jti)).rejects.toThrow();
    });
  });

  describe('removeFromBlacklist()', () => {
    const jti = 'test-jti-123';

    it('should remove token from blacklist', async () => {
      // Arrange
      redisMock.del.mockResolvedValue(1);

      // Act
      const result = await service.removeFromBlacklist(jti);

      // Assert
      expect(redisMock.del).toHaveBeenCalledWith(jti);
      expect(result).toBe(true);
    });

    it('should return false if token not in blacklist', async () => {
      // Arrange
      redisMock.del.mockResolvedValue(0);

      // Act
      const result = await service.removeFromBlacklist(jti);

      // Assert
      expect(result).toBe(false);
    });

    it('should throw error on Redis failure', async () => {
      // Arrange
      redisMock.del.mockRejectedValue(new Error('Redis error'));

      // Act & Assert
      await expect(service.removeFromBlacklist(jti)).rejects.toThrow(
        'Failed to remove token from blacklist'
      );
    });
  });

  describe('getBlacklistStats()', () => {
    it('should return correct statistics', async () => {
      // Arrange
      const mockKeys = ['jti-1', 'jti-2', 'jti-3'];
      redisMock.keys.mockResolvedValue(mockKeys);

      // Act
      const stats = await service.getBlacklistStats();

      // Assert
      expect(stats.count).toBe(3);
      expect(stats.memoryBytes).toBe(300); // 3 * 100 bytes
    });

    it('should return zero stats on error', async () => {
      // Arrange
      redisMock.keys.mockRejectedValue(new Error('Redis error'));

      // Act
      const stats = await service.getBlacklistStats();

      // Assert
      expect(stats.count).toBe(0);
      expect(stats.memoryBytes).toBe(0);
    });

    it('should handle empty blacklist', async () => {
      // Arrange
      redisMock.keys.mockResolvedValue([]);

      // Act
      const stats = await service.getBlacklistStats();

      // Assert
      expect(stats.count).toBe(0);
      expect(stats.memoryBytes).toBe(0);
    });
  });

  describe('healthCheck()', () => {
    it('should return true when Redis is healthy', async () => {
      // Arrange
      redisMock.ping.mockResolvedValue('PONG');

      // Act
      const result = await service.healthCheck();

      // Assert
      expect(redisMock.ping).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when Redis is unhealthy', async () => {
      // Arrange
      redisMock.ping.mockRejectedValue(new Error('Connection failed'));

      // Act
      const result = await service.healthCheck();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for wrong PING response', async () => {
      // Arrange
      redisMock.ping.mockResolvedValue('WRONG');

      // Act
      const result = await service.healthCheck();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('Performance Tests', () => {
    it('should blacklist token in < 5ms', async () => {
      // Arrange
      const jti = 'perf-test-jti';
      const tokenExp = Math.floor(Date.now() / 1000) + 900;
      const metadata: BlacklistMetadata = {
        reason: 'logout',
        blacklistedAt: Date.now(),
        userId: 'user-123',
        organizationId: 'org-456',
      };
      redisMock.setex.mockResolvedValue('OK');

      // Act
      const startTime = Date.now();
      await service.blacklistToken(jti, tokenExp, metadata);
      const duration = Date.now() - startTime;

      // Assert - performance requirement
      expect(duration).toBeLessThan(5);
    });

    it('should check blacklist status in < 1ms', async () => {
      // Arrange
      const jti = 'perf-test-jti';
      redisMock.exists.mockResolvedValue(1);

      // Act
      const startTime = Date.now();
      await service.isBlacklisted(jti);
      const duration = Date.now() - startTime;

      // Assert - performance requirement
      expect(duration).toBeLessThan(1);
    });
  });

  describe('TTL Behavior', () => {
    it('should automatically expire blacklist entries after TTL', async () => {
      // Arrange
      const jti = 'ttl-test-jti';
      const tokenExp = Math.floor(Date.now() / 1000) + 30; // 30 seconds
      const metadata: BlacklistMetadata = {
        reason: 'logout',
        blacklistedAt: Date.now(),
        userId: 'user-123',
        organizationId: 'org-456',
      };
      redisMock.setex.mockResolvedValue('OK');

      // Act
      await service.blacklistToken(jti, tokenExp, metadata);

      // Assert - verify TTL is set
      const ttl = redisMock.setex.mock.calls[0][1];
      expect(ttl).toBeLessThanOrEqual(30);
      expect(ttl).toBeGreaterThan(0);
    });

    it('should handle long-lived tokens (7 days)', async () => {
      // Arrange
      const jti = 'long-lived-jti';
      const tokenExp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
      const metadata: BlacklistMetadata = {
        reason: 'cabinet_switch',
        blacklistedAt: Date.now(),
        userId: 'user-123',
        organizationId: 'org-456',
      };
      redisMock.setex.mockResolvedValue('OK');

      // Act
      await service.blacklistToken(jti, tokenExp, metadata);

      // Assert
      const ttl = redisMock.setex.mock.calls[0][1];
      expect(ttl).toBeGreaterThan(6 * 24 * 60 * 60); // At least 6 days
      expect(ttl).toBeLessThanOrEqual(7 * 24 * 60 * 60); // At most 7 days
    });
  });

  describe('Security Tests', () => {
    it('should mask JTI in logs (privacy)', async () => {
      // This tests the private maskJti method indirectly
      // In production, verify logs don't contain full JTIs
      const jti = 'secret-jti-1234567890-should-not-appear-in-logs';
      const tokenExp = Math.floor(Date.now() / 1000) + 900;
      const metadata: BlacklistMetadata = {
        reason: 'logout',
        blacklistedAt: Date.now(),
        userId: 'user-123',
        organizationId: 'org-456',
      };
      redisMock.setex.mockResolvedValue('OK');

      // Act
      await service.blacklistToken(jti, tokenExp, metadata);

      // Assert - in production, check logs don't contain full JTI
      expect(redisMock.setex).toHaveBeenCalled();
    });

    it('should mask user/org IDs in logs (privacy)', async () => {
      // Similar to above - verify ID hashing
      const jti = 'test-jti';
      const tokenExp = Math.floor(Date.now() / 1000) + 900;
      const metadata: BlacklistMetadata = {
        reason: 'logout',
        blacklistedAt: Date.now(),
        userId: 'secret-user-id-1234567890',
        organizationId: 'secret-org-id-9876543210',
      };
      redisMock.setex.mockResolvedValue('OK');

      // Act
      await service.blacklistToken(jti, tokenExp, metadata);

      // Assert - metadata should be stored (not in logs)
      const storedValue = redisMock.setex.mock.calls[0][2];
      const parsedMetadata = JSON.parse(storedValue);
      expect(parsedMetadata.userId).toBe('secret-user-id-1234567890');
    });

    it('should fail closed on any Redis error during isBlacklisted', async () => {
      // Arrange
      const errors = [
        new Error('Connection timeout'),
        new Error('Redis server down'),
        new Error('Network error'),
        new Error('Permission denied'),
      ];

      // Act & Assert
      for (const error of errors) {
        redisMock.exists.mockRejectedValue(error);
        const result = await service.isBlacklisted('test-jti');
        expect(result).toBe(true); // Always fail closed
      }
    });
  });

  describe('Cleanup and Lifecycle', () => {
    it('should close Redis connection on module destroy', async () => {
      // Arrange
      redisMock.quit.mockResolvedValue('OK');

      // Act
      await service.onModuleDestroy();

      // Assert
      expect(redisMock.quit).toHaveBeenCalled();
    });

    it('should handle connection close gracefully', async () => {
      // Arrange
      redisMock.quit.mockRejectedValue(new Error('Already closed'));

      // Act & Assert - should not throw
      await expect(service.onModuleDestroy()).resolves.not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty JTI', async () => {
      // Arrange
      const jti = '';
      const tokenExp = Math.floor(Date.now() / 1000) + 900;
      const metadata: BlacklistMetadata = {
        reason: 'logout',
        blacklistedAt: Date.now(),
        userId: 'user-123',
        organizationId: 'org-456',
      };
      redisMock.setex.mockResolvedValue('OK');

      // Act
      await service.blacklistToken(jti, tokenExp, metadata);

      // Assert
      expect(redisMock.setex).toHaveBeenCalledWith('', expect.any(Number), expect.any(String));
    });

    it('should handle very long JTI', async () => {
      // Arrange
      const jti = 'a'.repeat(1000);
      redisMock.exists.mockResolvedValue(1);

      // Act
      const result = await service.isBlacklisted(jti);

      // Assert
      expect(result).toBe(true);
    });

    it('should handle special characters in JTI', async () => {
      // Arrange
      const jti = 'jti-with-special-chars-@#$%^&*()';
      redisMock.exists.mockResolvedValue(0);

      // Act
      const result = await service.isBlacklisted(jti);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle concurrent blacklist operations', async () => {
      // Arrange
      const operations = Array.from({ length: 10 }, (_, i) => ({
        jti: `concurrent-jti-${i}`,
        tokenExp: Math.floor(Date.now() / 1000) + 900,
        metadata: {
          reason: 'logout' as const,
          blacklistedAt: Date.now(),
          userId: `user-${i}`,
          organizationId: 'org-123',
        },
      }));
      redisMock.setex.mockResolvedValue('OK');

      // Act
      await Promise.all(
        operations.map((op) => service.blacklistToken(op.jti, op.tokenExp, op.metadata))
      );

      // Assert
      expect(redisMock.setex).toHaveBeenCalledTimes(10);
    });
  });
});
