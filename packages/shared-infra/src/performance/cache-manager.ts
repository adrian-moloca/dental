import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

export interface CacheOptions {
  ttl?: number; // seconds
  namespace?: string;
}

/**
 * Centralized cache manager for Redis-based caching across all services.
 * Provides automatic key namespacing, TTL management, and error handling.
 *
 * @example
 * const result = await cacheManager.getOrSet(
 *   'patients:list',
 *   () => fetchPatientsFromDB(),
 *   { ttl: 300, namespace: 'tenant-123' }
 * );
 */
@Injectable()
export class CacheManager {
  private readonly logger = new Logger(CacheManager.name);
  private readonly DEFAULT_TTL = 300; // 5 minutes

  constructor(private readonly redis: Redis) {}

  /**
   * Gets a value from cache or computes it using the provided function.
   * Automatically handles cache misses, serialization, and error recovery.
   */
  async getOrSet<T>(
    key: string,
    computeFn: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    const fullKey = this.buildKey(key, options?.namespace);

    try {
      const cached = await this.redis.get(fullKey);
      if (cached) {
        this.logger.debug(`Cache hit: ${fullKey}`);
        return JSON.parse(cached) as T;
      }

      this.logger.debug(`Cache miss: ${fullKey}`);
      const value = await computeFn();
      await this.set(key, value, options);
      return value;
    } catch (error) {
      this.logger.error(`Cache error for ${fullKey}:`, error);
      // On cache failure, fall back to computing the value
      return await computeFn();
    }
  }

  /**
   * Sets a value in cache with automatic serialization and TTL.
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const fullKey = this.buildKey(key, options?.namespace);
    const ttl = options?.ttl ?? this.DEFAULT_TTL;

    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(fullKey, ttl, serialized);
      this.logger.debug(`Cache set: ${fullKey} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.error(`Failed to set cache for ${fullKey}:`, error);
    }
  }

  /**
   * Gets a value from cache without fallback computation.
   */
  async get<T>(key: string, namespace?: string): Promise<T | null> {
    const fullKey = this.buildKey(key, namespace);

    try {
      const cached = await this.redis.get(fullKey);
      if (!cached) {
        return null;
      }
      return JSON.parse(cached) as T;
    } catch (error) {
      this.logger.error(`Failed to get cache for ${fullKey}:`, error);
      return null;
    }
  }

  /**
   * Deletes a value from cache.
   */
  async delete(key: string, namespace?: string): Promise<void> {
    const fullKey = this.buildKey(key, namespace);

    try {
      await this.redis.del(fullKey);
      this.logger.debug(`Cache deleted: ${fullKey}`);
    } catch (error) {
      this.logger.error(`Failed to delete cache for ${fullKey}:`, error);
    }
  }

  /**
   * Deletes all keys matching a pattern.
   * Use with caution in production.
   */
  async deletePattern(pattern: string, namespace?: string): Promise<void> {
    const fullPattern = this.buildKey(pattern, namespace);

    try {
      const keys = await this.redis.keys(fullPattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.debug(`Cache pattern deleted: ${fullPattern} (${keys.length} keys)`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete cache pattern ${fullPattern}:`, error);
    }
  }

  /**
   * Invalidates cache for a specific tenant.
   * Used when tenant data changes significantly.
   */
  async invalidateTenant(tenantId: string): Promise<void> {
    await this.deletePattern('*', `tenant:${tenantId}`);
  }

  /**
   * Builds a fully qualified cache key with namespace.
   */
  private buildKey(key: string, namespace?: string): string {
    if (namespace) {
      return `cache:${namespace}:${key}`;
    }
    return `cache:${key}`;
  }

  /**
   * Wraps a function with caching based on its arguments.
   * Useful for memoizing expensive operations.
   */
  memoize<TArgs extends any[], TResult>(
    fn: (...args: TArgs) => Promise<TResult>,
    keyBuilder: (...args: TArgs) => string,
    options?: CacheOptions,
  ): (...args: TArgs) => Promise<TResult> {
    return async (...args: TArgs): Promise<TResult> => {
      const key = keyBuilder(...args);
      return this.getOrSet(key, () => fn(...args), options);
    };
  }
}
