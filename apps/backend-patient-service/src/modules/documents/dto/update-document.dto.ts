/**
 * Update Document DTO
 *
 * Validates document metadata update requests.
 * File content cannot be updated - create a new version instead.
 *
 * @module modules/documents/dto
 */

import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsBoolean,
  IsArray,
  IsDateString,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { DocumentCategory } from '../entities';

/**
 * DTO for updating patient document metadata
 *
 * NOTE: File content cannot be updated. To update the file,
 * create a new document and optionally link it as a new version.
 */
export class UpdateDocumentDto {
  /**
   * Document title
   */
  @ApiPropertyOptional({
    description: 'Document title',
    example: 'Updated Consent Form',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Title cannot exceed 255 characters' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  title?: string;

  /**
   * Document description
   */
  @ApiPropertyOptional({
    description: 'Document description',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  description?: string;

  /**
   * Document category
   */
  @ApiPropertyOptional({
    description: 'Document category',
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
  })
  @IsOptional()
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
    {
      message: 'Invalid document category',
    },
  )
  category?: DocumentCategory;

  /**
   * Date on the document
   */
  @ApiPropertyOptional({
    description: 'Date on the document',
  })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  documentDate?: Date;

  /**
   * Expiry date
   */
  @ApiPropertyOptional({
    description: 'Document expiry date',
  })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  expiryDate?: Date;

  /**
   * Associated appointment
   */
  @ApiPropertyOptional({
    description: 'Associated appointment ID',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Appointment ID must be a valid UUID' })
  appointmentId?: string;

  /**
   * Requires signature flag
   */
  @ApiPropertyOptional({
    description: 'Whether document requires signature',
  })
  @IsOptional()
  @IsBoolean()
  requiresSignature?: boolean;

  /**
   * Tags
   */
  @ApiPropertyOptional({
    description: 'Tags for categorization',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value)
      ? value.map((v: unknown) => (typeof v === 'string' ? v.toLowerCase().trim() : v))
      : value,
  )
  tags?: string[];
}
