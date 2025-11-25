/**
 * Integration Test Utilities
 *
 * Re-exports all test utilities for easy importing
 *
 * @module test/integration
 */

export {
  createTestApp,
  closeTestApp,
  authenticatedRequest,
  createMockToken,
  PatientDataFactory,
  RelationshipDataFactory,
  TestAssertions,
  type TestContext,
} from './test-setup';
