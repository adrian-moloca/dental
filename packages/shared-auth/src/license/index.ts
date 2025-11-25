/**
 * License validation utilities for subscription-based access control
 * @module shared-auth/license
 */

// ============================================================================
// Constants
// ============================================================================
export {
  GRACE_PERIOD_DAYS,
  READ_METHODS,
  WRITE_METHODS,
  CORE_MODULES,
  PREMIUM_MODULES,
  ALL_MODULES,
  type HttpMethod,
  type ReadMethod,
  type WriteMethod,
} from './license.constants';

// ============================================================================
// Grace Period Helpers
// ============================================================================
export type { GracePeriodSubscription } from './grace-period.helper';

export {
  isInGracePeriod,
  getGracePeriodDaysRemaining,
  isGracePeriodExpiringSoon,
  isReadOperation,
  isWriteOperation,
  canPerformOperation,
  canPerformWriteOperation,
  calculateGracePeriodEnd,
  getGracePeriodStatusMessage,
} from './grace-period.helper';

// ============================================================================
// Module Dependency Helpers
// ============================================================================
export {
  getModuleDependencies,
  getAllModuleDependencies,
  hasModuleDependencies,
  getMissingDependencies,
  getAllMissingDependencies,
  areDependenciesSatisfied,
  getDependencyErrorMessage,
  validateModuleDependencies,
  dependsOn,
} from './module-dependencies.helper';

// ============================================================================
// License Validation Functions (Pure)
// ============================================================================
export {
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
} from './license-validator.functions';

// ============================================================================
// License Validation Service
// ============================================================================
export {
  LicenseValidatorService,
  LicenseForbiddenException,
} from './license-validator.service';
