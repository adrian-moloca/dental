/**
 * Role Entity
 *
 * Represents a role in the RBAC system with multi-tenant isolation.
 * Roles can be organization-wide or clinic-specific.
 *
 * Security requirements:
 * - System roles (super_admin, tenant_admin) are immutable
 * - All queries MUST filter by organizationId for tenant isolation
 * - Unique role names within (organizationId, clinicId) scope
 * - Custom roles can only be created by tenant_admin
 *
 * Edge cases handled:
 * - System roles cannot be modified or deleted
 * - Clinic-specific roles (clinicId set)
 * - Organization-wide roles (clinicId null)
 * - Soft delete via isActive flag
 * - Role name format validation (lowercase, underscores only)
 * - Display name for UI presentation
 *
 * @module modules/rbac/entities
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import type { OrganizationId, ClinicId, UUID } from '@dentalos/shared-types';

/**
 * System role names that cannot be modified or deleted
 */
export enum SystemRole {
  /** Super admin with full system access across all organizations */
  SUPER_ADMIN = 'super_admin',
  /** Tenant admin with full access within their organization */
  TENANT_ADMIN = 'tenant_admin',
}

/**
 * Role entity with multi-tenant isolation
 *
 * Database indexes:
 * - Primary key on id (UUID)
 * - Unique index on (name, organizationId, clinicId) - prevents duplicate roles
 * - Index on organizationId for tenant-scoped queries
 * - Index on clinicId for clinic-scoped queries
 * - Index on isActive for filtering active roles
 * - Index on isSystem for system role queries
 *
 * Constraints:
 * - name must match pattern: ^[a-z_]+$ (lowercase, underscores only)
 * - System roles have isSystem = true and cannot be modified
 * - Soft delete via isActive = false
 */
@Entity('roles')
@Index(['name', 'organizationId', 'clinicId'], { unique: true })
@Index(['organizationId'])
@Index(['clinicId'])
@Index(['isActive'])
@Index(['isSystem'])
export class Role {
  /**
   * Unique role identifier (UUID v4)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: UUID;

  /**
   * Role name (lowercase, underscores only)
   * Examples: "doctor", "receptionist", "clinic_admin"
   * CRITICAL: Must be unique within (organizationId, clinicId) scope
   */
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  /**
   * Human-readable display name for UI
   * Examples: "Doctor (Full Access)", "Receptionist"
   */
  @Column({ type: 'varchar', length: 255, name: 'display_name' })
  displayName!: string;

  /**
   * Detailed description of role's purpose and permissions
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * Organization to which this role belongs
   * CRITICAL: Always include in WHERE clauses for tenant isolation
   */
  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId!: OrganizationId;

  /**
   * Optional clinic scope for clinic-specific roles
   * NULL means role is organization-wide
   */
  @Column({ type: 'uuid', name: 'clinic_id', nullable: true })
  clinicId?: ClinicId;

  /**
   * Whether this is a system-defined role
   * System roles (super_admin, tenant_admin) cannot be modified or deleted
   */
  @Column({ type: 'boolean', name: 'is_system', default: false })
  isSystem!: boolean;

  /**
   * Whether this role is active
   * Inactive roles cannot be assigned to users
   * Used for soft delete of custom roles
   */
  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  /**
   * Timestamp when role was created
   * Automatically set by TypeORM
   */
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  /**
   * Timestamp when role was last updated
   * Automatically updated by TypeORM on save
   */
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  /**
   * Soft delete timestamp
   * NULL means role is not deleted
   * Used for audit trail preservation
   */
  @Column({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  /**
   * Validates role name format
   * Must be lowercase with underscores only
   *
   * @returns true if name is valid
   */
  isValidName(): boolean {
    const namePattern = /^[a-z_]+$/;
    return namePattern.test(this.name);
  }

  /**
   * Checks if this is a system role
   *
   * @returns true if role is a system role
   */
  isSystemRole(): boolean {
    return this.isSystem || Object.values(SystemRole).includes(this.name as SystemRole);
  }

  /**
   * Checks if role is organization-wide (not clinic-specific)
   *
   * @returns true if role applies to entire organization
   */
  isOrganizationWide(): boolean {
    return this.clinicId === null || this.clinicId === undefined;
  }

  /**
   * Checks if role is clinic-specific
   *
   * @returns true if role is scoped to a specific clinic
   */
  isClinicSpecific(): boolean {
    return !this.isOrganizationWide();
  }

  /**
   * Checks if role can be modified
   * System roles and deleted roles cannot be modified
   *
   * @returns true if role can be modified
   */
  canBeModified(): boolean {
    return !this.isSystem && !this.deletedAt;
  }

  /**
   * Checks if role can be deleted
   * System roles cannot be deleted
   *
   * @returns true if role can be deleted
   */
  canBeDeleted(): boolean {
    return !this.isSystem;
  }

  /**
   * Custom JSON serialization
   * Ensures consistent output format
   *
   * @returns Serialized role object
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      displayName: this.displayName,
      description: this.description,
      organizationId: this.organizationId,
      clinicId: this.clinicId,
      isSystem: this.isSystem,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}
