/**
 * Patient Updated Event
 *
 * Published when patient information is modified in the system.
 * This event triggers cache invalidation, index updates, audit logging, and notifications.
 *
 * @module shared-events/patient
 */

import type { UUID, OrganizationId, ClinicId, ISODateString, Email, PhoneNumber } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { PatientGender, PatientStatus, EmergencyContact, PatientInsuranceInfo } from './patient-created.event';

/**
 * Patient updated event type constant
 */
export const PATIENT_UPDATED_EVENT = 'dental.patient.updated' as const;

/**
 * Patient updated event version
 */
export const PATIENT_UPDATED_EVENT_VERSION = 1;

/**
 * Update reason category
 * Indicates the nature of the update
 */
export type PatientUpdateReason =
  | 'CONTACT_INFO_CHANGE'
  | 'ADDRESS_CHANGE'
  | 'INSURANCE_CHANGE'
  | 'MEDICAL_HISTORY_UPDATE'
  | 'PERSONAL_INFO_CORRECTION'
  | 'STATUS_CHANGE'
  | 'EMERGENCY_CONTACT_CHANGE'
  | 'PREFERENCES_UPDATE'
  | 'PROFILE_COMPLETION'
  | 'DATA_CORRECTION'
  | 'OTHER';

/**
 * Changed field information
 * Tracks what changed from old to new value
 */
export interface ChangedField<T = unknown> {
  /** Name of the field that changed */
  fieldName: string;
  /** Previous value (undefined if field was added) */
  oldValue?: T;
  /** New value (undefined if field was removed) */
  newValue?: T;
}

/**
 * Patient updated event payload
 *
 * Contains the updated patient information and tracks what changed.
 * Only includes fields that were actually modified to minimize payload size.
 */
export interface PatientUpdatedPayload {
  /** Unique patient identifier */
  patientId: UUID;

  /** Organization ID (tenant context) */
  organizationId: OrganizationId;

  /** Clinic ID where patient belongs */
  clinicId: ClinicId;

  /** Unified tenant identifier for data partitioning */
  tenantId: string;

  /** List of field names that were updated */
  updatedFields: readonly string[];

  /** Detailed change tracking (optional, for audit purposes) */
  changes?: readonly ChangedField[];

  /** Reason for the update */
  updateReason?: PatientUpdateReason;

  /** User-provided reason or notes */
  updateNotes?: string;

  /** Updated first name (if changed) */
  firstName?: string;

  /** Updated middle name (if changed) */
  middleName?: string;

  /** Updated last name (if changed) */
  lastName?: string;

  /** Updated preferred name (if changed) */
  preferredName?: string;

  /** Updated date of birth (if changed) */
  dateOfBirth?: ISODateString;

  /** Updated gender (if changed) */
  gender?: PatientGender;

  /** Updated email (if changed) */
  email?: Email;

  /** Updated phone (if changed) */
  phone?: PhoneNumber;

  /** Updated alternate phone (if changed) */
  alternatePhone?: PhoneNumber;

  /** Updated address (if changed) */
  address?: {
    street?: string;
    street2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };

  /** Updated emergency contact (if changed) */
  emergencyContact?: EmergencyContact;

  /** Updated insurance information (if changed) */
  insurance?: PatientInsuranceInfo;

  /** Updated patient status (if changed) */
  status?: PatientStatus;

  /** Updated chart number (if changed) */
  chartNumber?: string;

  /** Updated preferred language (if changed) */
  preferredLanguage?: string;

  /** Updated preferred contact method (if changed) */
  preferredContactMethod?: 'EMAIL' | 'PHONE' | 'SMS' | 'PORTAL';

  /** Updated marketing consent (if changed) */
  marketingConsent?: boolean;

  /** Updated SMS consent (if changed) */
  smsConsent?: boolean;

  /** User who performed the update */
  updatedBy?: UUID;

  /** Timestamp when patient was updated */
  updatedAt: ISODateString;

  /** Previous version or revision number */
  previousVersion?: number;

  /** New version or revision number */
  currentVersion?: number;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient updated event envelope
 *
 * Complete event with payload and metadata.
 *
 * @example
 * ```typescript
 * const event: PatientUpdatedEvent = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   type: 'dental.patient.updated',
 *   version: 1,
 *   occurredAt: new Date('2025-11-20T15:45:00Z'),
 *   payload: {
 *     patientId: '123e4567-e89b-12d3-a456-426614174000',
 *     organizationId: 'org-789',
 *     clinicId: 'clinic-101',
 *     tenantId: 'tenant-789',
 *     updatedFields: ['email', 'phone'],
 *     updateReason: 'CONTACT_INFO_CHANGE',
 *     email: 'john.doe.new@example.com',
 *     phone: '+14155559999',
 *     changes: [
 *       {
 *         fieldName: 'email',
 *         oldValue: 'john.doe@example.com',
 *         newValue: 'john.doe.new@example.com',
 *       },
 *       {
 *         fieldName: 'phone',
 *         oldValue: '+14155552671',
 *         newValue: '+14155559999',
 *       },
 *     ],
 *     updatedBy: 'user-456',
 *     updatedAt: '2025-11-20T15:45:00Z',
 *   },
 *   metadata: {
 *     correlationId: 'def456',
 *     userId: 'user-456',
 *     ipAddress: '192.168.1.5',
 *   },
 *   tenantContext: {
 *     organizationId: 'org-789',
 *     clinicId: 'clinic-101',
 *     tenantId: 'tenant-789',
 *   },
 * };
 * ```
 */
export type PatientUpdatedEvent = EventEnvelope<PatientUpdatedPayload>;

/**
 * Type guard to check if an event is a PatientUpdatedEvent
 *
 * @param event - The event to check
 * @returns True if the event is a PatientUpdatedEvent
 */
export function isPatientUpdatedEvent(
  event: EventEnvelope<unknown>
): event is PatientUpdatedEvent {
  return event.type === PATIENT_UPDATED_EVENT;
}

/**
 * Factory function to create a PatientUpdatedEvent
 *
 * Validates required fields and generates a complete event envelope.
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 * @throws {Error} If required fields are missing or invalid
 */
export function createPatientUpdatedEvent(
  payload: PatientUpdatedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): PatientUpdatedEvent {
  // Validate critical required fields
  if (!payload.patientId) {
    throw new Error('PatientUpdatedEvent: patientId is required');
  }
  if (!payload.organizationId) {
    throw new Error('PatientUpdatedEvent: organizationId is required');
  }
  if (!payload.clinicId) {
    throw new Error('PatientUpdatedEvent: clinicId is required');
  }
  if (!payload.tenantId) {
    throw new Error('PatientUpdatedEvent: tenantId is required');
  }
  if (!payload.updatedFields || payload.updatedFields.length === 0) {
    throw new Error('PatientUpdatedEvent: updatedFields is required and cannot be empty');
  }
  if (!payload.updatedAt) {
    throw new Error('PatientUpdatedEvent: updatedAt is required');
  }

  // Validate that at least one field was actually updated
  const hasUpdatedData = payload.updatedFields.some((field) => {
    return payload[field as keyof PatientUpdatedPayload] !== undefined;
  });

  if (!hasUpdatedData && !payload.changes) {
    throw new Error('PatientUpdatedEvent: No updated data provided for specified fields');
  }

  return {
    id: crypto.randomUUID() as UUID,
    type: PATIENT_UPDATED_EVENT,
    version: PATIENT_UPDATED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
