/**
 * Test context builders
 * @module shared-testing/context
 */

// Tenant context builders
export {
  createTestTenantContext,
  createOrganizationContext,
  createClinicContext,
  createMultipleTenantContexts,
  createRandomTenantContext,
  TEST_ORGANIZATION_ID,
  TEST_CLINIC_ID,
} from './test-tenant-context.builder';

// User builders
export {
  createTestUser,
  createSuperAdmin,
  createDentist,
  createReceptionist,
  createRandomUser,
  TEST_USER_ID,
  TEST_USER_EMAIL,
} from './test-user.builder';

// Session builders
export {
  createTestSession,
  createExpiredSession,
  createExpiringSoonSession,
  createRandomSession,
  TEST_SESSION_ID,
} from './test-session.builder';
