/**
 * Pure license validation functions
 * @module shared-auth/license/validator-functions
 */

import { CurrentUser } from '../context/current-user';
import { ModuleCode, SubscriptionStatus } from '../jwt/jwt-payload.types';
import { CORE_MODULES, PREMIUM_MODULES } from './license.constants';

/**
 * Check if user has a specific module enabled
 *
 * @param user - Current authenticated user
 * @param moduleCode - Module code to check
 * @returns true if module is enabled, false otherwise
 *
 * @remarks
 * This is a pure function with no side effects.
 * Module availability is determined solely by user's subscription context.
 *
 * @example
 * ```typescript
 * if (hasModule(user, ModuleCode.IMAGING)) {
 *   // Allow access to imaging features
 * }
 * ```
 */
export function hasModule(user: CurrentUser, moduleCode: ModuleCode): boolean {
  if (!user || !user.subscription) {
    return false;
  }

  // Check if module is in user's enabled modules list
  return user.subscription.modules.includes(moduleCode);
}

/**
 * Check if user has any of the specified modules
 *
 * @param user - Current authenticated user
 * @param moduleCodes - Array of module codes to check
 * @returns true if user has at least one module, false otherwise
 *
 * @example
 * ```typescript
 * const canAccessReports = hasAnyModule(user, [
 *   ModuleCode.ANALYTICS_ADVANCED,
 *   ModuleCode.BILLING_BASIC,
 * ]);
 * ```
 */
export function hasAnyModule(
  user: CurrentUser,
  moduleCodes: ModuleCode[],
): boolean {
  if (!user || !user.subscription || !moduleCodes || moduleCodes.length === 0) {
    return false;
  }

  return moduleCodes.some((code) => hasModule(user, code));
}

/**
 * Check if user has all specified modules
 *
 * @param user - Current authenticated user
 * @param moduleCodes - Array of module codes to check
 * @returns true if user has all modules, false otherwise
 *
 * @example
 * ```typescript
 * const canUseTelehealth = hasAllModules(user, [
 *   ModuleCode.TELEDENTISTRY,
 *   ModuleCode.CLINICAL_BASIC,
 * ]);
 * ```
 */
export function hasAllModules(
  user: CurrentUser,
  moduleCodes: ModuleCode[],
): boolean {
  if (!user || !user.subscription || !moduleCodes || moduleCodes.length === 0) {
    return false;
  }

  return moduleCodes.every((code) => hasModule(user, code));
}

/**
 * Get all enabled modules for a user
 *
 * @param user - Current authenticated user
 * @returns Array of enabled module codes
 *
 * @example
 * ```typescript
 * const modules = getAvailableModules(user);
 * // Returns: [ModuleCode.SCHEDULING, ModuleCode.PATIENT_MANAGEMENT, ...]
 * ```
 */
export function getAvailableModules(user: CurrentUser): readonly ModuleCode[] {
  if (!user || !user.subscription) {
    return [];
  }

  return user.subscription.modules;
}

/**
 * Check if subscription is currently active
 *
 * @param user - Current authenticated user
 * @returns true if subscription is active or trial, false otherwise
 *
 * @remarks
 * Active status includes:
 * - ACTIVE: Paid subscription in good standing
 * - TRIAL: Free trial period
 *
 * Does not include SUSPENDED (even if in grace period)
 *
 * @example
 * ```typescript
 * if (!isSubscriptionActive(user)) {
 *   throw new ForbiddenException('Active subscription required');
 * }
 * ```
 */
export function isSubscriptionActive(user: CurrentUser): boolean {
  if (!user || !user.subscription) {
    return false;
  }

  return (
    user.subscription.status === SubscriptionStatus.ACTIVE ||
    user.subscription.status === SubscriptionStatus.TRIAL
  );
}

/**
 * Check if user's subscription is in grace period
 *
 * @param user - Current authenticated user
 * @returns true if in grace period, false otherwise
 *
 * @remarks
 * This function checks if the subscription status is SUSPENDED.
 * For detailed grace period checks (date validation, etc.),
 * use the grace-period.helper functions with full subscription data.
 *
 * @example
 * ```typescript
 * if (isInGracePeriodSimple(user)) {
 *   // Show grace period warning
 *   // Restrict write operations
 * }
 * ```
 */
export function isInGracePeriodSimple(user: CurrentUser): boolean {
  if (!user || !user.subscription) {
    return false;
  }

  return user.subscription.status === SubscriptionStatus.SUSPENDED;
}

/**
 * Check if user has access to premium features
 *
 * @param user - Current authenticated user
 * @returns true if user has at least one premium module
 *
 * @example
 * ```typescript
 * if (hasPremiumAccess(user)) {
 *   // Show premium features in UI
 * }
 * ```
 */
export function hasPremiumAccess(user: CurrentUser): boolean {
  if (!user || !user.subscription) {
    return false;
  }

  return PREMIUM_MODULES.some((code) => hasModule(user, code));
}

/**
 * Check if user has only core modules (no premium)
 *
 * @param user - Current authenticated user
 * @returns true if user has only core modules
 *
 * @example
 * ```typescript
 * if (hasOnlyCoreModules(user)) {
 *   // Show upgrade prompts for premium features
 * }
 * ```
 */
export function hasOnlyCoreModules(user: CurrentUser): boolean {
  if (!user || !user.subscription) {
    return false;
  }

  const userModules = user.subscription.modules;
  const hasPremium = PREMIUM_MODULES.some((code) => userModules.includes(code));

  return !hasPremium && userModules.length > 0;
}

/**
 * Get enabled core modules for a user
 *
 * @param user - Current authenticated user
 * @returns Array of enabled core module codes
 *
 * @example
 * ```typescript
 * const coreModules = getCoreModules(user);
 * // Returns: [ModuleCode.SCHEDULING, ModuleCode.PATIENT_MANAGEMENT]
 * ```
 */
export function getCoreModules(user: CurrentUser): ModuleCode[] {
  if (!user || !user.subscription) {
    return [];
  }

  return user.subscription.modules.filter((code) =>
    CORE_MODULES.includes(code),
  ) as ModuleCode[];
}

/**
 * Get enabled premium modules for a user
 *
 * @param user - Current authenticated user
 * @returns Array of enabled premium module codes
 *
 * @example
 * ```typescript
 * const premiumModules = getPremiumModules(user);
 * // Returns: [ModuleCode.IMAGING, ModuleCode.ANALYTICS_ADVANCED]
 * ```
 */
export function getPremiumModules(user: CurrentUser): ModuleCode[] {
  if (!user || !user.subscription) {
    return [];
  }

  return user.subscription.modules.filter((code) =>
    PREMIUM_MODULES.includes(code),
  ) as ModuleCode[];
}

/**
 * Check if user can access a module (considers grace period)
 *
 * @param user - Current authenticated user
 * @param moduleCode - Module code to check
 * @returns true if module is accessible, false otherwise
 *
 * @remarks
 * This is more permissive than hasModule:
 * - Returns true if module is enabled
 * - Returns true if in grace period (read-only access allowed)
 * - Returns false if subscription is expired/cancelled
 *
 * @example
 * ```typescript
 * if (canAccessModule(user, ModuleCode.PATIENT_MANAGEMENT)) {
 *   // Allow viewing patient data (even in grace period)
 * }
 * ```
 */
export function canAccessModule(
  user: CurrentUser,
  moduleCode: ModuleCode,
): boolean {
  if (!user || !user.subscription) {
    return false;
  }

  // Check if module is enabled
  if (!hasModule(user, moduleCode)) {
    return false;
  }

  // Allow access if active or trial
  if (isSubscriptionActive(user)) {
    return true;
  }

  // Allow read-only access if in grace period
  if (isInGracePeriodSimple(user)) {
    return true;
  }

  return false;
}

/**
 * Get missing modules from a required list
 *
 * @param user - Current authenticated user
 * @param requiredModules - Array of required module codes
 * @returns Array of missing module codes
 *
 * @example
 * ```typescript
 * const missing = getMissingModules(user, [
 *   ModuleCode.IMAGING,
 *   ModuleCode.CLINICAL_ADVANCED,
 * ]);
 *
 * if (missing.length > 0) {
 *   console.log(`Missing modules: ${missing.join(', ')}`);
 * }
 * ```
 */
export function getMissingModules(
  user: CurrentUser,
  requiredModules: ModuleCode[],
): ModuleCode[] {
  if (!user || !user.subscription) {
    return requiredModules;
  }

  return requiredModules.filter((code) => !hasModule(user, code));
}

/**
 * Check if user is on trial
 *
 * @param user - Current authenticated user
 * @returns true if subscription is in trial status
 *
 * @example
 * ```typescript
 * if (isTrialUser(user)) {
 *   // Show trial expiration notice
 * }
 * ```
 */
export function isTrialUser(user: CurrentUser): boolean {
  if (!user || !user.subscription) {
    return false;
  }

  return user.subscription.status === SubscriptionStatus.TRIAL;
}

/**
 * Check if subscription has expired
 *
 * @param user - Current authenticated user
 * @returns true if subscription is expired or cancelled
 *
 * @example
 * ```typescript
 * if (isSubscriptionExpired(user)) {
 *   throw new ForbiddenException('Subscription expired');
 * }
 * ```
 */
export function isSubscriptionExpired(user: CurrentUser): boolean {
  if (!user || !user.subscription) {
    return true; // No subscription = expired
  }

  return (
    user.subscription.status === SubscriptionStatus.EXPIRED ||
    user.subscription.status === SubscriptionStatus.CANCELLED
  );
}

/**
 * Get user's subscription status
 *
 * @param user - Current authenticated user
 * @returns Subscription status or null if no subscription
 *
 * @example
 * ```typescript
 * const status = getSubscriptionStatus(user);
 * if (status === SubscriptionStatus.SUSPENDED) {
 *   // Handle suspended state
 * }
 * ```
 */
export function getSubscriptionStatus(
  user: CurrentUser,
): SubscriptionStatus | null {
  if (!user || !user.subscription) {
    return null;
  }

  return user.subscription.status;
}
