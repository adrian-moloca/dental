/**
 * Update User DTO
 *
 * Request body for updating an existing user.
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
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '../entities/user.entity';

/**
 * DTO for updating an existing user
 *
 * All fields are optional - only provided fields will be updated.
 */
export class UpdateUserDto {
  /**
   * User email address
   */
  @ApiPropertyOptional({
    description: 'User email address',
    example: 'doctor@clinica.ro',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  /**
   * New password (optional, only if changing password)
   */
  @ApiPropertyOptional({
    description: 'New password (8-100 characters)',
    example: 'NewSecurePass123!',
    minLength: 8,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password?: string;

  /**
   * User first name
   */
  @ApiPropertyOptional({
    description: 'User first name',
    example: 'Alexandru',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName?: string;

  /**
   * User last name
   */
  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Popescu',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName?: string;

  /**
   * User roles
   */
  @ApiPropertyOptional({
    description: 'User roles',
    example: ['DENTIST', 'CLINIC_ADMIN'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  /**
   * User permissions
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
   * Clinic ID assignment
   */
  @ApiPropertyOptional({
    description: 'Clinic ID for clinic-specific users (set to null for org-wide)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  clinicId?: string;

  /**
   * User status
   */
  @ApiPropertyOptional({
    description: 'User status',
    enum: UserStatus,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
