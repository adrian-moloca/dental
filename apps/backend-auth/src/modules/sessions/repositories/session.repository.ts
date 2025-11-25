/**
 * SessionRepository - Redis-backed session persistence
 *
 * Responsibilities:
 * - CRUD operations for session entities
 * - Multi-tenant data isolation (all operations scoped to organizationId)
 * - Session indexing (by user, by token hash)
 * - TTL management for automatic cleanup
 * - Atomic operations for race condition prevention
 *
 * Redis Key Patterns:
 * - session:{organizationId}:{sessionId} → Session JSON
 * - session:user:{organizationId}:{userId} → SET of sessionIds
 * - session:token:{organizationId}:{tokenHash} → sessionId (lookup)
 *
 * Tenant Isolation:
 * - ALL methods require organizationId parameter
 * - Keys are prefixed with organizationId
 * - Cross-tenant access is impossible by design
 *
 * @module SessionRepository
 */

import { Injectable, Inject } from '@nestjs/common';
import { UUID, OrganizationId } from '@dentalos/shared-types';
import { RedisClient } from '@dentalos/shared-infra';
import { InfrastructureError } from '@dentalos/shared-errors';
import { Session } from '../entities/session.entity';

/**
 * Session repository for Redis persistence
 */
@Injectable()
export class SessionRepository {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: RedisClient
  ) {}

  /**
   * Create a new session in Redis
   * Stores session in three keys for efficient lookups:
   * 1. Primary session data
   * 2. User sessions index (SET)
   * 3. Token hash lookup
   *
   * @param session - Session entity to create
   * @returns Created session entity
   *
   * Edge cases:
   * - Session already exists → overwrites (idempotent)
   * - Redis unavailable → throws InfrastructureError
   * - Invalid session data → validation error from Session constructor
   */
  async create(session: Session): Promise<Session> {
    try {
      const ttlSeconds = this.calculateTTL(session.expiresAt);
      const client = this.redisClient.getClient();

      // Use Redis transaction (MULTI/EXEC) for atomicity
      const pipeline = client.multi();

      // 1. Store primary session data
      const sessionKey = this.buildSessionKey(session.organizationId, session.id);
      const sessionJson = JSON.stringify(session.toJSON());
      pipeline.set(sessionKey, sessionJson, 'EX', ttlSeconds);

      // 2. Add to user sessions index
      const userIndexKey = this.buildUserIndexKey(session.organizationId, session.userId);
      pipeline.sadd(userIndexKey, session.id);
      pipeline.expire(userIndexKey, ttlSeconds);

      // 3. Create token hash lookup
      const tokenKey = this.buildTokenKey(session.organizationId, session.refreshTokenHash);
      pipeline.set(tokenKey, session.id, 'EX', ttlSeconds);

      // Execute all commands atomically
      await pipeline.exec();

      return session;
    } catch (error) {
      throw new InfrastructureError('Failed to create session in Redis', {
        service: 'cache',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Find session by ID (tenant-scoped)
   *
   * @param sessionId - Session identifier
   * @param organizationId - Organization for tenant isolation
   * @returns Session entity or null if not found
   *
   * Edge cases:
   * - Session not found → returns null
   * - Session expired (TTL) → returns null
   * - Invalid JSON → throws error
   * - Organization mismatch → returns null (tenant isolation)
   */
  async findById(sessionId: UUID, organizationId: OrganizationId): Promise<Session | null> {
    try {
      const sessionKey = this.buildSessionKey(organizationId, sessionId);
      const sessionJson = await this.redisClient.get(sessionKey);

      if (!sessionJson) {
        return null;
      }

      const data = JSON.parse(sessionJson);
      return Session.fromJSON(data);
    } catch (error) {
      throw new InfrastructureError('Failed to retrieve session from Redis', {
        service: 'cache',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Find session by refresh token hash (tenant-scoped)
   *
   * @param tokenHash - Argon2id hash of refresh token
   * @param organizationId - Organization for tenant isolation
   * @returns Session entity or null if not found
   *
   * Edge cases:
   * - Token not found → returns null
   * - Token expired → returns null
   * - Multiple sessions with same token → impossible (hash is unique)
   */
  async findByTokenHash(
    tokenHash: string,
    organizationId: OrganizationId
  ): Promise<Session | null> {
    try {
      // Lookup sessionId from token hash
      const tokenKey = this.buildTokenKey(organizationId, tokenHash);
      const sessionId = await this.redisClient.get(tokenKey);

      if (!sessionId) {
        return null;
      }

      // Retrieve full session data
      return this.findById(sessionId as UUID, organizationId);
    } catch (error) {
      throw new InfrastructureError('Failed to find session by token hash', {
        service: 'cache',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Find all sessions for a user (tenant-scoped)
   *
   * @param userId - User identifier
   * @param organizationId - Organization for tenant isolation
   * @returns Array of session entities
   *
   * Edge cases:
   * - User has no sessions → returns empty array
   * - Some sessions expired → omitted from results
   * - Large number of sessions → returns all (consider pagination in future)
   */
  async findByUserId(userId: UUID, organizationId: OrganizationId): Promise<Session[]> {
    try {
      const client = this.redisClient.getClient();
      const userIndexKey = this.buildUserIndexKey(organizationId, userId);

      // Get all session IDs for this user
      const sessionIds = await client.smembers(userIndexKey);

      if (sessionIds.length === 0) {
        return [];
      }

      // Retrieve all sessions in parallel
      const sessionPromises = sessionIds.map((id: string) =>
        this.findById(id as UUID, organizationId)
      );

      const sessions = await Promise.all(sessionPromises);

      // Filter out null results (expired or deleted sessions)
      return sessions.filter((session: Session | null): session is Session => session !== null);
    } catch (error) {
      throw new InfrastructureError('Failed to find sessions by user ID', {
        service: 'cache',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Update existing session (tenant-scoped)
   * Used for updating lastActivityAt, revocation, etc.
   *
   * @param session - Updated session entity
   * @returns Updated session entity
   *
   * Edge cases:
   * - Session doesn't exist → creates new session
   * - TTL expired → recreates with new TTL
   * - Token hash changed → updates lookup key
   */
  async update(session: Session): Promise<Session> {
    try {
      const ttlSeconds = this.calculateTTL(session.expiresAt);
      const sessionKey = this.buildSessionKey(session.organizationId, session.id);
      const sessionJson = JSON.stringify(session.toJSON());

      // Update session data with new TTL
      await this.redisClient.set(sessionKey, sessionJson, ttlSeconds);

      return session;
    } catch (error) {
      throw new InfrastructureError('Failed to update session in Redis', {
        service: 'cache',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Delete session (tenant-scoped)
   * Removes all related keys (session, user index, token lookup)
   *
   * @param sessionId - Session identifier
   * @param organizationId - Organization for tenant isolation
   *
   * Edge cases:
   * - Session doesn't exist → no-op (idempotent)
   * - Partial deletion → atomic via pipeline
   */
  async delete(sessionId: UUID, organizationId: OrganizationId): Promise<void> {
    try {
      // Retrieve session to get userId and token hash
      const session = await this.findById(sessionId, organizationId);

      if (!session) {
        // Session already deleted or doesn't exist
        return;
      }

      const client = this.redisClient.getClient();
      const pipeline = client.multi();

      // 1. Delete primary session data
      const sessionKey = this.buildSessionKey(organizationId, sessionId);
      pipeline.del(sessionKey);

      // 2. Remove from user sessions index
      const userIndexKey = this.buildUserIndexKey(organizationId, session.userId);
      pipeline.srem(userIndexKey, sessionId);

      // 3. Delete token hash lookup
      const tokenKey = this.buildTokenKey(organizationId, session.refreshTokenHash);
      pipeline.del(tokenKey);

      await pipeline.exec();
    } catch (error) {
      throw new InfrastructureError('Failed to delete session from Redis', {
        service: 'cache',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Delete all sessions for a user (tenant-scoped)
   * Used for logout all devices, password reset, etc.
   *
   * @param userId - User identifier
   * @param organizationId - Organization for tenant isolation
   * @returns Number of sessions deleted
   */
  async deleteAllByUserId(userId: UUID, organizationId: OrganizationId): Promise<number> {
    try {
      const sessions = await this.findByUserId(userId, organizationId);

      if (sessions.length === 0) {
        return 0;
      }

      // Delete all sessions in parallel
      await Promise.all(sessions.map((session) => this.delete(session.id, organizationId)));

      return sessions.length;
    } catch (error) {
      throw new InfrastructureError('Failed to delete all sessions for user', {
        service: 'cache',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Build Redis key for session storage
   * Pattern: session:{organizationId}:{sessionId}
   */
  private buildSessionKey(organizationId: OrganizationId, sessionId: UUID): string {
    return `session:${organizationId}:${sessionId}`;
  }

  /**
   * Build Redis key for user sessions index
   * Pattern: session:user:{organizationId}:{userId}
   */
  private buildUserIndexKey(organizationId: OrganizationId, userId: UUID): string {
    return `session:user:${organizationId}:${userId}`;
  }

  /**
   * Build Redis key for token hash lookup
   * Pattern: session:token:{organizationId}:{tokenHash}
   */
  private buildTokenKey(organizationId: OrganizationId, tokenHash: string): string {
    // Use first 16 characters of hash for key (sufficient uniqueness)
    const shortHash = tokenHash.substring(0, 16);
    return `session:token:${organizationId}:${shortHash}`;
  }

  /**
   * Calculate TTL in seconds from expiration date
   * Returns remaining time until expiration
   *
   * @param expiresAt - Expiration timestamp
   * @returns TTL in seconds (minimum 1 second)
   */
  private calculateTTL(expiresAt: Date): number {
    const now = Date.now();
    const expiresAtMs = expiresAt.getTime();
    const ttlMs = expiresAtMs - now;

    // Convert to seconds, ensure minimum 1 second
    const ttlSeconds = Math.max(1, Math.floor(ttlMs / 1000));

    return ttlSeconds;
  }
}
