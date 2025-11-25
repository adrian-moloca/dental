import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
export declare const APPOINTMENT_RESCHEDULED_EVENT_TYPE: "dental.appointment.rescheduled";
export declare const APPOINTMENT_RESCHEDULED_EVENT_VERSION = 1;
export type RescheduleReasonCategory = 'PATIENT_REQUEST' | 'PROVIDER_UNAVAILABLE' | 'CLINIC_CLOSURE' | 'EMERGENCY' | 'CONFLICT_RESOLUTION' | 'OPTIMIZATION' | 'SYSTEM' | 'OTHER';
export type RescheduleInitiator = 'PATIENT' | 'PROVIDER' | 'STAFF' | 'SYSTEM' | 'ADMIN';
export interface TimeSlotChange {
    previousStartTime: ISODateString;
    previousEndTime: ISODateString;
    newStartTime: ISODateString;
    newEndTime: ISODateString;
    previousDuration: number;
    newDuration: number;
    durationChanged: boolean;
}
export interface ResourceChange {
    previousRoom?: string;
    newRoom?: string;
    previousClinicId?: ClinicId;
    newClinicId?: ClinicId;
    locationChanged: boolean;
}
export interface AppointmentRescheduledPayload {
    appointmentId: UUID;
    patientId: UUID;
    providerId: UUID;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    title: string;
    appointmentType: string;
    timeSlotChange: TimeSlotChange;
    resourceChange?: ResourceChange;
    reasonCategory: RescheduleReasonCategory;
    reason?: string;
    initiator: RescheduleInitiator;
    rescheduledBy: UUID;
    rescheduledAt: ISODateString;
    isAutomated: boolean;
    patientNotified: boolean;
    notificationSentAt?: ISODateString;
    patientConfirmed: boolean;
    confirmedAt?: ISODateString;
    rescheduleCount: number;
    exceedsMaxReschedules: boolean;
    feeApplied: boolean;
    feeAmount?: number;
    feeCurrency?: string;
    affectedAppointmentIds?: UUID[];
    patientName: string;
    patientEmail?: string;
    patientPhone?: string;
    providerName: string;
    confirmationToken?: string;
    notes?: string;
    metadata?: Record<string, unknown>;
}
export type AppointmentRescheduledEvent = EventEnvelope<AppointmentRescheduledPayload>;
export declare function isAppointmentRescheduledEvent(event: EventEnvelope<unknown>): event is AppointmentRescheduledEvent;
export declare function createAppointmentRescheduledEvent(payload: AppointmentRescheduledPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): AppointmentRescheduledEvent;
