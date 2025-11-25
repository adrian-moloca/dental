/**
 * SubscriptionStatusGuard - Validates subscription status
 * @module shared-auth/guards/subscription-status-guard
 *
 * @description
 * NestJS guard that validates subscription status before allowing access.
 * Enforces that users have ACTIVE or TRIAL subscription status.
 * Handles EXPIRED, SUSPENDED, and CANCELLED subscriptions with appropriate messages.
 *
 * SECURITY REQUIREMENTS:
 * - NO database calls (uses JWT data only for performance)
 * - Validates subscription.status is ACTIVE or TRIAL
 * - Returns 402 Payment Required for EXPIRED subscriptions
 * - Returns 403 Forbidden for SUSPENDED/CANCELLED subscriptions
 * - Optional grace period support (read-only access during grace period)
 * - Clear error messages for each subscription state
 *
 * USAGE:
 * ```typescript
 * // Apply globally (recommended for all protected routes)
 * app.useGlobalGuards(
 *   new JwtAuthGuard(),
 *   new SubscriptionStatusGuard(),
 *   new LicenseGuard(reflector),
 * );
 *
 * // Apply per-controller
 * @Controller('analytics')
 * @UseGuards(JwtAuthGuard, SubscriptionStatusGuard)
 * export class AnalyticsController {
 *   @Get('/reports')
 *   async getReports() {
 *     // Only accessible with ACTIVE/TRIAL subscription
 *   }
 * }
 * ```
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CurrentUser } from '../context/current-user';
import { SubscriptionStatus } from '../jwt/jwt-payload.types';

/**
 * Metadata key for allowing grace period access
 * Use with @SetMetadata decorator to allow read-only access during grace period
 */
export const ALLOW_GRACE_PERIOD_KEY = 'allow_grace_period';

/**
 * Valid subscription statuses that allow full access
 */
const ACTIVE_STATUSES: SubscriptionStatus[] = [
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.TRIAL,
];

/**
 * Read-only HTTP methods (allowed during grace period if enabled)
 */
const READ_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * SubscriptionStatusGuard - Enforces subscription status requirements
 *
 * @remarks
 * This guard MUST be used after JwtAuthGuard in the guards chain.
 * It should typically run BEFORE LicenseGuard to fail fast on expired subscriptions.
 *
 * Guard Order:
 * 1. JwtAuthGuard - Authenticates user
 * 2. SubscriptionStatusGuard - Validates subscription status
 * 3. LicenseGuard - Validates module access
 * 4. RolesGuard - Validates user roles (if needed)
 *
 * Subscription Status Handling:
 * - ACTIVE: Full access
 * - TRIAL: Full access
 * - SUSPENDED: Forbidden (grace period may apply)
 * - EXPIRED: Payment Required (402)
 * - CANCELLED: Forbidden (no grace period)
 *
 * Grace Period Support:
 * When a route is decorated with @SetMetadata(ALLOW_GRACE_PERIOD_KEY, true),
 * users in grace period (SUSPENDED status) can perform read-only operations.
 *
 * @example
 * ```typescript
 * // Standard usage - no grace period
 * @Get('/data')
 * async getData() {
 *   // Only ACTIVE/TRIAL can access
 * }
 *
 * // With grace period - allow read-only during grace
 * @Get('/reports')
 * @SetMetadata(ALLOW_GRACE_PERIOD_KEY, true)
 * async getReports() {
 *   // ACTIVE/TRIAL: full access
 *   // SUSPENDED: read-only access
 * }
 * ```
 *
 * @security
 * - Uses JWT data only (no external API calls)
 * - Returns appropriate HTTP status codes (402 vs 403)
 * - Logs all access denials for audit trail
 * - Clear error messages for each subscription state
 */
@Injectable()
export class SubscriptionStatusGuard implements CanActivate {
  private readonly logger = new Logger(SubscriptionStatusGuard.name);

  constructor(private readonly reflector: Reflector) {}

  /**
   * Determines if user has valid subscription status to access resource
   *
   * @param context - Execution context from NestJS
   * @returns true if access granted
   *
   * @throws {ForbiddenException} If user not authenticated
   * @throws {ForbiddenException} If subscription data missing
   * @throws {HttpException} If subscription EXPIRED (402 Payment Required)
   * @throws {ForbiddenException} If subscription SUSPENDED/CANCELLED (403)
   *
   * Validation Flow:
   * 1. Extract user from request (set by JwtAuthGuard)
   * 2. Validate subscription exists in user context
   * 3. Check subscription status
   * 4. Handle ACTIVE/TRIAL - allow access
   * 5. Handle EXPIRED - throw 402 Payment Required
   * 6. Handle SUSPENDED - check grace period, allow read-only if enabled
   * 7. Handle CANCELLED - throw 403 Forbidden
   * 8. Return true if access granted
   */
  canActivate(context: ExecutionContext): boolean {
    // Extract user and request
    const request = context.switchToHttp().getRequest();
    const user = request.user as CurrentUser;

    // Validate user exists
    if (!user) {
      this.logger.error({
        message: 'SubscriptionStatusGuard: No user in request',
        path: request.url,
        method: request.method,
      });

      throw new ForbiddenException(
        'Authentication required. Please log in to access this resource.',
      );
    }

    // Validate subscription exists in JWT payload
    const subscription = (user as any).subscription;

    if (!subscription) {
      this.logger.warn({
        message: 'SubscriptionStatusGuard: No subscription in user context',
        userId: (user as any).userId || (user as any).sub,
        email: user.email,
        organizationId: (user as any).tenantContext?.organizationId,
        path: request.url,
        method: request.method,
      });

      throw new ForbiddenException(
        'No active subscription. Please contact your administrator to set up a subscription.',
      );
    }

    const status = subscription.status;

    // Check if subscription is active or trial
    if (ACTIVE_STATUSES.includes(status)) {
      this.logger.debug({
        message: 'SubscriptionStatusGuard: Active subscription',
        userId: (user as any).userId || (user as any).sub,
        status,
        path: request.url,
        method: request.method,
      });

      return true;
    }

    // Handle EXPIRED subscription - return 402 Payment Required
    if (status === SubscriptionStatus.EXPIRED) {
      this.logger.warn({
        message: 'SubscriptionStatusGuard: Expired subscription',
        userId: (user as any).userId || (user as any).sub,
        email: user.email,
        organizationId: (user as any).tenantContext?.organizationId,
        status,
        path: request.url,
        method: request.method,
      });

      throw new HttpException(
        'Your subscription has expired. Please renew your subscription to continue using this feature.',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    // Handle SUSPENDED subscription - check grace period
    if (status === SubscriptionStatus.SUSPENDED) {
      // Check if route allows grace period access
      const allowGracePeriod = this.reflector.getAllAndOverride<boolean>(
        ALLOW_GRACE_PERIOD_KEY,
        [context.getHandler(), context.getClass()],
      );

      // Check if this is a read-only operation
      const isReadOperation = READ_METHODS.includes(
        request.method.toUpperCase(),
      );

      // Allow read-only access during grace period if enabled
      if (allowGracePeriod && isReadOperation) {
        this.logger.debug({
          message:
            'SubscriptionStatusGuard: Grace period read-only access granted',
          userId: (user as any).userId || (user as any).sub,
          status,
          method: request.method,
          path: request.url,
        });

        return true;
      }

      this.logger.warn({
        message: 'SubscriptionStatusGuard: Suspended subscription',
        userId: (user as any).userId || (user as any).sub,
        email: user.email,
        organizationId: (user as any).tenantContext?.organizationId,
        status,
        method: request.method,
        isReadOperation,
        allowGracePeriod,
        path: request.url,
      });

      throw new ForbiddenException(
        'Your subscription payment has failed. Please update your payment method to continue using this feature.',
      );
    }

    // Handle CANCELLED subscription
    if (status === SubscriptionStatus.CANCELLED) {
      this.logger.warn({
        message: 'SubscriptionStatusGuard: Cancelled subscription',
        userId: (user as any).userId || (user as any).sub,
        email: user.email,
        organizationId: (user as any).tenantContext?.organizationId,
        status,
        path: request.url,
        method: request.method,
      });

      throw new ForbiddenException(
        'Your subscription has been cancelled. Please reactivate your subscription to continue.',
      );
    }

    // Unknown subscription status - fail closed (deny access)
    this.logger.error({
      message: 'SubscriptionStatusGuard: Unknown subscription status',
      userId: (user as any).userId || (user as any).sub,
      email: user.email,
      status,
      path: request.url,
      method: request.method,
    });

    throw new ForbiddenException(
      'Invalid subscription status. Please contact support.',
    );
  }
}
