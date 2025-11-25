/**
 * E2E Test Setup for backend-auth
 *
 * Global setup for E2E tests.
 */

import { afterAll, beforeAll } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.TZ = 'UTC';

beforeAll(async () => {
  // Setup
}, 60000);

afterAll(async () => {
  // Cleanup
}, 60000);
