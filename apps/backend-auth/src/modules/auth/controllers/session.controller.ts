/**
 * Session Controller
 *
 * REST API endpoints for session management.
 * Handles listing active sessions, revoking specific sessions, and bulk logout.
 *
 * Security considerations:
 * - All routes require valid JWT authentication
 * - Session operations scoped to current user only
 * - Tenant isolation enforced through organizationId
 * - Idempotent operations for revocation
 *
 * Endpoints:
 * - GET /auth/sessions: List all active sessions for current user (protected)
 * - DELETE /auth/sessions/:id: Revoke specific session (protected)
 * - DELETE /auth/sessions: Logout from all sessions (protected)
 *
 * Edge cases handled:
 * - User has no sessions → returns empty array
 * - Session not found → 404 Not Found (for specific revoke)
 * - Session already revoked → success (idempotent)
 * - Session belongs to different user → 404 Not Found (security)
 * - All sessions expired → returns empty array
 *
 * @module modules/auth/controllers
 */

import { Controller, Get, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { SessionDto } from '../dto';
import type { CurrentUser as CurrentUserType } from '@dentalos/shared-auth';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import type { UUID } from '@dentalos/shared-types';

/**
 * Session controller
 *
 * Manages user sessions including listing and revocation.
 * All routes are under /auth prefix (configured in AuthModule).
 */
@ApiTags('Sessions')
@Controller('auth/sessions')
export class SessionController {
  constructor(private readonly authService: AuthService) {}

  /**
   * List all active sessions for current user
   *
   * Protected endpoint (requires valid JWT).
   * Returns session metadata including device info.
   *
   * Steps:
   * 1. Fetch active sessions for user
   * 2. Map to DTOs with device metadata
   * 3. Return session list
   *
   * Edge cases:
   * - User has no sessions → returns empty array
   * - All sessions expired → returns empty array
   * - Missing JWT → 401 Unauthorized
   *
   * @param user - Current user from JWT
   * @returns Array of session DTOs
   */
  @Get()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all active sessions for current user',
    description:
      'Retrieve all active sessions for the authenticated user, including device information and activity timestamps.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of active sessions',
    type: [SessionDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Not authenticated - missing or invalid JWT token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  async listSessions(@CurrentUser() user: CurrentUserType): Promise<SessionDto[]> {
    return this.authService.listUserSessions(user.userId, user.tenantContext.organizationId);
  }

  /**
   * Revoke a specific session
   *
   * Protected endpoint (requires valid JWT).
   * Allows user to revoke a session from another device.
   *
   * Steps:
   * 1. Validate session belongs to current user
   * 2. Invalidate session in Redis
   * 3. Return success (204 No Content)
   *
   * Edge cases:
   * - Session not found → 404 Not Found
   * - Session belongs to different user → 404 Not Found (security)
   * - Session already revoked → success (idempotent)
   * - Missing JWT → 401 Unauthorized
   *
   * @param id - Session ID from URL parameter
   * @param user - Current user from JWT
   */
  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Revoke a specific session',
    description:
      'Revoke (invalidate) a specific session. Useful for logging out from other devices.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Session revoked successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error - invalid session ID format',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid UUID format',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Not authenticated - missing or invalid JWT token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found or does not belong to current user',
    schema: {
      example: {
        statusCode: 404,
        message: 'Session not found',
        error: 'Not Found',
      },
    },
  })
  async revokeSession(@Param('id') id: UUID, @CurrentUser() user: CurrentUserType): Promise<void> {
    await this.authService.revokeSession(id, user.userId, user.tenantContext.organizationId);
  }

  /**
   * Logout from all sessions
   *
   * Protected endpoint (requires valid JWT).
   * Invalidates all active sessions for the current user.
   *
   * Steps:
   * 1. Fetch all active sessions for user
   * 2. Invalidate each session in Redis
   * 3. Return success (204 No Content)
   *
   * Edge cases:
   * - User has no sessions → success (idempotent)
   * - All sessions already revoked → success (idempotent)
   * - Missing JWT → 401 Unauthorized
   *
   * SECURITY: This is a high-impact operation that signs the user out
   * from all devices. Useful for security scenarios like password changes.
   *
   * @param user - Current user from JWT
   */
  @Delete()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Logout from all sessions',
    description: 'Invalidate all active sessions for the current user. Signs out from all devices.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'All sessions revoked successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Not authenticated - missing or invalid JWT token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  async logoutAllSessions(@CurrentUser() user: CurrentUserType): Promise<void> {
    // Get all active sessions
    const sessions = await this.authService.listUserSessions(
      user.userId,
      user.tenantContext.organizationId
    );

    // Revoke each session
    await Promise.all(
      sessions.map((session) =>
        this.authService.revokeSession(session.id, user.userId, user.tenantContext.organizationId)
      )
    );
  }
}
