import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsPositive,
  IsString,
  IsArray,
  IsUUID,
  IsOptional,
  Min,
  Max,
  Length,
} from 'class-validator';

/**
 * DTO for updating clinic-specific settings
 * Controls scheduling, billing, clinical, inventory, and notification preferences
 */
export class UpdateClinicSettingsDto {
  // ===== Scheduling Settings =====

  @ApiProperty({
    description: 'Default appointment duration in minutes',
    example: 30,
    minimum: 5,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(5)
  defaultAppointmentDurationMinutes?: number;

  @ApiProperty({
    description: 'Allow patients to book appointments online',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  allowOnlineBooking?: boolean;

  @ApiProperty({
    description: 'Require deposit payment when booking online',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  requireDepositForBooking?: boolean;

  @ApiProperty({
    description: 'Deposit amount as percentage of total treatment cost',
    example: 20,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Min(0)
  @Max(100)
  depositPercentage?: number;

  @ApiProperty({
    description: 'Cancellation policy - minimum hours notice required',
    example: 24,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  cancellationPolicyHours?: number;

  // ===== Billing Settings =====

  @ApiProperty({
    description: 'Default currency code (ISO 4217)',
    example: 'USD',
    minLength: 3,
    maxLength: 3,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  defaultCurrency?: string;

  @ApiProperty({
    description: 'Accepted payment methods',
    example: ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'INSURANCE'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  acceptedPaymentMethods?: string[];

  @ApiProperty({
    description: 'Invoice number prefix for this clinic',
    example: 'SDG-DT',
    maxLength: 10,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Max(10)
  invoicePrefix?: string;

  @ApiProperty({
    description: 'Default tax rate percentage',
    example: 8.5,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Min(0)
  @Max(100)
  taxRate?: number;

  @ApiProperty({
    description: 'Send automatic payment reminders to patients',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  sendAutomaticReminders?: boolean;

  // ===== Clinical Settings =====

  @ApiProperty({
    description: 'Use electronic health records for patient data',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  useElectronicRecords?: boolean;

  @ApiProperty({
    description: 'Require signed consent forms before treatment',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  requireConsentForTreatment?: boolean;

  @ApiProperty({
    description: 'Default consent form template IDs to use',
    example: ['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  defaultConsentFormIds?: string[];

  // ===== Inventory Settings =====

  @ApiProperty({
    description: 'Enable inventory tracking for supplies and materials',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enableInventoryTracking?: boolean;

  @ApiProperty({
    description: 'Low stock threshold for automatic alerts',
    example: 10,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(1)
  lowStockThreshold?: number;

  @ApiProperty({
    description: 'Automatically reorder when stock falls below threshold',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  autoReorderEnabled?: boolean;

  // ===== Sterilization Settings =====

  @ApiProperty({
    description: 'Enable sterilization cycle tracking',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enableSterilizationTracking?: boolean;

  @ApiProperty({
    description: 'Require biological indicators for each sterilization cycle',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  requireBiologicalIndicators?: boolean;

  @ApiProperty({
    description: 'Sterilization cycle number prefix',
    example: 'STZ-DT',
    maxLength: 10,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Max(10)
  sterilizationCyclePrefix?: string;

  // ===== Marketing Settings =====

  @ApiProperty({
    description: 'Enable patient loyalty rewards program',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enableLoyaltyProgram?: boolean;

  @ApiProperty({
    description: 'Loyalty points earned per dollar spent',
    example: 1.5,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @Min(0)
  loyaltyPointsPerDollar?: number;

  @ApiProperty({
    description: 'Enable referral rewards program',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enableReferralRewards?: boolean;

  // ===== Notification Settings =====

  @ApiProperty({
    description: 'Send appointment reminder notifications to patients',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  sendAppointmentReminders?: boolean;

  @ApiProperty({
    description: 'Hours before appointment to send reminders',
    example: [24, 2],
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  reminderHoursBefore?: number[];

  @ApiProperty({
    description: 'Send post-treatment follow-up messages',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  sendPostTreatmentFollowup?: boolean;

  @ApiProperty({
    description: 'Days after treatment to send follow-up',
    example: 7,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(1)
  followupDaysAfter?: number;
}
