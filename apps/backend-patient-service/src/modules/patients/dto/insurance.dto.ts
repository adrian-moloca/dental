/**
 * Insurance DTOs
 *
 * Data Transfer Objects for managing patient insurance information including:
 * - Insurance policies
 * - Coverage details (annual max, remaining, deductible)
 * - Provider information
 * - Policy verification status
 *
 * @module modules/patients/dto
 */

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsEnum,
  IsNumber,
  IsBoolean,
  ValidateNested,
  MaxLength,
  Min,
  Max,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Subscriber relationship values
 */
export const SubscriberRelationshipValues = ['self', 'spouse', 'child', 'parent', 'other'] as const;
export type SubscriberRelationshipType = (typeof SubscriberRelationshipValues)[number];

/**
 * Insurance plan type values
 */
export const InsurancePlanTypeValues = [
  'PPO',
  'HMO',
  'DHMO',
  'Indemnity',
  'EPO',
  'POS',
  'Other',
] as const;
export type InsurancePlanTypeValue = (typeof InsurancePlanTypeValues)[number];

// ============================================================================
// Insurance Coverage DTOs
// ============================================================================

/**
 * DTO for insurance coverage details
 */
export class InsuranceCoverageDto {
  @ApiPropertyOptional({
    description: 'Annual maximum benefit amount',
    example: 2000,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  annualMax?: number;

  @ApiPropertyOptional({
    description: 'Remaining benefit for current plan year',
    example: 1500,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  remaining?: number;

  @ApiPropertyOptional({
    description: 'Deductible amount',
    example: 50,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  deductible?: number;

  @ApiPropertyOptional({
    description: 'Deductible amount already met',
    example: 50,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  deductibleMet?: number;

  @ApiPropertyOptional({
    description: 'Coverage percentage for preventive services (0-100)',
    example: 100,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  preventivePercent?: number;

  @ApiPropertyOptional({
    description: 'Coverage percentage for basic services (0-100)',
    example: 80,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  basicPercent?: number;

  @ApiPropertyOptional({
    description: 'Coverage percentage for major services (0-100)',
    example: 50,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  majorPercent?: number;

  @ApiPropertyOptional({
    description: 'Coverage percentage for orthodontic services (0-100)',
    example: 50,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  orthoPercent?: number;

  @ApiPropertyOptional({
    description: 'Orthodontic lifetime maximum',
    example: 1500,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  orthoLifetimeMax?: number;

  @ApiPropertyOptional({
    description: 'Waiting period in months for basic services',
    example: 6,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  basicWaitingPeriodMonths?: number;

  @ApiPropertyOptional({
    description: 'Waiting period in months for major services',
    example: 12,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  majorWaitingPeriodMonths?: number;

  @ApiPropertyOptional({
    description: 'Plan year start date',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  planYearStart?: Date;

  @ApiPropertyOptional({
    description: 'Currency code (e.g., USD, RON, EUR)',
    example: 'RON',
    default: 'RON',
  })
  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string;
}

// ============================================================================
// Insurance Provider DTOs
// ============================================================================

/**
 * DTO for insurance provider information
 */
export class InsuranceProviderDto {
  @ApiProperty({
    description: 'Insurance company name',
    example: 'Delta Dental',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({
    description: 'Insurance company phone number',
    example: '+1-800-555-1234',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Insurance company fax number',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  fax?: string;

  @ApiPropertyOptional({
    description: 'Insurance company email',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Insurance company website',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  website?: string;

  @ApiPropertyOptional({
    description: 'Claims submission address',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  claimsAddress?: string;

  @ApiPropertyOptional({
    description: 'Electronic payer ID for claims submission',
    example: 'DDPFL',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  payerId?: string;
}

// ============================================================================
// Insurance Policy DTOs
// ============================================================================

/**
 * DTO for creating a new insurance policy
 */
export class CreateInsurancePolicyDto {
  @ApiProperty({ type: InsuranceProviderDto })
  @ValidateNested()
  @Type(() => InsuranceProviderDto)
  provider!: InsuranceProviderDto;

  @ApiProperty({
    description: 'Insurance policy number',
    example: 'POL123456789',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  policyNumber!: string;

  @ApiPropertyOptional({
    description: 'Group number',
    example: 'GRP001',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  groupNumber?: string;

  @ApiPropertyOptional({
    description: 'Group name (employer name)',
    example: 'Acme Corporation',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  groupName?: string;

  @ApiPropertyOptional({
    description: 'Plan name',
    example: 'Premium Plus Plan',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  planName?: string;

  @ApiPropertyOptional({
    description: 'Type of insurance plan',
    enum: InsurancePlanTypeValues,
  })
  @IsEnum(InsurancePlanTypeValues)
  @IsOptional()
  planType?: InsurancePlanTypeValue;

  @ApiProperty({
    description: 'Name of the policy subscriber',
    example: 'John Smith',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subscriberName!: string;

  @ApiPropertyOptional({
    description: 'Subscriber ID (may differ from policy number)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  subscriberId?: string;

  @ApiProperty({
    description: 'Patient relationship to subscriber',
    enum: SubscriberRelationshipValues,
    default: 'self',
  })
  @IsEnum(SubscriberRelationshipValues)
  @IsNotEmpty()
  subscriberRelationship!: SubscriberRelationshipType;

  @ApiPropertyOptional({
    description: 'Subscriber date of birth',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  subscriberDateOfBirth?: Date;

  @ApiPropertyOptional({
    description: 'Policy effective date',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  effectiveDate?: Date;

  @ApiPropertyOptional({
    description: 'Policy expiration date',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expirationDate?: Date;

  @ApiPropertyOptional({ type: InsuranceCoverageDto })
  @ValidateNested()
  @IsOptional()
  @Type(() => InsuranceCoverageDto)
  coverage?: InsuranceCoverageDto;

  @ApiPropertyOptional({
    description: 'Whether this is the primary insurance',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({
    description: 'Notes about the insurance policy',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}

/**
 * DTO for updating an existing insurance policy
 */
export class UpdateInsurancePolicyDto {
  @ApiPropertyOptional({ type: InsuranceProviderDto })
  @ValidateNested()
  @IsOptional()
  @Type(() => InsuranceProviderDto)
  provider?: InsuranceProviderDto;

  @ApiPropertyOptional({
    description: 'Insurance policy number',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  policyNumber?: string;

  @ApiPropertyOptional({
    description: 'Group number',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  groupNumber?: string;

  @ApiPropertyOptional({
    description: 'Group name (employer name)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  groupName?: string;

  @ApiPropertyOptional({
    description: 'Plan name',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  planName?: string;

  @ApiPropertyOptional({
    description: 'Type of insurance plan',
    enum: InsurancePlanTypeValues,
  })
  @IsEnum(InsurancePlanTypeValues)
  @IsOptional()
  planType?: InsurancePlanTypeValue;

  @ApiPropertyOptional({
    description: 'Name of the policy subscriber',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  subscriberName?: string;

  @ApiPropertyOptional({
    description: 'Subscriber ID',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  subscriberId?: string;

  @ApiPropertyOptional({
    description: 'Patient relationship to subscriber',
    enum: SubscriberRelationshipValues,
  })
  @IsEnum(SubscriberRelationshipValues)
  @IsOptional()
  subscriberRelationship?: SubscriberRelationshipType;

  @ApiPropertyOptional({
    description: 'Subscriber date of birth',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  subscriberDateOfBirth?: Date;

  @ApiPropertyOptional({
    description: 'Policy effective date',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  effectiveDate?: Date;

  @ApiPropertyOptional({
    description: 'Policy expiration date',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expirationDate?: Date;

  @ApiPropertyOptional({ type: InsuranceCoverageDto })
  @ValidateNested()
  @IsOptional()
  @Type(() => InsuranceCoverageDto)
  coverage?: InsuranceCoverageDto;

  @ApiPropertyOptional({
    description: 'Whether this is the primary insurance',
  })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the policy is active',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Whether eligibility has been verified',
  })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Notes about the insurance policy',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}

/**
 * DTO for verifying insurance eligibility
 */
export class VerifyInsuranceDto {
  @ApiProperty({
    description: 'Index of the insurance policy to verify (0-based)',
    example: 0,
  })
  @IsNumber()
  @Min(0)
  policyIndex!: number;

  @ApiPropertyOptional({
    description: 'ID of the user performing verification',
  })
  @IsString()
  @IsOptional()
  verifiedBy?: string;

  @ApiPropertyOptional({ type: InsuranceCoverageDto })
  @ValidateNested()
  @IsOptional()
  @Type(() => InsuranceCoverageDto)
  coverage?: InsuranceCoverageDto;

  @ApiPropertyOptional({
    description: 'Notes about the verification',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}

/**
 * Response DTO for insurance information
 */
export class InsurancePolicyResponseDto {
  @ApiProperty({ type: InsuranceProviderDto })
  provider!: InsuranceProviderDto;

  @ApiProperty()
  policyNumber!: string;

  @ApiPropertyOptional()
  groupNumber?: string;

  @ApiPropertyOptional()
  groupName?: string;

  @ApiPropertyOptional()
  planName?: string;

  @ApiPropertyOptional()
  planType?: string;

  @ApiProperty()
  subscriberName!: string;

  @ApiPropertyOptional()
  subscriberId?: string;

  @ApiProperty()
  subscriberRelationship!: string;

  @ApiPropertyOptional()
  subscriberDateOfBirth?: Date;

  @ApiPropertyOptional()
  effectiveDate?: Date;

  @ApiPropertyOptional()
  expirationDate?: Date;

  @ApiPropertyOptional({ type: InsuranceCoverageDto })
  coverage?: InsuranceCoverageDto;

  @ApiProperty()
  isPrimary!: boolean;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  isVerified!: boolean;

  @ApiPropertyOptional()
  verifiedAt?: Date;

  @ApiPropertyOptional()
  notes?: string;

  /**
   * Calculated field: whether the policy is expired
   */
  @ApiProperty({
    description: 'Whether the policy has expired',
  })
  isExpired!: boolean;

  /**
   * Calculated field: days until expiration (negative if expired)
   */
  @ApiPropertyOptional({
    description: 'Days until policy expiration (negative if expired)',
  })
  daysUntilExpiration?: number;
}

/**
 * Response DTO for patient insurance summary
 */
export class PatientInsuranceSummaryDto {
  @ApiProperty({
    description: 'List of all insurance policies',
    type: [InsurancePolicyResponseDto],
  })
  policies!: InsurancePolicyResponseDto[];

  @ApiPropertyOptional({
    description: 'Primary insurance policy',
    type: InsurancePolicyResponseDto,
  })
  primaryPolicy?: InsurancePolicyResponseDto;

  @ApiPropertyOptional({
    description: 'Secondary insurance policy',
    type: InsurancePolicyResponseDto,
  })
  secondaryPolicy?: InsurancePolicyResponseDto;

  @ApiProperty({
    description: 'Total number of active policies',
  })
  activePolicyCount!: number;

  @ApiProperty({
    description: 'Whether the patient has any insurance coverage',
  })
  hasCoverage!: boolean;

  @ApiProperty({
    description: 'Whether all insurance policies have been verified',
  })
  allVerified!: boolean;

  @ApiPropertyOptional({
    description: 'Combined annual maximum from all policies',
  })
  totalAnnualMax?: number;

  @ApiPropertyOptional({
    description: 'Combined remaining benefits from all policies',
  })
  totalRemaining?: number;
}
