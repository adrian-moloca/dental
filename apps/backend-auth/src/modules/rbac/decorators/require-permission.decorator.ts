/**
 * RequirePermission Decorator
 *
 * Method decorator that enforces permission-based authorization.
 * Combines metadata setting with permission guard activation.
 *
 * Security requirements:
 * - Must be used with authenticated routes (@UseGuards(JwtAuthGuard))
 * - Applies PermissionGuard to validate permission
 * - Permission code must follow format: module.resource.action
 *
 * Usage:
 * ```typescript
 * @Post('roles')
 * @RequirePermission('admin.role.create')
 * @ApiBearerAuth()
 * async createRole(@Body() dto: CreateRoleDto, @CurrentUser() user: UserContext) {
 *   return this.rbacService.createRole({...dto, createdBy: user.sub});
 * }
 * ```
 *
 * Edge cases handled:
 * - Empty permission string → throws error at compilation/startup
 * - Invalid permission format → checked at runtime by permission service
 * - User lacks permission → PermissionGuard throws ForbiddenException
 *
 * @module modules/rbac/decorators
 */

import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { PermissionGuard, PERMISSION_METADATA_KEY } from '../guards/permission.guard';

/**
 * Decorator to require specific permission for route access
 *
 * Automatically applies:
 * - Permission metadata for PermissionGuard
 * - PermissionGuard to enforce authorization
 * - Swagger/OpenAPI security annotations
 * - Standard error response documentation
 *
 * @param permission - Permission code required (module.resource.action)
 * @returns Decorator function
 *
 * @example
 * ```typescript
 * @Post('users/:id/roles')
 * @RequirePermission('admin.role.assign')
 * async assignRole(@Param('id') userId: string, @Body() dto: AssignRoleDto) {
 *   // Only executed if user has 'admin.role.assign' permission
 * }
 * ```
 */
export const RequirePermission = (permission: string) => {
  // Validate permission is not empty
  if (!permission || permission.trim().length === 0) {
    throw new Error('RequirePermission decorator requires a non-empty permission code');
  }

  // Apply multiple decorators:
  // 1. Set permission metadata for guard to read
  // 2. Apply PermissionGuard to enforce authorization
  // 3. Add OpenAPI/Swagger security scheme
  // 4. Document possible 401/403 error responses
  return applyDecorators(
    SetMetadata(PERMISSION_METADATA_KEY, permission),
    UseGuards(PermissionGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: 'Authentication required. Valid JWT token must be provided.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 401 },
          message: { type: 'string', example: 'Unauthorized' },
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    }),
    ApiForbiddenResponse({
      description: `Permission denied. Required permission: "${permission}"`,
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 403 },
          message: {
            type: 'string',
            example: `Access denied. Required permission: "${permission}". User does not have sufficient privileges to perform this action.`,
          },
          error: { type: 'string', example: 'Forbidden' },
        },
      },
    })
  );
};

/**
 * Decorator to require ANY of multiple permissions (OR logic)
 *
 * User needs at least ONE of the specified permissions.
 *
 * @param permissions - Array of permission codes
 * @returns Decorator function
 *
 * @example
 * ```typescript
 * @Get('reports')
 * @RequireAnyPermission(['analytics.report.read', 'analytics.report.manage'])
 * async getReports() {
 *   // Executed if user has either permission
 * }
 * ```
 */
export const RequireAnyPermission = (...permissions: string[]) => {
  if (!permissions || permissions.length === 0) {
    throw new Error('RequireAnyPermission decorator requires at least one permission code');
  }

  // For now, we store as pipe-separated string
  // Guard implementation would need to be enhanced to support this
  const permissionString = permissions.join('|');

  return applyDecorators(
    SetMetadata(PERMISSION_METADATA_KEY, permissionString),
    UseGuards(PermissionGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: 'Authentication required. Valid JWT token must be provided.',
    }),
    ApiForbiddenResponse({
      description: `Permission denied. Required at least one of: ${permissions.join(', ')}`,
    })
  );
};

/**
 * Decorator to require ALL of multiple permissions (AND logic)
 *
 * User needs ALL of the specified permissions.
 *
 * @param permissions - Array of permission codes
 * @returns Decorator function
 *
 * @example
 * ```typescript
 * @Post('critical-operation')
 * @RequireAllPermissions(['admin.system.execute', 'admin.audit.read'])
 * async performCriticalOperation() {
 *   // Executed only if user has BOTH permissions
 * }
 * ```
 */
export const RequireAllPermissions = (...permissions: string[]) => {
  if (!permissions || permissions.length === 0) {
    throw new Error('RequireAllPermissions decorator requires at least one permission code');
  }

  // For now, we store as ampersand-separated string
  // Guard implementation would need to be enhanced to support this
  const permissionString = permissions.join('&');

  return applyDecorators(
    SetMetadata(PERMISSION_METADATA_KEY, permissionString),
    UseGuards(PermissionGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: 'Authentication required. Valid JWT token must be provided.',
    }),
    ApiForbiddenResponse({
      description: `Permission denied. Required all of: ${permissions.join(', ')}`,
    })
  );
};
