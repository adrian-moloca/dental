/**
 * Role decorator for declarative authorization
 * @module shared-auth/guards/role-decorator
 */

import 'reflect-metadata';
import { UserRole } from '@dentalos/shared-types';

/**
 * Metadata key for role requirements
 * Used by guard implementations to retrieve required roles
 */
export const ROLE_METADATA_KEY = 'auth:roles';

/**
 * Role requirement metadata
 * Stored by decorator and retrieved by guard
 */
export interface RoleMetadata {
  /** Required roles */
  readonly roles: readonly UserRole[];

  /** Whether to require ALL roles or ANY role */
  readonly requireAll: boolean;
}

/**
 * Decorator to require specific roles for a route/method
 * This is a metadata-only decorator - actual enforcement is done by guards
 *
 * @param roles - Required roles
 * @returns Method decorator
 *
 * @remarks
 * This decorator is framework-agnostic and only sets metadata.
 * Guard implementations must read this metadata and enforce roles.
 *
 * Usage with NestJS:
 * ```typescript
 * @Controller('admin')
 * export class AdminController {
 *   @Get('settings')
 *   @RequireRoles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN)
 *   async getSettings() {
 *     // Only super admins and org admins can access
 *   }
 * }
 * ```
 *
 * Usage with Express:
 * ```typescript
 * const metadata = Reflect.getMetadata(ROLE_METADATA_KEY, handler);
 * if (metadata) {
 *   // Enforce roles in middleware
 * }
 * ```
 */
export function RequireRoles(...roles: UserRole[]): MethodDecorator {
  return (
    _target: object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const metadata: RoleMetadata = {
      roles: Object.freeze([...roles]),
      requireAll: false, // By default, ANY role is sufficient
    };

    Reflect.defineMetadata(ROLE_METADATA_KEY, metadata, descriptor.value);

    return descriptor;
  };
}

/**
 * Decorator to require ALL of the specified roles
 * User must have every listed role
 *
 * @param roles - Required roles (all must be present)
 * @returns Method decorator
 *
 * @remarks
 * This is rarely needed since most users have a single primary role.
 * Use RequireRoles (ANY) for most cases.
 *
 * @example
 * ```typescript
 * @Post('special-action')
 * @RequireAllRoles(UserRole.DENTIST, UserRole.CLINIC_ADMIN)
 * async specialAction() {
 *   // User must be BOTH dentist AND clinic admin
 * }
 * ```
 */
export function RequireAllRoles(...roles: UserRole[]): MethodDecorator {
  return (
    _target: object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const metadata: RoleMetadata = {
      roles: Object.freeze([...roles]),
      requireAll: true,
    };

    Reflect.defineMetadata(ROLE_METADATA_KEY, metadata, descriptor.value);

    return descriptor;
  };
}

/**
 * Gets role metadata from a method
 * Used by guard implementations to retrieve role requirements
 *
 * @param target - Target method or handler
 * @returns Role metadata or undefined if not set
 */
export function getRoleMetadata(target: object): RoleMetadata | undefined {
  return Reflect.getMetadata(ROLE_METADATA_KEY, target);
}
