/**
 * Login DTO
 *
 * Data transfer object for user login endpoint.
 * Validates email and password format along with organization ID.
 *
 * Security considerations:
 * - No password complexity validation at login (only at registration)
 * - Email format validation
 * - UUID validation for organizationId
 * - Generic error messages to prevent user enumeration
 *
 * Edge cases handled:
 * - Email case-sensitivity (handled at repository level)
 * - Multi-tenant login (requires organizationId)
 *
 * @module modules/auth/dto
 */

import { IsEmail, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { OrganizationId } from '@dentalos/shared-types';

/**
 * DTO for user login
 */
export class LoginDto {
  @ApiProperty({
    example: 'user@dentalclinic.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @ApiProperty({
    example: 'SecureP@ssw0rd123',
    description: 'User password',
  })
  @IsString()
  password!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Organization ID',
  })
  @IsUUID('4', { message: 'Invalid organization ID format' })
  organizationId!: OrganizationId;
}
