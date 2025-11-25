/**
 * Create Patient DTO
 *
 * Defines the data structure and validation rules for creating a new patient.
 * Uses class-validator for comprehensive input validation.
 *
 * @module modules/patients/dto
 */

import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsDate,
  IsEnum,
  IsArray,
  IsBoolean,
  ValidateNested,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePhoneDto {
  @ApiProperty({ enum: ['mobile', 'home', 'work', 'other'] })
  @IsEnum(['mobile', 'home', 'work', 'other'])
  @IsNotEmpty()
  type!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[\d\s\-().]+$/, { message: 'Invalid phone number format' })
  number!: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

export class CreateEmailDto {
  @ApiProperty({ enum: ['personal', 'work', 'other'] })
  @IsEnum(['personal', 'work', 'other'])
  @IsNotEmpty()
  type!: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  address!: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

export class CreateAddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  street!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(200)
  street2?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  state!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  postalCode!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

export class CreatePersonInfoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  middleName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  preferredName?: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  dateOfBirth!: Date;

  @ApiProperty({ enum: ['male', 'female', 'other', 'prefer_not_to_say'] })
  @IsEnum(['male', 'female', 'other', 'prefer_not_to_say'])
  @IsNotEmpty()
  gender!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Matches(/^\d{3}-\d{2}-\d{4}$/, { message: 'SSN must be in format XXX-XX-XXXX' })
  ssn?: string;
}

export class CreateContactInfoDto {
  @ApiPropertyOptional({ type: [CreatePhoneDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePhoneDto)
  phones?: CreatePhoneDto[];

  @ApiPropertyOptional({ type: [CreateEmailDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateEmailDto)
  emails?: CreateEmailDto[];

  @ApiPropertyOptional({ type: [CreateAddressDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateAddressDto)
  addresses?: CreateAddressDto[];
}

export class CreateDemographicsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(50)
  preferredLanguage?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  ethnicity?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  race?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(200)
  occupation?: string;

  @ApiPropertyOptional({ enum: ['single', 'married', 'divorced', 'widowed', 'separated', 'other'] })
  @IsEnum(['single', 'married', 'divorced', 'widowed', 'separated', 'other'])
  @IsOptional()
  maritalStatus?: string;
}

export class CreateMedicalInfoDto {
  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  allergies?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  medications?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  conditions?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  flags?: string[];
}

export class CreateInsuranceInfoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  provider!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  policyNumber!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  groupNumber?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subscriberName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  subscriberRelationship!: string;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  subscriberDateOfBirth?: Date;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  effectiveDate?: Date;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expirationDate?: Date;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

export class CreateCommunicationPreferencesDto {
  @ApiPropertyOptional({ enum: ['email', 'sms', 'phone', 'portal'] })
  @IsEnum(['email', 'sms', 'phone', 'portal'])
  @IsOptional()
  preferredChannel?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  appointmentReminders?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  marketingConsent?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  recallReminders?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  smsNotifications?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;
}

export class CreateConsentInfoDto {
  @ApiProperty()
  @IsBoolean()
  gdprConsent!: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  marketingConsent?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  dataProcessingConsent?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  treatmentConsent?: boolean;
}

/**
 * Create Patient DTO
 *
 * Main DTO for creating a new patient with all required and optional fields.
 */
export class CreatePatientDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clinicId!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(50)
  patientNumber?: string;

  @ApiProperty({ type: CreatePersonInfoDto })
  @ValidateNested()
  @Type(() => CreatePersonInfoDto)
  person!: CreatePersonInfoDto;

  @ApiPropertyOptional({ type: CreateContactInfoDto })
  @ValidateNested()
  @IsOptional()
  @Type(() => CreateContactInfoDto)
  contacts?: CreateContactInfoDto;

  @ApiPropertyOptional({ type: CreateDemographicsDto })
  @ValidateNested()
  @IsOptional()
  @Type(() => CreateDemographicsDto)
  demographics?: CreateDemographicsDto;

  @ApiPropertyOptional({ type: CreateMedicalInfoDto })
  @ValidateNested()
  @IsOptional()
  @Type(() => CreateMedicalInfoDto)
  medical?: CreateMedicalInfoDto;

  @ApiPropertyOptional({ type: CreateInsuranceInfoDto })
  @ValidateNested()
  @IsOptional()
  @Type(() => CreateInsuranceInfoDto)
  primaryInsurance?: CreateInsuranceInfoDto;

  @ApiPropertyOptional({ type: CreateInsuranceInfoDto })
  @ValidateNested()
  @IsOptional()
  @Type(() => CreateInsuranceInfoDto)
  secondaryInsurance?: CreateInsuranceInfoDto;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: CreateCommunicationPreferencesDto })
  @ValidateNested()
  @IsOptional()
  @Type(() => CreateCommunicationPreferencesDto)
  communicationPreferences?: CreateCommunicationPreferencesDto;

  @ApiProperty({ type: CreateConsentInfoDto })
  @ValidateNested()
  @Type(() => CreateConsentInfoDto)
  consent!: CreateConsentInfoDto;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  assignedProviderId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(200)
  referredBy?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  notes?: string;
}
