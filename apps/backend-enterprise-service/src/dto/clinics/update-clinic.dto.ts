import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsUrl,
  IsUUID,
  IsEnum,
  IsOptional,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from '../common';
import { OperatingHoursDto } from './create-clinic.dto';

/**
 * Clinic status values
 */
export enum ClinicStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING_SETUP = 'PENDING_SETUP',
  SUSPENDED = 'SUSPENDED',
}

/**
 * DTO for updating an existing clinic
 * All fields are optional - only provided fields will be updated
 */
export class UpdateClinicDto {
  @ApiProperty({
    description: 'Clinic name',
    example: 'Smile Dental - Downtown (Relocated)',
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiProperty({
    description: 'Unique clinic code',
    example: 'SDG-DT-002',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @ApiProperty({
    description: 'Clinic status',
    enum: ClinicStatus,
    example: ClinicStatus.ACTIVE,
    enumName: 'ClinicStatus',
    required: false,
  })
  @IsOptional()
  @IsEnum(ClinicStatus)
  status?: ClinicStatus;

  @ApiProperty({
    description: 'Physical address',
    type: () => AddressDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiProperty({
    description: 'Main phone number',
    example: '+1-415-555-2000',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiProperty({
    description: 'Email address',
    example: 'downtown-new@smiledental.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Website URL',
    example: 'https://downtown-new.smiledental.com',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    description: 'Clinic manager user ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  managerUserId?: string;

  @ApiProperty({
    description: 'Clinic manager name',
    example: 'Dr. Michael Chen',
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  managerName?: string;

  @ApiProperty({
    description: 'Clinic manager email',
    example: 'michael.chen@smiledental.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  managerEmail?: string;

  @ApiProperty({
    description: 'IANA timezone identifier',
    example: 'America/Los_Angeles',
    required: false,
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({
    description: 'Locale/language code',
    example: 'es-US',
    required: false,
  })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiProperty({
    description: 'Weekly operating hours',
    type: () => OperatingHoursDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OperatingHoursDto)
  operatingHours?: OperatingHoursDto;

  @ApiProperty({
    description: 'Dental license number',
    example: 'DL-CA-789012',
    required: false,
  })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiProperty({
    description: 'Accreditation details',
    example: 'ADA Accredited, ISO 9001:2015 Certified, OSHA Compliant',
    required: false,
  })
  @IsOptional()
  @IsString()
  accreditationDetails?: string;
}
