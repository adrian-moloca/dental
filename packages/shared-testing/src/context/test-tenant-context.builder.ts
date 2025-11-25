// @ts-nocheck
/**
 * Test Tenant Context Builder
 * Creates tenant contexts for testing multi-tenant isolation
 *
 * @module shared-testing/context
 */

import type { OrganizationId, ClinicId, TenantId, TenantContext } from '@dentalos/shared-types';
import { generateFakeOrganizationId, generateFakeClinicId } from '../generators/id-generator';

/**
 * Default test organization ID
 */
export const TEST_ORGANIZATION_ID = 'org-test-001' as OrganizationId;

/**
 * Default test clinic ID
 */
export const TEST_CLINIC_ID = 'clinic-test-001' as ClinicId;

/**
 * Creates a test tenant context with organization and optional clinic
 *
 * @param overrides - Partial tenant context to override defaults
 * @returns TenantContext for testing
 *
 * @example
 * ```typescript
 * const context = createTestTenantContext();
 * // { organizationId: 'org-test-001', clinicId: 'clinic-test-001' }
 *
 * const orgOnly = createTestTenantContext({ clinicId: undefined });
 * // { organizationId: 'org-test-001' }
 * ```
 */
export function createTestTenantContext(
  overrides?: Partial<TenantContext>
): TenantContext {
  const organizationId = overrides?.organizationId ?? TEST_ORGANIZATION_ID;
  const clinicId = overrides?.clinicId !== undefined ? overrides.clinicId : TEST_CLINIC_ID;

  const context: TenantContext = {
    organizationId,
    ...(clinicId && { clinicId }),
  };

  return context;
}

/**
 * Creates a test tenant context for organization-level operations
 *
 * @param organizationId - Optional organization ID
 * @returns Organization-level tenant context
 *
 * @example
 * ```typescript
 * const context = createOrganizationContext();
 * // { organizationId: 'org-test-001' }
 * ```
 */
export function createOrganizationContext(
  organizationId?: OrganizationId
): TenantContext {
  return {
    organizationId: organizationId ?? TEST_ORGANIZATION_ID,
  };
}

/**
 * Creates a test tenant context for clinic-level operations
 *
 * @param clinicId - Optional clinic ID
 * @param organizationId - Optional organization ID
 * @returns Clinic-level tenant context
 *
 * @example
 * ```typescript
 * const context = createClinicContext();
 * // { organizationId: 'org-test-001', clinicId: 'clinic-test-001' }
 * ```
 */
export function createClinicContext(
  clinicId?: ClinicId,
  organizationId?: OrganizationId
): TenantContext {
  return {
    organizationId: organizationId ?? TEST_ORGANIZATION_ID,
    clinicId: clinicId ?? TEST_CLINIC_ID,
  };
}

/**
 * Creates multiple test tenant contexts for multi-tenant testing
 *
 * @param count - Number of contexts to create
 * @returns Array of unique tenant contexts
 *
 * @example
 * ```typescript
 * const contexts = createMultipleTenantContexts(3);
 * // [
 * //   { organizationId: 'org-...', clinicId: 'clinic-...' },
 * //   { organizationId: 'org-...', clinicId: 'clinic-...' },
 * //   { organizationId: 'org-...', clinicId: 'clinic-...' }
 * // ]
 * ```
 */
export function createMultipleTenantContexts(count: number): TenantContext[] {
  if (count < 1) {
    throw new Error('Count must be at least 1');
  }

  return Array.from({ length: count }, () => ({
    organizationId: generateFakeOrganizationId(),
    clinicId: generateFakeClinicId(),
  }));
}

/**
 * Creates a random test tenant context
 *
 * @returns Random tenant context
 */
export function createRandomTenantContext(): TenantContext {
  return {
    organizationId: generateFakeOrganizationId(),
    clinicId: generateFakeClinicId(),
  };
}
// @ts-nocheck
