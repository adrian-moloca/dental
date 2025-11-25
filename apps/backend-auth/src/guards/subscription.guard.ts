/**
 * Subscription Guard
 *
 * Enforces subscription-based access control on protected endpoints.
 * Validates that the authenticated user has an active subscription
 * with the required modules for the requested resource.
 *
 * SECURITY REQUIREMENTS:
 * - Validates subscription status (ACTIVE or TRIAL)
 * - Checks module access permissions
 * - Logs all access denials for audit trail
 * - Fails closed (denies access on errors)
 *
 * USAGE:
 * @UseGuards(JwtAuthGuard, SubscriptionGuard)
 * @RequireModule('CLINICAL')
 * @Get('clinical-notes')
 * async getClinicalNotes() { ... }
 *
 * @module guards/subscription-guard
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { CurrentUser } from '@dentalos/shared-auth';
import type { UUID } from '@dentalos/shared-types';
import { AuditLoggerService } from '../modules/audit/services/audit-logger.service';
import { AuditAction } from '../modules/audit/types/audit-action.enum';
import { AuditStatus } from '../modules/audit/entities/audit-log.entity';

/**
 * Metadata key for required module
 */
export const REQUIRED_MODULE_KEY = 'required_module';

/**
 * Valid subscription statuses that allow access
 */
const ACTIVE_SUBSCRIPTION_STATUSES = ['ACTIVE', 'TRIAL'];

/**
 * Subscription Guard
 *
 * Validates subscription status and module access before allowing request.
 */
@Injectable()
export class SubscriptionGuard implements CanActivate {
  private readonly logger = new Logger(SubscriptionGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogger: AuditLoggerService
  ) {}

  /**
   * Determine if user has valid subscription to access resource
   *
   * @param context - Execution context
   * @returns true if access granted, throws ForbiddenException if denied
   *
   * Validation Steps:
   * 1. Extract user from request (set by JwtAuthGuard)
   * 2. Check if endpoint requires module (via @RequireModule decorator)
   * 3. Validate subscription exists in JWT
   * 4. Validate subscription status is ACTIVE or TRIAL
   * 5. If module required, validate module is in subscription
   * 6. Log access decision (grant or deny)
   * 7. Return result
   *
   * Security Notes:
   * - Fails closed: Any error denies access
   * - Audits all denials for HIPAA compliance
   * - Does NOT make external API calls (uses JWT data for performance)
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: CurrentUser = request.user;

    // Validate user exists (should be set by JwtAuthGuard)
    if (!user) {
      this.logger.error({
        message: 'SubscriptionGuard: No user in request',
        path: request.url,
      });
      throw new ForbiddenException('Authentication required');
    }

    // Get required module from decorator (if any)
    const requiredModule = this.reflector.getAllAndOverride<string>(REQUIRED_MODULE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no module required, just validate subscription status
    if (!requiredModule) {
      return this.validateSubscriptionStatus(user, request);
    }

    // Module required - validate both status and module access
    return this.validateModuleAccess(user, requiredModule, request);
  }

  /**
   * Validate subscription status (ACTIVE or TRIAL)
   *
   * @param user - Current user from JWT
   * @param request - HTTP request
   * @returns true if valid, throws ForbiddenException if invalid
   */
  private async validateSubscriptionStatus(user: CurrentUser, request: any): Promise<boolean> {
    // Check if subscription data exists in JWT
    // Note: JWT is generated at login with subscription context
    const subscription = (user as any).subscription;

    if (!subscription) {
      // No subscription data in JWT
      // This can happen if:
      // 1. User logged in while subscription service was down
      // 2. JWT was issued before subscription integration
      // 3. User has no subscription (free tier)

      this.logger.warn({
        message: 'SubscriptionGuard: No subscription in JWT',
        userId: user.userId,
        organizationId: user.tenantContext.organizationId,
        path: request.url,
      });

      // Audit log the denial
      await this.auditLogger.logEvent({
        userId: user.userId,
        userEmail: user.email,
        userRoles: [...user.roles],
        action: AuditAction.AUTHORIZATION_DENIED,
        resource: 'subscription',
        resourceId: undefined,
        organizationId: user.tenantContext.organizationId,
        clinicId: user.tenantContext.clinicId,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        correlationId: request.headers['x-correlation-id'],
        status: AuditStatus.FAILURE,
        errorMessage: 'No subscription found in JWT',
        metadata: {
          path: request.url,
          method: request.method,
        },
      });

      throw new ForbiddenException('No active subscription. Please contact your administrator.');
    }

    // Validate subscription status
    if (!ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) {
      this.logger.warn({
        message: 'SubscriptionGuard: Inactive subscription',
        userId: user.userId,
        organizationId: user.tenantContext.organizationId,
        subscriptionStatus: subscription.status,
        path: request.url,
      });

      // Audit log the denial
      await this.auditLogger.logEvent({
        userId: user.userId,
        userEmail: user.email,
        userRoles: [...user.roles],
        action: AuditAction.AUTHORIZATION_DENIED,
        resource: 'subscription',
        resourceId: undefined,
        organizationId: user.tenantContext.organizationId,
        clinicId: user.tenantContext.clinicId,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        correlationId: request.headers['x-correlation-id'],
        status: AuditStatus.FAILURE,
        errorMessage: `Subscription status is ${subscription.status}`,
        metadata: {
          path: request.url,
          method: request.method,
          subscriptionStatus: subscription.status,
        },
      });

      throw new ForbiddenException(
        `Subscription is ${subscription.status.toLowerCase()}. Please renew your subscription.`
      );
    }

    // Subscription is active
    this.logger.debug({
      message: 'SubscriptionGuard: Subscription validated',
      userId: user.userId,
      subscriptionStatus: subscription.status,
    });

    return true;
  }

  /**
   * Validate module access
   *
   * @param user - Current user from JWT
   * @param requiredModule - Module code required for access
   * @param request - HTTP request
   * @returns true if access granted, throws ForbiddenException if denied
   */
  private async validateModuleAccess(
    user: CurrentUser,
    requiredModule: string,
    request: any
  ): Promise<boolean> {
    // First validate subscription status
    await this.validateSubscriptionStatus(user, request);

    const subscription = (user as any).subscription;

    // Validate module is in subscription
    const modules = subscription.modules || [];

    if (!modules.includes(requiredModule)) {
      this.logger.warn({
        message: 'SubscriptionGuard: Module access denied',
        userId: user.userId,
        organizationId: user.tenantContext.organizationId,
        requiredModule,
        userModules: modules,
        path: request.url,
      });

      // Audit log the denial (HIGH SECURITY EVENT)
      await this.auditLogger.logEvent({
        userId: user.userId,
        userEmail: user.email,
        userRoles: [...user.roles],
        action: AuditAction.MODULE_ACCESS_DENIED,
        resource: 'module',
        resourceId: requiredModule as UUID,
        organizationId: user.tenantContext.organizationId,
        clinicId: user.tenantContext.clinicId,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        correlationId: request.headers['x-correlation-id'],
        status: AuditStatus.FAILURE,
        errorMessage: `Access denied: Module ${requiredModule} not in subscription`,
        metadata: {
          path: request.url,
          method: request.method,
          requiredModule,
          userModules: modules,
          subscriptionStatus: subscription.status,
        },
      });

      throw new ForbiddenException(
        `Access denied. Your subscription does not include the ${requiredModule} module.`
      );
    }

    // Module access granted
    this.logger.debug({
      message: 'SubscriptionGuard: Module access granted',
      userId: user.userId,
      requiredModule,
    });

    // Audit log successful access (for HIPAA compliance)
    await this.auditLogger.logEvent({
      userId: user.userId,
      userEmail: user.email,
      userRoles: [...user.roles],
      action: AuditAction.MODULE_ACCESS_GRANTED,
      resource: 'module',
      resourceId: requiredModule as UUID,
      organizationId: user.tenantContext.organizationId,
      clinicId: user.tenantContext.clinicId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      correlationId: request.headers['x-correlation-id'],
      status: AuditStatus.SUCCESS,
      metadata: {
        path: request.url,
        method: request.method,
        requiredModule,
      },
    });

    return true;
  }
}
