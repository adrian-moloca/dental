import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
export declare const APPOINTMENT_BOOKED_EVENT_TYPE: "dental.appointment.booked";
export declare const APPOINTMENT_BOOKED_EVENT_VERSION = 1;
export type BookingSource = 'ONLINE_PORTAL' | 'PHONE' | 'WALK_IN' | 'ADMIN' | 'INTEGRATION' | 'OTHER';
export type AppointmentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ParticipantRole = 'PROVIDER' | 'ASSISTANT' | 'HYGIENIST' | 'SPECIALIST' | 'OTHER';
export interface AppointmentParticipantData {
    userId: UUID;
    role: ParticipantRole;
    required: boolean;
    displayName?: string;
}
export interface AppointmentBookedPayload {
    appointmentId: UUID;
    patientId: UUID;
    providerId: UUID;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    title: string;
    description?: string;
    appointmentType: string;
    appointmentTypeCode?: string;
    scheduledStartTime: ISODateString;
    scheduledEndTime: ISODateString;
    duration: number;
    priority: AppointmentPriority;
    room?: string;
    participants: AppointmentParticipantData[];
    bookingSource: BookingSource;
    bookedBy: UUID;
    bookedAt: ISODateString;
    requiresApproval: boolean;
    approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
    isRecurring: boolean;
    parentAppointmentId?: UUID;
    seriesId?: UUID;
    recurrencePattern?: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
    patientName: string;
    patientEmail?: string;
    patientPhone?: string;
    providerName: string;
    confirmationToken?: string;
    notes?: string;
    metadata?: Record<string, unknown>;
}
export type AppointmentBookedEvent = EventEnvelope<AppointmentBookedPayload>;
export declare function isAppointmentBookedEvent(event: EventEnvelope<unknown>): event is AppointmentBookedEvent;
export declare function createAppointmentBookedEvent(payload: AppointmentBookedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): AppointmentBookedEvent;
