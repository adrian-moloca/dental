/**
 * Unit Test Setup
 *
 * Global setup for unit tests with mocking utilities.
 */

import { beforeAll, afterAll, afterEach } from 'vitest';

// Global test timeout
beforeAll(() => {
  // Set timezone to UTC for consistent date handling
  process.env.TZ = 'UTC';
});

afterEach(() => {
  // Clear all mocks after each test
  vi.clearAllMocks();
});

afterAll(() => {
  // Cleanup
});
