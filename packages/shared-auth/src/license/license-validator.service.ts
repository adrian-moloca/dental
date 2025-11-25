/**
 * License validation service for dependency injection
 * @module shared-auth/license/validator-service
 */

import { CurrentUser } from '../context/current-user';
import { ModuleCode, SubscriptionStatus } from '../jwt/jwt-payload.types';
import {
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

/**
 * Custom exception class for license validation errors
 * Compatible with NestJS ForbiddenException when @nestjs/common is available
 */
export class LicenseForbiddenException extends Error {
  public readonly statusCode: number = 403;
  public readonly response: string | object;

  constructor(message: string) {
    super(message);
    this.name = 'LicenseForbiddenException';
    this.response = message;
  }
}

/**
 * License validation service
 *
 * @remarks
 * This service wraps pure validation functions for use in application services.
 * Can be used as-is or extended with @Injectable() decorator in NestJS applications.
 * Use the pure functions directly for pipes, guards, or unit tests.
 *
 * @example
 * ```typescript
 * // In NestJS application
 * @Injectable()
 * export class StudyService {
 *   constructor(private licenseValidator: LicenseValidatorService) {}
 *
 *   async createStudy(user: CurrentUser, dto: CreateStudyDto) {
 *     // Throw if module not available
 *     this.licenseValidator.requireModule(user, ModuleCode.IMAGING);
 *     // Proceed with creation
 *   }
 * }
 *
 * // In non-NestJS application
 * const validator = new LicenseValidatorService();
 * validator.requireModule(user, ModuleCode.IMAGING);
 * ```
 */
export class LicenseValidatorService {
  /**
   * Check if user has a specific module enabled
   *
   * @param user - Current authenticated user
   * @param moduleCode - Module code to check
   * @returns true if module is enabled, false otherwise
   *
   * @example
   * ```typescript
   * if (this.licenseValidator.hasModule(user, ModuleCode.IMAGING)) {
   *   // Allow access to imaging features
   * }
   * ```
   */
  hasModule(user: CurrentUser, moduleCode: ModuleCode): boolean {
    return hasModule(user, moduleCode);
  }

  /**
   * Require a specific module (throws if not available)
   *
   * @param user - Current authenticated user
   * @param moduleCode - Module code to require
   * @throws {ForbiddenException} if module is not enabled
   *
   * @example
   * ```typescript
   * // Throws ForbiddenException if module not available
   * this.licenseValidator.requireModule(user, ModuleCode.IMAGING);
   * // Continue with operation
   * ```
   */
  requireModule(user: CurrentUser, moduleCode: ModuleCode): void {
    if (!hasModule(user, moduleCode)) {
      throw new LicenseForbiddenException(
        `Access denied: Module '${moduleCode}' is required but not enabled in your subscription`,
      );
    }
  }

  /**
   * Require any of the specified modules (throws if none available)
   *
   * @param user - Current authenticated user
   * @param moduleCodes - Array of module codes (user needs at least one)
   * @throws {ForbiddenException} if none of the modules are enabled
   *
   * @example
   * ```typescript
   * this.licenseValidator.requireAnyModule(user, [
   *   ModuleCode.ANALYTICS_ADVANCED,
   *   ModuleCode.BILLING_BASIC,
   * ]);
   * ```
   */
  requireAnyModule(user: CurrentUser, moduleCodes: ModuleCode[]): void {
    if (!hasAnyModule(user, moduleCodes)) {
      throw new LicenseForbiddenException(
        `Access denied: At least one of the following modules is required: ${moduleCodes.join(', ')}`,
      );
    }
  }

  /**
   * Require all specified modules (throws if any missing)
   *
   * @param user - Current authenticated user
   * @param moduleCodes - Array of required module codes
   * @throws {ForbiddenException} if any module is missing
   *
   * @example
   * ```typescript
   * this.licenseValidator.requireAllModules(user, [
   *   ModuleCode.TELEDENTISTRY,
   *   ModuleCode.CLINICAL_BASIC,
   * ]);
   * ```
   */
  requireAllModules(user: CurrentUser, moduleCodes: ModuleCode[]): void {
    const missing = getMissingModules(user, moduleCodes);

    if (missing.length > 0) {
      throw new LicenseForbiddenException(
        `Access denied: The following modules are required but not enabled: ${missing.join(', ')}`,
      );
    }
  }

  /**
   * Check if user has any of the specified modules
   *
   * @param user - Current authenticated user
   * @param moduleCodes - Array of module codes to check
   * @returns true if user has at least one module
   */
  hasAnyModule(user: CurrentUser, moduleCodes: ModuleCode[]): boolean {
    return hasAnyModule(user, moduleCodes);
  }

  /**
   * Check if user has all specified modules
   *
   * @param user - Current authenticated user
   * @param moduleCodes - Array of module codes to check
   * @returns true if user has all modules
   */
  hasAllModules(user: CurrentUser, moduleCodes: ModuleCode[]): boolean {
    return hasAllModules(user, moduleCodes);
  }

  /**
   * Check if subscription is active
   *
   * @param user - Current authenticated user
   * @returns true if subscription is active or in trial
   *
   * @example
   * ```typescript
   * if (!this.licenseValidator.isSubscriptionActive(user)) {
   *   throw new ForbiddenException('Active subscription required');
   * }
   * ```
   */
  isSubscriptionActive(user: CurrentUser): boolean {
    return isSubscriptionActive(user);
  }

  /**
   * Require active subscription (throws if not active)
   *
   * @param user - Current authenticated user
   * @throws {ForbiddenException} if subscription is not active
   *
   * @example
   * ```typescript
   * this.licenseValidator.requireActiveSubscription(user);
   * // Continue with operation
   * ```
   */
  requireActiveSubscription(user: CurrentUser): void {
    if (!isSubscriptionActive(user)) {
      const status = getSubscriptionStatus(user);
      let message = 'Active subscription required';

      if (status === SubscriptionStatus.SUSPENDED) {
        message =
          'Your subscription payment has failed. Please update your payment method.';
      } else if (
        status === SubscriptionStatus.EXPIRED ||
        status === SubscriptionStatus.CANCELLED
      ) {
        message =
          'Your subscription has expired. Please renew to continue using this feature.';
      } else if (status === SubscriptionStatus.TRIAL) {
        // Trial is actually considered active, so this shouldn't normally happen
        message = 'Your trial has limitations on this feature.';
      }

      throw new LicenseForbiddenException(message);
    }
  }

  /**
   * Check if user is in grace period
   *
   * @param user - Current authenticated user
   * @returns true if subscription is suspended (grace period)
   *
   * @remarks
   * For detailed grace period information (days remaining, etc.),
   * fetch the full subscription entity and use grace-period.helper functions.
   */
  isInGracePeriod(user: CurrentUser): boolean {
    return isInGracePeriodSimple(user);
  }

  /**
   * Get all available modules for user
   *
   * @param user - Current authenticated user
   * @returns Array of enabled module codes
   *
   * @example
   * ```typescript
   * const modules = this.licenseValidator.getAvailableModules(user);
   * console.log(`User has ${modules.length} modules enabled`);
   * ```
   */
  getAvailableModules(user: CurrentUser): readonly ModuleCode[] {
    return getAvailableModules(user);
  }

  /**
   * Get enabled core modules
   *
   * @param user - Current authenticated user
   * @returns Array of enabled core module codes
   */
  getCoreModules(user: CurrentUser): ModuleCode[] {
    return getCoreModules(user);
  }

  /**
   * Get enabled premium modules
   *
   * @param user - Current authenticated user
   * @returns Array of enabled premium module codes
   */
  getPremiumModules(user: CurrentUser): ModuleCode[] {
    return getPremiumModules(user);
  }

  /**
   * Check if user has premium access
   *
   * @param user - Current authenticated user
   * @returns true if user has at least one premium module
   */
  hasPremiumAccess(user: CurrentUser): boolean {
    return hasPremiumAccess(user);
  }

  /**
   * Check if user has only core modules
   *
   * @param user - Current authenticated user
   * @returns true if user has no premium modules
   */
  hasOnlyCoreModules(user: CurrentUser): boolean {
    return hasOnlyCoreModules(user);
  }

  /**
   * Check if user can access a module (considers grace period)
   *
   * @param user - Current authenticated user
   * @param moduleCode - Module code to check
   * @returns true if module is accessible (active or grace period)
   */
  canAccessModule(user: CurrentUser, moduleCode: ModuleCode): boolean {
    return canAccessModule(user, moduleCode);
  }

  /**
   * Get missing modules from required list
   *
   * @param user - Current authenticated user
   * @param requiredModules - Array of required module codes
   * @returns Array of missing module codes
   */
  getMissingModules(
    user: CurrentUser,
    requiredModules: ModuleCode[],
  ): ModuleCode[] {
    return getMissingModules(user, requiredModules);
  }

  /**
   * Check if user is on trial
   *
   * @param user - Current authenticated user
   * @returns true if subscription is in trial status
   */
  isTrialUser(user: CurrentUser): boolean {
    return isTrialUser(user);
  }

  /**
   * Check if subscription has expired
   *
   * @param user - Current authenticated user
   * @returns true if subscription is expired or cancelled
   */
  isSubscriptionExpired(user: CurrentUser): boolean {
    return isSubscriptionExpired(user);
  }

  /**
   * Require subscription not to be expired
   *
   * @param user - Current authenticated user
   * @throws {ForbiddenException} if subscription is expired
   */
  requireNotExpired(user: CurrentUser): void {
    if (isSubscriptionExpired(user)) {
      throw new LicenseForbiddenException(
        'Your subscription has expired. Please renew to continue.',
      );
    }
  }

  /**
   * Get subscription status
   *
   * @param user - Current authenticated user
   * @returns Subscription status or null
   */
  getSubscriptionStatus(user: CurrentUser): SubscriptionStatus | null {
    return getSubscriptionStatus(user);
  }

  /**
   * Create a formatted error message for missing module
   *
   * @param moduleCode - Missing module code
   * @returns Formatted error message
   *
   * @example
   * ```typescript
   * const message = this.licenseValidator.getModuleRequiredMessage(
   *   ModuleCode.IMAGING
   * );
   * // "Module 'imaging' is required but not enabled in your subscription"
   * ```
   */
  getModuleRequiredMessage(moduleCode: ModuleCode): string {
    return `Module '${moduleCode}' is required but not enabled in your subscription`;
  }

  /**
   * Create a formatted error message for multiple missing modules
   *
   * @param moduleCodes - Array of missing module codes
   * @returns Formatted error message
   */
  getModulesRequiredMessage(moduleCodes: ModuleCode[]): string {
    if (moduleCodes.length === 0) {
      return '';
    }

    if (moduleCodes.length === 1) {
      return this.getModuleRequiredMessage(moduleCodes[0]);
    }

    return `The following modules are required but not enabled: ${moduleCodes.join(', ')}`;
  }
}
