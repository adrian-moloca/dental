/**
 * Module Access Guard
 *
 * Authorization guard that validates user has access to specific modules
 * based on their cabinet's active subscription.
 *
 * Performance optimizations:
 * - Uses cached subscription data (5 minute TTL)
 * - Cache hit: <5ms
 * - Cache miss: <100ms (includes HTTP call to subscription service)
 *
 * Usage:
 * @UseGuards(JwtAuthGuard, ModuleAccessGuard)
 * @RequireModules(['SCHEDULING', 'PATIENT360'])
 * async createAppointment() { ... }
 *
 * Edge cases:
 * - User without cabinet → access denied
 * - Cabinet without subscription → access denied
 * - Subscription in trial → access granted to all included modules
 * - Subscription suspended but in grace period → access granted
 * - Subscription expired → access denied
 * - Module not in subscription → access denied
 * - Module deactivated → access denied
 *
 * @module modules/auth/guards
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UUID, OrganizationId } from '@dentalos/shared-types';
import { SubscriptionCacheService } from '../services/subscription-cache.service';
import { AuthenticationError } from '@dentalos/shared-errors';

/**
 * Metadata key for required modules
 */
export const REQUIRED_MODULES_KEY = 'required_modules';

/**
 * Decorator to specify required modules for an endpoint
 *
 * @param modules - Array of module codes required for access
 */
export const RequireModules = (...modules: string[]) => SetMetadata(REQUIRED_MODULES_KEY, modules);

/**
 * Request context with authenticated user
 */
interface RequestContext {
  user: {
    sub: UUID;
    organizationId: OrganizationId;
    cabinetId?: UUID;
    subscription?: {
      status: string;
      modules: string[];
    };
  };
}

/**
 * Module Access Guard
 *
 * Validates user has access to required modules based on subscription.
 * Uses cached subscription data for <50ms response time (performance budget).
 */
@Injectable()
export class ModuleAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionCache: SubscriptionCacheService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required modules from decorator
    const requiredModules = this.reflector.getAllAndOverride<string[]>(REQUIRED_MODULES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no modules required, allow access
    if (!requiredModules || requiredModules.length === 0) {
      return true;
    }

    // Get user from request (populated by JwtAuthGuard)
    const request = context.switchToHttp().getRequest<RequestContext>();
    const user = request.user;

    if (!user) {
      throw new AuthenticationError('User not authenticated', {
        reason: 'missing_credentials',
      });
    }

    // FAST PATH: Check if subscription context is in JWT (Phase 2)
    // If subscription data was included during login, validate directly from JWT
    if (user.subscription && user.subscription.modules) {
      return this.validateModulesFromJWT(
        user.subscription.modules,
        requiredModules,
        user.subscription.status
      );
    }

    // SLOW PATH: Fetch subscription from cache/service
    // This happens if:
    // 1. User logged in before Phase 2 implementation (no subscription in JWT)
    // 2. JWT was issued when subscription service was down
    // 3. Token was refreshed without fetching updated subscription

    if (!user.cabinetId) {
      throw new ForbiddenException('No cabinet context found. User must be assigned to a cabinet.');
    }

    // Fetch active modules from cache (or subscription service if cache miss)
    const startTime = Date.now();
    const activeModules = await this.subscriptionCache.getActiveModules(
      user.cabinetId,
      user.organizationId
    );
    const fetchTime = Date.now() - startTime;

    // Log performance metric
    if (fetchTime > 50) {
      console.warn(`Module access check exceeded 50ms budget: ${fetchTime}ms (cache miss?)`);
    }

    // Validate required modules are active
    const missingModules = requiredModules.filter((module) => !activeModules.includes(module));

    if (missingModules.length > 0) {
      throw new ForbiddenException(
        `Access denied. Required modules not active in subscription: ${missingModules.join(', ')}`
      );
    }

    return true;
  }

  /**
   * Validate modules from JWT subscription context (fast path)
   *
   * Performance: <1ms (no I/O)
   *
   * @param userModules - Active modules from JWT
   * @param requiredModules - Required modules for endpoint
   * @param subscriptionStatus - Subscription status from JWT
   * @returns True if access granted
   * @throws {ForbiddenException} If access denied
   * @private
   */
  private validateModulesFromJWT(
    userModules: string[],
    requiredModules: string[],
    subscriptionStatus: string
  ): boolean {
    // Check subscription status
    const validStatuses = ['TRIAL', 'ACTIVE', 'SUSPENDED'];
    if (!validStatuses.includes(subscriptionStatus)) {
      throw new ForbiddenException(
        `Subscription is ${subscriptionStatus.toLowerCase()}. Active subscription required.`
      );
    }

    // Validate all required modules are present
    const missingModules = requiredModules.filter((module) => !userModules.includes(module));

    if (missingModules.length > 0) {
      throw new ForbiddenException(
        `Access denied. Required modules not active in subscription: ${missingModules.join(', ')}`
      );
    }

    return true;
  }
}
