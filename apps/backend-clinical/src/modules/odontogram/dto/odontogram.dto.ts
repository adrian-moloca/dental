/**
 * Odontogram DTOs
 *
 * Data Transfer Objects for odontogram operations with comprehensive
 * Zod validation for FDI tooth numbering system.
 *
 * CLINICAL SAFETY: These DTOs enforce strict validation to prevent
 * invalid clinical data from being persisted.
 *
 * @module odontogram/dto
 */

import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ALL_TEETH,
  TOOTH_SURFACES,
  TOOTH_CONDITIONS,
  CONDITION_SEVERITIES,
  RESTORATION_MATERIALS,
  FURCATION_CLASSES,
  PERMANENT_TEETH,
  DECIDUOUS_TEETH,
} from '../entities/odontogram.schema';

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

/**
 * FDI Tooth Number validation schema
 * Validates tooth numbers are in valid FDI format (11-48 permanent, 51-85 deciduous)
 */
export const FDIToothNumberSchema = z.enum(ALL_TEETH as unknown as [string, ...string[]], {
  errorMap: () => ({
    message: `Invalid FDI tooth number. Valid permanent teeth: ${PERMANENT_TEETH.join(', ')}. Valid deciduous teeth: ${DECIDUOUS_TEETH.join(', ')}`,
  }),
});

/**
 * Tooth Surface validation schema
 */
export const ToothSurfaceSchema = z.enum(TOOTH_SURFACES as unknown as [string, ...string[]], {
  errorMap: () => ({
    message: `Invalid tooth surface. Valid surfaces: ${TOOTH_SURFACES.join(', ')}`,
  }),
});

/**
 * Tooth Condition validation schema
 */
export const ToothConditionSchema = z.enum(TOOTH_CONDITIONS as unknown as [string, ...string[]], {
  errorMap: () => ({
    message: `Invalid tooth condition. Valid conditions: ${TOOTH_CONDITIONS.join(', ')}`,
  }),
});

/**
 * Condition Severity validation schema
 */
export const ConditionSeveritySchema = z.enum(
  CONDITION_SEVERITIES as unknown as [string, ...string[]],
);

/**
 * Restoration Material validation schema
 */
export const RestorationMaterialSchema = z.enum(
  RESTORATION_MATERIALS as unknown as [string, ...string[]],
);

/**
 * Furcation Class validation schema
 */
export const FurcationClassSchema = z.enum(FURCATION_CLASSES as unknown as [string, ...string[]]);

/**
 * Mobility Grade validation schema (0-3)
 */
export const MobilityGradeSchema = z.number().int().min(0).max(3);

/**
 * Add Condition Request Schema
 */
export const AddConditionSchema = z
  .object({
    condition: ToothConditionSchema,
    surfaces: z.array(ToothSurfaceSchema).default([]),
    severity: ConditionSeveritySchema.optional(),
    material: RestorationMaterialSchema.optional(),
    notes: z.string().max(2000).optional(),
    procedureId: z.string().uuid().optional(),
    cdtCode: z.string().max(10).optional(),
    recordedAt: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      // Validate that restoration materials are only provided for restoration conditions
      const restorationConditions = [
        'filling',
        'crown',
        'veneer',
        'bridge',
        'onlay_inlay',
        'sealant',
      ];
      if (data.material && !restorationConditions.includes(data.condition)) {
        return false;
      }
      return true;
    },
    {
      message:
        'Material can only be specified for restoration conditions (filling, crown, veneer, bridge, onlay_inlay, sealant)',
    },
  );

/**
 * Update Tooth Request Schema
 */
export const UpdateToothSchema = z
  .object({
    isPresent: z.boolean().optional(),
    isPrimary: z.boolean().optional(),
    isSupernumerary: z.boolean().optional(),
    isImplant: z.boolean().optional(),
    mobility: MobilityGradeSchema.optional(),
    furcation: FurcationClassSchema.optional(),
    notes: z.string().max(2000).optional(),
  })
  .refine(
    (data) => {
      // At least one field must be provided
      return Object.values(data).some((v) => v !== undefined);
    },
    {
      message: 'At least one field must be provided for update',
    },
  );

/**
 * Remove Condition Request Schema
 */
export const RemoveConditionSchema = z.object({
  reason: z.string().min(1).max(500, 'Reason must be between 1 and 500 characters'),
});

/**
 * Get Tooth History Query Schema
 */
export const GetToothHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * Bulk Update Teeth Schema - for updating multiple teeth at once
 */
export const BulkUpdateTeethSchema = z.object({
  teeth: z
    .array(
      z.object({
        toothNumber: FDIToothNumberSchema,
        isPresent: z.boolean().optional(),
        isPrimary: z.boolean().optional(),
        isSupernumerary: z.boolean().optional(),
        isImplant: z.boolean().optional(),
        mobility: MobilityGradeSchema.optional(),
        furcation: FurcationClassSchema.optional(),
        notes: z.string().max(2000).optional(),
        conditions: z.array(AddConditionSchema).optional(),
      }),
    )
    .min(1)
    .max(52), // Max 52 teeth (32 permanent + 20 deciduous)
});

// ============================================================================
// TYPE EXPORTS (inferred from Zod schemas)
// ============================================================================

export type AddConditionInput = z.infer<typeof AddConditionSchema>;
export type UpdateToothInput = z.infer<typeof UpdateToothSchema>;
export type RemoveConditionInput = z.infer<typeof RemoveConditionSchema>;
export type GetToothHistoryQuery = z.infer<typeof GetToothHistoryQuerySchema>;
export type BulkUpdateTeethInput = z.infer<typeof BulkUpdateTeethSchema>;

// ============================================================================
// CLASS-BASED DTOs (for Swagger documentation)
// ============================================================================

/**
 * DTO for adding a condition to a tooth
 */
export class AddConditionDto {
  @ApiProperty({
    description: 'Type of tooth condition',
    enum: TOOTH_CONDITIONS,
    example: 'caries',
  })
  condition!: string;

  @ApiPropertyOptional({
    description: 'Surfaces affected by this condition. Empty array means entire tooth.',
    type: [String],
    enum: TOOTH_SURFACES,
    example: ['M', 'O'],
  })
  surfaces?: string[];

  @ApiPropertyOptional({
    description: 'Severity of the condition',
    enum: CONDITION_SEVERITIES,
    example: 'moderate',
  })
  severity?: string;

  @ApiPropertyOptional({
    description: 'Material used for restoration',
    enum: RESTORATION_MATERIALS,
    example: 'composite',
  })
  material?: string;

  @ApiPropertyOptional({
    description: 'Clinical notes about this condition',
    maxLength: 2000,
    example: 'Class II cavity on MO surfaces',
  })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Reference to the procedure that created this condition',
    format: 'uuid',
  })
  procedureId?: string;

  @ApiPropertyOptional({
    description: 'CDT code associated with this condition',
    maxLength: 10,
    example: 'D2392',
  })
  cdtCode?: string;

  @ApiPropertyOptional({
    description: 'Date when condition was recorded (ISO 8601 format)',
    format: 'date-time',
  })
  recordedAt?: string;
}

/**
 * DTO for updating tooth properties (not conditions)
 */
export class UpdateToothDto {
  @ApiPropertyOptional({
    description: 'Whether the tooth is present in the mouth',
    example: true,
  })
  isPresent?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this is a primary (deciduous) tooth',
    example: false,
  })
  isPrimary?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this is a supernumerary (extra) tooth',
    example: false,
  })
  isSupernumerary?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the tooth has an implant',
    example: false,
  })
  isImplant?: boolean;

  @ApiPropertyOptional({
    description: 'Mobility grade (Miller classification: 0-3)',
    minimum: 0,
    maximum: 3,
    example: 0,
  })
  mobility?: number;

  @ApiPropertyOptional({
    description: 'Furcation involvement class',
    enum: FURCATION_CLASSES,
    example: 'none',
  })
  furcation?: string;

  @ApiPropertyOptional({
    description: 'General clinical notes for this tooth',
    maxLength: 2000,
  })
  notes?: string;
}

/**
 * DTO for removing a condition (soft delete)
 */
export class RemoveConditionDto {
  @ApiProperty({
    description: 'Clinical reason for removing this condition (required for audit trail)',
    minLength: 1,
    maxLength: 500,
    example: 'Condition resolved after treatment',
  })
  reason!: string;
}

/**
 * Query parameters for tooth history endpoint
 */
export class GetToothHistoryQueryDto {
  @ApiPropertyOptional({
    description: 'Maximum number of history records to return',
    minimum: 1,
    maximum: 100,
    default: 50,
  })
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of records to skip',
    minimum: 0,
    default: 0,
  })
  offset?: number;

  @ApiPropertyOptional({
    description: 'Start date filter (ISO 8601 format)',
    format: 'date-time',
  })
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date filter (ISO 8601 format)',
    format: 'date-time',
  })
  endDate?: string;
}

/**
 * Single tooth update for bulk operations
 */
export class BulkToothUpdateDto extends UpdateToothDto {
  @ApiProperty({
    description: 'FDI tooth number',
    example: '16',
    enum: ALL_TEETH,
  })
  toothNumber!: string;

  @ApiPropertyOptional({
    description: 'Conditions to add to this tooth',
    type: [AddConditionDto],
  })
  conditions?: AddConditionDto[];
}

/**
 * DTO for bulk updating multiple teeth
 */
export class BulkUpdateTeethDto {
  @ApiProperty({
    description: 'Array of tooth updates',
    type: [BulkToothUpdateDto],
    minItems: 1,
    maxItems: 52,
  })
  teeth!: BulkToothUpdateDto[];
}

// ============================================================================
// RESPONSE DTOs
// ============================================================================

/**
 * Condition response DTO
 */
export class ConditionResponseDto {
  @ApiProperty({ description: 'Condition ID' })
  id!: string;

  @ApiProperty({ description: 'Type of condition', enum: TOOTH_CONDITIONS })
  condition!: string;

  @ApiProperty({ description: 'Affected surfaces', type: [String] })
  surfaces!: string[];

  @ApiPropertyOptional({ description: 'Severity level' })
  severity?: string;

  @ApiPropertyOptional({ description: 'Material used' })
  material?: string;

  @ApiProperty({ description: 'Date recorded' })
  recordedAt!: Date;

  @ApiProperty({ description: 'Provider who recorded' })
  recordedBy!: string;

  @ApiPropertyOptional({ description: 'Clinical notes' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Associated procedure ID' })
  procedureId?: string;

  @ApiPropertyOptional({ description: 'CDT code' })
  cdtCode?: string;

  @ApiPropertyOptional({ description: 'Soft delete timestamp' })
  deletedAt?: Date;
}

/**
 * Tooth response DTO
 */
export class ToothResponseDto {
  @ApiProperty({ description: 'FDI tooth number', example: '16' })
  toothNumber!: string;

  @ApiProperty({ description: 'Whether tooth is present' })
  isPresent!: boolean;

  @ApiProperty({ description: 'Whether tooth is primary (deciduous)' })
  isPrimary!: boolean;

  @ApiProperty({ description: 'Whether tooth is supernumerary' })
  isSupernumerary!: boolean;

  @ApiProperty({ description: 'Whether tooth has implant' })
  isImplant!: boolean;

  @ApiProperty({ description: 'Active conditions', type: [ConditionResponseDto] })
  conditions!: ConditionResponseDto[];

  @ApiPropertyOptional({ description: 'Mobility grade (0-3)' })
  mobility?: number;

  @ApiPropertyOptional({ description: 'Furcation class' })
  furcation?: string;

  @ApiPropertyOptional({ description: 'Clinical notes' })
  notes?: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;

  @ApiPropertyOptional({ description: 'Last updated by' })
  updatedBy?: string;
}

/**
 * Complete odontogram response DTO
 */
export class OdontogramResponseDto {
  @ApiProperty({ description: 'Odontogram ID' })
  id!: string;

  @ApiProperty({ description: 'Patient ID' })
  patientId!: string;

  @ApiProperty({ description: 'Tenant ID' })
  tenantId!: string;

  @ApiProperty({ description: 'Organization ID' })
  organizationId!: string;

  @ApiProperty({ description: 'Clinic ID' })
  clinicId!: string;

  @ApiProperty({ description: 'Map of teeth data', type: Object })
  teeth!: Record<string, ToothResponseDto>;

  @ApiProperty({ description: 'Numbering system used', example: 'FDI' })
  numberingSystem!: string;

  @ApiProperty({ description: 'Whether patient has adult dentition' })
  isAdultDentition!: boolean;

  @ApiPropertyOptional({ description: 'General notes' })
  generalNotes?: string;

  @ApiProperty({ description: 'Last updated by' })
  updatedBy!: string;

  @ApiProperty({ description: 'Version number' })
  version!: number;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt!: Date;
}

/**
 * Tooth history entry response DTO
 */
export class ToothHistoryEntryDto {
  @ApiProperty({ description: 'History entry ID' })
  id!: string;

  @ApiProperty({ description: 'FDI tooth number' })
  toothNumber!: string;

  @ApiProperty({
    description: 'Type of change',
    enum: ['condition_added', 'condition_removed', 'condition_updated', 'tooth_updated'],
  })
  changeType!: string;

  @ApiPropertyOptional({ description: 'Condition ID affected' })
  conditionId?: string;

  @ApiPropertyOptional({ description: 'Previous state snapshot' })
  previousState?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'New state snapshot' })
  newState?: Record<string, unknown>;

  @ApiProperty({ description: 'User who made the change' })
  changedBy!: string;

  @ApiPropertyOptional({ description: 'Reason for change' })
  reason?: string;

  @ApiPropertyOptional({ description: 'Associated appointment ID' })
  appointmentId?: string;

  @ApiPropertyOptional({ description: 'Associated procedure ID' })
  procedureId?: string;

  @ApiProperty({ description: 'Timestamp of change' })
  createdAt!: Date;
}

/**
 * Paginated tooth history response DTO
 */
export class ToothHistoryResponseDto {
  @ApiProperty({ description: 'History entries', type: [ToothHistoryEntryDto] })
  data!: ToothHistoryEntryDto[];

  @ApiProperty({ description: 'Total count of entries' })
  total!: number;

  @ApiProperty({ description: 'Current page offset' })
  offset!: number;

  @ApiProperty({ description: 'Page size limit' })
  limit!: number;

  @ApiProperty({ description: 'Whether more entries exist' })
  hasMore!: boolean;
}
