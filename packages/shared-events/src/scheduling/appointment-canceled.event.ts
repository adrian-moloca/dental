/**
 * Appointment Canceled Event
 *
 * Published when an appointment is cancelled by patient, provider, or system.
 * This event triggers notifications, resource release, and potential waitlist processing.
 *
 * @module shared-events/scheduling
 */

import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';

/**
 * Appointment canceled event type constant
 */
export const APPOINTMENT_CANCELED_EVENT_TYPE = 'dental.appointment.canceled' as const;

/**
 * Appointment canceled event version
 */
export const APPOINTMENT_CANCELED_EVENT_VERSION = 1;

/**
 * Cancellation type
 * Indicates who initiated the cancellation
 */
export type CancellationType = 'PATIENT' | 'PROVIDER' | 'SYSTEM' | 'NO_SHOW';

/**
 * Cancellation reason category
 * Categorizes the reason for cancellation
 */
export type CancellationReasonCategory =
  | 'PATIENT_REQUEST'
  | 'ILLNESS'
  | 'EMERGENCY'
  | 'SCHEDULING_CONFLICT'
  | 'PROVIDER_UNAVAILABLE'
  | 'CLINIC_CLOSURE'
  | 'WEATHER'
  | 'NO_SHOW'
  | 'POLICY_VIOLATION'
  | 'PAYMENT_ISSUE'
  | 'DUPLICATE_BOOKING'
  | 'OTHER';

/**
 * Cancellation policy details
 * Information about applicable cancellation policies
 */
export interface CancellationPolicyDetails {
  /** Whether cancellation is within policy window */
  withinPolicyWindow: boolean;
  /** Policy window in hours */
  policyWindowHours: number;
  /** Hours before appointment at cancellation time */
  hoursBeforeAppointment: number;
  /** Whether a fee is charged */
  feeCharged: boolean;
  /** Fee amount */
  feeAmount?: number;
  /** Fee currency */
  feeCurrency?: string;
  /** Fee reason */
  feeReason?: string;
  /** Whether fee was waived */
  feeWaived: boolean;
  /** Reason for waiving fee */
  waiverReason?: string;
}

/**
 * Notification details
 * Information about notifications sent
 */
export interface CancellationNotificationDetails {
  /** Whether patient was notified */
  patientNotified: boolean;
  /** Patient notification timestamp */
  patientNotifiedAt?: ISODateString;
  /** Patient notification channels used */
  patientNotificationChannels?: Array<'EMAIL' | 'SMS' | 'PHONE' | 'IN_APP' | 'PUSH'>;
  /** Whether provider was notified */
  providerNotified: boolean;
  /** Provider notification timestamp */
  providerNotifiedAt?: ISODateString;
  /** Whether waitlist was notified */
  waitlistNotified: boolean;
  /** Number of waitlist entries notified */
  waitlistEntriesNotified?: number;
}

/**
 * Resource release details
 * Information about released resources
 */
export interface ResourceReleaseDetails {
  /** Room/operatory released */
  releasedRoom?: string;
  /** Equipment released */
  releasedEquipmentIds?: UUID[];
  /** Whether slot is now available for booking */
  slotAvailableForBooking: boolean;
  /** Whether slot was added to available slots */
  addedToAvailableSlots: boolean;
}

/**
 * Appointment canceled event payload
 *
 * Contains comprehensive information about the cancellation,
 * including policy enforcement, notifications, and resource impact.
 */
export interface AppointmentCanceledPayload {
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

  /** Scheduled start time (of the cancelled appointment) */
  scheduledStartTime: ISODateString;

  /** Scheduled end time (of the cancelled appointment) */
  scheduledEndTime: ISODateString;

  /** Duration in minutes */
  duration: number;

  /** Cancellation type */
  cancellationType: CancellationType;

  /** Cancellation reason category */
  reasonCategory: CancellationReasonCategory;

  /** Detailed cancellation reason */
  reason?: string;

  /** User ID of person who cancelled */
  cancelledBy: UUID;

  /** Timestamp when cancellation occurred */
  cancelledAt: ISODateString;

  /** Hours before scheduled appointment (for policy evaluation) */
  hoursBeforeAppointment: number;

  /** Whether this was a same-day cancellation */
  isSameDayCancellation: boolean;

  /** Cancellation policy details */
  policyDetails: CancellationPolicyDetails;

  /** Notification details */
  notificationDetails: CancellationNotificationDetails;

  /** Resource release details */
  resourceReleaseDetails?: ResourceReleaseDetails;

  /** Whether this cancellation affects a recurring series */
  affectsRecurringSeries: boolean;

  /** Series ID (if part of recurring series) */
  seriesId?: UUID;

  /** Other appointments in series affected */
  affectedSeriesAppointmentIds?: UUID[];

  /** Whether cancellation was automated */
  isAutomated: boolean;

  /** Automation reason (if automated) */
  automationReason?: string;

  /** Whether patient can rebook online */
  canRebookOnline: boolean;

  /** Suggested alternative dates (if available) */
  suggestedAlternativeDates?: ISODateString[];

  /** Number of times this patient has cancelled */
  patientCancellationCount: number;

  /** Whether patient is flagged as frequent canceller */
  patientFlaggedFrequentCanceller: boolean;

  /** Whether to process waitlist for this slot */
  processWaitlist: boolean;

  /** Waitlist entries to notify */
  waitlistEntriesToNotify?: UUID[];

  /** Patient name (for notifications) */
  patientName: string;

  /** Patient email (for notifications) */
  patientEmail?: string;

  /** Patient phone (for notifications) */
  patientPhone?: string;

  /** Provider name (for notifications) */
  providerName: string;

  /** Refund eligibility */
  refundEligible: boolean;

  /** Refund amount (if applicable) */
  refundAmount?: number;

  /** Refund currency */
  refundCurrency?: string;

  /** Refund issued */
  refundIssued: boolean;

  /** Additional notes */
  notes?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Appointment canceled event envelope
 *
 * Complete event with payload and metadata.
 *
 * @example
 * ```typescript
 * const event: AppointmentCanceledEvent = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   type: 'dental.appointment.canceled',
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
 *     scheduledStartTime: '2025-11-25T14:00:00Z',
 *     scheduledEndTime: '2025-11-25T15:00:00Z',
 *     duration: 60,
 *     cancellationType: 'PATIENT',
 *     reasonCategory: 'ILLNESS',
 *     reason: 'Patient is feeling unwell',
 *     cancelledBy: 'patient-123',
 *     cancelledAt: '2025-11-20T10:30:00Z',
 *     hoursBeforeAppointment: 120,
 *     isSameDayCancellation: false,
 *     policyDetails: {
 *       withinPolicyWindow: true,
 *       policyWindowHours: 24,
 *       hoursBeforeAppointment: 120,
 *       feeCharged: false,
 *       feeWaived: true,
 *       waiverReason: 'Medical emergency',
 *     },
 *     notificationDetails: {
 *       patientNotified: true,
 *       patientNotifiedAt: '2025-11-20T10:30:05Z',
 *       patientNotificationChannels: ['EMAIL', 'SMS'],
 *       providerNotified: true,
 *       providerNotifiedAt: '2025-11-20T10:30:05Z',
 *       waitlistNotified: false,
 *     },
 *     affectsRecurringSeries: false,
 *     isAutomated: false,
 *     canRebookOnline: true,
 *     patientCancellationCount: 1,
 *     patientFlaggedFrequentCanceller: false,
 *     processWaitlist: true,
 *     patientName: 'John Doe',
 *     providerName: 'Dr. Smith',
 *     refundEligible: false,
 *     refundIssued: false,
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
export type AppointmentCanceledEvent = EventEnvelope<AppointmentCanceledPayload>;

/**
 * Type guard to check if an event is an AppointmentCanceledEvent
 *
 * @param event - The event to check
 * @returns True if the event is an AppointmentCanceledEvent
 */
export function isAppointmentCanceledEvent(
  event: EventEnvelope<unknown>
): event is AppointmentCanceledEvent {
  return event.type === APPOINTMENT_CANCELED_EVENT_TYPE;
}

/**
 * Factory function to create an AppointmentCanceledEvent
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 */
export function createAppointmentCanceledEvent(
  payload: AppointmentCanceledPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): AppointmentCanceledEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: APPOINTMENT_CANCELED_EVENT_TYPE,
    version: APPOINTMENT_CANCELED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
