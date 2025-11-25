import Redis, { RedisOptions } from 'ioredis';
import { RedisConfig } from '../config/cache.config';
import { HealthCheckable, HealthCheckResult, HealthStatus } from '../health';

/**
 * Redis client with caching operations and pub/sub support
 */
export class RedisClient implements HealthCheckable {
  private client: Redis;
  private isShuttingDown = false;

  constructor(config: RedisConfig) {

    const options: RedisOptions = {
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db,
      keyPrefix: config.keyPrefix,
      maxRetriesPerRequest: config.maxRetriesPerRequest,
      connectTimeout: config.connectTimeout,
      enableReadyCheck: config.enableReadyCheck,
      lazyConnect: config.lazyConnect,
      maxLoadingRetryTime: config.maxLoadingRetryTime,
    };

    this.client = new Redis(options);
    this.setupEventHandlers();
  }

  /**
   * Setup Redis event handlers for monitoring
   */
  private setupEventHandlers(): void {
    this.client.on('error', (err) => {
      console.error('Redis client error:', {
        message: err.message,
      });
    });

    this.client.on('connect', () => {
      // Redis connected - can be logged for monitoring
    });

    this.client.on('ready', () => {
      // Redis ready to receive commands
    });

    this.client.on('close', () => {
      // Redis connection closed
    });

    this.client.on('reconnecting', () => {
      // Redis attempting to reconnect
    });
  }

  /**
   * Get a value from cache
   */
  public async get(key: string): Promise<string | null> {
    if (this.isShuttingDown) {
      throw new Error('RedisClient is shutting down');
    }

    try {
      return await this.client.get(key);
    } catch (error) {
      throw new Error(
        `Redis GET failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Set a value in cache with optional TTL
   */
  public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isShuttingDown) {
      throw new Error('RedisClient is shutting down');
    }

    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      throw new Error(
        `Redis SET failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete a key from cache
   */
  public async del(key: string): Promise<number> {
    if (this.isShuttingDown) {
      throw new Error('RedisClient is shutting down');
    }

    try {
      return await this.client.del(key);
    } catch (error) {
      throw new Error(
        `Redis DEL failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Set expiration time on a key
   */
  public async expire(key: string, seconds: number): Promise<number> {
    if (this.isShuttingDown) {
      throw new Error('RedisClient is shutting down');
    }

    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      throw new Error(
        `Redis EXPIRE failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if a key exists
   */
  public async exists(key: string): Promise<boolean> {
    if (this.isShuttingDown) {
      throw new Error('RedisClient is shutting down');
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      throw new Error(
        `Redis EXISTS failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Increment a numeric value
   */
  public async incr(key: string): Promise<number> {
    if (this.isShuttingDown) {
      throw new Error('RedisClient is shutting down');
    }

    try {
      return await this.client.incr(key);
    } catch (error) {
      throw new Error(
        `Redis INCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Decrement a numeric value
   */
  public async decr(key: string): Promise<number> {
    if (this.isShuttingDown) {
      throw new Error('RedisClient is shutting down');
    }

    try {
      return await this.client.decr(key);
    } catch (error) {
      throw new Error(
        `Redis DECR failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get the underlying Redis client for advanced operations
   */
  public getClient(): Redis {
    return this.client;
  }

  /**
   * Check if the Redis connection is healthy
   */
  public async healthCheck(): Promise<HealthCheckResult> {
    try {
      const start = Date.now();
      await this.client.ping();
      const duration = Date.now() - start;

      return {
        status: HealthStatus.HEALTHY,
        timestamp: new Date(),
        message: 'Redis connection healthy',
        metadata: {
          responseTimeMs: duration,
        },
      };
    } catch (error) {
      return {
        status: HealthStatus.UNHEALTHY,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Gracefully shutdown the Redis connection
   */
  public async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;

    try {
      await this.client.quit();
    } catch (error) {
      console.error(
        'Error during Redis shutdown:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      // Force disconnect if graceful quit fails
      this.client.disconnect();
      throw error;
    }
  }
}
