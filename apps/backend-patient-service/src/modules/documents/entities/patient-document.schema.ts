/**
 * Patient Document MongoDB Schema
 *
 * Defines the complete patient document data model for managing clinical and administrative
 * documents with full audit trail, signature support, and GDPR compliance.
 *
 * SECURITY CONSIDERATIONS:
 * - All PHI documents are stored with tenant isolation
 * - Document access is logged for HIPAA compliance
 * - Soft deletes only - no hard deletes for legal defensibility
 * - File URLs point to S3 with pre-signed URLs (short-lived)
 *
 * @module modules/documents/entities
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import type { UUID } from '@dentalos/shared-types';

/**
 * Document category enumeration
 *
 * Clinical significance:
 * - consent: Required before procedures (legal requirement)
 * - anamnesis: Medical history forms (clinical safety)
 * - treatment_plan: Treatment documentation (care coordination)
 * - prescription: Medication records (drug safety)
 * - imaging: X-rays, CT scans (diagnostic reference)
 * - lab_result: Laboratory test results (clinical decision support)
 */
export type DocumentCategory =
  | 'consent' // Consimtamant
  | 'anamnesis' // Anamneza
  | 'patient_form' // Fisa pacient
  | 'treatment_plan' // Plan tratament
  | 'prescription' // Reteta
  | 'referral' // Trimitere
  | 'lab_result' // Rezultat laborator
  | 'imaging' // Radiografie, CT
  | 'invoice' // Factura
  | 'insurance' // Asigurare
  | 'id_document' // CI, Pasaport
  | 'other'; // Altele

/**
 * Document source indicating how the document was added to the system
 */
export type DocumentSource =
  | 'upload' // Manual upload by staff
  | 'generated' // Generated from template (e.g., consent forms)
  | 'imported' // Imported from external system
  | 'scan'; // Scanned document

/**
 * Digital signature information sub-document
 *
 * COMPLIANCE:
 * - Captures signer identity, timestamp, and method
 * - Supports electronic signature standards (e-IDAS for Romania)
 * - Non-repudiable: includes IP address for verification
 */
export class SignatureInfo {
  /**
   * User ID who signed the document
   */
  @Prop({ required: true, type: String, index: true })
  signedBy!: string;

  /**
   * Timestamp when signature was captured
   */
  @Prop({ required: true, type: Date, index: true })
  signedAt!: Date;

  /**
   * Method of signature capture
   * - electronic: Clicked "I agree" or similar
   * - drawn: Drew signature on screen/pad
   * - biometric: Fingerprint or similar
   * - qualified: Qualified electronic signature (e.g., card-based)
   */
  @Prop({
    required: true,
    type: String,
    enum: ['electronic', 'drawn', 'biometric', 'qualified'],
  })
  signatureMethod!: string;

  /**
   * URL to signature image if drawn
   */
  @Prop({ type: String })
  signatureImageUrl?: string;

  /**
   * IP address at time of signing (for audit trail)
   */
  @Prop({ type: String })
  ipAddress?: string;

  /**
   * User agent at time of signing
   */
  @Prop({ type: String })
  userAgent?: string;

  /**
   * Device/browser fingerprint for additional verification
   */
  @Prop({ type: String })
  deviceFingerprint?: string;

  /**
   * Legal attestation text that was accepted
   */
  @Prop({ type: String, maxlength: 2000 })
  attestationText?: string;

  /**
   * Name of signer as entered (may differ from user account name)
   */
  @Prop({ type: String, trim: true })
  signerName?: string;

  /**
   * Role/relationship of signer (patient, guardian, provider)
   */
  @Prop({
    type: String,
    enum: ['patient', 'guardian', 'provider', 'witness', 'other'],
  })
  signerRole?: string;
}

/**
 * File metadata sub-document
 *
 * Contains all information about the physical file stored in S3
 */
export class FileMetadata {
  /**
   * Original filename as uploaded
   */
  @Prop({ required: true, type: String, trim: true })
  fileName!: string;

  /**
   * File size in bytes
   * Max 25MB = 26,214,400 bytes per requirements
   */
  @Prop({ required: true, type: Number, min: 0, max: 26214400 })
  fileSize!: number;

  /**
   * MIME type (validated against allowed types)
   * Allowed: application/pdf, image/jpeg, image/png, application/dicom
   */
  @Prop({
    required: true,
    type: String,
    trim: true,
    enum: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/dicom',
      'application/octet-stream', // For DICOM files
    ],
  })
  mimeType!: string;

  /**
   * S3 storage key (not the full URL for security)
   * Format: {tenantId}/patients/{patientId}/documents/{documentId}/{filename}
   */
  @Prop({ required: true, type: String })
  storageKey!: string;

  /**
   * S3 bucket name
   */
  @Prop({ required: true, type: String })
  bucket!: string;

  /**
   * Content hash (SHA-256) for integrity verification
   */
  @Prop({ type: String })
  contentHash?: string;

  /**
   * Thumbnail storage key (for images and PDFs)
   */
  @Prop({ type: String })
  thumbnailStorageKey?: string;

  /**
   * Whether the file is encrypted at rest (beyond S3 default encryption)
   */
  @Prop({ type: Boolean, default: false })
  isEncrypted!: boolean;

  /**
   * Encryption key reference if custom encryption is used
   */
  @Prop({ type: String })
  encryptionKeyId?: string;
}

/**
 * Patient Document MongoDB Document
 *
 * Core document entity with full clinical document lifecycle support.
 * Includes comprehensive indexing for query optimization and audit compliance.
 *
 * CLINICAL NOTES:
 * - consent documents: Must be signed before procedures, have expiry dates
 * - imaging: May contain DICOM files, require special viewer
 * - prescription: Have regulatory requirements, may need external system integration
 *
 * LEGAL REQUIREMENTS:
 * - Romanian law requires 10-year retention of clinical documents
 * - Documents cannot be permanently deleted, only soft-deleted
 * - All access and modifications must be logged
 */
@Schema({
  timestamps: true,
  collection: 'patient_documents',
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, any>) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete ret._id;
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete ret.__v;
      // Never expose storage keys directly - use pre-signed URLs
      if (ret.file) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete ret.file.storageKey;
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete ret.file.thumbnailStorageKey;
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete ret.file.bucket;
      }
      return ret;
    },
  },
})
export class PatientDocument {
  /**
   * Unique document identifier (UUID)
   */
  @Prop({ required: true, type: String, unique: true, index: true })
  id!: UUID;

  /**
   * Tenant ID for multi-tenant isolation
   */
  @Prop({ required: true, type: String, index: true })
  tenantId!: string;

  /**
   * Organization ID
   */
  @Prop({ required: true, type: String, index: true })
  organizationId!: string;

  /**
   * Clinic ID where document was created
   */
  @Prop({ required: true, type: String, index: true })
  clinicId!: string;

  /**
   * Patient ID this document belongs to
   */
  @Prop({ required: true, type: String, index: true })
  patientId!: string;

  // ============================================================================
  // DOCUMENT INFORMATION
  // ============================================================================

  /**
   * Document title for display
   */
  @Prop({ required: true, type: String, trim: true, maxlength: 255 })
  title!: string;

  /**
   * Optional description providing context
   */
  @Prop({ type: String, trim: true, maxlength: 2000 })
  description?: string;

  /**
   * Document category for organization and filtering
   */
  @Prop({
    required: true,
    type: String,
    index: true,
    enum: [
      'consent',
      'anamnesis',
      'patient_form',
      'treatment_plan',
      'prescription',
      'referral',
      'lab_result',
      'imaging',
      'invoice',
      'insurance',
      'id_document',
      'other',
    ],
  })
  category!: DocumentCategory;

  // ============================================================================
  // FILE INFORMATION
  // ============================================================================

  /**
   * File metadata including storage location
   */
  @Prop({ required: true, type: FileMetadata })
  file!: FileMetadata;

  /**
   * Pre-computed download URL (short-lived, regenerated on access)
   * NOTE: This is NOT stored - computed on read
   */

  // ============================================================================
  // TEMPORAL METADATA
  // ============================================================================

  /**
   * Date on the document itself (not upload date)
   * E.g., the date a lab result was issued, or prescription written
   */
  @Prop({ type: Date, index: true })
  documentDate?: Date;

  /**
   * Expiry date for time-sensitive documents
   * CRITICAL for consent forms - expired consent invalidates procedure authorization
   */
  @Prop({ type: Date, index: true })
  expiryDate?: Date;

  // ============================================================================
  // SOURCE TRACKING
  // ============================================================================

  /**
   * How the document was added to the system
   */
  @Prop({
    required: true,
    type: String,
    enum: ['upload', 'generated', 'imported', 'scan'],
    default: 'upload',
  })
  source!: DocumentSource;

  /**
   * Template ID if document was generated from a template
   */
  @Prop({ type: String, index: true })
  generatedFromTemplateId?: string;

  /**
   * Additional data used during generation
   */
  @Prop({ type: MongooseSchema.Types.Mixed })
  generationData?: Record<string, unknown>;

  // ============================================================================
  // APPOINTMENT LINK
  // ============================================================================

  /**
   * Appointment ID if document is associated with a visit
   */
  @Prop({ type: String, index: true })
  appointmentId?: string;

  // ============================================================================
  // SIGNATURE MANAGEMENT
  // ============================================================================

  /**
   * Whether this document requires a signature
   */
  @Prop({ type: Boolean, default: false })
  requiresSignature!: boolean;

  /**
   * Signature information if document is signed
   */
  @Prop({ type: SignatureInfo })
  signature?: SignatureInfo;

  /**
   * Multiple signatures support (e.g., patient + guardian + witness)
   */
  @Prop({ type: [SignatureInfo], default: [] })
  additionalSignatures!: SignatureInfo[];

  // ============================================================================
  // CATEGORIZATION
  // ============================================================================

  /**
   * Tags for flexible categorization and search
   */
  @Prop({ type: [String], default: [], index: true })
  tags!: string[];

  // ============================================================================
  // AUDIT TRAIL
  // ============================================================================

  /**
   * User ID who uploaded/created the document
   */
  @Prop({ required: true, type: String, index: true })
  uploadedBy!: string;

  /**
   * Timestamp when document was uploaded
   */
  @Prop({ required: true, type: Date, index: true })
  uploadedAt!: Date;

  /**
   * Last update timestamp (managed by Mongoose timestamps)
   */
  @Prop({ type: Date })
  updatedAt!: Date;

  /**
   * User who last updated the document
   */
  @Prop({ type: String })
  updatedBy?: string;

  /**
   * Created timestamp (managed by Mongoose timestamps)
   */
  @Prop({ type: Date })
  createdAt!: Date;

  // ============================================================================
  // SOFT DELETE
  // ============================================================================

  /**
   * Soft delete flag
   * NEVER hard delete clinical documents
   */
  @Prop({ type: Boolean, default: false, index: true })
  isDeleted!: boolean;

  /**
   * Soft delete timestamp
   */
  @Prop({ type: Date })
  deletedAt?: Date;

  /**
   * User who deleted the document
   */
  @Prop({ type: String })
  deletedBy?: string;

  /**
   * Reason for deletion (required for compliance)
   */
  @Prop({ type: String, maxlength: 500 })
  deletionReason?: string;

  // ============================================================================
  // VERSIONING
  // ============================================================================

  /**
   * Document version for optimistic locking
   */
  @Prop({ type: Number, default: 1 })
  version!: number;

  /**
   * Previous version document ID if this is an updated version
   */
  @Prop({ type: String })
  previousVersionId?: string;

  // ============================================================================
  // ADDITIONAL METADATA
  // ============================================================================

  /**
   * Flexible metadata storage for integration-specific data
   */
  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, unknown>;
}

export type PatientDocumentDocument = PatientDocument & Document;

export const PatientDocumentSchema = SchemaFactory.createForClass(PatientDocument);

// ============================================================================
// INDEXES
// ============================================================================

// Compound indexes for query optimization with tenant isolation

// Primary lookup: patient's documents
PatientDocumentSchema.index(
  { tenantId: 1, patientId: 1, isDeleted: 1, category: 1 },
  { name: 'idx_patient_documents_lookup' },
);

// Appointment-based lookup
PatientDocumentSchema.index(
  { tenantId: 1, appointmentId: 1, isDeleted: 1 },
  { name: 'idx_appointment_documents', sparse: true },
);

// Date-range queries
PatientDocumentSchema.index(
  { tenantId: 1, patientId: 1, documentDate: -1, isDeleted: 1 },
  { name: 'idx_patient_documents_by_date' },
);

// Expiring documents (for alerts)
PatientDocumentSchema.index(
  { tenantId: 1, expiryDate: 1, isDeleted: 1 },
  { name: 'idx_expiring_documents', sparse: true },
);

// Unsigned documents requiring signature
PatientDocumentSchema.index(
  { tenantId: 1, patientId: 1, requiresSignature: 1, 'signature.signedAt': 1, isDeleted: 1 },
  { name: 'idx_unsigned_documents', sparse: true },
);

// Generated documents by template
PatientDocumentSchema.index(
  { tenantId: 1, generatedFromTemplateId: 1, isDeleted: 1 },
  { name: 'idx_generated_documents', sparse: true },
);

// Tag-based search
PatientDocumentSchema.index({ tenantId: 1, tags: 1, isDeleted: 1 }, { name: 'idx_document_tags' });

// Full-text search on title and description
PatientDocumentSchema.index(
  {
    title: 'text',
    description: 'text',
    tags: 'text',
  },
  {
    weights: {
      title: 10,
      tags: 5,
      description: 1,
    },
    name: 'document_text_search',
  },
);

// Audit queries
PatientDocumentSchema.index(
  { tenantId: 1, uploadedBy: 1, uploadedAt: -1 },
  { name: 'idx_audit_uploaded_by' },
);
PatientDocumentSchema.index(
  { tenantId: 1, 'signature.signedBy': 1 },
  { name: 'idx_audit_signed_by', sparse: true },
);
