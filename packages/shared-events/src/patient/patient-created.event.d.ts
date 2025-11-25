import type { UUID, OrganizationId, ClinicId, ISODateString, Email, PhoneNumber } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
export declare const PATIENT_CREATED_EVENT: "dental.patient.created";
export declare const PATIENT_CREATED_EVENT_VERSION = 1;
export type PatientRegistrationSource = 'ONLINE_PORTAL' | 'FRONT_DESK' | 'PHONE' | 'IMPORT' | 'MIGRATION' | 'INTEGRATION' | 'OTHER';
export type PatientGender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY' | 'UNKNOWN';
export type PatientStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ARCHIVED';
export interface EmergencyContact {
    name: string;
    relationship?: string;
    phone: PhoneNumber;
    alternatePhone?: PhoneNumber;
    email?: Email;
}
export interface PatientInsuranceInfo {
    hasInsurance: boolean;
    primaryInsuranceProvider?: string;
    insurancePlanId?: string;
}
export interface PatientCreatedPayload {
    patientId: UUID;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    tenantId: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    preferredName?: string;
    dateOfBirth: ISODateString;
    gender?: PatientGender;
    email?: Email;
    phone?: PhoneNumber;
    alternatePhone?: PhoneNumber;
    address?: {
        street?: string;
        street2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    emergencyContact?: EmergencyContact;
    insurance?: PatientInsuranceInfo;
    registrationSource: PatientRegistrationSource;
    status: PatientStatus;
    chartNumber?: string;
    ssnLast4?: string;
    preferredLanguage?: string;
    preferredContactMethod?: 'EMAIL' | 'PHONE' | 'SMS' | 'PORTAL';
    marketingConsent: boolean;
    smsConsent: boolean;
    createdBy?: UUID;
    createdAt: ISODateString;
    referralSource?: string;
    notes?: string;
    metadata?: Record<string, unknown>;
}
export type PatientCreatedEvent = EventEnvelope<PatientCreatedPayload>;
export declare function isPatientCreatedEvent(event: EventEnvelope<unknown>): event is PatientCreatedEvent;
export declare function createPatientCreatedEvent(payload: PatientCreatedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): PatientCreatedEvent;
