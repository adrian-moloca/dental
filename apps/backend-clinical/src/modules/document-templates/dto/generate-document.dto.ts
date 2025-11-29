/**
 * DTOs for Document Generation API
 */

import { IsUUID, IsEnum, IsOptional, IsObject, IsString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentTemplateType } from '../entities/document-template.schema';

/**
 * Request to generate a document from template
 */
export class GenerateDocumentDto {
  @ApiProperty({
    description: 'Template type to use',
    enum: DocumentTemplateType,
    example: DocumentTemplateType.PATIENT_FORM,
  })
  @IsEnum(DocumentTemplateType)
  templateType!: DocumentTemplateType;

  @ApiProperty({
    description: 'Patient ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  patientId!: string;

  @ApiPropertyOptional({
    description: 'Appointment ID (optional, for appointment-related documents)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @ApiPropertyOptional({
    description: 'Treatment plan ID (optional, for treatment plan documents)',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsUUID()
  treatmentPlanId?: string;

  @ApiPropertyOptional({
    description: 'Procedure ID (optional, for procedure-specific consents)',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @IsOptional()
  @IsUUID()
  procedureId?: string;

  @ApiPropertyOptional({
    description: 'Additional custom data to merge with template',
    example: { customField: 'value' },
  })
  @IsOptional()
  @IsObject()
  customData?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Output format',
    enum: ['pdf', 'html'],
    default: 'pdf',
  })
  @IsOptional()
  @IsString()
  outputFormat?: 'pdf' | 'html';

  @ApiPropertyOptional({
    description: 'Whether to return as base64 or download URL',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  returnBase64?: boolean;
}

/**
 * Response with generated document
 */
export class GeneratedDocumentResponseDto {
  @ApiProperty({
    description: 'Document ID (for tracking)',
  })
  documentId!: string;

  @ApiProperty({
    description: 'Template type used',
    enum: DocumentTemplateType,
  })
  templateType!: DocumentTemplateType;

  @ApiProperty({
    description: 'Generated document URL (if not base64)',
  })
  documentUrl?: string;

  @ApiProperty({
    description: 'Base64-encoded document (if requested)',
  })
  documentBase64?: string;

  @ApiProperty({
    description: 'File name',
  })
  fileName!: string;

  @ApiProperty({
    description: 'MIME type',
  })
  mimeType!: string;

  @ApiProperty({
    description: 'File size in bytes',
  })
  fileSize!: number;

  @ApiProperty({
    description: 'Generation timestamp',
  })
  generatedAt!: Date;
}

/**
 * Request to preview template with sample data
 */
export class PreviewTemplateDto {
  @ApiProperty({
    description: 'Template type to preview',
    enum: DocumentTemplateType,
  })
  @IsEnum(DocumentTemplateType)
  templateType!: DocumentTemplateType;

  @ApiPropertyOptional({
    description: 'Sample data for preview',
  })
  @IsOptional()
  @IsObject()
  sampleData?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Specific template version to preview',
  })
  @IsOptional()
  @IsString()
  templateVersion?: string;
}

/**
 * Request to generate multiple documents for an appointment
 */
export class GenerateAppointmentDocumentsDto {
  @ApiProperty({
    description: 'Appointment ID',
  })
  @IsUUID()
  appointmentId!: string;

  @ApiProperty({
    description: 'Document types to generate',
    enum: DocumentTemplateType,
    isArray: true,
    example: [DocumentTemplateType.GENERAL_CONSENT, DocumentTemplateType.PROCEDURE_CONSENT],
  })
  @IsEnum(DocumentTemplateType, { each: true })
  documentTypes!: DocumentTemplateType[];

  @ApiPropertyOptional({
    description: 'Whether to return as ZIP archive',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  returnAsZip?: boolean;
}

/**
 * Batch generation response
 */
export class BatchGeneratedDocumentsResponseDto {
  @ApiProperty({
    description: 'Batch ID',
  })
  batchId!: string;

  @ApiProperty({
    description: 'Generated documents',
    type: [GeneratedDocumentResponseDto],
  })
  documents!: GeneratedDocumentResponseDto[];

  @ApiProperty({
    description: 'ZIP archive URL (if requested)',
  })
  zipUrl?: string;

  @ApiProperty({
    description: 'Number of documents generated',
  })
  count!: number;
}
