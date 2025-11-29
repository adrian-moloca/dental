/**
 * Clinical Intervention DTOs
 *
 * Data Transfer Objects for intervention operations with comprehensive
 * Zod validation for clinical data integrity.
 *
 * CLINICAL SAFETY: These DTOs enforce strict validation to prevent
 * invalid clinical data from being persisted. Key validations:
 * - FDI tooth numbers must be valid (11-48 permanent, 51-85 deciduous)
 * - performedAt cannot be in the future (clinical safety)
 * - followUpDate must be after performedAt
 * - Procedure codes validated against CDT format
 *
 * @module interventions/dto
 */

import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ALL_TEETH,
  TOOTH_SURFACES,
  PERMANENT_TEETH,
  DECIDUOUS_TEETH,
} from '../../odontogram/entities/odontogram.schema';
import {
  INTERVENTION_TYPES,
  INTERVENTION_STATUSES,
  QUADRANTS,
  INTERVENTION_TYPE_LABELS,
  INTERVENTION_CDT_CODES,
  InterventionType,
} from '../entities/intervention.schema';

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

/**
 * FDI Tooth Number validation schema
 */
export const FDIToothNumberSchema = z.enum(ALL_TEETH as unknown as [string, ...string[]], {
  errorMap: () => ({
    message: `Invalid FDI tooth number. Valid permanent teeth: ${PERMANENT_TEETH.join(', ')}. Valid deciduous teeth: ${DECIDUOUS_TEETH.join(', ')}`,
  }),
});

/**
 * Tooth Surface validation schema
 */
export const ToothSurfaceSchema = z.enum(TOOTH_SURFACES as unknown as [string, ...string[]]);

/**
 * Intervention Type validation schema
 */
export const InterventionTypeSchema = z.enum(
  INTERVENTION_TYPES as unknown as [string, ...string[]],
  {
    errorMap: () => ({
      message: `Invalid intervention type. Valid types: ${INTERVENTION_TYPES.join(', ')}`,
    }),
  },
);

/**
 * Intervention Status validation schema
 */
export const InterventionStatusSchema = z.enum(
  INTERVENTION_STATUSES as unknown as [string, ...string[]],
);

/**
 * Quadrant validation schema
 */
export const QuadrantSchema = z.enum(QUADRANTS as unknown as [string, ...string[]]);

/**
 * Attachment input schema
 */
export const AttachmentInputSchema = z.object({
  fileId: z.string().uuid('File ID must be a valid UUID'),
  type: z.enum(['image', 'document']),
  description: z.string().max(500).optional(),
});

/**
 * CDT Code validation - must be in format D#### or similar
 */
export const CDTCodeSchema = z
  .string()
  .max(10)
  .regex(/^D?\d{4}$/i, 'Procedure code must be in CDT format (e.g., D1110 or 1110)')
  .optional();

/**
 * Base intervention input schema with shared validations
 */
const baseInterventionFields = {
  type: InterventionTypeSchema,
  appointmentId: z.string().uuid().optional(),
  performedAt: z
    .string()
    .datetime()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        return new Date(val) <= new Date();
      },
      {
        message:
          'performedAt cannot be in the future - clinical records must reflect actual events',
      },
    ),
  duration: z.number().int().min(0).max(480).optional(), // Max 8 hours
  procedureCode: CDTCodeSchema,
  teeth: z
    .array(FDIToothNumberSchema)
    .default([])
    .refine((arr) => new Set(arr).size === arr.length, {
      message: 'Duplicate tooth numbers are not allowed',
    }),
  surfaces: z.array(ToothSurfaceSchema).default([]),
  quadrant: QuadrantSchema.optional(),
  title: z.string().min(1).max(200, 'Title must be between 1 and 200 characters'),
  description: z.string().max(5000).optional(),
  findings: z.string().max(5000).optional(),
  actionTaken: z.string().max(5000).optional(),
  attachments: z.array(AttachmentInputSchema).default([]),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.string().datetime().optional(),
  followUpNotes: z.string().max(1000).optional(),
  isBillable: z.boolean().default(false),
  billedAmount: z.number().min(0).optional(),
};

/**
 * Create Intervention Request Schema
 */
export const CreateInterventionSchema = z
  .object(baseInterventionFields)
  .refine(
    (_data) => {
      // If followUpRequired is true, followUpDate should ideally be set
      // but we allow it to be optional for flexibility
      return true;
    },
    { message: 'Follow-up date is recommended when follow-up is required' },
  )
  .refine(
    (data) => {
      // followUpDate must be after performedAt
      if (data.followUpDate && data.performedAt) {
        return new Date(data.followUpDate) > new Date(data.performedAt);
      }
      return true;
    },
    { message: 'Follow-up date must be after the intervention was performed' },
  )
  .refine(
    (data) => {
      // If billedAmount is set, isBillable should be true
      if (data.billedAmount !== undefined && data.billedAmount > 0 && !data.isBillable) {
        return false;
      }
      return true;
    },
    { message: 'isBillable must be true when billedAmount is specified' },
  );

/**
 * Quick Intervention Request Schema (minimal data for rapid entry)
 */
export const QuickInterventionSchema = z.object({
  type: InterventionTypeSchema,
  teeth: z.array(FDIToothNumberSchema).default([]),
  notes: z.string().max(2000).optional(),
  appointmentId: z.string().uuid().optional(),
});

/**
 * Update Intervention Request Schema
 */
export const UpdateInterventionSchema = z
  .object({
    appointmentId: z.string().uuid().optional(),
    duration: z.number().int().min(0).max(480).optional(),
    procedureCode: CDTCodeSchema,
    teeth: z.array(FDIToothNumberSchema).optional(),
    surfaces: z.array(ToothSurfaceSchema).optional(),
    quadrant: QuadrantSchema.optional().nullable(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional().nullable(),
    findings: z.string().max(5000).optional().nullable(),
    actionTaken: z.string().max(5000).optional().nullable(),
    followUpRequired: z.boolean().optional(),
    followUpDate: z.string().datetime().optional().nullable(),
    followUpNotes: z.string().max(1000).optional().nullable(),
    isBillable: z.boolean().optional(),
    billedAmount: z.number().min(0).optional(),
    status: z.enum(['completed', 'pending_review']).optional(),
    version: z.number().int().min(1, 'Version is required for optimistic locking'),
  })
  .refine(
    (data) => {
      // At least one field must be provided (besides version)
      const { version: _version, ...rest } = data;
      return Object.values(rest).some((v) => v !== undefined);
    },
    { message: 'At least one field must be provided for update' },
  );

/**
 * Cancel Intervention Request Schema
 */
export const CancelInterventionSchema = z.object({
  reason: z.string().min(1).max(500, 'Cancellation reason must be between 1 and 500 characters'),
  version: z.number().int().min(1, 'Version is required for optimistic locking'),
});

/**
 * Delete Intervention Request Schema
 */
export const DeleteInterventionSchema = z.object({
  reason: z.string().min(1).max(500, 'Deletion reason is required for audit compliance'),
  version: z.number().int().min(1, 'Version is required for optimistic locking'),
});

/**
 * Batch Create Interventions Request Schema
 */
export const BatchCreateInterventionsSchema = z.object({
  interventions: z
    .array(CreateInterventionSchema)
    .min(1, 'At least one intervention is required')
    .max(20, 'Maximum 20 interventions can be created at once'),
});

/**
 * Query Parameters Schema for listing interventions
 */
export const ListInterventionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: InterventionTypeSchema.optional(),
  status: InterventionStatusSchema.optional(),
  providerId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
  toothNumber: FDIToothNumberSchema.optional(),
  isBillable: z.coerce.boolean().optional(),
  followUpRequired: z.coerce.boolean().optional(),
  includeDeleted: z.coerce.boolean().default(false),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateInterventionInput = z.infer<typeof CreateInterventionSchema>;
export type QuickInterventionInput = z.infer<typeof QuickInterventionSchema>;
export type UpdateInterventionInput = z.infer<typeof UpdateInterventionSchema>;
export type CancelInterventionInput = z.infer<typeof CancelInterventionSchema>;
export type DeleteInterventionInput = z.infer<typeof DeleteInterventionSchema>;
export type BatchCreateInterventionsInput = z.infer<typeof BatchCreateInterventionsSchema>;
export type ListInterventionsQuery = z.infer<typeof ListInterventionsQuerySchema>;
export type AttachmentInput = z.infer<typeof AttachmentInputSchema>;

// ============================================================================
// CLASS-BASED DTOs (for Swagger documentation)
// ============================================================================

/**
 * Attachment DTO for Swagger
 */
export class AttachmentDto {
  @ApiProperty({
    description: 'File ID reference in document storage',
    format: 'uuid',
  })
  fileId!: string;

  @ApiProperty({
    description: 'Type of attachment',
    enum: ['image', 'document'],
  })
  type!: 'image' | 'document';

  @ApiPropertyOptional({
    description: 'Optional description of the attachment',
    maxLength: 500,
  })
  description?: string;
}

/**
 * Create Intervention DTO for Swagger
 */
export class CreateInterventionDto {
  @ApiProperty({
    description: 'Type of clinical intervention',
    enum: INTERVENTION_TYPES,
    example: 'fluoride',
  })
  type!: InterventionType;

  @ApiPropertyOptional({
    description: 'Associated appointment ID',
    format: 'uuid',
  })
  appointmentId?: string;

  @ApiPropertyOptional({
    description:
      'When the intervention was performed (ISO 8601). Defaults to now. Cannot be in future.',
    format: 'date-time',
  })
  performedAt?: string;

  @ApiPropertyOptional({
    description: 'Duration of intervention in minutes',
    minimum: 0,
    maximum: 480,
    example: 15,
  })
  duration?: number;

  @ApiPropertyOptional({
    description: 'CDT procedure code for billing',
    maxLength: 10,
    example: 'D1206',
  })
  procedureCode?: string;

  @ApiPropertyOptional({
    description: 'Teeth involved (FDI notation)',
    type: [String],
    example: ['11', '12'],
  })
  teeth?: string[];

  @ApiPropertyOptional({
    description: 'Surfaces involved',
    type: [String],
    enum: TOOTH_SURFACES,
    example: ['M', 'O'],
  })
  surfaces?: string[];

  @ApiPropertyOptional({
    description: 'Quadrant or region',
    enum: QUADRANTS,
  })
  quadrant?: string;

  @ApiProperty({
    description: 'Short title/summary of the intervention',
    maxLength: 200,
    example: 'Fluoride varnish application',
  })
  title!: string;

  @ApiPropertyOptional({
    description: 'Detailed description',
    maxLength: 5000,
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Clinical findings observed',
    maxLength: 5000,
  })
  findings?: string;

  @ApiPropertyOptional({
    description: 'Action taken during intervention',
    maxLength: 5000,
  })
  actionTaken?: string;

  @ApiPropertyOptional({
    description: 'File attachments',
    type: [AttachmentDto],
  })
  attachments?: AttachmentDto[];

  @ApiPropertyOptional({
    description: 'Whether follow-up is required',
    default: false,
  })
  followUpRequired?: boolean;

  @ApiPropertyOptional({
    description: 'When follow-up should occur (must be after performedAt)',
    format: 'date-time',
  })
  followUpDate?: string;

  @ApiPropertyOptional({
    description: 'Notes about required follow-up',
    maxLength: 1000,
  })
  followUpNotes?: string;

  @ApiPropertyOptional({
    description: 'Whether this intervention is billable',
    default: false,
  })
  isBillable?: boolean;

  @ApiPropertyOptional({
    description: 'Amount to bill if billable',
    minimum: 0,
  })
  billedAmount?: number;
}

/**
 * Quick Intervention DTO for rapid entry
 */
export class QuickInterventionDto {
  @ApiProperty({
    description: 'Type of clinical intervention',
    enum: INTERVENTION_TYPES,
    example: 'sensitivity_test',
  })
  type!: InterventionType;

  @ApiPropertyOptional({
    description: 'Teeth involved (FDI notation)',
    type: [String],
    example: ['16'],
  })
  teeth?: string[];

  @ApiPropertyOptional({
    description: 'Quick notes about the intervention',
    maxLength: 2000,
  })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Associated appointment ID',
    format: 'uuid',
  })
  appointmentId?: string;
}

/**
 * Update Intervention DTO
 */
export class UpdateInterventionDto {
  @ApiPropertyOptional({
    description: 'Associated appointment ID',
    format: 'uuid',
  })
  appointmentId?: string;

  @ApiPropertyOptional({
    description: 'Duration in minutes',
    minimum: 0,
  })
  duration?: number;

  @ApiPropertyOptional({
    description: 'CDT procedure code',
    maxLength: 10,
  })
  procedureCode?: string;

  @ApiPropertyOptional({
    description: 'Teeth involved',
    type: [String],
  })
  teeth?: string[];

  @ApiPropertyOptional({
    description: 'Surfaces involved',
    type: [String],
  })
  surfaces?: string[];

  @ApiPropertyOptional({
    description: 'Quadrant',
    enum: QUADRANTS,
  })
  quadrant?: string | null;

  @ApiPropertyOptional({
    description: 'Title',
    maxLength: 200,
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'Description',
    maxLength: 5000,
  })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Findings',
    maxLength: 5000,
  })
  findings?: string | null;

  @ApiPropertyOptional({
    description: 'Action taken',
    maxLength: 5000,
  })
  actionTaken?: string | null;

  @ApiPropertyOptional({
    description: 'Follow-up required',
  })
  followUpRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Follow-up date',
    format: 'date-time',
  })
  followUpDate?: string | null;

  @ApiPropertyOptional({
    description: 'Follow-up notes',
    maxLength: 1000,
  })
  followUpNotes?: string | null;

  @ApiPropertyOptional({
    description: 'Is billable',
  })
  isBillable?: boolean;

  @ApiPropertyOptional({
    description: 'Billed amount',
    minimum: 0,
  })
  billedAmount?: number;

  @ApiPropertyOptional({
    description: 'Status',
    enum: ['completed', 'pending_review'],
  })
  status?: 'completed' | 'pending_review';

  @ApiProperty({
    description: 'Current version for optimistic locking',
    minimum: 1,
  })
  version!: number;
}

/**
 * Cancel Intervention DTO
 */
export class CancelInterventionDto {
  @ApiProperty({
    description: 'Reason for cancellation (required for audit)',
    minLength: 1,
    maxLength: 500,
  })
  reason!: string;

  @ApiProperty({
    description: 'Current version for optimistic locking',
    minimum: 1,
  })
  version!: number;
}

/**
 * Delete Intervention DTO
 */
export class DeleteInterventionDto {
  @ApiProperty({
    description: 'Reason for deletion (required for audit compliance)',
    minLength: 1,
    maxLength: 500,
  })
  reason!: string;

  @ApiProperty({
    description: 'Current version for optimistic locking',
    minimum: 1,
  })
  version!: number;
}

/**
 * Batch Create Interventions DTO
 */
export class BatchCreateInterventionsDto {
  @ApiProperty({
    description: 'Array of interventions to create',
    type: [CreateInterventionDto],
    minItems: 1,
    maxItems: 20,
  })
  interventions!: CreateInterventionDto[];
}

/**
 * Query Parameters DTO for listing interventions
 */
export class ListInterventionsQueryDto {
  @ApiPropertyOptional({
    description: 'Maximum number of results',
    minimum: 1,
    maximum: 100,
    default: 50,
  })
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of results to skip',
    minimum: 0,
    default: 0,
  })
  offset?: number;

  @ApiPropertyOptional({
    description: 'Filter by start date (ISO 8601)',
    format: 'date-time',
  })
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date (ISO 8601)',
    format: 'date-time',
  })
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by intervention type',
    enum: INTERVENTION_TYPES,
  })
  type?: InterventionType;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: INTERVENTION_STATUSES,
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by provider ID',
    format: 'uuid',
  })
  providerId?: string;

  @ApiPropertyOptional({
    description: 'Filter by appointment ID',
    format: 'uuid',
  })
  appointmentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by tooth number (FDI notation)',
  })
  toothNumber?: string;

  @ApiPropertyOptional({
    description: 'Filter by billable status',
  })
  isBillable?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by follow-up required',
  })
  followUpRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Include soft-deleted interventions',
    default: false,
  })
  includeDeleted?: boolean;
}

// ============================================================================
// RESPONSE DTOs
// ============================================================================

/**
 * Attachment Response DTO
 */
export class AttachmentResponseDto {
  @ApiProperty({ description: 'Attachment ID' })
  id!: string;

  @ApiProperty({ description: 'File ID' })
  fileId!: string;

  @ApiProperty({ description: 'Type', enum: ['image', 'document'] })
  type!: 'image' | 'document';

  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @ApiProperty({ description: 'Added at' })
  addedAt!: Date;
}

/**
 * Intervention Response DTO
 */
export class InterventionResponseDto {
  @ApiProperty({ description: 'Intervention ID' })
  id!: string;

  @ApiProperty({ description: 'Tenant ID' })
  tenantId!: string;

  @ApiProperty({ description: 'Patient ID' })
  patientId!: string;

  @ApiProperty({ description: 'Organization ID' })
  organizationId!: string;

  @ApiProperty({ description: 'Clinic ID' })
  clinicId!: string;

  @ApiPropertyOptional({ description: 'Appointment ID' })
  appointmentId?: string;

  @ApiProperty({ description: 'Performed at' })
  performedAt!: Date;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  duration?: number;

  @ApiProperty({ description: 'Provider ID' })
  providerId!: string;

  @ApiProperty({ description: 'Provider name' })
  providerName!: string;

  @ApiProperty({ description: 'Intervention type', enum: INTERVENTION_TYPES })
  type!: InterventionType;

  @ApiPropertyOptional({ description: 'CDT procedure code' })
  procedureCode?: string;

  @ApiProperty({ description: 'Teeth involved', type: [String] })
  teeth!: string[];

  @ApiProperty({ description: 'Surfaces involved', type: [String] })
  surfaces!: string[];

  @ApiPropertyOptional({ description: 'Quadrant', enum: QUADRANTS })
  quadrant?: string;

  @ApiProperty({ description: 'Title' })
  title!: string;

  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Findings' })
  findings?: string;

  @ApiPropertyOptional({ description: 'Action taken' })
  actionTaken?: string;

  @ApiProperty({ description: 'Attachments', type: [AttachmentResponseDto] })
  attachments!: AttachmentResponseDto[];

  @ApiProperty({ description: 'Follow-up required' })
  followUpRequired!: boolean;

  @ApiPropertyOptional({ description: 'Follow-up date' })
  followUpDate?: Date;

  @ApiPropertyOptional({ description: 'Follow-up notes' })
  followUpNotes?: string;

  @ApiProperty({ description: 'Status', enum: INTERVENTION_STATUSES })
  status!: string;

  @ApiPropertyOptional({ description: 'Cancellation reason' })
  cancellationReason?: string;

  @ApiProperty({ description: 'Is billable' })
  isBillable!: boolean;

  @ApiPropertyOptional({ description: 'Billed amount' })
  billedAmount?: number;

  @ApiPropertyOptional({ description: 'Invoice ID' })
  invoiceId?: string;

  @ApiProperty({ description: 'Created at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt!: Date;

  @ApiProperty({ description: 'Version' })
  version!: number;
}

/**
 * Paginated Interventions Response DTO
 */
export class PaginatedInterventionsResponseDto {
  @ApiProperty({ description: 'Intervention records', type: [InterventionResponseDto] })
  data!: InterventionResponseDto[];

  @ApiProperty({ description: 'Total count' })
  total!: number;

  @ApiProperty({ description: 'Offset' })
  offset!: number;

  @ApiProperty({ description: 'Limit' })
  limit!: number;

  @ApiProperty({ description: 'Has more results' })
  hasMore!: boolean;
}

/**
 * Intervention Type Metadata Response
 */
export class InterventionTypeMetadataDto {
  @ApiProperty({ description: 'Type code' })
  type!: InterventionType;

  @ApiProperty({ description: 'English label' })
  labelEn!: string;

  @ApiProperty({ description: 'Romanian label' })
  labelRo!: string;

  @ApiPropertyOptional({ description: 'Default CDT code' })
  defaultCdtCode?: string;
}

/**
 * Intervention Types Response
 */
export class InterventionTypesResponseDto {
  @ApiProperty({ description: 'Available intervention types', type: [InterventionTypeMetadataDto] })
  types!: InterventionTypeMetadataDto[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gets intervention type metadata for the types endpoint
 */
export function getInterventionTypesMetadata(): InterventionTypeMetadataDto[] {
  return INTERVENTION_TYPES.map((type) => ({
    type,
    labelEn: INTERVENTION_TYPE_LABELS[type].en,
    labelRo: INTERVENTION_TYPE_LABELS[type].ro,
    defaultCdtCode: INTERVENTION_CDT_CODES[type],
  }));
}
