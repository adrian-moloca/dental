/**
 * Patient Anonymized Event
 *
 * Published when a patient record is anonymized for GDPR/privacy compliance or data retention.
 * Anonymization irreversibly removes or pseudonymizes all personally identifiable information (PII)
 * while retaining statistical and clinical data for research, quality improvement, or legal requirements.
 *
 * This is distinct from deletion - anonymized records remain in the system but cannot be
 * linked back to the individual patient.
 *
 * @module shared-events/patient
 */

import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';

/**
 * Patient anonymized event type constant
 */
export const PATIENT_ANONYMIZED_EVENT = 'dental.patient.anonymized' as const;

/**
 * Patient anonymized event version
 */
export const PATIENT_ANONYMIZED_EVENT_VERSION = 1;

/**
 * Anonymization method enumeration
 * Defines the technique used to anonymize data
 */
export type AnonymizationMethod =
  | 'FULL_PSEUDONYMIZATION'
  | 'PARTIAL_PSEUDONYMIZATION'
  | 'DATA_MASKING'
  | 'GENERALIZATION'
  | 'DATA_AGGREGATION'
  | 'SUPPRESSION'
  | 'HYBRID';

/**
 * Anonymization reason category
 * Categorizes why the patient record was anonymized
 */
export type AnonymizationReason =
  | 'GDPR_COMPLIANCE'
  | 'PATIENT_REQUEST'
  | 'DATA_RETENTION_POLICY'
  | 'RESEARCH_PURPOSES'
  | 'LEGAL_REQUIREMENT'
  | 'DECEASED_PATIENT'
  | 'REGULATORY_COMPLIANCE'
  | 'QUALITY_IMPROVEMENT'
  | 'OTHER';

/**
 * Anonymized field information
 * Tracks which fields were anonymized and how
 */
export interface AnonymizedField {
  /** Name of the field that was anonymized */
  fieldName: string;
  /** Original data type */
  originalDataType: string;
  /** Anonymization technique applied */
  technique: 'MASKED' | 'PSEUDONYMIZED' | 'GENERALIZED' | 'SUPPRESSED' | 'HASHED' | 'RANDOMIZED';
  /** Whether the field can be de-anonymized with a key */
  isReversible: boolean;
  /** Example of anonymized value (for audit) */
  exampleValue?: string;
}

/**
 * Data retention details
 * Defines what data was retained after anonymization
 */
export interface RetainedDataDetails {
  /** Clinical data retained (diagnoses, procedures, etc.) */
  clinicalDataRetained: boolean;
  /** Statistical data retained (age range, zip code prefix, etc.) */
  statisticalDataRetained: boolean;
  /** Billing/financial data retained (amounts, dates, etc.) */
  financialDataRetained: boolean;
  /** Appointment history retained (dates, durations, types) */
  appointmentHistoryRetained: boolean;
  /** List of specific fields retained */
  retainedFields?: readonly string[];
  /** Retention period for anonymized data */
  retentionPeriodDays?: number;
  /** Purpose for retaining data */
  retentionPurpose?: string;
}

/**
 * Anonymization impact summary
 * Tracks what data was affected by anonymization
 */
export interface AnonymizationImpact {
  /** Number of PII fields anonymized */
  piiFieldsCount: number;
  /** Number of appointments affected */
  appointmentsCount?: number;
  /** Number of documents affected */
  documentsCount?: number;
  /** Number of communications affected */
  communicationsCount?: number;
  /** List of related entity types affected */
  affectedEntities?: readonly string[];
  /** Whether any linked records remain identifiable */
  hasLinkedIdentifiableData: boolean;
}

/**
 * Patient anonymized event payload
 *
 * Contains comprehensive information about the anonymization operation including
 * patient identifiers (before anonymization), method, impact, and compliance details.
 */
export interface PatientAnonymizedPayload {
  /** Original patient identifier (before anonymization) */
  patientId: UUID;

  /** New anonymized patient identifier */
  anonymizedPatientId: UUID;

  /** Organization ID (tenant context) */
  organizationId: OrganizationId;

  /** Clinic ID where patient belonged */
  clinicId: ClinicId;

  /** Unified tenant identifier for data partitioning */
  tenantId: string;

  /** Original patient full name (for audit only, should not be persisted long-term) */
  originalPatientName: string;

  /** Original chart number (for audit trail) */
  originalChartNumber?: string;

  /** New anonymized display name (e.g., "Patient-12345") */
  anonymizedDisplayName: string;

  /** Anonymization method used */
  anonymizationMethod: AnonymizationMethod;

  /** User who performed the anonymization */
  anonymizedBy: UUID;

  /** User display name who performed the anonymization */
  anonymizedByName?: string;

  /** Timestamp when anonymization was performed */
  anonymizedAt: ISODateString;

  /** Categorized reason for anonymization */
  anonymizationReason: AnonymizationReason;

  /** Detailed explanation for anonymization */
  anonymizationJustification?: string;

  /** List of fields that were anonymized */
  anonymizedFields: readonly AnonymizedField[];

  /** Details about retained data */
  retainedData?: RetainedDataDetails;

  /** Anonymization impact summary */
  impact: AnonymizationImpact;

  /** Whether anonymization is reversible (should typically be false) */
  isReversible: boolean;

  /** Key identifier if reversible (encrypted, stored separately) */
  reversibilityKeyId?: UUID;

  /** Anonymization operation ID for tracking and audit */
  anonymizationOperationId?: UUID;

  /** Whether anonymization required approval */
  requiresApproval: boolean;

  /** Approval status if required */
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';

  /** User who approved anonymization */
  approvedBy?: UUID;

  /** Timestamp when anonymization was approved */
  approvedAt?: ISODateString;

  /** Compliance framework or standard applied */
  complianceFramework?: 'GDPR' | 'HIPAA' | 'CCPA' | 'PIPEDA' | 'OTHER';

  /** Audit log reference for compliance */
  auditLogReference?: string;

  /** Whether notification was sent to patient before anonymization */
  patientNotified: boolean;

  /** Notification method used */
  notificationMethod?: 'EMAIL' | 'PHONE' | 'MAIL' | 'IN_PERSON' | 'NONE';

  /** Whether data export was provided before anonymization */
  dataExportProvided: boolean;

  /** Export file reference if provided */
  dataExportReference?: string;

  /** Privacy officer or DPO who validated anonymization */
  validatedBy?: UUID;

  /** Validation timestamp */
  validatedAt?: ISODateString;

  /** Whether anonymization meets k-anonymity standard */
  meetsKAnonymity?: boolean;

  /** k-anonymity value if applicable */
  kAnonymityValue?: number;

  /** Compliance notes and documentation */
  complianceNotes?: string;

  /** Notes or comments about the anonymization */
  notes?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient anonymized event envelope
 *
 * Complete event with payload and metadata.
 *
 * @example
 * ```typescript
 * const event: PatientAnonymizedEvent = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   type: 'dental.patient.anonymized',
 *   version: 1,
 *   occurredAt: new Date('2025-11-20T18:00:00Z'),
 *   payload: {
 *     patientId: '123e4567-e89b-12d3-a456-426614174000',
 *     anonymizedPatientId: 'anon-987f6543-e21b-12d3-a456-426614174222',
 *     organizationId: 'org-789',
 *     clinicId: 'clinic-101',
 *     tenantId: 'tenant-789',
 *     originalPatientName: 'John Doe',
 *     originalChartNumber: 'PT-12345',
 *     anonymizedDisplayName: 'Patient-98765',
 *     anonymizationMethod: 'FULL_PSEUDONYMIZATION',
 *     anonymizedBy: 'user-dpo-123',
 *     anonymizedByName: 'Privacy Officer',
 *     anonymizedAt: '2025-11-20T18:00:00Z',
 *     anonymizationReason: 'GDPR_COMPLIANCE',
 *     anonymizationJustification: 'Patient exercised right to be forgotten under GDPR Article 17',
 *     anonymizedFields: [
 *       { fieldName: 'firstName', originalDataType: 'string', technique: 'SUPPRESSED', isReversible: false },
 *       { fieldName: 'lastName', originalDataType: 'string', technique: 'SUPPRESSED', isReversible: false },
 *       { fieldName: 'email', originalDataType: 'string', technique: 'MASKED', isReversible: false },
 *     ],
 *     impact: {
 *       piiFieldsCount: 12,
 *       appointmentsCount: 25,
 *       hasLinkedIdentifiableData: false,
 *     },
 *     isReversible: false,
 *     requiresApproval: true,
 *     approvalStatus: 'APPROVED',
 *     approvedBy: 'user-admin-456',
 *     complianceFramework: 'GDPR',
 *     patientNotified: true,
 *     dataExportProvided: true,
 *     meetsKAnonymity: true,
 *     kAnonymityValue: 5,
 *   },
 *   metadata: {
 *     correlationId: 'anon-corr-123',
 *     userId: 'user-dpo-123',
 *   },
 *   tenantContext: {
 *     organizationId: 'org-789',
 *     clinicId: 'clinic-101',
 *     tenantId: 'tenant-789',
 *   },
 * };
 * ```
 */
export type PatientAnonymizedEvent = EventEnvelope<PatientAnonymizedPayload>;

/**
 * Type guard to check if an event is a PatientAnonymizedEvent
 *
 * @param event - The event to check
 * @returns True if the event is a PatientAnonymizedEvent
 */
export function isPatientAnonymizedEvent(
  event: EventEnvelope<unknown>
): event is PatientAnonymizedEvent {
  return event.type === PATIENT_ANONYMIZED_EVENT;
}

/**
 * Factory function to create a PatientAnonymizedEvent
 *
 * Validates required fields and business rules, generates a complete event envelope.
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 * @throws {Error} If required fields are missing or invalid
 */
export function createPatientAnonymizedEvent(
  payload: PatientAnonymizedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): PatientAnonymizedEvent {
  // Validate critical required fields
  if (!payload.patientId) {
    throw new Error('PatientAnonymizedEvent: patientId is required');
  }
  if (!payload.anonymizedPatientId) {
    throw new Error('PatientAnonymizedEvent: anonymizedPatientId is required');
  }
  if (payload.patientId === payload.anonymizedPatientId) {
    throw new Error('PatientAnonymizedEvent: patientId and anonymizedPatientId must be different');
  }
  if (!payload.organizationId) {
    throw new Error('PatientAnonymizedEvent: organizationId is required');
  }
  if (!payload.clinicId) {
    throw new Error('PatientAnonymizedEvent: clinicId is required');
  }
  if (!payload.tenantId) {
    throw new Error('PatientAnonymizedEvent: tenantId is required');
  }
  if (!payload.originalPatientName || payload.originalPatientName.trim().length === 0) {
    throw new Error('PatientAnonymizedEvent: originalPatientName is required and cannot be empty');
  }
  if (!payload.anonymizedDisplayName || payload.anonymizedDisplayName.trim().length === 0) {
    throw new Error('PatientAnonymizedEvent: anonymizedDisplayName is required and cannot be empty');
  }
  if (!payload.anonymizationMethod) {
    throw new Error('PatientAnonymizedEvent: anonymizationMethod is required');
  }
  if (!payload.anonymizedBy) {
    throw new Error('PatientAnonymizedEvent: anonymizedBy is required');
  }
  if (!payload.anonymizedAt) {
    throw new Error('PatientAnonymizedEvent: anonymizedAt is required');
  }
  if (!payload.anonymizationReason) {
    throw new Error('PatientAnonymizedEvent: anonymizationReason is required');
  }
  if (!payload.anonymizedFields || payload.anonymizedFields.length === 0) {
    throw new Error('PatientAnonymizedEvent: anonymizedFields is required and cannot be empty');
  }
  if (!payload.impact) {
    throw new Error('PatientAnonymizedEvent: impact is required');
  }
  if (payload.impact.piiFieldsCount < 1) {
    throw new Error('PatientAnonymizedEvent: impact.piiFieldsCount must be at least 1');
  }

  // Validate business rules
  if (payload.requiresApproval && !payload.approvalStatus) {
    throw new Error(
      'PatientAnonymizedEvent: approvalStatus is required when anonymization requires approval'
    );
  }

  if (payload.approvalStatus === 'APPROVED' && !payload.approvedBy) {
    throw new Error('PatientAnonymizedEvent: approvedBy is required when anonymization is approved');
  }

  if (payload.isReversible && !payload.reversibilityKeyId) {
    throw new Error(
      'PatientAnonymizedEvent: reversibilityKeyId is required for reversible anonymization'
    );
  }

  // Validate anonymized fields
  const hasInvalidFields = payload.anonymizedFields.some(
    (field) => !field.fieldName || !field.originalDataType || !field.technique
  );
  if (hasInvalidFields) {
    throw new Error(
      'PatientAnonymizedEvent: All anonymizedFields must have fieldName, originalDataType, and technique'
    );
  }

  // Warn if reversible anonymization is used (typically should not be)
  if (payload.isReversible) {
    console.warn(
      'PatientAnonymizedEvent: Reversible anonymization may not meet GDPR compliance requirements'
    );
  }

  return {
    id: crypto.randomUUID() as UUID,
    type: PATIENT_ANONYMIZED_EVENT,
    version: PATIENT_ANONYMIZED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
