import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Cache Service - Redis-based caching with TTL strategies
 * Implements cache-aside pattern with automatic invalidation
 */

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix for namespacing
  compress?: boolean; // Compress large values
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  hitRate: number;
}

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redis: Redis;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
    hitRate: 0,
  };

  // Default TTL strategies by data type (in seconds)
  private readonly TTL_STRATEGIES = {
    // Billing specific
    invoice: 300, // 5 minutes
    payment: 300, // 5 minutes
    balance: 60, // 1 minute (frequently changing)
    ledger: 120, // 2 minutes

    // List/search results
    list: 30, // 30 seconds

    // Aggregations
    stats: 120, // 2 minutes

    // Session data
    session: 1800, // 30 minutes
  };

  constructor(private configService: ConfigService) {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');
    const redisDb = this.configService.get<number>('REDIS_DB', 0);

    this.redis = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      db: redisDb,
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      enableReadyCheck: true,
      lazyConnect: false,
    });

    this.redis.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });

    this.redis.on('error', (err: Error) => {
      this.logger.error('Redis connection error', err);
      this.stats.errors++;
    });

    // Log stats periodically
    setInterval(() => {
      this.logStats();
    }, 60000); // Every minute
  }

  async onModuleDestroy() {
    await this.redis.quit();
    this.logger.log('Redis connection closed');
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key, options?.prefix);
      const value = await this.redis.get(fullKey);

      if (value === null) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      this.updateHitRate();

      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}`, error);
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: unknown, options?: CacheOptions): Promise<void> {
    try {
      const fullKey = this.buildKey(key, options?.prefix);
      const serialized = JSON.stringify(value);

      const ttl = options?.ttl || this.TTL_STRATEGIES.list;

      await this.redis.setex(fullKey, ttl, serialized);
      this.stats.sets++;
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}`, error);
      this.stats.errors++;
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string | string[], options?: CacheOptions): Promise<void> {
    try {
      const keys = Array.isArray(key) ? key : [key];
      const fullKeys = keys.map((k) => this.buildKey(k, options?.prefix));

      await this.redis.del(...fullKeys);
      this.stats.deletes += fullKeys.length;
    } catch (error) {
      this.logger.error(`Cache delete error`, error);
      this.stats.errors++;
    }
  }

  /**
   * Delete keys by pattern (use carefully - can be slow)
   */
  async delPattern(pattern: string, options?: CacheOptions): Promise<number> {
    try {
      const fullPattern = this.buildKey(pattern, options?.prefix);
      const keys = await this.redis.keys(fullPattern);

      if (keys.length === 0) {
        return 0;
      }

      await this.redis.del(...keys);
      this.stats.deletes += keys.length;
      return keys.length;
    } catch (error) {
      this.logger.error(`Cache delete pattern error`, error);
      this.stats.errors++;
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string, options?: CacheOptions): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options?.prefix);
      const result = await this.redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      this.logger.error(`Cache exists error for key ${key}`, error);
      return false;
    }
  }

  /**
   * Cache-aside pattern: Get or compute
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, options?: CacheOptions): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Not in cache, compute value
    const value = await factory();

    // Store in cache (don't wait)
    this.set(key, value, options).catch((err) => {
      this.logger.error(`Failed to cache key ${key}`, err);
    });

    return value;
  }

  /**
   * Increment counter
   */
  async increment(key: string, options?: CacheOptions): Promise<number> {
    try {
      const fullKey = this.buildKey(key, options?.prefix);
      const result = await this.redis.incr(fullKey);

      // Set TTL if it doesn't exist
      const ttl = await this.redis.ttl(fullKey);
      if (ttl === -1) {
        await this.redis.expire(fullKey, options?.ttl || 3600);
      }

      return result;
    } catch (error) {
      this.logger.error(`Cache increment error for key ${key}`, error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      hitRate: 0,
    };
  }

  /**
   * Invalidation helpers for billing entities
   */

  // Invalidate invoice cache
  async invalidateInvoice(invoiceId: string): Promise<void> {
    await this.del([`invoice:${invoiceId}`, `invoice:${invoiceId}:*`]);
  }

  // Invalidate payment cache
  async invalidatePayment(paymentId: string): Promise<void> {
    await this.del([`payment:${paymentId}`]);
  }

  // Invalidate patient balance cache
  async invalidateBalance(patientId: string, organizationId?: string): Promise<void> {
    const keys = [`balance:patient:${patientId}`];
    if (organizationId) {
      keys.push(`balance:org:${organizationId}`);
    }
    await this.del(keys);
  }

  /**
   * Build full cache key with prefix
   */
  private buildKey(key: string, prefix?: string): string {
    const basePrefix = 'billing';
    return prefix ? `${basePrefix}:${prefix}:${key}` : `${basePrefix}:${key}`;
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Log statistics
   */
  private logStats(): void {
    const stats = this.getStats();
    this.logger.log({
      message: 'Cache statistics',
      hits: stats.hits,
      misses: stats.misses,
      hitRate: `${(stats.hitRate * 100).toFixed(2)}%`,
      sets: stats.sets,
      deletes: stats.deletes,
      errors: stats.errors,
    });
  }

  /**
   * Get TTL for data type
   */
  getTTL(type: keyof typeof this.TTL_STRATEGIES): number {
    return this.TTL_STRATEGIES[type];
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: 'ok' | 'error'; latency?: number }> {
    try {
      const start = Date.now();
      await this.redis.ping();
      const latency = Date.now() - start;

      return { status: 'ok', latency };
    } catch (error) {
      this.logger.error('Redis health check failed', error);
      return { status: 'error' };
    }
  }
}
