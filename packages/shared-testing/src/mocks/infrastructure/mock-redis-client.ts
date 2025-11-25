/**
 * Mock Redis Client
 * In-memory implementation of RedisClient for testing
 *
 * @module shared-testing/mocks/infrastructure
 */

import { HealthStatus } from '@dentalos/shared-infra';
import type { HealthCheckResult } from '@dentalos/shared-infra';

/**
 * Mock Redis client for testing
 * Stores key-value pairs in memory
 */
export class MockRedisClient {
  private store: Map<string, string> = new Map();
  private expirations: Map<string, number> = new Map();
  private connected: boolean = true;

  /**
   * Get a value from cache
   */
  public async get(key: string): Promise<string | null> {
    this.checkExpiration(key);

    return this.store.get(key) ?? null;
  }

  /**
   * Set a value in cache with optional TTL
   */
  public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.store.set(key, value);

    if (ttlSeconds) {
      const expiresAt = Date.now() + ttlSeconds * 1000;
      this.expirations.set(key, expiresAt);
    }
  }

  /**
   * Delete a key from cache
   */
  public async del(key: string): Promise<number> {
    const existed = this.store.has(key);
    this.store.delete(key);
    this.expirations.delete(key);
    return existed ? 1 : 0;
  }

  /**
   * Set expiration time on a key
   */
  public async expire(key: string, seconds: number): Promise<number> {
    if (!this.store.has(key)) {
      return 0;
    }

    const expiresAt = Date.now() + seconds * 1000;
    this.expirations.set(key, expiresAt);
    return 1;
  }

  /**
   * Check if a key exists
   */
  public async exists(key: string): Promise<boolean> {
    this.checkExpiration(key);
    return this.store.has(key);
  }

  /**
   * Increment a numeric value
   */
  public async incr(key: string): Promise<number> {
    const current = this.store.get(key);
    const value = current ? parseInt(current, 10) + 1 : 1;
    this.store.set(key, value.toString());
    return value;
  }

  /**
   * Decrement a numeric value
   */
  public async decr(key: string): Promise<number> {
    const current = this.store.get(key);
    const value = current ? parseInt(current, 10) - 1 : -1;
    this.store.set(key, value.toString());
    return value;
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<HealthCheckResult> {
    return {
      status: this.connected ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
      timestamp: new Date(),
      message: 'Mock Redis connection',
      metadata: {
        responseTimeMs: 0,
      },
    };
  }

  /**
   * Shutdown (no-op for mock)
   */
  public async shutdown(): Promise<void> {
    this.connected = false;
  }

  /**
   * Get all keys in store (testing utility)
   */
  public getAllKeys(): string[] {
    return Array.from(this.store.keys());
  }

  /**
   * Get all values in store (testing utility)
   */
  public getAllEntries(): Record<string, string> {
    const entries: Record<string, string> = {};
    this.store.forEach((value, key) => {
      entries[key] = value;
    });
    return entries;
  }

  /**
   * Reset all stored data
   */
  public reset(): void {
    this.store.clear();
    this.expirations.clear();
    this.connected = true;
  }

  /**
   * Check and remove expired keys
   * @private
   */
  private checkExpiration(key: string): void {
    const expiresAt = this.expirations.get(key);
    if (expiresAt && Date.now() >= expiresAt) {
      this.store.delete(key);
      this.expirations.delete(key);
    }
  }
}
