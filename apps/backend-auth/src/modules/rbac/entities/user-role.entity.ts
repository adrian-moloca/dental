/**
 * UserRole Join Entity
 *
 * Represents the many-to-many relationship between Users and Roles.
 * Tracks role assignments with full audit trail and expiration support.
 *
 * Security requirements:
 * - All queries MUST filter by organizationId for tenant isolation
 * - Active roles: revokedAt IS NULL AND (expiresAt IS NULL OR expiresAt > NOW())
 * - Unique constraint on (userId, roleId, organizationId, clinicId) for active assignments
 * - Full audit trail with assignedBy and revokedBy tracking
 *
 * Edge cases handled:
 * - Role expiration (expiresAt)
 * - Role revocation (revokedAt, revokedBy)
 * - Temporary role assignments
 * - Clinic-scoped role assignments
 * - Organization-wide role assignments (clinicId NULL)
 * - Preventing duplicate active role assignments
 * - Audit trail preservation after revocation
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
import type { OrganizationId, ClinicId, UUID } from '@dentalos/shared-types';
import { Role } from './role.entity';
import { User } from '../../users/entities/user.entity';

/**
 * UserRole join entity with audit trail
 *
 * Database indexes:
 * - Primary key on id (UUID)
 * - Unique index on (userId, roleId, organizationId, clinicId) WHERE revokedAt IS NULL
 * - Index on userId for user-based queries
 * - Index on roleId for role-based queries
 * - Index on organizationId for tenant-scoped queries
 * - Index on clinicId for clinic-scoped queries
 * - Index on revokedAt for active role filtering
 * - Index on expiresAt for expiration checks
 *
 * Constraints:
 * - Cannot have duplicate active assignments (same user, role, org, clinic)
 * - expiresAt must be in the future when set
 * - revokedAt requires revokedBy to be set
 */
@Entity('user_roles')
@Index(['userId', 'roleId', 'organizationId', 'clinicId'], {
  unique: true,
  where: 'revoked_at IS NULL',
})
@Index(['userId'])
@Index(['roleId'])
@Index(['organizationId'])
@Index(['clinicId'])
@Index(['revokedAt'])
@Index(['expiresAt'])
@Index(['assignedBy'])
export class UserRole {
  /**
   * Unique user-role assignment identifier (UUID v4)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: UUID;

  /**
   * User who has been assigned this role
   */
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: UUID;

  /**
   * Role that has been assigned
   */
  @Column({ type: 'uuid', name: 'role_id' })
  roleId!: UUID;

  /**
   * Organization context for this assignment
   * CRITICAL: Always include in WHERE clauses for tenant isolation
   * Denormalized from Role for query performance
   */
  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId!: OrganizationId;

  /**
   * Optional clinic scope for this assignment
   * NULL means role is assigned at organization level
   * Must match role's clinicId if role is clinic-specific
   */
  @Column({ type: 'uuid', name: 'clinic_id', nullable: true })
  clinicId?: ClinicId;

  /**
   * Timestamp when role was assigned
   * Automatically set by TypeORM
   */
  @CreateDateColumn({ type: 'timestamp', name: 'assigned_at' })
  assignedAt!: Date;

  /**
   * User who assigned this role
   * Required for audit trail
   */
  @Column({ type: 'uuid', name: 'assigned_by' })
  assignedBy!: UUID;

  /**
   * Optional expiration timestamp
   * NULL means role assignment never expires
   * Used for temporary role assignments
   */
  @Column({ type: 'timestamp', name: 'expires_at', nullable: true })
  expiresAt?: Date;

  /**
   * Timestamp when role was revoked
   * NULL means role is still active
   */
  @Column({ type: 'timestamp', name: 'revoked_at', nullable: true })
  revokedAt?: Date;

  /**
   * User who revoked this role
   * Required when revokedAt is set
   */
  @Column({ type: 'uuid', name: 'revoked_by', nullable: true })
  revokedBy?: UUID;

  /**
   * Optional reason for revocation
   * Used for audit trail and compliance
   */
  @Column({ type: 'text', name: 'revocation_reason', nullable: true })
  revocationReason?: string;

  /**
   * Many-to-one relationship with User
   * Eager loading disabled for performance
   */
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  /**
   * Many-to-one relationship with Role
   * Eager loading disabled for performance
   */
  @ManyToOne(() => Role, { eager: false })
  @JoinColumn({ name: 'role_id' })
  role?: Role;

  /**
   * Checks if this role assignment is currently active
   * Active means: not revoked AND not expired
   *
   * @returns true if role assignment is active
   */
  isActive(): boolean {
    const now = new Date();

    // Check if revoked
    if (this.revokedAt) {
      return false;
    }

    // Check if expired
    if (this.expiresAt && this.expiresAt <= now) {
      return false;
    }

    return true;
  }

  /**
   * Checks if this role assignment has been revoked
   *
   * @returns true if role has been revoked
   */
  isRevoked(): boolean {
    return !!this.revokedAt;
  }

  /**
   * Checks if this role assignment has expired
   *
   * @returns true if role has expired
   */
  isExpired(): boolean {
    if (!this.expiresAt) {
      return false;
    }

    return new Date() >= this.expiresAt;
  }

  /**
   * Checks if this role assignment is temporary (has expiration)
   *
   * @returns true if role has an expiration date
   */
  isTemporary(): boolean {
    return !!this.expiresAt;
  }

  /**
   * Checks if this role assignment is permanent (no expiration)
   *
   * @returns true if role has no expiration date
   */
  isPermanent(): boolean {
    return !this.expiresAt;
  }

  /**
   * Checks if this role assignment is organization-wide
   *
   * @returns true if role is not clinic-specific
   */
  isOrganizationWide(): boolean {
    return this.clinicId === null || this.clinicId === undefined;
  }

  /**
   * Checks if this role assignment is clinic-specific
   *
   * @returns true if role is scoped to a specific clinic
   */
  isClinicSpecific(): boolean {
    return !this.isOrganizationWide();
  }

  /**
   * Gets remaining time until expiration
   * Returns null if role has no expiration
   *
   * @returns Milliseconds until expiration or null
   */
  getTimeUntilExpiration(): number | null {
    if (!this.expiresAt) {
      return null;
    }

    const now = new Date();
    const remaining = this.expiresAt.getTime() - now.getTime();

    return remaining > 0 ? remaining : 0;
  }

  /**
   * Checks if role is expiring soon (within specified days)
   *
   * @param days - Number of days to check
   * @returns true if role expires within specified days
   */
  isExpiringSoon(days: number = 7): boolean {
    if (!this.expiresAt) {
      return false;
    }

    const daysInMs = days * 24 * 60 * 60 * 1000;
    const remaining = this.getTimeUntilExpiration();

    return remaining !== null && remaining > 0 && remaining <= daysInMs;
  }

  /**
   * Custom JSON serialization
   * Ensures consistent output format
   *
   * @returns Serialized user-role object
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      userId: this.userId,
      roleId: this.roleId,
      organizationId: this.organizationId,
      clinicId: this.clinicId,
      assignedAt: this.assignedAt.toISOString(),
      assignedBy: this.assignedBy,
      expiresAt: this.expiresAt?.toISOString(),
      revokedAt: this.revokedAt?.toISOString(),
      revokedBy: this.revokedBy,
      revocationReason: this.revocationReason,
      isActive: this.isActive(),
      isExpired: this.isExpired(),
      isRevoked: this.isRevoked(),
    };
  }
}
