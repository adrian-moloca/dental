/**
 * Cabinet Assignment Service
 *
 * Handles automatic cabinet assignment during user registration and login.
 * Provides idempotent operations for creating default cabinets and assigning users.
 *
 * Responsibilities:
 * - Auto-assign users to default cabinet during registration
 * - Create default cabinet if none exists
 * - Handle cabinet assignment failures gracefully
 * - Ensure idempotent operations
 *
 * Integration points:
 * - SubscriptionClientService: Create and fetch cabinets
 * - UserCabinetRepository: Manage user-cabinet relationships
 * - UserRepository: Validate users
 *
 * Error handling:
 * - Graceful degradation if subscription service unavailable
 * - Allows user creation even if cabinet assignment fails
 * - Comprehensive logging for manual follow-up
 * - Idempotent operations (safe to retry)
 *
 * Security:
 * - All operations tenant-scoped by organizationId
 * - Validates user and cabinet belong to same organization
 * - No cross-tenant data leakage
 *
 * @module modules/users/services
 */

import { Injectable } from '@nestjs/common';
import { StructuredLogger } from '@dentalos/shared-infra';
import { UserCabinetRepository } from '../repositories/user-cabinet.repository';
import { UserRepository } from '../repositories/user.repository';
import { SubscriptionClientService } from '../../auth/services/subscription-client.service';
import type { UUID, OrganizationId } from '@dentalos/shared-types';
import { ConflictError, InfrastructureError } from '@dentalos/shared-errors';
import { EntityStatus } from '@dentalos/shared-types';

/**
 * Default cabinet configuration
 */
const DEFAULT_CABINET_CONFIG = {
  name: 'Main Cabinet',
  code: 'MAIN',
  isDefault: true,
  status: EntityStatus.ACTIVE,
};

/**
 * Result of cabinet assignment operation
 */
export interface CabinetAssignmentResult {
  /** Whether assignment was successful */
  success: boolean;
  /** Cabinet ID if assigned */
  cabinetId?: UUID;
  /** Whether cabinet was newly created */
  created: boolean;
  /** Error message if assignment failed */
  error?: string;
}

/**
 * Cabinet Assignment Service
 *
 * Orchestrates automatic cabinet assignment during user registration.
 * Implements graceful degradation if cabinet creation/assignment fails.
 */
@Injectable()
export class CabinetAssignmentService {
  private readonly logger: StructuredLogger;

  constructor(
    private readonly userCabinetRepository: UserCabinetRepository,
    private readonly userRepository: UserRepository,
    private readonly subscriptionClient: SubscriptionClientService
  ) {
    this.logger = new StructuredLogger('CabinetAssignmentService');
  }

  /**
   * Auto-assign cabinet during user registration
   *
   * Logic:
   * 1. Check if user already has cabinet assignments
   * 2. If no assignments, get or create default cabinet
   * 3. Assign user to default cabinet as primary
   * 4. Return result with success status
   *
   * Graceful degradation:
   * - If subscription service is down, returns failure but doesn't throw
   * - If cabinet creation fails, returns failure but doesn't throw
   * - If assignment already exists, returns success (idempotent)
   * - Logs all failures for manual follow-up
   *
   * Edge cases:
   * - User already has cabinets → skip assignment
   * - Default cabinet exists → use existing
   * - No cabinets exist → create default first
   * - Concurrent registrations → handle duplicate assignment gracefully
   *
   * @param userId - User ID to assign cabinet
   * @param organizationId - Organization ID for tenant scoping
   * @returns CabinetAssignmentResult with success status and cabinet ID
   */
  async autoAssignCabinetOnRegistration(
    userId: UUID,
    organizationId: OrganizationId
  ): Promise<CabinetAssignmentResult> {
    const startTime = Date.now();
    const correlationId = this.logger.ensureCorrelationId();

    this.logger.setContext({
      correlationId,
      organizationId,
      userId: this.hashId(userId),
      operation: 'autoAssignCabinetOnRegistration',
    });

    this.logger.log('Starting automatic cabinet assignment for new user');

    try {
      // 1. Check if user already has cabinet assignments (idempotency check)
      const existingCabinets = await this.userCabinetRepository.findByUserId(
        userId,
        organizationId,
        false // Include inactive to check all assignments
      );

      if (existingCabinets.length > 0) {
        this.logger.log('User already has cabinet assignments, skipping auto-assignment', {
          existingCount: existingCabinets.length,
          duration_ms: Date.now() - startTime,
        });
        return {
          success: true,
          cabinetId: existingCabinets[0].cabinetId,
          created: false,
        };
      }

      // 2. Get or create default cabinet
      const cabinetResult = await this.getOrCreateDefaultCabinet(organizationId);

      if (!cabinetResult.success || !cabinetResult.cabinetId) {
        const duration = Date.now() - startTime;
        this.logger.warn('Failed to get or create default cabinet', {
          error: cabinetResult.error,
          duration_ms: duration,
        });
        return cabinetResult;
      }

      // 3. Assign user to default cabinet
      const assignmentResult = await this.assignUserToDefaultCabinet(
        userId,
        cabinetResult.cabinetId,
        organizationId
      );

      const duration = Date.now() - startTime;

      if (assignmentResult.success) {
        this.logger.log('User successfully assigned to default cabinet', {
          cabinetId: this.hashId(cabinetResult.cabinetId),
          created: cabinetResult.created,
          duration_ms: duration,
        });
      } else {
        this.logger.warn('Failed to assign user to default cabinet', {
          cabinetId: this.hashId(cabinetResult.cabinetId),
          error: assignmentResult.error,
          duration_ms: duration,
        });
      }

      return {
        success: assignmentResult.success,
        cabinetId: cabinetResult.cabinetId,
        created: cabinetResult.created,
        error: assignmentResult.error,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.logger.error('Unexpected error during automatic cabinet assignment', error as Error, {
        duration_ms: duration,
      });

      return {
        success: false,
        created: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get or create default cabinet for organization
   *
   * Idempotent operation:
   * - If default cabinet exists, returns existing cabinet ID
   * - If no default exists, creates new default cabinet
   * - If creation fails, returns error without throwing
   *
   * Edge cases:
   * - Multiple default cabinets → uses first found
   * - Subscription service unavailable → returns error
   * - Network timeout → returns error
   * - Cabinet creation fails → returns error
   *
   * @param organizationId - Organization ID
   * @returns CabinetAssignmentResult with cabinet ID or error
   */
  async getOrCreateDefaultCabinet(
    organizationId: OrganizationId
  ): Promise<CabinetAssignmentResult> {
    this.logger.log('Getting or creating default cabinet for organization');

    try {
      // Try to fetch existing default cabinet
      const existingCabinet = await this.subscriptionClient.getDefaultCabinet(organizationId);

      if (existingCabinet) {
        this.logger.log('Default cabinet already exists', {
          cabinetId: this.hashId(existingCabinet.id),
        });
        return {
          success: true,
          cabinetId: existingCabinet.id,
          created: false,
        };
      }

      // No default cabinet found, create one
      this.logger.log('No default cabinet found, creating new one');

      const newCabinet = await this.createDefaultCabinet(organizationId);

      this.logger.log('Default cabinet created successfully', {
        cabinetId: this.hashId(newCabinet.id),
      });

      return {
        success: true,
        cabinetId: newCabinet.id,
        created: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (error instanceof InfrastructureError) {
        this.logger.warn('Subscription service unavailable, cannot create default cabinet', {
          error: errorMessage,
        });
      } else {
        this.logger.error('Failed to get or create default cabinet', error as Error);
      }

      return {
        success: false,
        created: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Create default cabinet via subscription service
   *
   * Calls subscription service to create a new cabinet with default configuration.
   *
   * Edge cases:
   * - Subscription service unavailable → throws InfrastructureError
   * - Cabinet already exists → subscription service handles duplicate
   * - Network timeout → throws InfrastructureError
   *
   * @param organizationId - Organization ID
   * @returns Created cabinet summary
   * @throws {InfrastructureError} If subscription service is unavailable
   * @private
   */
  private async createDefaultCabinet(organizationId: OrganizationId) {
    this.logger.log('Creating default cabinet via subscription service');

    return await this.subscriptionClient.createCabinet({
      organizationId,
      name: DEFAULT_CABINET_CONFIG.name,
      code: DEFAULT_CABINET_CONFIG.code,
      isDefault: DEFAULT_CABINET_CONFIG.isDefault,
      status: DEFAULT_CABINET_CONFIG.status,
    });
  }

  /**
   * Assign user to default cabinet
   *
   * Creates UserCabinet relationship with proper validation.
   *
   * Idempotent operation:
   * - If assignment already exists, returns success (no error)
   * - If user not found, returns error
   * - Creates assignment as primary and active
   *
   * Edge cases:
   * - User not found → returns error
   * - Assignment already exists → returns success (idempotent)
   * - Concurrent assignments → database constraint prevents duplicates
   *
   * @param userId - User ID
   * @param cabinetId - Cabinet ID
   * @param organizationId - Organization ID for tenant scoping
   * @returns CabinetAssignmentResult with success status
   */
  async assignUserToDefaultCabinet(
    userId: UUID,
    cabinetId: UUID,
    organizationId: OrganizationId
  ): Promise<CabinetAssignmentResult> {
    this.logger.log('Assigning user to default cabinet', {
      cabinetId: this.hashId(cabinetId),
    });

    try {
      // Validate user exists in organization
      const user = await this.userRepository.findById(userId, organizationId);
      if (!user) {
        this.logger.warn('User not found in organization, cannot assign cabinet');
        return {
          success: false,
          created: false,
          error: 'User not found in organization',
        };
      }

      // Check if assignment already exists (idempotency)
      const existingAssignment = await this.userCabinetRepository.findOne(
        userId,
        cabinetId,
        organizationId
      );

      if (existingAssignment) {
        this.logger.log('User already assigned to cabinet, skipping duplicate assignment');
        return {
          success: true,
          cabinetId,
          created: false,
        };
      }

      // Create user-cabinet assignment
      await this.userCabinetRepository.create({
        userId,
        cabinetId,
        organizationId,
        isPrimary: true, // First cabinet is primary
        isActive: true,
      });

      this.logger.log('User assigned to cabinet successfully');

      return {
        success: true,
        cabinetId,
        created: false,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Handle ConflictError (duplicate assignment) as success (idempotent)
      if (error instanceof ConflictError) {
        this.logger.log('User already assigned to cabinet (conflict caught)');
        return {
          success: true,
          cabinetId,
          created: false,
        };
      }

      this.logger.error('Failed to assign user to cabinet', error as Error);

      return {
        success: false,
        created: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Hash ID for logging (PHI protection)
   * Never log raw UUIDs as they may be considered PHI
   */
  private hashId(id: string): string {
    return id.substring(0, 8) + '...';
  }
}
