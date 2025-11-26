/**
 * Clinical Notes Domain Events
 *
 * Events emitted by the clinical notes module for integration with other services.
 * These events enable loose coupling between modules while maintaining data consistency.
 *
 * Downstream consumers:
 * - Billing service: Procedures completed events trigger invoice line items
 * - Scheduling service: Note creation updates appointment status
 * - Inventory service: Procedures may trigger material deductions
 * - Audit service: All events are logged for compliance
 *
 * @module clinical-notes/events
 */

// ============================================================================
// EVENT NAMES
// ============================================================================

export const CLINICAL_NOTE_EVENTS = {
  CREATED: 'clinical.note.created',
  UPDATED: 'clinical.note.updated',
  SIGNED: 'clinical.note.signed',
  AMENDED: 'clinical.note.amended',
  DELETED: 'clinical.note.deleted',
  ATTACHMENT_ADDED: 'clinical.note.attachment.added',
  PROCEDURE_COMPLETED: 'clinical.note.procedure.completed',
  DIAGNOSIS_ADDED: 'clinical.note.diagnosis.added',
} as const;

// ============================================================================
// BASE EVENT INTERFACE
// ============================================================================

/**
 * Base interface for all clinical note events
 */
export interface ClinicalNoteEventBase {
  /** Unique event ID for idempotency */
  eventId: string;

  /** Event timestamp */
  timestamp: Date;

  /** Tenant context */
  tenantId: string;
  organizationId: string;
  clinicId: string;

  /** User who triggered the event */
  triggeredBy: string;
  triggeredByName?: string;

  /** Request context */
  correlationId?: string;
  ipAddress?: string;
}

// ============================================================================
// CLINICAL NOTE CREATED EVENT
// ============================================================================

/**
 * Event emitted when a new clinical note is created
 */
export interface ClinicalNoteCreatedEvent extends ClinicalNoteEventBase {
  noteId: string;
  patientId: string;
  noteType: string;
  authorId: string;
  authorName: string;
  appointmentId?: string;
  treatmentPlanId?: string;
  hasSOAP: boolean;
  diagnosisCount: number;
  procedureCount: number;
}

// ============================================================================
// CLINICAL NOTE UPDATED EVENT
// ============================================================================

/**
 * Event emitted when a clinical note is updated
 */
export interface ClinicalNoteUpdatedEvent extends ClinicalNoteEventBase {
  noteId: string;
  patientId: string;
  version: number;
  previousVersion: number;
  fieldsChanged: string[];
}

// ============================================================================
// CLINICAL NOTE SIGNED EVENT
// ============================================================================

/**
 * Event emitted when a clinical note is digitally signed
 *
 * CRITICAL: This event indicates the note is legally finalized.
 * - Downstream systems should treat this as an authoritative record
 * - The contentHash can be used for integrity verification
 */
export interface ClinicalNoteSignedEvent extends ClinicalNoteEventBase {
  noteId: string;
  patientId: string;
  authorId: string;
  authorName: string;
  signedBy: string;
  signerName: string;
  signerCredentials?: string;
  signedAt: Date;
  signatureMethod: string;
  contentHash: string;
  noteType: string;
  version: number;

  /** Summary of note contents for downstream processing */
  summary: {
    chiefComplaint?: string;
    diagnosisCodes: string[];
    procedureCodes: string[];
    appointmentId?: string;
  };
}

// ============================================================================
// CLINICAL NOTE AMENDED EVENT
// ============================================================================

/**
 * Event emitted when a signed clinical note is amended
 *
 * CRITICAL: Amendments create a new note version while preserving the original.
 * The original note's status changes to 'amended'.
 */
export interface ClinicalNoteAmendedEvent extends ClinicalNoteEventBase {
  /** ID of the original note that was amended */
  originalNoteId: string;

  /** ID of the new amendment note */
  amendmentNoteId: string;

  patientId: string;
  authorId: string;
  authorName: string;

  /** Required reason for the amendment */
  amendmentReason: string;

  /** Original note version */
  originalVersion: number;

  /** New amendment version */
  amendmentVersion: number;

  /** Summary of what was changed */
  changesDescription: string[];
}

// ============================================================================
// CLINICAL NOTE DELETED EVENT
// ============================================================================

/**
 * Event emitted when a clinical note is soft deleted
 *
 * IMPORTANT: Clinical notes are never hard deleted for compliance reasons.
 * This event indicates the note is no longer active but is preserved.
 */
export interface ClinicalNoteDeletedEvent extends ClinicalNoteEventBase {
  noteId: string;
  patientId: string;
  noteStatus: string;
  deletedBy: string;
  deleteReason: string;
  appointmentId?: string;
}

// ============================================================================
// ATTACHMENT ADDED EVENT
// ============================================================================

/**
 * Event emitted when an attachment is added to a clinical note
 */
export interface ClinicalNoteAttachmentAddedEvent extends ClinicalNoteEventBase {
  noteId: string;
  patientId: string;
  attachmentId: string;
  fileId: string;
  fileName: string;
  fileType: string;
  mimeType?: string;
  fileSize?: number;
}

// ============================================================================
// PROCEDURE COMPLETED EVENT
// ============================================================================

/**
 * Event emitted when a procedure within a clinical note is marked as completed
 *
 * CRITICAL: This event triggers:
 * - Billing module: Creates invoice line item for the procedure
 * - Inventory module: May deduct materials used
 * - Treatment plan module: Updates procedure status if linked
 */
export interface ClinicalNoteProcedureCompletedEvent extends ClinicalNoteEventBase {
  noteId: string;
  patientId: string;
  procedureId: string;

  /** CDT procedure code */
  cdtCode: string;

  /** Procedure description */
  description: string;

  /** FDI tooth numbers involved */
  teeth: string[];

  /** Surfaces involved */
  surfaces: string[];

  /** When the procedure was completed */
  completedAt: Date;

  /** Provider who performed the procedure */
  performedBy: string;

  /** Clinical notes about the procedure */
  notes?: string;

  /** Reference to full procedure record if exists */
  procedureRecordId?: string;

  /** Reference to treatment plan item if linked */
  treatmentPlanItemId?: string;
}

// ============================================================================
// DIAGNOSIS ADDED EVENT
// ============================================================================

/**
 * Event emitted when a diagnosis is added to a clinical note
 */
export interface ClinicalNoteDiagnosisAddedEvent extends ClinicalNoteEventBase {
  noteId: string;
  patientId: string;
  diagnosisId: string;

  /** ICD-10 diagnosis code */
  icd10Code: string;

  /** Diagnosis description */
  description: string;

  /** FDI tooth number if tooth-specific */
  tooth?: string;

  /** Whether this is the primary diagnosis */
  isPrimary: boolean;
}

// ============================================================================
// EVENT FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a unique event ID
 */
function createEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create base event payload
 */
function createBaseEvent(
  tenantId: string,
  organizationId: string,
  clinicId: string,
  triggeredBy: string,
  triggeredByName?: string,
  correlationId?: string,
  ipAddress?: string,
): ClinicalNoteEventBase {
  return {
    eventId: createEventId(),
    timestamp: new Date(),
    tenantId,
    organizationId,
    clinicId,
    triggeredBy,
    triggeredByName,
    correlationId,
    ipAddress,
  };
}

/**
 * Factory for ClinicalNoteCreatedEvent
 */
export function createClinicalNoteCreatedEvent(
  noteData: {
    noteId: string;
    patientId: string;
    noteType: string;
    authorId: string;
    authorName: string;
    appointmentId?: string;
    treatmentPlanId?: string;
    hasSOAP: boolean;
    diagnosisCount: number;
    procedureCount: number;
  },
  context: {
    tenantId: string;
    organizationId: string;
    clinicId: string;
    triggeredBy: string;
    triggeredByName?: string;
    correlationId?: string;
    ipAddress?: string;
  },
): ClinicalNoteCreatedEvent {
  return {
    ...createBaseEvent(
      context.tenantId,
      context.organizationId,
      context.clinicId,
      context.triggeredBy,
      context.triggeredByName,
      context.correlationId,
      context.ipAddress,
    ),
    ...noteData,
  };
}

/**
 * Factory for ClinicalNoteSignedEvent
 */
export function createClinicalNoteSignedEvent(
  noteData: {
    noteId: string;
    patientId: string;
    authorId: string;
    authorName: string;
    signedBy: string;
    signerName: string;
    signerCredentials?: string;
    signedAt: Date;
    signatureMethod: string;
    contentHash: string;
    noteType: string;
    version: number;
    summary: {
      chiefComplaint?: string;
      diagnosisCodes: string[];
      procedureCodes: string[];
      appointmentId?: string;
    };
  },
  context: {
    tenantId: string;
    organizationId: string;
    clinicId: string;
    triggeredBy: string;
    triggeredByName?: string;
    correlationId?: string;
    ipAddress?: string;
  },
): ClinicalNoteSignedEvent {
  return {
    ...createBaseEvent(
      context.tenantId,
      context.organizationId,
      context.clinicId,
      context.triggeredBy,
      context.triggeredByName,
      context.correlationId,
      context.ipAddress,
    ),
    ...noteData,
  };
}

/**
 * Factory for ClinicalNoteAmendedEvent
 */
export function createClinicalNoteAmendedEvent(
  amendmentData: {
    originalNoteId: string;
    amendmentNoteId: string;
    patientId: string;
    authorId: string;
    authorName: string;
    amendmentReason: string;
    originalVersion: number;
    amendmentVersion: number;
    changesDescription: string[];
  },
  context: {
    tenantId: string;
    organizationId: string;
    clinicId: string;
    triggeredBy: string;
    triggeredByName?: string;
    correlationId?: string;
    ipAddress?: string;
  },
): ClinicalNoteAmendedEvent {
  return {
    ...createBaseEvent(
      context.tenantId,
      context.organizationId,
      context.clinicId,
      context.triggeredBy,
      context.triggeredByName,
      context.correlationId,
      context.ipAddress,
    ),
    ...amendmentData,
  };
}

/**
 * Factory for ClinicalNoteProcedureCompletedEvent
 */
export function createClinicalNoteProcedureCompletedEvent(
  procedureData: {
    noteId: string;
    patientId: string;
    procedureId: string;
    cdtCode: string;
    description: string;
    teeth: string[];
    surfaces: string[];
    completedAt: Date;
    performedBy: string;
    notes?: string;
    procedureRecordId?: string;
    treatmentPlanItemId?: string;
  },
  context: {
    tenantId: string;
    organizationId: string;
    clinicId: string;
    triggeredBy: string;
    triggeredByName?: string;
    correlationId?: string;
    ipAddress?: string;
  },
): ClinicalNoteProcedureCompletedEvent {
  return {
    ...createBaseEvent(
      context.tenantId,
      context.organizationId,
      context.clinicId,
      context.triggeredBy,
      context.triggeredByName,
      context.correlationId,
      context.ipAddress,
    ),
    ...procedureData,
  };
}
