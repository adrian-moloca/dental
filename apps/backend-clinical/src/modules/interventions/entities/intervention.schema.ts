/**
 * Clinical Intervention Schema
 *
 * MongoDB schema for quick clinical interventions and actions performed on patients.
 * Interventions are lightweight clinical records that don't require a full SOAP note.
 *
 * CLINICAL SAFETY NOTE: This schema stores clinical data that:
 * - Must be auditable for HIPAA compliance
 * - May affect billing and insurance claims
 * - Links to tooth history in the odontogram
 * - Should never be hard-deleted (use soft delete with audit trail)
 *
 * Use cases:
 * - Quick procedures (fluoride application, sensitivity check)
 * - Emergency actions documented rapidly
 * - Follow-up observations between full appointments
 * - Quick notes during appointments that don't warrant full clinical notes
 *
 * @module interventions/entities
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ALL_TEETH, TOOTH_SURFACES } from '../../odontogram/entities/odontogram.schema';

// ============================================================================
// INTERVENTION TYPES
// ============================================================================

/**
 * Intervention types covering common quick clinical actions in dental practice.
 * Includes Romanian translations for bilingual support.
 *
 * Each type may have an associated CDT code for billing purposes.
 */
export const INTERVENTION_TYPES = [
  'examination', // Examinare - D0120
  'consultation', // Consultatie
  'emergency', // Urgenta
  'fluoride', // Aplicare fluor - D1206, D1208
  'sealant', // Sigilare - D1351
  'scaling', // Detartraj - D1110, D4341
  'polishing', // Periaj profesional - D1110
  'sensitivity_test', // Test sensibilitate
  'vitality_test', // Test vitalitate - D0460
  'occlusion_check', // Verificare ocluzie
  'post_op_check', // Control post-operator
  'suture_removal', // Scoatere fire - D7910
  'medication', // Administrare medicament
  'injection', // Injectie - D9215
  'impression', // Amprenta - D0470
  'try_in', // Proba
  'cementation', // Cimentare - D6920
  'adjustment', // Ajustare - D9951
  'photo_documentation', // Documentare foto - D0350
  'other', // Altul
] as const;

export type InterventionType = (typeof INTERVENTION_TYPES)[number];

/**
 * Intervention status indicating the current state of the clinical action
 */
export const INTERVENTION_STATUSES = [
  'completed', // Intervention fully documented and completed
  'pending_review', // Requires review/approval by supervising provider
  'cancelled', // Intervention was cancelled (must include reason)
] as const;

export type InterventionStatus = (typeof INTERVENTION_STATUSES)[number];

/**
 * Quadrant identifiers for mouth regions
 */
export const QUADRANTS = ['UR', 'UL', 'LR', 'LL', 'full'] as const;
export type Quadrant = (typeof QUADRANTS)[number];

/**
 * Mapping of intervention types to their default CDT codes (where applicable)
 * Used for billing integration and procedure cataloging
 */
export const INTERVENTION_CDT_CODES: Partial<Record<InterventionType, string>> = {
  examination: 'D0120',
  fluoride: 'D1206',
  sealant: 'D1351',
  scaling: 'D1110',
  polishing: 'D1110',
  vitality_test: 'D0460',
  suture_removal: 'D7910',
  injection: 'D9215',
  impression: 'D0470',
  cementation: 'D6920',
  adjustment: 'D9951',
  photo_documentation: 'D0350',
};

/**
 * Display names for intervention types (English / Romanian)
 */
export const INTERVENTION_TYPE_LABELS: Record<InterventionType, { en: string; ro: string }> = {
  examination: { en: 'Examination', ro: 'Examinare' },
  consultation: { en: 'Consultation', ro: 'Consultatie' },
  emergency: { en: 'Emergency', ro: 'Urgenta' },
  fluoride: { en: 'Fluoride Application', ro: 'Aplicare fluor' },
  sealant: { en: 'Sealant Application', ro: 'Sigilare' },
  scaling: { en: 'Scaling', ro: 'Detartraj' },
  polishing: { en: 'Polishing', ro: 'Periaj profesional' },
  sensitivity_test: { en: 'Sensitivity Test', ro: 'Test sensibilitate' },
  vitality_test: { en: 'Vitality Test', ro: 'Test vitalitate' },
  occlusion_check: { en: 'Occlusion Check', ro: 'Verificare ocluzie' },
  post_op_check: { en: 'Post-Op Check', ro: 'Control post-operator' },
  suture_removal: { en: 'Suture Removal', ro: 'Scoatere fire' },
  medication: { en: 'Medication Administration', ro: 'Administrare medicament' },
  injection: { en: 'Injection', ro: 'Injectie' },
  impression: { en: 'Impression', ro: 'Amprenta' },
  try_in: { en: 'Try-In', ro: 'Proba' },
  cementation: { en: 'Cementation', ro: 'Cimentare' },
  adjustment: { en: 'Adjustment', ro: 'Ajustare' },
  photo_documentation: { en: 'Photo Documentation', ro: 'Documentare foto' },
  other: { en: 'Other', ro: 'Altul' },
};

// ============================================================================
// ATTACHMENT SCHEMA
// ============================================================================

/**
 * Attachment reference for images, documents, or other files
 * linked to an intervention (e.g., before/after photos)
 */
@Schema({ _id: true })
export class InterventionAttachment {
  @Prop({ type: Types.ObjectId, auto: true })
  _id!: Types.ObjectId;

  /**
   * Reference to file in document storage (S3/Azure Blob)
   */
  @Prop({ required: true, type: String })
  fileId!: string;

  /**
   * Type of attachment
   */
  @Prop({
    required: true,
    type: String,
    enum: ['image', 'document'],
  })
  type!: 'image' | 'document';

  /**
   * Optional description of the attachment
   */
  @Prop({ type: String, maxlength: 500 })
  description?: string;

  /**
   * When the attachment was added
   */
  @Prop({ type: Date, default: Date.now })
  addedAt!: Date;

  /**
   * Who added the attachment
   */
  @Prop({ type: String })
  addedBy?: string;
}

export const InterventionAttachmentSchema = SchemaFactory.createForClass(InterventionAttachment);

// ============================================================================
// MAIN INTERVENTION SCHEMA
// ============================================================================

/**
 * Clinical Intervention Document
 *
 * Represents a quick clinical action performed on a patient.
 * Used for rapid documentation of clinical activities that don't
 * require full SOAP notes but still need to be recorded for:
 * - Clinical history
 * - Billing purposes
 * - Audit trail compliance
 * - Integration with odontogram
 */
@Schema({
  timestamps: true,
  collection: 'clinical_interventions',
  optimisticConcurrency: true,
})
export class ClinicalIntervention {
  /**
   * Tenant identifier for multi-tenant isolation
   * CRITICAL: All queries MUST include tenantId
   */
  @Prop({ required: true, type: String, index: true })
  tenantId!: string;

  /**
   * Patient this intervention is for
   */
  @Prop({ required: true, type: String, index: true })
  patientId!: string;

  /**
   * Organization identifier
   */
  @Prop({ required: true, type: String, index: true })
  organizationId!: string;

  /**
   * Clinic where intervention was performed
   */
  @Prop({ required: true, type: String, index: true })
  clinicId!: string;

  /**
   * Optional link to appointment during which intervention was performed
   */
  @Prop({ type: String, index: true })
  appointmentId?: string;

  // -------------------------------------------------------------------------
  // TIMING
  // -------------------------------------------------------------------------

  /**
   * When the intervention was performed
   * CLINICAL SAFETY: Cannot be in the future
   */
  @Prop({ required: true, type: Date, index: true })
  performedAt!: Date;

  /**
   * Duration of intervention in minutes (optional)
   */
  @Prop({ type: Number, min: 0 })
  duration?: number;

  // -------------------------------------------------------------------------
  // PROVIDER
  // -------------------------------------------------------------------------

  /**
   * Provider who performed the intervention
   */
  @Prop({ required: true, type: String, index: true })
  providerId!: string;

  /**
   * Provider name for display purposes (denormalized for performance)
   */
  @Prop({ required: true, type: String })
  providerName!: string;

  // -------------------------------------------------------------------------
  // INTERVENTION DETAILS
  // -------------------------------------------------------------------------

  /**
   * Type of intervention
   */
  @Prop({
    required: true,
    type: String,
    enum: INTERVENTION_TYPES,
    index: true,
  })
  type!: InterventionType;

  /**
   * CDT procedure code if applicable for billing
   */
  @Prop({ type: String, maxlength: 10 })
  procedureCode?: string;

  /**
   * Teeth involved in this intervention (FDI notation)
   * Empty array or null means intervention is not tooth-specific
   */
  @Prop({
    type: [String],
    default: [],
    validate: {
      validator: function (teeth: string[]) {
        return teeth.every((t) => ALL_TEETH.includes(t as any));
      },
      message: 'All teeth must be valid FDI tooth numbers',
    },
  })
  teeth!: string[];

  /**
   * Surfaces involved (if applicable)
   */
  @Prop({
    type: [String],
    default: [],
    validate: {
      validator: function (surfaces: string[]) {
        return surfaces.every((s) => TOOTH_SURFACES.includes(s as any));
      },
      message: 'All surfaces must be valid tooth surface codes (M, O, D, B, L, I)',
    },
  })
  surfaces!: string[];

  /**
   * Quadrant or region (optional)
   */
  @Prop({ type: String, enum: QUADRANTS })
  quadrant?: Quadrant;

  // -------------------------------------------------------------------------
  // DESCRIPTION & FINDINGS
  // -------------------------------------------------------------------------

  /**
   * Short title/summary of the intervention
   */
  @Prop({ required: true, type: String, maxlength: 200 })
  title!: string;

  /**
   * Detailed description of what was done
   */
  @Prop({ type: String, maxlength: 5000 })
  description?: string;

  /**
   * Clinical findings observed during intervention
   */
  @Prop({ type: String, maxlength: 5000 })
  findings?: string;

  /**
   * Action taken during the intervention
   */
  @Prop({ type: String, maxlength: 5000 })
  actionTaken?: string;

  // -------------------------------------------------------------------------
  // ATTACHMENTS
  // -------------------------------------------------------------------------

  /**
   * File attachments (photos, documents)
   */
  @Prop({ type: [InterventionAttachmentSchema], default: [] })
  attachments!: InterventionAttachment[];

  // -------------------------------------------------------------------------
  // FOLLOW-UP
  // -------------------------------------------------------------------------

  /**
   * Whether follow-up is required
   */
  @Prop({ type: Boolean, default: false })
  followUpRequired!: boolean;

  /**
   * When follow-up should occur
   */
  @Prop({ type: Date })
  followUpDate?: Date;

  /**
   * Notes about required follow-up
   */
  @Prop({ type: String, maxlength: 1000 })
  followUpNotes?: string;

  // -------------------------------------------------------------------------
  // STATUS
  // -------------------------------------------------------------------------

  /**
   * Current status of the intervention
   */
  @Prop({
    required: true,
    type: String,
    enum: INTERVENTION_STATUSES,
    default: 'completed',
    index: true,
  })
  status!: InterventionStatus;

  /**
   * Reason for cancellation (required if status is 'cancelled')
   */
  @Prop({ type: String, maxlength: 500 })
  cancellationReason?: string;

  /**
   * When status was changed to cancelled
   */
  @Prop({ type: Date })
  cancelledAt?: Date;

  /**
   * Who cancelled the intervention
   */
  @Prop({ type: String })
  cancelledBy?: string;

  // -------------------------------------------------------------------------
  // BILLING
  // -------------------------------------------------------------------------

  /**
   * Whether this intervention is billable
   */
  @Prop({ type: Boolean, default: false })
  isBillable!: boolean;

  /**
   * Amount to bill if billable
   */
  @Prop({ type: Number, min: 0 })
  billedAmount?: number;

  /**
   * Currency for billing (defaults to clinic default)
   */
  @Prop({ type: String, default: 'RON' })
  currency!: string;

  /**
   * Reference to invoice if billed
   */
  @Prop({ type: String })
  invoiceId?: string;

  /**
   * When this was added to an invoice
   */
  @Prop({ type: Date })
  billedAt?: Date;

  // -------------------------------------------------------------------------
  // CLINICAL NOTE INTEGRATION
  // -------------------------------------------------------------------------

  /**
   * Reference to clinical note if this intervention was converted to a full note
   */
  @Prop({ type: String })
  clinicalNoteId?: string;

  /**
   * Whether this intervention originated from a clinical note
   */
  @Prop({ type: String })
  sourceNoteId?: string;

  // -------------------------------------------------------------------------
  // AUDIT FIELDS
  // -------------------------------------------------------------------------

  /**
   * User who created this record
   */
  @Prop({ required: true, type: String })
  createdBy!: string;

  /**
   * User who last updated this record
   */
  @Prop({ type: String })
  updatedBy?: string;

  /**
   * Soft delete timestamp (interventions are never hard-deleted)
   */
  @Prop({ type: Date })
  deletedAt?: Date;

  /**
   * Who performed the soft delete
   */
  @Prop({ type: String })
  deletedBy?: string;

  /**
   * Reason for deletion (required for soft delete)
   */
  @Prop({ type: String, maxlength: 500 })
  deleteReason?: string;

  /**
   * Version for optimistic locking
   */
  @Prop({ type: Number, default: 1 })
  version!: number;

  /**
   * Schema version for migrations
   */
  @Prop({ type: Number, default: 1 })
  schemaVersion!: number;
}

export type ClinicalInterventionDocument = ClinicalIntervention & Document;

export const ClinicalInterventionSchema = SchemaFactory.createForClass(ClinicalIntervention);

// ============================================================================
// INDEXES
// ============================================================================

// Primary lookup: patient interventions within tenant
ClinicalInterventionSchema.index(
  { tenantId: 1, patientId: 1, performedAt: -1 },
  { name: 'ix_tenant_patient_date' },
);

// Appointment lookup: all interventions for an appointment
ClinicalInterventionSchema.index(
  { tenantId: 1, appointmentId: 1 },
  { name: 'ix_tenant_appointment' },
);

// Provider lookup: interventions by provider
ClinicalInterventionSchema.index(
  { tenantId: 1, providerId: 1, performedAt: -1 },
  { name: 'ix_tenant_provider_date' },
);

// Type lookup: filter by intervention type
ClinicalInterventionSchema.index(
  { tenantId: 1, type: 1, performedAt: -1 },
  { name: 'ix_tenant_type_date' },
);

// Tooth lookup: find interventions by tooth number
ClinicalInterventionSchema.index(
  { tenantId: 1, patientId: 1, teeth: 1, performedAt: -1 },
  { name: 'ix_tenant_patient_teeth_date' },
);

// Billing lookup: unbilled interventions
ClinicalInterventionSchema.index(
  { tenantId: 1, isBillable: 1, invoiceId: 1 },
  { name: 'ix_tenant_billable_invoice' },
);

// Follow-up lookup: interventions requiring follow-up
ClinicalInterventionSchema.index(
  { tenantId: 1, followUpRequired: 1, followUpDate: 1 },
  { name: 'ix_tenant_followup' },
);

// Status lookup: active vs cancelled
ClinicalInterventionSchema.index(
  { tenantId: 1, status: 1, performedAt: -1 },
  { name: 'ix_tenant_status_date' },
);

// Soft delete filter
ClinicalInterventionSchema.index({ tenantId: 1, deletedAt: 1 }, { name: 'ix_tenant_deleted' });

// ============================================================================
// INTERVENTION HISTORY (AUDIT TRAIL)
// ============================================================================

/**
 * Audit history for intervention changes
 * NEVER DELETE RECORDS FROM THIS COLLECTION - required for HIPAA compliance
 */
@Schema({
  timestamps: true,
  collection: 'clinical_interventions_history',
})
export class ClinicalInterventionHistory {
  @Prop({ required: true, type: String, index: true })
  interventionId!: string;

  @Prop({ required: true, type: String, index: true })
  tenantId!: string;

  @Prop({ required: true, type: String, index: true })
  patientId!: string;

  @Prop({ required: true, type: String })
  organizationId!: string;

  @Prop({ required: true, type: String })
  clinicId!: string;

  /**
   * Type of change made
   */
  @Prop({
    required: true,
    type: String,
    enum: ['created', 'updated', 'cancelled', 'deleted', 'billed'],
  })
  changeType!: 'created' | 'updated' | 'cancelled' | 'deleted' | 'billed';

  /**
   * Previous state of the intervention (JSON snapshot)
   */
  @Prop({ type: Object })
  previousState?: Record<string, unknown>;

  /**
   * New state of the intervention (JSON snapshot)
   */
  @Prop({ type: Object })
  newState?: Record<string, unknown>;

  /**
   * Fields that were changed
   */
  @Prop({ type: [String] })
  changedFields?: string[];

  /**
   * User who made the change
   */
  @Prop({ required: true, type: String })
  changedBy!: string;

  /**
   * Reason for the change
   */
  @Prop({ type: String })
  reason?: string;

  /**
   * IP address for audit
   */
  @Prop({ type: String })
  ipAddress?: string;

  /**
   * User agent for audit
   */
  @Prop({ type: String })
  userAgent?: string;
}

export type ClinicalInterventionHistoryDocument = ClinicalInterventionHistory & Document;

export const ClinicalInterventionHistorySchema = SchemaFactory.createForClass(
  ClinicalInterventionHistory,
);

// History indexes
ClinicalInterventionHistorySchema.index(
  { interventionId: 1, createdAt: -1 },
  { name: 'ix_intervention_history' },
);

ClinicalInterventionHistorySchema.index(
  { tenantId: 1, patientId: 1, createdAt: -1 },
  { name: 'ix_tenant_patient_history' },
);

ClinicalInterventionHistorySchema.index(
  { tenantId: 1, changedBy: 1, createdAt: -1 },
  { name: 'ix_tenant_user_history' },
);
