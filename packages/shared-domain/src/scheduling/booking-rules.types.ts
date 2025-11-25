/**
 * Booking Rules Domain Types
 *
 * Types for appointment booking rules, conflict resolution, and waitlist management.
 * Defines constraints, policies, and business rules for scheduling.
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
import type { AppointmentPriority } from './appointment.types';
import type { DayOfWeek } from './provider-schedule.types';

/**
 * Booking rule type
 * Categorizes different types of booking rules
 */
export enum BookingRuleType {
  /** Minimum advance booking time */
  MIN_ADVANCE_TIME = 'MIN_ADVANCE_TIME',
  /** Maximum advance booking time */
  MAX_ADVANCE_TIME = 'MAX_ADVANCE_TIME',
  /** Maximum appointments per patient per period */
  MAX_APPOINTMENTS_PER_PATIENT = 'MAX_APPOINTMENTS_PER_PATIENT',
  /** Maximum appointments per day for provider */
  MAX_APPOINTMENTS_PER_DAY = 'MAX_APPOINTMENTS_PER_DAY',
  /** Required gap between appointments */
  REQUIRED_GAP = 'REQUIRED_GAP',
  /** Blackout dates */
  BLACKOUT_DATES = 'BLACKOUT_DATES',
  /** Allowed appointment types */
  ALLOWED_APPOINTMENT_TYPES = 'ALLOWED_APPOINTMENT_TYPES',
  /** Time slot constraints */
  TIME_SLOT_CONSTRAINTS = 'TIME_SLOT_CONSTRAINTS',
  /** Custom rule */
  CUSTOM = 'CUSTOM',
}

/**
 * Booking rule scope
 * Defines at what level the rule applies
 */
export enum BookingRuleScope {
  /** Applies to entire organization */
  ORGANIZATION = 'ORGANIZATION',
  /** Applies to specific clinic */
  CLINIC = 'CLINIC',
  /** Applies to specific provider */
  PROVIDER = 'PROVIDER',
  /** Applies to specific appointment type */
  APPOINTMENT_TYPE = 'APPOINTMENT_TYPE',
  /** Applies to specific patient segment */
  PATIENT_SEGMENT = 'PATIENT_SEGMENT',
}

/**
 * Conflict resolution strategy
 * How to handle scheduling conflicts
 */
export enum ConflictResolutionStrategy {
  /** Reject the new appointment */
  REJECT = 'REJECT',
  /** Allow overlap (overbooking) */
  ALLOW_OVERLAP = 'ALLOW_OVERLAP',
  /** Automatically reschedule existing appointment */
  AUTO_RESCHEDULE = 'AUTO_RESCHEDULE',
  /** Place in waitlist */
  WAITLIST = 'WAITLIST',
  /** Require manual review */
  MANUAL_REVIEW = 'MANUAL_REVIEW',
  /** Use priority-based resolution */
  PRIORITY_BASED = 'PRIORITY_BASED',
}

/**
 * Waitlist status
 * Status of a waitlist entry
 */
export enum WaitlistStatus {
  /** Active on waitlist */
  ACTIVE = 'ACTIVE',
  /** Patient was contacted */
  CONTACTED = 'CONTACTED',
  /** Appointment booked from waitlist */
  BOOKED = 'BOOKED',
  /** Patient declined offer */
  DECLINED = 'DECLINED',
  /** Expired without booking */
  EXPIRED = 'EXPIRED',
  /** Patient cancelled waitlist request */
  CANCELLED = 'CANCELLED',
}

/**
 * Booking constraint type
 * Types of constraints that can be applied
 */
export enum ConstraintType {
  /** Time-based constraint */
  TIME = 'TIME',
  /** Date-based constraint */
  DATE = 'DATE',
  /** Resource-based constraint */
  RESOURCE = 'RESOURCE',
  /** Capacity-based constraint */
  CAPACITY = 'CAPACITY',
  /** Policy-based constraint */
  POLICY = 'POLICY',
  /** Business rule constraint */
  BUSINESS_RULE = 'BUSINESS_RULE',
}

/**
 * Time slot constraint
 * Constraints on when appointments can be scheduled
 */
export interface TimeSlotConstraint {
  /** Days of week allowed */
  allowedDaysOfWeek?: DayOfWeek[];
  /** Earliest time of day allowed */
  earliestTime?: { hour: number; minute: number };
  /** Latest time of day allowed */
  latestTime?: { hour: number; minute: number };
  /** Allowed time slots (explicit whitelist) */
  allowedSlots?: Array<{ start: string; end: string }>;
  /** Blackout time slots */
  blackoutSlots?: Array<{ start: string; end: string }>;
}

/**
 * Booking rule condition
 * Condition that must be met for a rule to apply
 */
export interface BookingRuleCondition {
  /** Field to evaluate */
  field: string;
  /** Operator for evaluation */
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'NOT_IN' | 'CONTAINS' | 'MATCHES';
  /** Value to compare against */
  value: unknown;
}

/**
 * Booking rule action
 * Action to take when rule is triggered
 */
export interface BookingRuleAction {
  /** Action type */
  type: 'BLOCK' | 'ALLOW' | 'WARN' | 'MODIFY' | 'NOTIFY';
  /** Action message */
  message?: string;
  /** Modifications to apply (if type is MODIFY) */
  modifications?: Record<string, unknown>;
  /** Notification recipients (if type is NOTIFY) */
  notificationRecipients?: UUID[];
}

/**
 * Booking rule
 * Complete booking rule definition
 */
export interface BookingRule {
  /** Unique rule identifier */
  id: UUID;
  /** Organization ID */
  organizationId: OrganizationId;
  /** Clinic ID (if clinic-specific) */
  clinicId?: ClinicId;
  /** Provider ID (if provider-specific) */
  providerId?: UUID;
  /** Rule type */
  ruleType: BookingRuleType;
  /** Rule scope */
  scope: BookingRuleScope;
  /** Rule name */
  name: string;
  /** Rule description */
  description?: string;
  /** Whether rule is active */
  isActive: boolean;
  /** Priority (higher number = higher priority) */
  priority: number;
  /** Conditions that must be met */
  conditions: BookingRuleCondition[];
  /** Actions to take when rule applies */
  actions: BookingRuleAction[];
  /** Time slot constraints */
  timeSlotConstraints?: TimeSlotConstraint;
  /** Minimum advance booking hours */
  minAdvanceHours?: number;
  /** Maximum advance booking days */
  maxAdvanceDays?: number;
  /** Required gap between appointments (minutes) */
  requiredGapMinutes?: number;
  /** Maximum appointments in period */
  maxAppointmentsInPeriod?: number;
  /** Period for max appointments (days) */
  periodDays?: number;
  /** Allowed appointment types */
  allowedAppointmentTypes?: string[];
  /** Blackout date ranges */
  blackoutDates?: Array<{ start: ISODateString; end: ISODateString }>;
  /** Effective start date */
  effectiveFrom: ISODateString;
  /** Effective end date */
  effectiveTo?: Nullable<ISODateString>;
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** User who created the rule */
  createdBy: UUID;
  /** User who last updated the rule */
  updatedBy: UUID;
  /** Version for optimistic locking */
  version: number;
  /** Custom metadata */
  metadata?: Metadata;
}

/**
 * Conflict detection result
 * Result of checking for scheduling conflicts
 */
export interface ConflictDetectionResult {
  /** Whether conflicts exist */
  hasConflicts: boolean;
  /** List of conflicts found */
  conflicts: SchedulingConflict[];
  /** Suggested resolutions */
  suggestedResolutions: ConflictResolution[];
  /** Whether booking can proceed despite conflicts */
  canProceed: boolean;
  /** Warning messages */
  warnings: string[];
  /** Error messages */
  errors: string[];
}

/**
 * Scheduling conflict
 * Represents a detected scheduling conflict
 */
export interface SchedulingConflict {
  /** Conflict type */
  conflictType: 'DOUBLE_BOOKING' | 'RESOURCE_CONFLICT' | 'RULE_VIOLATION' | 'CAPACITY_EXCEEDED' | 'PROVIDER_UNAVAILABLE' | 'OTHER';
  /** Conflict severity */
  severity: 'ERROR' | 'WARNING' | 'INFO';
  /** Conflict message */
  message: string;
  /** Conflicting appointment ID (if applicable) */
  conflictingAppointmentId?: UUID;
  /** Conflicting resource ID (if applicable) */
  conflictingResourceId?: UUID;
  /** Rule that was violated (if applicable) */
  violatedRuleId?: UUID;
  /** Suggested action */
  suggestedAction?: string;
  /** Additional context */
  context?: Record<string, unknown>;
}

/**
 * Conflict resolution
 * Proposed resolution for a scheduling conflict
 */
export interface ConflictResolution {
  /** Resolution ID */
  id: UUID;
  /** Conflict this resolution addresses */
  conflictId: UUID;
  /** Resolution strategy */
  strategy: ConflictResolutionStrategy;
  /** Description of the resolution */
  description: string;
  /** Whether this resolution requires approval */
  requiresApproval: boolean;
  /** Whether this is the recommended resolution */
  isRecommended: boolean;
  /** Confidence score (0-1) */
  confidenceScore: number;
  /** Alternative time slots (if rescheduling) */
  alternativeSlots?: Array<{
    startTime: ISODateString;
    endTime: ISODateString;
    providerId: UUID;
    clinicId: ClinicId;
  }>;
  /** Estimated impact */
  impact?: {
    affectedAppointments: number;
    affectedPatients: number;
    estimatedDelay: number; // minutes
  };
  /** Actions required to implement */
  requiredActions: Array<{
    actionType: string;
    description: string;
    automatable: boolean;
  }>;
}

/**
 * Waitlist entry
 * Entry in the appointment waitlist
 */
export interface WaitlistEntry {
  /** Unique waitlist entry ID */
  id: UUID;
  /** Organization ID */
  organizationId: OrganizationId;
  /** Clinic ID */
  clinicId: ClinicId;
  /** Patient ID */
  patientId: UUID;
  /** Desired provider ID */
  providerId?: UUID;
  /** Appointment type */
  appointmentType: string;
  /** Desired duration (minutes) */
  desiredDuration: number;
  /** Priority level */
  priority: AppointmentPriority;
  /** Preferred date range start */
  preferredDateStart?: ISODateString;
  /** Preferred date range end */
  preferredDateEnd?: ISODateString;
  /** Preferred days of week */
  preferredDaysOfWeek?: DayOfWeek[];
  /** Preferred time of day (morning, afternoon, evening) */
  preferredTimeOfDay?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ANY';
  /** Flexibility score (0-100, higher = more flexible) */
  flexibilityScore: number;
  /** Current status */
  status: WaitlistStatus;
  /** Reason for waitlist */
  reason?: string;
  /** Patient notes */
  notes?: string;
  /** Number of contact attempts */
  contactAttempts: number;
  /** Last contact timestamp */
  lastContactedAt?: ISODateString;
  /** Expiration date */
  expiresAt?: ISODateString;
  /** Booked appointment ID (if booked) */
  bookedAppointmentId?: UUID;
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** User who created the entry */
  createdBy: UUID;
  /** Version for optimistic locking */
  version: number;
  /** Custom metadata */
  metadata?: Metadata;
}

/**
 * Booking policy
 * High-level booking policy for an organization or clinic
 */
export interface BookingPolicy {
  /** Unique policy identifier */
  id: UUID;
  /** Organization ID */
  organizationId: OrganizationId;
  /** Clinic ID (if clinic-specific) */
  clinicId?: ClinicId;
  /** Policy name */
  name: string;
  /** Policy description */
  description?: string;
  /** Whether online booking is allowed */
  allowOnlineBooking: boolean;
  /** Booking window (days in advance) */
  bookingWindowDays: number;
  /** Minimum advance notice (hours) */
  minAdvanceNoticeHours: number;
  /** Maximum advance booking (days) */
  maxAdvanceBookingDays: number;
  /** Cancellation notice period (hours) */
  cancellationNoticePeriodHours: number;
  /** Whether to charge cancellation fee */
  chargeCancellationFee: boolean;
  /** Cancellation fee amount */
  cancellationFeeAmount?: number;
  /** Cancellation fee currency */
  cancellationFeeCurrency?: string;
  /** Whether to allow rescheduling */
  allowRescheduling: boolean;
  /** Reschedule notice period (hours) */
  rescheduleNoticePeriodHours?: number;
  /** Maximum reschedules per appointment */
  maxReschedulesPerAppointment?: number;
  /** Whether to allow same-day appointments */
  allowSameDayAppointments: boolean;
  /** Whether to require appointment confirmation */
  requireConfirmation: boolean;
  /** Confirmation deadline (hours before appointment) */
  confirmationDeadlineHours?: number;
  /** Default conflict resolution strategy */
  defaultConflictResolution: ConflictResolutionStrategy;
  /** Whether to enable waitlist */
  enableWaitlist: boolean;
  /** Waitlist expiration (days) */
  waitlistExpirationDays?: number;
  /** Maximum waitlist entries per patient */
  maxWaitlistEntriesPerPatient?: number;
  /** Whether policy is active */
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
 * Booking validation result
 * Result of validating a booking request
 */
export interface BookingValidationResult {
  /** Whether booking is valid */
  isValid: boolean;
  /** Validation errors */
  errors: Array<{
    code: string;
    message: string;
    field?: string;
    severity: 'ERROR' | 'WARNING';
  }>;
  /** Rules that were violated */
  violatedRules: UUID[];
  /** Conflicts detected */
  conflicts: SchedulingConflict[];
  /** Whether booking can proceed with warnings */
  canProceedWithWarnings: boolean;
  /** Suggested corrections */
  suggestions: string[];
}

/**
 * Overbooking configuration
 * Configuration for allowing controlled overbooking
 */
export interface OverbookingConfig {
  /** Whether overbooking is allowed */
  allowOverbooking: boolean;
  /** Maximum overbooking percentage (0-100) */
  maxOverbookingPercentage: number;
  /** Overbooking buffer time (minutes) */
  overbookingBufferMinutes: number;
  /** Specific time slots allowing overbooking */
  allowedTimeSlots?: Array<{
    dayOfWeek: DayOfWeek;
    startTime: { hour: number; minute: number };
    endTime: { hour: number; minute: number };
  }>;
  /** Appointment types that can be overbooked */
  allowedAppointmentTypes?: string[];
  /** Require approval for overbooking */
  requireApproval: boolean;
}

/**
 * Booking capacity
 * Current and maximum capacity for a time period
 */
export interface BookingCapacity {
  /** Provider ID */
  providerId: UUID;
  /** Clinic ID */
  clinicId: ClinicId;
  /** Date */
  date: ISODateString;
  /** Maximum appointments */
  maxAppointments: number;
  /** Current appointments scheduled */
  currentAppointments: number;
  /** Available capacity */
  availableCapacity: number;
  /** Utilization percentage */
  utilizationPercentage: number;
  /** Whether at capacity */
  isAtCapacity: boolean;
  /** Whether overbooking is possible */
  canOverbook: boolean;
}
