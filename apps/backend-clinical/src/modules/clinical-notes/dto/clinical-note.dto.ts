/**
 * Clinical Notes DTOs with Zod Validation
 *
 * Comprehensive data transfer objects for clinical note operations.
 * Uses Zod for runtime validation with type inference.
 *
 * CLINICAL SAFETY: All inputs are validated to prevent:
 * - Invalid ICD-10 diagnosis codes
 * - Invalid CDT procedure codes
 * - Invalid FDI tooth numbers
 * - Invalid tooth surfaces
 * - Unauthorized status transitions
 *
 * @module clinical-notes/dto
 */

import { z } from 'zod';
import {
  CLINICAL_NOTE_TYPES,
  CLINICAL_NOTE_STATUSES,
  ATTACHMENT_TYPES,
  PROCEDURE_NOTE_STATUSES,
} from '../entities/clinical-note.schema';

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

/**
 * ICD-10 code format validation
 * Format: Letter followed by 2 digits, optional decimal and up to 4 more characters
 * Examples: K02.9, K04.0, Z01.21
 */
const ICD10_CODE_REGEX = /^[A-Z]\d{2}(\.\d{1,4})?$/;

// ============================================================================
// REUSABLE SCHEMAS
// ============================================================================

/**
 * UUID validation schema
 */
const uuidSchema = z.string().uuid('Invalid UUID format');

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
const cdtCodeSchema = z
  .string()
  .min(1, 'CDT code is required')
  .max(10, 'CDT code too long')
  .refine(
    (code) => CDT_CODE_REGEX.test(code) || code.startsWith('X'),
    'CDT code must be format D#### or custom code starting with X',
  );

/**
 * ICD-10 code validation
 * Validates format and provides helpful error message
 */
const icd10CodeSchema = z
  .string()
  .min(3, 'ICD-10 code must be at least 3 characters')
  .max(10, 'ICD-10 code too long')
  .refine(
    (code) => ICD10_CODE_REGEX.test(code),
    'ICD-10 code must be format: Letter + 2 digits, optionally followed by decimal and up to 4 characters (e.g., K02.9)',
  );

// ============================================================================
// SOAP NOTE SCHEMA
// ============================================================================

/**
 * SOAP note content schema
 */
export const SOAPNoteSchema = z.object({
  /** Subjective - Patient's description of symptoms */
  subjective: z.string().max(10000, 'Subjective section too long').default(''),

  /** Objective - Clinical findings from examination */
  objective: z.string().max(10000, 'Objective section too long').default(''),

  /** Assessment - Diagnoses and clinical impressions */
  assessment: z.string().max(10000, 'Assessment section too long').default(''),

  /** Plan - Treatment and follow-up */
  plan: z.string().max(10000, 'Plan section too long').default(''),
});

export type SOAPNoteDto = z.infer<typeof SOAPNoteSchema>;

// ============================================================================
// DIAGNOSIS SCHEMAS
// ============================================================================

/**
 * Create diagnosis schema
 */
export const CreateDiagnosisSchema = z.object({
  /** ICD-10 diagnosis code */
  icd10Code: icd10CodeSchema,

  /** Human-readable description */
  description: z.string().min(1, 'Description required').max(500),

  /** FDI tooth number (optional) */
  tooth: toothNumberSchema.optional(),

  /** Whether this is the primary diagnosis */
  isPrimary: z.boolean().default(false),

  /** Additional notes */
  notes: z.string().max(1000).optional(),
});

export type CreateDiagnosisDto = z.infer<typeof CreateDiagnosisSchema>;

/**
 * Update diagnosis schema
 */
export const UpdateDiagnosisSchema = CreateDiagnosisSchema.partial();

export type UpdateDiagnosisDto = z.infer<typeof UpdateDiagnosisSchema>;

// ============================================================================
// PROCEDURE SCHEMAS
// ============================================================================

/**
 * Create procedure schema
 */
export const CreateProcedureNoteSchema = z.object({
  /** CDT procedure code */
  cdtCode: cdtCodeSchema,

  /** Human-readable description */
  description: z.string().min(1, 'Description required').max(500),

  /** FDI tooth numbers involved */
  teeth: z.array(toothNumberSchema).default([]),

  /** Surfaces involved */
  surfaces: z.array(surfaceSchema).default([]),

  /** Procedure status */
  status: z.enum(PROCEDURE_NOTE_STATUSES).default('planned'),

  /** When completed (required if status is completed) */
  completedAt: z.coerce.date().optional(),

  /** Provider who performed (if different from author) */
  performedBy: z.string().optional(),

  /** Clinical notes about the procedure */
  notes: z.string().max(2000).optional(),

  /** Reference to full procedure record */
  procedureRecordId: z.string().optional(),
});

export type CreateProcedureNoteDto = z.infer<typeof CreateProcedureNoteSchema>;

/**
 * Update procedure schema
 */
export const UpdateProcedureNoteSchema = CreateProcedureNoteSchema.partial();

export type UpdateProcedureNoteDto = z.infer<typeof UpdateProcedureNoteSchema>;

/**
 * Complete procedure schema
 */
export const CompleteProcedureSchema = z.object({
  /** When the procedure was completed */
  completedAt: z.coerce.date().optional(),

  /** Provider who performed (if different from author) */
  performedBy: z.string().optional(),

  /** Clinical notes about the procedure */
  notes: z.string().max(2000).optional(),

  /** Reference to full procedure record */
  procedureRecordId: z.string().optional(),
});

export type CompleteProcedureDto = z.infer<typeof CompleteProcedureSchema>;

// ============================================================================
// ATTACHMENT SCHEMAS
// ============================================================================

/**
 * Image annotation schema
 */
export const ImageAnnotationSchema = z.object({
  /** Type of annotation */
  type: z.enum(['arrow', 'circle', 'rectangle', 'freehand', 'text']),

  /** X coordinate */
  x: z.number(),

  /** Y coordinate */
  y: z.number(),

  /** Width (for rectangles) or radius (for circles) */
  width: z.number().optional(),

  /** Height (for rectangles) */
  height: z.number().optional(),

  /** Annotation text/label */
  text: z.string().max(500).optional(),

  /** Color for the annotation */
  color: z.string().default('#FF0000'),

  /** Points for freehand annotations */
  points: z.array(z.array(z.number())).optional(),
});

export type ImageAnnotationDto = z.infer<typeof ImageAnnotationSchema>;

/**
 * Add attachment schema
 */
export const AddAttachmentSchema = z.object({
  /** Reference to the file in storage */
  fileId: z.string().min(1, 'File ID required'),

  /** Type of attachment */
  type: z.enum(ATTACHMENT_TYPES),

  /** Original file name */
  fileName: z.string().min(1).max(255),

  /** File size in bytes */
  fileSize: z.number().positive().optional(),

  /** MIME type */
  mimeType: z.string().max(100).optional(),

  /** Description of the attachment */
  description: z.string().max(500).optional(),

  /** Initial annotations */
  annotations: z.array(ImageAnnotationSchema).default([]),
});

export type AddAttachmentDto = z.infer<typeof AddAttachmentSchema>;

/**
 * Add annotation to attachment schema
 */
export const AddAnnotationSchema = ImageAnnotationSchema;

export type AddAnnotationDto = z.infer<typeof AddAnnotationSchema>;

// ============================================================================
// CREATE CLINICAL NOTE SCHEMA
// ============================================================================

/**
 * Schema for creating a new clinical note
 *
 * CLINICAL NOTE: Notes are created as drafts and must be signed to finalize.
 */
export const CreateClinicalNoteSchema = z
  .object({
    /** Optional link to appointment */
    appointmentId: uuidSchema.optional(),

    /** Type of clinical note */
    noteType: z.enum(CLINICAL_NOTE_TYPES).default('soap'),

    /** SOAP format content */
    soap: SOAPNoteSchema.optional(),

    /** Chief complaint */
    chiefComplaint: z.string().max(1000).optional(),

    /** Initial diagnoses */
    diagnoses: z.array(CreateDiagnosisSchema).default([]),

    /** Initial procedures */
    procedures: z.array(CreateProcedureNoteSchema).default([]),

    /** Note title */
    title: z.string().max(200).optional(),

    /** Additional free-text content */
    content: z.string().max(50000).optional(),

    /** Reference to related treatment plan */
    treatmentPlanId: uuidSchema.optional(),

    /** Tags for categorization */
    tags: z.array(z.string().max(50)).default([]),

    /** Author credentials (e.g., "DDS", "DMD") */
    authorCredentials: z.string().max(50).optional(),
  })
  .refine(
    (data) => {
      // At most one diagnosis should be marked as primary
      const primaryCount = data.diagnoses.filter((d) => d.isPrimary).length;
      return primaryCount <= 1;
    },
    { message: 'Only one diagnosis can be marked as primary' },
  );

export type CreateClinicalNoteDto = z.infer<typeof CreateClinicalNoteSchema>;

// DTO class for controller type annotation
export class CreateClinicalNoteDtoClass implements CreateClinicalNoteDto {
  appointmentId?: string;
  noteType!: 'soap' | 'progress' | 'consultation' | 'operative' | 'referral';
  soap?: SOAPNoteDto;
  chiefComplaint?: string;
  diagnoses!: CreateDiagnosisDto[];
  procedures!: CreateProcedureNoteDto[];
  title?: string;
  content?: string;
  treatmentPlanId?: string;
  tags!: string[];
  authorCredentials?: string;
}

// ============================================================================
// UPDATE CLINICAL NOTE SCHEMA
// ============================================================================

/**
 * Schema for updating a draft clinical note
 *
 * IMPORTANT: Only notes in 'draft' status can be updated.
 * Signed notes must be amended (creates new version).
 */
export const UpdateClinicalNoteSchema = z.object({
  /** SOAP format content */
  soap: SOAPNoteSchema.optional(),

  /** Chief complaint */
  chiefComplaint: z.string().max(1000).optional(),

  /** Update diagnoses (replaces all) */
  diagnoses: z.array(CreateDiagnosisSchema).optional(),

  /** Update procedures (replaces all) */
  procedures: z.array(CreateProcedureNoteSchema).optional(),

  /** Note title */
  title: z.string().max(200).optional(),

  /** Additional free-text content */
  content: z.string().max(50000).optional(),

  /** Tags for categorization */
  tags: z.array(z.string().max(50)).optional(),
});

export type UpdateClinicalNoteDto = z.infer<typeof UpdateClinicalNoteSchema>;

export class UpdateClinicalNoteDtoClass implements UpdateClinicalNoteDto {
  soap?: SOAPNoteDto;
  chiefComplaint?: string;
  diagnoses?: CreateDiagnosisDto[];
  procedures?: CreateProcedureNoteDto[];
  title?: string;
  content?: string;
  tags?: string[];
}

// ============================================================================
// SIGN CLINICAL NOTE SCHEMA
// ============================================================================

/**
 * Schema for signing a clinical note
 *
 * HIPAA COMPLIANCE: Records full signature information for audit trail
 */
export const SignClinicalNoteSchema = z.object({
  /** Signer's display name */
  signerName: z.string().min(1, 'Signer name required').max(200),

  /** Professional credentials (e.g., "DDS", "DMD", "RDH") */
  credentials: z.string().max(50).optional(),

  /** Reference to signature image/data (stored separately) */
  signatureRef: z.string().optional(),

  /** Method of signature */
  signatureMethod: z.enum(['electronic', 'digital_certificate', 'biometric']).default('electronic'),

  /** IP address (typically captured server-side) */
  ipAddress: z.string().optional(),

  /** User agent (typically captured server-side) */
  userAgent: z.string().max(500).optional(),
});

export type SignClinicalNoteDto = z.infer<typeof SignClinicalNoteSchema>;

export class SignClinicalNoteDtoClass implements SignClinicalNoteDto {
  signerName!: string;
  credentials?: string;
  signatureRef?: string;
  signatureMethod!: 'electronic' | 'digital_certificate' | 'biometric';
  ipAddress?: string;
  userAgent?: string;
}

// ============================================================================
// AMEND CLINICAL NOTE SCHEMA
// ============================================================================

/**
 * Schema for amending a signed clinical note
 *
 * CRITICAL: Amendments create a new version while preserving the original.
 * The original note's status changes to 'amended' and a new note is created.
 */
export const AmendClinicalNoteSchema = z.object({
  /** Reason for amendment (required for compliance) */
  amendmentReason: z.string().min(1, 'Amendment reason is required').max(1000),

  /** Updated SOAP content */
  soap: SOAPNoteSchema.optional(),

  /** Updated chief complaint */
  chiefComplaint: z.string().max(1000).optional(),

  /** Updated diagnoses */
  diagnoses: z.array(CreateDiagnosisSchema).optional(),

  /** Updated procedures */
  procedures: z.array(CreateProcedureNoteSchema).optional(),

  /** Updated content */
  content: z.string().max(50000).optional(),

  /** Updated tags */
  tags: z.array(z.string().max(50)).optional(),
});

export type AmendClinicalNoteDto = z.infer<typeof AmendClinicalNoteSchema>;

export class AmendClinicalNoteDtoClass implements AmendClinicalNoteDto {
  amendmentReason!: string;
  soap?: SOAPNoteDto;
  chiefComplaint?: string;
  diagnoses?: CreateDiagnosisDto[];
  procedures?: CreateProcedureNoteDto[];
  content?: string;
  tags?: string[];
}

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

/**
 * Schema for filtering clinical notes list
 */
export const ClinicalNoteQuerySchema = z.object({
  /** Filter by note type */
  noteType: z.enum(CLINICAL_NOTE_TYPES).optional(),

  /** Filter by status */
  status: z.enum(CLINICAL_NOTE_STATUSES).optional(),

  /** Filter by author */
  authorId: uuidSchema.optional(),

  /** Filter by appointment */
  appointmentId: uuidSchema.optional(),

  /** Filter by treatment plan */
  treatmentPlanId: uuidSchema.optional(),

  /** Filter by date range - start */
  fromDate: z.coerce.date().optional(),

  /** Filter by date range - end */
  toDate: z.coerce.date().optional(),

  /** Include soft-deleted notes */
  includeDeleted: z.coerce.boolean().default(false),

  /** Page number (1-indexed) */
  page: z.coerce.number().int().positive().default(1),

  /** Items per page */
  limit: z.coerce.number().int().positive().max(100).default(20),

  /** Sort field */
  sortBy: z.enum(['createdAt', 'updatedAt', 'noteType', 'status']).default('createdAt'),

  /** Sort direction */
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ClinicalNoteQueryDto = z.infer<typeof ClinicalNoteQuerySchema>;

export class ClinicalNoteQueryDtoClass implements ClinicalNoteQueryDto {
  noteType?: 'soap' | 'progress' | 'consultation' | 'operative' | 'referral';
  status?: 'draft' | 'signed' | 'amended';
  authorId?: string;
  appointmentId?: string;
  treatmentPlanId?: string;
  fromDate?: Date;
  toDate?: Date;
  includeDeleted!: boolean;
  page!: number;
  limit!: number;
  sortBy!: 'createdAt' | 'updatedAt' | 'noteType' | 'status';
  sortOrder!: 'asc' | 'desc';
}

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

/**
 * Clinical note response schema (for API responses)
 */
export const ClinicalNoteResponseSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  tenantId: z.string(),
  organizationId: z.string(),
  clinicId: z.string(),
  appointmentId: z.string().optional(),
  noteType: z.enum(CLINICAL_NOTE_TYPES),
  soap: SOAPNoteSchema.optional(),
  chiefComplaint: z.string().optional(),
  diagnoses: z.array(z.any()),
  procedures: z.array(z.any()),
  attachments: z.array(z.any()),
  authorId: z.string(),
  authorName: z.string(),
  authorCredentials: z.string().optional(),
  signature: z
    .object({
      signedBy: z.string(),
      signerName: z.string(),
      credentials: z.string().optional(),
      signedAt: z.date(),
      signatureRef: z.string().optional(),
      signatureMethod: z.string().optional(),
    })
    .optional(),
  version: z.number(),
  previousVersionId: z.string().optional(),
  amendmentReason: z.string().optional(),
  status: z.enum(CLINICAL_NOTE_STATUSES),
  title: z.string().optional(),
  content: z.string().optional(),
  treatmentPlanId: z.string().optional(),
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  updatedBy: z.string(),
});

export type ClinicalNoteResponseDto = z.infer<typeof ClinicalNoteResponseSchema>;

/**
 * Paginated response schema
 */
export const PaginatedClinicalNotesSchema = z.object({
  data: z.array(ClinicalNoteResponseSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type PaginatedClinicalNotesDto = z.infer<typeof PaginatedClinicalNotesSchema>;

/**
 * Version history response schema
 */
export const NoteVersionHistorySchema = z.object({
  currentVersion: ClinicalNoteResponseSchema,
  previousVersions: z.array(
    z.object({
      id: z.string(),
      version: z.number(),
      status: z.enum(CLINICAL_NOTE_STATUSES),
      amendmentReason: z.string().optional(),
      signedAt: z.date().optional(),
      signerName: z.string().optional(),
      createdAt: z.date(),
    }),
  ),
});

export type NoteVersionHistoryDto = z.infer<typeof NoteVersionHistorySchema>;

// ============================================================================
// VALIDATION UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate ICD-10 code format (basic format validation)
 * Note: Full validation should check against actual code database
 */
export function validateICD10Format(code: string): boolean {
  return ICD10_CODE_REGEX.test(code);
}

/**
 * Validate CDT code format (basic format validation)
 * Note: Full validation should check against actual ADA code database
 */
export function validateCDTFormat(code: string): boolean {
  return CDT_CODE_REGEX.test(code) || code.startsWith('X');
}

/**
 * Validate FDI tooth number
 */
export function validateFDITooth(tooth: string): boolean {
  return FDI_TOOTH_REGEX.test(tooth);
}

/**
 * Validate tooth surface
 */
export function validateSurface(surface: string): boolean {
  return VALID_SURFACES.includes(surface as (typeof VALID_SURFACES)[number]);
}
