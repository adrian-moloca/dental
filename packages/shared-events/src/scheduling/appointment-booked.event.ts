/**
 * Appointment Booked Event
 *
 * Published when a new appointment is successfully booked in the system.
 * This event triggers notifications, calendar updates, and resource allocation.
 *
 * @module shared-events/scheduling
 */

import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';

/**
 * Appointment booked event type constant
 */
export const APPOINTMENT_BOOKED_EVENT_TYPE = 'dental.appointment.booked' as const;

/**
 * Appointment booked event version
 */
export const APPOINTMENT_BOOKED_EVENT_VERSION = 1;

/**
 * Booking source enumeration
 * Indicates how the appointment was booked
 */
export type BookingSource =
  | 'ONLINE_PORTAL'
  | 'PHONE'
  | 'WALK_IN'
  | 'ADMIN'
  | 'INTEGRATION'
  | 'OTHER';

/**
 * Appointment priority enumeration
 */
export type AppointmentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

/**
 * Participant role enumeration
 */
export type ParticipantRole = 'PROVIDER' | 'ASSISTANT' | 'HYGIENIST' | 'SPECIALIST' | 'OTHER';

/**
 * Appointment participant data
 */
export interface AppointmentParticipantData {
  /** User ID of the participant */
  userId: UUID;
  /** Role of the participant */
  role: ParticipantRole;
  /** Whether this participant is required */
  required: boolean;
  /** Display name */
  displayName?: string;
}

/**
 * Appointment booked event payload
 *
 * Contains all essential information about a newly booked appointment.
 * Designed to be immutable and contain everything consumers need.
 */
export interface AppointmentBookedPayload {
  /** Unique appointment identifier */
  appointmentId: UUID;

  /** Patient who booked the appointment */
  patientId: UUID;

  /** Primary provider for the appointment */
  providerId: UUID;

  /** Organization ID (tenant context) */
  organizationId: OrganizationId;

  /** Clinic ID where appointment is scheduled */
  clinicId: ClinicId;

  /** Appointment title/summary */
  title: string;

  /** Detailed description of the appointment */
  description?: string;

  /** Type of appointment (e.g., "Cleaning", "Root Canal") */
  appointmentType: string;

  /** Appointment type code for system categorization */
  appointmentTypeCode?: string;

  /** Scheduled start time (ISO 8601) */
  scheduledStartTime: ISODateString;

  /** Scheduled end time (ISO 8601) */
  scheduledEndTime: ISODateString;

  /** Duration in minutes */
  duration: number;

  /** Priority level */
  priority: AppointmentPriority;

  /** Room or operatory assigned */
  room?: string;

  /** Additional participants (assistants, hygienists, etc.) */
  participants: AppointmentParticipantData[];

  /** Booking source */
  bookingSource: BookingSource;

  /** User who created the booking */
  bookedBy: UUID;

  /** Timestamp when booking was created */
  bookedAt: ISODateString;

  /** Whether booking requires approval */
  requiresApproval: boolean;

  /** Approval status if required */
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';

  /** Whether this is a recurring appointment */
  isRecurring: boolean;

  /** Parent appointment ID (for recurring appointments) */
  parentAppointmentId?: UUID;

  /** Series ID linking all occurrences of recurring appointment */
  seriesId?: UUID;

  /** Recurrence pattern */
  recurrencePattern?: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';

  /** Patient name (for display/notification purposes) */
  patientName: string;

  /** Patient email (for notifications) */
  patientEmail?: string;

  /** Patient phone (for notifications) */
  patientPhone?: string;

  /** Provider name (for display/notification purposes) */
  providerName: string;

  /** Confirmation token for online bookings */
  confirmationToken?: string;

  /** Notes or special instructions */
  notes?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Appointment booked event envelope
 *
 * Complete event with payload and metadata.
 *
 * @example
 * ```typescript
 * const event: AppointmentBookedEvent = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   type: 'dental.appointment.booked',
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
 *     priority: 'MEDIUM',
 *     participants: [],
 *     bookingSource: 'ONLINE_PORTAL',
 *     bookedBy: 'patient-123',
 *     bookedAt: '2025-11-20T10:30:00Z',
 *     requiresApproval: false,
 *     isRecurring: false,
 *     patientName: 'John Doe',
 *     providerName: 'Dr. Smith',
 *   },
 *   metadata: {
 *     correlationId: 'abc123',
 *     userId: 'patient-123',
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
export type AppointmentBookedEvent = EventEnvelope<AppointmentBookedPayload>;

/**
 * Type guard to check if an event is an AppointmentBookedEvent
 *
 * @param event - The event to check
 * @returns True if the event is an AppointmentBookedEvent
 */
export function isAppointmentBookedEvent(
  event: EventEnvelope<unknown>
): event is AppointmentBookedEvent {
  return event.type === APPOINTMENT_BOOKED_EVENT_TYPE;
}

/**
 * Factory function to create an AppointmentBookedEvent
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 */
export function createAppointmentBookedEvent(
  payload: AppointmentBookedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): AppointmentBookedEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: APPOINTMENT_BOOKED_EVENT_TYPE,
    version: APPOINTMENT_BOOKED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
