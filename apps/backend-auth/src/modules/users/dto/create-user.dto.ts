/**
 * Create User DTO
 *
 * Request body for creating a new user.
 *
 * @module modules/users/dto
 */

import {
  IsEmail,
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  MinLength,
  MaxLength,
  IsUUID,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '../entities/user.entity';

/**
 * DTO for creating a new user
 *
 * Validation rules:
 * - Email must be valid email format
 * - Password must be 8-100 chars with complexity requirements
 * - First/Last name must be 1-100 chars
 * - Roles are optional array of strings
 */
export class CreateUserDto {
  /**
   * User email address (unique per organization)
   */
  @ApiProperty({
    description: 'User email address',
    example: 'doctor@clinica.ro',
  })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  /**
   * Plain text password (will be hashed)
   */
  @ApiProperty({
    description: 'Password (8-100 characters, must include uppercase, lowercase, and number)',
    example: 'SecurePass123!',
    minLength: 8,
    maxLength: 100,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password!: string;

  /**
   * User first name
   */
  @ApiProperty({
    description: 'User first name',
    example: 'Alexandru',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName!: string;

  /**
   * User last name
   */
  @ApiProperty({
    description: 'User last name',
    example: 'Popescu',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName!: string;

  /**
   * User roles (e.g., 'DENTIST', 'RECEPTIONIST', 'ASSISTANT')
   */
  @ApiPropertyOptional({
    description: 'User roles',
    example: ['DENTIST'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  /**
   * User permissions (for fine-grained access control)
   */
  @ApiPropertyOptional({
    description: 'User permissions',
    example: ['patients:read', 'appointments:write'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  /**
   * Optional clinic ID assignment
   */
  @ApiPropertyOptional({
    description: 'Clinic ID for clinic-specific users',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  clinicId?: string;

  /**
   * Initial user status
   */
  @ApiPropertyOptional({
    description: 'Initial user status',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
