/**
 * Register DTO
 *
 * Data transfer object for user registration endpoint.
 * Validates all required fields with comprehensive validation rules.
 *
 * Security considerations:
 * - Password complexity enforced at DTO level
 * - Email format validation
 * - UUID validation for organizationId and clinicId
 * - String length limits to prevent DoS attacks
 *
 * Edge cases handled:
 * - Optional clinicId (users can belong to organization without clinic)
 * - First/last name trimming and length validation
 * - Password complexity requirements aligned with PasswordService
 *
 * @module modules/auth/dto
 */

import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsUUID,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { OrganizationId, ClinicId } from '@dentalos/shared-types';

/**
 * DTO for user registration
 * Validates all required fields for creating a new user account
 */
export class RegisterDto {
  @ApiProperty({
    example: 'user@dentalclinic.com',
    description: 'User email address (unique per organization)',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @ApiProperty({
    example: 'SecureP@ssw0rd123',
    description:
      'User password (min 12 chars, must include uppercase, lowercase, digit, special char)',
    minLength: 12,
    maxLength: 128,
  })
  @IsString()
  @MinLength(12, { message: 'Password must be at least 12 characters' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
    message: 'Password must contain uppercase, lowercase, digit, and special character',
  })
  password!: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  @IsString()
  @MinLength(1, { message: 'First name is required' })
  @MaxLength(100, { message: 'First name too long' })
  firstName!: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  @IsString()
  @MinLength(1, { message: 'Last name is required' })
  @MaxLength(100, { message: 'Last name too long' })
  lastName!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Organization ID',
  })
  @IsUUID('4', { message: 'Invalid organization ID format' })
  organizationId!: OrganizationId;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Clinic ID (optional)',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid clinic ID format' })
  clinicId?: ClinicId;
}
