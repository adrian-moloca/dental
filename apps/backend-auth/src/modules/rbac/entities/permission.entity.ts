/**
 * Permission Entity
 *
 * Represents a canonical permission definition in the system.
 * Permissions are NOT tenant-scoped - they form a global catalog
 * that all organizations reference.
 *
 * Security requirements:
 * - Permissions are immutable (defined by system, not by tenants)
 * - Unique permission codes following hierarchical naming
 * - Code format: module.resource.action
 * - Permissions are linked to roles via RolePermission join table
 *
 * Edge cases handled:
 * - Permission code format validation
 * - Inactive permissions (soft delete)
 * - Module/resource/action parsing from code
 * - Display names for UI presentation
 * - Missing or invalid action types
 *
 * @module modules/rbac/entities
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import type { UUID } from '@dentalos/shared-types';

/**
 * Valid permission actions
 * Standardized CRUD operations plus special actions
 */
export enum PermissionAction {
  /** Create new resource */
  CREATE = 'create',
  /** Read/view resource */
  READ = 'read',
  /** Update existing resource */
  UPDATE = 'update',
  /** Delete resource */
  DELETE = 'delete',
  /** List/query multiple resources */
  LIST = 'list',
  /** Full management access (all CRUD) */
  MANAGE = 'manage',
  /** Export resource data */
  EXPORT = 'export',
  /** Import resource data */
  IMPORT = 'import',
  /** Execute special operations */
  EXECUTE = 'execute',
}

/**
 * Permission entity (global catalog)
 *
 * Database indexes:
 * - Primary key on id (UUID)
 * - Unique index on code - ensures no duplicate permission codes
 * - Index on module for module-based queries
 * - Index on resource for resource-based queries
 * - Index on isActive for filtering active permissions
 *
 * Constraints:
 * - code must match pattern: ^[a-z]+\.[a-z]+\.(create|read|update|delete|list|manage|export|import|execute)$
 * - code is globally unique
 * - Permissions are NOT tenant-scoped
 */
@Entity('permissions')
@Index(['code'], { unique: true })
@Index(['module'])
@Index(['resource'])
@Index(['isActive'])
export class Permission {
  /**
   * Unique permission identifier (UUID v4)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: UUID;

  /**
   * Hierarchical permission code
   * Format: module.resource.action
   * Examples: "scheduling.appointment.create", "clinical.diagnosis.read"
   * CRITICAL: Must be globally unique
   */
  @Column({ type: 'varchar', length: 255, unique: true })
  code!: string;

  /**
   * Human-readable display name for UI
   * Examples: "Create Appointments", "Read Patient Records"
   */
  @Column({ type: 'varchar', length: 255, name: 'display_name' })
  displayName!: string;

  /**
   * Detailed description of what this permission allows
   * Used for documentation and admin interfaces
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * Module name (extracted from code)
   * Examples: "scheduling", "clinical", "billing"
   */
  @Column({ type: 'varchar', length: 100 })
  module!: string;

  /**
   * Resource name (extracted from code)
   * Examples: "appointment", "patient", "invoice"
   */
  @Column({ type: 'varchar', length: 100 })
  resource!: string;

  /**
   * Action type (extracted from code)
   * Examples: "create", "read", "update", "delete", "manage"
   */
  @Column({ type: 'varchar', length: 50 })
  action!: string;

  /**
   * Whether this permission is active
   * Inactive permissions cannot be assigned to roles
   * Used for deprecating old permissions
   */
  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  /**
   * Timestamp when permission was created
   * Automatically set by TypeORM
   */
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  /**
   * Validates permission code format
   * Must follow pattern: module.resource.action
   * All parts must be lowercase letters only
   *
   * @returns true if code is valid
   */
  isValidCode(): boolean {
    const codePattern =
      /^[a-z]+\.[a-z]+\.(create|read|update|delete|list|manage|export|import|execute)$/;
    return codePattern.test(this.code);
  }

  /**
   * Parses permission code into components
   * Returns null if code is invalid
   *
   * @returns Object with module, resource, action or null if invalid
   */
  parseCode(): { module: string; resource: string; action: string } | null {
    if (!this.isValidCode()) {
      return null;
    }

    const parts = this.code.split('.');
    if (parts.length !== 3) {
      return null;
    }

    return {
      module: parts[0],
      resource: parts[1],
      action: parts[2],
    };
  }

  /**
   * Checks if this permission grants a specific action
   *
   * @param action - Action to check
   * @returns true if permission grants the action
   */
  grantsAction(action: PermissionAction | string): boolean {
    // 'manage' action grants all CRUD operations
    if (this.action === PermissionAction.MANAGE) {
      return [
        PermissionAction.CREATE,
        PermissionAction.READ,
        PermissionAction.UPDATE,
        PermissionAction.DELETE,
        PermissionAction.LIST,
      ].includes(action as PermissionAction);
    }

    return this.action === action;
  }

  /**
   * Checks if this permission applies to a specific module
   *
   * @param module - Module name to check
   * @returns true if permission applies to module
   */
  appliesToModule(module: string): boolean {
    return this.module === module;
  }

  /**
   * Checks if this permission applies to a specific resource
   *
   * @param resource - Resource name to check
   * @returns true if permission applies to resource
   */
  appliesToResource(resource: string): boolean {
    return this.resource === resource;
  }

  /**
   * Checks if this is a management permission (grants all CRUD)
   *
   * @returns true if permission is a manage permission
   */
  isManagementPermission(): boolean {
    return this.action === PermissionAction.MANAGE;
  }

  /**
   * Custom JSON serialization
   * Ensures consistent output format
   *
   * @returns Serialized permission object
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      code: this.code,
      displayName: this.displayName,
      description: this.description,
      module: this.module,
      resource: this.resource,
      action: this.action,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
    };
  }

  /**
   * Creates a permission code from components
   * Static helper for constructing permission codes
   *
   * @param module - Module name
   * @param resource - Resource name
   * @param action - Action type
   * @returns Permission code string
   */
  static buildCode(module: string, resource: string, action: PermissionAction | string): string {
    return `${module.toLowerCase()}.${resource.toLowerCase()}.${action.toLowerCase()}`;
  }

  /**
   * Validates if a string is a valid permission code
   * Static helper for validation
   *
   * @param code - Code to validate
   * @returns true if code is valid
   */
  static isValidPermissionCode(code: string): boolean {
    const codePattern =
      /^[a-z]+\.[a-z]+\.(create|read|update|delete|list|manage|export|import|execute)$/;
    return codePattern.test(code);
  }
}
