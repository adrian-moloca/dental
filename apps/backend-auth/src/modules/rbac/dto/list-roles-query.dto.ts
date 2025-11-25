/**
 * List Roles Query DTO
 *
 * Query parameters for GET /rbac/roles endpoint.
 * Supports pagination, filtering, and sorting.
 *
 * Security considerations:
 * - organizationId extracted from JWT (not from query params)
 * - clinicId optional for clinic-specific filtering
 * - Filtering by isActive prevents showing deleted roles
 *
 * @module modules/rbac/dto
 */

import { IsOptional, IsUUID, IsBoolean, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { ClinicId } from '@dentalos/shared-types';

/**
 * Query parameters for listing roles
 *
 * Provides pagination, filtering by clinic, active status, and search
 */
export class ListRolesQueryDto {
  /**
   * Optional clinic ID filter
   * If provided, returns only roles for that clinic
   * If omitted, returns organization-wide roles
   */
  @ApiPropertyOptional({
    description: 'Filter by clinic ID (omit for org-wide roles)',
    example: '770e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4', { message: 'clinicId must be a valid UUID v4' })
  clinicId?: ClinicId;

  /**
   * Filter by active status
   * true = only active roles
   * false = only inactive roles
   * undefined = all roles
   */
  @ApiPropertyOptional({
    description: 'Filter by active status (true/false/omit for all)',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;

  /**
   * Filter by system role flag
   * true = only system roles
   * false = only custom roles
   * undefined = all roles
   */
  @ApiPropertyOptional({
    description: 'Filter by system role flag (true/false/omit for all)',
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean({ message: 'isSystem must be a boolean' })
  isSystem?: boolean;

  /**
   * Search query for role name or display name
   * Case-insensitive partial match
   */
  @ApiPropertyOptional({
    description: 'Search roles by name or display name (case-insensitive)',
    example: 'admin',
  })
  @IsOptional()
  @IsString({ message: 'search must be a string' })
  search?: string;

  /**
   * Page number for pagination (1-indexed)
   */
  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be at least 1' })
  page?: number = 1;

  /**
   * Page size (number of results per page)
   */
  @ApiPropertyOptional({
    description: 'Number of results per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be at least 1' })
  @Max(100, { message: 'limit must not exceed 100' })
  limit?: number = 20;

  /**
   * Sort field
   */
  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'name',
    enum: ['name', 'displayName', 'createdAt', 'updatedAt'],
    default: 'name',
  })
  @IsOptional()
  @IsString({ message: 'sortBy must be a string' })
  @IsIn(['name', 'displayName', 'createdAt', 'updatedAt'], {
    message: 'sortBy must be one of: name, displayName, createdAt, updatedAt',
  })
  sortBy?: 'name' | 'displayName' | 'createdAt' | 'updatedAt' = 'name';

  /**
   * Sort direction
   */
  @ApiPropertyOptional({
    description: 'Sort direction',
    example: 'asc',
    enum: ['asc', 'desc'],
    default: 'asc',
  })
  @IsOptional()
  @IsString({ message: 'sortOrder must be a string' })
  @IsIn(['asc', 'desc'], {
    message: 'sortOrder must be either "asc" or "desc"',
  })
  sortOrder?: 'asc' | 'desc' = 'asc';

  /**
   * Whether to include user count for each role
   */
  @ApiPropertyOptional({
    description: 'Include count of users assigned to each role',
    example: true,
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'includeUserCount must be a boolean' })
  includeUserCount?: boolean = false;

  /**
   * Whether to include permission count for each role
   */
  @ApiPropertyOptional({
    description: 'Include count of permissions in each role',
    example: true,
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'includePermissionCount must be a boolean' })
  includePermissionCount?: boolean = false;

  /**
   * Calculate pagination offset from page and limit
   *
   * @returns Offset value for database query
   */
  getOffset(): number {
    return ((this.page ?? 1) - 1) * (this.limit ?? 20);
  }

  /**
   * Get limit value (with default)
   *
   * @returns Limit value for database query
   */
  getLimit(): number {
    return this.limit ?? 20;
  }
}
