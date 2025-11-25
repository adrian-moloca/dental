/**
 * Authentication Response DTOs
 *
 * Data transfer objects for authentication responses.
 * Includes user information and JWT tokens.
 *
 * Security considerations:
 * - Never includes passwordHash or sensitive internal data
 * - Token expiration times clearly communicated
 * - User data sanitized before serialization
 *
 * Edge cases handled:
 * - Optional clinicId for organization-wide users
 * - Empty roles/permissions arrays
 * - Email verification status
 *
 * @module modules/auth/dto
 */

import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';

/**
 * User information returned in auth responses
 * SECURITY: Never includes passwordHash or sensitive internal data
 */
export class UserDto {
  @Expose()
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440002',
    description: 'User unique identifier',
  })
  id!: UUID;

  @Expose()
  @ApiProperty({
    example: 'user@dentalclinic.com',
    description: 'User email address',
  })
  email!: string;

  @Expose()
  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  firstName!: string;

  @Expose()
  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  lastName!: string;

  @Expose()
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Organization ID',
  })
  organizationId!: OrganizationId;

  @Expose()
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Clinic ID (optional)',
    required: false,
  })
  clinicId?: ClinicId;

  @Expose()
  @ApiProperty({
    type: [String],
    example: ['USER', 'DENTIST'],
    description: 'User roles',
  })
  roles!: string[];

  @Expose()
  @ApiProperty({
    type: [String],
    example: ['patients:read', 'appointments:write'],
    description: 'User permissions',
  })
  permissions!: string[];

  @Expose()
  @ApiProperty({
    example: false,
    description: 'Whether user email has been verified',
  })
  emailVerified!: boolean;

  @Expose()
  @ApiProperty({
    example: '2025-01-20T10:30:00.000Z',
    description: 'Timestamp when user was created',
  })
  createdAt!: Date;
}

/**
 * Authentication response with tokens and user data
 */
export class AuthResponseDto {
  @Expose()
  @ApiProperty({
    description: 'JWT access token (short-lived, 15 minutes)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @Expose()
  @ApiProperty({
    description: 'JWT refresh token (long-lived, 7 days)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;

  @Expose()
  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
  })
  tokenType!: string;

  @Expose()
  @ApiProperty({
    description: 'Access token expiration in seconds',
    example: 900,
  })
  expiresIn!: number;

  @Expose()
  @ApiProperty({
    description: 'Authenticated user information',
    type: UserDto,
  })
  user!: UserDto;
}
