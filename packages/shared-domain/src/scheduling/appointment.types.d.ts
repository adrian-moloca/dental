import type { UUID, ISODateString, OrganizationId, ClinicId, Nullable, Metadata } from '@dentalos/shared-types';
export declare enum AppointmentStatus {
    SCHEDULED = "SCHEDULED",
    CONFIRMED = "CONFIRMED",
    CHECKED_IN = "CHECKED_IN",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    NO_SHOW = "NO_SHOW",
    RESCHEDULED = "RESCHEDULED"
}
export declare enum CancellationType {
    PATIENT = "PATIENT",
    PROVIDER = "PROVIDER",
    SYSTEM = "SYSTEM",
    NO_SHOW = "NO_SHOW"
}
export declare enum AppointmentPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare enum ParticipantRole {
    PROVIDER = "PROVIDER",
    ASSISTANT = "ASSISTANT",
    HYGIENIST = "HYGIENIST",
    SPECIALIST = "SPECIALIST",
    OTHER = "OTHER"
}
export interface AppointmentParticipant {
    userId: UUID;
    role: ParticipantRole;
    required: boolean;
    displayName?: string;
}
export interface RecurrenceRule {
    pattern: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
    interval: number;
    daysOfWeek?: number[];
    endDate?: ISODateString;
    occurrences?: number;
}
export interface AppointmentNote {
    id: UUID;
    content: string;
    createdBy: UUID;
    createdAt: ISODateString;
    isPrivate: boolean;
}
export interface BookingMetadata {
    bookingSource: 'ONLINE_PORTAL' | 'PHONE' | 'WALK_IN' | 'ADMIN' | 'INTEGRATION' | 'OTHER';
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
    bookedBy: UUID;
    bookedAt: ISODateString;
    confirmationToken?: string;
    requiresApproval: boolean;
    approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
    approvedBy?: UUID;
    approvedAt?: ISODateString;
    approvalNotes?: string;
}
export interface CancellationDetails {
    cancellationType: CancellationType;
    reason?: string;
    cancelledBy: UUID;
    cancelledAt: ISODateString;
    feeCharged: boolean;
    feeAmount?: number;
    feeCurrency?: string;
    withinPolicy: boolean;
    notificationSent: boolean;
}
export interface ConfirmationDetails {
    confirmedAt: ISODateString;
    confirmedBy: UUID;
    confirmationMethod: 'EMAIL' | 'PHONE' | 'SMS' | 'IN_PERSON' | 'ONLINE_PORTAL';
    confirmationCode?: string;
    reminderSent: boolean;
    lastReminderAt?: ISODateString;
}
export interface CheckInDetails {
    checkedInAt: ISODateString;
    checkedInBy: UUID;
    checkInMethod: 'KIOSK' | 'FRONT_DESK' | 'MOBILE_APP' | 'OTHER';
    arrivedOnTime: boolean;
    minutesOffset?: number;
    notes?: string;
}
export interface CompletionDetails {
    completedAt: ISODateString;
    completedBy: UUID;
    actualDuration: number;
    treatmentCompleted: boolean;
    outcomeNotes?: string;
    followUpRequired: boolean;
    followUpDate?: ISODateString;
}
export interface ResourceAllocation {
    room?: string;
    equipmentIds?: UUID[];
    specialRequirements?: string;
}
export interface Appointment {
    id: UUID;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    patientId: UUID;
    providerId: UUID;
    title: string;
    description?: string;
    status: AppointmentStatus;
    priority: AppointmentPriority;
    startTime: ISODateString;
    endTime: ISODateString;
    duration: number;
    appointmentType: string;
    appointmentTypeCode?: string;
    participants: AppointmentParticipant[];
    resources?: ResourceAllocation;
    notes: AppointmentNote[];
    bookingMetadata?: BookingMetadata;
    recurrenceRule?: RecurrenceRule;
    parentAppointmentId?: UUID;
    seriesId?: UUID;
    confirmation?: ConfirmationDetails;
    checkIn?: CheckInDetails;
    cancellation?: CancellationDetails;
    completion?: CompletionDetails;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    deletedAt: Nullable<ISODateString>;
    createdBy: UUID;
    updatedBy: UUID;
    deletedBy?: Nullable<UUID>;
    version: number;
    metadata?: Metadata;
}
export interface AppointmentStatusTransition {
    fromStatus: AppointmentStatus;
    toStatus: AppointmentStatus;
    reason?: string;
    transitionedAt: ISODateString;
    transitionedBy: UUID;
}
export interface AppointmentSummary {
    id: UUID;
    patientId: UUID;
    patientName: string;
    providerId: UUID;
    providerName: string;
    appointmentType: string;
    status: AppointmentStatus;
    priority: AppointmentPriority;
    startTime: ISODateString;
    endTime: ISODateString;
    duration: number;
    room?: string;
    clinicId: ClinicId;
}
export interface AppointmentFilter {
    organizationId?: OrganizationId;
    clinicId?: ClinicId;
    patientId?: UUID;
    providerId?: UUID;
    status?: AppointmentStatus | AppointmentStatus[];
    priority?: AppointmentPriority | AppointmentPriority[];
    appointmentType?: string | string[];
    startDateFrom?: ISODateString;
    startDateTo?: ISODateString;
    includeCancelled?: boolean;
    includeDeleted?: boolean;
}
