/**
 * Global Test Setup
 *
 * This file runs once before all E2E tests.
 * Used for global environment setup and configuration.
 */

import 'reflect-metadata';

export async function setup(): Promise<void> {
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3001';
  process.env.LOG_LEVEL = 'error';

  if (!process.env.JWT_ACCESS_SECRET) {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret-min-32-chars-long';
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-chars-long';
  }

  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/dentalos_test';
  }

  if (!process.env.REDIS_URL) {
  process.env.REDIS_URL =
    'rediss://:d5596a97c1e3cf602a6f2103c99b780c@master.dentalos-redis.iyu7la.euc1.cache.amazonaws.com:6379';
  }
}

export async function teardown(): Promise<void> {
  // Cleanup if needed
}
