import { ApiProperty } from '@nestjs/swagger';
import { AddressDto } from '../common';
import { OrganizationStatus } from './update-organization.dto';
import { SubscriptionTier } from './create-organization.dto';

/**
 * Organization response DTO
 */
export class OrganizationResponseDto {
  @ApiProperty({
    description: 'Unique organization identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    description: 'Organization display name',
    example: 'Smile Dental Group',
  })
  name!: string;

  @ApiProperty({
    description: 'Legal business name',
    example: 'Smile Dental Group, LLC',
  })
  legalName!: string;

  @ApiProperty({
    description: 'Tax identification number',
    example: '12-3456789',
  })
  taxId!: string;

  @ApiProperty({
    description: 'Current organization status',
    enum: OrganizationStatus,
    example: OrganizationStatus.ACTIVE,
  })
  status!: OrganizationStatus;

  @ApiProperty({
    description: 'Primary contact person name',
    example: 'Dr. John Smith',
  })
  primaryContactName!: string;

  @ApiProperty({
    description: 'Primary contact email',
    example: 'john.smith@smiledental.com',
  })
  primaryContactEmail!: string;

  @ApiProperty({
    description: 'Primary contact phone',
    example: '+1-415-555-0123',
  })
  primaryContactPhone!: string;

  @ApiProperty({
    description: 'Organization address',
    type: () => AddressDto,
  })
  address!: AddressDto;

  @ApiProperty({
    description: 'Organization website',
    example: 'https://www.smiledental.com',
    required: false,
  })
  website?: string;

  @ApiProperty({
    description: 'Organization logo URL',
    example: 'https://cdn.smiledental.com/logo.png',
    required: false,
  })
  logoUrl?: string;

  @ApiProperty({
    description: 'Subscription tier',
    enum: SubscriptionTier,
    example: SubscriptionTier.PRO,
  })
  subscriptionTier!: SubscriptionTier;

  @ApiProperty({
    description: 'Subscription start date',
    example: '2025-01-01T00:00:00.000Z',
  })
  subscriptionStartDate!: string;

  @ApiProperty({
    description: 'Subscription end date',
    example: '2026-01-01T00:00:00.000Z',
    required: false,
  })
  subscriptionEndDate?: string;

  @ApiProperty({
    description: 'Maximum clinics allowed',
    example: 10,
  })
  maxClinics!: number;

  @ApiProperty({
    description: 'Maximum users allowed',
    example: 100,
  })
  maxUsers!: number;

  @ApiProperty({
    description: 'Maximum storage in GB',
    example: 500,
  })
  maxStorageGB!: number;

  @ApiProperty({
    description: 'Billing account identifier',
    example: 'ba_1234567890',
    required: false,
  })
  billingAccountId?: string;

  @ApiProperty({
    description: 'User ID who created the organization',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  createdBy!: string;

  @ApiProperty({
    description: 'User ID who last updated the organization',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  updatedBy!: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-01-15T10:30:00.000Z',
  })
  updatedAt!: string;
}
