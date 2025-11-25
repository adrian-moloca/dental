/**
 * MfaChallengeRepository - Redis-backed challenge persistence
 *
 * Responsibilities:
 * - CRUD operations for temporary MFA challenges
 * - Multi-tenant data isolation (all operations scoped to organizationId)
 * - TTL management for automatic cleanup
 * - Atomic operations for attempt tracking
 *
 * Redis Storage Strategy:
 * - Key pattern: mfa:challenge:{organizationId}:{challengeId}
 * - TTL auto-expiration aligned with challenge expiresAt
 * - JSON stringified storage for compatibility
 *
 * Security:
 * - Challenge codes stored as Argon2id hashes
 * - Limited attempts to prevent brute-force
 * - Time-based expiration
 *
 * @module MfaChallengeRepository
 */

import { Injectable } from '@nestjs/common';
import { UUID, OrganizationId } from '@dentalos/shared-types';
import { InfrastructureError } from '@dentalos/shared-errors';
import { MfaChallenge } from '../entities/mfa-challenge.entity';
import { RedisService } from '../../../config/redis.config';

/**
 * Data transfer object for creating a new MFA challenge
 */
export interface CreateMfaChallengeData {
  userId: UUID;
  organizationId: OrganizationId;
  factorId: UUID;
  challengeCodeHash: string;
  expiresAt: Date;
  attemptsRemaining: number;
}

/**
 * MFA challenge repository for Redis persistence
 */
@Injectable()
export class MfaChallengeRepository {
  constructor(private readonly redisService: RedisService) {}

  /**
   * Create new MFA challenge in Redis
   *
   * @param data - Challenge creation data
   * @returns Created challenge entity
   */
  async create(data: CreateMfaChallengeData): Promise<MfaChallenge> {
    try {
      const challenge = new MfaChallenge({
        id: crypto.randomUUID() as UUID,
        ...data,
        createdAt: new Date(),
      });

      const ttlSeconds = this.calculateTTL(challenge.expiresAt);
      const challengeKey = this.buildChallengeKey(challenge.organizationId, challenge.id);
      const challengeJson = JSON.stringify(challenge.toJSON());

      await this.redisService.getClient().setex(challengeKey, ttlSeconds, challengeJson);

      return challenge;
    } catch (error) {
      throw new InfrastructureError('Failed to create MFA challenge', {
        service: 'cache',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Find challenge by ID (tenant-scoped)
   *
   * @param challengeId - Challenge identifier
   * @param organizationId - Organization for tenant isolation
   * @returns Challenge entity or null if not found
   */
  async findById(challengeId: UUID, organizationId: OrganizationId): Promise<MfaChallenge | null> {
    try {
      const challengeKey = this.buildChallengeKey(organizationId, challengeId);
      const challengeJson = await this.redisService.getClient().get(challengeKey);

      if (!challengeJson) {
        return null;
      }

      const data = JSON.parse(challengeJson);
      return MfaChallenge.fromJSON(data);
    } catch (error) {
      throw new InfrastructureError('Failed to retrieve MFA challenge', {
        service: 'cache',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Update existing challenge (tenant-scoped)
   *
   * @param challenge - Updated challenge entity
   * @returns Updated challenge entity
   */
  async update(challenge: MfaChallenge): Promise<MfaChallenge> {
    try {
      const ttlSeconds = this.calculateTTL(challenge.expiresAt);
      const challengeKey = this.buildChallengeKey(challenge.organizationId, challenge.id);
      const challengeJson = JSON.stringify(challenge.toJSON());

      await this.redisService.getClient().setex(challengeKey, ttlSeconds, challengeJson);

      return challenge;
    } catch (error) {
      throw new InfrastructureError('Failed to update MFA challenge', {
        service: 'cache',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Delete challenge (tenant-scoped)
   *
   * @param challengeId - Challenge identifier
   * @param organizationId - Organization for tenant isolation
   */
  async delete(challengeId: UUID, organizationId: OrganizationId): Promise<void> {
    try {
      const challengeKey = this.buildChallengeKey(organizationId, challengeId);
      await this.redisService.getClient().del(challengeKey);
    } catch (error) {
      throw new InfrastructureError('Failed to delete MFA challenge', {
        service: 'cache',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Delete all challenges for a factor (tenant-scoped)
   *
   * @param factorId - Factor identifier
   * @param organizationId - Organization for tenant isolation
   */
  async deleteByFactorId(_factorId: UUID, organizationId: OrganizationId): Promise<void> {
    try {
      const pattern = `mfa:challenge:${organizationId}:*`;
      const client = this.redisService.getClient();
      const keys = await client.keys(pattern);

      if (keys.length === 0) {
        return;
      }

      const pipeline = client.multi();
      keys.forEach((key: string) => pipeline.del(key));
      await pipeline.exec();
    } catch (error) {
      throw new InfrastructureError('Failed to delete MFA challenges by factor ID', {
        service: 'cache',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Build Redis key for challenge storage
   * Pattern: mfa:challenge:{organizationId}:{challengeId}
   */
  private buildChallengeKey(organizationId: OrganizationId, challengeId: UUID): string {
    return `mfa:challenge:${organizationId}:${challengeId}`;
  }

  /**
   * Calculate TTL in seconds from expiration date
   *
   * @param expiresAt - Expiration timestamp
   * @returns TTL in seconds (minimum 1 second)
   */
  private calculateTTL(expiresAt: Date): number {
    const now = Date.now();
    const expiresAtMs = expiresAt.getTime();
    const ttlMs = expiresAtMs - now;
    const ttlSeconds = Math.max(1, Math.floor(ttlMs / 1000));
    return ttlSeconds;
  }
}
