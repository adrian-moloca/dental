import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
export declare const APPOINTMENT_CANCELED_EVENT_TYPE: "dental.appointment.canceled";
export declare const APPOINTMENT_CANCELED_EVENT_VERSION = 1;
export type CancellationType = 'PATIENT' | 'PROVIDER' | 'SYSTEM' | 'NO_SHOW';
export type CancellationReasonCategory = 'PATIENT_REQUEST' | 'ILLNESS' | 'EMERGENCY' | 'SCHEDULING_CONFLICT' | 'PROVIDER_UNAVAILABLE' | 'CLINIC_CLOSURE' | 'WEATHER' | 'NO_SHOW' | 'POLICY_VIOLATION' | 'PAYMENT_ISSUE' | 'DUPLICATE_BOOKING' | 'OTHER';
export interface CancellationPolicyDetails {
    withinPolicyWindow: boolean;
    policyWindowHours: number;
    hoursBeforeAppointment: number;
    feeCharged: boolean;
    feeAmount?: number;
    feeCurrency?: string;
    feeReason?: string;
    feeWaived: boolean;
    waiverReason?: string;
}
export interface CancellationNotificationDetails {
    patientNotified: boolean;
    patientNotifiedAt?: ISODateString;
    patientNotificationChannels?: Array<'EMAIL' | 'SMS' | 'PHONE' | 'IN_APP' | 'PUSH'>;
    providerNotified: boolean;
    providerNotifiedAt?: ISODateString;
    waitlistNotified: boolean;
    waitlistEntriesNotified?: number;
}
export interface ResourceReleaseDetails {
    releasedRoom?: string;
    releasedEquipmentIds?: UUID[];
    slotAvailableForBooking: boolean;
    addedToAvailableSlots: boolean;
}
export interface AppointmentCanceledPayload {
    appointmentId: UUID;
    patientId: UUID;
    providerId: UUID;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    title: string;
    appointmentType: string;
    scheduledStartTime: ISODateString;
    scheduledEndTime: ISODateString;
    duration: number;
    cancellationType: CancellationType;
    reasonCategory: CancellationReasonCategory;
    reason?: string;
    cancelledBy: UUID;
    cancelledAt: ISODateString;
    hoursBeforeAppointment: number;
    isSameDayCancellation: boolean;
    policyDetails: CancellationPolicyDetails;
    notificationDetails: CancellationNotificationDetails;
    resourceReleaseDetails?: ResourceReleaseDetails;
    affectsRecurringSeries: boolean;
    seriesId?: UUID;
    affectedSeriesAppointmentIds?: UUID[];
    isAutomated: boolean;
    automationReason?: string;
    canRebookOnline: boolean;
    suggestedAlternativeDates?: ISODateString[];
    patientCancellationCount: number;
    patientFlaggedFrequentCanceller: boolean;
    processWaitlist: boolean;
    waitlistEntriesToNotify?: UUID[];
    patientName: string;
    patientEmail?: string;
    patientPhone?: string;
    providerName: string;
    refundEligible: boolean;
    refundAmount?: number;
    refundCurrency?: string;
    refundIssued: boolean;
    notes?: string;
    metadata?: Record<string, unknown>;
}
export type AppointmentCanceledEvent = EventEnvelope<AppointmentCanceledPayload>;
export declare function isAppointmentCanceledEvent(event: EventEnvelope<unknown>): event is AppointmentCanceledEvent;
export declare function createAppointmentCanceledEvent(payload: AppointmentCanceledPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): AppointmentCanceledEvent;
