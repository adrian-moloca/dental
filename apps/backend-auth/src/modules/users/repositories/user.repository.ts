/**
 * User Repository
 *
 * Data access layer for User entity with strict multi-tenant isolation.
 * All queries MUST include organizationId filter to prevent cross-tenant data leakage.
 *
 * Security requirements:
 * - NEVER query users without organizationId filter
 * - Check for duplicate emails within organization scope only
 * - Return null instead of throwing for missing users (let service layer decide)
 * - Validate tenant isolation on all mutations
 *
 * Edge cases handled:
 * - Email uniqueness per organization (not globally unique)
 * - Users without clinic assignment (organizationId only)
 * - Active status filtering
 * - Last login timestamp updates
 * - Soft delete via status change (INACTIVE)
 *
 * @module modules/users/repositories
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../entities/user.entity';
import type { OrganizationId, ClinicId } from '@dentalos/shared-types';
import { ConflictError, NotFoundError } from '@dentalos/shared-errors';

/**
 * Data transfer object for creating a new user
 */
export interface CreateUserData {
  /** User email (unique per organization) */
  email: string;
  /** Hashed password (NEVER plaintext) */
  passwordHash: string;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User roles (optional, defaults to empty array) */
  roles?: string[];
  /** User permissions (optional, defaults to empty array) */
  permissions?: string[];
  /** Organization ID (REQUIRED for tenant isolation) */
  organizationId: OrganizationId;
  /** Clinic ID (optional, for clinic-specific users) */
  clinicId?: ClinicId;
  /** Email verified status (optional, defaults to false) */
  emailVerified?: boolean;
  /** User status (optional, defaults to ACTIVE) */
  status?: UserStatus;
}

/**
 * User repository with tenant-scoped data access
 *
 * CRITICAL SECURITY RULES:
 * - ALL queries MUST filter by organizationId
 * - Email uniqueness checked within organization scope only
 * - No cross-tenant data access allowed
 * - Mutations validate tenant ownership before update/delete
 */
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>
  ) {}

  /**
   * Find user by email within organization
   *
   * CRITICAL: Always filtered by organizationId for tenant isolation
   *
   * Edge cases:
   * - Returns null if user not found (not throwing)
   * - Email search is case-sensitive (database default)
   * - Only searches within specified organization
   *
   * @param email - User email address
   * @param organizationId - Organization ID for tenant scoping
   * @returns User or null if not found
   */
  async findByEmail(email: string, organizationId: OrganizationId): Promise<User | null> {
    return this.repository.findOne({
      where: {
        email,
        organizationId,
      },
    });
  }

  /**
   * Find user by ID within organization
   *
   * CRITICAL: Always filtered by organizationId for tenant isolation
   *
   * Edge cases:
   * - Returns null if user not found
   * - Validates user belongs to specified organization
   * - Prevents cross-tenant user access
   *
   * @param id - User ID (UUID)
   * @param organizationId - Organization ID for tenant scoping
   * @returns User or null if not found
   */
  async findById(id: string, organizationId: OrganizationId): Promise<User | null> {
    return this.repository.findOne({
      where: {
        id,
        organizationId,
      },
    });
  }

  /**
   * Create new user with tenant isolation
   *
   * CRITICAL: Validates email uniqueness within organization
   *
   * Edge cases:
   * - Throws ConflictError if email already exists in organization
   * - Allows same email in different organizations
   * - Sets default status to ACTIVE if not specified
   * - Sets emailVerified to false if not specified
   * - Initializes empty arrays for roles/permissions if not provided
   *
   * @param data - User creation data
   * @returns Created user entity
   * @throws {ConflictError} If email already exists in organization
   */
  async create(data: CreateUserData): Promise<User> {
    // Check for duplicate email within organization
    const existing = await this.findByEmail(data.email, data.organizationId);
    if (existing) {
      throw new ConflictError('User with this email already exists in organization', {
        conflictType: 'duplicate',
        resourceType: 'user',
      });
    }

    // Create user entity
    const user = this.repository.create({
      email: data.email,
      passwordHash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      organizationId: data.organizationId,
      clinicId: data.clinicId,
      roles: data.roles || [],
      permissions: data.permissions || [],
      status: data.status || UserStatus.ACTIVE,
      emailVerified: data.emailVerified || false,
    });

    // Save to database
    return this.repository.save(user);
  }

  /**
   * Update user's last login timestamp
   *
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Throws NotFoundError if user not found in organization
   * - Updates timestamp to current time
   * - Validates tenant ownership before update
   *
   * @param id - User ID
   * @param organizationId - Organization ID for tenant scoping
   * @throws {NotFoundError} If user not found in organization
   */
  async updateLastLogin(id: string, organizationId: OrganizationId): Promise<void> {
    const result = await this.repository.update(
      { id, organizationId },
      { lastLoginAt: new Date() }
    );

    if (result.affected === 0) {
      throw new NotFoundError('User not found in organization', {
        resourceType: 'user',
        resourceId: id,
      });
    }
  }

  /**
   * Find all active users in organization
   *
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Only returns users with status = ACTIVE
   * - Ordered by creation date (newest first)
   * - Can be extended to support pagination
   *
   * @param organizationId - Organization ID for tenant scoping
   * @returns Array of active users
   */
  async findAllActive(organizationId: OrganizationId): Promise<User[]> {
    return this.repository.find({
      where: {
        organizationId,
        status: UserStatus.ACTIVE,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Find all users in organization (including inactive)
   *
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Returns users with any status
   * - Ordered by creation date (newest first)
   * - Useful for admin user management
   *
   * @param organizationId - Organization ID for tenant scoping
   * @returns Array of all users
   */
  async findAll(organizationId: OrganizationId): Promise<User[]> {
    return this.repository.find({
      where: {
        organizationId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Update user status
   *
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Validates user belongs to organization before update
   * - Can be used for soft delete (set status to INACTIVE)
   * - Can be used to block users (set status to BLOCKED)
   *
   * @param id - User ID
   * @param status - New status
   * @param organizationId - Organization ID for tenant scoping
   * @throws {NotFoundError} If user not found in organization
   */
  async updateStatus(
    id: string,
    status: UserStatus,
    organizationId: OrganizationId
  ): Promise<void> {
    const result = await this.repository.update({ id, organizationId }, { status });

    if (result.affected === 0) {
      throw new NotFoundError('User not found in organization', {
        resourceType: 'user',
        resourceId: id,
      });
    }
  }

  /**
   * Find all users with given email across ALL organizations
   *
   * Used for smart login to identify which orgs user belongs to.
   * SECURITY NOTE: This intentionally bypasses tenant isolation
   * for authentication purposes. Caller MUST validate org membership.
   *
   * Edge cases:
   * - Returns empty array if no users found (not throwing)
   * - Email is normalized (trimmed, lowercased)
   * - Only returns ACTIVE users
   * - Returns organizationId for each user (org details fetched separately if needed)
   *
   * @param email - User email address
   * @returns Array of User entities (one per organization)
   */
  async findByEmailAllOrgs(email: string): Promise<User[]> {
    const normalizedEmail = email.toLowerCase().trim();

    return this.repository.find({
      where: {
        email: normalizedEmail,
        status: UserStatus.ACTIVE, // Only active users can login
      },
    });
  }

  /**
   * Record a failed login attempt for brute-force protection
   *
   * CRITICAL: Always filtered by organizationId for tenant isolation
   *
   * Security behavior:
   * - Increments failedLoginAttempts counter
   * - Updates lastFailedLoginAt timestamp
   * - Sets lockoutUntil if threshold reached (5 attempts = 15 min lockout)
   *
   * Edge cases:
   * - Throws NotFoundError if user not found in organization
   * - Lockout duration is 15 minutes from current time
   * - Uses exponential backoff formula for repeat offenders
   *
   * @param id - User ID
   * @param organizationId - Organization ID for tenant scoping
   * @returns Object containing new attempt count and lockout info
   * @throws {NotFoundError} If user not found in organization
   */
  async recordFailedLoginAttempt(
    id: string,
    organizationId: OrganizationId
  ): Promise<{ failedAttempts: number; isLocked: boolean; lockoutUntil: Date | null }> {
    const user = await this.findById(id, organizationId);
    if (!user) {
      throw new NotFoundError('User not found in organization', {
        resourceType: 'user',
        resourceId: id,
      });
    }

    const newFailedAttempts = user.failedLoginAttempts + 1;
    const now = new Date();

    // Account lockout threshold: 5 failed attempts
    // Lockout duration: 15 minutes with exponential backoff for repeat lockouts
    const LOCKOUT_THRESHOLD = 5;
    const BASE_LOCKOUT_MINUTES = 15;

    let lockoutUntil: Date | null = null;

    if (newFailedAttempts >= LOCKOUT_THRESHOLD) {
      // Calculate lockout duration with exponential backoff
      // Every additional 5 failures doubles the lockout time
      const lockoutMultiplier = Math.pow(
        2,
        Math.floor((newFailedAttempts - LOCKOUT_THRESHOLD) / 5)
      );
      const lockoutMinutes = BASE_LOCKOUT_MINUTES * lockoutMultiplier;

      // Cap at 24 hours maximum lockout
      const cappedLockoutMinutes = Math.min(lockoutMinutes, 24 * 60);

      lockoutUntil = new Date(now.getTime() + cappedLockoutMinutes * 60 * 1000);
    }

    await this.repository.update(
      { id, organizationId },
      {
        failedLoginAttempts: newFailedAttempts,
        lastFailedLoginAt: now,
        lockoutUntil,
      }
    );

    return {
      failedAttempts: newFailedAttempts,
      isLocked: lockoutUntil !== null,
      lockoutUntil,
    };
  }

  /**
   * Clear failed login attempts after successful login
   *
   * CRITICAL: Always filtered by organizationId for tenant isolation
   *
   * Security behavior:
   * - Resets failedLoginAttempts to 0
   * - Clears lockoutUntil timestamp
   * - Preserves lastFailedLoginAt for audit purposes
   *
   * @param id - User ID
   * @param organizationId - Organization ID for tenant scoping
   * @throws {NotFoundError} If user not found in organization
   */
  async clearFailedLoginAttempts(id: string, organizationId: OrganizationId): Promise<void> {
    const result = await this.repository.update(
      { id, organizationId },
      {
        failedLoginAttempts: 0,
        lockoutUntil: null,
      }
    );

    if (result.affected === 0) {
      throw new NotFoundError('User not found in organization', {
        resourceType: 'user',
        resourceId: id,
      });
    }
  }

  /**
   * Check if user account is currently locked
   *
   * CRITICAL: Always filtered by organizationId for tenant isolation
   *
   * Security behavior:
   * - Returns lock status and remaining lockout time
   * - Automatically clears expired lockouts (lockoutUntil < now)
   *
   * Edge cases:
   * - Returns false if user not found (fail open for this check only)
   * - Clears lockout if it has expired
   *
   * @param id - User ID
   * @param organizationId - Organization ID for tenant scoping
   * @returns Object with lock status and remaining time in seconds
   */
  async checkAccountLockStatus(
    id: string,
    organizationId: OrganizationId
  ): Promise<{ isLocked: boolean; remainingSeconds: number; failedAttempts: number }> {
    const user = await this.findById(id, organizationId);
    if (!user) {
      // Fail open for lock check - let authentication handle user not found
      return { isLocked: false, remainingSeconds: 0, failedAttempts: 0 };
    }

    const now = new Date();

    // Check if lockout has expired
    if (user.lockoutUntil && user.lockoutUntil <= now) {
      // Lockout expired, clear it (but preserve failed attempts for audit)
      await this.repository.update({ id, organizationId }, { lockoutUntil: null });
      return { isLocked: false, remainingSeconds: 0, failedAttempts: user.failedLoginAttempts };
    }

    // Check if currently locked
    if (user.lockoutUntil && user.lockoutUntil > now) {
      const remainingMs = user.lockoutUntil.getTime() - now.getTime();
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      return { isLocked: true, remainingSeconds, failedAttempts: user.failedLoginAttempts };
    }

    return { isLocked: false, remainingSeconds: 0, failedAttempts: user.failedLoginAttempts };
  }
}
