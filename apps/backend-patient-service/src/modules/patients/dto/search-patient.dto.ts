/**
 * Search Patient DTO
 *
 * Defines query parameters for searching and filtering patients.
 *
 * @module modules/patients/dto
 */

import { IsString, IsOptional, IsEnum, IsArray, IsNumber, Min, Max, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Search Patient Query DTO
 *
 * Supports filtering, searching, sorting, and pagination.
 */
export class SearchPatientDto {
  @ApiPropertyOptional({ description: 'Search term for name, email, or phone' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by clinic ID' })
  @IsString()
  @IsOptional()
  clinicId?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'archived', 'deceased'] })
  @IsEnum(['active', 'inactive', 'archived', 'deceased'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by assigned provider ID' })
  @IsString()
  @IsOptional()
  assignedProviderId?: string;

  @ApiPropertyOptional({ type: [String], description: 'Filter by tags' })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Filter by medical flags' })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  flags?: string[];

  @ApiPropertyOptional({ enum: ['male', 'female', 'other', 'prefer_not_to_say'] })
  @IsEnum(['male', 'female', 'other', 'prefer_not_to_say'])
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ description: 'Minimum age' })
  @IsNumber()
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minAge?: number;

  @ApiPropertyOptional({ description: 'Maximum age' })
  @IsNumber()
  @IsInt()
  @Min(0)
  @Max(150)
  @IsOptional()
  @Type(() => Number)
  maxAge?: number;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsNumber()
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    enum: ['lastName', 'firstName', 'dateOfBirth', 'createdAt', 'valueScore'],
    default: 'lastName',
  })
  @IsEnum(['lastName', 'firstName', 'dateOfBirth', 'createdAt', 'valueScore'])
  @IsOptional()
  sortBy?: string = 'lastName';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'asc';
}
