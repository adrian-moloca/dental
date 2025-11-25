/**
 * Multi-tenant security utilities
 * @module shared-auth/multi-tenant
 */

export {
  isSameTenant,
  belongsToOrganization,
  belongsToClinic,
  canAccessOrganization,
  canAccessClinic,
  hasOrganizationLevelAccess,
  hasClinicLevelAccess,
} from './tenant-checker';

export {
  validateTenantAccess,
  ensureTenantIsolation,
  canAccessOrganization as canAccessOrganizationValidator,
  validateOrganizationAccess,
  canAccessClinic as canAccessClinicValidator,
  validateClinicAccess,
  TenantIsolationError,
} from './tenant-validators';
