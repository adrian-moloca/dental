/**
 * Search Documents DTO
 *
 * Validates document search and filtering requests.
 *
 * @module modules/documents/dto
 */

import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { DocumentCategory, DocumentSource } from '../entities';

/**
 * DTO for searching and filtering patient documents
 */
export class SearchDocumentsDto {
  /**
   * Text search in title, description, and tags
   */
  @ApiPropertyOptional({
    description: 'Search text (searches title, description, tags)',
    example: 'consent',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  search?: string;

  /**
   * Filter by category
   */
  @ApiPropertyOptional({
    description: 'Filter by category (can be array)',
    enum: [
      'consent',
      'anamnesis',
      'patient_form',
      'treatment_plan',
      'prescription',
      'referral',
      'lab_result',
      'imaging',
      'invoice',
      'insurance',
      'id_document',
      'other',
    ],
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.split(',').map((v: string) => v.trim());
    }
    return value;
  })
  @IsArray()
  @IsEnum(
    [
      'consent',
      'anamnesis',
      'patient_form',
      'treatment_plan',
      'prescription',
      'referral',
      'lab_result',
      'imaging',
      'invoice',
      'insurance',
      'id_document',
      'other',
    ],
    { each: true },
  )
  category?: DocumentCategory[];

  /**
   * Filter by tags
   */
  @ApiPropertyOptional({
    description: 'Filter by tags (comma-separated)',
    example: 'urgent,reviewed',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.split(',').map((v: string) => v.trim().toLowerCase());
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  /**
   * Filter by signature requirement
   */
  @ApiPropertyOptional({
    description: 'Filter by signature requirement',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  @IsBoolean()
  requiresSignature?: boolean;

  /**
   * Filter by signed status
   */
  @ApiPropertyOptional({
    description: 'Filter by signed status',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  @IsBoolean()
  isSigned?: boolean;

  /**
   * Filter by document date from
   */
  @ApiPropertyOptional({
    description: 'Filter by document date from',
  })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  fromDate?: Date;

  /**
   * Filter by document date to
   */
  @ApiPropertyOptional({
    description: 'Filter by document date to',
  })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  toDate?: Date;

  /**
   * Filter documents expiring before date
   */
  @ApiPropertyOptional({
    description: 'Filter documents expiring before date',
  })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  expiringBefore?: Date;

  /**
   * Filter by source
   */
  @ApiPropertyOptional({
    description: 'Filter by document source',
    enum: ['upload', 'generated', 'imported', 'scan'],
  })
  @IsOptional()
  @IsEnum(['upload', 'generated', 'imported', 'scan'])
  source?: DocumentSource;

  /**
   * Page number
   */
  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
    minimum: 1,
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
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  /**
   * Sort field
   */
  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['uploadedAt', 'documentDate', 'title', 'category', 'expiryDate'],
    default: 'uploadedAt',
  })
  @IsOptional()
  @IsEnum(['uploadedAt', 'documentDate', 'title', 'category', 'expiryDate'])
  sortBy?: string = 'uploadedAt';

  /**
   * Sort order
   */
  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
