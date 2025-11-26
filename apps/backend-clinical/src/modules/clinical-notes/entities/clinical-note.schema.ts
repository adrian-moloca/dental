/**
 * Clinical Note Schema
 *
 * MongoDB schema for SOAP clinical notes in dental practice management.
 * Supports multiple note types, digital signatures, amendments, and full audit trail.
 *
 * CLINICAL SAFETY NOTE: Clinical notes are legal medical records that:
 * - Cannot be deleted (soft delete only, with audit trail)
 * - Cannot be edited after signing (must create amendment)
 * - Must track all changes with user attribution
 * - Require digital signature for finalization
 *
 * HIPAA COMPLIANCE:
 * - All access is logged
 * - All changes create immutable history records
 * - Provider can only sign their own notes
 * - Notes older than 24 hours cannot be edited (even drafts)
 *
 * @module clinical-notes/entities
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Valid clinical note types
 *
 * - soap: Standard Subjective, Objective, Assessment, Plan format
 * - progress: Follow-up visit documentation
 * - consultation: Specialist consultation notes
 * - operative: Procedure/surgery documentation
 * - referral: Referral documentation to specialists
 */
export const CLINICAL_NOTE_TYPES = [
  'soap',
  'progress',
  'consultation',
  'operative',
  'referral',
] as const;

export type ClinicalNoteType = (typeof CLINICAL_NOTE_TYPES)[number];

/**
 * Valid clinical note statuses
 *
 * State machine:
 * - draft -> signed (provider signs)
 * - signed -> amended (amendment created, original stays signed)
 * - amended -> (terminal state for original, new version is created)
 */
export const CLINICAL_NOTE_STATUSES = ['draft', 'signed', 'amended'] as const;
export type ClinicalNoteStatus = (typeof CLINICAL_NOTE_STATUSES)[number];

/**
 * Valid status transitions
 */
export const VALID_NOTE_STATUS_TRANSITIONS: Record<ClinicalNoteStatus, ClinicalNoteStatus[]> = {
  draft: ['signed'],
  signed: ['amended'],
  amended: [], // Terminal state (the original note stays amended, new version is created)
};

/**
 * Attachment types
 */
export const ATTACHMENT_TYPES = ['image', 'pdf', 'dicom'] as const;
export type AttachmentType = (typeof ATTACHMENT_TYPES)[number];

/**
 * Procedure status within a note
 */
export const PROCEDURE_NOTE_STATUSES = ['planned', 'completed'] as const;
export type ProcedureNoteStatus = (typeof PROCEDURE_NOTE_STATUSES)[number];

/**
 * Edit window in milliseconds (24 hours)
 * CLINICAL RULE: Draft notes cannot be edited after 24 hours
 */
export const DRAFT_EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

// ============================================================================
// EMBEDDED SCHEMAS
// ============================================================================

/**
 * SOAP Note Structure
 *
 * Standard medical documentation format:
 * - Subjective: Patient's complaints and symptoms (in their words)
 * - Objective: Provider's clinical findings, vitals, exam results
 * - Assessment: Diagnoses and clinical impressions
 * - Plan: Treatment plan, prescriptions, follow-up instructions
 */
@Schema({ _id: false })
export class SOAPNote {
  /**
   * Subjective - Patient's description of symptoms
   * "What the patient tells you"
   * Examples: "I have pain when chewing", "Tooth is sensitive to cold"
   */
  @Prop({ type: String, maxlength: 10000 })
  subjective!: string;

  /**
   * Objective - Clinical findings from examination
   * "What you observe"
   * Examples: Vital signs, exam findings, test results
   */
  @Prop({ type: String, maxlength: 10000 })
  objective!: string;

  /**
   * Assessment - Diagnoses and clinical impressions
   * "What you think is happening"
   * Examples: Diagnosis codes, differential diagnoses
   */
  @Prop({ type: String, maxlength: 10000 })
  assessment!: string;

  /**
   * Plan - Treatment and follow-up
   * "What you're going to do"
   * Examples: Procedures, prescriptions, referrals, follow-up schedule
   */
  @Prop({ type: String, maxlength: 10000 })
  plan!: string;
}

export const SOAPNoteSchema = SchemaFactory.createForClass(SOAPNote);

/**
 * Diagnosis entry with ICD-10 coding
 *
 * CLINICAL SAFETY: ICD-10 codes must be validated against current code sets.
 * Dental-specific codes are in the K00-K14 range.
 */
@Schema({ _id: true })
export class Diagnosis {
  @Prop({ type: Types.ObjectId, auto: true })
  _id!: Types.ObjectId;

  /**
   * ICD-10 diagnosis code
   * Examples: K02.9 (Dental caries, unspecified), K04.0 (Pulpitis)
   */
  @Prop({ required: true, type: String, maxlength: 10 })
  icd10Code!: string;

  /**
   * Human-readable description of the diagnosis
   */
  @Prop({ required: true, type: String, maxlength: 500 })
  description!: string;

  /**
   * FDI tooth number if tooth-specific diagnosis
   * Examples: "11", "48"
   */
  @Prop({ type: String, maxlength: 2 })
  tooth?: string;

  /**
   * Whether this is the primary diagnosis for the visit
   */
  @Prop({ type: Boolean, default: false })
  isPrimary!: boolean;

  /**
   * Additional notes about the diagnosis
   */
  @Prop({ type: String, maxlength: 1000 })
  notes?: string;
}

export const DiagnosisSchema = SchemaFactory.createForClass(Diagnosis);

/**
 * Procedure entry with CDT coding
 *
 * CLINICAL SAFETY: CDT codes must be validated against current ADA code sets.
 * CDT codes are updated annually (effective January 1).
 */
@Schema({ _id: true })
export class ProcedureNote {
  @Prop({ type: Types.ObjectId, auto: true })
  _id!: Types.ObjectId;

  /**
   * CDT procedure code
   * Format: D followed by 4 digits (e.g., D2391, D0120)
   */
  @Prop({ required: true, type: String, maxlength: 10 })
  cdtCode!: string;

  /**
   * Human-readable procedure description
   */
  @Prop({ required: true, type: String, maxlength: 500 })
  description!: string;

  /**
   * FDI tooth numbers involved (can be multiple for bridges, etc.)
   */
  @Prop({ type: [String], default: [] })
  teeth!: string[];

  /**
   * Tooth surfaces involved (M, O, D, B, L, I, F)
   */
  @Prop({ type: [String], default: [] })
  surfaces!: string[];

  /**
   * Procedure status in this note
   */
  @Prop({
    required: true,
    type: String,
    enum: PROCEDURE_NOTE_STATUSES,
    default: 'planned',
  })
  status!: ProcedureNoteStatus;

  /**
   * When the procedure was completed
   */
  @Prop({ type: Date })
  completedAt?: Date;

  /**
   * Provider who performed the procedure (if different from note author)
   */
  @Prop({ type: String })
  performedBy?: string;

  /**
   * Clinical notes about the procedure
   */
  @Prop({ type: String, maxlength: 2000 })
  notes?: string;

  /**
   * Reference to the full procedure record if completed
   */
  @Prop({ type: String })
  procedureRecordId?: string;
}

export const ProcedureNoteSchema = SchemaFactory.createForClass(ProcedureNote);

/**
 * Image annotation for clinical images
 *
 * Supports marking areas of interest on radiographs, photos, etc.
 */
@Schema({ _id: true })
export class ImageAnnotation {
  @Prop({ type: Types.ObjectId, auto: true })
  _id!: Types.ObjectId;

  /**
   * Type of annotation (arrow, circle, rectangle, freehand, text)
   */
  @Prop({ required: true, type: String, maxlength: 50 })
  type!: string;

  /**
   * X coordinate (percentage or pixels)
   */
  @Prop({ required: true, type: Number })
  x!: number;

  /**
   * Y coordinate (percentage or pixels)
   */
  @Prop({ required: true, type: Number })
  y!: number;

  /**
   * Width (for rectangles) or radius (for circles)
   */
  @Prop({ type: Number })
  width?: number;

  /**
   * Height (for rectangles)
   */
  @Prop({ type: Number })
  height?: number;

  /**
   * Annotation text/label
   */
  @Prop({ type: String, maxlength: 500 })
  text?: string;

  /**
   * Color for the annotation
   */
  @Prop({ type: String, default: '#FF0000' })
  color?: string;

  /**
   * Points for freehand annotations
   */
  @Prop({ type: [[Number]], default: [] })
  points?: number[][];

  /**
   * User who created the annotation
   */
  @Prop({ required: true, type: String })
  createdBy!: string;

  /**
   * When the annotation was created
   */
  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;
}

export const ImageAnnotationSchema = SchemaFactory.createForClass(ImageAnnotation);

/**
 * Attachment reference
 *
 * Links to files stored in the document management system
 */
@Schema({ _id: true })
export class Attachment {
  @Prop({ type: Types.ObjectId, auto: true })
  _id!: Types.ObjectId;

  /**
   * Reference to the file in storage
   */
  @Prop({ required: true, type: String })
  fileId!: string;

  /**
   * Type of attachment
   */
  @Prop({ required: true, type: String, enum: ATTACHMENT_TYPES })
  type!: AttachmentType;

  /**
   * Original file name
   */
  @Prop({ required: true, type: String, maxlength: 255 })
  fileName!: string;

  /**
   * File size in bytes
   */
  @Prop({ type: Number })
  fileSize?: number;

  /**
   * MIME type
   */
  @Prop({ type: String, maxlength: 100 })
  mimeType?: string;

  /**
   * Description of the attachment
   */
  @Prop({ type: String, maxlength: 500 })
  description?: string;

  /**
   * Annotations on the image (if applicable)
   */
  @Prop({ type: [ImageAnnotationSchema], default: [] })
  annotations!: ImageAnnotation[];

  /**
   * User who uploaded the attachment
   */
  @Prop({ required: true, type: String })
  uploadedBy!: string;

  /**
   * When the attachment was uploaded
   */
  @Prop({ type: Date, default: Date.now })
  uploadedAt!: Date;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);

/**
 * Digital signature record
 *
 * HIPAA COMPLIANCE: Full audit trail of signature including
 * timestamp, IP, and method of verification
 */
@Schema({ _id: false })
export class DigitalSignature {
  /**
   * User ID of the signer
   */
  @Prop({ required: true, type: String })
  signedBy!: string;

  /**
   * Display name of the signer
   */
  @Prop({ required: true, type: String, maxlength: 200 })
  signerName!: string;

  /**
   * Professional credentials (e.g., "DDS", "DMD", "RDH")
   */
  @Prop({ type: String, maxlength: 50 })
  credentials?: string;

  /**
   * Timestamp of signature
   */
  @Prop({ required: true, type: Date })
  signedAt!: Date;

  /**
   * Reference to signature image/data (stored separately for security)
   */
  @Prop({ type: String })
  signatureRef?: string;

  /**
   * Method of signature (electronic, digital certificate, etc.)
   */
  @Prop({ type: String, maxlength: 50, default: 'electronic' })
  signatureMethod?: string;

  /**
   * IP address at time of signing
   */
  @Prop({ type: String })
  ipAddress?: string;

  /**
   * User agent at time of signing
   */
  @Prop({ type: String, maxlength: 500 })
  userAgent?: string;

  /**
   * Hash of note content at time of signing (for integrity verification)
   */
  @Prop({ type: String })
  contentHash?: string;
}

export const DigitalSignatureSchema = SchemaFactory.createForClass(DigitalSignature);

// ============================================================================
// MAIN CLINICAL NOTE SCHEMA
// ============================================================================

/**
 * Clinical Note Document
 *
 * Complete clinical encounter documentation with SOAP format support,
 * diagnoses, procedures, attachments, and digital signatures.
 *
 * CRITICAL LEGAL REQUIREMENTS:
 * 1. Notes cannot be deleted - only soft deleted with full audit trail
 * 2. Signed notes cannot be modified - amendments create new versions
 * 3. All changes must be attributed to a specific user
 * 4. Providers can only sign their own notes
 * 5. Draft notes cannot be edited after 24 hours
 */
@Schema({
  timestamps: true,
  collection: 'clinical_notes',
  optimisticConcurrency: true,
})
export class ClinicalNote {
  /**
   * Patient this note is for
   */
  @Prop({ required: true, type: String, index: true })
  patientId!: string;

  /**
   * Tenant identifier for multi-tenant isolation
   * CRITICAL: All queries MUST include tenantId
   */
  @Prop({ required: true, type: String, index: true })
  tenantId!: string;

  /**
   * Organization identifier
   */
  @Prop({ required: true, type: String, index: true })
  organizationId!: string;

  /**
   * Clinic where the note was created
   */
  @Prop({ required: true, type: String, index: true })
  clinicId!: string;

  /**
   * Optional link to appointment
   */
  @Prop({ type: String })
  appointmentId?: string;

  /**
   * Type of clinical note
   */
  @Prop({
    required: true,
    type: String,
    enum: CLINICAL_NOTE_TYPES,
    default: 'soap',
  })
  noteType!: ClinicalNoteType;

  /**
   * SOAP format note content
   */
  @Prop({ type: SOAPNoteSchema })
  soap?: SOAPNote;

  /**
   * Chief complaint - the main reason for the visit
   */
  @Prop({ type: String, maxlength: 1000 })
  chiefComplaint?: string;

  /**
   * Diagnoses for this encounter
   */
  @Prop({ type: [DiagnosisSchema], default: [] })
  diagnoses!: Diagnosis[];

  /**
   * Procedures documented in this note
   */
  @Prop({ type: [ProcedureNoteSchema], default: [] })
  procedures!: ProcedureNote[];

  /**
   * Attachments (images, PDFs, DICOM files)
   */
  @Prop({ type: [AttachmentSchema], default: [] })
  attachments!: Attachment[];

  /**
   * Provider who authored the note
   */
  @Prop({ required: true, type: String, index: true })
  authorId!: string;

  /**
   * Author's display name (denormalized for performance)
   */
  @Prop({ required: true, type: String, maxlength: 200 })
  authorName!: string;

  /**
   * Author's credentials (denormalized)
   */
  @Prop({ type: String, maxlength: 50 })
  authorCredentials?: string;

  /**
   * Digital signature information (when signed)
   */
  @Prop({ type: DigitalSignatureSchema })
  signature?: DigitalSignature;

  /**
   * Current version number (increments with amendments)
   */
  @Prop({ type: Number, default: 1, min: 1 })
  version!: number;

  /**
   * Reference to previous version (for amendments)
   * Points to the note this is an amendment of
   */
  @Prop({ type: String })
  previousVersionId?: string;

  /**
   * Reason for amendment (required when amending)
   */
  @Prop({ type: String, maxlength: 1000 })
  amendmentReason?: string;

  /**
   * Current status of the note
   */
  @Prop({
    required: true,
    type: String,
    enum: CLINICAL_NOTE_STATUSES,
    default: 'draft',
  })
  status!: ClinicalNoteStatus;

  /**
   * Optional note title
   */
  @Prop({ type: String, maxlength: 200 })
  title?: string;

  /**
   * Additional free-text content
   */
  @Prop({ type: String, maxlength: 50000 })
  content?: string;

  /**
   * Reference to related treatment plan
   */
  @Prop({ type: String })
  treatmentPlanId?: string;

  /**
   * Tags for categorization
   */
  @Prop({ type: [String], default: [] })
  tags!: string[];

  /**
   * User who created the note
   */
  @Prop({ required: true, type: String })
  createdBy!: string;

  /**
   * User who last updated the note
   */
  @Prop({ required: true, type: String })
  updatedBy!: string;

  /**
   * Schema version for migrations
   */
  @Prop({ type: Number, default: 1 })
  schemaVersion!: number;

  /**
   * Soft delete timestamp
   * CLINICAL SAFETY: Clinical notes are NEVER hard deleted
   */
  @Prop({ type: Date })
  deletedAt?: Date;

  /**
   * User who soft deleted the note
   */
  @Prop({ type: String })
  deletedBy?: string;

  /**
   * Reason for soft deletion
   */
  @Prop({ type: String, maxlength: 1000 })
  deleteReason?: string;

  /**
   * Timestamp when the note was created
   * Automatically managed by Mongoose timestamps: true
   * Non-optional because Mongoose guarantees this field is set
   */
  createdAt!: Date;

  /**
   * Timestamp when the note was last updated
   * Automatically managed by Mongoose timestamps: true
   * Non-optional because Mongoose guarantees this field is set
   */
  updatedAt!: Date;
}

export type ClinicalNoteDocument = ClinicalNote & Document;

export const ClinicalNoteSchema = SchemaFactory.createForClass(ClinicalNote);

// ============================================================================
// INDEXES
// ============================================================================

// Primary lookup: patient's notes within tenant (most common query)
ClinicalNoteSchema.index(
  { patientId: 1, tenantId: 1, status: 1, createdAt: -1 },
  { name: 'patient_tenant_status_idx' },
);

// Provider's notes (for signature workflow)
ClinicalNoteSchema.index(
  { authorId: 1, tenantId: 1, status: 1, createdAt: -1 },
  { name: 'author_tenant_status_idx' },
);

// Appointment-linked notes
ClinicalNoteSchema.index(
  { appointmentId: 1, tenantId: 1 },
  { name: 'appointment_idx', sparse: true },
);

// Treatment plan linked notes
ClinicalNoteSchema.index(
  { treatmentPlanId: 1, tenantId: 1 },
  { name: 'treatment_plan_idx', sparse: true },
);

// Amendment chain (finding versions)
ClinicalNoteSchema.index(
  { previousVersionId: 1 },
  { name: 'amendment_chain_idx', sparse: true },
);

// Clinic-level queries
ClinicalNoteSchema.index(
  { clinicId: 1, tenantId: 1, createdAt: -1 },
  { name: 'clinic_tenant_idx' },
);

// Find unsigned drafts older than 24 hours (compliance monitoring)
ClinicalNoteSchema.index(
  { tenantId: 1, status: 1, createdAt: 1 },
  {
    name: 'draft_notes_idx',
    partialFilterExpression: { status: 'draft' },
  },
);

// Soft delete filter
ClinicalNoteSchema.index(
  { tenantId: 1, deletedAt: 1 },
  { name: 'soft_delete_idx', sparse: true },
);

// ============================================================================
// HISTORY SCHEMA (AUDIT TRAIL)
// ============================================================================

/**
 * Clinical Note History - Immutable audit trail for all changes
 *
 * HIPAA COMPLIANCE: Complete audit trail of all modifications.
 * Records are NEVER deleted from this collection.
 *
 * This collection is append-only and stores:
 * - All creations, updates, and deletions
 * - Status transitions (draft -> signed -> amended)
 * - Who made each change and when
 * - Full document snapshots for critical changes
 */
@Schema({
  timestamps: true,
  collection: 'clinical_note_history',
})
export class ClinicalNoteHistory {
  /**
   * Reference to the clinical note
   */
  @Prop({ required: true, type: String, index: true })
  clinicalNoteId!: string;

  /**
   * Patient ID (denormalized for efficient patient history queries)
   */
  @Prop({ required: true, type: String, index: true })
  patientId!: string;

  /**
   * Tenant for multi-tenant isolation
   */
  @Prop({ required: true, type: String, index: true })
  tenantId!: string;

  /**
   * Organization ID
   */
  @Prop({ required: true, type: String })
  organizationId!: string;

  /**
   * Clinic ID
   */
  @Prop({ required: true, type: String })
  clinicId!: string;

  /**
   * Type of change
   */
  @Prop({
    required: true,
    type: String,
    enum: [
      'created',
      'updated',
      'signed',
      'amended',
      'attachment_added',
      'attachment_removed',
      'diagnosis_added',
      'diagnosis_updated',
      'procedure_added',
      'procedure_completed',
      'deleted',
      'accessed', // For read access audit
    ],
  })
  changeType!: string;

  /**
   * Previous status (for status changes)
   */
  @Prop({ type: String })
  previousStatus?: string;

  /**
   * New status (for status changes)
   */
  @Prop({ type: String })
  newStatus?: string;

  /**
   * Note version at time of change
   */
  @Prop({ type: Number })
  version?: number;

  /**
   * Snapshot of changed fields
   */
  @Prop({ type: Object })
  changes?: Record<string, unknown>;

  /**
   * Full document snapshot (for critical changes like signing)
   */
  @Prop({ type: Object })
  documentSnapshot?: Record<string, unknown>;

  /**
   * User who made the change
   */
  @Prop({ required: true, type: String })
  changedBy!: string;

  /**
   * Display name of user who made change
   */
  @Prop({ type: String, maxlength: 200 })
  changedByName?: string;

  /**
   * Reason for change (required for amendments, optional for others)
   */
  @Prop({ type: String, maxlength: 1000 })
  reason?: string;

  /**
   * IP address of user making change
   */
  @Prop({ type: String })
  ipAddress?: string;

  /**
   * User agent string
   */
  @Prop({ type: String })
  userAgent?: string;

  /**
   * Related item ID (for attachment, diagnosis, procedure changes)
   */
  @Prop({ type: String })
  itemId?: string;

  /**
   * Additional context data
   */
  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  /**
   * Timestamp when the history entry was created
   * Automatically managed by Mongoose timestamps: true
   * Non-optional because Mongoose guarantees this field is set
   */
  createdAt!: Date;

  /**
   * Timestamp when the history entry was last updated
   * Automatically managed by Mongoose timestamps: true
   * Non-optional because Mongoose guarantees this field is set
   */
  updatedAt!: Date;
}

export type ClinicalNoteHistoryDocument = ClinicalNoteHistory & Document;

export const ClinicalNoteHistorySchema = SchemaFactory.createForClass(ClinicalNoteHistory);

// History indexes
ClinicalNoteHistorySchema.index(
  { clinicalNoteId: 1, createdAt: -1 },
  { name: 'note_history_idx' },
);

ClinicalNoteHistorySchema.index(
  { patientId: 1, tenantId: 1, createdAt: -1 },
  { name: 'patient_history_idx' },
);

ClinicalNoteHistorySchema.index(
  { changedBy: 1, tenantId: 1, createdAt: -1 },
  { name: 'user_history_idx' },
);

// Access audit log queries
ClinicalNoteHistorySchema.index(
  { tenantId: 1, changeType: 1, createdAt: -1 },
  { name: 'audit_type_idx' },
);
