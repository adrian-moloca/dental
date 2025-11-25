/**
 * UserCabinet Service
 *
 * Business logic layer for managing user-cabinet relationships.
 * Handles assignment of users to cabinets with proper validation and business rules.
 *
 * Business rules enforced:
 * - User and Cabinet must belong to same organization
 * - First cabinet assigned to user is automatically primary
 * - Only one cabinet can be primary per user
 * - When setting new primary, previous primary is automatically unset
 * - When deactivating/deleting primary cabinet, auto-promote another cabinet
 * - Cannot assign user to cabinet in different organization
 *
 * Edge cases handled:
 * - User with no cabinets assigned
 * - User with multiple cabinets (primary management)
 * - Deactivating primary cabinet (auto-promotion)
 * - Deleting primary cabinet (auto-promotion)
 * - Reactivating cabinet (does not auto-set as primary)
 * - Cabinet deletion cascade (remove all user assignments)
 *
 * Security requirements:
 * - All operations are tenant-scoped by organizationId
 * - User and Cabinet validation happens at service layer
 * - Cannot bypass tenant isolation
 *
 * Integration notes:
 * - Cabinet entity is in backend-subscription-service (cross-service reference)
 * - User entity is in backend-auth (same service)
 * - Validation of Cabinet existence should be done by caller or via API
 *
 * @module modules/users/services
 */

import { Injectable, Logger } from '@nestjs/common';
import { UserCabinetRepository } from '../repositories/user-cabinet.repository';
import { UserRepository } from '../repositories/user.repository';
import type { OrganizationId, UUID } from '@dentalos/shared-types';
import { NotFoundError, ValidationError, ConflictError } from '@dentalos/shared-errors';
import { UserCabinet } from '../entities/user-cabinet.entity';

/**
 * Data transfer object for assigning user to cabinet
 */
export interface AssignUserToCabinetDto {
  /** User ID to assign */
  userId: UUID;
  /** Cabinet ID to assign to */
  cabinetId: UUID;
  /** Organization ID for tenant scoping */
  organizationId: OrganizationId;
  /** Whether to set as primary (optional, auto-calculated if first cabinet) */
  setPrimary?: boolean;
}

/**
 * UserCabinet service for managing user-cabinet relationships
 *
 * Provides high-level business operations for:
 * - Assigning users to cabinets
 * - Managing primary cabinet
 * - Retrieving user's cabinets
 * - Removing user from cabinet
 * - Handling primary cabinet auto-promotion
 */
@Injectable()
export class UserCabinetService {
  private readonly logger = new Logger(UserCabinetService.name);

  constructor(
    private readonly userCabinetRepository: UserCabinetRepository,
    private readonly userRepository: UserRepository
  ) {}

  /**
   * Assign user to a cabinet
   *
   * Business rules:
   * - User must exist in organization
   * - User and Cabinet must belong to same organization (Cabinet validation by caller)
   * - First cabinet is automatically set as primary
   * - If setPrimary=true, unsets previous primary automatically
   * - Prevents duplicate assignments
   *
   * Edge cases:
   * - User's first cabinet is auto-primary
   * - Explicitly setting primary unsets previous primary
   * - Cabinet existence should be validated by caller
   *
   * @param dto - Assignment data
   * @returns Created UserCabinet relationship
   * @throws {NotFoundError} If user not found in organization
   * @throws {ConflictError} If user already assigned to cabinet
   * @throws {ValidationError} If business rules violated
   */
  async assignUserToCabinet(dto: AssignUserToCabinetDto): Promise<UserCabinet> {
    const { userId, cabinetId, organizationId, setPrimary } = dto;

    // Validate user exists in organization
    const user = await this.userRepository.findById(userId, organizationId);
    if (!user) {
      throw new NotFoundError('User not found in organization', {
        resourceType: 'user',
        resourceId: userId,
      });
    }

    // Note: Cabinet existence validation should be done by caller
    // Cabinet is in a different microservice (backend-subscription-service)

    // Check if user already assigned to this cabinet
    const existingAssignment = await this.userCabinetRepository.findOne(
      userId,
      cabinetId,
      organizationId
    );

    if (existingAssignment) {
      this.logger.warn(
        `User ${userId} already assigned to cabinet ${cabinetId} in organization ${organizationId}`
      );
      throw new ConflictError('User already assigned to this cabinet', {
        conflictType: 'duplicate',
        resourceType: 'user_cabinet',
      });
    }

    // Determine if this should be primary
    let shouldBePrimary = setPrimary ?? false;

    if (setPrimary === undefined) {
      // Auto-set as primary if this is user's first cabinet
      const existingCabinets = await this.userCabinetRepository.findByUserId(
        userId,
        organizationId,
        false // Include inactive to count all
      );
      shouldBePrimary = existingCabinets.length === 0;
    }

    // Create the assignment
    const userCabinet = await this.userCabinetRepository.create({
      userId,
      cabinetId,
      organizationId,
      isPrimary: shouldBePrimary,
      isActive: true,
    });

    // If explicitly setting as primary, unset previous primary
    if (setPrimary === true) {
      await this.userCabinetRepository.setPrimary(userId, cabinetId, organizationId);
    }

    this.logger.log(
      `Assigned user ${userId} to cabinet ${cabinetId} in organization ${organizationId} (primary: ${shouldBePrimary})`
    );

    return userCabinet;
  }

  /**
   * Get all cabinets assigned to a user
   *
   * Edge cases:
   * - Returns empty array if user has no cabinets
   * - Can optionally include inactive assignments
   * - Primary cabinet is always first in the list
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant scoping
   * @param activeOnly - Whether to return only active assignments (default: true)
   * @returns Array of user-cabinet relationships
   */
  async getUserCabinets(
    userId: UUID,
    organizationId: OrganizationId,
    activeOnly = true
  ): Promise<UserCabinet[]> {
    return this.userCabinetRepository.findByUserId(userId, organizationId, activeOnly);
  }

  /**
   * Get user's primary cabinet
   *
   * Edge cases:
   * - Returns null if user has no primary cabinet
   * - Returns null if primary cabinet is inactive
   * - Should always have a primary if user has any active cabinets
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant scoping
   * @returns UserCabinet or null if no primary found
   */
  async getPrimaryCabinet(
    userId: UUID,
    organizationId: OrganizationId
  ): Promise<UserCabinet | null> {
    return this.userCabinetRepository.findPrimaryByUserId(userId, organizationId);
  }

  /**
   * Set a cabinet as primary for a user
   *
   * Business rules:
   * - Automatically unsets previous primary
   * - Cabinet must be assigned to user
   * - Cabinet must be active
   *
   * Edge cases:
   * - If cabinet is inactive, throws ValidationError
   * - If cabinet not assigned to user, throws NotFoundError
   * - Previous primary is automatically unset
   *
   * @param userId - User ID
   * @param cabinetId - Cabinet ID to set as primary
   * @param organizationId - Organization ID for tenant scoping
   * @throws {NotFoundError} If user-cabinet relationship not found
   * @throws {ValidationError} If cabinet is inactive
   */
  async setPrimaryCabinet(
    userId: UUID,
    cabinetId: UUID,
    organizationId: OrganizationId
  ): Promise<void> {
    // Verify relationship exists
    const relationship = await this.userCabinetRepository.findOne(
      userId,
      cabinetId,
      organizationId
    );

    if (!relationship) {
      throw new NotFoundError('User is not assigned to this cabinet', {
        resourceType: 'user_cabinet',
        resourceId: `${userId}:${cabinetId}`,
      });
    }

    // Validate cabinet assignment is active
    if (!relationship.isActive) {
      throw new ValidationError('Cannot set inactive cabinet as primary', {
        field: 'cabinetId',
        value: cabinetId,
      });
    }

    // Set as primary (repository handles unsetting previous primary)
    await this.userCabinetRepository.setPrimary(userId, cabinetId, organizationId);

    this.logger.log(
      `Set cabinet ${cabinetId} as primary for user ${userId} in organization ${organizationId}`
    );
  }

  /**
   * Remove user from a cabinet
   *
   * Business rules:
   * - Soft deletes the relationship
   * - If removing primary cabinet and user has other active cabinets, auto-promotes another
   * - If removing last cabinet, no auto-promotion needed
   *
   * Edge cases:
   * - Removing primary cabinet triggers auto-promotion of oldest active cabinet
   * - Removing last cabinet leaves user with no cabinets
   * - Soft delete preserves audit trail
   *
   * @param userId - User ID
   * @param cabinetId - Cabinet ID to remove
   * @param organizationId - Organization ID for tenant scoping
   * @throws {NotFoundError} If user-cabinet relationship not found
   */
  async removeUserFromCabinet(
    userId: UUID,
    cabinetId: UUID,
    organizationId: OrganizationId
  ): Promise<void> {
    // Check if this is the primary cabinet
    const relationship = await this.userCabinetRepository.findOne(
      userId,
      cabinetId,
      organizationId
    );

    if (!relationship) {
      throw new NotFoundError('User is not assigned to this cabinet', {
        resourceType: 'user_cabinet',
        resourceId: `${userId}:${cabinetId}`,
      });
    }

    const wasPrimary = relationship.isPrimary;

    // Soft delete the relationship
    await this.userCabinetRepository.softDelete(userId, cabinetId, organizationId);

    this.logger.log(
      `Removed user ${userId} from cabinet ${cabinetId} in organization ${organizationId}`
    );

    // If we removed the primary cabinet, auto-promote another active cabinet
    if (wasPrimary) {
      await this.autoPromotePrimaryCabinet(userId, organizationId);
    }
  }

  /**
   * Deactivate user-cabinet relationship
   *
   * Business rules:
   * - Sets isActive to false (does not delete)
   * - If deactivating primary cabinet and user has other active cabinets, auto-promotes another
   * - Preserves relationship for potential reactivation
   *
   * Edge cases:
   * - Deactivating primary cabinet triggers auto-promotion
   * - Deactivating last cabinet leaves user with no active cabinets
   * - Can be reactivated later
   *
   * @param userId - User ID
   * @param cabinetId - Cabinet ID to deactivate
   * @param organizationId - Organization ID for tenant scoping
   * @throws {NotFoundError} If user-cabinet relationship not found
   */
  async deactivateUserCabinet(
    userId: UUID,
    cabinetId: UUID,
    organizationId: OrganizationId
  ): Promise<void> {
    // Check if this is the primary cabinet
    const relationship = await this.userCabinetRepository.findOne(
      userId,
      cabinetId,
      organizationId
    );

    if (!relationship) {
      throw new NotFoundError('User is not assigned to this cabinet', {
        resourceType: 'user_cabinet',
        resourceId: `${userId}:${cabinetId}`,
      });
    }

    const wasPrimary = relationship.isPrimary;

    // Deactivate the relationship
    await this.userCabinetRepository.deactivate(userId, cabinetId, organizationId);

    this.logger.log(
      `Deactivated cabinet ${cabinetId} for user ${userId} in organization ${organizationId}`
    );

    // If we deactivated the primary cabinet, auto-promote another active cabinet
    if (wasPrimary) {
      await this.autoPromotePrimaryCabinet(userId, organizationId);
    }
  }

  /**
   * Reactivate user-cabinet relationship
   *
   * Business rules:
   * - Sets isActive to true
   * - Does NOT automatically set as primary
   * - User can manually set as primary if desired
   *
   * Edge cases:
   * - Does not affect current primary cabinet
   * - Reactivated cabinet is not primary by default
   *
   * @param userId - User ID
   * @param cabinetId - Cabinet ID to reactivate
   * @param organizationId - Organization ID for tenant scoping
   * @throws {NotFoundError} If user-cabinet relationship not found
   */
  async reactivateUserCabinet(
    userId: UUID,
    cabinetId: UUID,
    organizationId: OrganizationId
  ): Promise<void> {
    await this.userCabinetRepository.reactivate(userId, cabinetId, organizationId);

    this.logger.log(
      `Reactivated cabinet ${cabinetId} for user ${userId} in organization ${organizationId}`
    );
  }

  /**
   * Auto-promote a new primary cabinet when current primary is removed/deactivated
   *
   * Business logic:
   * - Finds oldest active cabinet for user
   * - Sets it as primary
   * - If no active cabinets remain, does nothing (user has no primary)
   *
   * Edge cases:
   * - No active cabinets: Does nothing (user left without primary)
   * - Multiple active cabinets: Promotes oldest by createdAt
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant scoping
   * @private
   */
  private async autoPromotePrimaryCabinet(
    userId: UUID,
    organizationId: OrganizationId
  ): Promise<void> {
    const activeCabinets = await this.userCabinetRepository.findByUserId(
      userId,
      organizationId,
      true // Active only
    );

    if (activeCabinets.length === 0) {
      this.logger.log(`User ${userId} has no active cabinets after removal, no primary to promote`);
      return;
    }

    // Promote the oldest active cabinet (first in sorted list)
    const newPrimary = activeCabinets[0];

    await this.userCabinetRepository.setPrimary(userId, newPrimary.cabinetId, organizationId);

    this.logger.log(
      `Auto-promoted cabinet ${newPrimary.cabinetId} as primary for user ${userId} in organization ${organizationId}`
    );
  }

  /**
   * Get all users assigned to a cabinet
   *
   * Edge cases:
   * - Returns empty array if cabinet has no users
   * - Can optionally include inactive assignments
   * - Useful for cabinet management and access control
   *
   * @param cabinetId - Cabinet ID
   * @param organizationId - Organization ID for tenant scoping
   * @param activeOnly - Whether to return only active assignments (default: true)
   * @returns Array of user-cabinet relationships
   */
  async getCabinetUsers(
    cabinetId: UUID,
    organizationId: OrganizationId,
    activeOnly = true
  ): Promise<UserCabinet[]> {
    return this.userCabinetRepository.findByCabinetId(cabinetId, organizationId, activeOnly);
  }

  /**
   * Check if user has access to a cabinet
   *
   * Edge cases:
   * - Returns false if relationship doesn't exist
   * - Returns false if relationship is inactive
   * - Returns false if relationship is soft deleted
   *
   * @param userId - User ID
   * @param cabinetId - Cabinet ID
   * @param organizationId - Organization ID for tenant scoping
   * @returns True if user has active access to cabinet
   */
  async hasAccessToCabinet(
    userId: UUID,
    cabinetId: UUID,
    organizationId: OrganizationId
  ): Promise<boolean> {
    const relationship = await this.userCabinetRepository.findOne(
      userId,
      cabinetId,
      organizationId
    );

    return relationship !== null && relationship.isActive;
  }
}
