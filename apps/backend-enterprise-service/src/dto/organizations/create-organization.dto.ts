import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
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

/**
 * Subscription tier levels for organizations
 */
export enum SubscriptionTier {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

/**
 * DTO for creating a new organization in the DentalOS platform
 */
export class CreateOrganizationDto {
  @ApiProperty({
    description: 'Organization display name (used in UI)',
    example: 'Smile Dental Group',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({
    description: 'Legal business name (used in contracts and invoices)',
    example: 'Smile Dental Group, LLC',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  legalName!: string;

  @ApiProperty({
    description: 'Tax identification number (EIN, VAT, etc.)',
    example: '12-3456789',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  taxId!: string;

  @ApiProperty({
    description: 'Full name of the primary contact person',
    example: 'Dr. John Smith',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  primaryContactName!: string;

  @ApiProperty({
    description: 'Email address of the primary contact person',
    example: 'john.smith@smiledental.com',
  })
  @IsEmail()
  @IsNotEmpty()
  primaryContactEmail!: string;

  @ApiProperty({
    description: 'Phone number of the primary contact person (with country code)',
    example: '+1-415-555-0123',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  primaryContactPhone!: string;

  @ApiProperty({
    description: 'Organization headquarters address',
    type: () => AddressDto,
  })
  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;

  @ApiProperty({
    description: 'Organization website URL',
    example: 'https://www.smiledental.com',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    description: 'URL to organization logo image',
    example: 'https://cdn.smiledental.com/logo.png',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiProperty({
    description: 'Subscription tier level',
    enum: SubscriptionTier,
    example: SubscriptionTier.PRO,
    enumName: 'SubscriptionTier',
  })
  @IsEnum(SubscriptionTier)
  subscriptionTier!: SubscriptionTier;

  @ApiProperty({
    description: 'Subscription start date (ISO 8601 format)',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsDateString()
  subscriptionStartDate!: string;

  @ApiProperty({
    description: 'Subscription end date (ISO 8601 format). Omit for perpetual subscriptions',
    example: '2026-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  subscriptionEndDate?: string;

  @ApiProperty({
    description: 'Maximum number of clinics allowed for this organization',
    example: 10,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  @Min(1)
  maxClinics!: number;

  @ApiProperty({
    description: 'Maximum number of users (staff members) allowed across all clinics',
    example: 100,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  @Min(1)
  maxUsers!: number;

  @ApiProperty({
    description: 'Maximum storage capacity in gigabytes for documents, images, and files',
    example: 500,
    minimum: 1,
  })
  @IsPositive()
  @Min(1)
  maxStorageGB!: number;
}
