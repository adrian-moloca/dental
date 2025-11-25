/**
 * UserCabinet Entity
 *
 * Represents a many-to-many join table between User and Cabinet.
 * Tracks which users are assigned to which cabinets within an organization.
 *
 * Security requirements:
 * - All queries MUST filter by organizationId for tenant isolation
 * - User and Cabinet must belong to the same organization
 * - Only one cabinet can be primary per user
 * - Unique constraint on (userId, cabinetId) prevents duplicates
 *
 * Edge cases handled:
 * - User can be assigned to multiple cabinets
 * - One cabinet must be primary (auto-set if first cabinet)
 * - When setting primary, other primaries are automatically unset
 * - Soft delete via deletedAt timestamp
 * - Active/inactive status for temporary deactivation without deletion
 * - Cabinet assignment can be deactivated without removing the record
 *
 * Business rules:
 * - First cabinet assigned to user is automatically primary
 * - Only one primary cabinet per user per organization
 * - Cannot assign user to cabinet in different organization
 * - Deactivating a user's primary cabinet should auto-promote another cabinet
 *
 * @module modules/users/entities
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import type { OrganizationId, UUID } from '@dentalos/shared-types';

/**
 * UserCabinet entity with multi-tenant isolation
 *
 * Database indexes:
 * - Primary key on id (UUID)
 * - Unique composite index on (userId, cabinetId) - prevents duplicate assignments
 * - Index on userId for fast user lookups
 * - Composite index on (organizationId, userId) for tenant-scoped user queries
 * - Composite index on (organizationId, cabinetId) for tenant-scoped cabinet queries
 * - Composite index on (userId, isPrimary) for finding primary cabinet per user
 * - Index on organizationId for tenant isolation
 */
@Entity('user_cabinets')
@Index(['userId', 'cabinetId'], { unique: true })
@Index(['userId'])
@Index(['organizationId', 'userId'])
@Index(['organizationId', 'cabinetId'])
@Index(['userId', 'isPrimary'])
@Index(['organizationId'])
export class UserCabinet {
  /**
   * Unique identifier for this user-cabinet relationship (UUID v4)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: UUID;

  /**
   * Organization to which this user-cabinet relationship belongs
   * CRITICAL: Always include in WHERE clauses for tenant isolation
   * Must match the organizationId of both user and cabinet
   */
  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId!: OrganizationId;

  /**
   * User ID (foreign key to users table)
   * References the user who is assigned to the cabinet
   */
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: UUID;

  /**
   * Cabinet ID (foreign key to cabinets table in subscription service)
   * References the cabinet to which the user is assigned
   * Note: Foreign key validation happens at application layer (cross-service)
   */
  @Column({ type: 'uuid', name: 'cabinet_id' })
  cabinetId!: UUID;

  /**
   * Whether this is the user's primary cabinet
   * Only one cabinet can be primary per user
   * Primary cabinet is used as default in appointment booking and other workflows
   *
   * Business rules:
   * - First cabinet assigned to user is automatically primary
   * - Setting another cabinet as primary automatically unsets previous primary
   * - Cannot have zero primary cabinets if user has any active cabinets
   */
  @Column({ type: 'boolean', name: 'is_primary', default: false })
  isPrimary!: boolean;

  /**
   * Whether this user-cabinet assignment is currently active
   * - true: User can access and work in this cabinet
   * - false: User temporarily cannot access this cabinet (not deleted)
   *
   * Edge cases:
   * - Deactivating primary cabinet should auto-promote another active cabinet
   * - Can be used to temporarily revoke access without losing assignment history
   * - Inactive assignments excluded from normal queries but preserved for audit
   */
  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  // ============================================================================
  // Audit Timestamps
  // ============================================================================

  /**
   * Timestamp when user-cabinet relationship was created
   * Automatically set by TypeORM
   */
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  /**
   * Timestamp when user-cabinet relationship was last updated
   * Automatically updated by TypeORM on save
   */
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  /**
   * Timestamp when user-cabinet relationship was soft deleted
   * NULL if not deleted
   * Used for soft delete functionality
   *
   * Soft delete vs deactivate:
   * - Soft delete (deletedAt): User-cabinet relationship is permanently removed
   * - Deactivate (isActive=false): Temporary suspension, can be reactivated
   */
  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
