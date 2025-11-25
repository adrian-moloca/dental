/**
 * Patient Created Event
 *
 * Published when a new patient is successfully registered in the system.
 * This event triggers patient indexing, notifications, account setup, and analytics.
 *
 * @module shared-events/patient
 */

import type { UUID, OrganizationId, ClinicId, ISODateString, Email, PhoneNumber } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';

/**
 * Patient created event type constant
 */
export const PATIENT_CREATED_EVENT = 'dental.patient.created' as const;

/**
 * Patient created event version
 */
export const PATIENT_CREATED_EVENT_VERSION = 1;

/**
 * Patient registration source enumeration
 * Indicates how the patient was registered
 */
export type PatientRegistrationSource =
  | 'ONLINE_PORTAL'
  | 'FRONT_DESK'
  | 'PHONE'
  | 'IMPORT'
  | 'MIGRATION'
  | 'INTEGRATION'
  | 'OTHER';

/**
 * Patient gender/sex enumeration
 * Follows healthcare standards for medical records
 */
export type PatientGender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY' | 'UNKNOWN';

/**
 * Patient status enumeration
 */
export type PatientStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ARCHIVED';

/**
 * Emergency contact information
 */
export interface EmergencyContact {
  /** Full name of emergency contact */
  name: string;
  /** Relationship to patient */
  relationship?: string;
  /** Contact phone number */
  phone: PhoneNumber;
  /** Alternate phone number */
  alternatePhone?: PhoneNumber;
  /** Email address */
  email?: Email;
}

/**
 * Patient insurance information (minimal for event payload)
 */
export interface PatientInsuranceInfo {
  /** Whether patient has insurance */
  hasInsurance: boolean;
  /** Primary insurance provider name */
  primaryInsuranceProvider?: string;
  /** Insurance plan ID or number */
  insurancePlanId?: string;
}

/**
 * Patient created event payload
 *
 * Contains all essential information about a newly registered patient.
 * Designed to be immutable and contain everything consumers need.
 */
export interface PatientCreatedPayload {
  /** Unique patient identifier */
  patientId: UUID;

  /** Organization ID (tenant context) */
  organizationId: OrganizationId;

  /** Clinic ID where patient is registered */
  clinicId: ClinicId;

  /** Unified tenant identifier for data partitioning */
  tenantId: string;

  /** Patient first name */
  firstName: string;

  /** Patient middle name */
  middleName?: string;

  /** Patient last name */
  lastName: string;

  /** Preferred name or nickname */
  preferredName?: string;

  /** Patient date of birth (ISO 8601 date string) */
  dateOfBirth: ISODateString;

  /** Patient gender/sex */
  gender?: PatientGender;

  /** Primary email address */
  email?: Email;

  /** Primary phone number (E.164 format) */
  phone?: PhoneNumber;

  /** Alternate phone number */
  alternatePhone?: PhoneNumber;

  /** Physical address */
  address?: {
    street?: string;
    street2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };

  /** Emergency contact information */
  emergencyContact?: EmergencyContact;

  /** Insurance information */
  insurance?: PatientInsuranceInfo;

  /** Patient registration source */
  registrationSource: PatientRegistrationSource;

  /** Patient status */
  status: PatientStatus;

  /** Patient chart number or medical record number */
  chartNumber?: string;

  /** Social Security Number (last 4 digits only for events) */
  ssnLast4?: string;

  /** Preferred language code (ISO 639-1) */
  preferredLanguage?: string;

  /** Preferred contact method */
  preferredContactMethod?: 'EMAIL' | 'PHONE' | 'SMS' | 'PORTAL';

  /** Whether patient consented to marketing communications */
  marketingConsent: boolean;

  /** Whether patient consented to SMS communications */
  smsConsent: boolean;

  /** User who created the patient record */
  createdBy?: UUID;

  /** Timestamp when patient was created */
  createdAt: ISODateString;

  /** Referral source */
  referralSource?: string;

  /** Notes or special instructions */
  notes?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient created event envelope
 *
 * Complete event with payload and metadata.
 *
 * @example
 * ```typescript
 * const event: PatientCreatedEvent = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   type: 'dental.patient.created',
 *   version: 1,
 *   occurredAt: new Date('2025-11-20T10:30:00Z'),
 *   payload: {
 *     patientId: '123e4567-e89b-12d3-a456-426614174000',
 *     organizationId: 'org-789',
 *     clinicId: 'clinic-101',
 *     tenantId: 'tenant-789',
 *     firstName: 'John',
 *     lastName: 'Doe',
 *     dateOfBirth: '1985-03-15',
 *     email: 'john.doe@example.com',
 *     phone: '+14155552671',
 *     registrationSource: 'ONLINE_PORTAL',
 *     status: 'ACTIVE',
 *     marketingConsent: true,
 *     smsConsent: true,
 *     createdBy: 'user-123',
 *     createdAt: '2025-11-20T10:30:00Z',
 *   },
 *   metadata: {
 *     correlationId: 'abc123',
 *     userId: 'user-123',
 *     ipAddress: '192.168.1.1',
 *   },
 *   tenantContext: {
 *     organizationId: 'org-789',
 *     clinicId: 'clinic-101',
 *     tenantId: 'tenant-789',
 *   },
 * };
 * ```
 */
export type PatientCreatedEvent = EventEnvelope<PatientCreatedPayload>;

/**
 * Type guard to check if an event is a PatientCreatedEvent
 *
 * @param event - The event to check
 * @returns True if the event is a PatientCreatedEvent
 */
export function isPatientCreatedEvent(
  event: EventEnvelope<unknown>
): event is PatientCreatedEvent {
  return event.type === PATIENT_CREATED_EVENT;
}

/**
 * Factory function to create a PatientCreatedEvent
 *
 * Validates required fields and generates a complete event envelope.
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 * @throws {Error} If required fields are missing or invalid
 */
export function createPatientCreatedEvent(
  payload: PatientCreatedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): PatientCreatedEvent {
  // Validate critical required fields
  if (!payload.patientId) {
    throw new Error('PatientCreatedEvent: patientId is required');
  }
  if (!payload.organizationId) {
    throw new Error('PatientCreatedEvent: organizationId is required');
  }
  if (!payload.clinicId) {
    throw new Error('PatientCreatedEvent: clinicId is required');
  }
  if (!payload.tenantId) {
    throw new Error('PatientCreatedEvent: tenantId is required');
  }
  if (!payload.firstName || payload.firstName.trim().length === 0) {
    throw new Error('PatientCreatedEvent: firstName is required and cannot be empty');
  }
  if (!payload.lastName || payload.lastName.trim().length === 0) {
    throw new Error('PatientCreatedEvent: lastName is required and cannot be empty');
  }
  if (!payload.dateOfBirth) {
    throw new Error('PatientCreatedEvent: dateOfBirth is required');
  }
  if (!payload.registrationSource) {
    throw new Error('PatientCreatedEvent: registrationSource is required');
  }
  if (!payload.status) {
    throw new Error('PatientCreatedEvent: status is required');
  }
  if (!payload.createdAt) {
    throw new Error('PatientCreatedEvent: createdAt is required');
  }

  return {
    id: crypto.randomUUID() as UUID,
    type: PATIENT_CREATED_EVENT,
    version: PATIENT_CREATED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
