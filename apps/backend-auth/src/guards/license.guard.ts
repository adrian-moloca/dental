/**
 * License Guard for Module-Based Access Control
 *
 * Enforces subscription module requirements on protected routes.
 * Works in conjunction with @RequiresModule() decorator from @dentalos/shared-auth.
 *
 * Features:
 * - Validates user has required module in JWT subscription context
 * - Enforces strict subscription validation (no graceful degradation)
 * - Works at controller and method level
 * - Provides detailed error messages for missing modules
 *
 * @security
 * - Relies on JWT validation by JwtAuthGuard (must run first)
 * - Checks subscription.modules array in CurrentUser
 * - Returns 403 Forbidden if module not available
 * - Logs access violations for security monitoring
 *
 * @module guards/license-guard
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  MODULE_METADATA_KEY,
  ModuleMetadata,
  LicenseValidatorService,
  CurrentUser,
} from '@dentalos/shared-auth';

/**
 * License guard for enforcing subscription module access
 *
 * @remarks
 * This guard should be applied globally or to specific controllers/routes
 * that require subscription module validation. It reads metadata set by
 * @RequiresModule() decorator and validates against CurrentUser subscription.
 *
 * Order of operations:
 * 1. JwtAuthGuard validates JWT and populates request.user (CurrentUser)
 * 2. LicenseGuard reads @RequiresModule() metadata
 * 3. If no module required, allows access
 * 4. If module required, validates user subscription includes it
 * 5. Throws ForbiddenException if module not available
 *
 * @example
 * ```typescript
 * // In app.module.ts - apply globally
 * {
 *   provide: APP_GUARD,
 *   useClass: JwtAuthGuard, // First: validate JWT
 * },
 * {
 *   provide: APP_GUARD,
 *   useClass: LicenseGuard, // Second: validate module access
 * }
 *
 * // In controller - use decorator
 * @Controller('imaging')
 * export class ImagingController {
 *   @Post('/studies/:id/ai-analyze')
 *   @RequiresModule(ModuleCode.IMAGING)
 *   async analyzeStudy(@CurrentUser() user: CurrentUser) {
 *     // Only accessible if user has IMAGING module
 *   }
 * }
 * ```
 */
@Injectable()
export class LicenseGuard implements CanActivate {
  private readonly logger = new Logger(LicenseGuard.name);
  private readonly licenseValidator = new LicenseValidatorService();

  constructor(private readonly reflector: Reflector) {}

  /**
   * Determines if the request can proceed based on module requirements
   *
   * @param context - Execution context containing request and handler metadata
   * @returns true if access allowed, throws ForbiddenException otherwise
   * @throws {ForbiddenException} If required module not available in subscription
   */
  canActivate(context: ExecutionContext): boolean {
    // Get module metadata from handler or controller
    // Reflector.getAllAndOverride checks method first, then class
    const moduleMetadata = this.reflector.getAllAndOverride<ModuleMetadata>(MODULE_METADATA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No module requirement - allow access
    if (!moduleMetadata) {
      return true;
    }

    // Extract current user from request (populated by JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const user: CurrentUser = request.user;

    // If no user in request, JwtAuthGuard should have blocked this
    // But we double-check for defense in depth
    if (!user) {
      this.logger.error(
        'LicenseGuard called without authenticated user - JwtAuthGuard may have failed'
      );
      throw new ForbiddenException('Authentication required');
    }

    // Extract required module from metadata
    const requiredModule = moduleMetadata.moduleCode;

    // Check if user has subscription context in JWT
    // SECURITY FIX: Remove graceful degradation - always enforce subscription requirement
    // This prevents bypass where users without subscription could access protected modules
    if (!user.subscription) {
      this.logger.error({
        message: 'LicenseGuard: No subscription context in JWT - blocking access',
        userId: user.userId,
        organizationId: user.organizationId,
        requiredModule,
        handler: context.getHandler().name,
        class: context.getClass().name,
      });

      throw new ForbiddenException(
        `Access denied: Module '${requiredModule}' is required but no subscription information found. Please contact your administrator.`
      );
    }

    // Validate user has required module
    try {
      this.licenseValidator.requireModule(user, requiredModule);

      // Access granted
      this.logger.debug({
        message: 'Module access granted',
        userId: user.userId,
        organizationId: user.organizationId,
        requiredModule,
        subscriptionStatus: user.subscription.status,
        handler: context.getHandler().name,
        class: context.getClass().name,
      });

      return true;
    } catch (error) {
      // Module not available in subscription
      this.logger.warn({
        message: 'Module access denied - subscription missing required module',
        userId: user.userId,
        organizationId: user.organizationId,
        requiredModule,
        availableModules: user.subscription.modules,
        subscriptionStatus: user.subscription.status,
        handler: context.getHandler().name,
        class: context.getClass().name,
      });

      // Re-throw ForbiddenException with user-friendly message
      throw new ForbiddenException(
        `Access denied: This feature requires the '${requiredModule}' module, which is not enabled in your subscription. Please contact your administrator to upgrade your subscription.`
      );
    }
  }
}
