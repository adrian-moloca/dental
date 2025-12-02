/**
 * Module requirement decorator for subscription-based feature access control
 * @module shared-auth/guards/requires-module-decorator
 */

import 'reflect-metadata';
import { ModuleCode } from '../jwt/jwt-payload.types';

/**
 * Metadata key for module requirements
 * Used by LicenseGuard implementation to retrieve required modules
 */
export const MODULE_METADATA_KEY = 'auth:required-module';

/**
 * Module requirement metadata
 * Stored by decorator and retrieved by guard
 */
export interface ModuleMetadata {
  /** Required module code from subscription */
  readonly moduleCode: ModuleCode;
}

/**
 * Decorator to require a specific subscription module for a route/method
 * This is a metadata-only decorator - actual enforcement is done by LicenseGuard
 *
 * @param moduleCode - Required module code from user's subscription
 * @returns Method decorator that can be applied to controllers or route handlers
 *
 * @remarks
 * This decorator is framework-agnostic and only sets metadata.
 * Guard implementations must read this metadata and validate against JWT subscription.modules.
 *
 * The decorator enforces subscription-based feature access:
 * - Core modules (SCHEDULING, PATIENT_MANAGEMENT, CLINICAL_BASIC, BILLING_BASIC)
 * - Premium modules (CLINICAL_ADVANCED, IMAGING, INVENTORY, MARKETING, etc.)
 *
 * If the user's subscription does not include the required module, the guard returns 403 Forbidden.
 *
 * Usage with NestJS:
 * ```typescript
 * @Controller('imaging')
 * export class ImagingController {
 *   @Post('/studies/:id/ai-analyze')
 *   @RequiresModule(ModuleCode.IMAGING)
 *   async requestAIAnalysis(@Param('id') id: string) {
 *     // Only users with IMAGING module can access
 *     // Guard validates JWT: payload.subscription.modules includes ModuleCode.IMAGING
 *   }
 *
 *   @Get('/studies')
 *   @RequiresModule(ModuleCode.CLINICAL_BASIC)
 *   async getStudies() {
 *     // Core module - most subscriptions include this
 *   }
 * }
 * ```
 *
 * Usage at controller level (applies to all routes):
 * ```typescript
 * @Controller('analytics')
 * @RequiresModule(ModuleCode.ANALYTICS_ADVANCED)
 * export class AnalyticsController {
 *   @Get('/reports')
 *   async getReports() {
 *     // Inherits module requirement from controller
 *   }
 * }
 * ```
 *
 * Usage with Express/framework-agnostic:
 * ```typescript
 * const metadata = Reflect.getMetadata(MODULE_METADATA_KEY, handler);
 * if (metadata && !user.subscription.modules.includes(metadata.moduleCode)) {
 *   throw new ForbiddenException('Module not available in subscription');
 * }
 * ```
 *
 * Integration with LicenseGuard:
 * ```typescript
 * @Injectable()
 * export class LicenseGuard implements CanActivate {
 *   canActivate(context: ExecutionContext): boolean {
 *     const handler = context.getHandler();
 *     const metadata = getModuleMetadata(handler);
 *     if (!metadata) return true; // No module requirement
 *
 *     const user = extractUser(context);
 *     const hasModule = user.subscription.modules.includes(metadata.moduleCode);
 *
 *     if (!hasModule) {
 *       throw new ForbiddenException(`Module ${metadata.moduleCode} not available`);
 *     }
 *     return true;
 *   }
 * }
 * ```
 */
export function RequiresModule(moduleCode: ModuleCode): MethodDecorator & ClassDecorator {
  return (
    target: any,
    _propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ): any => {
    const metadata: ModuleMetadata = {
      moduleCode,
    };

    // If descriptor is provided, it's a method decorator
    if (descriptor) {
      Reflect.defineMetadata(
        MODULE_METADATA_KEY,
        metadata,
        descriptor.value,
      );
      return descriptor;
    }

    // Otherwise, it's a class decorator
    Reflect.defineMetadata(MODULE_METADATA_KEY, metadata, target);
  };
}

/**
 * Gets module metadata from a method or class
 * Used by guard implementations to retrieve module requirements
 *
 * @param target - Target method, handler, or class
 * @returns Module metadata or undefined if not set
 *
 * @example
 * ```typescript
 * // In a NestJS guard
 * const handler = context.getHandler();
 * const metadata = getModuleMetadata(handler);
 *
 * if (metadata) {
 *   const userModules = user.subscription.modules;
 *   const hasAccess = userModules.includes(metadata.moduleCode);
 *   // ... enforce access control
 * }
 * ```
 */
export function getModuleMetadata(
  target: object | ((...args: unknown[]) => unknown),
): ModuleMetadata | undefined {
  return Reflect.getMetadata(MODULE_METADATA_KEY, target);
}
