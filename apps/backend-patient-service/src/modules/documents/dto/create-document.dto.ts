/**
 * Create Document DTO
 *
 * Validates document creation requests for single file uploads.
 * File content is handled separately via multipart/form-data.
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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { DocumentCategory, DocumentSource } from '../entities';

/**
 * DTO for creating a new patient document
 *
 * Note: File content is handled via multipart/form-data in the controller.
 * This DTO validates the metadata that accompanies the file.
 */
export class CreateDocumentDto {
  /**
   * Document title for display
   */
  @ApiProperty({
    description: 'Document title',
    example: 'Consent for Root Canal Treatment',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255, { message: 'Title cannot exceed 255 characters' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  title!: string;

  /**
   * Optional description providing context
   */
  @ApiPropertyOptional({
    description: 'Document description',
    example: 'Patient consent form for endodontic treatment on tooth #14',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  description?: string;

  /**
   * Document category for organization
   */
  @ApiProperty({
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
    example: 'consent',
  })
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
      message:
        'Category must be one of: consent, anamnesis, patient_form, treatment_plan, prescription, referral, lab_result, imaging, invoice, insurance, id_document, other',
    },
  )
  category!: DocumentCategory;

  /**
   * Date on the document itself (not upload date)
   */
  @ApiPropertyOptional({
    description: 'Date on the document (e.g., lab result date)',
    example: '2024-01-15',
  })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  documentDate?: Date;

  /**
   * Expiry date for time-sensitive documents
   */
  @ApiPropertyOptional({
    description: 'Document expiry date (important for consents)',
    example: '2025-01-15',
  })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  expiryDate?: Date;

  /**
   * Document source
   */
  @ApiPropertyOptional({
    description: 'How the document was added',
    enum: ['upload', 'generated', 'imported', 'scan'],
    default: 'upload',
  })
  @IsOptional()
  @IsEnum(['upload', 'generated', 'imported', 'scan'], {
    message: 'Source must be one of: upload, generated, imported, scan',
  })
  source?: DocumentSource;

  /**
   * Associated appointment ID
   */
  @ApiPropertyOptional({
    description: 'Associated appointment ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Appointment ID must be a valid UUID' })
  appointmentId?: string;

  /**
   * Whether this document requires a signature
   */
  @ApiPropertyOptional({
    description: 'Whether document requires signature',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requiresSignature?: boolean;

  /**
   * Tags for categorization and search
   */
  @ApiPropertyOptional({
    description: 'Tags for categorization',
    example: ['urgent', 'reviewed'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20, { message: 'Cannot have more than 20 tags' })
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value)
      ? value.map((v: unknown) => (typeof v === 'string' ? v.toLowerCase().trim() : v))
      : value,
  )
  tags?: string[];

  /**
   * Clinic ID (can be auto-populated from user context)
   */
  @ApiPropertyOptional({
    description: 'Clinic ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Clinic ID must be a valid UUID' })
  clinicId?: string;
}
