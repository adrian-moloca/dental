import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsInt,
  IsPositive,
  IsOptional,
  IsArray,
  MaxLength,
} from 'class-validator';

/**
 * Types of clinic locations/areas
 */
export enum ClinicLocationType {
  TREATMENT_ROOM = 'TREATMENT_ROOM',
  CONSULTATION_ROOM = 'CONSULTATION_ROOM',
  XRAY_ROOM = 'XRAY_ROOM',
  STERILIZATION_ROOM = 'STERILIZATION_ROOM',
  WAITING_AREA = 'WAITING_AREA',
  RECEPTION = 'RECEPTION',
  LAB = 'LAB',
  STORAGE = 'STORAGE',
  OFFICE = 'OFFICE',
  OTHER = 'OTHER',
}

/**
 * DTO for creating a clinic location/area within a clinic
 */
export class CreateClinicLocationDto {
  @ApiProperty({
    description: 'Type of clinic location',
    enum: ClinicLocationType,
    example: ClinicLocationType.TREATMENT_ROOM,
    enumName: 'ClinicLocationType',
  })
  @IsEnum(ClinicLocationType)
  type!: ClinicLocationType;

  @ApiProperty({
    description: 'Location name (e.g., "Treatment Room 1", "X-Ray Room A")',
    example: 'Treatment Room 1',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({
    description: 'Unique location code for internal use',
    example: 'TR-01',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code!: string;

  @ApiProperty({
    description: 'Parent location ID for hierarchical organization (e.g., room within a floor)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentLocationId?: string;

  @ApiProperty({
    description: 'Floor number where the location is situated',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsInt()
  floor?: number;

  @ApiProperty({
    description: 'Area/wing identifier within the floor',
    example: 'West Wing',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  area?: string;

  @ApiProperty({
    description: 'Capacity (number of people or treatment chairs)',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  capacity?: number;

  @ApiProperty({
    description: 'Additional notes about the location',
    example: 'Equipped with digital X-ray system',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Array of equipment IDs assigned to this location',
    example: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  equipmentIds?: string[];

  @ApiProperty({
    description: 'Array of staff IDs assigned to this location',
    example: ['550e8400-e29b-41d4-a716-446655440003'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  assignedStaffIds?: string[];
}
