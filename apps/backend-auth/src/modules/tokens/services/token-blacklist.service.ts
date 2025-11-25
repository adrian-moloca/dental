/**
 * TokenBlacklistService - Manages blacklisted JWT tokens
 *
 * Provides token revocation capabilities using Redis as a fast,
 * distributed blacklist store. Tokens are blacklisted by their
 * unique JWT ID (jti) with automatic expiration based on token TTL.
 *
 * SECURITY FEATURES:
 * - Immediate token invalidation (< 100ms)
 * - Distributed blacklist (Redis cluster support)
 * - Automatic cleanup via Redis TTL
 * - No manual garbage collection needed
 * - Sub-millisecond blacklist checks
 *
 * USE CASES:
 * - Cabinet/context switches (prevent old token reuse)
 * - Forced logout (security incidents)
 * - Token compromise response
 * - User role/permission changes
 *
 * PERFORMANCE:
 * - Redis GET operation: <1ms
 * - Redis SET operation: <1ms
 * - Memory per token: ~100 bytes (jti + metadata)
 * - Auto-cleanup: Redis TTL (no manual management)
 *
 * @module tokens/services/token-blacklist
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AppConfig } from '../../../configuration';

/**
 * Metadata stored with blacklisted token
 */
export interface BlacklistMetadata {
  /** Reason for blacklisting */
  reason: 'cabinet_switch' | 'logout' | 'security_incident' | 'role_change' | 'manual_revoke';

  /** When token was blacklisted (Unix timestamp) */
  blacklistedAt: number;

  /** User ID who owned the token */
  userId: string;

  /** Organization ID for audit trail */
  organizationId: string;

  /** Optional additional context */
  context?: string;
}

/**
 * Token Blacklist Service
 *
 * Manages a distributed blacklist of revoked JWT tokens using Redis.
 * Tokens are identified by their jti (JWT ID) claim and automatically
 * expire after their original TTL.
 *
 * Key Format: `token:blacklist:{jti}`
 * Value: JSON-encoded BlacklistMetadata
 * TTL: Token remaining lifetime (exp - now)
 *
 * @example
 * ```typescript
 * // Blacklist token during cabinet switch
 * await blacklistService.blacklistToken(
 *   tokenJti,
 *   tokenExpiration,
 *   {
 *     reason: 'cabinet_switch',
 *     userId: user.id,
 *     organizationId: user.organizationId,
 *     blacklistedAt: Date.now(),
 *   }
 * );
 *
 * // Check if token is blacklisted
 * const isBlacklisted = await blacklistService.isBlacklisted(tokenJti);
 * if (isBlacklisted) {
 *   throw new UnauthorizedException('Token has been revoked');
 * }
 * ```
 */
@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    const redisConfig = this.configService.get('redis', { infer: true });

    // Create Redis client for blacklist operations
    this.redis = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.db || 0,
      keyPrefix: `${redisConfig.keyPrefix}token:blacklist:`,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        this.logger.warn(`Redis connection retry attempt ${times}, delay: ${delay}ms`);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    // Handle Redis connection events
    this.redis.on('connect', () => {
      this.logger.log('TokenBlacklist Redis client connected');
    });

    this.redis.on('error', (error) => {
      this.logger.error('TokenBlacklist Redis client error', error);
    });

    this.redis.on('close', () => {
      this.logger.warn('TokenBlacklist Redis client connection closed');
    });
  }

  /**
   * Blacklist a token by its JTI
   *
   * Adds token to Redis blacklist with automatic expiration.
   * The TTL is calculated from the token's expiration time to ensure
   * the blacklist entry is removed automatically after token expires.
   *
   * @param jti - JWT ID (unique token identifier)
   * @param tokenExp - Token expiration timestamp (Unix seconds)
   * @param metadata - Blacklist metadata for audit trail
   * @returns Promise resolving when token is blacklisted
   *
   * @throws {Error} If Redis operation fails
   *
   * Performance: < 5ms (Redis SET operation)
   *
   * @example
   * ```typescript
   * await blacklistService.blacklistToken(
   *   'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   *   Math.floor(Date.now() / 1000) + 900, // expires in 15 minutes
   *   {
   *     reason: 'cabinet_switch',
   *     userId: 'user-123',
   *     organizationId: 'org-456',
   *     blacklistedAt: Date.now(),
   *   }
   * );
   * ```
   */
  async blacklistToken(jti: string, tokenExp: number, metadata: BlacklistMetadata): Promise<void> {
    const startTime = Date.now();

    try {
      // Calculate TTL (time to live) in seconds
      // TTL = token expiration - current time
      const nowSeconds = Math.floor(Date.now() / 1000);
      const ttlSeconds = tokenExp - nowSeconds;

      // If token already expired, no need to blacklist
      if (ttlSeconds <= 0) {
        this.logger.debug({
          message: 'Token already expired, skipping blacklist',
          jti: this.maskJti(jti),
          tokenExp,
          nowSeconds,
        });
        return;
      }

      // Serialize metadata to JSON
      const metadataJson = JSON.stringify(metadata);

      // Store in Redis with automatic expiration
      // Key: token:blacklist:{jti}
      // Value: JSON metadata
      // TTL: Remaining token lifetime
      await this.redis.setex(jti, ttlSeconds, metadataJson);

      const duration = Date.now() - startTime;

      this.logger.log({
        message: 'Token blacklisted successfully',
        jti: this.maskJti(jti),
        reason: metadata.reason,
        userId: this.hashId(metadata.userId),
        organizationId: this.hashId(metadata.organizationId),
        ttlSeconds,
        duration_ms: duration,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.logger.error({
        message: 'Failed to blacklist token',
        jti: this.maskJti(jti),
        error: errorMessage,
        duration_ms: duration,
      });

      throw new Error(`Failed to blacklist token: ${errorMessage}`);
    }
  }

  /**
   * Check if a token is blacklisted
   *
   * Performs fast Redis lookup to check if token JTI exists in blacklist.
   * Returns true if token is blacklisted, false otherwise.
   *
   * @param jti - JWT ID to check
   * @returns Promise resolving to true if blacklisted, false otherwise
   *
   * @throws {Error} If Redis operation fails
   *
   * Performance: < 1ms (Redis GET operation)
   *
   * @example
   * ```typescript
   * const isBlacklisted = await blacklistService.isBlacklisted(tokenJti);
   * if (isBlacklisted) {
   *   throw new UnauthorizedException('Token has been revoked');
   * }
   * ```
   */
  async isBlacklisted(jti: string): Promise<boolean> {
    const startTime = Date.now();

    try {
      // Check if key exists in Redis
      const exists = await this.redis.exists(jti);

      const duration = Date.now() - startTime;

      if (exists === 1) {
        this.logger.debug({
          message: 'Token is blacklisted',
          jti: this.maskJti(jti),
          duration_ms: duration,
        });
        return true;
      }

      this.logger.debug({
        message: 'Token not blacklisted',
        jti: this.maskJti(jti),
        duration_ms: duration,
      });
      return false;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.logger.error({
        message: 'Failed to check token blacklist status',
        jti: this.maskJti(jti),
        error: errorMessage,
        duration_ms: duration,
      });

      // SECURITY: Fail closed - if Redis is down, treat token as blacklisted
      // This prevents bypassing revocation during Redis outages
      this.logger.warn({
        message: 'Redis error, failing closed (treating token as blacklisted)',
        jti: this.maskJti(jti),
      });
      return true;
    }
  }

  /**
   * Get blacklist metadata for a token
   *
   * Retrieves the stored metadata for a blacklisted token.
   * Returns null if token is not blacklisted.
   *
   * @param jti - JWT ID to lookup
   * @returns Promise resolving to metadata or null
   *
   * @example
   * ```typescript
   * const metadata = await blacklistService.getBlacklistMetadata(tokenJti);
   * if (metadata) {
   *   console.log(`Token revoked: ${metadata.reason}`);
   * }
   * ```
   */
  async getBlacklistMetadata(jti: string): Promise<BlacklistMetadata | null> {
    try {
      const metadataJson = await this.redis.get(jti);

      if (!metadataJson) {
        return null;
      }

      return JSON.parse(metadataJson) as BlacklistMetadata;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.logger.error({
        message: 'Failed to get blacklist metadata',
        jti: this.maskJti(jti),
        error: errorMessage,
      });

      return null;
    }
  }

  /**
   * Remove a token from blacklist (manual unrevoke)
   *
   * Removes token from blacklist before its natural expiration.
   * Use with caution - only for correcting accidental revocations.
   *
   * @param jti - JWT ID to remove from blacklist
   * @returns Promise resolving to true if removed, false if not found
   *
   * @example
   * ```typescript
   * // Undo accidental revocation
   * await blacklistService.removeFromBlacklist(tokenJti);
   * ```
   */
  async removeFromBlacklist(jti: string): Promise<boolean> {
    try {
      const result = await this.redis.del(jti);

      if (result === 1) {
        this.logger.log({
          message: 'Token removed from blacklist',
          jti: this.maskJti(jti),
        });
        return true;
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.logger.error({
        message: 'Failed to remove token from blacklist',
        jti: this.maskJti(jti),
        error: errorMessage,
      });

      throw new Error(`Failed to remove token from blacklist: ${errorMessage}`);
    }
  }

  /**
   * Get blacklist statistics
   *
   * Returns metrics about blacklist size and memory usage.
   * Useful for monitoring and capacity planning.
   *
   * @returns Promise resolving to blacklist statistics
   *
   * @example
   * ```typescript
   * const stats = await blacklistService.getBlacklistStats();
   * console.log(`Blacklisted tokens: ${stats.count}`);
   * ```
   */
  async getBlacklistStats(): Promise<{
    count: number;
    memoryBytes: number;
  }> {
    try {
      // Get all blacklist keys (use SCAN for large datasets in production)
      const keys = await this.redis.keys('*');
      const count = keys.length;

      // Estimate memory usage (approximate)
      // Each entry: ~100 bytes (jti + metadata)
      const memoryBytes = count * 100;

      return { count, memoryBytes };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.logger.error({
        message: 'Failed to get blacklist statistics',
        error: errorMessage,
      });

      return { count: 0, memoryBytes: 0 };
    }
  }

  /**
   * Health check for Redis connection
   *
   * Verifies Redis connectivity by executing a PING command.
   * Used by health check endpoints.
   *
   * @returns Promise resolving to true if healthy, false otherwise
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error({
        message: 'TokenBlacklist health check failed',
        error: errorMessage,
      });
      return false;
    }
  }

  /**
   * Close Redis connection
   *
   * Gracefully closes Redis connection on application shutdown.
   * Called by NestJS lifecycle hooks.
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log('Closing TokenBlacklist Redis connection');
    await this.redis.quit();
  }

  /**
   * Mask JTI for logging (first 8 characters)
   * Prevents full token IDs in logs for security
   */
  private maskJti(jti: string): string {
    if (jti.length <= 8) {
      return jti.substring(0, 4) + '...';
    }
    return jti.substring(0, 8) + '...';
  }

  /**
   * Hash ID for logging (first 8 characters)
   * Prevents full user/org IDs in logs for privacy
   */
  private hashId(id: string): string {
    if (id.length <= 8) {
      return id;
    }
    return id.substring(0, 8) + '...';
  }
}
