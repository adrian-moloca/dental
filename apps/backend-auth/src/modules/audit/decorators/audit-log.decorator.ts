/**
 * AuditLog Decorator
 *
 * Method decorator for automatically logging controller actions to audit trail.
 * Works in conjunction with AuditLogInterceptor to capture request/response metadata.
 *
 * USAGE:
 * ```typescript
 * @Post('users/:id/roles')
 * @AuditLog(AuditAction.ROLE_ASSIGNED)
 * @RequirePermission('admin.role.assign')
 * async assignRole(@Param('id') userId: UUID, @Body() dto: AssignRoleDto) {
 *   return this.rbacService.assignRole({ ...dto, userId });
 * }
 * ```
 *
 * BEHAVIOR:
 * - Sets metadata key 'auditAction' on method
 * - AuditLogInterceptor reads this metadata to determine if logging is needed
 * - Automatically captures: actor, action, resource, result, timing, context
 * - Logs both successful and failed operations
 *
 * SECURITY DESIGN:
 * - Declarative audit trail configuration (reduces human error)
 * - Type-safe action enumeration (prevents typos)
 * - Automatic correlation ID propagation
 * - No manual logging code required in controllers (DRY principle)
 *
 * @module modules/audit/decorators
 */

import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '../types/audit-action.enum';

/**
 * Metadata key for audit action
 *
 * Used by AuditLogInterceptor to determine if method should be audited
 * @internal
 */
export const AUDIT_ACTION_KEY = 'auditAction';

/**
 * AuditLog method decorator
 *
 * Marks a controller method for automatic audit logging.
 * Must be used in combination with AuditLogInterceptor (registered globally).
 *
 * @param action - Audit action type from AuditAction enum
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * // Role assignment endpoint
 * @Post('users/:id/roles')
 * @AuditLog(AuditAction.ROLE_ASSIGNED)
 * async assignRole() { ... }
 *
 * // Role revocation endpoint
 * @Delete('users/:id/roles/:roleId')
 * @AuditLog(AuditAction.ROLE_REVOKED)
 * async revokeRole() { ... }
 *
 * // Role creation endpoint
 * @Post('roles')
 * @AuditLog(AuditAction.ROLE_CREATED)
 * async createRole() { ... }
 * ```
 *
 * @security
 * - Only use for endpoints that modify security-relevant state
 * - Do NOT use for read-only operations (high volume, low security value)
 * - Always pair with authorization decorators (@RequirePermission, @RequireRole)
 */
export const AuditLog = (action: AuditAction) => SetMetadata(AUDIT_ACTION_KEY, action);

/**
 * Metadata key for resource name override
 *
 * Allows controller methods to specify custom resource name
 * If not set, resource name is inferred from controller class name
 *
 * @internal
 */
export const AUDIT_RESOURCE_KEY = 'auditResource';

/**
 * AuditResource decorator (optional)
 *
 * Override automatic resource name detection with custom value.
 * Useful when controller handles multiple resource types.
 *
 * @param resource - Resource name
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * @Post('users/:id/roles')
 * @AuditLog(AuditAction.ROLE_ASSIGNED)
 * @AuditResource('UserRole')  // Override default 'User'
 * async assignRole() { ... }
 * ```
 */
export const AuditResource = (resource: string) => SetMetadata(AUDIT_RESOURCE_KEY, resource);

/**
 * Metadata key for capturing state changes
 *
 * Controls whether changesBefore/changesAfter should be captured
 * Default: true for mutation operations, false for read operations
 *
 * @internal
 */
export const AUDIT_CAPTURE_STATE_KEY = 'auditCaptureState';

/**
 * AuditCaptureState decorator (optional)
 *
 * Controls whether before/after state should be captured in audit log.
 * State capture adds overhead, so disable for high-frequency operations.
 *
 * @param capture - Whether to capture state changes
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * @Post('users/:id/roles')
 * @AuditLog(AuditAction.ROLE_ASSIGNED)
 * @AuditCaptureState(true)  // Capture before/after state
 * async assignRole() { ... }
 *
 * @Get('audit/logs')
 * @AuditLog(AuditAction.ACCESS_GRANTED)
 * @AuditCaptureState(false)  // Don't capture state (read operation)
 * async queryLogs() { ... }
 * ```
 */
export const AuditCaptureState = (capture: boolean) =>
  SetMetadata(AUDIT_CAPTURE_STATE_KEY, capture);
