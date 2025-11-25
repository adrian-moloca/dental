/**
 * Subscription Cache Service
 *
 * Caches subscription and cabinet data to reduce HTTP calls to subscription service.
 * Implements TTL-based expiration and cache invalidation strategies.
 *
 * Performance targets:
 * - Cache hit: <5ms
 * - Cache miss + fetch: <100ms
 * - TTL: 5 minutes (balances freshness with performance)
 *
 * Cache keys:
 * - cabinet:{cabinetId}:subscription -> SubscriptionSummary
 * - user:{userId}:org:{orgId}:cabinets -> CabinetSummary[]
 * - cabinet:{cabinetId}:modules -> string[] (active module codes)
 *
 * Invalidation triggers:
 * - Webhook from subscription service on subscription changes
 * - Manual invalidation via API endpoint
 * - TTL expiration (5 minutes)
 *
 * @module modules/auth/services
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { UUID, OrganizationId } from '@dentalos/shared-types';
import {
  SubscriptionClientService,
  SubscriptionSummary,
  CabinetSummary,
} from './subscription-client.service';

/**
 * Cache entry with TTL metadata
 */
interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttl: number;
}

/**
 * Subscription cache service
 *
 * In-memory cache for subscription data with TTL-based expiration.
 * TODO: Replace with Redis for distributed caching in production.
 */
@Injectable()
export class SubscriptionCacheService {
  private readonly logger = new Logger(SubscriptionCacheService.name);
  private readonly cache: Map<string, CacheEntry<any>> = new Map();
  private readonly defaultTtl: number;
  private readonly enabled: boolean;

  constructor(
    private readonly subscriptionClient: SubscriptionClientService,
    private readonly configService: ConfigService
  ) {
    // Cache TTL in milliseconds (default: 5 minutes)
    this.defaultTtl = this.configService.get<number>('SUBSCRIPTION_CACHE_TTL') || 300000;
    // Enable/disable cache (useful for testing)
    this.enabled = this.configService.get<boolean>('SUBSCRIPTION_CACHE_ENABLED') !== false;

    this.logger.log(
      `Subscription cache initialized (TTL: ${this.defaultTtl}ms, enabled: ${this.enabled})`
    );

    // Start background cleanup job (every 1 minute)
    this.startCleanupJob();
  }

  /**
   * Get cabinet subscription (cached or fetch)
   *
   * Cache key: cabinet:{cabinetId}:subscription
   * TTL: 5 minutes
   *
   * @param cabinetId - Cabinet UUID
   * @param organizationId - Organization UUID
   * @returns Subscription summary or null
   */
  async getCabinetSubscription(
    cabinetId: UUID,
    organizationId: OrganizationId
  ): Promise<SubscriptionSummary | null> {
    const cacheKey = `cabinet:${cabinetId}:subscription`;

    // Check cache
    const cached = this.get<SubscriptionSummary | null>(cacheKey);
    if (cached !== undefined) {
      this.logger.debug(`Cache HIT: ${cacheKey}`);
      return cached;
    }

    // Cache MISS - fetch from subscription service
    this.logger.debug(`Cache MISS: ${cacheKey}`);
    const startTime = Date.now();

    const subscription = await this.subscriptionClient.getCabinetSubscription(
      cabinetId,
      organizationId
    );

    const fetchTime = Date.now() - startTime;
    this.logger.debug(`Fetched subscription in ${fetchTime}ms`);

    // Store in cache
    this.set(cacheKey, subscription, this.defaultTtl);

    return subscription;
  }

  /**
   * Get user cabinets (cached or fetch)
   *
   * Cache key: user:{userId}:org:{orgId}:cabinets
   * TTL: 5 minutes
   *
   * @param userId - User UUID
   * @param organizationId - Organization UUID
   * @returns Array of cabinet summaries
   */
  async getUserCabinets(userId: UUID, organizationId: OrganizationId): Promise<CabinetSummary[]> {
    const cacheKey = `user:${userId}:org:${organizationId}:cabinets`;

    // Check cache
    const cached = this.get<CabinetSummary[]>(cacheKey);
    if (cached !== undefined) {
      this.logger.debug(`Cache HIT: ${cacheKey}`);
      return cached;
    }

    // Cache MISS - fetch from subscription service
    this.logger.debug(`Cache MISS: ${cacheKey}`);
    const startTime = Date.now();

    const cabinets = await this.subscriptionClient.getUserCabinets(userId, organizationId);

    const fetchTime = Date.now() - startTime;
    this.logger.debug(`Fetched ${cabinets.length} cabinets in ${fetchTime}ms`);

    // Store in cache
    this.set(cacheKey, cabinets, this.defaultTtl);

    return cabinets;
  }

  /**
   * Get active module codes for cabinet (cached or fetch)
   *
   * Cache key: cabinet:{cabinetId}:modules
   * TTL: 5 minutes
   *
   * Used for fast module access checks in guards/middleware.
   *
   * @param cabinetId - Cabinet UUID
   * @param organizationId - Organization UUID
   * @returns Array of active module codes
   */
  async getActiveModules(cabinetId: UUID, organizationId: OrganizationId): Promise<string[]> {
    const cacheKey = `cabinet:${cabinetId}:modules`;

    // Check cache
    const cached = this.get<string[]>(cacheKey);
    if (cached !== undefined) {
      this.logger.debug(`Cache HIT: ${cacheKey}`);
      return cached;
    }

    // Cache MISS - fetch subscription and extract modules
    this.logger.debug(`Cache MISS: ${cacheKey}`);
    const subscription = await this.getCabinetSubscription(cabinetId, organizationId);

    if (!subscription || !subscription.modules) {
      this.set(cacheKey, [], this.defaultTtl);
      return [];
    }

    const moduleCodes = subscription.modules
      .filter((m) => m.isActive && m.moduleCode)
      .map((m) => m.moduleCode!);

    // Store in cache
    this.set(cacheKey, moduleCodes, this.defaultTtl);

    return moduleCodes;
  }

  /**
   * Invalidate cache for specific cabinet
   *
   * Called when subscription changes are detected (webhook, event, etc.)
   *
   * @param cabinetId - Cabinet UUID
   */
  invalidateCabinet(cabinetId: UUID): void {
    const patterns = [`cabinet:${cabinetId}:subscription`, `cabinet:${cabinetId}:modules`];

    let invalidatedCount = 0;
    for (const pattern of patterns) {
      if (this.cache.delete(pattern)) {
        invalidatedCount++;
      }
    }

    if (invalidatedCount > 0) {
      this.logger.log(`Invalidated ${invalidatedCount} cache entries for cabinet ${cabinetId}`);
    }
  }

  /**
   * Invalidate cache for specific user
   *
   * @param userId - User UUID
   * @param organizationId - Organization UUID
   */
  invalidateUser(userId: UUID, organizationId: OrganizationId): void {
    const cacheKey = `user:${userId}:org:${organizationId}:cabinets`;

    if (this.cache.delete(cacheKey)) {
      this.logger.log(`Invalidated cabinet cache for user ${userId}`);
    }
  }

  /**
   * Clear all cache entries
   *
   * Used for testing or emergency cache flush.
   */
  clearAll(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.warn(`Cleared all cache entries (${size} entries removed)`);
  }

  /**
   * Get cache statistics
   *
   * Returns cache size and entry count for monitoring.
   *
   * @returns Cache statistics
   */
  getStats(): { entries: number; sizeBytes: number } {
    let sizeBytes = 0;

    for (const [key, entry] of this.cache.entries()) {
      // Rough size estimate
      sizeBytes += key.length * 2; // Key string size
      sizeBytes += JSON.stringify(entry.data).length * 2; // Data size
      sizeBytes += 16; // Metadata overhead
    }

    return {
      entries: this.cache.size,
      sizeBytes,
    };
  }

  /**
   * Get value from cache
   *
   * Checks TTL and returns undefined if expired.
   *
   * @param key - Cache key
   * @returns Cached value or undefined
   * @private
   */
  private get<T>(key: string): T | undefined {
    if (!this.enabled) {
      return undefined;
    }

    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // Check if expired
    const age = Date.now() - entry.cachedAt;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data as T;
  }

  /**
   * Set value in cache
   *
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds
   * @private
   */
  private set<T>(key: string, data: T, ttl: number): void {
    if (!this.enabled) {
      return;
    }

    this.cache.set(key, {
      data,
      cachedAt: Date.now(),
      ttl,
    });
  }

  /**
   * Background cleanup job
   *
   * Removes expired entries every minute to prevent memory bloat.
   *
   * @private
   */
  private startCleanupJob(): void {
    setInterval(() => {
      const now = Date.now();
      let removedCount = 0;

      for (const [key, entry] of this.cache.entries()) {
        const age = now - entry.cachedAt;
        if (age > entry.ttl) {
          this.cache.delete(key);
          removedCount++;
        }
      }

      if (removedCount > 0) {
        this.logger.debug(`Cleanup: removed ${removedCount} expired cache entries`);
      }
    }, 60000); // Run every 1 minute
  }
}
