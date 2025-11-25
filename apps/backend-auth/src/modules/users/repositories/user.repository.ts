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
}
