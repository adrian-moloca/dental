/**
 * Shared authentication and authorization utilities for Dental OS
 * @module shared-auth
 * @packageDocumentation
 */

// ============================================================================
// JWT Authentication
// ============================================================================
export type {
  AccessTokenPayload,
  RefreshTokenPayload,
  BaseJWTPayload,
  JwtSubscriptionContext,
} from './jwt';

export {
  verifyAccessToken,
  verifyRefreshToken,
  extractPayload,
  JWTError,
  JWTVerificationError,
  isTokenExpired,
  getTokenExpiration,
  getTimeUntilExpiration,
  willExpireWithin,
  getTokenAge,
  ModuleCode,
  SubscriptionStatus,
  ALLOWED_JWT_ALGORITHMS,
} from './jwt';

// ============================================================================
// Context Types
// ============================================================================
export type { CurrentUser, CurrentTenant, Session, CreateSessionParams } from './context';

export {
  createCurrentUser,
  extractTenantContext,
  createTenantContext,
  isOrganizationLevel,
  isClinicLevel,
  createSession,
  isSessionExpired,
  getSessionTimeRemaining,
} from './context';

// ============================================================================
// RBAC/ABAC
// ============================================================================
export type { Scope } from './rbac';

export {
  // Role checkers
  hasRole,
  hasAnyRole,
  hasAllRoles,
  isSuperAdmin,
  isOrgAdmin,
  isClinicAdmin,
  isClinicalStaff,
  // Permission checkers
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  canAccessResource,
  getResourcePermissions,
  hasFullAccess,
  // Scope checkers
  extractScopes,
  hasScope,
  hasScopeForResource,
  hasAllScopes,
  hasAnyScope,
  toScope,
} from './rbac';

// ============================================================================
// Guards and Decorators
// ============================================================================
export type {
  AuthGuard,
  PermissionGuard,
  TenantGuard,
  PermissionTenantGuard,
  GuardContext,
  PermissionMetadata,
  RoleMetadata,
  ModuleMetadata,
} from './guards';

export {
  RequirePermissions,
  RequireAnyPermission,
  getPermissionMetadata,
  PERMISSION_METADATA_KEY,
  RequireRoles,
  RequireAllRoles,
  getRoleMetadata,
  ROLE_METADATA_KEY,
  RequiresModule,
  getModuleMetadata,
  MODULE_METADATA_KEY,
  LicenseGuard,
  SubscriptionStatusGuard,
  ALLOW_GRACE_PERIOD_KEY,
} from './guards';

// ============================================================================
// Multi-Tenant Security
// ============================================================================
export {
  // Tenant checkers
  isSameTenant,
  belongsToOrganization,
  belongsToClinic,
  canAccessOrganization,
  canAccessClinic,
  hasOrganizationLevelAccess,
  hasClinicLevelAccess,
  // Tenant validators
  validateTenantAccess,
  ensureTenantIsolation,
  validateOrganizationAccess,
  validateClinicAccess,
  TenantIsolationError,
} from './multi-tenant';

// ============================================================================
// License Validation (Module-Based Access Control)
// ============================================================================
export type {
  GracePeriodSubscription,
  HttpMethod,
  ReadMethod,
  WriteMethod,
} from './license';

export {
  // Constants
  GRACE_PERIOD_DAYS,
  READ_METHODS,
  WRITE_METHODS,
  CORE_MODULES,
  PREMIUM_MODULES,
  ALL_MODULES,
  // Grace period helpers
  isInGracePeriod,
  getGracePeriodDaysRemaining,
  isGracePeriodExpiringSoon,
  isReadOperation,
  isWriteOperation,
  canPerformOperation,
  canPerformWriteOperation,
  calculateGracePeriodEnd,
  getGracePeriodStatusMessage,
  // Module dependency helpers
  getModuleDependencies,
  getAllModuleDependencies,
  hasModuleDependencies,
  getMissingDependencies,
  getAllMissingDependencies,
  areDependenciesSatisfied,
  getDependencyErrorMessage,
  validateModuleDependencies,
  dependsOn,
  // License validation functions (pure)
  hasModule,
  hasAnyModule,
  hasAllModules,
  getAvailableModules,
  isSubscriptionActive,
  isInGracePeriodSimple,
  hasPremiumAccess,
  hasOnlyCoreModules,
  getCoreModules,
  getPremiumModules,
  canAccessModule,
  getMissingModules,
  isTrialUser,
  isSubscriptionExpired,
  getSubscriptionStatus,
  // License validation service
  LicenseValidatorService,
  LicenseForbiddenException,
} from './license';
