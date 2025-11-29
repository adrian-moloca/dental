/**
 * Bulk Upload Documents DTO
 *
 * Validates bulk document upload requests.
 *
 * @module modules/documents/dto
 */

import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { DocumentCategory } from '../entities';

/**
 * Metadata for a single file in bulk upload
 */
export class BulkUploadFileMetadataDto {
  /**
   * Unique key to match with the uploaded file
   * This should correspond to the field name in multipart/form-data
   */
  @ApiProperty({
    description: 'File identifier in the multipart request',
    example: 'file_0',
  })
  @IsString()
  fileKey!: string;

  /**
   * Document title
   */
  @ApiProperty({
    description: 'Document title',
    example: 'X-Ray - Panoramic',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  title!: string;

  /**
   * Document category
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
  })
  @IsEnum([
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
  ])
  category!: DocumentCategory;

  /**
   * Optional description
   */
  @ApiPropertyOptional({
    description: 'Document description',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  /**
   * Tags for this document
   */
  @ApiPropertyOptional({
    description: 'Tags for categorization',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value)
      ? value.map((v: unknown) => (typeof v === 'string' ? v.toLowerCase().trim() : v))
      : value,
  )
  tags?: string[];
}

/**
 * DTO for bulk uploading multiple documents
 *
 * Used when scanning multiple pages or uploading a batch of documents.
 * Maximum 10 files per request.
 */
export class BulkUploadDocumentsDto {
  /**
   * Metadata for each file being uploaded
   */
  @ApiProperty({
    description: 'Metadata for each file',
    type: [BulkUploadFileMetadataDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one file metadata is required' })
  @ArrayMaxSize(10, { message: 'Maximum 10 files per bulk upload' })
  @ValidateNested({ each: true })
  @Type(() => BulkUploadFileMetadataDto)
  files!: BulkUploadFileMetadataDto[];

  /**
   * Associated appointment (applies to all documents)
   */
  @ApiPropertyOptional({
    description: 'Appointment ID (applies to all documents)',
  })
  @IsOptional()
  @IsUUID(4)
  appointmentId?: string;

  /**
   * Clinic ID
   */
  @ApiPropertyOptional({
    description: 'Clinic ID',
  })
  @IsOptional()
  @IsUUID(4)
  clinicId?: string;
}

/**
 * Result for a single file in bulk upload
 */
export interface BulkUploadFileResult {
  fileKey: string;
  success: boolean;
  documentId?: string;
  error?: string;
}

/**
 * Response for bulk upload operation
 */
export interface BulkUploadResponse {
  totalFiles: number;
  successCount: number;
  failureCount: number;
  results: BulkUploadFileResult[];
}
