/**
 * User Management Service
 *
 * Handles user-related operations: fetching user data, updating user profiles,
 * and managing user metadata.
 *
 * Responsibilities:
 * - Get current user information
 * - Update last login timestamp
 * - Get user profile data
 * - Map user entities to DTOs
 *
 * Security:
 * - Never exposes password hashes
 * - Enforces tenant isolation
 * - Validates user existence and status
 *
 * @module modules/auth/services
 */

import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../users/repositories/user.repository';
import { StructuredLogger } from '@dentalos/shared-infra';
import { UserDto } from '../dto';
import { User } from '../../users/entities/user.entity';
import { AuthenticationError } from '@dentalos/shared-errors';
import type { UUID, OrganizationId } from '@dentalos/shared-types';

/**
 * User Management Service
 * Handles user data operations
 */
@Injectable()
export class UserManagementService {
  private readonly logger: StructuredLogger;

  constructor(private readonly userRepository: UserRepository) {
    this.logger = new StructuredLogger('UserManagementService');
  }

  /**
   * Get current user information
   *
   * Used by /auth/me endpoint to retrieve authenticated user data.
   * Requires valid JWT token (validated by JwtAuthGuard).
   *
   * @param userId - User ID extracted from JWT token
   * @param organizationId - Organization ID extracted from JWT token
   * @returns UserDto with user information
   * @throws {AuthenticationError} If user not found
   */
  async getCurrentUser(userId: UUID, organizationId: OrganizationId): Promise<UserDto> {
    const user = await this.userRepository.findById(userId, organizationId);

    if (!user) {
      this.logger.warn(
        `Current user not found: userId=${userId}, organizationId=${organizationId}`
      );
      throw new AuthenticationError('User not found', {
        reason: 'invalid_credentials',
      });
    }

    return this.mapUserToDto(user);
  }

  /**
   * Get user by ID
   *
   * Fetches user entity by ID and organization.
   * Used internally by other services.
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant scoping
   * @returns User entity or null if not found
   */
  async getUserById(userId: UUID, organizationId: OrganizationId): Promise<User | null> {
    return this.userRepository.findById(userId, organizationId);
  }

  /**
   * Update last login timestamp
   *
   * Updates the lastLoginAt field for the user.
   * Non-blocking - failures are logged but don't block authentication.
   *
   * @param userId - User ID
   * @param organizationId - Organization ID
   */
  async updateLastLogin(userId: string, organizationId: OrganizationId): Promise<void> {
    try {
      await this.userRepository.updateLastLogin(userId, organizationId);
      this.logger.log(`Last login updated for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to update last login for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      // Don't throw - this is a non-critical operation
    }
  }

  /**
   * Get user profile
   *
   * Fetches complete user profile with additional metadata.
   * Future: May include preferences, settings, etc.
   *
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @returns User profile DTO
   * @throws {AuthenticationError} If user not found
   */
  async getUserProfile(userId: UUID, organizationId: OrganizationId): Promise<UserDto> {
    const user = await this.userRepository.findById(userId, organizationId);

    if (!user) {
      this.logger.warn(
        `User profile not found: userId=${userId}, organizationId=${organizationId}`
      );
      throw new AuthenticationError('User not found', {
        reason: 'invalid_credentials',
      });
    }

    return this.mapUserToDto(user);
  }

  /**
   * Map User entity to DTO
   *
   * Transforms database entity to API response format.
   * Excludes passwordHash and internal metadata.
   *
   * @param user - User entity from database
   * @returns UserDto for API response
   */
  mapUserToDto(user: User): UserDto {
    return {
      id: user.id as UUID,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
      roles: user.roles,
      permissions: user.permissions,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }
}
