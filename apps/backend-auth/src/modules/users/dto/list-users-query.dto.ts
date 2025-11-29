/**
 * List Users Query DTO
 *
 * Query parameters for listing users with filtering and pagination.
 *
 * @module modules/users/dto
 */

import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '../entities/user.entity';

/**
 * Query parameters for listing users
 */
export class ListUsersQueryDto {
  /**
   * Filter by user status
   */
  @ApiPropertyOptional({
    enum: UserStatus,
    description: 'Filter by user status',
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  /**
   * Filter by role name
   */
  @ApiPropertyOptional({
    description: 'Filter by role name (e.g., "DENTIST", "RECEPTIONIST")',
  })
  @IsOptional()
  @IsString()
  role?: string;

  /**
   * Search by name or email
   */
  @ApiPropertyOptional({
    description: 'Search by first name, last name, or email',
  })
  @IsOptional()
  @IsString()
  search?: string;

  /**
   * Filter by clinic ID
   */
  @ApiPropertyOptional({
    description: 'Filter by clinic ID',
  })
  @IsOptional()
  @IsString()
  clinicId?: string;

  /**
   * Page number for pagination (1-based)
   */
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  /**
   * Items per page
   */
  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
