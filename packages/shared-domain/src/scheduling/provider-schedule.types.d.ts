import type { UUID, ISODateString, OrganizationId, ClinicId, Nullable, Metadata } from '@dentalos/shared-types';
export declare enum DayOfWeek {
    SUNDAY = 0,
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THURSDAY = 4,
    FRIDAY = 5,
    SATURDAY = 6
}
export declare enum TimeSlotType {
    AVAILABLE = "AVAILABLE",
    BREAK = "BREAK",
    BLOCKED = "BLOCKED",
    EMERGENCY = "EMERGENCY",
    BUFFER = "BUFFER",
    ADMINISTRATIVE = "ADMINISTRATIVE"
}
export declare enum AbsenceType {
    VACATION = "VACATION",
    SICK_LEAVE = "SICK_LEAVE",
    CONFERENCE = "CONFERENCE",
    PERSONAL = "PERSONAL",
    BEREAVEMENT = "BEREAVEMENT",
    PARENTAL_LEAVE = "PARENTAL_LEAVE",
    SABBATICAL = "SABBATICAL",
    OTHER = "OTHER"
}
export declare enum AbsenceStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED"
}
export declare enum ScheduleRecurrence {
    NONE = "NONE",
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    CUSTOM = "CUSTOM"
}
export interface TimeOfDay {
    hour: number;
    minute: number;
}
export interface TimeSlot {
    id: UUID;
    startTime: ISODateString;
    endTime: ISODateString;
    slotType: TimeSlotType;
    isAvailable: boolean;
    reason?: string;
    duration: number;
}
export interface DailyWorkingHours {
    dayOfWeek: DayOfWeek;
    isWorkingDay: boolean;
    workPeriods: WorkPeriod[];
    notes?: string;
}
export interface WorkPeriod {
    startTime: TimeOfDay;
    endTime: TimeOfDay;
    clinicId?: ClinicId;
    room?: string;
}
export interface WeeklyHours {
    id: UUID;
    organizationId: OrganizationId;
    providerId: UUID;
    name: string;
    description?: string;
    dailySchedules: DailyWorkingHours[];
    isDefault: boolean;
    effectiveFrom: ISODateString;
    effectiveTo: Nullable<ISODateString>;
    timeZone: string;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    version: number;
    metadata?: Metadata;
}
export interface ScheduleException {
    id: UUID;
    providerId: UUID;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    exceptionType: 'OVERRIDE' | 'ADDITION' | 'CANCELLATION';
    exceptionDate: ISODateString;
    schedule?: DailyWorkingHours;
    reason?: string;
    cancelAppointments: boolean;
    createdAt: ISODateString;
    createdBy: UUID;
    metadata?: Metadata;
}
export interface ProviderAbsence {
    id: UUID;
    providerId: UUID;
    organizationId: OrganizationId;
    absenceType: AbsenceType;
    status: AbsenceStatus;
    startDate: ISODateString;
    endDate: ISODateString;
    isAllDay: boolean;
    reason?: string;
    documentIds?: UUID[];
    requestedBy: UUID;
    requestedAt: ISODateString;
    reviewedBy?: UUID;
    reviewedAt?: ISODateString;
    reviewNotes?: string;
    cancelAppointments: boolean;
    affectedAppointmentIds?: UUID[];
    coveringProviderId?: UUID;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    version: number;
    metadata?: Metadata;
}
export interface ProviderSchedule {
    id: UUID;
    providerId: UUID;
    organizationId: OrganizationId;
    defaultWeeklyHours: WeeklyHours;
    alternateWeeklyHours?: WeeklyHours[];
    exceptions: ScheduleException[];
    absences: ProviderAbsence[];
    clinicIds: ClinicId[];
    defaultAppointmentDuration: number;
    minAppointmentDuration: number;
    maxAppointmentDuration: number;
    bufferTime: number;
    maxAppointmentsPerDay?: number;
    acceptsOnlineBooking: boolean;
    bookingWindowDays?: number;
    cancellationPolicyHours?: number;
    isActive: boolean;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    version: number;
    metadata?: Metadata;
}
export interface AvailabilitySearchCriteria {
    providerId: UUID;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    startDate: ISODateString;
    endDate: ISODateString;
    duration: number;
    daysOfWeek?: DayOfWeek[];
    preferredTimeStart?: TimeOfDay;
    preferredTimeEnd?: TimeOfDay;
    appointmentType?: string;
    limit?: number;
}
export interface AvailableSlot {
    providerId: UUID;
    clinicId: ClinicId;
    startTime: ISODateString;
    endTime: ISODateString;
    duration: number;
    room?: string;
    confidenceScore: number;
}
export interface AvailabilitySummary {
    providerId: UUID;
    date: ISODateString;
    totalWorkingHours: number;
    totalBookedHours: number;
    totalAvailableHours: number;
    appointmentCount: number;
    availableSlotCount: number;
    utilizationPercentage: number;
}
export interface BulkScheduleUpdate {
    providerId: UUID;
    organizationId: OrganizationId;
    startDate: ISODateString;
    endDate: ISODateString;
    weeklyHoursTemplate: WeeklyHours;
    preserveAppointments: boolean;
    updatedBy: UUID;
}
