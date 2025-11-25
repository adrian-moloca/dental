/**
 * Provider Schedule Domain Types
 *
 * Types for managing provider availability, schedules, absences, and time slots.
 * Supports recurring schedules, exceptions, and multi-location scheduling.
 *
 * @module shared-domain/scheduling
 */

import type {
  UUID,
  ISODateString,
  OrganizationId,
  ClinicId,
  Nullable,
  Metadata,
} from '@dentalos/shared-types';

/**
 * Day of week enumeration
 * 0 = Sunday, 6 = Saturday (matches JavaScript Date.getDay())
 */
export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

/**
 * Time slot type
 * Categorizes different types of time slots
 */
export enum TimeSlotType {
  /** Regular availability for appointments */
  AVAILABLE = 'AVAILABLE',
  /** Break time (lunch, coffee break) */
  BREAK = 'BREAK',
  /** Blocked time (not available for appointments) */
  BLOCKED = 'BLOCKED',
  /** Reserved for emergencies only */
  EMERGENCY = 'EMERGENCY',
  /** Buffer time between appointments */
  BUFFER = 'BUFFER',
  /** Administrative time (meetings, paperwork) */
  ADMINISTRATIVE = 'ADMINISTRATIVE',
}

/**
 * Absence type
 * Categorizes different types of provider absences
 */
export enum AbsenceType {
  /** Vacation or paid time off */
  VACATION = 'VACATION',
  /** Sick leave */
  SICK_LEAVE = 'SICK_LEAVE',
  /** Conference or continuing education */
  CONFERENCE = 'CONFERENCE',
  /** Personal day */
  PERSONAL = 'PERSONAL',
  /** Bereavement leave */
  BEREAVEMENT = 'BEREAVEMENT',
  /** Maternity/paternity leave */
  PARENTAL_LEAVE = 'PARENTAL_LEAVE',
  /** Sabbatical */
  SABBATICAL = 'SABBATICAL',
  /** Other absence type */
  OTHER = 'OTHER',
}

/**
 * Absence status
 * Tracks the approval workflow for absences
 */
export enum AbsenceStatus {
  /** Absence request submitted, pending approval */
  PENDING = 'PENDING',
  /** Absence approved */
  APPROVED = 'APPROVED',
  /** Absence rejected */
  REJECTED = 'REJECTED',
  /** Absence cancelled by requestor */
  CANCELLED = 'CANCELLED',
}

/**
 * Schedule recurrence pattern
 * Defines how a schedule pattern repeats
 */
export enum ScheduleRecurrence {
  /** No recurrence - one-time schedule */
  NONE = 'NONE',
  /** Repeats daily */
  DAILY = 'DAILY',
  /** Repeats weekly */
  WEEKLY = 'WEEKLY',
  /** Repeats monthly */
  MONTHLY = 'MONTHLY',
  /** Custom recurrence pattern */
  CUSTOM = 'CUSTOM',
}

/**
 * Time of day representation
 * 24-hour format time
 */
export interface TimeOfDay {
  /** Hour (0-23) */
  hour: number;
  /** Minute (0-59) */
  minute: number;
}

/**
 * Time slot
 * Represents a contiguous block of time with a specific type
 */
export interface TimeSlot {
  /** Unique time slot identifier */
  id: UUID;
  /** Start time */
  startTime: ISODateString;
  /** End time */
  endTime: ISODateString;
  /** Type of time slot */
  slotType: TimeSlotType;
  /** Whether this slot is available for booking */
  isAvailable: boolean;
  /** Reason for unavailability or special notes */
  reason?: string;
  /** Duration in minutes (computed) */
  duration: number;
}

/**
 * Daily working hours
 * Defines working hours for a single day
 */
export interface DailyWorkingHours {
  /** Day of the week */
  dayOfWeek: DayOfWeek;
  /** Whether the provider works on this day */
  isWorkingDay: boolean;
  /** Work periods for this day (multiple periods support lunch breaks, etc.) */
  workPeriods: WorkPeriod[];
  /** Notes for this day */
  notes?: string;
}

/**
 * Work period
 * A continuous period of work time within a day
 */
export interface WorkPeriod {
  /** Start time of day */
  startTime: TimeOfDay;
  /** End time of day */
  endTime: TimeOfDay;
  /** Location/clinic for this period */
  clinicId?: ClinicId;
  /** Room or operatory */
  room?: string;
}

/**
 * Weekly hours template
 * Standard weekly schedule template for a provider
 */
export interface WeeklyHours {
  /** Unique template identifier */
  id: UUID;
  /** Organization ID */
  organizationId: OrganizationId;
  /** Provider ID */
  providerId: UUID;
  /** Template name */
  name: string;
  /** Template description */
  description?: string;
  /** Daily schedules (7 days) */
  dailySchedules: DailyWorkingHours[];
  /** Whether this is the default template */
  isDefault: boolean;
  /** Effective start date */
  effectiveFrom: ISODateString;
  /** Effective end date (null if indefinite) */
  effectiveTo: Nullable<ISODateString>;
  /** Time zone for this schedule */
  timeZone: string;
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** Version for optimistic locking */
  version: number;
  /** Custom metadata */
  metadata?: Metadata;
}

/**
 * Schedule exception
 * Override or exception to the regular weekly schedule
 */
export interface ScheduleException {
  /** Unique exception identifier */
  id: UUID;
  /** Provider ID */
  providerId: UUID;
  /** Organization ID */
  organizationId: OrganizationId;
  /** Clinic ID (if specific to a clinic) */
  clinicId?: ClinicId;
  /** Exception type */
  exceptionType: 'OVERRIDE' | 'ADDITION' | 'CANCELLATION';
  /** Date of the exception */
  exceptionDate: ISODateString;
  /** Replacement schedule for this date (if override/addition) */
  schedule?: DailyWorkingHours;
  /** Reason for exception */
  reason?: string;
  /** Whether appointments should be cancelled/rescheduled */
  cancelAppointments: boolean;
  /** Creation timestamp */
  createdAt: ISODateString;
  /** User who created the exception */
  createdBy: UUID;
  /** Custom metadata */
  metadata?: Metadata;
}

/**
 * Provider absence
 * Planned absence of a provider (vacation, sick leave, etc.)
 */
export interface ProviderAbsence {
  /** Unique absence identifier */
  id: UUID;
  /** Provider ID */
  providerId: UUID;
  /** Organization ID */
  organizationId: OrganizationId;
  /** Absence type */
  absenceType: AbsenceType;
  /** Absence status */
  status: AbsenceStatus;
  /** Start date/time of absence */
  startDate: ISODateString;
  /** End date/time of absence */
  endDate: ISODateString;
  /** Whether this is all-day absence */
  isAllDay: boolean;
  /** Reason or notes */
  reason?: string;
  /** Supporting documentation (file IDs) */
  documentIds?: UUID[];
  /** User who requested the absence */
  requestedBy: UUID;
  /** Timestamp of request */
  requestedAt: ISODateString;
  /** User who approved/rejected the absence */
  reviewedBy?: UUID;
  /** Timestamp of approval/rejection */
  reviewedAt?: ISODateString;
  /** Review notes */
  reviewNotes?: string;
  /** Whether to cancel existing appointments */
  cancelAppointments: boolean;
  /** IDs of appointments affected */
  affectedAppointmentIds?: UUID[];
  /** Covering provider (if applicable) */
  coveringProviderId?: UUID;
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** Version for optimistic locking */
  version: number;
  /** Custom metadata */
  metadata?: Metadata;
}

/**
 * Provider schedule
 * Complete schedule information for a provider
 */
export interface ProviderSchedule {
  /** Unique schedule identifier */
  id: UUID;
  /** Provider ID */
  providerId: UUID;
  /** Organization ID */
  organizationId: OrganizationId;
  /** Default weekly schedule template */
  defaultWeeklyHours: WeeklyHours;
  /** Alternative weekly templates (e.g., summer hours) */
  alternateWeeklyHours?: WeeklyHours[];
  /** Schedule exceptions */
  exceptions: ScheduleException[];
  /** Planned absences */
  absences: ProviderAbsence[];
  /** Clinics where provider works */
  clinicIds: ClinicId[];
  /** Default appointment duration (minutes) */
  defaultAppointmentDuration: number;
  /** Minimum appointment duration (minutes) */
  minAppointmentDuration: number;
  /** Maximum appointment duration (minutes) */
  maxAppointmentDuration: number;
  /** Buffer time between appointments (minutes) */
  bufferTime: number;
  /** Maximum appointments per day */
  maxAppointmentsPerDay?: number;
  /** Whether provider accepts online bookings */
  acceptsOnlineBooking: boolean;
  /** Booking window (days in advance) */
  bookingWindowDays?: number;
  /** Cancellation policy (hours in advance) */
  cancellationPolicyHours?: number;
  /** Whether schedule is active */
  isActive: boolean;
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** Version for optimistic locking */
  version: number;
  /** Custom metadata */
  metadata?: Metadata;
}

/**
 * Available time slot search criteria
 * Used to find available appointment slots
 */
export interface AvailabilitySearchCriteria {
  /** Provider ID */
  providerId: UUID;
  /** Organization ID */
  organizationId: OrganizationId;
  /** Clinic ID (if specific to a clinic) */
  clinicId?: ClinicId;
  /** Search start date */
  startDate: ISODateString;
  /** Search end date */
  endDate: ISODateString;
  /** Desired appointment duration (minutes) */
  duration: number;
  /** Specific days of week (if any) */
  daysOfWeek?: DayOfWeek[];
  /** Preferred time range start (time of day) */
  preferredTimeStart?: TimeOfDay;
  /** Preferred time range end (time of day) */
  preferredTimeEnd?: TimeOfDay;
  /** Appointment type */
  appointmentType?: string;
  /** Maximum number of slots to return */
  limit?: number;
}

/**
 * Available slot
 * Represents an available time slot for booking
 */
export interface AvailableSlot {
  /** Provider ID */
  providerId: UUID;
  /** Clinic ID */
  clinicId: ClinicId;
  /** Start time */
  startTime: ISODateString;
  /** End time */
  endTime: ISODateString;
  /** Duration in minutes */
  duration: number;
  /** Room/operatory */
  room?: string;
  /** Confidence score (0-1) for optimal booking */
  confidenceScore: number;
}

/**
 * Availability summary
 * High-level summary of provider availability
 */
export interface AvailabilitySummary {
  /** Provider ID */
  providerId: UUID;
  /** Date of summary */
  date: ISODateString;
  /** Total working hours (minutes) */
  totalWorkingHours: number;
  /** Total booked hours (minutes) */
  totalBookedHours: number;
  /** Total available hours (minutes) */
  totalAvailableHours: number;
  /** Number of appointments scheduled */
  appointmentCount: number;
  /** Number of available slots */
  availableSlotCount: number;
  /** Utilization percentage (0-100) */
  utilizationPercentage: number;
}

/**
 * Bulk schedule update
 * For updating multiple schedule entries at once
 */
export interface BulkScheduleUpdate {
  /** Provider ID */
  providerId: UUID;
  /** Organization ID */
  organizationId: OrganizationId;
  /** Start date of update range */
  startDate: ISODateString;
  /** End date of update range */
  endDate: ISODateString;
  /** Schedule template to apply */
  weeklyHoursTemplate: WeeklyHours;
  /** Whether to preserve existing appointments */
  preserveAppointments: boolean;
  /** User performing the update */
  updatedBy: UUID;
}
