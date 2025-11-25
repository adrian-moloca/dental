/**
 * Clinical EHR validation schemas
 * Comprehensive Zod validation for odontogram, perio charts, clinical notes,
 * treatment plans, procedures, and consent forms
 * @module shared-validation/schemas/clinical
 */

import { z } from 'zod';
import {
  UUIDSchema,
  ISODateStringSchema,
  NonEmptyStringSchema,
  PositiveIntSchema,
} from '../common.schemas';

// ============================================================================
// CLINICAL ENUMS (to be added to shared-types/enums.ts)
// ============================================================================

/**
 * Tooth surface for procedures and charting
 */
export enum ToothSurface {
  OCCLUSAL = 'OCCLUSAL', // Biting surface (O)
  MESIAL = 'MESIAL', // Front surface (M)
  DISTAL = 'DISTAL', // Back surface (D)
  BUCCAL = 'BUCCAL', // Cheek-side surface (B)
  LINGUAL = 'LINGUAL', // Tongue-side surface (L)
  FACIAL = 'FACIAL', // Front-facing surface (F)
  INCISAL = 'INCISAL', // Cutting edge (I)
}

/**
 * Tooth condition for odontogram charting
 */
export enum ToothCondition {
  HEALTHY = 'HEALTHY',
  CARIES = 'CARIES', // Cavity
  FILLED = 'FILLED', // Restoration
  CROWN = 'CROWN',
  BRIDGE = 'BRIDGE',
  IMPLANT = 'IMPLANT',
  ROOT_CANAL = 'ROOT_CANAL',
  EXTRACTED = 'EXTRACTED',
  MISSING = 'MISSING',
  FRACTURED = 'FRACTURED',
  ABSCESS = 'ABSCESS',
  IMPACTED = 'IMPACTED',
  PARTIALLY_ERUPTED = 'PARTIALLY_ERUPTED',
}

/**
 * Clinical note type
 */
export enum ClinicalNoteType {
  SOAP = 'SOAP', // Subjective, Objective, Assessment, Plan
  PROGRESS = 'PROGRESS',
  CONSULTATION = 'CONSULTATION',
  EMERGENCY = 'EMERGENCY',
  RECALL = 'RECALL',
  REFERRAL = 'REFERRAL',
  DISCHARGE = 'DISCHARGE',
}

/**
 * Treatment plan status
 */
export enum TreatmentPlanStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

/**
 * Procedure status
 */
export enum ProcedureStatus {
  PLANNED = 'PLANNED',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  INCOMPLETE = 'INCOMPLETE',
}

/**
 * Consent type
 */
export enum ConsentType {
  TREATMENT = 'TREATMENT',
  ANESTHESIA = 'ANESTHESIA',
  SURGERY = 'SURGERY',
  RADIOGRAPH = 'RADIOGRAPH', // X-ray consent
  DATA_SHARING = 'DATA_SHARING',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  RESEARCH = 'RESEARCH',
  TELEHEALTH = 'TELEHEALTH',
}

/**
 * Consent status
 */
export enum ConsentStatus {
  PENDING = 'PENDING',
  GRANTED = 'GRANTED',
  DENIED = 'DENIED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

// ============================================================================
// ODONTOGRAM SCHEMAS
// ============================================================================

/**
 * Tooth number schema (Universal Numbering System: 1-32)
 * Validates tooth numbers for adult permanent dentition
 */
export const ToothNumberSchema = z
  .number()
  .int({ message: 'Tooth number must be an integer' })
  .min(1, 'Tooth number must be between 1 and 32')
  .max(32, 'Tooth number must be between 1 and 32');

export type ToothNumber = z.infer<typeof ToothNumberSchema>;

/**
 * Tooth surface schema
 */
export const ToothSurfaceSchema = z.nativeEnum(ToothSurface, {
  errorMap: (): { message: string } => ({ message: 'Invalid tooth surface' }),
});

export type ToothSurfaceType = z.infer<typeof ToothSurfaceSchema>;

/**
 * Tooth condition schema
 */
export const ToothConditionSchema = z.nativeEnum(ToothCondition, {
  errorMap: (): { message: string } => ({ message: 'Invalid tooth condition' }),
});

export type ToothConditionType = z.infer<typeof ToothConditionSchema>;

/**
 * Tooth status for odontogram entry
 */
export const ToothStatusSchema = z.object({
  condition: ToothConditionSchema,
  surfaces: z.array(ToothSurfaceSchema).optional(),
  notes: z.string().max(500, 'Tooth notes must be 500 characters or less').optional(),
});

export type ToothStatus = z.infer<typeof ToothStatusSchema>;

/**
 * Odontogram entry for a single tooth
 */
export const OdontogramEntrySchema = z.object({
  toothNumber: ToothNumberSchema,
  status: ToothStatusSchema,
  lastUpdated: ISODateStringSchema,
});

export type OdontogramEntry = z.infer<typeof OdontogramEntrySchema>;

/**
 * Update odontogram DTO
 */
export const UpdateOdontogramDtoSchema = z.object({
  patientId: UUIDSchema,
  entries: z
    .array(OdontogramEntrySchema)
    .min(1, 'At least one tooth entry is required')
    .max(32, 'Cannot update more than 32 teeth')
    .refine(
      (entries) => {
        const toothNumbers = entries.map((e) => e.toothNumber);
        return new Set(toothNumbers).size === toothNumbers.length;
      },
      {
        message: 'Duplicate tooth numbers are not allowed',
      },
    ),
  notes: z.string().max(2000, 'Odontogram notes must be 2000 characters or less').optional(),
});

export type UpdateOdontogramDto = z.infer<typeof UpdateOdontogramDtoSchema>;

// ============================================================================
// PERIO CHART SCHEMAS
// ============================================================================

/**
 * Periodontal site measurement (6 sites per tooth)
 */
export const PerioSiteSchema = z.object({
  probingDepth: z
    .number()
    .int({ message: 'Probing depth must be an integer' })
    .min(0, 'Probing depth cannot be negative')
    .max(15, 'Probing depth cannot exceed 15mm'),
  recession: z
    .number()
    .int({ message: 'Recession must be an integer' })
    .min(0, 'Recession cannot be negative')
    .max(15, 'Recession cannot exceed 15mm')
    .optional(),
  bleeding: z.boolean(),
  mobility: z
    .number()
    .int({ message: 'Mobility must be an integer' })
    .min(0, 'Mobility must be between 0 and 3')
    .max(3, 'Mobility must be between 0 and 3')
    .optional(),
});

export type PerioSite = z.infer<typeof PerioSiteSchema>;

/**
 * Periodontal measurements for a single tooth (6 sites)
 */
export const PerioToothSchema = z.object({
  toothNumber: ToothNumberSchema,
  sites: z
    .array(PerioSiteSchema)
    .length(6, 'Exactly 6 sites required per tooth (mesial-buccal, buccal, distal-buccal, mesial-lingual, lingual, distal-lingual)'),
});

export type PerioTooth = z.infer<typeof PerioToothSchema>;

/**
 * Update periodontal chart DTO
 */
export const UpdatePerioChartDtoSchema = z.object({
  patientId: UUIDSchema,
  teeth: z
    .array(PerioToothSchema)
    .min(1, 'At least one tooth measurement is required')
    .max(32, 'Cannot update more than 32 teeth')
    .refine(
      (teeth) => {
        const toothNumbers = teeth.map((t) => t.toothNumber);
        return new Set(toothNumbers).size === toothNumbers.length;
      },
      {
        message: 'Duplicate tooth numbers are not allowed',
      },
    ),
  examDate: ISODateStringSchema,
  examinerId: UUIDSchema,
  notes: z.string().max(2000, 'Perio chart notes must be 2000 characters or less').optional(),
});

export type UpdatePerioChartDto = z.infer<typeof UpdatePerioChartDtoSchema>;

// ============================================================================
// CLINICAL NOTES SCHEMAS
// ============================================================================

/**
 * Clinical note type schema
 */
export const ClinicalNoteTypeSchema = z.nativeEnum(ClinicalNoteType, {
  errorMap: (): { message: string } => ({ message: 'Invalid clinical note type' }),
});

export type ClinicalNoteTypeType = z.infer<typeof ClinicalNoteTypeSchema>;

/**
 * SOAP note content (Subjective, Objective, Assessment, Plan)
 */
export const SOAPNoteSchema = z.object({
  subjective: z.string().max(2000, 'Subjective section must be 2000 characters or less'),
  objective: z.string().max(2000, 'Objective section must be 2000 characters or less'),
  assessment: z.string().max(2000, 'Assessment section must be 2000 characters or less'),
  plan: z.string().max(2000, 'Plan section must be 2000 characters or less'),
});

export type SOAPNote = z.infer<typeof SOAPNoteSchema>;

/**
 * Create clinical note DTO
 */
export const CreateClinicalNoteDtoSchema = z.object({
  patientId: UUIDSchema,
  appointmentId: UUIDSchema.optional(),
  type: ClinicalNoteTypeSchema,
  content: z
    .union([
      SOAPNoteSchema,
      z.object({
        text: z
          .string()
          .min(1, 'Note content is required')
          .max(5000, 'Note content must be 5000 characters or less'),
      }),
    ])
    .describe('SOAP note structure or free-text content'),
  chiefComplaint: z.string().max(500, 'Chief complaint must be 500 characters or less').optional(),
  diagnosis: z.array(z.string().max(200)).max(10, 'Maximum 10 diagnoses allowed').optional(),
  attachments: z.array(UUIDSchema).max(20, 'Maximum 20 attachments allowed').optional(),
  isConfidential: z.boolean().optional().default(false),
});

export type CreateClinicalNoteDto = z.infer<typeof CreateClinicalNoteDtoSchema>;

/**
 * Clinical note entity schema
 */
export const ClinicalNoteSchema = z.object({
  id: UUIDSchema,
  tenantId: UUIDSchema,
  patientId: UUIDSchema,
  appointmentId: UUIDSchema.optional(),
  authorId: UUIDSchema,
  type: ClinicalNoteTypeSchema,
  content: z.union([SOAPNoteSchema, z.object({ text: z.string() })]),
  chiefComplaint: z.string().optional(),
  diagnosis: z.array(z.string()).optional(),
  attachments: z.array(UUIDSchema).optional(),
  isConfidential: z.boolean().default(false),
  signedAt: ISODateStringSchema.optional(),
  signedBy: UUIDSchema.optional(),
  createdAt: ISODateStringSchema,
  updatedAt: ISODateStringSchema,
});

export type ClinicalNote = z.infer<typeof ClinicalNoteSchema>;

// ============================================================================
// TREATMENT PLAN SCHEMAS
// ============================================================================

/**
 * Treatment plan status schema
 */
export const TreatmentPlanStatusSchema = z.nativeEnum(TreatmentPlanStatus, {
  errorMap: (): { message: string } => ({ message: 'Invalid treatment plan status' }),
});

export type TreatmentPlanStatusType = z.infer<typeof TreatmentPlanStatusSchema>;

/**
 * Procedure item in a treatment plan
 */
export const ProcedureItemSchema = z.object({
  code: z
    .string()
    .regex(/^D\d{4}$/, { message: 'Procedure code must follow ADA CDT format (e.g., D0120)' }),
  description: NonEmptyStringSchema.max(200, 'Procedure description must be 200 characters or less'),
  toothNumber: ToothNumberSchema.optional(),
  surfaces: z.array(ToothSurfaceSchema).max(5, 'Maximum 5 surfaces per procedure').optional(),
  fee: z
    .number()
    .nonnegative('Fee cannot be negative')
    .max(100000, 'Fee cannot exceed $100,000')
    .multipleOf(0.01, 'Fee must be in cents precision'),
  insuranceCoverage: z
    .number()
    .min(0, 'Insurance coverage percentage must be between 0 and 100')
    .max(100, 'Insurance coverage percentage must be between 0 and 100')
    .optional(),
  priority: z.enum(['IMMEDIATE', 'SOON', 'FUTURE'], {
    errorMap: (): { message: string } => ({ message: 'Invalid procedure priority' }),
  }),
  notes: z.string().max(500, 'Procedure notes must be 500 characters or less').optional(),
});

export type ProcedureItem = z.infer<typeof ProcedureItemSchema>;

/**
 * Treatment option (alternative treatment approaches)
 */
export const TreatmentOptionSchema = z.object({
  id: UUIDSchema,
  name: NonEmptyStringSchema.max(100, 'Option name must be 100 characters or less'),
  description: z.string().max(1000, 'Option description must be 1000 characters or less'),
  procedures: z
    .array(ProcedureItemSchema)
    .min(1, 'At least one procedure is required per treatment option')
    .max(50, 'Maximum 50 procedures per treatment option'),
  totalFee: z
    .number()
    .nonnegative('Total fee cannot be negative')
    .max(1000000, 'Total fee cannot exceed $1,000,000')
    .multipleOf(0.01, 'Total fee must be in cents precision'),
  estimatedDuration: z
    .number()
    .int({ message: 'Estimated duration must be an integer' })
    .positive('Estimated duration must be positive')
    .max(365, 'Estimated duration cannot exceed 365 days')
    .describe('Estimated treatment duration in days'),
  isRecommended: z.boolean().default(false),
});

export type TreatmentOption = z.infer<typeof TreatmentOptionSchema>;

/**
 * Create treatment plan DTO
 */
export const CreateTreatmentPlanDtoSchema = z.object({
  patientId: UUIDSchema,
  title: NonEmptyStringSchema.max(200, 'Treatment plan title must be 200 characters or less'),
  description: z.string().max(2000, 'Treatment plan description must be 2000 characters or less').optional(),
  options: z
    .array(TreatmentOptionSchema)
    .min(1, 'At least one treatment option is required')
    .max(5, 'Maximum 5 treatment options per plan')
    .refine(
      (options) => {
        const recommendedCount = options.filter((o) => o.isRecommended).length;
        return recommendedCount <= 1;
      },
      {
        message: 'Only one treatment option can be marked as recommended',
      },
    ),
  validUntil: ISODateStringSchema.optional(),
  requiresInsuranceApproval: z.boolean().default(false),
});

export type CreateTreatmentPlanDto = z.infer<typeof CreateTreatmentPlanDtoSchema>;

/**
 * Update treatment plan DTO
 */
export const UpdateTreatmentPlanDtoSchema = z.object({
  title: NonEmptyStringSchema.max(200, 'Treatment plan title must be 200 characters or less').optional(),
  description: z.string().max(2000, 'Treatment plan description must be 2000 characters or less').optional(),
  status: TreatmentPlanStatusSchema.optional(),
  validUntil: ISODateStringSchema.optional(),
  requiresInsuranceApproval: z.boolean().optional(),
});

export type UpdateTreatmentPlanDto = z.infer<typeof UpdateTreatmentPlanDtoSchema>;

/**
 * Accept treatment option DTO
 */
export const AcceptOptionDtoSchema = z.object({
  treatmentPlanId: UUIDSchema,
  optionId: UUIDSchema,
  patientSignature: z.string().min(1, 'Patient signature is required'),
  signedAt: ISODateStringSchema,
  depositAmount: z
    .number()
    .nonnegative('Deposit amount cannot be negative')
    .max(100000, 'Deposit amount cannot exceed $100,000')
    .multipleOf(0.01, 'Deposit amount must be in cents precision')
    .optional(),
});

export type AcceptOptionDto = z.infer<typeof AcceptOptionDtoSchema>;

// ============================================================================
// PROCEDURE SCHEMAS
// ============================================================================

/**
 * Procedure status schema
 */
export const ProcedureStatusSchema = z.nativeEnum(ProcedureStatus, {
  errorMap: (): { message: string } => ({ message: 'Invalid procedure status' }),
});

export type ProcedureStatusType = z.infer<typeof ProcedureStatusSchema>;

/**
 * ADA CDT procedure code schema
 */
export const ProcedureCodeSchema = z
  .string()
  .regex(/^D\d{4}$/, { message: 'Procedure code must follow ADA CDT format (e.g., D0120, D1110)' });

export type ProcedureCode = z.infer<typeof ProcedureCodeSchema>;

/**
 * Create procedure DTO
 */
export const CreateProcedureDtoSchema = z.object({
  patientId: UUIDSchema,
  appointmentId: UUIDSchema.optional(),
  treatmentPlanId: UUIDSchema.optional(),
  code: ProcedureCodeSchema,
  description: NonEmptyStringSchema.max(200, 'Procedure description must be 200 characters or less'),
  toothNumber: ToothNumberSchema.optional(),
  surfaces: z.array(ToothSurfaceSchema).max(5, 'Maximum 5 surfaces per procedure').optional(),
  providerId: UUIDSchema,
  assistantId: UUIDSchema.optional(),
  scheduledDate: ISODateStringSchema.optional(),
  estimatedDuration: PositiveIntSchema.max(480, 'Estimated duration cannot exceed 480 minutes (8 hours)').describe(
    'Duration in minutes',
  ),
  fee: z
    .number()
    .nonnegative('Fee cannot be negative')
    .max(100000, 'Fee cannot exceed $100,000')
    .multipleOf(0.01, 'Fee must be in cents precision'),
  notes: z.string().max(2000, 'Procedure notes must be 2000 characters or less').optional(),
});

export type CreateProcedureDto = z.infer<typeof CreateProcedureDtoSchema>;

/**
 * Complete procedure DTO (with stock items consumed)
 */
export const CompleteProcedureDtoSchema = z.object({
  procedureId: UUIDSchema,
  completedAt: ISODateStringSchema,
  actualDuration: PositiveIntSchema.max(480, 'Actual duration cannot exceed 480 minutes (8 hours)').describe(
    'Duration in minutes',
  ),
  stockItemsUsed: z
    .array(
      z.object({
        itemId: UUIDSchema,
        quantity: PositiveIntSchema.max(1000, 'Quantity cannot exceed 1000 units'),
      }),
    )
    .max(100, 'Maximum 100 stock items per procedure')
    .optional(),
  complications: z.string().max(1000, 'Complications notes must be 1000 characters or less').optional(),
  outcomeNotes: z.string().max(2000, 'Outcome notes must be 2000 characters or less').optional(),
  requiresFollowUp: z.boolean().default(false),
  followUpInDays: PositiveIntSchema.max(365, 'Follow-up period cannot exceed 365 days').optional(),
});

export type CompleteProcedureDto = z.infer<typeof CompleteProcedureDtoSchema>;

/**
 * Procedure entity schema
 */
export const ProcedureSchema = z.object({
  id: UUIDSchema,
  tenantId: UUIDSchema,
  patientId: UUIDSchema,
  appointmentId: UUIDSchema.optional(),
  treatmentPlanId: UUIDSchema.optional(),
  code: ProcedureCodeSchema,
  description: z.string(),
  toothNumber: ToothNumberSchema.optional(),
  surfaces: z.array(ToothSurfaceSchema).optional(),
  providerId: UUIDSchema,
  assistantId: UUIDSchema.optional(),
  status: ProcedureStatusSchema,
  scheduledDate: ISODateStringSchema.optional(),
  completedAt: ISODateStringSchema.optional(),
  estimatedDuration: z.number().int().positive(),
  actualDuration: z.number().int().positive().optional(),
  fee: z.number().nonnegative(),
  stockItemsUsed: z
    .array(
      z.object({
        itemId: UUIDSchema,
        quantity: z.number().int().positive(),
      }),
    )
    .optional(),
  complications: z.string().optional(),
  outcomeNotes: z.string().optional(),
  requiresFollowUp: z.boolean().default(false),
  followUpInDays: z.number().int().positive().optional(),
  notes: z.string().optional(),
  createdAt: ISODateStringSchema,
  updatedAt: ISODateStringSchema,
});

export type Procedure = z.infer<typeof ProcedureSchema>;

// ============================================================================
// CONSENT SCHEMAS
// ============================================================================

/**
 * Consent type schema
 */
export const ClinicalConsentTypeSchema = z.nativeEnum(ConsentType, {
  errorMap: (): { message: string } => ({ message: 'Invalid consent type' }),
});

export type ClinicalConsentTypeType = z.infer<typeof ClinicalConsentTypeSchema>;

/**
 * Consent status schema
 */
export const ConsentStatusSchema = z.nativeEnum(ConsentStatus, {
  errorMap: (): { message: string } => ({ message: 'Invalid consent status' }),
});

export type ConsentStatusType = z.infer<typeof ConsentStatusSchema>;

/**
 * Digital signature schema
 */
export const DigitalSignatureSchema = z.object({
  signatureData: NonEmptyStringSchema.describe('Base64 encoded signature image or hash'),
  ipAddress: z
    .string()
    .ip({ message: 'Invalid IP address' })
    .optional(),
  userAgent: z.string().max(500, 'User agent must be 500 characters or less').optional(),
  signedAt: ISODateStringSchema,
});

export type DigitalSignature = z.infer<typeof DigitalSignatureSchema>;

/**
 * Create consent DTO
 */
export const CreateConsentDtoSchema = z.object({
  patientId: UUIDSchema,
  type: ClinicalConsentTypeSchema,
  procedureId: UUIDSchema.optional(),
  treatmentPlanId: UUIDSchema.optional(),
  title: NonEmptyStringSchema.max(200, 'Consent title must be 200 characters or less'),
  content: NonEmptyStringSchema.max(10000, 'Consent content must be 10000 characters or less').describe(
    'Full consent form text or terms',
  ),
  patientSignature: DigitalSignatureSchema.optional(),
  guardianSignature: DigitalSignatureSchema.optional(),
  witnessSignature: DigitalSignatureSchema.optional(),
  expiresAt: ISODateStringSchema.optional(),
  requiresGuardianConsent: z.boolean().default(false),
});

export type CreateConsentDto = z.infer<typeof CreateConsentDtoSchema>;

/**
 * Consent entity schema
 */
export const ConsentSchema = z.object({
  id: UUIDSchema,
  tenantId: UUIDSchema,
  patientId: UUIDSchema,
  type: ClinicalConsentTypeSchema,
  status: ConsentStatusSchema,
  procedureId: UUIDSchema.optional(),
  treatmentPlanId: UUIDSchema.optional(),
  title: z.string(),
  content: z.string(),
  patientSignature: DigitalSignatureSchema.optional(),
  guardianSignature: DigitalSignatureSchema.optional(),
  witnessSignature: DigitalSignatureSchema.optional(),
  grantedAt: ISODateStringSchema.optional(),
  revokedAt: ISODateStringSchema.optional(),
  expiresAt: ISODateStringSchema.optional(),
  requiresGuardianConsent: z.boolean().default(false),
  createdAt: ISODateStringSchema,
  updatedAt: ISODateStringSchema,
});

export type Consent = z.infer<typeof ConsentSchema>;

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

/**
 * Clinical note query filters
 */
export const ClinicalNoteQuerySchema = z.object({
  patientId: UUIDSchema.optional(),
  appointmentId: UUIDSchema.optional(),
  authorId: UUIDSchema.optional(),
  type: ClinicalNoteTypeSchema.optional(),
  startDate: ISODateStringSchema.optional(),
  endDate: ISODateStringSchema.optional(),
  isConfidential: z.boolean().optional(),
  searchText: z.string().max(100, 'Search text must be 100 characters or less').optional(),
});

export type ClinicalNoteQuery = z.infer<typeof ClinicalNoteQuerySchema>;

/**
 * Treatment plan query filters
 */
export const TreatmentPlanQuerySchema = z.object({
  patientId: UUIDSchema.optional(),
  status: TreatmentPlanStatusSchema.optional(),
  createdAfter: ISODateStringSchema.optional(),
  createdBefore: ISODateStringSchema.optional(),
  requiresInsuranceApproval: z.boolean().optional(),
});

export type TreatmentPlanQuery = z.infer<typeof TreatmentPlanQuerySchema>;

/**
 * Procedure query filters
 */
export const ProcedureQuerySchema = z.object({
  patientId: UUIDSchema.optional(),
  appointmentId: UUIDSchema.optional(),
  treatmentPlanId: UUIDSchema.optional(),
  providerId: UUIDSchema.optional(),
  status: ProcedureStatusSchema.optional(),
  code: ProcedureCodeSchema.optional(),
  toothNumber: ToothNumberSchema.optional(),
  scheduledAfter: ISODateStringSchema.optional(),
  scheduledBefore: ISODateStringSchema.optional(),
  requiresFollowUp: z.boolean().optional(),
});

export type ProcedureQuery = z.infer<typeof ProcedureQuerySchema>;

/**
 * Consent query filters
 */
export const ConsentQuerySchema = z.object({
  patientId: UUIDSchema.optional(),
  type: ClinicalConsentTypeSchema.optional(),
  status: ConsentStatusSchema.optional(),
  procedureId: UUIDSchema.optional(),
  treatmentPlanId: UUIDSchema.optional(),
  expiringBefore: ISODateStringSchema.optional(),
  requiresGuardianConsent: z.boolean().optional(),
});

export type ConsentQuery = z.infer<typeof ConsentQuerySchema>;
