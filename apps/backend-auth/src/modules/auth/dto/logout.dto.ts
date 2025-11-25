/**
 * LogoutDto - Input validation for logout requests
 *
 * Used by POST /auth/logout endpoint to specify which session
 * to invalidate. Supports single-device logout.
 *
 * Security:
 * - Session ownership validated in controller (CurrentUser)
 * - Prevents cross-user session revocation attacks
 *
 * @module LogoutDto
 */

import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UUID } from '@dentalos/shared-types';

/**
 * Logout request payload
 */
export class LogoutDto {
  /**
   * Session ID to invalidate
   * @example "123e4567-e89b-12d3-a456-426614174001"
   */
  @ApiProperty({
    description: 'Session ID to invalidate (from current user context)',
    example: '123e4567-e89b-12d3-a456-426614174001',
    type: String,
    format: 'uuid',
  })
  @IsUUID('4', { message: 'Session ID must be a valid UUID v4' })
  @IsNotEmpty({ message: 'Session ID is required' })
  sessionId!: UUID;
}
