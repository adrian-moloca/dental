/**
 * Medical Alerts DTOs
 *
 * Data Transfer Objects for managing patient medical alerts including:
 * - Allergies with severity levels
 * - Medical conditions with ICD-10 codes
 * - Current medications
 * - Patient flags
 *
 * CRITICAL: These DTOs handle safety-critical clinical data.
 * Input validation must be thorough to prevent patient harm.
 *
 * @module modules/patients/dto
 */

import {
  IsString,
  IsNotEmpty,
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

/**
 * Allergy severity levels per clinical standards
 */
export const AllergySeverityValues = ['mild', 'moderate', 'severe', 'life_threatening'] as const;
export type AllergySeverityType = (typeof AllergySeverityValues)[number];

/**
 * Medical condition status values
 */
export const ConditionStatusValues = ['active', 'resolved', 'chronic', 'in_remission'] as const;
export type ConditionStatusType = (typeof ConditionStatusValues)[number];

/**
 * Patient flag type values
 */
export const PatientFlagTypeValues = [
  'anxious',
  'wheelchair',
  'hearing_impaired',
  'vision_impaired',
  'requires_premedication',
  'latex_allergy',
  'needle_phobic',
  'gag_reflex',
  'special_needs',
  'vip',
  'staff_family',
  'high_risk',
  'language_barrier',
  'payment_plan',
  'collections',
  'legal_guardian_required',
  'do_not_contact',
  'other',
] as const;
export type PatientFlagTypeValue = (typeof PatientFlagTypeValues)[number];

// ============================================================================
// Allergy DTOs
// ============================================================================

/**
 * DTO for creating a new allergy entry
 */
export class CreateAllergyDto {
  @ApiProperty({
    description: 'Name of the allergen (e.g., Penicillin, Latex, Lidocaine)',
    example: 'Penicillin',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  allergen!: string;

  @ApiProperty({
    description: 'Severity of the allergic reaction',
    enum: AllergySeverityValues,
    example: 'severe',
  })
  @IsEnum(AllergySeverityValues)
  @IsNotEmpty()
  severity!: AllergySeverityType;

  @ApiPropertyOptional({
    description: 'Description of the allergic reaction',
    example: 'Anaphylaxis, difficulty breathing',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reaction?: string;

  @ApiPropertyOptional({
    description: 'Date when the allergy was first observed',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  onsetDate?: Date;

  @ApiPropertyOptional({
    description: 'Date when the allergy was clinically verified',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  verifiedDate?: Date;

  @ApiPropertyOptional({
    description: 'Provider who verified the allergy',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  verifiedBy?: string;

  @ApiPropertyOptional({
    description: 'Additional clinical notes about the allergy',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}

/**
 * DTO for updating an existing allergy entry
 */
export class UpdateAllergyDto {
  @ApiPropertyOptional({
    description: 'Name of the allergen',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  allergen?: string;

  @ApiPropertyOptional({
    description: 'Severity of the allergic reaction',
    enum: AllergySeverityValues,
  })
  @IsEnum(AllergySeverityValues)
  @IsOptional()
  severity?: AllergySeverityType;

  @ApiPropertyOptional({
    description: 'Description of the allergic reaction',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reaction?: string;

  @ApiPropertyOptional({
    description: 'Date when the allergy was first observed',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  onsetDate?: Date;

  @ApiPropertyOptional({
    description: 'Date when the allergy was clinically verified',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  verifiedDate?: Date;

  @ApiPropertyOptional({
    description: 'Provider who verified the allergy',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  verifiedBy?: string;

  @ApiPropertyOptional({
    description: 'Additional clinical notes',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Whether the allergy is still active',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// ============================================================================
// Medical Condition DTOs
// ============================================================================

/**
 * DTO for creating a new medical condition entry
 */
export class CreateMedicalConditionDto {
  @ApiProperty({
    description: 'Name of the medical condition',
    example: 'Type 2 Diabetes Mellitus',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({
    description: 'ICD-10-CM code for the condition',
    example: 'E11.9',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^[A-Z]\d{2}(\.\d{1,4})?$/, {
    message: 'ICD-10 code must be in valid format (e.g., E11.9, K02.51)',
  })
  icd10Code?: string;

  @ApiPropertyOptional({
    description: 'Current status of the condition',
    enum: ConditionStatusValues,
    default: 'active',
  })
  @IsEnum(ConditionStatusValues)
  @IsOptional()
  status?: ConditionStatusType;

  @ApiPropertyOptional({
    description: 'Severity of the condition',
    enum: AllergySeverityValues,
  })
  @IsEnum(AllergySeverityValues)
  @IsOptional()
  severity?: AllergySeverityType;

  @ApiPropertyOptional({
    description: 'Date when the condition was diagnosed',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  diagnosedDate?: Date;

  @ApiPropertyOptional({
    description: 'Provider who made the diagnosis',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  diagnosedBy?: string;

  @ApiPropertyOptional({
    description: 'Additional clinical notes',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}

/**
 * DTO for updating an existing medical condition entry
 */
export class UpdateMedicalConditionDto {
  @ApiPropertyOptional({
    description: 'Name of the medical condition',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    description: 'ICD-10-CM code for the condition',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^[A-Z]\d{2}(\.\d{1,4})?$/, {
    message: 'ICD-10 code must be in valid format (e.g., E11.9, K02.51)',
  })
  icd10Code?: string;

  @ApiPropertyOptional({
    description: 'Current status of the condition',
    enum: ConditionStatusValues,
  })
  @IsEnum(ConditionStatusValues)
  @IsOptional()
  status?: ConditionStatusType;

  @ApiPropertyOptional({
    description: 'Severity of the condition',
    enum: AllergySeverityValues,
  })
  @IsEnum(AllergySeverityValues)
  @IsOptional()
  severity?: AllergySeverityType;

  @ApiPropertyOptional({
    description: 'Date when the condition was diagnosed',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  diagnosedDate?: Date;

  @ApiPropertyOptional({
    description: 'Date when the condition was resolved',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  resolvedDate?: Date;

  @ApiPropertyOptional({
    description: 'Provider who made the diagnosis',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  diagnosedBy?: string;

  @ApiPropertyOptional({
    description: 'Additional clinical notes',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Whether the condition is still active for tracking',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// ============================================================================
// Medication DTOs
// ============================================================================

/**
 * DTO for creating a new medication entry
 */
export class CreateMedicationDto {
  @ApiProperty({
    description: 'Brand name of the medication',
    example: 'Metformin',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({
    description: 'Generic name of the medication',
    example: 'Metformin Hydrochloride',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  genericName?: string;

  @ApiPropertyOptional({
    description: 'Dosage of the medication',
    example: '500mg',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  dosage?: string;

  @ApiPropertyOptional({
    description: 'Frequency of administration',
    example: 'Twice daily with meals',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  frequency?: string;

  @ApiPropertyOptional({
    description: 'Route of administration',
    example: 'oral',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  route?: string;

  @ApiPropertyOptional({
    description: 'Date when the medication was started',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Date when the medication was/will be stopped',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Provider who prescribed the medication',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  prescribedBy?: string;

  @ApiPropertyOptional({
    description: 'Reason for taking the medication',
    example: 'Blood sugar control',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({
    description: 'Additional notes about the medication',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}

/**
 * DTO for updating an existing medication entry
 */
export class UpdateMedicationDto {
  @ApiPropertyOptional({
    description: 'Brand name of the medication',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    description: 'Generic name of the medication',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  genericName?: string;

  @ApiPropertyOptional({
    description: 'Dosage of the medication',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  dosage?: string;

  @ApiPropertyOptional({
    description: 'Frequency of administration',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  frequency?: string;

  @ApiPropertyOptional({
    description: 'Route of administration',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  route?: string;

  @ApiPropertyOptional({
    description: 'Date when the medication was started',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Date when the medication was/will be stopped',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Provider who prescribed the medication',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  prescribedBy?: string;

  @ApiPropertyOptional({
    description: 'Reason for taking the medication',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Whether the medication is currently active',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// ============================================================================
// Patient Flag DTOs
// ============================================================================

/**
 * DTO for creating a new patient flag
 */
export class CreatePatientFlagDto {
  @ApiProperty({
    description: 'Type of the patient flag',
    enum: PatientFlagTypeValues,
    example: 'anxious',
  })
  @IsEnum(PatientFlagTypeValues)
  @IsNotEmpty()
  type!: PatientFlagTypeValue;

  @ApiPropertyOptional({
    description: 'Additional description for the flag',
    example: 'Patient experiences severe dental anxiety, recommend sedation',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Expiration date for temporary flags',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expiresAt?: Date;
}

/**
 * DTO for updating an existing patient flag
 */
export class UpdatePatientFlagDto {
  @ApiPropertyOptional({
    description: 'Type of the patient flag',
    enum: PatientFlagTypeValues,
  })
  @IsEnum(PatientFlagTypeValues)
  @IsOptional()
  type?: PatientFlagTypeValue;

  @ApiPropertyOptional({
    description: 'Additional description for the flag',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Expiration date for temporary flags',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expiresAt?: Date;

  @ApiPropertyOptional({
    description: 'Whether the flag is still active',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// ============================================================================
// Medical Alerts Container DTO
// ============================================================================

/**
 * DTO for updating all medical alerts at once
 */
export class UpdateMedicalAlertsDto {
  @ApiPropertyOptional({ type: [CreateAllergyDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateAllergyDto)
  allergies?: CreateAllergyDto[];

  @ApiPropertyOptional({ type: [CreateMedicalConditionDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateMedicalConditionDto)
  conditions?: CreateMedicalConditionDto[];

  @ApiPropertyOptional({ type: [CreateMedicationDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateMedicationDto)
  medications?: CreateMedicationDto[];

  @ApiPropertyOptional({ type: [CreatePatientFlagDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePatientFlagDto)
  flags?: CreatePatientFlagDto[];
}

/**
 * Response DTO for medical alerts
 */
export class MedicalAlertsResponseDto {
  @ApiProperty({
    description: 'Patient allergies with severity levels',
    type: [CreateAllergyDto],
  })
  allergies!: CreateAllergyDto[];

  @ApiProperty({
    description: 'Medical conditions with ICD-10 codes',
    type: [CreateMedicalConditionDto],
  })
  conditions!: CreateMedicalConditionDto[];

  @ApiProperty({
    description: 'Current medications',
    type: [CreateMedicationDto],
  })
  medications!: CreateMedicationDto[];

  @ApiProperty({
    description: 'Patient flags',
    type: [CreatePatientFlagDto],
  })
  flags!: CreatePatientFlagDto[];

  @ApiPropertyOptional({
    description: 'Timestamp of last medical history review',
  })
  lastReviewedAt?: Date;

  @ApiPropertyOptional({
    description: 'Provider who last reviewed the medical history',
  })
  lastReviewedBy?: string;

  /**
   * Count of life-threatening allergies for quick clinical reference
   */
  @ApiProperty({
    description: 'Number of life-threatening allergies',
  })
  criticalAllergyCount!: number;

  /**
   * Count of active conditions
   */
  @ApiProperty({
    description: 'Number of active medical conditions',
  })
  activeConditionCount!: number;

  /**
   * Count of active medications
   */
  @ApiProperty({
    description: 'Number of active medications',
  })
  activeMedicationCount!: number;

  /**
   * Count of active flags
   */
  @ApiProperty({
    description: 'Number of active patient flags',
  })
  activeFlagCount!: number;
}
