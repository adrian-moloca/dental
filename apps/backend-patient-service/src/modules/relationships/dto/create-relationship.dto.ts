/**
 * Create Relationship DTO
 *
 * Defines the structure for creating a relationship between two patients.
 *
 * @module modules/relationships/dto
 */

import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Create Patient Relationship DTO
 */
export class CreateRelationshipDto {
  @ApiProperty({ description: 'ID of the related patient' })
  @IsUUID()
  @IsNotEmpty()
  relatedPatientId!: string;

  @ApiProperty({
    enum: ['parent', 'child', 'spouse', 'sibling', 'guardian', 'emergency', 'other'],
    description: 'Type of relationship',
  })
  @IsEnum(['parent', 'child', 'spouse', 'sibling', 'guardian', 'emergency', 'other'])
  @IsNotEmpty()
  relationshipType!: string;

  @ApiPropertyOptional({ description: 'Additional notes about the relationship' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ description: 'Is this an emergency contact?' })
  @IsBoolean()
  @IsOptional()
  isEmergencyContact?: boolean;

  @ApiPropertyOptional({ description: 'Can this person make medical decisions?' })
  @IsBoolean()
  @IsOptional()
  canMakeDecisions?: boolean;

  @ApiPropertyOptional({ description: 'Can this person view medical records?' })
  @IsBoolean()
  @IsOptional()
  canViewRecords?: boolean;
}
