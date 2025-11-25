/**
 * E2E Test Setup
 *
 * Global setup for E2E tests with testcontainers support.
 * Manages PostgreSQL container lifecycle.
 */

import { afterAll, beforeAll } from 'vitest';

// Set environment to test
process.env.NODE_ENV = 'test';
process.env.TZ = 'UTC';

// Global setup before all tests
beforeAll(async () => {
  // Container setup is handled per test suite
}, 60000);

// Global cleanup after all tests
afterAll(async () => {
  // Container cleanup is handled per test suite
}, 60000);
