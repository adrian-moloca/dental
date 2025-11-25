/**
 * Shared Testing Package
 * Comprehensive test utilities for Dental OS platform
 *
 * @module shared-testing
 * @packageDocumentation
 */

// ============================================================================
// Test Context Builders
// ============================================================================
export {
  createTestTenantContext,
  createOrganizationContext,
  createClinicContext,
  createMultipleTenantContexts,
  createRandomTenantContext,
  TEST_ORGANIZATION_ID,
  TEST_CLINIC_ID,
  createTestUser,
  createSuperAdmin,
  createDentist,
  createReceptionist,
  createRandomUser,
  TEST_USER_ID,
  TEST_USER_EMAIL,
  createTestSession,
  createExpiredSession,
  createExpiringSoonSession,
  createRandomSession,
  TEST_SESSION_ID,
} from './context';

// ============================================================================
// Factories
// ============================================================================
export {
  createTestEmail,
  createTestPhone,
  createTestPersonName,
  createTestMoney,
  createZeroMoney,
  createTestAddress,
  createTestDateRange,
  createTestTimeSlot,
  createRandomDateRange,
  createRandomTimeSlot,
  createTestEntityFields,
  createDeletedEntityFields,
  createArchivedEntityFields,
  fakeEventEnvelope,
  createDomainEvent,
  createCorrelatedEvent,
  createEventChain,
} from './factories';
export type { TestEntityFields } from './factories';

// ============================================================================
// Generators
// ============================================================================
export {
  generateFakeUUID,
  generateDeterministicUUID,
  generateFakeOrganizationId,
  generateFakeClinicId,
  generateFakeTenantId,
  generateFakeEmail,
  generateDeterministicEmail,
  generateFakePhone,
  generateFakeName,
  generateFakeFirstName,
  generateFakeLastName,
  generateFakeAddress,
  generateFakeStreet,
  generateFakeCity,
  generateFakeStateCode,
  generateFakePostalCode,
  generateFakeDescription,
  generateRandomDate,
  generateFutureDate,
  generatePastDate,
} from './generators';

// ============================================================================
// Mock Infrastructure Clients
// ============================================================================
export {
  MockPostgresClient,
  MockRedisClient,
  MockRabbitMQClient,
  MockMongoDBClient,
  MockOpenSearchClient,
} from './mocks/infrastructure';

// ============================================================================
// In-Memory Implementations
// ============================================================================
export {
  InMemoryEventBus,
  InMemoryCache,
  InMemoryRepository,
} from './mocks/in-memory';
export type { CacheInterface, Repository } from './mocks/in-memory';

// ============================================================================
// Mock Logger
// ============================================================================
export { MockLogger, createMockLogger } from './mocks/logger';
export type { LogEntry, Logger } from './mocks/logger';

// ============================================================================
// Test Fixtures
// ============================================================================
export {
  TEST_PATIENTS,
  getTestPatient,
  TEST_APPOINTMENTS,
  getTestAppointment,
  TEST_CLINICS,
  getTestClinic,
  TEST_USERS,
  getTestUser,
} from './fixtures';
export type {
  TestPatient,
  TestAppointment,
  TestClinic,
  TestUser,
} from './fixtures';

// ============================================================================
// Test Setup Utilities
// ============================================================================
export {
  setupUnitTest,
  teardownUnitTest,
  setupFakeTimers,
  restoreRealTimers,
  setupIntegrationTest,
  teardownIntegrationTest,
  getIntegrationTestContext,
  resetIntegrationTestContext,
  setupE2ETest,
  teardownE2ETest,
  getE2EConfig,
  resetE2ETestData,
} from './setup';
export type { IntegrationTestContext, E2ETestConfig } from './setup';

// ============================================================================
// Custom Matchers
// ============================================================================
export { customMatchers, registerCustomMatchers } from './matchers';
