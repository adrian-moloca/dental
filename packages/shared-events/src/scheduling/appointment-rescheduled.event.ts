/**
 * Appointment Rescheduled Event
 *
 * Published when an existing appointment is moved to a new time slot.
 * This event triggers notifications to affected parties and resource reallocation.
 *
 * @module shared-events/scheduling
 */

import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';

/**
 * Appointment rescheduled event type constant
 */
export const APPOINTMENT_RESCHEDULED_EVENT_TYPE = 'dental.appointment.rescheduled' as const;

/**
 * Appointment rescheduled event version
 */
export const APPOINTMENT_RESCHEDULED_EVENT_VERSION = 1;

/**
 * Reschedule reason category
 * Categorizes why the appointment was rescheduled
 */
export type RescheduleReasonCategory =
  | 'PATIENT_REQUEST'
  | 'PROVIDER_UNAVAILABLE'
  | 'CLINIC_CLOSURE'
  | 'EMERGENCY'
  | 'CONFLICT_RESOLUTION'
  | 'OPTIMIZATION'
  | 'SYSTEM'
  | 'OTHER';

/**
 * Reschedule initiated by
 * Indicates who initiated the reschedule
 */
export type RescheduleInitiator = 'PATIENT' | 'PROVIDER' | 'STAFF' | 'SYSTEM' | 'ADMIN';

/**
 * Time slot change details
 * Captures the before and after state of the time slot
 */
export interface TimeSlotChange {
  /** Previous start time */
  previousStartTime: ISODateString;
  /** Previous end time */
  previousEndTime: ISODateString;
  /** New start time */
  newStartTime: ISODateString;
  /** New end time */
  newEndTime: ISODateString;
  /** Previous duration (minutes) */
  previousDuration: number;
  /** New duration (minutes) */
  newDuration: number;
  /** Whether duration changed */
  durationChanged: boolean;
}

/**
 * Resource change details
 * Captures changes in room or resource allocation
 */
export interface ResourceChange {
  /** Previous room/operatory */
  previousRoom?: string;
  /** New room/operatory */
  newRoom?: string;
  /** Previous clinic ID (if clinic changed) */
  previousClinicId?: ClinicId;
  /** New clinic ID (if clinic changed) */
  newClinicId?: ClinicId;
  /** Whether location changed */
  locationChanged: boolean;
}

/**
 * Appointment rescheduled event payload
 *
 * Contains comprehensive information about the rescheduling,
 * including both previous and new appointment details.
 */
export interface AppointmentRescheduledPayload {
  /** Unique appointment identifier */
  appointmentId: UUID;

  /** Patient ID */
  patientId: UUID;

  /** Provider ID */
  providerId: UUID;

  /** Organization ID */
  organizationId: OrganizationId;

  /** Clinic ID */
  clinicId: ClinicId;

  /** Appointment title */
  title: string;

  /** Appointment type */
  appointmentType: string;

  /** Time slot changes */
  timeSlotChange: TimeSlotChange;

  /** Resource/location changes (if any) */
  resourceChange?: ResourceChange;

  /** Reason category for reschedule */
  reasonCategory: RescheduleReasonCategory;

  /** Detailed reason for reschedule */
  reason?: string;

  /** Who initiated the reschedule */
  initiator: RescheduleInitiator;

  /** User ID of person who performed the reschedule */
  rescheduledBy: UUID;

  /** Timestamp when reschedule occurred */
  rescheduledAt: ISODateString;

  /** Whether this was a system-automated reschedule */
  isAutomated: boolean;

  /** Whether patient was notified */
  patientNotified: boolean;

  /** Notification sent timestamp */
  notificationSentAt?: ISODateString;

  /** Whether patient confirmed the new time */
  patientConfirmed: boolean;

  /** Confirmation timestamp */
  confirmedAt?: ISODateString;

  /** Number of times this appointment has been rescheduled */
  rescheduleCount: number;

  /** Whether this exceeds the maximum allowed reschedules */
  exceedsMaxReschedules: boolean;

  /** Whether this reschedule incurs a fee */
  feeApplied: boolean;

  /** Fee amount (if applicable) */
  feeAmount?: number;

  /** Fee currency */
  feeCurrency?: string;

  /** Affected related appointments (e.g., in a series) */
  affectedAppointmentIds?: UUID[];

  /** Patient name (for notifications) */
  patientName: string;

  /** Patient email (for notifications) */
  patientEmail?: string;

  /** Patient phone (for notifications) */
  patientPhone?: string;

  /** Provider name (for notifications) */
  providerName: string;

  /** Confirmation token for patient response */
  confirmationToken?: string;

  /** Additional notes */
  notes?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Appointment rescheduled event envelope
 *
 * Complete event with payload and metadata.
 *
 * @example
 * ```typescript
 * const event: AppointmentRescheduledEvent = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   type: 'dental.appointment.rescheduled',
 *   version: 1,
 *   occurredAt: new Date('2025-11-20T10:30:00Z'),
 *   payload: {
 *     appointmentId: '123e4567-e89b-12d3-a456-426614174000',
 *     patientId: 'patient-123',
 *     providerId: 'provider-456',
 *     organizationId: 'org-789',
 *     clinicId: 'clinic-101',
 *     title: 'Routine Cleaning',
 *     appointmentType: 'CLEANING',
 *     timeSlotChange: {
 *       previousStartTime: '2025-11-25T14:00:00Z',
 *       previousEndTime: '2025-11-25T15:00:00Z',
 *       newStartTime: '2025-11-26T10:00:00Z',
 *       newEndTime: '2025-11-26T11:00:00Z',
 *       previousDuration: 60,
 *       newDuration: 60,
 *       durationChanged: false,
 *     },
 *     reasonCategory: 'PATIENT_REQUEST',
 *     reason: 'Patient has a scheduling conflict',
 *     initiator: 'PATIENT',
 *     rescheduledBy: 'patient-123',
 *     rescheduledAt: '2025-11-20T10:30:00Z',
 *     isAutomated: false,
 *     patientNotified: true,
 *     patientConfirmed: false,
 *     rescheduleCount: 1,
 *     exceedsMaxReschedules: false,
 *     feeApplied: false,
 *     patientName: 'John Doe',
 *     providerName: 'Dr. Smith',
 *   },
 *   metadata: {
 *     correlationId: 'abc123',
 *     userId: 'patient-123',
 *   },
 *   tenantContext: {
 *     organizationId: 'org-789',
 *     clinicId: 'clinic-101',
 *     tenantId: 'tenant-789',
 *   },
 * };
 * ```
 */
export type AppointmentRescheduledEvent = EventEnvelope<AppointmentRescheduledPayload>;

/**
 * Type guard to check if an event is an AppointmentRescheduledEvent
 *
 * @param event - The event to check
 * @returns True if the event is an AppointmentRescheduledEvent
 */
export function isAppointmentRescheduledEvent(
  event: EventEnvelope<unknown>
): event is AppointmentRescheduledEvent {
  return event.type === APPOINTMENT_RESCHEDULED_EVENT_TYPE;
}

/**
 * Factory function to create an AppointmentRescheduledEvent
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 */
export function createAppointmentRescheduledEvent(
  payload: AppointmentRescheduledPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): AppointmentRescheduledEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: APPOINTMENT_RESCHEDULED_EVENT_TYPE,
    version: APPOINTMENT_RESCHEDULED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
