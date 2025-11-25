// @ts-nocheck
/**
 * Domain Entity Factory
 * Helper functions for creating test entities
 *
 * @module shared-testing/factories
 */

import type { UUID, TenantContext } from '@dentalos/shared-types';
import { EntityStatus } from '@dentalos/shared-types';
import { generateFakeUUID } from '../generators/id-generator';
import { createTestTenantContext } from '../context/test-tenant-context.builder';

/**
 * Base entity fields for testing
 */
export interface TestEntityFields {
  id?: UUID;
  tenantContext?: TenantContext;
  createdAt?: Date;
  updatedAt?: Date;
  version?: number;
  status?: EntityStatus;
}

/**
 * Creates base entity fields with defaults
 *
 * @param overrides - Optional field overrides
 * @returns Entity fields
 *
 * @example
 * ```typescript
 * const fields = createTestEntityFields();
 * // { id: 'uuid', tenantContext: {...}, createdAt: Date, updatedAt: Date, version: 1 }
 * ```
 */
export function createTestEntityFields(overrides?: TestEntityFields): Required<TestEntityFields> {
  const now = new Date();

  return {
    id: overrides?.id ?? generateFakeUUID(),
    tenantContext: overrides?.tenantContext ?? createTestTenantContext(),
    createdAt: overrides?.createdAt ?? now,
    updatedAt: overrides?.updatedAt ?? now,
    version: overrides?.version ?? 1,
    status: overrides?.status ?? EntityStatus.ACTIVE,
  };
}

/**
 * Creates a soft-deleted entity fields
 *
 * @param overrides - Optional field overrides
 * @returns Entity fields with deleted status
 */
export function createDeletedEntityFields(overrides?: TestEntityFields): Required<TestEntityFields> & { deletedAt: Date } {
  const fields = createTestEntityFields({
    ...overrides,
    status: EntityStatus.DELETED,
  });

  return {
    ...fields,
    deletedAt: new Date(),
  };
}

/**
 * Creates an archived entity fields
 *
 * @param overrides - Optional field overrides
 * @returns Entity fields with archived status
 */
export function createArchivedEntityFields(overrides?: TestEntityFields): Required<TestEntityFields> {
  return createTestEntityFields({
    ...overrides,
    status: EntityStatus.ARCHIVED,
  });
}
// @ts-nocheck
