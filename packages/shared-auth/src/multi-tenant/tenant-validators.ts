/**
 * Multi-tenant isolation validators
 * @module shared-auth/multi-tenant/tenant-validators
 *
 * @security
 * These validators enforce critical multi-tenant security boundaries.
 * They throw errors on access violations to prevent data leakage.
 * NEVER catch and ignore these errors without explicit security review.
 */

import { OrganizationId, ClinicId, TenantId } from '@dentalos/shared-types';
import { CurrentTenant } from '../context/current-tenant';
import { CurrentUser } from '../context/current-user';

/**
 * Tenant isolation violation error
 */
export class TenantIsolationError extends Error {
  constructor(
    message: string,
    public readonly userTenantId: TenantId,
    public readonly targetTenantId: TenantId,
  ) {
    super(message);
    this.name = 'TenantIsolationError';
    Object.setPrototypeOf(this, TenantIsolationError.prototype);
  }
}

/**
 * Validates that user can access a specific tenant
 * Throws if tenant IDs don't match
 *
 * @param user - Current authenticated user
 * @param targetTenantId - Tenant ID being accessed
 * @throws {TenantIsolationError} If user cannot access target tenant
 *
 * @security
 * This is the primary tenant isolation enforcement point.
 * Always call this before allowing data access operations.
 */
export function validateTenantAccess(
  user: CurrentUser,
  targetTenantId: TenantId,
): void {
  if (!user || !user.tenantContext) {
    throw new Error('Valid user with tenant context is required');
  }

  if (!targetTenantId) {
    throw new Error('targetTenantId is required');
  }

  if (user.tenantContext.tenantId !== targetTenantId) {
    throw new TenantIsolationError(
      `Tenant isolation violation: User from tenant ${user.tenantContext.tenantId} ` +
        `attempted to access data from tenant ${targetTenantId}`,
      user.tenantContext.tenantId,
      targetTenantId,
    );
  }
}

/**
 * Ensures strict tenant isolation between user and data contexts
 * Throws if contexts don't match exactly
 *
 * @param userContext - User's tenant context
 * @param dataContext - Data's tenant context
 * @throws {TenantIsolationError} If contexts don't match
 *
 * @security
 * Use this for validating that data belongs to user's tenant.
 * Critical for preventing cross-tenant data access.
 *
 * @example
 * ```typescript
 * const patient = await findPatient(id);
 * ensureTenantIsolation(user.tenantContext, {
 *   organizationId: patient.organizationId,
 *   clinicId: patient.clinicId,
 *   tenantId: patient.tenantId,
 * });
 * ```
 */
export function ensureTenantIsolation(
  userContext: CurrentTenant,
  dataContext: CurrentTenant,
): void {
  if (!userContext || !dataContext) {
    throw new Error('Both user and data contexts are required');
  }

  // First check: organizationId must match
  if (userContext.organizationId !== dataContext.organizationId) {
    throw new TenantIsolationError(
      `Organization isolation violation: User from organization ${userContext.organizationId} ` +
        `attempted to access data from organization ${dataContext.organizationId}`,
      userContext.tenantId,
      dataContext.tenantId,
    );
  }

  // Second check: tenantId must match (accounts for clinic vs org level)
  if (userContext.tenantId !== dataContext.tenantId) {
    throw new TenantIsolationError(
      `Tenant isolation violation: User tenant ${userContext.tenantId} ` +
        `attempted to access data from tenant ${dataContext.tenantId}`,
      userContext.tenantId,
      dataContext.tenantId,
    );
  }
}

/**
 * Checks if user can access a specific organization
 * Returns boolean instead of throwing
 *
 * @param user - Current authenticated user
 * @param organizationId - Organization ID to check
 * @returns true if access allowed, false otherwise
 *
 * @remarks
 * Use this for conditional logic.
 * Use validateOrganizationAccess() if you want to throw on violation.
 */
export function canAccessOrganization(
  user: CurrentUser,
  organizationId: OrganizationId,
): boolean {
  if (!user || !user.tenantContext) {
    return false;
  }

  if (!organizationId) {
    return false;
  }

  return user.tenantContext.organizationId === organizationId;
}

/**
 * Validates that user can access a specific organization
 * Throws if user's organization doesn't match
 *
 * @param user - Current authenticated user
 * @param organizationId - Organization ID being accessed
 * @throws {TenantIsolationError} If user cannot access organization
 */
export function validateOrganizationAccess(
  user: CurrentUser,
  organizationId: OrganizationId,
): void {
  if (!user || !user.tenantContext) {
    throw new Error('Valid user with tenant context is required');
  }

  if (!organizationId) {
    throw new Error('organizationId is required');
  }

  if (user.tenantContext.organizationId !== organizationId) {
    throw new TenantIsolationError(
      `Organization access denied: User from organization ${user.tenantContext.organizationId} ` +
        `attempted to access organization ${organizationId}`,
      user.tenantContext.tenantId,
      organizationId as unknown as TenantId,
    );
  }
}

/**
 * Checks if user can access a specific clinic
 * Returns boolean instead of throwing
 *
 * @param user - Current authenticated user
 * @param clinicId - Clinic ID to check
 * @returns true if access allowed, false otherwise
 *
 * @remarks
 * User can access clinic if:
 * - User's current context is that clinic
 * For more complex access rules (e.g., org-level users accessing clinics),
 * extend this function with clinic ownership lookup.
 */
export function canAccessClinic(user: CurrentUser, clinicId: ClinicId): boolean {
  if (!user || !user.tenantContext) {
    return false;
  }

  if (!clinicId) {
    return false;
  }

  // Direct clinic match
  if (user.tenantContext.clinicId === clinicId) {
    return true;
  }

  // For organization-level users accessing any clinic in their org,
  // would need clinic-to-org mapping lookup here
  // Simplified version: only allow direct match
  return false;
}

/**
 * Validates that user can access a specific clinic
 * Throws if user cannot access the clinic
 *
 * @param user - Current authenticated user
 * @param clinicId - Clinic ID being accessed
 * @throws {TenantIsolationError} If user cannot access clinic
 */
export function validateClinicAccess(user: CurrentUser, clinicId: ClinicId): void {
  if (!user || !user.tenantContext) {
    throw new Error('Valid user with tenant context is required');
  }

  if (!clinicId) {
    throw new Error('clinicId is required');
  }

  if (!canAccessClinic(user, clinicId)) {
    throw new TenantIsolationError(
      `Clinic access denied: User from tenant ${user.tenantContext.tenantId} ` +
        `attempted to access clinic ${clinicId}`,
      user.tenantContext.tenantId,
      clinicId as unknown as TenantId,
    );
  }
}
