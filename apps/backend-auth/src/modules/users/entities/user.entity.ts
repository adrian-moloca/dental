/**
 * User Entity
 *
 * Represents a user account in the authentication system.
 * Supports multi-tenant isolation with organizationId and optional clinicId.
 *
 * Security requirements:
 * - Password hash NEVER exposed in JSON serialization
 * - All queries MUST filter by organizationId
 * - Unique email per organization (not globally unique)
 *
 * Edge cases handled:
 * - Users can belong to organization without specific clinic assignment
 * - Email uniqueness scoped to organization
 * - Roles and permissions stored as JSONB for flexibility
 * - Status transitions (INVITED -> ACTIVE, ACTIVE -> BLOCKED, etc.)
 * - Optional last login tracking
 *
 * @module modules/users/entities
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import type { OrganizationId, ClinicId } from '@dentalos/shared-types';

/**
 * User status enumeration
 *
 * Status transitions:
 * - INVITED: User has been invited but hasn't accepted yet
 * - ACTIVE: User is active and can log in
 * - INACTIVE: User is deactivated (soft delete, can be reactivated)
 * - BLOCKED: User is blocked due to security or policy violation
 */
export enum UserStatus {
  /** User has been invited but hasn't accepted invitation */
  INVITED = 'INVITED',
  /** User is active and can log in */
  ACTIVE = 'ACTIVE',
  /** User account is deactivated (soft delete) */
  INACTIVE = 'INACTIVE',
  /** User is blocked due to security or policy reasons */
  BLOCKED = 'BLOCKED',
}

/**
 * User entity with multi-tenant isolation
 *
 * Database indexes:
 * - Primary key on id (UUID)
 * - Unique index on (email, organizationId) - email unique per organization
 * - Index on organizationId for tenant-scoped queries
 * - Index on clinicId for clinic-scoped queries (partial index where clinicId IS NOT NULL)
 * - Index on status for filtering by user status
 */
@Entity('users')
@Index(['email', 'organizationId'], { unique: true })
@Index(['organizationId'])
@Index(['clinicId'])
@Index(['status'])
export class User {
  /**
   * Unique user identifier (UUID v4)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Organization to which this user belongs
   * CRITICAL: Always include in WHERE clauses for tenant isolation
   */
  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId!: OrganizationId;

  /**
   * Optional clinic assignment within organization
   * NULL means user has organization-wide access
   */
  @Column({ type: 'uuid', name: 'clinic_id', nullable: true })
  clinicId?: ClinicId;

  /**
   * User email address (used for login)
   * Unique per organization (not globally unique)
   */
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  /**
   * Hashed password (bcrypt or argon2)
   * SECURITY: Never expose in JSON responses (see toJSON method)
   */
  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash!: string;

  /**
   * User's first name
   */
  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  firstName!: string;

  /**
   * User's last name
   */
  @Column({ type: 'varchar', length: 100, name: 'last_name' })
  lastName!: string;

  /**
   * User roles (e.g., ['DENTIST', 'CLINIC_ADMIN'])
   * Stored as JSONB array for flexibility
   */
  @Column({ type: 'jsonb', default: '[]' })
  roles!: string[];

  /**
   * User permissions (e.g., ['patients:read', 'appointments:write'])
   * Stored as JSONB array for flexibility
   * Can override role-based permissions
   */
  @Column({ type: 'jsonb', default: '[]' })
  permissions!: string[];

  /**
   * User account status
   */
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  /**
   * Whether user's email has been verified
   */
  @Column({ type: 'boolean', name: 'email_verified', default: false })
  emailVerified!: boolean;

  /**
   * Timestamp of user's last successful login
   * NULL if user has never logged in
   */
  @Column({ type: 'timestamp', name: 'last_login_at', nullable: true })
  lastLoginAt?: Date;

  /**
   * Timestamp when user was created
   * Automatically set by TypeORM
   */
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  /**
   * Timestamp when user was last updated
   * Automatically updated by TypeORM on save
   */
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  /**
   * Custom JSON serialization
   *
   * SECURITY: Removes passwordHash from JSON output
   * This prevents accidental password exposure in API responses or logs
   *
   * @returns Sanitized user object without password hash
   */
  toJSON(): Partial<User> {
    const { passwordHash, ...rest } = this;
    return rest as Partial<User>;
  }
}
