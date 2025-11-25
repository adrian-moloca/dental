/**
 * Appointment Domain Types
 *
 * Core domain types for appointment scheduling in the dental practice management system.
 * Defines appointment entities, status lifecycle, and booking metadata.
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
 * Appointment status enumeration
 * Represents the complete lifecycle of an appointment from scheduling to completion
 */
export enum AppointmentStatus {
  /** Appointment has been scheduled but not yet confirmed */
  SCHEDULED = 'SCHEDULED',
  /** Patient has confirmed the appointment */
  CONFIRMED = 'CONFIRMED',
  /** Patient has checked in at the clinic */
  CHECKED_IN = 'CHECKED_IN',
  /** Appointment is currently in progress */
  IN_PROGRESS = 'IN_PROGRESS',
  /** Appointment has been completed successfully */
  COMPLETED = 'COMPLETED',
  /** Appointment has been cancelled */
  CANCELLED = 'CANCELLED',
  /** Patient did not show up for the appointment */
  NO_SHOW = 'NO_SHOW',
  /** Appointment has been rescheduled to a new time */
  RESCHEDULED = 'RESCHEDULED',
}

/**
 * Appointment cancellation type
 * Indicates who initiated the cancellation
 */
export enum CancellationType {
  /** Cancelled by the patient */
  PATIENT = 'PATIENT',
  /** Cancelled by the provider or clinic staff */
  PROVIDER = 'PROVIDER',
  /** Automatically cancelled by the system (e.g., due to policy violations) */
  SYSTEM = 'SYSTEM',
  /** Marked as no-show after grace period */
  NO_SHOW = 'NO_SHOW',
}

/**
 * Appointment priority level
 * Used to prioritize scheduling and resource allocation
 */
export enum AppointmentPriority {
  /** Low priority - routine appointment */
  LOW = 'LOW',
  /** Medium priority - standard appointment */
  MEDIUM = 'MEDIUM',
  /** High priority - needs attention */
  HIGH = 'HIGH',
  /** Urgent - emergency appointment */
  URGENT = 'URGENT',
}

/**
 * Participant role in an appointment
 * Defines the role of each participant (provider, assistant, etc.)
 */
export enum ParticipantRole {
  /** Primary provider performing the treatment */
  PROVIDER = 'PROVIDER',
  /** Dental assistant supporting the provider */
  ASSISTANT = 'ASSISTANT',
  /** Dental hygienist */
  HYGIENIST = 'HYGIENIST',
  /** Specialist consultant */
  SPECIALIST = 'SPECIALIST',
  /** Other role */
  OTHER = 'OTHER',
}

/**
 * Appointment participant
 * Represents a staff member participating in the appointment
 */
export interface AppointmentParticipant {
  /** User ID of the participant */
  userId: UUID;
  /** Role of the participant in this appointment */
  role: ParticipantRole;
  /** Whether this participant is required for the appointment */
  required: boolean;
  /** Display name of the participant (for convenience) */
  displayName?: string;
}

/**
 * Appointment recurrence rule
 * Defines how an appointment repeats
 */
export interface RecurrenceRule {
  /** Recurrence pattern (daily, weekly, etc.) */
  pattern: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
  /** Interval between occurrences (e.g., every 2 weeks) */
  interval: number;
  /** Specific days of the week (for weekly/biweekly patterns) */
  daysOfWeek?: number[];
  /** End date for the recurrence */
  endDate?: ISODateString;
  /** Maximum number of occurrences */
  occurrences?: number;
}

/**
 * Appointment note
 * Internal or patient-visible notes attached to an appointment
 */
export interface AppointmentNote {
  /** Unique note identifier */
  id: UUID;
  /** Note content */
  content: string;
  /** User who created the note */
  createdBy: UUID;
  /** Timestamp when note was created */
  createdAt: ISODateString;
  /** Whether the note is private (visible only to staff) */
  isPrivate: boolean;
}

/**
 * Booking metadata
 * Additional contextual information about how the appointment was booked
 */
export interface BookingMetadata {
  /** Source of the booking (online portal, phone, walk-in, etc.) */
  bookingSource: 'ONLINE_PORTAL' | 'PHONE' | 'WALK_IN' | 'ADMIN' | 'INTEGRATION' | 'OTHER';
  /** IP address of the booking request (if online) */
  ipAddress?: string;
  /** User agent of the booking request (if online) */
  userAgent?: string;
  /** Referring URL or source identifier */
  referrer?: string;
  /** ID of the user who created the booking (may differ from patient) */
  bookedBy: UUID;
  /** Timestamp when booking was created */
  bookedAt: ISODateString;
  /** Confirmation token for online bookings */
  confirmationToken?: string;
  /** Whether the booking requires approval */
  requiresApproval: boolean;
  /** Approval status if required */
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  /** User who approved/rejected (if applicable) */
  approvedBy?: UUID;
  /** Timestamp of approval/rejection */
  approvedAt?: ISODateString;
  /** Notes about approval decision */
  approvalNotes?: string;
}

/**
 * Appointment cancellation details
 * Detailed information about why and how an appointment was cancelled
 */
export interface CancellationDetails {
  /** Type of cancellation */
  cancellationType: CancellationType;
  /** Reason for cancellation */
  reason?: string;
  /** User who cancelled the appointment */
  cancelledBy: UUID;
  /** Timestamp when appointment was cancelled */
  cancelledAt: ISODateString;
  /** Whether the cancellation fee was charged */
  feeCharged: boolean;
  /** Amount of cancellation fee (if applicable) */
  feeAmount?: number;
  /** Currency of the fee */
  feeCurrency?: string;
  /** Whether the cancellation was within policy limits */
  withinPolicy: boolean;
  /** Notification sent to patient */
  notificationSent: boolean;
}

/**
 * Appointment confirmation details
 * Information about appointment confirmation
 */
export interface ConfirmationDetails {
  /** Timestamp when appointment was confirmed */
  confirmedAt: ISODateString;
  /** User who confirmed the appointment */
  confirmedBy: UUID;
  /** Method used to confirm (email, phone, SMS, in-person) */
  confirmationMethod: 'EMAIL' | 'PHONE' | 'SMS' | 'IN_PERSON' | 'ONLINE_PORTAL';
  /** Confirmation code or token */
  confirmationCode?: string;
  /** Whether reminder was sent */
  reminderSent: boolean;
  /** Timestamp of last reminder */
  lastReminderAt?: ISODateString;
}

/**
 * Appointment check-in details
 * Information captured when patient checks in
 */
export interface CheckInDetails {
  /** Timestamp when patient checked in */
  checkedInAt: ISODateString;
  /** User who performed the check-in */
  checkedInBy: UUID;
  /** Check-in method (kiosk, front desk, mobile app) */
  checkInMethod: 'KIOSK' | 'FRONT_DESK' | 'MOBILE_APP' | 'OTHER';
  /** Whether patient arrived on time */
  arrivedOnTime: boolean;
  /** Minutes early (negative) or late (positive) */
  minutesOffset?: number;
  /** Any notes from check-in */
  notes?: string;
}

/**
 * Appointment completion details
 * Information captured when appointment is completed
 */
export interface CompletionDetails {
  /** Timestamp when appointment was marked complete */
  completedAt: ISODateString;
  /** User who marked the appointment complete */
  completedBy: UUID;
  /** Actual duration in minutes (may differ from scheduled) */
  actualDuration: number;
  /** Whether treatment was completed as planned */
  treatmentCompleted: boolean;
  /** Outcome notes */
  outcomeNotes?: string;
  /** Whether follow-up is required */
  followUpRequired: boolean;
  /** Suggested follow-up date */
  followUpDate?: ISODateString;
}

/**
 * Appointment resource allocation
 * Resources (rooms, equipment) allocated for the appointment
 */
export interface ResourceAllocation {
  /** Room or operatory number/identifier */
  room?: string;
  /** Equipment IDs allocated */
  equipmentIds?: UUID[];
  /** Special requirements or notes */
  specialRequirements?: string;
}

/**
 * Core Appointment interface
 * Complete appointment entity with all lifecycle tracking
 */
export interface Appointment {
  /** Unique appointment identifier */
  id: UUID;

  // Tenant context
  /** Organization ID */
  organizationId: OrganizationId;
  /** Clinic ID */
  clinicId: ClinicId;

  // Core appointment data
  /** Patient ID */
  patientId: UUID;
  /** Primary provider ID */
  providerId: UUID;
  /** Appointment title */
  title: string;
  /** Detailed description of the appointment */
  description?: string;
  /** Current status */
  status: AppointmentStatus;
  /** Priority level */
  priority: AppointmentPriority;

  // Scheduling
  /** Scheduled start time */
  startTime: ISODateString;
  /** Scheduled end time */
  endTime: ISODateString;
  /** Duration in minutes */
  duration: number;
  /** Type/category of appointment (e.g., "Cleaning", "Root Canal") */
  appointmentType: string;
  /** Type code for system categorization */
  appointmentTypeCode?: string;

  // Participants and resources
  /** Additional participants (assistants, hygienists, etc.) */
  participants: AppointmentParticipant[];
  /** Resource allocation */
  resources?: ResourceAllocation;

  // Notes and metadata
  /** Appointment notes */
  notes: AppointmentNote[];
  /** Booking metadata */
  bookingMetadata?: BookingMetadata;

  // Recurrence
  /** Recurrence rule (if recurring) */
  recurrenceRule?: RecurrenceRule;
  /** Parent appointment ID (for recurring appointments) */
  parentAppointmentId?: UUID;
  /** Series ID linking all occurrences */
  seriesId?: UUID;

  // Lifecycle tracking
  /** Confirmation details */
  confirmation?: ConfirmationDetails;
  /** Check-in details */
  checkIn?: CheckInDetails;
  /** Cancellation details */
  cancellation?: CancellationDetails;
  /** Completion details */
  completion?: CompletionDetails;

  // Audit fields
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** Soft deletion timestamp */
  deletedAt: Nullable<ISODateString>;
  /** User who created the appointment */
  createdBy: UUID;
  /** User who last updated the appointment */
  updatedBy: UUID;
  /** User who deleted the appointment */
  deletedBy?: Nullable<UUID>;
  /** Version for optimistic locking */
  version: number;

  // Extensibility
  /** Custom metadata for extensibility */
  metadata?: Metadata;
}

/**
 * Appointment status transition
 * Valid state transitions for appointment status
 */
export interface AppointmentStatusTransition {
  /** Current status */
  fromStatus: AppointmentStatus;
  /** New status */
  toStatus: AppointmentStatus;
  /** Reason for transition */
  reason?: string;
  /** Timestamp of transition */
  transitionedAt: ISODateString;
  /** User who performed the transition */
  transitionedBy: UUID;
}

/**
 * Appointment summary
 * Lightweight appointment representation for lists and calendars
 */
export interface AppointmentSummary {
  /** Appointment ID */
  id: UUID;
  /** Patient ID */
  patientId: UUID;
  /** Patient name (for display) */
  patientName: string;
  /** Provider ID */
  providerId: UUID;
  /** Provider name (for display) */
  providerName: string;
  /** Appointment type */
  appointmentType: string;
  /** Status */
  status: AppointmentStatus;
  /** Priority */
  priority: AppointmentPriority;
  /** Start time */
  startTime: ISODateString;
  /** End time */
  endTime: ISODateString;
  /** Duration in minutes */
  duration: number;
  /** Room/operatory */
  room?: string;
  /** Clinic ID */
  clinicId: ClinicId;
}

/**
 * Appointment filter criteria
 * Used for querying and filtering appointments
 */
export interface AppointmentFilter {
  /** Filter by organization */
  organizationId?: OrganizationId;
  /** Filter by clinic */
  clinicId?: ClinicId;
  /** Filter by patient */
  patientId?: UUID;
  /** Filter by provider */
  providerId?: UUID;
  /** Filter by status */
  status?: AppointmentStatus | AppointmentStatus[];
  /** Filter by priority */
  priority?: AppointmentPriority | AppointmentPriority[];
  /** Filter by appointment type */
  appointmentType?: string | string[];
  /** Start date range */
  startDateFrom?: ISODateString;
  /** End date range */
  startDateTo?: ISODateString;
  /** Include cancelled appointments */
  includeCancelled?: boolean;
  /** Include deleted appointments */
  includeDeleted?: boolean;
}
