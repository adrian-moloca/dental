/**
 * SessionService - Business logic for session management
 *
 * Responsibilities:
 * - Create sessions with device tracking
 * - Validate refresh tokens against sessions
 * - Rotate sessions (anti-replay protection)
 * - Invalidate sessions (logout, revocation)
 * - Enforce session limits per user
 * - Multi-tenant isolation enforcement
 *
 * Security Features:
 * - Token rotation on every refresh (anti-replay)
 * - Argon2id hash storage (no plaintext tokens)
 * - Session limit enforcement (max 5 per user)
 * - Device fingerprinting for theft detection
 * - Automatic cleanup of expired sessions
 *
 * @module SessionService
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';
import { AuthenticationError } from '@dentalos/shared-errors';
import { SessionRepository } from '../repositories/session.repository';
import { Session, SessionRevocationReason, DeviceInfo } from '../entities/session.entity';
import { extractDeviceMetadata } from '../utils/device-metadata.util';
import { PasswordService } from '../../users/services/password.service';

/**
 * Parameters for creating a new session
 */
export interface CreateSessionParams {
  userId: UUID;
  organizationId: OrganizationId;
  clinicId?: ClinicId;
  refreshToken: string;
  request: Request;
}

/**
 * Session DTO for API responses
 * Excludes sensitive data (token hash)
 */
export interface SessionDto {
  id: UUID;
  userId: UUID;
  organizationId: OrganizationId;
  clinicId?: ClinicId;
  deviceInfo: DeviceInfo;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
  isActive: boolean;
}

/**
 * Session service for managing user sessions
 */
@Injectable()
export class SessionService {
  private readonly maxSessionsPerUser: number;
  private readonly sessionTtlDays: number;

  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService
  ) {
    // Load session configuration
    this.maxSessionsPerUser = this.configService.get('session.maxPerUser', 5);
    this.sessionTtlDays = this.configService.get('session.ttlDays', 7);
  }

  /**
   * Create a new session
   * Enforces session limit, extracts device metadata, hashes token
   *
   * @param params - Session creation parameters
   * @returns Created session
   *
   * Flow:
   * 1. Extract device metadata from request
   * 2. Check active session count for user
   * 3. If limit exceeded → revoke oldest session
   * 4. Hash refresh token (Argon2id)
   * 5. Create session entity
   * 6. Persist to Redis
   *
   * Edge cases:
   * - Session limit exceeded → auto-revokes oldest
   * - Duplicate device → creates new session (devices can have multiple sessions)
   * - Invalid device metadata → defaults to 'Unknown'
   * - Token hashing fails → throws SecurityError
   */
  async createSession(params: CreateSessionParams): Promise<Session> {
    const { userId, organizationId, clinicId, refreshToken, request } = params;

    // Extract device metadata from request
    const deviceMetadata = extractDeviceMetadata(request);

    // Check and enforce session limit
    await this.enforceSessionLimit(userId, organizationId);

    // Hash refresh token for storage
    const refreshTokenHash = await this.passwordService.hashPassword(refreshToken);

    // Calculate expiration date
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.sessionTtlDays * 24 * 60 * 60 * 1000);

    // Create session entity
    const session = new Session({
      id: uuidv4() as UUID,
      userId,
      organizationId,
      clinicId,
      refreshTokenHash,
      deviceInfo: {
        deviceId: deviceMetadata.deviceId,
        deviceName: deviceMetadata.deviceName,
        ipAddress: deviceMetadata.ipAddress,
        userAgent: deviceMetadata.userAgent,
      },
      createdAt: now,
      expiresAt,
      lastActivityAt: now,
    });

    // Persist session
    return this.sessionRepository.create(session);
  }

  /**
   * Validate refresh token against session
   * Checks token hash, expiration, and revocation status
   *
   * @param refreshToken - Plain refresh token (JWT)
   * @param organizationId - Organization for tenant isolation
   * @returns Session if valid
   * @throws AuthenticationError if invalid
   *
   * Validation checks:
   * 1. Decode JWT to extract sessionId
   * 2. Load session by sessionId
   * 3. Session not expired
   * 4. Session not revoked
   * 5. Token hash matches (Argon2id verify)
   *
   * Edge cases:
   * - Invalid JWT format → AuthenticationError
   * - Missing sessionId in payload → AuthenticationError
   * - Session not found → AuthenticationError
   * - Session expired → AuthenticationError (expired_token)
   * - Session revoked → AuthenticationError (revoked_token)
   * - Hash mismatch → AuthenticationError (invalid_token)
   *
   * CRITICAL FIX: Decode JWT to get sessionId first, THEN verify hash.
   * Argon2id generates unique salt per call, so hashing the token twice
   * will NEVER produce the same hash. We must:
   * 1. Decode JWT (no verification needed for sessionId extraction)
   * 2. Load session by sessionId
   * 3. Verify token against stored hash ONCE
   */
  async validateRefreshToken(
    refreshToken: string,
    organizationId: OrganizationId
  ): Promise<Session> {
    // Decode JWT to extract sessionId (no verification needed)
    // JWT format: header.payload.signature
    // We only need the payload to extract sessionId
    let payload: any;
    try {
      const parts = refreshToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      // Decode base64url payload
      const payloadBase64 = parts[1];
      const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
      payload = JSON.parse(payloadJson);
    } catch (error) {
      throw new AuthenticationError('Invalid refresh token format', {
        reason: 'invalid_credentials',
      });
    }

    // Validate payload structure
    if (!payload || typeof payload !== 'object' || !payload.sessionId) {
      throw new AuthenticationError('Invalid refresh token payload', {
        reason: 'invalid_credentials',
      });
    }

    // Load session by sessionId from JWT
    const session = await this.sessionRepository.findById(payload.sessionId, organizationId);

    if (!session) {
      throw new AuthenticationError('Session not found', {
        reason: 'invalid_credentials',
      });
    }

    // Check if session is expired
    if (session.isExpired()) {
      throw new AuthenticationError('Session expired', {
        reason: 'expired_token',
      });
    }

    // Check if session is revoked
    if (session.isRevoked()) {
      throw new AuthenticationError(`Session revoked: ${session.revokedReason}`, {
        reason: 'revoked_token',
      });
    }

    // NOW verify token hash ONCE against stored hash
    // This uses Argon2id's built-in salt verification
    const isValid = await this.passwordService.verifyPassword(
      refreshToken,
      session.refreshTokenHash
    );

    if (!isValid) {
      throw new AuthenticationError('Invalid refresh token', {
        reason: 'invalid_credentials',
      });
    }

    return session;
  }

  /**
   * Rotate session (create new session and revoke old one)
   * Implements single-use refresh token pattern for enhanced security
   *
   * @param oldSessionId - Session identifier to rotate
   * @param organizationId - Organization for tenant isolation
   * @param deviceMetadata - Device information for new session
   * @returns New session with updated token
   *
   * Security flow:
   * 1. Load old session
   * 2. Verify session is active
   * 3. Create new session (will be done in AuthService)
   * 4. Revoke old session (reason: 'token_rotated')
   *
   * Note: This implements token rotation anti-replay protection.
   * Old refresh tokens become immediately invalid after use.
   *
   * Edge cases:
   * - Session not found → AuthenticationError
   * - Session expired → AuthenticationError
   * - Session already revoked → AuthenticationError
   */
  async rotateSession(
    oldSessionId: UUID,
    organizationId: OrganizationId,
    newRefreshToken: string,
    deviceMetadata: DeviceInfo
  ): Promise<Session> {
    // Load old session
    const oldSession = await this.sessionRepository.findById(oldSessionId, organizationId);

    if (!oldSession) {
      throw new AuthenticationError('Session not found', {
        reason: 'invalid_credentials',
      });
    }

    if (!oldSession.isActive()) {
      throw new AuthenticationError('Session is no longer active', {
        reason: oldSession.isExpired() ? 'expired_token' : 'revoked_token',
      });
    }

    // Hash new refresh token
    const refreshTokenHash = await this.passwordService.hashPassword(newRefreshToken);

    // Calculate expiration date
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.sessionTtlDays * 24 * 60 * 60 * 1000);

    // Create new session
    const newSession = new Session({
      id: uuidv4() as UUID,
      userId: oldSession.userId,
      organizationId: oldSession.organizationId,
      clinicId: oldSession.clinicId,
      refreshTokenHash,
      deviceInfo: deviceMetadata,
      createdAt: now,
      expiresAt,
      lastActivityAt: now,
    });

    // Revoke old session BEFORE creating new one (fail-safe)
    await this.invalidateSession(oldSessionId, organizationId, 'token_rotated');

    // Persist new session
    return this.sessionRepository.create(newSession);
  }

  /**
   * Invalidate session (logout)
   * Marks session as revoked with reason
   *
   * @param sessionId - Session identifier
   * @param organizationId - Organization for tenant isolation
   * @param reason - Revocation reason
   *
   * Edge cases:
   * - Session not found → no-op (idempotent)
   * - Session already revoked → updates reason
   */
  async invalidateSession(
    sessionId: UUID,
    organizationId: OrganizationId,
    reason: SessionRevocationReason = 'user_logout'
  ): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId, organizationId);

    if (!session) {
      // Session already deleted or doesn't exist
      return;
    }

    // Mark as revoked
    const revokedSession = session.withRevocation(reason);
    await this.sessionRepository.update(revokedSession);
  }

  /**
   * Invalidate all sessions for a user
   * Used for logout all devices, password reset, security incidents
   *
   * @param userId - User identifier
   * @param organizationId - Organization for tenant isolation
   * @param reason - Revocation reason
   * @returns Number of sessions invalidated
   */
  async invalidateAllUserSessions(
    userId: UUID,
    organizationId: OrganizationId,
    reason: SessionRevocationReason = 'user_logout'
  ): Promise<number> {
    const sessions = await this.sessionRepository.findByUserId(userId, organizationId);

    // Filter active sessions only
    const activeSessions = sessions.filter((s) => s.isActive());

    if (activeSessions.length === 0) {
      return 0;
    }

    // Revoke all active sessions
    await Promise.all(
      activeSessions.map((session) => this.invalidateSession(session.id, organizationId, reason))
    );

    return activeSessions.length;
  }

  /**
   * Get active sessions for a user
   *
   * @param userId - User identifier
   * @param organizationId - Organization for tenant isolation
   * @returns Array of session DTOs
   */
  async getUserActiveSessions(userId: UUID, organizationId: OrganizationId): Promise<SessionDto[]> {
    const sessions = await this.sessionRepository.findByUserId(userId, organizationId);

    // Filter and map to DTOs
    return sessions.filter((session) => session.isActive()).map((session) => this.toDto(session));
  }

  /**
   * List all active sessions for a user (alias for getUserActiveSessions)
   *
   * @param userId - User identifier
   * @param organizationId - Organization for tenant isolation
   * @returns Array of active sessions
   */
  async listActiveSessions(userId: UUID, organizationId: OrganizationId): Promise<Session[]> {
    const sessions = await this.sessionRepository.findByUserId(userId, organizationId);
    return sessions.filter((session) => session.isActive());
  }

  /**
   * Validate that a session belongs to a specific user
   * Prevents cross-user session revocation attacks
   *
   * @param sessionId - Session identifier
   * @param userId - User identifier (from JWT)
   * @param organizationId - Organization for tenant isolation
   * @returns Session if ownership validated, null if not found or wrong user
   *
   * Security:
   * - Prevents user A from revoking user B's sessions
   * - Multi-tenant isolation via organizationId
   *
   * Edge cases:
   * - Session not found → returns null
   * - Session belongs to different user → returns null
   * - Session exists and belongs to user → returns session
   */
  async validateSessionOwnership(
    sessionId: UUID,
    userId: UUID,
    organizationId: OrganizationId
  ): Promise<Session | null> {
    const session = await this.sessionRepository.findById(sessionId, organizationId);

    if (!session) {
      return null;
    }

    // Verify session belongs to this user
    if (session.userId !== userId) {
      return null;
    }

    return session;
  }

  /**
   * Enforce session limit per user
   * If limit exceeded, revokes oldest sessions
   *
   * @param userId - User identifier
   * @param organizationId - Organization for tenant isolation
   *
   * Edge cases:
   * - No sessions → no-op
   * - Below limit → no-op
   * - At limit → revokes oldest
   * - All sessions expired → no-op
   */
  private async enforceSessionLimit(userId: UUID, organizationId: OrganizationId): Promise<void> {
    const sessions = await this.sessionRepository.findByUserId(userId, organizationId);

    // Filter active sessions only
    const activeSessions = sessions.filter((s) => s.isActive());

    // Check if limit exceeded
    if (activeSessions.length < this.maxSessionsPerUser) {
      return;
    }

    // Calculate how many to revoke
    const excessCount = activeSessions.length - this.maxSessionsPerUser + 1;

    // Sort by creation date (oldest first)
    const sortedSessions = activeSessions.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    // Revoke oldest sessions
    const sessionsToRevoke = sortedSessions.slice(0, excessCount);

    await Promise.all(
      sessionsToRevoke.map((session) =>
        this.invalidateSession(session.id, organizationId, 'session_limit_exceeded')
      )
    );
  }

  /**
   * Update refresh token hash for a session
   *
   * This is called after generating the final refresh token to update
   * the session with the correct hash. Necessary because the initial
   * session creation uses a placeholder token.
   *
   * @param sessionId - Session identifier
   * @param organizationId - Organization for tenant isolation
   * @param refreshToken - The final refresh token to hash and store
   */
  async updateRefreshTokenHash(
    sessionId: UUID,
    organizationId: OrganizationId,
    refreshToken: string
  ): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId, organizationId);

    if (!session) {
      throw new AuthenticationError('Session not found', {
        reason: 'invalid_credentials',
      });
    }

    // Hash the final refresh token
    const refreshTokenHash = await this.passwordService.hashPassword(refreshToken);

    // Update session with new hash
    const updatedSession = new Session({
      ...session,
      refreshTokenHash,
    });

    await this.sessionRepository.update(updatedSession);
  }

  /**
   * Convert session entity to DTO
   * Excludes sensitive data (token hash)
   */
  private toDto(session: Session): SessionDto {
    return {
      id: session.id,
      userId: session.userId,
      organizationId: session.organizationId,
      clinicId: session.clinicId,
      deviceInfo: session.deviceInfo,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      lastActivityAt: session.lastActivityAt,
      isActive: session.isActive(),
    };
  }
}
