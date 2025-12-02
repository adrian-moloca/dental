/**
 * Update Preferences DTO
 *
 * Request body for updating user preferences.
 * Uses upsert pattern - creates if not exists, updates if exists.
 *
 * @module modules/user-preferences/dto
 */

import {
  IsArray,
  IsOptional,
  ValidateNested,
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Dashboard section configuration DTO
 */
export class DashboardSectionDto {
  /**
   * Unique section identifier
   */
  @ApiPropertyOptional({
    description: 'Unique section identifier',
    example: 'appointments-calendar',
  })
  @IsString()
  id!: string;

  /**
   * X-coordinate position in grid
   */
  @ApiPropertyOptional({
    description: 'X-coordinate position in grid',
    example: 0,
  })
  @IsNumber()
  x!: number;

  /**
   * Y-coordinate position in grid
   */
  @ApiPropertyOptional({
    description: 'Y-coordinate position in grid',
    example: 0,
  })
  @IsNumber()
  y!: number;

  /**
   * Width in grid units
   */
  @ApiPropertyOptional({
    description: 'Width in grid units',
    example: 6,
  })
  @IsNumber()
  w!: number;

  /**
   * Height in grid units
   */
  @ApiPropertyOptional({
    description: 'Height in grid units',
    example: 4,
  })
  @IsNumber()
  h!: number;

  /**
   * Whether section is visible
   */
  @ApiPropertyOptional({
    description: 'Whether section is visible',
    example: true,
  })
  @IsBoolean()
  visible!: boolean;
}

/**
 * Theme preferences DTO (for future use)
 */
export class ThemePreferencesDto {
  /**
   * Theme mode
   */
  @ApiPropertyOptional({
    description: 'Theme mode',
    enum: ['light', 'dark', 'auto'],
    example: 'light',
  })
  @IsOptional()
  @IsEnum(['light', 'dark', 'auto'])
  mode?: 'light' | 'dark' | 'auto';

  /**
   * Primary color override
   */
  @ApiPropertyOptional({
    description: 'Primary color override (hex)',
    example: '#1976d2',
  })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  /**
   * Font size preference
   */
  @ApiPropertyOptional({
    description: 'Font size preference',
    enum: ['small', 'medium', 'large'],
    example: 'medium',
  })
  @IsOptional()
  @IsEnum(['small', 'medium', 'large'])
  fontSize?: 'small' | 'medium' | 'large';

  /**
   * High contrast mode
   */
  @ApiPropertyOptional({
    description: 'High contrast mode enabled',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  highContrast?: boolean;
}

/**
 * DTO for updating user preferences
 *
 * All fields are optional - only provided fields will be updated.
 * Uses upsert pattern: creates if not exists, updates if exists.
 */
export class UpdatePreferencesDto {
  /**
   * Dashboard layout configuration
   */
  @ApiPropertyOptional({
    description: 'Dashboard layout configuration',
    type: [DashboardSectionDto],
    example: [
      {
        id: 'appointments-calendar',
        x: 0,
        y: 0,
        w: 6,
        h: 4,
        visible: true,
      },
      {
        id: 'recent-patients',
        x: 6,
        y: 0,
        w: 6,
        h: 4,
        visible: true,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DashboardSectionDto)
  dashboardLayout?: DashboardSectionDto[];

  /**
   * Theme preferences
   */
  @ApiPropertyOptional({
    description: 'Theme preferences',
    type: ThemePreferencesDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ThemePreferencesDto)
  themePreferences?: ThemePreferencesDto;
}
