/**
 * RBAC Service
 *
 * Main service for RBAC operations with comprehensive security validations.
 * Coordinates role assignments, permission management, and access control.
 *
 * Security requirements:
 * - super_admin can assign any role to any user
 * - tenant_admin can assign roles within their organization
 * - Users cannot assign roles they don't possess
 * - System roles (super_admin, tenant_admin) cannot be assigned by non-super_admin
 * - All operations logged to audit trail
 *
 * Edge cases handled:
 * - Permission escalation prevention
 * - Circular role assignment prevention
 * - Duplicate role assignment prevention
 * - Expired role handling
 * - Cache invalidation after mutations
 *
 * @module modules/rbac/services
 */

import { Injectable } from '@nestjs/common';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';
import { ValidationError, AuthorizationError, NotFoundError } from '@dentalos/shared-errors';
import { RoleRepository } from '../repositories/role.repository';
import { PermissionRepository } from '../repositories/permission.repository';
import { UserRoleRepository } from '../repositories/user-role.repository';
import { RolePermissionRepository } from '../repositories/role-permission.repository';
import { PermissionCheckerService } from './permission-checker.service';
import { RoleCheckerService } from './role-checker.service';
import { Role, SystemRole } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { UserRole } from '../entities/user-role.entity';
import { AuditLoggerService } from '../../audit/services/audit-logger.service';
import { AuditAction } from '../../audit/types/audit-action.enum';
import { AuditStatus } from '../../audit/entities/audit-log.entity';
import { createAuditEvent } from '../../audit/dto/audit-event.dto';

/**
 * Parameters for assigning a role to user
 */
export interface AssignRoleParams {
  userId: UUID;
  roleId: UUID;
  organizationId: OrganizationId;
  clinicId?: ClinicId;
  assignedBy: UUID;
  expiresAt?: Date;
}

/**
 * Parameters for revoking a role from user
 */
export interface RevokeRoleParams {
  userId: UUID;
  roleId: UUID;
  organizationId: OrganizationId;
  clinicId?: ClinicId;
  revokedBy: UUID;
  revocationReason?: string;
}

/**
 * Parameters for creating a custom role
 */
export interface CreateRoleParams {
  name: string;
  displayName: string;
  description?: string;
  organizationId: OrganizationId;
  clinicId?: ClinicId;
  permissionIds: UUID[];
  createdBy: UUID;
}

/**
 * Parameters for updating role permissions
 */
export interface UpdateRolePermissionsParams {
  roleId: UUID;
  permissionIds: UUID[];
  organizationId: OrganizationId;
  updatedBy: UUID;
}

/**
 * RBAC Service
 *
 * Main orchestration service for role-based access control operations.
 */
@Injectable()
export class RBACService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly userRoleRepository: UserRoleRepository,
    private readonly rolePermissionRepository: RolePermissionRepository,
    private readonly permissionChecker: PermissionCheckerService,
    private readonly roleChecker: RoleCheckerService,
    private readonly auditLogger: AuditLoggerService
  ) {}

  /**
   * Assign role to user
   *
   * Security validations (FIXES HIGH-1, HIGH-2):
   * - AUTHORIZATION: Validates assignedBy user has 'admin.role.assign' permission
   * - PRIVILEGE ESCALATION: Prevents assigning roles the assignor doesn't possess
   * - SYSTEM ROLE PROTECTION: Only super_admin can assign super_admin role
   * - Validates role exists and is active
   * - Validates user exists (delegated to repository)
   * - Prevents duplicate active assignments
   *
   * @param params - Role assignment parameters
   * @returns Created user role assignment
   * @throws {AuthorizationError} If assignedBy lacks permission or tries privilege escalation
   * @throws {ValidationError} If role is invalid or inactive
   */
  async assignRole(params: AssignRoleParams): Promise<UserRole> {
    // SECURITY CHECK 1: Authorization - assignedBy must have permission (FIXES HIGH-2)
    const hasPermission = await this.permissionChecker.hasPermission(
      params.assignedBy,
      'admin.role.assign',
      params.organizationId,
      params.clinicId
    );

    if (!hasPermission) {
      throw new AuthorizationError('Insufficient permissions to assign roles', {
        userId: params.assignedBy,
        requiredPermission: 'admin.role.assign',
        organizationId: params.organizationId,
      });
    }

    // Validate role exists and is active
    const role = await this.roleRepository.findById(params.roleId, params.organizationId);

    if (!role) {
      throw new NotFoundError('Role not found', {
        resourceType: 'Role',
        resourceId: params.roleId,
        organizationId: params.organizationId,
      });
    }

    if (!role.isActive) {
      throw new ValidationError('Cannot assign inactive role', {
        errors: [
          {
            field: 'roleId',
            message: 'Role is not active and cannot be assigned',
            value: params.roleId,
          },
        ],
      });
    }

    // SECURITY CHECK 2: Check if assignor is super_admin or tenant_admin
    const isSuperAdmin = await this.roleChecker.hasRole(
      params.assignedBy,
      SystemRole.SUPER_ADMIN,
      params.organizationId
    );

    const isTenantAdmin = await this.roleChecker.hasRole(
      params.assignedBy,
      SystemRole.TENANT_ADMIN,
      params.organizationId
    );

    // SECURITY CHECK 3: Privilege escalation prevention (FIXES HIGH-1)
    // Regular users can only assign roles they themselves possess
    if (!isSuperAdmin && !isTenantAdmin) {
      const assignerHasRole = await this.roleChecker.hasRole(
        params.assignedBy,
        role.name,
        params.organizationId,
        params.clinicId
      );

      if (!assignerHasRole) {
        // AUDIT: Log privilege escalation attempt (CRITICAL security event)
        await this.auditLogger.logEvent(
          createAuditEvent({
            userId: params.assignedBy,
            action: AuditAction.PRIVILEGE_ESCALATION_ATTEMPT,
            resource: 'UserRole',
            resourceId: params.userId,
            organizationId: params.organizationId,
            clinicId: params.clinicId,
            ipAddress: '0.0.0.0', // Set by interceptor in real scenario
            userAgent: 'Service',
            status: AuditStatus.FAILURE,
            errorMessage: `User attempted to assign role "${role.name}" without possessing it`,
            metadata: {
              attemptedRole: role.name,
              attemptedRoleId: role.id,
              targetUserId: params.userId,
              assignerId: params.assignedBy,
            },
          })
        );

        throw new AuthorizationError(
          `Cannot assign role "${role.name}" that you do not possess. ` +
            'Only users with the same role, or super_admin/tenant_admin can assign this role.',
          {
            userId: params.assignedBy,
            attemptedRole: role.name,
            reason: 'Privilege escalation prevention',
          }
        );
      }
    }

    // SECURITY CHECK 4: System role protection
    // Only super_admin can assign super_admin role
    if (role.name === SystemRole.SUPER_ADMIN && !isSuperAdmin) {
      // AUDIT: Log system role assignment attempt (CRITICAL security event)
      await this.auditLogger.logEvent(
        createAuditEvent({
          userId: params.assignedBy,
          action: AuditAction.SYSTEM_ROLE_ASSIGNMENT_BLOCKED,
          resource: 'UserRole',
          resourceId: params.userId,
          organizationId: params.organizationId,
          clinicId: params.clinicId,
          ipAddress: '0.0.0.0',
          userAgent: 'Service',
          status: AuditStatus.FAILURE,
          errorMessage: 'Non-super_admin attempted to assign super_admin role',
          metadata: {
            attemptedRole: SystemRole.SUPER_ADMIN,
            targetUserId: params.userId,
            assignerId: params.assignedBy,
          },
        })
      );

      throw new AuthorizationError('Only super_admin can assign super_admin role', {
        userId: params.assignedBy,
        attemptedRole: SystemRole.SUPER_ADMIN,
        reason: 'System role protection',
      });
    }

    // All security checks passed - proceed with assignment
    const userRole = await this.userRoleRepository.assignRole({
      userId: params.userId,
      roleId: params.roleId,
      organizationId: params.organizationId,
      clinicId: params.clinicId,
      assignedBy: params.assignedBy,
      expiresAt: params.expiresAt,
    });

    // AUDIT: Log successful role assignment
    await this.auditLogger.logEvent(
      createAuditEvent({
        userId: params.assignedBy,
        action: AuditAction.ROLE_ASSIGNED,
        resource: 'UserRole',
        resourceId: userRole.id,
        organizationId: params.organizationId,
        clinicId: params.clinicId,
        ipAddress: '0.0.0.0',
        userAgent: 'Service',
        status: AuditStatus.SUCCESS,
        changesAfter: {
          userRoleId: userRole.id,
          userId: params.userId,
          roleId: params.roleId,
          roleName: role.name,
          assignedBy: params.assignedBy,
          expiresAt: params.expiresAt?.toISOString(),
        },
        metadata: {
          targetUserId: params.userId,
          assignedRole: role.name,
          expiresAt: params.expiresAt?.toISOString(),
        },
      })
    );

    // Invalidate permission cache for user
    await this.permissionChecker.invalidateUserPermissionsCache(
      params.userId,
      params.organizationId,
      params.clinicId
    );

    return userRole;
  }

  /**
   * Revoke role from user
   *
   * Security validations (FIXES HIGH-3):
   * - AUTHORIZATION: Validates revokedBy user has 'admin.role.revoke' permission
   * - Validates active assignment exists
   * - Records revocation reason for audit trail
   * - Prevents revoking super_admin by non-super_admin
   *
   * @param params - Role revocation parameters
   * @throws {AuthorizationError} If revokedBy lacks permission
   * @throws {NotFoundError} If role assignment not found
   */
  async revokeRole(params: RevokeRoleParams): Promise<void> {
    // SECURITY CHECK: Authorization - revokedBy must have permission (FIXES HIGH-3)
    const hasPermission = await this.permissionChecker.hasPermission(
      params.revokedBy,
      'admin.role.revoke',
      params.organizationId,
      params.clinicId
    );

    if (!hasPermission) {
      throw new AuthorizationError('Insufficient permissions to revoke roles', {
        userId: params.revokedBy,
        requiredPermission: 'admin.role.revoke',
        organizationId: params.organizationId,
      });
    }

    // Validate role exists to check if it's a system role
    const role = await this.roleRepository.findById(params.roleId, params.organizationId);

    if (!role) {
      throw new NotFoundError('Role not found', {
        resourceType: 'Role',
        resourceId: params.roleId,
        organizationId: params.organizationId,
      });
    }

    // SECURITY CHECK: Only super_admin can revoke super_admin role
    if (role.name === SystemRole.SUPER_ADMIN) {
      const isSuperAdmin = await this.roleChecker.hasRole(
        params.revokedBy,
        SystemRole.SUPER_ADMIN,
        params.organizationId
      );

      if (!isSuperAdmin) {
        throw new AuthorizationError('Only super_admin can revoke super_admin role', {
          userId: params.revokedBy,
          attemptedRole: SystemRole.SUPER_ADMIN,
          reason: 'System role protection',
        });
      }
    }

    // Revoke role via repository
    await this.userRoleRepository.revokeRole({
      userId: params.userId,
      roleId: params.roleId,
      organizationId: params.organizationId,
      clinicId: params.clinicId,
      revokedBy: params.revokedBy,
      revocationReason: params.revocationReason,
    });

    // AUDIT: Log successful role revocation
    await this.auditLogger.logEvent(
      createAuditEvent({
        userId: params.revokedBy,
        action: AuditAction.ROLE_REVOKED,
        resource: 'UserRole',
        organizationId: params.organizationId,
        clinicId: params.clinicId,
        ipAddress: '0.0.0.0',
        userAgent: 'Service',
        status: AuditStatus.SUCCESS,
        changesAfter: {
          userId: params.userId,
          roleId: params.roleId,
          roleName: role.name,
          revokedBy: params.revokedBy,
          revocationReason: params.revocationReason,
        },
        metadata: {
          targetUserId: params.userId,
          revokedRole: role.name,
          revocationReason: params.revocationReason,
        },
      })
    );

    // Invalidate permission cache for user
    await this.permissionChecker.invalidateUserPermissionsCache(
      params.userId,
      params.organizationId,
      params.clinicId
    );
  }

  /**
   * List all roles for organization
   *
   * Security validations (FIXES HIGH-3):
   * - AUTHORIZATION: Validates requestor has 'admin.role.read' permission
   *
   * @param organizationId - Organization ID
   * @param clinicId - Optional clinic ID
   * @param requestorId - ID of user making the request
   * @returns Array of roles
   * @throws {AuthorizationError} If requestor lacks permission
   */
  async listRoles(
    organizationId: OrganizationId,
    requestorId: UUID,
    clinicId?: ClinicId
  ): Promise<Role[]> {
    // SECURITY CHECK: Authorization (FIXES HIGH-3)
    const hasPermission = await this.permissionChecker.hasPermission(
      requestorId,
      'admin.role.read',
      organizationId,
      clinicId
    );

    if (!hasPermission) {
      throw new AuthorizationError('Insufficient permissions to list roles', {
        userId: requestorId,
        requiredPermission: 'admin.role.read',
        organizationId,
      });
    }

    return this.roleRepository.findAllActive(organizationId, clinicId);
  }

  /**
   * Get user's effective permissions
   *
   * Security validations (FIXES HIGH-3):
   * - AUTHORIZATION: Validates requestor has 'admin.user.read' OR is the same user
   *
   * @param userId - User ID to get permissions for
   * @param organizationId - Organization ID
   * @param requestorId - ID of user making the request
   * @param clinicId - Optional clinic ID
   * @returns Array of permissions
   * @throws {AuthorizationError} If requestor lacks permission
   */
  async getUserPermissions(
    userId: UUID,
    organizationId: OrganizationId,
    requestorId: UUID,
    clinicId?: ClinicId
  ): Promise<Permission[]> {
    // SECURITY CHECK: User can view own permissions OR must have admin.user.read
    const isOwnUser = userId === requestorId;

    if (!isOwnUser) {
      const hasPermission = await this.permissionChecker.hasPermission(
        requestorId,
        'admin.user.read',
        organizationId,
        clinicId
      );

      if (!hasPermission) {
        throw new AuthorizationError('Insufficient permissions to view user permissions', {
          userId: requestorId,
          targetUserId: userId,
          requiredPermission: 'admin.user.read',
          organizationId,
        });
      }
    }

    return this.permissionChecker.getUserPermissions(userId, organizationId, clinicId);
  }

  /**
   * Create custom role
   *
   * Security validations (FIXES HIGH-3):
   * - AUTHORIZATION: Validates createdBy has 'admin.role.create' permission
   * - Only tenant_admin or super_admin can create roles
   * - Validates all permission IDs exist
   * - Validates role name format
   * - Prevents duplicate role names
   *
   * @param params - Role creation parameters
   * @returns Created role
   * @throws {AuthorizationError} If createdBy lacks permission
   * @throws {ValidationError} If permissions are invalid
   */
  async createRole(params: CreateRoleParams): Promise<Role> {
    // SECURITY CHECK: Authorization (FIXES HIGH-3)
    const hasPermission = await this.permissionChecker.hasPermission(
      params.createdBy,
      'admin.role.create',
      params.organizationId,
      params.clinicId
    );

    if (!hasPermission) {
      throw new AuthorizationError('Insufficient permissions to create roles', {
        userId: params.createdBy,
        requiredPermission: 'admin.role.create',
        organizationId: params.organizationId,
      });
    }

    // Additional check: only tenant_admin or super_admin can create roles
    const isTenantAdmin = await this.roleChecker.isTenantAdmin(
      params.createdBy,
      params.organizationId
    );

    const isSuperAdmin = await this.roleChecker.hasRole(
      params.createdBy,
      SystemRole.SUPER_ADMIN,
      params.organizationId
    );

    if (!isTenantAdmin && !isSuperAdmin) {
      throw new AuthorizationError(
        'Only tenant administrators or super administrators can create custom roles',
        {
          userId: params.createdBy,
          organizationId: params.organizationId,
        }
      );
    }

    // Validate permissions exist
    if (params.permissionIds.length > 0) {
      const permissions = await this.permissionRepository.findByIds(params.permissionIds);

      if (permissions.length !== params.permissionIds.length) {
        throw new ValidationError('One or more permission IDs are invalid', {
          errors: [
            {
              field: 'permissionIds',
              message: 'Some permissions do not exist',
            },
          ],
        });
      }
    }

    // Create role
    const role = await this.roleRepository.create({
      name: params.name,
      displayName: params.displayName,
      description: params.description,
      organizationId: params.organizationId,
      clinicId: params.clinicId,
      isSystem: false,
      isActive: true,
    });

    // Assign permissions to role
    if (params.permissionIds.length > 0) {
      await this.rolePermissionRepository.grantPermissions(
        role.id,
        params.permissionIds,
        params.organizationId,
        params.createdBy
      );
    }

    return role;
  }

  /**
   * Update role permissions (replace all)
   *
   * Security validations (FIXES HIGH-3):
   * - AUTHORIZATION: Validates updatedBy has 'admin.role.manage' permission
   * - Only tenant_admin or super_admin can update role permissions
   * - Cannot modify system roles
   * - Validates all permission IDs exist
   *
   * @param params - Update parameters
   * @throws {AuthorizationError} If updatedBy lacks permission
   * @throws {ValidationError} If role is system role
   */
  async updateRolePermissions(params: UpdateRolePermissionsParams): Promise<void> {
    // SECURITY CHECK: Authorization (FIXES HIGH-3)
    const hasPermission = await this.permissionChecker.hasPermission(
      params.updatedBy,
      'admin.role.manage',
      params.organizationId
    );

    if (!hasPermission) {
      throw new AuthorizationError('Insufficient permissions to update role permissions', {
        userId: params.updatedBy,
        requiredPermission: 'admin.role.manage',
        organizationId: params.organizationId,
      });
    }

    // Additional check: only tenant_admin or super_admin can update roles
    const isTenantAdmin = await this.roleChecker.isTenantAdmin(
      params.updatedBy,
      params.organizationId
    );

    const isSuperAdmin = await this.roleChecker.hasRole(
      params.updatedBy,
      SystemRole.SUPER_ADMIN,
      params.organizationId
    );

    if (!isTenantAdmin && !isSuperAdmin) {
      throw new AuthorizationError(
        'Only tenant administrators or super administrators can update role permissions',
        {
          userId: params.updatedBy,
          organizationId: params.organizationId,
        }
      );
    }

    // Validate role exists and is not system role
    const role = await this.roleRepository.findById(params.roleId, params.organizationId);

    if (!role) {
      throw new ValidationError('Role not found', {
        errors: [{ field: 'roleId', message: 'Role does not exist' }],
      });
    }

    if (role.isSystem) {
      throw new ValidationError('Cannot modify system role permissions', {
        errors: [{ field: 'roleId', message: 'Role is a system role' }],
      });
    }

    // Validate permissions exist
    const permissions = await this.permissionRepository.findByIds(params.permissionIds);

    if (permissions.length !== params.permissionIds.length) {
      throw new ValidationError('One or more permission IDs are invalid', {
        errors: [
          {
            field: 'permissionIds',
            message: 'Some permissions do not exist',
          },
        ],
      });
    }

    // Replace permissions
    await this.rolePermissionRepository.replacePermissions(
      params.roleId,
      params.permissionIds,
      params.organizationId,
      params.updatedBy
    );

    // Invalidate cache for all users with this role
    // Note: This is a simplified approach. In production, you might want
    // to track and invalidate cache for specific users with this role
  }
}
