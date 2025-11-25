import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsUrl,
  IsUUID,
  IsOptional,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from '../common';

/**
 * Operating hours for a specific day
 */
export class DayOperatingHoursDto {
  @ApiProperty({
    description: 'Opening time in HH:mm format (24-hour)',
    example: '09:00',
    pattern: '^([01]\\d|2[0-3]):[0-5]\\d$',
  })
  @IsString()
  open!: string;

  @ApiProperty({
    description: 'Closing time in HH:mm format (24-hour)',
    example: '17:00',
    pattern: '^([01]\\d|2[0-3]):[0-5]\\d$',
  })
  @IsString()
  close!: string;
}

/**
 * Weekly operating hours schedule
 */
export class OperatingHoursDto {
  @ApiProperty({
    description: 'Monday operating hours',
    type: () => DayOperatingHoursDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayOperatingHoursDto)
  monday?: DayOperatingHoursDto;

  @ApiProperty({
    description: 'Tuesday operating hours',
    type: () => DayOperatingHoursDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayOperatingHoursDto)
  tuesday?: DayOperatingHoursDto;

  @ApiProperty({
    description: 'Wednesday operating hours',
    type: () => DayOperatingHoursDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayOperatingHoursDto)
  wednesday?: DayOperatingHoursDto;

  @ApiProperty({
    description: 'Thursday operating hours',
    type: () => DayOperatingHoursDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayOperatingHoursDto)
  thursday?: DayOperatingHoursDto;

  @ApiProperty({
    description: 'Friday operating hours',
    type: () => DayOperatingHoursDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayOperatingHoursDto)
  friday?: DayOperatingHoursDto;

  @ApiProperty({
    description: 'Saturday operating hours',
    type: () => DayOperatingHoursDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayOperatingHoursDto)
  saturday?: DayOperatingHoursDto;

  @ApiProperty({
    description: 'Sunday operating hours',
    type: () => DayOperatingHoursDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayOperatingHoursDto)
  sunday?: DayOperatingHoursDto;
}

/**
 * DTO for creating a new clinic within an organization
 */
export class CreateClinicDto {
  @ApiProperty({
    description: 'Clinic name (used in UI and patient communications)',
    example: 'Smile Dental - Downtown',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({
    description: 'Unique clinic code (used for internal identification and integrations)',
    example: 'SDG-DT-001',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code!: string;

  @ApiProperty({
    description: 'Physical address of the clinic',
    type: () => AddressDto,
  })
  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;

  @ApiProperty({
    description: 'Clinic main phone number (with country code)',
    example: '+1-415-555-1000',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  phone!: string;

  @ApiProperty({
    description: 'Clinic email address for general inquiries',
    example: 'downtown@smiledental.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Clinic website URL',
    example: 'https://downtown.smiledental.com',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    description: 'UUID of the user assigned as clinic manager',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  managerUserId?: string;

  @ApiProperty({
    description: 'Name of the clinic manager',
    example: 'Dr. Emily Rodriguez',
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  managerName?: string;

  @ApiProperty({
    description: 'Email of the clinic manager',
    example: 'emily.rodriguez@smiledental.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  managerEmail?: string;

  @ApiProperty({
    description: 'IANA timezone identifier for the clinic location',
    example: 'America/New_York',
  })
  @IsString()
  @IsNotEmpty()
  timezone!: string;

  @ApiProperty({
    description: 'Locale/language code (ISO 639-1 format)',
    example: 'en-US',
    default: 'en-US',
  })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiProperty({
    description: 'Weekly operating hours for the clinic',
    type: () => OperatingHoursDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OperatingHoursDto)
  operatingHours?: OperatingHoursDto;

  @ApiProperty({
    description: 'Dental license number for the clinic',
    example: 'DL-CA-123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiProperty({
    description: 'Accreditation details (e.g., ADA, ISO certifications)',
    example: 'ADA Accredited, ISO 9001:2015 Certified',
    required: false,
  })
  @IsOptional()
  @IsString()
  accreditationDetails?: string;
}
