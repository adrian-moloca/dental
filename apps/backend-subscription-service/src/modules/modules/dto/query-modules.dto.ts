/**
 * Query Modules DTO
 * Data transfer objects for querying modules
 *
 * @module backend-subscription-service/modules/dto
 */

import { IsOptional, IsEnum, IsBoolean, IsString, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ModuleType } from '../entities/module.entity';

/**
 * Query parameters for listing modules
 */
export class QueryModulesDto {
  /**
   * Filter by module type
   */
  @IsOptional()
  @IsEnum(ModuleType)
  type?: ModuleType;

  /**
   * Filter by active status
   */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  /**
   * Filter by deprecated status
   */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isDeprecated?: boolean;

  /**
   * Filter by category
   */
  @IsOptional()
  @IsString()
  category?: string;

  /**
   * Include inactive modules in results
   */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeInactive?: boolean;

  /**
   * Field to sort by
   * @default 'displayOrder'
   */
  @IsOptional()
  @IsString()
  sortBy?: string = 'displayOrder';

  /**
   * Sort order
   * @default 'ASC'
   */
  @IsOptional()
  @IsEnum(['ASC', 'DESC', 'asc', 'desc'])
  @Transform(({ value }) => value?.toUpperCase())
  sortOrder?: 'ASC' | 'DESC' = 'ASC';

  /**
   * Maximum number of results
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  /**
   * Number of results to skip
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;
}

/**
 * Search modules query parameters
 */
export class SearchModulesDto extends QueryModulesDto {
  /**
   * Search query string
   */
  @IsString()
  q!: string;
}
