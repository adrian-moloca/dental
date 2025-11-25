import type { UUID, ISODateString, OrganizationId, ClinicId, Nullable, Metadata } from '@dentalos/shared-types';
import type { AppointmentPriority } from './appointment.types';
import type { DayOfWeek } from './provider-schedule.types';
export declare enum BookingRuleType {
    MIN_ADVANCE_TIME = "MIN_ADVANCE_TIME",
    MAX_ADVANCE_TIME = "MAX_ADVANCE_TIME",
    MAX_APPOINTMENTS_PER_PATIENT = "MAX_APPOINTMENTS_PER_PATIENT",
    MAX_APPOINTMENTS_PER_DAY = "MAX_APPOINTMENTS_PER_DAY",
    REQUIRED_GAP = "REQUIRED_GAP",
    BLACKOUT_DATES = "BLACKOUT_DATES",
    ALLOWED_APPOINTMENT_TYPES = "ALLOWED_APPOINTMENT_TYPES",
    TIME_SLOT_CONSTRAINTS = "TIME_SLOT_CONSTRAINTS",
    CUSTOM = "CUSTOM"
}
export declare enum BookingRuleScope {
    ORGANIZATION = "ORGANIZATION",
    CLINIC = "CLINIC",
    PROVIDER = "PROVIDER",
    APPOINTMENT_TYPE = "APPOINTMENT_TYPE",
    PATIENT_SEGMENT = "PATIENT_SEGMENT"
}
export declare enum ConflictResolutionStrategy {
    REJECT = "REJECT",
    ALLOW_OVERLAP = "ALLOW_OVERLAP",
    AUTO_RESCHEDULE = "AUTO_RESCHEDULE",
    WAITLIST = "WAITLIST",
    MANUAL_REVIEW = "MANUAL_REVIEW",
    PRIORITY_BASED = "PRIORITY_BASED"
}
export declare enum WaitlistStatus {
    ACTIVE = "ACTIVE",
    CONTACTED = "CONTACTED",
    BOOKED = "BOOKED",
    DECLINED = "DECLINED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED"
}
export declare enum ConstraintType {
    TIME = "TIME",
    DATE = "DATE",
    RESOURCE = "RESOURCE",
    CAPACITY = "CAPACITY",
    POLICY = "POLICY",
    BUSINESS_RULE = "BUSINESS_RULE"
}
export interface TimeSlotConstraint {
    allowedDaysOfWeek?: DayOfWeek[];
    earliestTime?: {
        hour: number;
        minute: number;
    };
    latestTime?: {
        hour: number;
        minute: number;
    };
    allowedSlots?: Array<{
        start: string;
        end: string;
    }>;
    blackoutSlots?: Array<{
        start: string;
        end: string;
    }>;
}
export interface BookingRuleCondition {
    field: string;
    operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'NOT_IN' | 'CONTAINS' | 'MATCHES';
    value: unknown;
}
export interface BookingRuleAction {
    type: 'BLOCK' | 'ALLOW' | 'WARN' | 'MODIFY' | 'NOTIFY';
    message?: string;
    modifications?: Record<string, unknown>;
    notificationRecipients?: UUID[];
}
export interface BookingRule {
    id: UUID;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    providerId?: UUID;
    ruleType: BookingRuleType;
    scope: BookingRuleScope;
    name: string;
    description?: string;
    isActive: boolean;
    priority: number;
    conditions: BookingRuleCondition[];
    actions: BookingRuleAction[];
    timeSlotConstraints?: TimeSlotConstraint;
    minAdvanceHours?: number;
    maxAdvanceDays?: number;
    requiredGapMinutes?: number;
    maxAppointmentsInPeriod?: number;
    periodDays?: number;
    allowedAppointmentTypes?: string[];
    blackoutDates?: Array<{
        start: ISODateString;
        end: ISODateString;
    }>;
    effectiveFrom: ISODateString;
    effectiveTo?: Nullable<ISODateString>;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    createdBy: UUID;
    updatedBy: UUID;
    version: number;
    metadata?: Metadata;
}
export interface ConflictDetectionResult {
    hasConflicts: boolean;
    conflicts: SchedulingConflict[];
    suggestedResolutions: ConflictResolution[];
    canProceed: boolean;
    warnings: string[];
    errors: string[];
}
export interface SchedulingConflict {
    conflictType: 'DOUBLE_BOOKING' | 'RESOURCE_CONFLICT' | 'RULE_VIOLATION' | 'CAPACITY_EXCEEDED' | 'PROVIDER_UNAVAILABLE' | 'OTHER';
    severity: 'ERROR' | 'WARNING' | 'INFO';
    message: string;
    conflictingAppointmentId?: UUID;
    conflictingResourceId?: UUID;
    violatedRuleId?: UUID;
    suggestedAction?: string;
    context?: Record<string, unknown>;
}
export interface ConflictResolution {
    id: UUID;
    conflictId: UUID;
    strategy: ConflictResolutionStrategy;
    description: string;
    requiresApproval: boolean;
    isRecommended: boolean;
    confidenceScore: number;
    alternativeSlots?: Array<{
        startTime: ISODateString;
        endTime: ISODateString;
        providerId: UUID;
        clinicId: ClinicId;
    }>;
    impact?: {
        affectedAppointments: number;
        affectedPatients: number;
        estimatedDelay: number;
    };
    requiredActions: Array<{
        actionType: string;
        description: string;
        automatable: boolean;
    }>;
}
export interface WaitlistEntry {
    id: UUID;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    patientId: UUID;
    providerId?: UUID;
    appointmentType: string;
    desiredDuration: number;
    priority: AppointmentPriority;
    preferredDateStart?: ISODateString;
    preferredDateEnd?: ISODateString;
    preferredDaysOfWeek?: DayOfWeek[];
    preferredTimeOfDay?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ANY';
    flexibilityScore: number;
    status: WaitlistStatus;
    reason?: string;
    notes?: string;
    contactAttempts: number;
    lastContactedAt?: ISODateString;
    expiresAt?: ISODateString;
    bookedAppointmentId?: UUID;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    createdBy: UUID;
    version: number;
    metadata?: Metadata;
}
export interface BookingPolicy {
    id: UUID;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    name: string;
    description?: string;
    allowOnlineBooking: boolean;
    bookingWindowDays: number;
    minAdvanceNoticeHours: number;
    maxAdvanceBookingDays: number;
    cancellationNoticePeriodHours: number;
    chargeCancellationFee: boolean;
    cancellationFeeAmount?: number;
    cancellationFeeCurrency?: string;
    allowRescheduling: boolean;
    rescheduleNoticePeriodHours?: number;
    maxReschedulesPerAppointment?: number;
    allowSameDayAppointments: boolean;
    requireConfirmation: boolean;
    confirmationDeadlineHours?: number;
    defaultConflictResolution: ConflictResolutionStrategy;
    enableWaitlist: boolean;
    waitlistExpirationDays?: number;
    maxWaitlistEntriesPerPatient?: number;
    isActive: boolean;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    version: number;
    metadata?: Metadata;
}
export interface BookingValidationResult {
    isValid: boolean;
    errors: Array<{
        code: string;
        message: string;
        field?: string;
        severity: 'ERROR' | 'WARNING';
    }>;
    violatedRules: UUID[];
    conflicts: SchedulingConflict[];
    canProceedWithWarnings: boolean;
    suggestions: string[];
}
export interface OverbookingConfig {
    allowOverbooking: boolean;
    maxOverbookingPercentage: number;
    overbookingBufferMinutes: number;
    allowedTimeSlots?: Array<{
        dayOfWeek: DayOfWeek;
        startTime: {
            hour: number;
            minute: number;
        };
        endTime: {
            hour: number;
            minute: number;
        };
    }>;
    allowedAppointmentTypes?: string[];
    requireApproval: boolean;
}
export interface BookingCapacity {
    providerId: UUID;
    clinicId: ClinicId;
    date: ISODateString;
    maxAppointments: number;
    currentAppointments: number;
    availableCapacity: number;
    utilizationPercentage: number;
    isAtCapacity: boolean;
    canOverbook: boolean;
}
