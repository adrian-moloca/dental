/**
 * Generate Document DTO
 *
 * Validates document generation requests from templates.
 *
 * @module modules/documents/dto
 */

import {
  IsString,
  IsOptional,
  IsUUID,
  IsObject,
  IsBoolean,
  IsArray,
  IsDateString,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

/**
 * DTO for generating a document from a template
 *
 * Document generation is used for:
 * - Consent forms (pre-filled with patient and procedure data)
 * - Treatment plan summaries
 * - Patient information sheets
 * - Prescription forms
 */
export class GenerateDocumentDto {
  /**
   * Template ID to generate from
   */
  @ApiProperty({
    description: 'Template ID to use for generation',
    example: 'consent-extraction-ro',
  })
  @IsString()
  @MaxLength(100)
  templateId!: string;

  /**
   * Associated appointment (provides context for generation)
   */
  @ApiPropertyOptional({
    description: 'Appointment ID for context',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Appointment ID must be a valid UUID' })
  appointmentId?: string;

  /**
   * Additional data for template rendering
   * Template-specific fields that go beyond standard patient/appointment data
   */
  @ApiPropertyOptional({
    description: 'Additional template data',
    example: {
      toothNumbers: ['14', '15'],
      procedureDescription: 'Root canal treatment',
      estimatedDuration: '2 hours',
    },
  })
  @IsOptional()
  @IsObject()
  additionalData?: Record<string, unknown>;

  /**
   * Custom title (overrides template default)
   */
  @ApiPropertyOptional({
    description: 'Custom document title',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  title?: string;

  /**
   * Whether the generated document requires signature
   */
  @ApiPropertyOptional({
    description: 'Whether document requires signature',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  requiresSignature?: boolean;

  /**
   * Expiry date for the document
   */
  @ApiPropertyOptional({
    description: 'Expiry date for the document',
  })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  expiryDate?: Date;

  /**
   * Tags to apply to the generated document
   */
  @ApiPropertyOptional({
    description: 'Tags to apply',
    example: ['consent', 'extraction'],
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

  /**
   * Clinic ID (can be auto-populated from user context)
   */
  @ApiPropertyOptional({
    description: 'Clinic ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID(4)
  clinicId?: string;
}
