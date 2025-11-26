/**
 * Treatment Plan DTOs with Zod Validation
 *
 * Comprehensive data transfer objects for treatment plan operations.
 * Uses Zod for runtime validation with type inference.
 *
 * CLINICAL SAFETY: All inputs are validated to prevent:
 * - Invalid procedure codes
 * - Invalid tooth numbers (FDI format)
 * - Invalid surface designations
 * - Negative financial values
 * - Invalid status transitions
 *
 * @module treatment-plans/dto
 */

import { z } from 'zod';
import {
  TREATMENT_PLAN_STATUSES,
  PROCEDURE_ITEM_STATUSES,
  PAYMENT_FREQUENCIES,
  APPROVAL_TYPES,
} from '../entities/treatment-plan.schema';

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate FDI tooth number format
 * FDI format: 2 digits, first is quadrant (1-4 permanent, 5-8 deciduous), second is tooth (1-8)
 * Examples: 11 (upper right central incisor), 48 (lower right third molar)
 */
const FDI_TOOTH_REGEX = /^[1-8][1-8]$/;

/**
 * Valid tooth surfaces
 * M = Mesial, O = Occlusal, D = Distal, B = Buccal, L = Lingual, I = Incisal, F = Facial
 */
const VALID_SURFACES = ['M', 'O', 'D', 'B', 'L', 'I', 'F'] as const;

/**
 * CDT code format validation (D followed by 4 digits)
 */
const CDT_CODE_REGEX = /^D\d{4}$/;

// ============================================================================
// REUSABLE SCHEMAS
// ============================================================================

/**
 * UUID validation schema
 */
const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Non-negative integer in cents
 */
const centsSchema = z
  .number()
  .int('Amount must be an integer (cents)')
  .nonnegative('Amount cannot be negative');

/**
 * Percentage validation (0-100)
 */
const percentSchema = z.number().min(0).max(100, 'Percentage must be between 0 and 100');

/**
 * FDI tooth number validation
 */
const toothNumberSchema = z.string().regex(FDI_TOOTH_REGEX, {
  message: 'Invalid FDI tooth number format. Must be 2 digits (e.g., 11, 48)',
});

/**
 * Tooth surface validation
 */
const surfaceSchema = z.enum(VALID_SURFACES, {
  errorMap: () => ({ message: `Surface must be one of: ${VALID_SURFACES.join(', ')}` }),
});

/**
 * CDT procedure code validation
 * Allows D followed by 4 digits, or custom codes starting with X
 */
const procedureCodeSchema = z
  .string()
  .min(1, 'Procedure code is required')
  .max(10, 'Procedure code too long')
  .refine(
    (code) => CDT_CODE_REGEX.test(code) || code.startsWith('X'),
    'Procedure code must be CDT format (D####) or custom (X...)',
  );

// ============================================================================
// MATERIAL REQUIREMENT SCHEMA
// ============================================================================

export const MaterialRequirementSchema = z.object({
  catalogItemId: z.string().min(1, 'Catalog item ID is required'),
  itemName: z.string().min(1, 'Item name is required').max(200),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().max(50).optional(),
  estimatedCost: centsSchema.optional(),
});

export type MaterialRequirementDto = z.infer<typeof MaterialRequirementSchema>;

// ============================================================================
// TREATMENT PLAN ITEM SCHEMAS
// ============================================================================

/**
 * Schema for creating a new procedure item
 */
export const CreateTreatmentPlanItemSchema = z.object({
  procedureCode: procedureCodeSchema,
  procedureName: z.string().min(1, 'Procedure name is required').max(500),
  teeth: z.array(toothNumberSchema).default([]),
  surfaces: z.array(surfaceSchema).default([]),
  quantity: z.number().int().positive().default(1),
  unitPriceCents: centsSchema,
  discountCents: centsSchema.default(0),
  discountPercent: percentSchema.default(0),
  taxCents: centsSchema.default(0),
  providerId: uuidSchema.optional(),
  providerName: z.string().max(200).optional(),
  materials: z.array(MaterialRequirementSchema).default([]),
  estimatedDurationMinutes: z.number().int().positive().optional(),
  notes: z.string().max(2000).optional(),
  sortOrder: z.number().int().nonnegative().default(0),
});

export type CreateTreatmentPlanItemDto = z.infer<typeof CreateTreatmentPlanItemSchema>;

/**
 * Schema for updating an existing procedure item
 */
export const UpdateTreatmentPlanItemSchema = CreateTreatmentPlanItemSchema.partial().extend({
  status: z.enum(PROCEDURE_ITEM_STATUSES).optional(),
});

export type UpdateTreatmentPlanItemDto = z.infer<typeof UpdateTreatmentPlanItemSchema>;

// ============================================================================
// TREATMENT PHASE SCHEMAS
// ============================================================================

/**
 * Schema for creating a new treatment phase
 */
export const CreateTreatmentPhaseSchema = z.object({
  phaseNumber: z.number().int().positive(),
  name: z.string().min(1, 'Phase name is required').max(200),
  description: z.string().max(1000).optional(),
  sequenceRequired: z.boolean().default(false),
  items: z.array(CreateTreatmentPlanItemSchema).min(1, 'At least one item is required'),
  sortOrder: z.number().int().nonnegative().default(0),
});

export type CreateTreatmentPhaseDto = z.infer<typeof CreateTreatmentPhaseSchema>;

/**
 * Schema for updating a treatment phase
 */
export const UpdateTreatmentPhaseSchema = z.object({
  phaseNumber: z.number().int().positive().optional(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  sequenceRequired: z.boolean().optional(),
  items: z.array(CreateTreatmentPlanItemSchema).optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export type UpdateTreatmentPhaseDto = z.infer<typeof UpdateTreatmentPhaseSchema>;

// ============================================================================
// TREATMENT ALTERNATIVE SCHEMAS
// ============================================================================

/**
 * Schema for creating a treatment alternative
 */
export const CreateTreatmentAlternativeSchema = z.object({
  name: z.string().min(1, 'Alternative name is required').max(200),
  description: z.string().max(2000).optional(),
  phases: z.array(CreateTreatmentPhaseSchema).min(1, 'At least one phase is required'),
  advantages: z.array(z.string().max(500)).default([]),
  disadvantages: z.array(z.string().max(500)).default([]),
  isRecommended: z.boolean().default(false),
});

export type CreateTreatmentAlternativeDto = z.infer<typeof CreateTreatmentAlternativeSchema>;

// ============================================================================
// PAYMENT PLAN SCHEMA
// ============================================================================

export const PaymentPlanSchema = z.object({
  downPaymentCents: centsSchema,
  installments: z.number().int().positive().max(60, 'Maximum 60 installments'),
  frequency: z.enum(PAYMENT_FREQUENCIES),
  interestRatePercent: percentSchema.default(0),
});

export type PaymentPlanDto = z.infer<typeof PaymentPlanSchema>;

// ============================================================================
// FINANCIAL OVERRIDE SCHEMA
// ============================================================================

export const FinancialOverrideSchema = z.object({
  insuranceCoverageCents: centsSchema.optional(),
  patientResponsibilityCents: centsSchema.optional(),
  currency: z.string().length(3).default('RON'),
  paymentPlan: PaymentPlanSchema.optional(),
});

export type FinancialOverrideDto = z.infer<typeof FinancialOverrideSchema>;

// ============================================================================
// CREATE TREATMENT PLAN SCHEMA
// ============================================================================

/**
 * Schema for creating a new treatment plan
 *
 * CLINICAL NOTE: A treatment plan must have at least one phase.
 * Financials are auto-calculated from items but can be overridden.
 */
export const CreateTreatmentPlanSchema = z
  .object({
    title: z.string().max(200).optional(),
    description: z.string().max(5000).optional(),
    phases: z.array(CreateTreatmentPhaseSchema).min(1, 'At least one treatment phase is required'),
    alternatives: z.array(CreateTreatmentAlternativeSchema).default([]),
    financialOverrides: FinancialOverrideSchema.optional(),
    expiresAt: z.coerce.date().optional(),
    preAuthorizationNumber: z.string().max(100).optional(),
    preAuthorizationStatus: z.enum(['pending', 'approved', 'denied', 'not_required']).optional(),
    clinicalNoteId: uuidSchema.optional(),
    appointmentId: uuidSchema.optional(),
    providerNotes: z.string().max(5000).optional(),
    tags: z.array(z.string().max(50)).default([]),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  })
  .refine(
    (data) => {
      // Only one alternative can be recommended
      const recommendedCount = data.alternatives.filter((a) => a.isRecommended).length;
      return recommendedCount <= 1;
    },
    { message: 'Only one alternative can be marked as recommended' },
  );

export type CreateTreatmentPlanDto = z.infer<typeof CreateTreatmentPlanSchema>;

// DTO class for controller type annotation
export class CreateTreatmentPlanDtoClass implements CreateTreatmentPlanDto {
  title?: string;
  description?: string;
  phases!: CreateTreatmentPhaseDto[];
  alternatives!: CreateTreatmentAlternativeDto[];
  financialOverrides?: FinancialOverrideDto;
  expiresAt?: Date;
  preAuthorizationNumber?: string;
  preAuthorizationStatus?: 'pending' | 'approved' | 'denied' | 'not_required';
  clinicalNoteId?: string;
  appointmentId?: string;
  providerNotes?: string;
  tags!: string[];
  priority!: 'low' | 'normal' | 'high' | 'urgent';
}

// ============================================================================
// UPDATE TREATMENT PLAN SCHEMA
// ============================================================================

/**
 * Schema for updating a treatment plan (draft status only)
 */
export const UpdateTreatmentPlanSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  phases: z.array(CreateTreatmentPhaseSchema).optional(),
  alternatives: z.array(CreateTreatmentAlternativeSchema).optional(),
  financialOverrides: FinancialOverrideSchema.optional(),
  expiresAt: z.coerce.date().optional(),
  preAuthorizationNumber: z.string().max(100).optional(),
  preAuthorizationStatus: z.enum(['pending', 'approved', 'denied', 'not_required']).optional(),
  providerNotes: z.string().max(5000).optional(),
  tags: z.array(z.string().max(50)).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
});

export type UpdateTreatmentPlanDto = z.infer<typeof UpdateTreatmentPlanSchema>;

export class UpdateTreatmentPlanDtoClass implements UpdateTreatmentPlanDto {
  title?: string;
  description?: string;
  phases?: CreateTreatmentPhaseDto[];
  alternatives?: CreateTreatmentAlternativeDto[];
  financialOverrides?: FinancialOverrideDto;
  expiresAt?: Date;
  preAuthorizationNumber?: string;
  preAuthorizationStatus?: 'pending' | 'approved' | 'denied' | 'not_required';
  providerNotes?: string;
  tags?: string[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

// ============================================================================
// PRESENT TREATMENT PLAN SCHEMA
// ============================================================================

/**
 * Schema for presenting a treatment plan to patient
 */
export const PresentTreatmentPlanSchema = z.object({
  /** Notes from the presentation session */
  presentationNotes: z.string().max(5000).optional(),
  /** Patient questions recorded during presentation */
  patientQuestions: z.array(z.string().max(1000)).default([]),
  /** Set expiration date for the proposal */
  expiresAt: z.coerce.date().optional(),
});

export type PresentTreatmentPlanDto = z.infer<typeof PresentTreatmentPlanSchema>;

export class PresentTreatmentPlanDtoClass implements PresentTreatmentPlanDto {
  presentationNotes?: string;
  patientQuestions!: string[];
  expiresAt?: Date;
}

// ============================================================================
// ACCEPT TREATMENT PLAN SCHEMA
// ============================================================================

/**
 * Schema for patient accepting a treatment plan
 *
 * HIPAA COMPLIANCE: Captures consent information for audit trail
 */
export const AcceptTreatmentPlanSchema = z.object({
  /** Type of approver */
  approvedBy: z.enum(APPROVAL_TYPES),
  /** Approver's user ID (patient ID for patient approval) */
  approverId: z.string().min(1, 'Approver ID is required'),
  /** Approver name for display */
  approverName: z.string().min(1, 'Approver name is required').max(200),
  /** Reference to signature (stored separately) */
  signatureRef: z.string().optional(),
  /** Reference to consent form document */
  consentFormId: uuidSchema.optional(),
  /** Consent form version */
  consentFormVersion: z.string().max(20).optional(),
  /** IP address for audit */
  ipAddress: z.string().optional(),
  /** User agent string for audit */
  userAgent: z.string().max(500).optional(),
  /** Method of approval */
  approvalMethod: z.enum(['electronic', 'in-person', 'verbal', 'written']).optional(),
  /** Additional notes */
  notes: z.string().max(1000).optional(),
  /** ID of selected alternative (if choosing an alternative option) */
  selectedAlternativeId: z.string().optional(),
});

export type AcceptTreatmentPlanDto = z.infer<typeof AcceptTreatmentPlanSchema>;

export class AcceptTreatmentPlanDtoClass implements AcceptTreatmentPlanDto {
  approvedBy!: 'patient' | 'provider' | 'insurance' | 'guardian';
  approverId!: string;
  approverName!: string;
  signatureRef?: string;
  consentFormId?: string;
  consentFormVersion?: string;
  ipAddress?: string;
  userAgent?: string;
  approvalMethod?: 'electronic' | 'in-person' | 'verbal' | 'written';
  notes?: string;
  selectedAlternativeId?: string;
}

// ============================================================================
// COMPLETE PROCEDURE ITEM SCHEMA
// ============================================================================

/**
 * Schema for marking a procedure item as completed
 *
 * CRITICAL: This triggers:
 * - Billing (creates invoice line item)
 * - Inventory (deducts materials)
 * - Updates odontogram (if tooth-specific)
 */
export const CompleteProcedureItemSchema = z.object({
  /** Reference to the completed procedure record */
  completedProcedureId: uuidSchema.optional(),
  /** Actual materials used (may differ from planned) */
  materialsUsed: z
    .array(
      z.object({
        catalogItemId: z.string().min(1),
        itemName: z.string().min(1),
        quantity: z.number().positive(),
        batchNumber: z.string().optional(),
        lotNumber: z.string().optional(),
      }),
    )
    .default([]),
  /** Clinical notes about the procedure */
  notes: z.string().max(2000).optional(),
  /** Actual duration in minutes */
  actualDurationMinutes: z.number().int().positive().optional(),
  /** Provider who performed (if different from assigned) */
  performedBy: uuidSchema.optional(),
  /** Outcome of the procedure */
  outcome: z.enum(['successful', 'partial', 'failed', 'complicated']).default('successful'),
});

export type CompleteProcedureItemDto = z.infer<typeof CompleteProcedureItemSchema>;

export class CompleteProcedureItemDtoClass implements CompleteProcedureItemDto {
  completedProcedureId?: string;
  materialsUsed!: Array<{
    catalogItemId: string;
    itemName: string;
    quantity: number;
    batchNumber?: string;
    lotNumber?: string;
  }>;
  notes?: string;
  actualDurationMinutes?: number;
  performedBy?: string;
  outcome!: 'successful' | 'partial' | 'failed' | 'complicated';
}

// ============================================================================
// CANCEL TREATMENT PLAN SCHEMA
// ============================================================================

/**
 * Schema for cancelling a treatment plan
 */
export const CancelTreatmentPlanSchema = z.object({
  /** Reason for cancellation (required for audit) */
  reason: z.string().min(1, 'Cancellation reason is required').max(1000),
  /** Additional notes */
  notes: z.string().max(2000).optional(),
});

export type CancelTreatmentPlanDto = z.infer<typeof CancelTreatmentPlanSchema>;

export class CancelTreatmentPlanDtoClass implements CancelTreatmentPlanDto {
  reason!: string;
  notes?: string;
}

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

/**
 * Schema for filtering treatment plans list
 */
export const TreatmentPlanQuerySchema = z.object({
  status: z.enum(TREATMENT_PLAN_STATUSES).optional(),
  providerId: uuidSchema.optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  includeDeleted: z.coerce.boolean().default(false),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'presentedAt', 'acceptedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type TreatmentPlanQueryDto = z.infer<typeof TreatmentPlanQuerySchema>;

export class TreatmentPlanQueryDtoClass implements TreatmentPlanQueryDto {
  status?: 'draft' | 'presented' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  providerId?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  fromDate?: Date;
  toDate?: Date;
  includeDeleted!: boolean;
  page!: number;
  limit!: number;
  sortBy!: 'createdAt' | 'updatedAt' | 'presentedAt' | 'acceptedAt';
  sortOrder!: 'asc' | 'desc';
}

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

/**
 * Treatment plan response schema (for API responses)
 */
export const TreatmentPlanResponseSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  providerId: z.string(),
  providerName: z.string().optional(),
  tenantId: z.string(),
  organizationId: z.string(),
  clinicId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(TREATMENT_PLAN_STATUSES),
  phases: z.array(z.any()), // Full phase details
  alternatives: z.array(z.any()).default([]),
  selectedAlternativeId: z.string().optional(),
  financial: z.object({
    subtotalCents: z.number(),
    discountTotalCents: z.number(),
    taxTotalCents: z.number(),
    totalCents: z.number(),
    insuranceCoverageCents: z.number().optional(),
    patientResponsibilityCents: z.number().optional(),
    currency: z.string(),
    paymentPlan: z.any().optional(),
  }),
  approvals: z.array(z.any()).default([]),
  presentedAt: z.date().optional(),
  presentedBy: z.string().optional(),
  acceptedAt: z.date().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  cancelledAt: z.date().optional(),
  expiresAt: z.date().optional(),
  priority: z.string(),
  tags: z.array(z.string()),
  version: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  updatedBy: z.string(),
});

export type TreatmentPlanResponseDto = z.infer<typeof TreatmentPlanResponseSchema>;

/**
 * Paginated response schema
 */
export const PaginatedTreatmentPlansSchema = z.object({
  data: z.array(TreatmentPlanResponseSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type PaginatedTreatmentPlansDto = z.infer<typeof PaginatedTreatmentPlansSchema>;
