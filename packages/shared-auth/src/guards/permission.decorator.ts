/**
 * Permission decorator for declarative authorization
 * @module shared-auth/guards/permission-decorator
 */

import 'reflect-metadata';
import { Permission } from '@dentalos/shared-types';

/**
 * Metadata key for permission requirements
 * Used by guard implementations to retrieve required permissions
 */
export const PERMISSION_METADATA_KEY = 'auth:permissions';

/**
 * Permission requirement metadata
 * Stored by decorator and retrieved by guard
 */
export interface PermissionMetadata {
  /** Required permissions (user must have ALL) */
  readonly permissions: readonly Permission[];

  /** Whether to require ALL permissions or ANY permission */
  readonly requireAll: boolean;
}

/**
 * Decorator to require specific permissions for a route/method
 * This is a metadata-only decorator - actual enforcement is done by guards
 *
 * @param permissions - Required permissions
 * @returns Method decorator
 *
 * @remarks
 * This decorator is framework-agnostic and only sets metadata.
 * Guard implementations must read this metadata and enforce permissions.
 *
 * Usage with NestJS:
 * ```typescript
 * @Controller('patients')
 * export class PatientController {
 *   @Get()
 *   @RequirePermissions({
 *     resource: ResourceType.PATIENT,
 *     action: PermissionAction.READ
 *   })
 *   async findAll() {
 *     // Only users with PATIENT:READ permission can access
 *   }
 * }
 * ```
 *
 * Usage with Express:
 * ```typescript
 * const metadata = Reflect.getMetadata(PERMISSION_METADATA_KEY, handler);
 * if (metadata) {
 *   // Enforce permissions in middleware
 * }
 * ```
 */
export function RequirePermissions(
  ...permissions: Permission[]
): MethodDecorator {
  return (
    _target: object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const metadata: PermissionMetadata = {
      permissions: Object.freeze([...permissions]),
      requireAll: true,
    };

    Reflect.defineMetadata(
      PERMISSION_METADATA_KEY,
      metadata,
      descriptor.value,
    );

    return descriptor;
  };
}

/**
 * Decorator to require ANY of the specified permissions
 * User only needs one of the listed permissions
 *
 * @param permissions - Acceptable permissions
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * @Get('reports')
 * @RequireAnyPermission(
 *   { resource: ResourceType.REPORT, action: PermissionAction.READ },
 *   { resource: ResourceType.REPORT, action: PermissionAction.EXPORT }
 * )
 * async getReports() {
 *   // Users with REPORT:READ OR REPORT:EXPORT can access
 * }
 * ```
 */
export function RequireAnyPermission(
  ...permissions: Permission[]
): MethodDecorator {
  return (
    _target: object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const metadata: PermissionMetadata = {
      permissions: Object.freeze([...permissions]),
      requireAll: false,
    };

    Reflect.defineMetadata(
      PERMISSION_METADATA_KEY,
      metadata,
      descriptor.value,
    );

    return descriptor;
  };
}

/**
 * Gets permission metadata from a method
 * Used by guard implementations to retrieve permission requirements
 *
 * @param target - Target method or handler
 * @returns Permission metadata or undefined if not set
 */
export function getPermissionMetadata(
  target: object,
): PermissionMetadata | undefined {
  return Reflect.getMetadata(PERMISSION_METADATA_KEY, target);
}
