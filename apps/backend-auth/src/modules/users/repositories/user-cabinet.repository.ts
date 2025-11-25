/**
 * UserCabinet Repository
 *
 * Data access layer for UserCabinet entity with strict multi-tenant isolation.
 * All queries MUST include organizationId filter to prevent cross-tenant data leakage.
 *
 * Security requirements:
 * - NEVER query user-cabinet relationships without organizationId filter
 * - Validate user and cabinet belong to same organization before creating relationship
 * - Enforce unique constraint on (userId, cabinetId)
 * - Only one cabinet can be primary per user
 * - Return null instead of throwing for missing relationships (let service layer decide)
 *
 * Edge cases handled:
 * - Multiple cabinets per user
 * - Primary cabinet management (auto-set first, auto-unset others)
 * - Active/inactive status filtering
 * - Soft delete via deletedAt timestamp
 * - Duplicate assignment prevention
 * - Finding primary cabinet when user has multiple assignments
 *
 * Business rules enforced:
 * - First cabinet assigned to user is automatically primary
 * - Setting another cabinet as primary automatically unsets previous primary
 * - Cannot have duplicate (userId, cabinetId) pairs
 *
 * @module modules/users/repositories
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { UserCabinet } from '../entities/user-cabinet.entity';
import type { OrganizationId, UUID } from '@dentalos/shared-types';
import { ConflictError, NotFoundError } from '@dentalos/shared-errors';

/**
 * Data transfer object for creating a new user-cabinet relationship
 */
export interface CreateUserCabinetData {
  /** User ID (must belong to organizationId) */
  userId: UUID;
  /** Cabinet ID (must belong to organizationId) */
  cabinetId: UUID;
  /** Organization ID (REQUIRED for tenant isolation) */
  organizationId: OrganizationId;
  /** Whether this is the primary cabinet (optional, auto-calculated if not provided) */
  isPrimary?: boolean;
  /** Whether this relationship is active (optional, defaults to true) */
  isActive?: boolean;
}

/**
 * UserCabinet repository with tenant-scoped data access
 *
 * CRITICAL SECURITY RULES:
 * - ALL queries MUST filter by organizationId
 * - User-cabinet uniqueness checked within organization scope
 * - No cross-tenant data access allowed
 * - Mutations validate tenant ownership before update/delete
 * - Primary cabinet management ensures only one primary per user
 */
@Injectable()
export class UserCabinetRepository {
  constructor(
    @InjectRepository(UserCabinet)
    private readonly repository: Repository<UserCabinet>
  ) {}

  /**
   * Find all cabinet assignments for a user within organization
   *
   * CRITICAL: Always filtered by organizationId for tenant isolation
   *
   * Edge cases:
   * - Returns empty array if user has no cabinet assignments
   * - Only returns non-deleted assignments (deletedAt IS NULL)
   * - Can optionally filter by active status
   * - Ordered by isPrimary DESC, createdAt ASC (primary first, then chronological)
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant scoping
   * @param activeOnly - Whether to return only active assignments (default: true)
   * @returns Array of user-cabinet relationships
   */
  async findByUserId(
    userId: UUID,
    organizationId: OrganizationId,
    activeOnly = true
  ): Promise<UserCabinet[]> {
    const where: any = {
      userId,
      organizationId,
      deletedAt: IsNull(),
    };

    if (activeOnly) {
      where.isActive = true;
    }

    return this.repository.find({
      where,
      order: {
        isPrimary: 'DESC', // Primary first
        createdAt: 'ASC', // Then oldest to newest
      },
    });
  }

  /**
   * Find all user assignments for a cabinet within organization
   *
   * CRITICAL: Always filtered by organizationId for tenant isolation
   *
   * Edge cases:
   * - Returns empty array if cabinet has no user assignments
   * - Only returns non-deleted assignments (deletedAt IS NULL)
   * - Can optionally filter by active status
   * - Useful for seeing all users who have access to a cabinet
   *
   * @param cabinetId - Cabinet ID
   * @param organizationId - Organization ID for tenant scoping
   * @param activeOnly - Whether to return only active assignments (default: true)
   * @returns Array of user-cabinet relationships
   */
  async findByCabinetId(
    cabinetId: UUID,
    organizationId: OrganizationId,
    activeOnly = true
  ): Promise<UserCabinet[]> {
    const where: any = {
      cabinetId,
      organizationId,
      deletedAt: IsNull(),
    };

    if (activeOnly) {
      where.isActive = true;
    }

    return this.repository.find({
      where,
      order: {
        createdAt: 'ASC',
      },
    });
  }

  /**
   * Find specific user-cabinet relationship
   *
   * CRITICAL: Always filtered by organizationId for tenant isolation
   *
   * Edge cases:
   * - Returns null if relationship not found
   * - Only returns non-deleted assignments
   * - Validates both user and cabinet belong to organization
   *
   * @param userId - User ID
   * @param cabinetId - Cabinet ID
   * @param organizationId - Organization ID for tenant scoping
   * @returns UserCabinet or null if not found
   */
  async findOne(
    userId: UUID,
    cabinetId: UUID,
    organizationId: OrganizationId
  ): Promise<UserCabinet | null> {
    return this.repository.findOne({
      where: {
        userId,
        cabinetId,
        organizationId,
        deletedAt: IsNull(),
      },
    });
  }

  /**
   * Find user's primary cabinet within organization
   *
   * CRITICAL: Always filtered by organizationId for tenant isolation
   *
   * Edge cases:
   * - Returns null if user has no primary cabinet
   * - Returns null if primary cabinet is inactive or deleted
   * - There should only be one primary per user (enforced by business logic)
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant scoping
   * @returns UserCabinet or null if no primary found
   */
  async findPrimaryByUserId(
    userId: UUID,
    organizationId: OrganizationId
  ): Promise<UserCabinet | null> {
    return this.repository.findOne({
      where: {
        userId,
        organizationId,
        isPrimary: true,
        isActive: true,
        deletedAt: IsNull(),
      },
    });
  }

  /**
   * Create new user-cabinet relationship with tenant isolation
   *
   * CRITICAL: Validates uniqueness of (userId, cabinetId) within organization
   *
   * Edge cases:
   * - Throws ConflictError if relationship already exists
   * - Auto-sets isPrimary to true if this is user's first cabinet
   * - Auto-sets isPrimary to false if user already has a primary cabinet (unless explicitly set to true)
   * - Sets isActive to true by default
   *
   * Business rules:
   * - First cabinet is automatically primary
   * - If explicitly setting isPrimary=true, caller should unset other primaries first
   *
   * @param data - User-cabinet creation data
   * @returns Created UserCabinet entity
   * @throws {ConflictError} If relationship already exists
   */
  async create(data: CreateUserCabinetData): Promise<UserCabinet> {
    // Check for duplicate relationship
    const existing = await this.findOne(data.userId, data.cabinetId, data.organizationId);

    if (existing) {
      throw new ConflictError('User is already assigned to this cabinet', {
        conflictType: 'duplicate',
        resourceType: 'user_cabinet',
      });
    }

    // Check if this is user's first cabinet (should auto-set as primary)
    let isPrimary = data.isPrimary ?? false;
    if (data.isPrimary === undefined) {
      const existingCabinets = await this.findByUserId(
        data.userId,
        data.organizationId,
        false // Include inactive to count all assignments
      );
      isPrimary = existingCabinets.length === 0; // First cabinet is primary
    }

    // Create user-cabinet relationship
    const userCabinet = this.repository.create({
      userId: data.userId,
      cabinetId: data.cabinetId,
      organizationId: data.organizationId,
      isPrimary,
      isActive: data.isActive ?? true,
    });

    // Save to database
    return this.repository.save(userCabinet);
  }

  /**
   * Set a cabinet as primary for a user
   *
   * CRITICAL: Always filtered by organizationId
   * Automatically unsets other primary cabinets for the same user
   *
   * Edge cases:
   * - Throws NotFoundError if relationship not found
   * - Automatically unsets isPrimary on other cabinets for same user
   * - Validates relationship belongs to organization
   * - Transaction ensures atomicity (both unset old primary and set new primary)
   *
   * Business rules:
   * - Only one primary cabinet per user
   * - Setting primary automatically unsets previous primary
   *
   * @param userId - User ID
   * @param cabinetId - Cabinet ID to set as primary
   * @param organizationId - Organization ID for tenant scoping
   * @throws {NotFoundError} If relationship not found
   */
  async setPrimary(userId: UUID, cabinetId: UUID, organizationId: OrganizationId): Promise<void> {
    // Verify relationship exists
    const relationship = await this.findOne(userId, cabinetId, organizationId);
    if (!relationship) {
      throw new NotFoundError('User-cabinet relationship not found in organization', {
        resourceType: 'user_cabinet',
        resourceId: `${userId}:${cabinetId}`,
      });
    }

    // Use transaction to ensure atomicity
    await this.repository.manager.transaction(async (manager) => {
      // Unset isPrimary on all other cabinets for this user
      await manager.update(
        UserCabinet,
        {
          userId,
          organizationId,
          deletedAt: IsNull(),
        },
        {
          isPrimary: false,
        }
      );

      // Set isPrimary on the specified cabinet
      await manager.update(
        UserCabinet,
        {
          userId,
          cabinetId,
          organizationId,
          deletedAt: IsNull(),
        },
        {
          isPrimary: true,
        }
      );
    });
  }

  /**
   * Deactivate user-cabinet relationship
   *
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Throws NotFoundError if relationship not found
   * - Sets isActive to false (does not delete)
   * - If deactivating primary cabinet, caller should promote another cabinet
   * - Preserves relationship for audit trail
   *
   * @param userId - User ID
   * @param cabinetId - Cabinet ID
   * @param organizationId - Organization ID for tenant scoping
   * @throws {NotFoundError} If relationship not found
   */
  async deactivate(userId: UUID, cabinetId: UUID, organizationId: OrganizationId): Promise<void> {
    const result = await this.repository.update(
      {
        userId,
        cabinetId,
        organizationId,
        deletedAt: IsNull(),
      },
      {
        isActive: false,
      }
    );

    if (result.affected === 0) {
      throw new NotFoundError('User-cabinet relationship not found in organization', {
        resourceType: 'user_cabinet',
        resourceId: `${userId}:${cabinetId}`,
      });
    }
  }

  /**
   * Reactivate user-cabinet relationship
   *
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Throws NotFoundError if relationship not found
   * - Sets isActive to true
   * - Does not automatically set as primary
   *
   * @param userId - User ID
   * @param cabinetId - Cabinet ID
   * @param organizationId - Organization ID for tenant scoping
   * @throws {NotFoundError} If relationship not found
   */
  async reactivate(userId: UUID, cabinetId: UUID, organizationId: OrganizationId): Promise<void> {
    const result = await this.repository.update(
      {
        userId,
        cabinetId,
        organizationId,
        deletedAt: IsNull(),
      },
      {
        isActive: true,
      }
    );

    if (result.affected === 0) {
      throw new NotFoundError('User-cabinet relationship not found in organization', {
        resourceType: 'user_cabinet',
        resourceId: `${userId}:${cabinetId}`,
      });
    }
  }

  /**
   * Soft delete user-cabinet relationship
   *
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Uses TypeORM soft delete (sets deletedAt timestamp)
   * - Throws NotFoundError if relationship not found or already deleted
   * - If deleting primary cabinet, caller should promote another cabinet
   * - Preserves relationship for audit trail
   *
   * Soft delete vs deactivate:
   * - Soft delete: Permanent removal (can be restored via deletedAt = NULL)
   * - Deactivate: Temporary suspension (isActive = false)
   *
   * @param userId - User ID
   * @param cabinetId - Cabinet ID
   * @param organizationId - Organization ID for tenant scoping
   * @throws {NotFoundError} If relationship not found
   */
  async softDelete(userId: UUID, cabinetId: UUID, organizationId: OrganizationId): Promise<void> {
    const result = await this.repository.softDelete({
      userId,
      cabinetId,
      organizationId,
    });

    if (result.affected === 0) {
      throw new NotFoundError('User-cabinet relationship not found in organization', {
        resourceType: 'user_cabinet',
        resourceId: `${userId}:${cabinetId}`,
      });
    }
  }

  /**
   * Count active cabinets for a user
   *
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Only counts active, non-deleted assignments
   * - Returns 0 if user has no cabinet assignments
   * - Useful for determining if user needs a primary cabinet set
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant scoping
   * @returns Count of active cabinets
   */
  async countActiveCabinets(userId: UUID, organizationId: OrganizationId): Promise<number> {
    return this.repository.count({
      where: {
        userId,
        organizationId,
        isActive: true,
        deletedAt: IsNull(),
      },
    });
  }
}
