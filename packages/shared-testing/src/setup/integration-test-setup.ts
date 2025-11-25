/**
 * Integration Test Setup
 * Setup utilities for integration tests with in-memory infrastructure
 *
 * @module shared-testing/setup
 */

import { InMemoryEventBus, InMemoryCache } from '../mocks/in-memory';
import { MockLogger } from '../mocks/logger';

/**
 * Integration test context
 */
export interface IntegrationTestContext {
  eventBus: InMemoryEventBus;
  cache: InMemoryCache;
  logger: MockLogger;
}

let testContext: IntegrationTestContext | null = null;

/**
 * Setup integration test environment
 * Initializes in-memory infrastructure
 *
 * @returns Test context with infrastructure
 *
 * @example
 * ```typescript
 * import { beforeAll, afterAll } from 'vitest';
 * import { setupIntegrationTest, teardownIntegrationTest } from '@dentalos/shared-testing';
 *
 * beforeAll(async () => {
 *   await setupIntegrationTest();
 * });
 *
 * afterAll(async () => {
 *   await teardownIntegrationTest();
 * });
 * ```
 */
export async function setupIntegrationTest(): Promise<IntegrationTestContext> {
  const eventBus = new InMemoryEventBus();
  const cache = new InMemoryCache();
  const logger = new MockLogger();

  testContext = {
    eventBus,
    cache,
    logger,
  };

  return testContext;
}

/**
 * Teardown integration test environment
 */
export async function teardownIntegrationTest(): Promise<void> {
  if (testContext) {
    await testContext.cache.clear();
    testContext.eventBus.clear();
    testContext.logger.clearLogs();
    testContext = null;
  }
}

/**
 * Get current test context
 */
export function getIntegrationTestContext(): IntegrationTestContext {
  if (!testContext) {
    throw new Error('Integration test context not initialized. Call setupIntegrationTest() first.');
  }
  return testContext;
}

/**
 * Reset integration test context (clear data but keep instances)
 */
export async function resetIntegrationTestContext(): Promise<void> {
  if (testContext) {
    await testContext.cache.clear();
    testContext.eventBus.clear();
    testContext.logger.clearLogs();
  }
}
