/**
 * Cabinet List Response DTOs
 *
 * Data transfer objects for cabinet listing and subscription information.
 * Used to display cabinets available to a user with their subscription status.
 *
 * @module modules/auth/dto
 */

import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import type { UUID, OrganizationId } from '@dentalos/shared-types';

/**
 * Subscription status enumeration (matches backend-subscription-service)
 */
export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
}

/**
 * Module code enumeration (matches backend-subscription-service)
 * Subset of available module codes used in JWT and cabinet info
 */
export enum ModuleCode {
  // Core Modules
  SCHEDULING = 'scheduling',
  PATIENT_MANAGEMENT = 'patient_management',
  CLINICAL_BASIC = 'clinical_basic',
  BILLING_BASIC = 'billing_basic',

  // Premium Modules
  CLINICAL_ADVANCED = 'clinical_advanced',
  IMAGING = 'imaging',
  INVENTORY = 'inventory',
  MARKETING = 'marketing',
  INSURANCE = 'insurance',
  TELEDENTISTRY = 'teledentistry',
  ANALYTICS_ADVANCED = 'analytics_advanced',
  MULTI_LOCATION = 'multi_location',
}

/**
 * Subscription information for a cabinet
 */
export class CabinetSubscriptionDto {
  @Expose()
  @ApiProperty({
    description: 'Current subscription status',
    enum: SubscriptionStatus,
    example: SubscriptionStatus.ACTIVE,
  })
  status!: SubscriptionStatus;

  @Expose()
  @ApiProperty({
    description: 'Trial end date (null if not in trial)',
    example: '2025-02-20T10:30:00.000Z',
    nullable: true,
  })
  trialEndsAt!: Date | null;

  @Expose()
  @ApiProperty({
    description: 'List of active module codes',
    type: [String],
    enum: ModuleCode,
    example: [ModuleCode.SCHEDULING, ModuleCode.PATIENT_MANAGEMENT],
  })
  modules!: ModuleCode[];
}

/**
 * Individual cabinet information
 */
export class CabinetInfoDto {
  @Expose()
  @ApiProperty({
    description: 'Cabinet unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  id!: UUID;

  @Expose()
  @ApiProperty({
    description: 'Organization ID this cabinet belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  organizationId!: OrganizationId;

  @Expose()
  @ApiProperty({
    description: 'Cabinet name',
    example: 'Main Dental Clinic',
  })
  name!: string;

  @Expose()
  @ApiProperty({
    description: 'Whether this is the default cabinet for the user',
    example: true,
  })
  isDefault!: boolean;

  @Expose()
  @ApiProperty({
    description: 'Whether this is the primary cabinet in the organization',
    example: true,
  })
  isPrimary!: boolean;

  @Expose()
  @ApiProperty({
    description: 'Subscription information for this cabinet',
    type: CabinetSubscriptionDto,
  })
  subscription!: CabinetSubscriptionDto;
}

/**
 * Response containing list of cabinets user has access to
 */
export class CabinetListResponseDto {
  @Expose()
  @ApiProperty({
    description: 'List of cabinets the user has access to',
    type: [CabinetInfoDto],
  })
  cabinets!: CabinetInfoDto[];
}

/**
 * Response after cabinet selection with new JWT tokens
 * Extends AuthResponseDto with cabinet and subscription info
 */
export class CabinetSelectionResponseDto {
  @Expose()
  @ApiProperty({
    description: 'JWT access token (short-lived, 15 minutes)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @Expose()
  @ApiProperty({
    description: 'JWT refresh token (long-lived, 7 days)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;

  @Expose()
  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
  })
  tokenType!: string;

  @Expose()
  @ApiProperty({
    description: 'Access token expiration in seconds',
    example: 900,
  })
  expiresIn!: number;

  @Expose()
  @ApiProperty({
    description: 'Selected cabinet information',
    type: CabinetInfoDto,
  })
  cabinet!: CabinetInfoDto;

  @Expose()
  @ApiProperty({
    description: 'Subscription details for selected cabinet',
    type: CabinetSubscriptionDto,
  })
  subscription!: CabinetSubscriptionDto;
}
