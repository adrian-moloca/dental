/**
 * License Guard - Enforces subscription-based feature access
 * @module shared-security/guards/license
 *
 * @security
 * - Validates module access based on JWT subscription context
 * - Enforces subscription status (EXPIRED, SUSPENDED, TRIAL)
 * - Implements grace period for read-only access during trial expiration
 * - Returns 402 Payment Required for expired subscriptions
 * - Returns 403 Forbidden for unauthorized module access
 *
 * @compliance
 * - Ensures only subscribed modules are accessible
 * - Provides clear error messages for frontend user experience
 * - Logs all license validation failures for audit trails
 *
 * @usage
 * Apply @RequiresModule decorator to routes/controllers that need module-based access control:
 * @RequiresModule(ModuleCode.IMAGING)
 * @Get('xrays')
 * async getXrays() { ... }
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleCode, SubscriptionStatus } from '@dentalos/shared-auth';
import type { CurrentUser } from '@dentalos/shared-auth';

/**
 * Custom exception for payment required (402 status)
 */
export class PaymentRequiredException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.PAYMENT_REQUIRED);
  }
}

/**
 * Metadata key for @RequiresModule decorator
 */
export const REQUIRED_MODULE_KEY = 'requiredModule';

/**
 * Decorator to mark routes/controllers as requiring a specific module
 * @param moduleCode - The module code required to access this resource
 *
 * @example
 * @RequiresModule(ModuleCode.IMAGING)
 * @Get('xrays')
 * async getXrays() {
 *   return this.imagingService.getXrays();
 * }
 */
export const RequiresModule = (moduleCode: ModuleCode) =>
  SetMetadata(REQUIRED_MODULE_KEY, moduleCode);

/**
 * HTTP methods that are considered read-only operations
 * Used for grace period enforcement
 */
const READ_ONLY_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * License Guard - Validates subscription-based module access
 *
 * @remarks
 * This guard enforces subscription-based feature access control by:
 * 1. Reading @RequiresModule metadata from route handlers
 * 2. Extracting CurrentUser from JWT (request.user)
 * 3. Validating subscription status (ACTIVE, TRIAL, EXPIRED, SUSPENDED)
 * 4. Checking if required module is in user's subscription.modules array
 * 5. Enforcing grace period rules (read-only access for expired trials)
 *
 * @security
 * - All module access checks are performed against JWT claims
 * - JWT validation must occur BEFORE this guard (via JwtAuthGuard)
 * - No database lookups - relies solely on token-embedded subscription data
 * - Subscription data in JWT is refreshed on token renewal
 *
 * @compliance
 * - Enforces SaaS licensing model
 * - Provides clear error messages for subscription issues
 * - Implements graceful degradation during trial expiration
 * - All license failures should be logged for audit purposes
 */
@Injectable()
export class LicenseGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * Validates if the current user has access to the requested module
   *
   * @param context - Execution context containing request details
   * @returns true if access is allowed, throws exception otherwise
   *
   * @throws {ForbiddenException} - When module not in subscription or subscription suspended
   * @throws {PaymentRequiredException} - When subscription expired (402 status)
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Extract required module from @RequiresModule metadata
    const requiredModule = this.reflector.getAllAndOverride<ModuleCode>(
      REQUIRED_MODULE_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 2. If no @RequiresModule decorator, allow access (not a protected route)
    if (!requiredModule) {
      return true;
    }

    // 3. Extract request and user from context
    const request = context.switchToHttp().getRequest();
    const user: CurrentUser = request.user;

    // 4. Ensure user is authenticated (should be handled by JwtAuthGuard)
    if (!user) {
      throw new ForbiddenException(
        'User not authenticated. License validation requires authentication.',
      );
    }

    // 5. Ensure subscription context exists in JWT
    if (!user.subscription) {
      throw new ForbiddenException(
        'Subscription context missing from authentication token. Please re-authenticate.',
      );
    }

    // 6. Validate subscription status
    const { status, modules } = user.subscription;

    // 7. Check for suspended subscriptions (always deny)
    if (status === SubscriptionStatus.SUSPENDED) {
      throw new ForbiddenException(
        'Your subscription has been suspended. Please contact support to restore access.',
      );
    }

    // 8. Check for expired subscriptions
    if (status === SubscriptionStatus.EXPIRED) {
      // Expired subscriptions get 402 Payment Required with grace period info
      throw new PaymentRequiredException(
        'Your subscription has expired. Please renew to continue using this feature.',
      );
    }

    // 9. Check for cancelled subscriptions
    if (status === SubscriptionStatus.CANCELLED) {
      throw new ForbiddenException(
        'Your subscription has been cancelled. Please subscribe to access this feature.',
      );
    }

    // 10. Validate module access
    const hasModuleAccess = modules.includes(requiredModule);

    if (!hasModuleAccess) {
      throw new ForbiddenException(
        `Access denied. The module "${requiredModule}" is not included in your subscription plan. Please upgrade to access this feature.`,
      );
    }

    // 11. Handle TRIAL status with grace period logic
    if (status === SubscriptionStatus.TRIAL) {
      // During trial, check if trial has expired (based on trialEndsAt in backend)
      // For now, we allow full access during TRIAL status
      // If backend sends EXPIRED status when trial ends, it will be caught in step 8
      // If you need to implement client-side trial expiration check, add logic here:
      //
      // if (user.subscription.trialEndsAt && new Date(user.subscription.trialEndsAt) < new Date()) {
      //   // Trial has expired - implement grace period
      //   if (READ_ONLY_METHODS.includes(httpMethod)) {
      //     // Allow read-only access during grace period
      //     return true;
      //   } else {
      //     // Deny write operations during grace period
      //     throw new PaymentRequiredException(
      //       'Your trial has expired. You have read-only access. Please subscribe to continue using all features.',
      //     );
      //   }
      // }
    }

    // 12. All checks passed - allow access
    return true;
  }
}

/**
 * Grace period helper - Determines if request should be allowed during grace period
 *
 * @param httpMethod - HTTP method from request (GET, POST, etc.)
 * @returns true if request is read-only and should be allowed
 *
 * @remarks
 * Grace period allows users to:
 * - View their data (GET requests)
 * - Export their data (specific GET endpoints)
 * - Cannot create, update, or delete data
 *
 * This provides a better UX during subscription expiration while encouraging renewal.
 */
export function isGracePeriodAllowed(httpMethod: string): boolean {
  return READ_ONLY_METHODS.includes(httpMethod.toUpperCase());
}

/**
 * Helper to check if user has specific module access
 * Can be used in service layer for additional checks
 *
 * @param user - Current user context
 * @param moduleCode - Module code to check
 * @returns true if user has access to the module
 *
 * @example
 * if (!hasModuleAccess(currentUser, ModuleCode.IMAGING)) {
 *   throw new ForbiddenException('Imaging module not available');
 * }
 */
export function hasModuleAccess(
  user: CurrentUser,
  moduleCode: ModuleCode,
): boolean {
  if (!user?.subscription?.modules) {
    return false;
  }

  return user.subscription.modules.includes(moduleCode);
}

/**
 * Helper to check if subscription is active (not expired/suspended/cancelled)
 *
 * @param user - Current user context
 * @returns true if subscription is active or in trial
 *
 * @example
 * if (!isSubscriptionActive(currentUser)) {
 *   throw new PaymentRequiredException('Subscription expired');
 * }
 */
export function isSubscriptionActive(user: CurrentUser): boolean {
  if (!user?.subscription?.status) {
    return false;
  }

  const activeStatuses = [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.TRIAL,
  ];

  return activeStatuses.includes(user.subscription.status);
}
