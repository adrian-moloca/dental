/**
 * Patient Deleted Event
 *
 * Published when a patient record is deleted or soft-deleted from the system.
 * This event triggers cleanup, archival, appointment cancellation, and audit logging.
 *
 * Handles both soft deletion (retaining record with deleted flag) and hard deletion
 * (complete removal), though hard deletion should be rare due to compliance requirements.
 *
 * @module shared-events/patient
 */

import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';

/**
 * Patient deleted event type constant
 */
export const PATIENT_DELETED_EVENT = 'dental.patient.deleted' as const;

/**
 * Patient deleted event version
 */
export const PATIENT_DELETED_EVENT_VERSION = 1;

/**
 * Deletion type enumeration
 * Defines how the patient record was deleted
 */
export type DeletionType =
  | 'soft'
  | 'anonymized'
  | 'hard'
  | 'archived';

/**
 * Deletion reason category
 * Categorizes why the patient was deleted
 */
export type DeletionReason =
  | 'PATIENT_REQUEST'
  | 'GDPR_RIGHT_TO_BE_FORGOTTEN'
  | 'DUPLICATE_RECORD'
  | 'TEST_DATA'
  | 'DATA_QUALITY'
  | 'FRAUD'
  | 'DECEASED'
  | 'RETENTION_POLICY'
  | 'ADMINISTRATIVE'
  | 'OTHER';

/**
 * Retention policy information
 * Defines data retention requirements
 */
export interface RetentionPolicy {
  /** Policy name or identifier */
  policyName: string;
  /** Retention period in days */
  retentionPeriodDays: number;
  /** Whether billing/financial data must be retained */
  retainFinancialData: boolean;
  /** Whether medical records must be retained */
  retainMedicalRecords: boolean;
  /** Minimum retention period required by law */
  legalRetentionPeriodDays?: number;
  /** Jurisdiction requiring retention */
  jurisdiction?: string;
}

/**
 * Deletion impact summary
 * Tracks what data is affected by the deletion
 */
export interface DeletionImpact {
  /** Number of appointments affected */
  appointmentsCount?: number;
  /** Number of treatment records affected */
  treatmentRecordsCount?: number;
  /** Number of billing records affected */
  billingRecordsCount?: number;
  /** Number of documents affected */
  documentsCount?: number;
  /** Number of prescriptions affected */
  prescriptionsCount?: number;
  /** List of related entity types affected */
  affectedEntities?: readonly string[];
  /** Whether any data will be retained */
  hasRetainedData: boolean;
  /** What data will be retained */
  retainedDataDescription?: string;
}

/**
 * Patient deleted event payload
 *
 * Contains all information about the deletion operation including patient identifiers,
 * deletion type, reason, impact, and compliance information.
 */
export interface PatientDeletedPayload {
  /** Unique patient identifier */
  patientId: UUID;

  /** Organization ID (tenant context) */
  organizationId: OrganizationId;

  /** Clinic ID where patient belonged */
  clinicId: ClinicId;

  /** Unified tenant identifier for data partitioning */
  tenantId: string;

  /** Patient full name (for audit and notification) */
  patientName: string;

  /** Patient chart number */
  chartNumber?: string;

  /** Patient email (before deletion/anonymization) */
  patientEmail?: string;

  /** Type of deletion performed */
  deletionType: DeletionType;

  /** User who performed the deletion */
  deletedBy: UUID;

  /** User display name who performed the deletion */
  deletedByName?: string;

  /** Timestamp when deletion was performed */
  deletedAt: ISODateString;

  /** Categorized reason for deletion */
  deletionReason: DeletionReason;

  /** Detailed explanation for deletion */
  deletionJustification?: string;

  /** Reference to patient's deletion request (if applicable) */
  deletionRequestId?: UUID;

  /** Deletion impact summary */
  impact?: DeletionImpact;

  /** Retention policy applied */
  retentionPolicy?: RetentionPolicy;

  /** Whether deletion is reversible */
  isReversible: boolean;

  /** Days until permanent deletion (for soft deletes) */
  permanentDeletionInDays?: number;

  /** Scheduled permanent deletion date (for soft deletes) */
  scheduledPermanentDeletion?: ISODateString;

  /** Deletion operation ID for tracking and audit */
  deletionOperationId?: UUID;

  /** Whether deletion required approval */
  requiresApproval: boolean;

  /** Approval status if required */
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';

  /** User who approved deletion (if different from deletedBy) */
  approvedBy?: UUID;

  /** Timestamp when deletion was approved */
  approvedAt?: ISODateString;

  /** Whether legal hold prevents deletion */
  isUnderLegalHold: boolean;

  /** Legal hold information if applicable */
  legalHoldInfo?: {
    /** Legal hold case ID */
    caseId: string;
    /** Reason for legal hold */
    reason: string;
    /** Legal hold start date */
    startDate: ISODateString;
    /** Legal hold end date (if known) */
    endDate?: ISODateString;
  };

  /** Whether notification was sent to patient */
  patientNotified: boolean;

  /** Notification method used */
  notificationMethod?: 'EMAIL' | 'PHONE' | 'MAIL' | 'IN_PERSON' | 'NONE';

  /** Data export provided to patient before deletion */
  dataExportProvided: boolean;

  /** Export file reference if provided */
  dataExportReference?: string;

  /** Audit trail or compliance notes */
  complianceNotes?: string;

  /** Notes or comments about the deletion */
  notes?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient deleted event envelope
 *
 * Complete event with payload and metadata.
 *
 * @example
 * ```typescript
 * const event: PatientDeletedEvent = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   type: 'dental.patient.deleted',
 *   version: 1,
 *   occurredAt: new Date('2025-11-20T17:00:00Z'),
 *   payload: {
 *     patientId: '123e4567-e89b-12d3-a456-426614174000',
 *     organizationId: 'org-789',
 *     clinicId: 'clinic-101',
 *     tenantId: 'tenant-789',
 *     patientName: 'John Doe',
 *     chartNumber: 'PT-12345',
 *     deletionType: 'soft',
 *     deletedBy: 'user-admin-123',
 *     deletedByName: 'Admin Smith',
 *     deletedAt: '2025-11-20T17:00:00Z',
 *     deletionReason: 'PATIENT_REQUEST',
 *     deletionJustification: 'Patient requested account deletion via email',
 *     isReversible: true,
 *     permanentDeletionInDays: 30,
 *     requiresApproval: false,
 *     isUnderLegalHold: false,
 *     patientNotified: true,
 *     notificationMethod: 'EMAIL',
 *     dataExportProvided: true,
 *     dataExportReference: 'export-2025-11-20-123456.zip',
 *   },
 *   metadata: {
 *     correlationId: 'delete-corr-123',
 *     userId: 'user-admin-123',
 *   },
 *   tenantContext: {
 *     organizationId: 'org-789',
 *     clinicId: 'clinic-101',
 *     tenantId: 'tenant-789',
 *   },
 * };
 * ```
 */
export type PatientDeletedEvent = EventEnvelope<PatientDeletedPayload>;

/**
 * Type guard to check if an event is a PatientDeletedEvent
 *
 * @param event - The event to check
 * @returns True if the event is a PatientDeletedEvent
 */
export function isPatientDeletedEvent(
  event: EventEnvelope<unknown>
): event is PatientDeletedEvent {
  return event.type === PATIENT_DELETED_EVENT;
}

/**
 * Factory function to create a PatientDeletedEvent
 *
 * Validates required fields and business rules, generates a complete event envelope.
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 * @throws {Error} If required fields are missing or invalid
 */
export function createPatientDeletedEvent(
  payload: PatientDeletedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): PatientDeletedEvent {
  // Validate critical required fields
  if (!payload.patientId) {
    throw new Error('PatientDeletedEvent: patientId is required');
  }
  if (!payload.organizationId) {
    throw new Error('PatientDeletedEvent: organizationId is required');
  }
  if (!payload.clinicId) {
    throw new Error('PatientDeletedEvent: clinicId is required');
  }
  if (!payload.tenantId) {
    throw new Error('PatientDeletedEvent: tenantId is required');
  }
  if (!payload.patientName || payload.patientName.trim().length === 0) {
    throw new Error('PatientDeletedEvent: patientName is required and cannot be empty');
  }
  if (!payload.deletionType) {
    throw new Error('PatientDeletedEvent: deletionType is required');
  }
  if (!payload.deletedBy) {
    throw new Error('PatientDeletedEvent: deletedBy is required');
  }
  if (!payload.deletedAt) {
    throw new Error('PatientDeletedEvent: deletedAt is required');
  }
  if (!payload.deletionReason) {
    throw new Error('PatientDeletedEvent: deletionReason is required');
  }

  // Validate business rules
  if (payload.isUnderLegalHold && payload.deletionType === 'hard') {
    throw new Error(
      'PatientDeletedEvent: Cannot perform hard deletion on record under legal hold'
    );
  }

  if (payload.deletionType === 'hard' && !payload.impact?.retainedDataDescription) {
    throw new Error(
      'PatientDeletedEvent: Hard deletion requires documentation of retained data (if any) for compliance'
    );
  }

  if (payload.requiresApproval && !payload.approvalStatus) {
    throw new Error(
      'PatientDeletedEvent: approvalStatus is required when deletion requires approval'
    );
  }

  if (payload.approvalStatus === 'APPROVED' && !payload.approvedBy) {
    throw new Error('PatientDeletedEvent: approvedBy is required when deletion is approved');
  }

  if (payload.deletionType === 'soft' && !payload.permanentDeletionInDays) {
    throw new Error(
      'PatientDeletedEvent: permanentDeletionInDays is required for soft deletions'
    );
  }

  return {
    id: crypto.randomUUID() as UUID,
    type: PATIENT_DELETED_EVENT,
    version: PATIENT_DELETED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
