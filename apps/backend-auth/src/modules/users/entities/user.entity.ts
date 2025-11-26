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
   * Email verification token hash
   * SHA-256 hash of the verification token
   * SECURITY: Never store plain tokens
   * NULL if email is already verified or no token generated yet
   */
  @Column({ type: 'varchar', length: 64, name: 'email_verification_token', nullable: true })
  emailVerificationToken?: string | null;

  /**
   * Timestamp when email verification token expires
   * Default: 24 hours from creation
   * NULL if email is already verified or no token generated yet
   */
  @Column({ type: 'timestamp', name: 'email_verification_token_expires_at', nullable: true })
  emailVerificationTokenExpiresAt?: Date | null;

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
   * Number of consecutive failed login attempts
   * Reset to 0 on successful login
   * Used for brute-force protection
   */
  @Column({ type: 'integer', name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts!: number;

  /**
   * Timestamp until which the account is locked
   * NULL means account is not locked
   * Set when failedLoginAttempts reaches threshold (5)
   */
  @Column({ type: 'timestamp', name: 'lockout_until', nullable: true })
  lockoutUntil?: Date | null;

  /**
   * Timestamp of the last failed login attempt
   * Used for progressive lockout calculations
   * NULL if no failed attempts recorded
   */
  @Column({ type: 'timestamp', name: 'last_failed_login_at', nullable: true })
  lastFailedLoginAt?: Date | null;

  /**
   * Custom JSON serialization
   *
   * SECURITY: Removes sensitive fields from JSON output
   * This prevents accidental exposure in API responses or logs
   *
   * Fields excluded:
   * - passwordHash: Never expose password hashes
   * - failedLoginAttempts: Security-sensitive, aids attackers
   * - lockoutUntil: Security-sensitive, reveals account state
   * - lastFailedLoginAt: Security-sensitive, reveals attack timing
   *
   * @returns Sanitized user object without sensitive fields
   */
  toJSON(): Partial<User> {
    const {
      passwordHash,
      failedLoginAttempts,
      lockoutUntil,
      lastFailedLoginAt,
      ...rest
    } = this;
    return rest as Partial<User>;
  }
}
