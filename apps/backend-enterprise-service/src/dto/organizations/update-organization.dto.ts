import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsUrl,
  IsEnum,
  IsDateString,
  IsInt,
  IsPositive,
  IsOptional,
  ValidateNested,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from '../common';
import { SubscriptionTier } from './create-organization.dto';

/**
 * Organization status values
 */
export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

/**
 * DTO for updating an existing organization
 * All fields are optional - only provided fields will be updated
 */
export class UpdateOrganizationDto {
  @ApiProperty({
    description: 'Organization display name',
    example: 'Smile Dental Group',
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiProperty({
    description: 'Legal business name',
    example: 'Smile Dental Group, LLC',
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  legalName?: string;

  @ApiProperty({
    description: 'Tax identification number',
    example: '12-3456789',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId?: string;

  @ApiProperty({
    description: 'Organization status',
    enum: OrganizationStatus,
    example: OrganizationStatus.ACTIVE,
    enumName: 'OrganizationStatus',
    required: false,
  })
  @IsOptional()
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus;

  @ApiProperty({
    description: 'Primary contact person name',
    example: 'Dr. Jane Doe',
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  primaryContactName?: string;

  @ApiProperty({
    description: 'Primary contact email',
    example: 'jane.doe@smiledental.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  primaryContactEmail?: string;

  @ApiProperty({
    description: 'Primary contact phone number',
    example: '+1-415-555-9999',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  primaryContactPhone?: string;

  @ApiProperty({
    description: 'Organization headquarters address',
    type: () => AddressDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiProperty({
    description: 'Organization website URL',
    example: 'https://www.smiledental.com',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    description: 'URL to organization logo',
    example: 'https://cdn.smiledental.com/new-logo.png',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiProperty({
    description: 'Subscription tier level',
    enum: SubscriptionTier,
    example: SubscriptionTier.ENTERPRISE,
    enumName: 'SubscriptionTier',
    required: false,
  })
  @IsOptional()
  @IsEnum(SubscriptionTier)
  subscriptionTier?: SubscriptionTier;

  @ApiProperty({
    description: 'Subscription end date (ISO 8601 format)',
    example: '2027-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  subscriptionEndDate?: string;

  @ApiProperty({
    description: 'Maximum number of clinics allowed',
    example: 20,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(1)
  maxClinics?: number;

  @ApiProperty({
    description: 'Maximum number of users allowed',
    example: 200,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(1)
  maxUsers?: number;

  @ApiProperty({
    description: 'Maximum storage in gigabytes',
    example: 1000,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsPositive()
  @Min(1)
  maxStorageGB?: number;
}
