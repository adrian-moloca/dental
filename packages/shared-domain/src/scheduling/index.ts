/**
 * Scheduling Domain Types
 *
 * Domain types for appointment scheduling, provider schedules, and booking rules.
 *
 * @module shared-domain/scheduling
 */

// ============================================================================
// Appointment Types
// ============================================================================
export {
  AppointmentStatus,
  CancellationType,
  AppointmentPriority,
  ParticipantRole,
} from './appointment.types';

export type {
  Appointment,
  AppointmentParticipant,
  RecurrenceRule,
  AppointmentNote,
  BookingMetadata,
  CancellationDetails,
  ConfirmationDetails,
  CheckInDetails,
  CompletionDetails,
  ResourceAllocation,
  AppointmentStatusTransition,
  AppointmentSummary,
  AppointmentFilter,
} from './appointment.types';

// ============================================================================
// Provider Schedule Types
// ============================================================================
export {
  DayOfWeek,
  TimeSlotType,
  AbsenceType,
  AbsenceStatus,
  ScheduleRecurrence,
} from './provider-schedule.types';

export type {
  TimeOfDay,
  TimeSlot,
  DailyWorkingHours,
  WorkPeriod,
  WeeklyHours,
  ScheduleException,
  ProviderAbsence,
  ProviderSchedule,
  AvailabilitySearchCriteria,
  AvailableSlot,
  AvailabilitySummary,
  BulkScheduleUpdate,
} from './provider-schedule.types';

// ============================================================================
// Booking Rules Types
// ============================================================================
export {
  BookingRuleType,
  BookingRuleScope,
  ConflictResolutionStrategy,
  WaitlistStatus,
  ConstraintType,
} from './booking-rules.types';

export type {
  TimeSlotConstraint,
  BookingRuleCondition,
  BookingRuleAction,
  BookingRule,
  ConflictDetectionResult,
  SchedulingConflict,
  ConflictResolution,
  WaitlistEntry,
  BookingPolicy,
  BookingValidationResult,
  OverbookingConfig,
  BookingCapacity,
} from './booking-rules.types';
