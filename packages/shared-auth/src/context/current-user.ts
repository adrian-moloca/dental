/**
 * Current user context for authenticated requests
 * @module shared-auth/context/current-user
 */

import {
  UUID,
  UserRole,
  Permission,
  OrganizationId,
  ClinicId,
  TenantId,
  Email,
} from '@dentalos/shared-types';
import type { JwtSubscriptionContext } from '../jwt/jwt-payload.types';

/**
 * Current authenticated user context
 * Represents the user making a request with all necessary authorization data
 *
 * @remarks
 * This is a read-only interface to prevent accidental mutation.
 * All fields are derived from the verified JWT token and should never be modified.
 *
 * @security
 * - Always derived from verified JWT tokens
 * - Contains complete authorization context (roles + permissions)
 * - Includes tenant context for multi-tenant isolation
 * - Includes subscription context for module-based access control
 * - Should be passed through request context, never stored globally
 */
export interface CurrentUser {
  /** User unique identifier */
  readonly userId: UUID;

  /** User email address */
  readonly email: Email;

  /** User roles in the system */
  readonly roles: readonly UserRole[];

  /** Computed permissions from roles and custom permissions */
  readonly permissions: readonly Permission[];

  /**
   * Cabinet ID (dental practice/location identifier)
   * Represents the primary cabinet this user belongs to
   * OPTIONAL for backward compatibility
   */
  readonly cabinetId?: UUID;

  /**
   * Subscription context for module-based access control
   * Contains subscription status and enabled module codes
   * OPTIONAL for backward compatibility
   */
  readonly subscription?: JwtSubscriptionContext;

  /**
   * Tenant context for multi-tenant isolation
   * Defines which organization/clinic the user is operating within
   */
  readonly tenantContext: {
    /** Organization ID (always present) */
    readonly organizationId: OrganizationId;

    /** Clinic ID (optional, for clinic-scoped operations) */
    readonly clinicId?: ClinicId;

    /** Cabinet ID (dental practice identifier) - OPTIONAL for backward compatibility */
    readonly cabinetId?: UUID;

    /** Computed tenant ID (for simplified tenant checks) */
    readonly tenantId: TenantId;
  };

  /**
   * Backward-compatible top-level access to tenant context
   * @deprecated Use tenantContext.organizationId instead for clarity
   */
  readonly organizationId: OrganizationId;

  /**
   * Backward-compatible top-level access to tenant context
   * @deprecated Use tenantContext.clinicId instead for clarity
   */
  readonly clinicId?: ClinicId;

  /**
   * Backward-compatible top-level access to tenant context
   * @deprecated Use tenantContext.tenantId instead for clarity
   */
  readonly tenantId: TenantId;
}

/**
 * Creates a CurrentUser instance from JWT payload and permissions
 *
 * @param params - User creation parameters
 * @returns CurrentUser instance
 *
 * @remarks
 * This is a factory function that ensures all required fields are present.
 * The permissions array should be pre-computed from roles.
 */
export function createCurrentUser(params: {
  userId: UUID;
  email: Email;
  roles: UserRole[];
  permissions: Permission[];
  organizationId: OrganizationId;
  clinicId?: ClinicId;
  cabinetId?: UUID;
  subscription?: JwtSubscriptionContext;
}): CurrentUser {
  // Validate required fields
  if (!params.userId) {
    throw new Error('userId is required');
  }

  if (!params.email) {
    throw new Error('email is required');
  }

  if (!params.roles || params.roles.length === 0) {
    throw new Error('At least one role is required');
  }

  if (!params.permissions) {
    throw new Error('permissions array is required (can be empty)');
  }

  if (!params.organizationId) {
    throw new Error('organizationId is required');
  }

  // Compute tenantId (prefer clinicId if present, otherwise organizationId)
  const tenantId: TenantId = (params.clinicId ?? params.organizationId) as unknown as TenantId;

  return {
    userId: params.userId,
    email: params.email,
    roles: Object.freeze([...params.roles]) as readonly UserRole[],
    permissions: Object.freeze([...params.permissions]) as readonly Permission[],
    cabinetId: params.cabinetId,
    subscription: params.subscription ? Object.freeze({
      status: params.subscription.status,
      modules: Object.freeze([...params.subscription.modules]) as readonly typeof params.subscription.modules[number][],
    }) as JwtSubscriptionContext : undefined,
    tenantContext: Object.freeze({
      organizationId: params.organizationId,
      clinicId: params.clinicId,
      cabinetId: params.cabinetId,
      tenantId,
    }),
    // Backward-compatible top-level properties
    organizationId: params.organizationId,
    clinicId: params.clinicId,
    tenantId,
  };
}
