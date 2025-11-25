/**
 * Unit Test Setup
 * Setup utilities for unit tests
 *
 * @module shared-testing/setup
 */

import { vi } from 'vitest';

/**
 * Setup unit test environment
 * Resets all mocks and clears test data
 *
 * @example
 * ```typescript
 * import { beforeEach } from 'vitest';
 * import { setupUnitTest } from '@dentalos/shared-testing';
 *
 * beforeEach(() => {
 *   setupUnitTest();
 * });
 * ```
 */
export function setupUnitTest(): void {
  // Clear all mocks
  vi.clearAllMocks();

  // Reset all timers
  vi.clearAllTimers();

  // Reset module registry
  vi.resetModules();
}

/**
 * Cleanup after unit test
 */
export function teardownUnitTest(): void {
  vi.clearAllMocks();
  vi.restoreAllMocks();
}

/**
 * Setup fake timers for unit tests
 */
export function setupFakeTimers(): void {
  vi.useFakeTimers();
}

/**
 * Restore real timers
 */
export function restoreRealTimers(): void {
  vi.useRealTimers();
}
