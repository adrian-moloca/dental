/**
 * RefreshTokenDto - Input validation for token refresh requests
 *
 * Used by POST /auth/refresh endpoint to validate refresh token
 * and organization context.
 *
 * Security:
 * - Requires explicit organizationId to prevent cross-tenant token use
 * - Validates UUID format to prevent injection attacks
 *
 * @module RefreshTokenDto
 */

import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrganizationId } from '@dentalos/shared-types';

/**
 * Refresh token request payload
 */
export class RefreshTokenDto {
  /**
   * Refresh token (JWT) to be rotated
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  @ApiProperty({
    description: 'Refresh token (JWT) to be rotated',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
  })
  @IsString({ message: 'Refresh token must be a string' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken!: string;

  /**
   * Organization ID for tenant isolation
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  @ApiProperty({
    description: 'Organization ID for tenant isolation',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
    format: 'uuid',
  })
  @IsUUID('4', { message: 'Organization ID must be a valid UUID v4' })
  @IsNotEmpty({ message: 'Organization ID is required' })
  organizationId!: OrganizationId;
}
