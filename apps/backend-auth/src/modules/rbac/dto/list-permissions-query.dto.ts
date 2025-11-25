/**
 * List Permissions Query DTO
 *
 * Query parameters for GET /rbac/permissions endpoint.
 * Supports filtering by module, resource, action, and search.
 *
 * Security considerations:
 * - Permissions are global (not tenant-scoped)
 * - Only active permissions should be assignable
 *
 * @module modules/rbac/dto
 */

import { IsOptional, IsString, IsBoolean, IsInt, Min, Max, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionAction } from '../entities/permission.entity';

/**
 * Query parameters for listing permissions
 *
 * Provides filtering by module, resource, action, and search
 */
export class ListPermissionsQueryDto {
  /**
   * Filter by module name
   * Examples: "scheduling", "clinical", "billing"
   */
  @ApiPropertyOptional({
    description: 'Filter by module name',
    example: 'scheduling',
  })
  @IsOptional()
  @IsString({ message: 'module must be a string' })
  module?: string;

  /**
   * Filter by resource name
   * Examples: "appointment", "patient", "invoice"
   */
  @ApiPropertyOptional({
    description: 'Filter by resource name',
    example: 'appointment',
  })
  @IsOptional()
  @IsString({ message: 'resource must be a string' })
  resource?: string;

  /**
   * Filter by action type
   * Examples: "create", "read", "update", "delete", "manage"
   */
  @ApiPropertyOptional({
    description: 'Filter by action type',
    example: 'create',
    enum: PermissionAction,
  })
  @IsOptional()
  @IsString({ message: 'action must be a string' })
  @IsIn(Object.values(PermissionAction), {
    message: `action must be one of: ${Object.values(PermissionAction).join(', ')}`,
  })
  action?: string;

  /**
   * Filter by active status
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
   * Search query for permission code or display name
   * Case-insensitive partial match
   */
  @ApiPropertyOptional({
    description: 'Search permissions by code or display name (case-insensitive)',
    example: 'appointment',
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
    example: 50,
    minimum: 1,
    maximum: 200,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be at least 1' })
  @Max(200, { message: 'limit must not exceed 200' })
  limit?: number = 50;

  /**
   * Sort field
   */
  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'code',
    enum: ['code', 'displayName', 'module', 'resource', 'action', 'createdAt'],
    default: 'code',
  })
  @IsOptional()
  @IsString({ message: 'sortBy must be a string' })
  @IsIn(['code', 'displayName', 'module', 'resource', 'action', 'createdAt'], {
    message: 'sortBy must be one of: code, displayName, module, resource, action, createdAt',
  })
  sortBy?: 'code' | 'displayName' | 'module' | 'resource' | 'action' | 'createdAt' = 'code';

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
   * Calculate pagination offset from page and limit
   *
   * @returns Offset value for database query
   */
  getOffset(): number {
    return ((this.page ?? 1) - 1) * (this.limit ?? 50);
  }

  /**
   * Get limit value (with default)
   *
   * @returns Limit value for database query
   */
  getLimit(): number {
    return this.limit ?? 50;
  }
}
