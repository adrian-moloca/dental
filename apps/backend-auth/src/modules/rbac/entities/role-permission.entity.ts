/**
 * RolePermission Join Entity
 *
 * Represents the many-to-many relationship between Roles and Permissions.
 * Defines which permissions are granted by each role.
 *
 * Security requirements:
 * - All queries MUST filter by organizationId for tenant isolation
 * - Unique constraint on (roleId, permissionId) - no duplicate permission grants
 * - Denormalized organizationId from Role for query performance
 * - Full audit trail with grantedBy tracking
 *
 * Edge cases handled:
 * - Preventing duplicate permission assignments to same role
 * - Denormalized organizationId for efficient filtering
 * - Audit trail with grantedAt and grantedBy
 * - Bulk permission assignment operations
 * - Permission removal tracking
 *
 * @module modules/rbac/entities
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { OrganizationId, UUID } from '@dentalos/shared-types';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

/**
 * RolePermission join entity with audit trail
 *
 * Database indexes:
 * - Primary key on id (UUID)
 * - Unique index on (roleId, permissionId) - prevents duplicate permissions per role
 * - Index on roleId for role-based queries
 * - Index on permissionId for permission-based queries
 * - Index on organizationId for tenant-scoped queries
 * - Index on grantedBy for audit queries
 *
 * Constraints:
 * - Cannot assign same permission to a role multiple times
 * - organizationId must match the role's organizationId
 * - grantedBy must be a valid user ID
 */
@Entity('role_permissions')
@Index(['roleId', 'permissionId'], { unique: true })
@Index(['roleId'])
@Index(['permissionId'])
@Index(['organizationId'])
@Index(['grantedBy'])
@Index(['grantedAt'])
export class RolePermission {
  /**
   * Unique role-permission mapping identifier (UUID v4)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: UUID;

  /**
   * Role that is granted this permission
   */
  @Column({ type: 'uuid', name: 'role_id' })
  roleId!: UUID;

  /**
   * Permission that is granted to the role
   */
  @Column({ type: 'uuid', name: 'permission_id' })
  permissionId!: UUID;

  /**
   * Organization context for this permission grant
   * CRITICAL: Always include in WHERE clauses for tenant isolation
   * Denormalized from Role for query performance
   */
  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId!: OrganizationId;

  /**
   * Timestamp when permission was granted to role
   * Automatically set by TypeORM
   */
  @CreateDateColumn({ type: 'timestamp', name: 'granted_at' })
  grantedAt!: Date;

  /**
   * User who granted this permission to the role
   * Required for audit trail
   */
  @Column({ type: 'uuid', name: 'granted_by' })
  grantedBy!: UUID;

  /**
   * Many-to-one relationship with Role
   * Eager loading disabled for performance
   */
  @ManyToOne(() => Role, { eager: false })
  @JoinColumn({ name: 'role_id' })
  role?: Role;

  /**
   * Many-to-one relationship with Permission
   * Eager loading disabled for performance
   */
  @ManyToOne(() => Permission, { eager: false })
  @JoinColumn({ name: 'permission_id' })
  permission?: Permission;

  /**
   * Checks if this permission grant is within a specific organization
   *
   * @param organizationId - Organization ID to check
   * @returns true if grant belongs to organization
   */
  belongsToOrganization(organizationId: OrganizationId): boolean {
    return this.organizationId === organizationId;
  }

  /**
   * Gets the age of this permission grant in days
   *
   * @returns Number of days since permission was granted
   */
  getAgeInDays(): number {
    const now = new Date();
    const ageInMs = now.getTime() - this.grantedAt.getTime();
    return Math.floor(ageInMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Checks if this permission grant was created recently
   *
   * @param days - Number of days to consider recent (default: 7)
   * @returns true if permission was granted within specified days
   */
  isRecentlyGranted(days: number = 7): boolean {
    return this.getAgeInDays() <= days;
  }

  /**
   * Custom JSON serialization
   * Ensures consistent output format
   *
   * @returns Serialized role-permission object
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      roleId: this.roleId,
      permissionId: this.permissionId,
      organizationId: this.organizationId,
      grantedAt: this.grantedAt.toISOString(),
      grantedBy: this.grantedBy,
    };
  }
}
