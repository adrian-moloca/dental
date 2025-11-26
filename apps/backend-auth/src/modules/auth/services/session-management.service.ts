/**
 * Session Management Service
 *
 * Handles session lifecycle operations: creation, validation, rotation,
 * invalidation, and listing of active sessions.
 *
 * Responsibilities:
 * - Create sessions in Redis with device metadata
 * - Validate session ownership and refresh tokens
 * - Rotate sessions during token refresh
 * - Invalidate sessions on logout
 * - List active sessions for users
 * - Revoke specific sessions
 *
 * Security:
 * - Session-bound refresh tokens
 * - Device metadata tracking
 * - Session rotation on token refresh
 * - Ownership validation prevents cross-user operations
 *
 * @module modules/auth/services
 */

import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { SessionService } from '../../sessions/services/session.service';
import { StructuredLogger } from '@dentalos/shared-infra';
import { SessionDto } from '../dto';
import { Session } from '../../sessions/entities/session.entity';
import { extractDeviceMetadata } from '../../sessions/utils/device-metadata.util';
import { NotFoundError } from '@dentalos/shared-errors';
import type { UUID, OrganizationId } from '@dentalos/shared-types';

/**
 * Session Management Service
 * Orchestrates session operations with SessionService
 */
@Injectable()
export class SessionManagementService {
  private readonly logger: StructuredLogger;

  constructor(private readonly sessionService: SessionService) {
    this.logger = new StructuredLogger('SessionManagementService');
  }

  /**
   * Create session with device metadata
   *
   * Creates a new session in Redis with device information extracted
   * from the HTTP request.
   *
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @param clinicId - Optional clinic ID
   * @param refreshToken - Refresh token to bind to session
   * @param request - HTTP request for device metadata
   * @returns Created session entity
   */
  async createSession(
    userId: UUID,
    organizationId: OrganizationId,
    clinicId: string | undefined,
    refreshToken: string,
    request: Request
  ): Promise<Session> {
    return this.sessionService.createSession({
      userId,
      organizationId,
      clinicId: clinicId as any,
      refreshToken,
      request,
    });
  }

  /**
   * Validate refresh token and get session
   *
   * Validates the provided refresh token and returns the associated session.
   * Verifies session is active and not expired.
   *
   * @param refreshToken - JWT refresh token
   * @param organizationId - Organization ID for tenant scoping
   * @returns Session entity if valid
   * @throws {AuthenticationError} If token invalid or session not found
   */
  async validateRefreshToken(
    refreshToken: string,
    organizationId: OrganizationId
  ): Promise<Session> {
    return this.sessionService.validateRefreshToken(refreshToken, organizationId);
  }

  /**
   * Rotate session during token refresh
   *
   * Creates a new session and invalidates the old one.
   * Implements token rotation for enhanced security.
   *
   * @param oldSessionId - Current session ID to invalidate
   * @param organizationId - Organization ID
   * @param newRefreshToken - New refresh token for new session
   * @param deviceMetadata - Device metadata from request
   * @returns New session entity
   */
  async rotateSession(
    oldSessionId: string,
    organizationId: OrganizationId,
    newRefreshToken: string,
    deviceMetadata: any
  ): Promise<Session> {
    return this.sessionService.rotateSession(
      oldSessionId as any,
      organizationId,
      newRefreshToken,
      deviceMetadata
    );
  }

  /**
   * Invalidate session
   *
   * Marks session as revoked in Redis with a reason.
   * Used for logout, cabinet switching, or security events.
   *
   * @param sessionId - Session ID to invalidate
   * @param organizationId - Organization ID
   * @param reason - Reason for invalidation (e.g., 'user_logout', 'cabinet_switch')
   */
  async invalidateSession(
    sessionId: UUID,
    organizationId: OrganizationId,
    reason: any
  ): Promise<void> {
    try {
      await this.sessionService.invalidateSession(sessionId, organizationId, reason);
      this.logger.log('Session invalidated', {
        sessionId: this.hashId(sessionId),
        reason,
      });
    } catch (error) {
      // Log but don't fail - session might already be invalid
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn('Failed to invalidate session', {
        sessionId: this.hashId(sessionId),
        error: errorMessage,
      });
    }
  }

  /**
   * Validate session ownership
   *
   * Verifies session exists and belongs to the specified user.
   * Prevents cross-user session operations.
   *
   * @param sessionId - Session ID to validate
   * @param userId - User ID claiming ownership
   * @param organizationId - Organization ID for tenant scoping
   * @returns Session entity if ownership valid, null otherwise
   */
  async validateSessionOwnership(
    sessionId: UUID,
    userId: UUID,
    organizationId: OrganizationId
  ): Promise<Session | null> {
    return this.sessionService.validateSessionOwnership(sessionId, userId, organizationId);
  }

  /**
   * List all active sessions for user
   *
   * Retrieves all non-expired, non-revoked sessions for the user.
   * Includes device metadata and activity timestamps.
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant scoping
   * @returns Array of active sessions
   */
  async listActiveSessions(userId: UUID, organizationId: OrganizationId): Promise<Session[]> {
    return this.sessionService.listActiveSessions(userId, organizationId);
  }

  /**
   * Logout current session
   *
   * Validates session ownership and invalidates it.
   * Idempotent - succeeds even if session already invalid.
   *
   * @param sessionId - Session ID to logout
   * @param userId - User ID from JWT
   * @param organizationId - Organization ID
   */
  async logout(sessionId: UUID, userId: UUID, organizationId: OrganizationId): Promise<void> {
    this.logger.log(`Logout attempt for session ${sessionId}`);

    // Validate session ownership
    const session = await this.validateSessionOwnership(sessionId, userId, organizationId);

    if (!session) {
      // Session not found or doesn't belong to user
      // Return success anyway (idempotent)
      this.logger.warn(
        `Logout: Session ${sessionId} not found or doesn't belong to user ${userId}`
      );
      return;
    }

    // Invalidate session
    await this.invalidateSession(sessionId, organizationId, 'user_logout');

    this.logger.log(`Session ${sessionId} invalidated successfully`);
  }

  /**
   * Revoke a specific session
   *
   * Allows user to revoke a session from another device.
   * Validates ownership before revocation.
   *
   * @param sessionId - Session ID to revoke
   * @param userId - User ID from JWT
   * @param organizationId - Organization ID
   * @throws {NotFoundError} If session not found or doesn't belong to user
   */
  async revokeSession(
    sessionId: UUID,
    userId: UUID,
    organizationId: OrganizationId
  ): Promise<void> {
    this.logger.log(`Revoke session attempt for session ${sessionId}`);

    // Validate session ownership
    const session = await this.validateSessionOwnership(sessionId, userId, organizationId);

    if (!session) {
      throw new NotFoundError('Session not found', {
        resourceType: 'session',
        resourceId: sessionId,
      });
    }

    // Invalidate session
    await this.invalidateSession(sessionId, organizationId, 'user_revoked');

    this.logger.log(`Session ${sessionId} revoked successfully`);
  }

  /**
   * List user sessions with DTOs
   *
   * Fetches active sessions and maps them to DTOs with current session marking.
   *
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @param currentSessionId - Optional current session ID to mark as current
   * @returns Array of session DTOs
   */
  async listUserSessions(
    userId: UUID,
    organizationId: OrganizationId,
    currentSessionId?: UUID
  ): Promise<SessionDto[]> {
    const sessions = await this.listActiveSessions(userId, organizationId);

    return sessions.map((session) => this.mapSessionToDto(session, currentSessionId));
  }

  /**
   * Extract device metadata from request
   *
   * Extracts device information (IP, user agent, etc.) from HTTP request.
   *
   * @param request - HTTP request
   * @returns Device metadata object
   */
  extractDeviceMetadata(request: Request): any {
    return extractDeviceMetadata(request);
  }

  /**
   * Update session's refresh token hash
   *
   * After generating the final refresh token with actual sessionId,
   * this method updates the session with the correct token hash.
   * This is necessary because the initial session creation uses a
   * placeholder token, but the final token has the actual sessionId.
   *
   * @param sessionId - Session ID to update
   * @param organizationId - Organization ID for tenant scoping
   * @param refreshToken - The final refresh token to hash and store
   */
  async updateSessionTokenHash(
    sessionId: UUID,
    organizationId: OrganizationId,
    refreshToken: string
  ): Promise<void> {
    await this.sessionService.updateRefreshTokenHash(sessionId, organizationId, refreshToken);
  }

  /**
   * Map Session entity to DTO
   *
   * Transforms session entity to API response format.
   * Excludes refreshTokenHash for security.
   *
   * @param session - Session entity
   * @param currentSessionId - Optional current session ID
   * @returns SessionDto for API response
   * @private
   */
  private mapSessionToDto(session: Session, currentSessionId?: UUID): SessionDto {
    return {
      id: session.id,
      userId: session.userId,
      organizationId: session.organizationId,
      clinicId: session.clinicId,
      deviceInfo: {
        deviceId: session.deviceInfo.deviceId,
        deviceName: session.deviceInfo.deviceName,
        ipAddress: session.deviceInfo.ipAddress,
        userAgent: session.deviceInfo.userAgent,
      },
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      lastActivityAt: session.lastActivityAt,
      isActive: session.isActive(),
      isCurrent: currentSessionId ? session.id === currentSessionId : false,
    };
  }

  /**
   * Hash ID for logging (PHI protection)
   *
   * @param id - ID to hash
   * @returns Hashed ID (first 8 characters)
   * @private
   */
  private hashId(id: string): string {
    return id.substring(0, 8) + '...';
  }
}
