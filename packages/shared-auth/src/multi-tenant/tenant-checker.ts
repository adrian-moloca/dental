/**
 * Multi-tenant access checkers
 * @module shared-auth/multi-tenant/tenant-checker
 */

import { OrganizationId, ClinicId } from '@dentalos/shared-types';
import { CurrentTenant } from '../context/current-tenant';
import { CurrentUser } from '../context/current-user';

/**
 * Checks if two tenant contexts refer to the same tenant
 *
 * @param context1 - First tenant context
 * @param context2 - Second tenant context
 * @returns true if same tenant, false otherwise
 *
 * @remarks
 * Performs strict equality check on computed tenantId.
 * Two contexts are the same tenant if:
 * - Both have same organizationId and no clinicId (org-level)
 * - Both have same organizationId and same clinicId (clinic-level)
 *
 * @security
 * This is a critical security function for tenant isolation.
 * Always use strict equality (===) for tenant ID comparison.
 */
export function isSameTenant(
  context1: CurrentTenant,
  context2: CurrentTenant,
): boolean {
  if (!context1 || !context2) {
    throw new Error('Both tenant contexts are required');
  }

  // Compare computed tenantId (which accounts for clinic vs org level)
  return context1.tenantId === context2.tenantId;
}

/**
 * Checks if tenant context belongs to a specific organization
 *
 * @param context - Tenant context to check
 * @param organizationId - Organization ID to match
 * @returns true if belongs to organization, false otherwise
 */
export function belongsToOrganization(
  context: CurrentTenant,
  organizationId: OrganizationId,
): boolean {
  if (!context) {
    throw new Error('Tenant context is required');
  }

  if (!organizationId) {
    throw new Error('organizationId is required');
  }

  return context.organizationId === organizationId;
}

/**
 * Checks if tenant context belongs to a specific clinic
 *
 * @param context - Tenant context to check
 * @param clinicId - Clinic ID to match
 * @returns true if belongs to clinic, false otherwise
 *
 * @remarks
 * Returns false if context has no clinicId (organization-level context)
 */
export function belongsToClinic(
  context: CurrentTenant,
  clinicId: ClinicId,
): boolean {
  if (!context) {
    throw new Error('Tenant context is required');
  }

  if (!clinicId) {
    throw new Error('clinicId is required');
  }

  if (!context.clinicId) {
    return false; // Context is org-level, not clinic-level
  }

  return context.clinicId === clinicId;
}

/**
 * Checks if user can access a specific organization
 *
 * @param user - Current authenticated user
 * @param organizationId - Organization ID to check
 * @returns true if user can access organization, false otherwise
 */
export function canAccessOrganization(
  user: CurrentUser,
  organizationId: OrganizationId,
): boolean {
  if (!user || !user.tenantContext) {
    throw new Error('Valid user with tenant context is required');
  }

  if (!organizationId) {
    throw new Error('organizationId is required');
  }

  return user.tenantContext.organizationId === organizationId;
}

/**
 * Checks if user can access a specific clinic
 *
 * @param user - Current authenticated user
 * @param clinicId - Clinic ID to check
 * @returns true if user can access clinic, false otherwise
 *
 * @remarks
 * User can access clinic if:
 * - User's current context is that clinic, OR
 * - User has organization-level access to the clinic's organization
 *   (organization-level users can access all clinics in their org)
 */
export function canAccessClinic(
  user: CurrentUser,
  clinicId: ClinicId,
): boolean {
  if (!user || !user.tenantContext) {
    throw new Error('Valid user with tenant context is required');
  }

  if (!clinicId) {
    throw new Error('clinicId is required');
  }

  // Check if user's current clinic context matches
  if (user.tenantContext.clinicId === clinicId) {
    return true;
  }

  // For organization-level users, check would require clinic-to-org mapping
  // This simplified version only checks direct clinic match
  // More complex implementations might query clinic ownership
  return false;
}

/**
 * Checks if user has organization-level access (no clinic restriction)
 *
 * @param user - Current authenticated user
 * @returns true if user is at organization level, false if clinic-scoped
 */
export function hasOrganizationLevelAccess(user: CurrentUser): boolean {
  if (!user || !user.tenantContext) {
    throw new Error('Valid user with tenant context is required');
  }

  return !user.tenantContext.clinicId;
}

/**
 * Checks if user has clinic-level access (scoped to specific clinic)
 *
 * @param user - Current authenticated user
 * @returns true if user is at clinic level, false if organization-level
 */
export function hasClinicLevelAccess(user: CurrentUser): boolean {
  if (!user || !user.tenantContext) {
    throw new Error('Valid user with tenant context is required');
  }

  return !!user.tenantContext.clinicId;
}
