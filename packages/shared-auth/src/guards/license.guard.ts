/**
 * LicenseGuard - Module-based access control guard
 * @module shared-auth/guards/license-guard
 *
 * @description
 * NestJS guard that enforces subscription-based module access control.
 * Validates that authenticated users have the required module in their subscription.
 *
 * SECURITY REQUIREMENTS:
 * - NO database calls (uses JWT data only for performance)
 * - Reads module requirement from @RequiresModule decorator metadata
 * - Validates user.subscription.modules includes required module
 * - Throws ForbiddenException with clear message if module not licensed
 * - Allows access if no module requirement set (fails open for non-protected routes)
 * - Handles missing/malformed subscription data gracefully
 *
 * USAGE:
 * ```typescript
 * // Apply globally (recommended)
 * app.useGlobalGuards(
 *   new JwtAuthGuard(),
 *   new LicenseGuard(reflector),
 * );
 *
 * // Apply per-controller
 * @Controller('imaging')
 * @UseGuards(JwtAuthGuard, LicenseGuard)
 * export class ImagingController {
 *   @Post('/studies')
 *   @RequiresModule(ModuleCode.IMAGING)
 *   async createStudy(@CurrentUser() user: CurrentUser, @Body() dto: CreateStudyDto) {
 *     // Only users with IMAGING module can access
 *   }
 * }
 *
 * // Combined with roles
 * @Post('/admin/settings')
 * @RequiresModule(ModuleCode.ANALYTICS_ADVANCED)
 * @RequireRoles(UserRole.ORG_ADMIN)
 * async updateSettings() {
 *   // Requires both ANALYTICS_ADVANCED module AND ORG_ADMIN role
 * }
 * ```
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CurrentUser } from '../context/current-user';
import { ModuleCode } from '../jwt/jwt-payload.types';
import { MODULE_METADATA_KEY } from './requires-module.decorator';

/**
 * LicenseGuard - Enforces module-based access control
 *
 * @remarks
 * This guard MUST be used after JwtAuthGuard in the guards chain.
 * JwtAuthGuard populates request.user, which this guard depends on.
 *
 * The guard checks if:
 * 1. User is authenticated (request.user exists)
 * 2. Route requires a module (via @RequiresModule decorator)
 * 3. User's subscription includes the required module
 *
 * If no module requirement is set, the guard allows access (fails open).
 * This allows mixing protected and unprotected routes in the same controller.
 *
 * @example
 * ```typescript
 * // Global application (main.ts or app.module.ts)
 * const reflector = app.get(Reflector);
 * app.useGlobalGuards(
 *   new JwtAuthGuard(),        // First: authenticate
 *   new LicenseGuard(reflector), // Then: check license
 * );
 *
 * // Controller method
 * @Post('/studies/:id/ai-analyze')
 * @RequiresModule(ModuleCode.IMAGING)
 * async requestAIAnalysis(@Param('id') id: string) {
 *   // Only accessible with IMAGING module
 * }
 * ```
 *
 * @security
 * - Uses JWT data only (no external API calls)
 * - Logs all access denials for audit trail
 * - Clear error messages for troubleshooting
 * - Type-safe module codes via ModuleCode enum
 */
@Injectable()
export class LicenseGuard implements CanActivate {
  private readonly logger = new Logger(LicenseGuard.name);

  constructor(private readonly reflector: Reflector) {}

  /**
   * Determines if user has valid module license to access resource
   *
   * @param context - Execution context from NestJS
   * @returns true if access granted, throws ForbiddenException if denied
   *
   * @throws {ForbiddenException} If user not authenticated
   * @throws {ForbiddenException} If subscription data missing/malformed
   * @throws {ForbiddenException} If required module not in subscription
   *
   * Validation Flow:
   * 1. Extract user from request (set by JwtAuthGuard)
   * 2. Get required module from decorator metadata
   * 3. If no module required, allow access (fail open)
   * 4. Validate subscription exists in user context
   * 5. Validate modules array exists and is not empty
   * 6. Check if required module is in user's modules
   * 7. Log denial and throw exception if not found
   * 8. Return true if module access granted
   */
  canActivate(context: ExecutionContext): boolean {
    // Get required module from decorator metadata
    const requiredModule = this.reflector.getAllAndOverride<ModuleCode>(
      MODULE_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no module requirement, allow access
    // This allows mixing protected and unprotected routes
    if (!requiredModule) {
      return true;
    }

    // Extract user from request (populated by JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const user = request.user as CurrentUser;

    // Validate user exists
    if (!user) {
      this.logger.error({
        message: 'LicenseGuard: No user in request',
        path: request.url,
        method: request.method,
        requiredModule,
      });

      throw new ForbiddenException(
        'Authentication required. Please log in to access this resource.',
      );
    }

    // Validate subscription exists in JWT payload
    // The JWT is generated at login time with subscription context embedded
    const subscription = (user as any).subscription;

    if (!subscription) {
      this.logger.warn({
        message: 'LicenseGuard: No subscription in user context',
        userId: (user as any).userId || (user as any).sub,
        email: user.email,
        organizationId: (user as any).tenantContext?.organizationId,
        path: request.url,
        method: request.method,
        requiredModule,
      });

      throw new ForbiddenException(
        `Access denied: Module '${requiredModule}' is required but no subscription information found. Please contact your administrator.`,
      );
    }

    // Validate modules array exists
    const userModules = subscription.modules || [];

    if (!Array.isArray(userModules)) {
      this.logger.error({
        message: 'LicenseGuard: Invalid modules data type',
        userId: (user as any).userId || (user as any).sub,
        email: user.email,
        modulesType: typeof userModules,
        path: request.url,
        method: request.method,
        requiredModule,
      });

      throw new ForbiddenException(
        'Invalid subscription data. Please contact your administrator.',
      );
    }

    // Check if user has the required module
    const hasModule = userModules.includes(requiredModule);

    if (!hasModule) {
      this.logger.warn({
        message: 'LicenseGuard: Module access denied',
        userId: (user as any).userId || (user as any).sub,
        email: user.email,
        organizationId: (user as any).tenantContext?.organizationId,
        requiredModule,
        userModules,
        path: request.url,
        method: request.method,
      });

      throw new ForbiddenException(
        `Access denied: Module '${requiredModule}' is required but not enabled in your subscription. Please upgrade your plan to access this feature.`,
      );
    }

    // Module access granted
    this.logger.debug({
      message: 'LicenseGuard: Module access granted',
      userId: (user as any).userId || (user as any).sub,
      requiredModule,
      path: request.url,
      method: request.method,
    });

    return true;
  }
}
