/**
 * Test setup utilities
 * @module shared-testing/setup
 */

// Unit test setup
export {
  setupUnitTest,
  teardownUnitTest,
  setupFakeTimers,
  restoreRealTimers,
} from './unit-test-setup';

// Integration test setup
export {
  setupIntegrationTest,
  teardownIntegrationTest,
  getIntegrationTestContext,
  resetIntegrationTestContext,
} from './integration-test-setup';
export type { IntegrationTestContext } from './integration-test-setup';

// E2E test setup
export {
  setupE2ETest,
  teardownE2ETest,
  getE2EConfig,
  resetE2ETestData,
} from './e2e-test-setup';
export type { E2ETestConfig } from './e2e-test-setup';
