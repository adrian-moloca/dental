/**
 * Scheduling Events
 *
 * Event contracts for appointment scheduling, rescheduling, and cancellation.
 *
 * @module shared-events/scheduling
 */

// ============================================================================
// Appointment Booked Event
// ============================================================================
export {
  APPOINTMENT_BOOKED_EVENT_TYPE,
  APPOINTMENT_BOOKED_EVENT_VERSION,
  isAppointmentBookedEvent,
  createAppointmentBookedEvent,
} from './appointment-booked.event';

export type {
  AppointmentBookedPayload,
  AppointmentBookedEvent,
  BookingSource,
  AppointmentPriority,
  ParticipantRole,
  AppointmentParticipantData,
} from './appointment-booked.event';

// ============================================================================
// Appointment Rescheduled Event
// ============================================================================
export {
  APPOINTMENT_RESCHEDULED_EVENT_TYPE,
  APPOINTMENT_RESCHEDULED_EVENT_VERSION,
  isAppointmentRescheduledEvent,
  createAppointmentRescheduledEvent,
} from './appointment-rescheduled.event';

export type {
  AppointmentRescheduledPayload,
  AppointmentRescheduledEvent,
  RescheduleReasonCategory,
  RescheduleInitiator,
  TimeSlotChange,
  ResourceChange,
} from './appointment-rescheduled.event';

// ============================================================================
// Appointment Canceled Event
// ============================================================================
export {
  APPOINTMENT_CANCELED_EVENT_TYPE,
  APPOINTMENT_CANCELED_EVENT_VERSION,
  isAppointmentCanceledEvent,
  createAppointmentCanceledEvent,
} from './appointment-canceled.event';

export type {
  AppointmentCanceledPayload,
  AppointmentCanceledEvent,
  CancellationType,
  CancellationReasonCategory,
  CancellationPolicyDetails,
  CancellationNotificationDetails,
  ResourceReleaseDetails,
} from './appointment-canceled.event';

// ============================================================================
// Reminder Events
// ============================================================================
export type {
  ReminderScheduledEvent,
  ReminderSentEvent,
  ReminderDeliveredEvent,
  ReminderReadEvent,
  ReminderFailedEvent,
  PatientConfirmedViaReminderEvent,
  PatientCancelledViaReminderEvent,
} from './reminder-scheduled.event';
