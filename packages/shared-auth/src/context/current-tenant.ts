/**
 * Current tenant context utilities
 * @module shared-auth/context/current-tenant
 */

import { OrganizationId, ClinicId, TenantId } from '@dentalos/shared-types';
import { CurrentUser } from './current-user';

/**
 * Current tenant context
 * Represents the organizational/clinic scope of an operation
 *
 * @remarks
 * Tenant context is critical for multi-tenant data isolation.
 * All data access should be scoped to the current tenant.
 */
export interface CurrentTenant {
  /** Organization ID (always present) */
  readonly organizationId: OrganizationId;

  /** Clinic ID (optional, for clinic-scoped operations) */
  readonly clinicId?: ClinicId;

  /** Computed tenant ID (for simplified tenant checks) */
  readonly tenantId: TenantId;
}

/**
 * Extracts tenant context from current user
 *
 * @param user - Current authenticated user
 * @returns Tenant context
 *
 * @remarks
 * This is a convenience function for extracting just the tenant portion
 * of the user context when user-specific data is not needed.
 */
export function extractTenantContext(user: CurrentUser): CurrentTenant {
  if (!user || !user.tenantContext) {
    throw new Error('Invalid user: missing tenant context');
  }

  return {
    organizationId: user.tenantContext.organizationId,
    clinicId: user.tenantContext.clinicId,
    tenantId: user.tenantContext.tenantId,
  };
}

/**
 * Creates a tenant context from organization and optional clinic
 *
 * @param organizationId - Organization identifier
 * @param clinicId - Optional clinic identifier
 * @returns Tenant context
 */
export function createTenantContext(
  organizationId: OrganizationId,
  clinicId?: ClinicId,
): CurrentTenant {
  if (!organizationId) {
    throw new Error('organizationId is required');
  }

  // Compute tenantId (prefer clinicId if present, otherwise organizationId)
  const tenantId: TenantId = (clinicId ?? organizationId) as unknown as TenantId;

  return Object.freeze({
    organizationId,
    clinicId,
    tenantId,
  });
}

/**
 * Checks if a tenant context is organization-level (no clinic)
 *
 * @param tenant - Tenant context
 * @returns true if organization-level, false if clinic-level
 */
export function isOrganizationLevel(tenant: CurrentTenant): boolean {
  return !tenant.clinicId;
}

/**
 * Checks if a tenant context is clinic-level
 *
 * @param tenant - Tenant context
 * @returns true if clinic-level, false if organization-level
 */
export function isClinicLevel(tenant: CurrentTenant): boolean {
  return !!tenant.clinicId;
}
