/**
 * UserRole Repository
 *
 * Data access layer for UserRole join entity with strict multi-tenant isolation.
 * Manages role assignments to users with full audit trail and expiration support.
 *
 * Security requirements:
 * - NEVER query user roles without organizationId filter
 * - Active roles: revokedAt IS NULL AND (expiresAt IS NULL OR expiresAt > NOW())
 * - Prevent duplicate active role assignments
 * - Full audit trail with assignedBy and revokedBy
 * - Validate tenant isolation on all mutations
 *
 * Edge cases handled:
 * - Role expiration (expiresAt)
 * - Role revocation (revokedAt, revokedBy)
 * - Temporary vs permanent role assignments
 * - Clinic-scoped vs organization-wide assignments
 * - Preventing duplicate active assignments
 * - Expired role cleanup
 *
 * @module modules/rbac/repositories
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../entities/user-role.entity';
import type { OrganizationId, ClinicId, UUID } from '@dentalos/shared-types';
import { ConflictError, NotFoundError } from '@dentalos/shared-errors';

/**
 * Data transfer object for assigning a role to user
 */
export interface AssignRoleData {
  /** User ID */
  userId: UUID;
  /** Role ID */
  roleId: UUID;
  /** Organization ID (REQUIRED for tenant isolation) */
  organizationId: OrganizationId;
  /** Clinic ID (optional, for clinic-scoped assignments) */
  clinicId?: ClinicId;
  /** User who is assigning this role */
  assignedBy: UUID;
  /** Optional expiration date for temporary assignments */
  expiresAt?: Date;
}

/**
 * Data transfer object for revoking a role from user
 */
export interface RevokeRoleData {
  /** User ID */
  userId: UUID;
  /** Role ID */
  roleId: UUID;
  /** Organization ID (REQUIRED for tenant isolation) */
  organizationId: OrganizationId;
  /** Clinic ID (optional, for clinic-scoped assignments) */
  clinicId?: ClinicId;
  /** User who is revoking this role */
  revokedBy: UUID;
  /** Optional reason for revocation */
  revocationReason?: string;
}

/**
 * UserRole repository with tenant-scoped data access
 *
 * CRITICAL SECURITY RULES:
 * - ALL queries MUST filter by organizationId
 * - Active roles checked with: revokedAt IS NULL AND (expiresAt IS NULL OR expiresAt > NOW())
 * - No cross-tenant data access allowed
 * - Unique active assignments per (userId, roleId, organizationId, clinicId)
 */
@Injectable()
export class UserRoleRepository {
  constructor(
    @InjectRepository(UserRole)
    private readonly repository: Repository<UserRole>
  ) {}

  /**
   * Find active user role assignment
   *
   * CRITICAL: Filtered by organizationId and active status
   *
   * Edge cases:
   * - Returns null if assignment not found or not active
   * - Checks revokedAt IS NULL
   * - Checks expiresAt IS NULL OR expiresAt > NOW()
   * - Handles clinic scoping
   *
   * @param userId - User ID
   * @param roleId - Role ID
   * @param organizationId - Organization ID for tenant scoping
   * @param clinicId - Optional clinic ID for clinic scoping
   * @returns UserRole or null if not found/active
   */
  async findActiveAssignment(
    userId: UUID,
    roleId: UUID,
    organizationId: OrganizationId,
    clinicId?: ClinicId
  ): Promise<UserRole | null> {
    const now = new Date();

    return this.repository
      .createQueryBuilder('ur')
      .where('ur.user_id = :userId', { userId })
      .andWhere('ur.role_id = :roleId', { roleId })
      .andWhere('ur.organization_id = :organizationId', { organizationId })
      .andWhere(
        clinicId ? 'ur.clinic_id = :clinicId' : 'ur.clinic_id IS NULL',
        clinicId ? { clinicId } : {}
      )
      .andWhere('ur.revoked_at IS NULL')
      .andWhere('(ur.expires_at IS NULL OR ur.expires_at > :now)', { now })
      .getOne();
  }

  /**
   * Find all active roles for user
   *
   * CRITICAL: Filtered by organizationId and active status
   *
   * Edge cases:
   * - Returns empty array if no active roles
   * - Excludes revoked roles
   * - Excludes expired roles
   * - Includes both org-wide and clinic-specific roles
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant scoping
   * @param clinicId - Optional clinic ID for clinic scoping
   * @returns Array of active user roles
   */
  async findActiveRolesByUser(
    userId: UUID,
    organizationId: OrganizationId,
    clinicId?: ClinicId
  ): Promise<UserRole[]> {
    const now = new Date();

    const query = this.repository
      .createQueryBuilder('ur')
      .leftJoinAndSelect('ur.role', 'role')
      .where('ur.user_id = :userId', { userId })
      .andWhere('ur.organization_id = :organizationId', { organizationId })
      .andWhere('ur.revoked_at IS NULL')
      .andWhere('(ur.expires_at IS NULL OR ur.expires_at > :now)', { now });

    // If clinicId provided, include both org-wide and clinic-specific roles
    if (clinicId) {
      query.andWhere('(ur.clinic_id = :clinicId OR ur.clinic_id IS NULL)', { clinicId });
    } else {
      // If no clinicId, only return org-wide role assignments
      query.andWhere('ur.clinic_id IS NULL');
    }

    return query.orderBy('ur.assigned_at', 'DESC').getMany();
  }

  /**
   * Find all users with a specific role
   *
   * CRITICAL: Filtered by organizationId and active status
   *
   * Edge cases:
   * - Returns empty array if no users have role
   * - Only returns active assignments
   * - Useful for role-based user listing
   *
   * @param roleId - Role ID
   * @param organizationId - Organization ID for tenant scoping
   * @param clinicId - Optional clinic ID for clinic scoping
   * @returns Array of user role assignments
   */
  async findUsersByRole(
    roleId: UUID,
    organizationId: OrganizationId,
    clinicId?: ClinicId
  ): Promise<UserRole[]> {
    const now = new Date();

    const query = this.repository
      .createQueryBuilder('ur')
      .leftJoinAndSelect('ur.user', 'user')
      .where('ur.role_id = :roleId', { roleId })
      .andWhere('ur.organization_id = :organizationId', { organizationId })
      .andWhere('ur.revoked_at IS NULL')
      .andWhere('(ur.expires_at IS NULL OR ur.expires_at > :now)', { now });

    if (clinicId) {
      query.andWhere('ur.clinic_id = :clinicId', { clinicId });
    }

    return query.orderBy('ur.assigned_at', 'DESC').getMany();
  }

  /**
   * Assign role to user
   *
   * CRITICAL: Validates no duplicate active assignment exists
   *
   * Edge cases:
   * - Throws ConflictError if active assignment already exists
   * - Allows same role if previous assignment was revoked or expired
   * - Validates expiresAt is in the future if provided
   * - Handles both temporary and permanent assignments
   *
   * @param data - Role assignment data
   * @returns Created user role assignment
   * @throws {ConflictError} If active assignment already exists
   */
  async assignRole(data: AssignRoleData): Promise<UserRole> {
    // Check for existing active assignment
    const existing = await this.findActiveAssignment(
      data.userId,
      data.roleId,
      data.organizationId,
      data.clinicId
    );

    if (existing) {
      throw new ConflictError('User already has this role assigned', {
        conflictType: 'duplicate',
        resourceType: 'user_role',
        existingId: existing.id,
      });
    }

    // Validate expiresAt is in future if provided
    if (data.expiresAt && data.expiresAt <= new Date()) {
      throw new Error('Expiration date must be in the future');
    }

    // Create user role assignment
    const userRole = this.repository.create({
      userId: data.userId,
      roleId: data.roleId,
      organizationId: data.organizationId,
      clinicId: data.clinicId,
      assignedBy: data.assignedBy,
      expiresAt: data.expiresAt,
    });

    // Save to database
    return this.repository.save(userRole);
  }

  /**
   * Revoke role from user
   *
   * CRITICAL: Only revokes active assignments
   *
   * Edge cases:
   * - Throws NotFoundError if no active assignment found
   * - Sets revokedAt timestamp
   * - Records revokedBy user
   * - Records revocation reason if provided
   * - Preserves assignment for audit trail
   *
   * @param data - Role revocation data
   * @throws {NotFoundError} If no active assignment found
   */
  async revokeRole(data: RevokeRoleData): Promise<void> {
    // Find active assignment
    const assignment = await this.findActiveAssignment(
      data.userId,
      data.roleId,
      data.organizationId,
      data.clinicId
    );

    if (!assignment) {
      throw new NotFoundError('Active role assignment not found', {
        resourceType: 'user_role',
        context: {
          userId: data.userId,
          roleId: data.roleId,
        },
      });
    }

    // Set revocation fields
    assignment.revokedAt = new Date();
    assignment.revokedBy = data.revokedBy;
    assignment.revocationReason = data.revocationReason;

    // Save updated assignment
    await this.repository.save(assignment);
  }

  /**
   * Find expired role assignments
   *
   * Useful for cleanup jobs and notifications
   *
   * Edge cases:
   * - Only returns assignments with expiresAt < NOW()
   * - Excludes already revoked assignments
   * - Can be filtered by organization
   *
   * @param organizationId - Optional organization ID for filtering
   * @returns Array of expired user roles
   */
  async findExpiredRoles(organizationId?: OrganizationId): Promise<UserRole[]> {
    const now = new Date();

    const query = this.repository
      .createQueryBuilder('ur')
      .leftJoinAndSelect('ur.role', 'role')
      .leftJoinAndSelect('ur.user', 'user')
      .where('ur.expires_at IS NOT NULL')
      .andWhere('ur.expires_at <= :now', { now })
      .andWhere('ur.revoked_at IS NULL');

    if (organizationId) {
      query.andWhere('ur.organization_id = :organizationId', { organizationId });
    }

    return query.orderBy('ur.expires_at', 'ASC').getMany();
  }

  /**
   * Find expiring soon role assignments
   *
   * Useful for notification systems
   *
   * Edge cases:
   * - Returns assignments expiring within specified days
   * - Excludes already expired or revoked assignments
   * - Can be filtered by organization
   *
   * @param days - Number of days to look ahead
   * @param organizationId - Optional organization ID for filtering
   * @returns Array of expiring user roles
   */
  async findExpiringSoonRoles(
    days: number = 7,
    organizationId?: OrganizationId
  ): Promise<UserRole[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const query = this.repository
      .createQueryBuilder('ur')
      .leftJoinAndSelect('ur.role', 'role')
      .leftJoinAndSelect('ur.user', 'user')
      .where('ur.expires_at IS NOT NULL')
      .andWhere('ur.expires_at > :now', { now })
      .andWhere('ur.expires_at <= :futureDate', { futureDate })
      .andWhere('ur.revoked_at IS NULL');

    if (organizationId) {
      query.andWhere('ur.organization_id = :organizationId', { organizationId });
    }

    return query.orderBy('ur.expires_at', 'ASC').getMany();
  }

  /**
   * Count active role assignments for user
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant scoping
   * @returns Number of active role assignments
   */
  async countActiveRolesByUser(userId: UUID, organizationId: OrganizationId): Promise<number> {
    const now = new Date();

    return this.repository
      .createQueryBuilder('ur')
      .where('ur.user_id = :userId', { userId })
      .andWhere('ur.organization_id = :organizationId', { organizationId })
      .andWhere('ur.revoked_at IS NULL')
      .andWhere('(ur.expires_at IS NULL OR ur.expires_at > :now)', { now })
      .getCount();
  }

  /**
   * Count users with specific role
   *
   * @param roleId - Role ID
   * @param organizationId - Organization ID for tenant scoping
   * @returns Number of users with role
   */
  async countUsersByRole(roleId: UUID, organizationId: OrganizationId): Promise<number> {
    const now = new Date();

    return this.repository
      .createQueryBuilder('ur')
      .where('ur.role_id = :roleId', { roleId })
      .andWhere('ur.organization_id = :organizationId', { organizationId })
      .andWhere('ur.revoked_at IS NULL')
      .andWhere('(ur.expires_at IS NULL OR ur.expires_at > :now)', { now })
      .getCount();
  }

  /**
   * Find all role assignments for user (including inactive)
   *
   * Useful for audit trail and history
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant scoping
   * @returns Array of all user role assignments
   */
  async findAllAssignmentsByUser(
    userId: UUID,
    organizationId: OrganizationId
  ): Promise<UserRole[]> {
    return this.repository.find({
      where: {
        userId,
        organizationId,
      },
      relations: ['role'],
      order: {
        assignedAt: 'DESC',
      },
    });
  }
}
