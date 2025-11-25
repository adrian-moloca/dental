import type { UUID, OrganizationId, ClinicId, ISODateString, Email, PhoneNumber } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { PatientGender, PatientStatus, EmergencyContact, PatientInsuranceInfo } from './patient-created.event';
export declare const PATIENT_UPDATED_EVENT: "dental.patient.updated";
export declare const PATIENT_UPDATED_EVENT_VERSION = 1;
export type PatientUpdateReason = 'CONTACT_INFO_CHANGE' | 'ADDRESS_CHANGE' | 'INSURANCE_CHANGE' | 'MEDICAL_HISTORY_UPDATE' | 'PERSONAL_INFO_CORRECTION' | 'STATUS_CHANGE' | 'EMERGENCY_CONTACT_CHANGE' | 'PREFERENCES_UPDATE' | 'PROFILE_COMPLETION' | 'DATA_CORRECTION' | 'OTHER';
export interface ChangedField<T = unknown> {
    fieldName: string;
    oldValue?: T;
    newValue?: T;
}
export interface PatientUpdatedPayload {
    patientId: UUID;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    tenantId: string;
    updatedFields: readonly string[];
    changes?: readonly ChangedField[];
    updateReason?: PatientUpdateReason;
    updateNotes?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    preferredName?: string;
    dateOfBirth?: ISODateString;
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
    status?: PatientStatus;
    chartNumber?: string;
    preferredLanguage?: string;
    preferredContactMethod?: 'EMAIL' | 'PHONE' | 'SMS' | 'PORTAL';
    marketingConsent?: boolean;
    smsConsent?: boolean;
    updatedBy?: UUID;
    updatedAt: ISODateString;
    previousVersion?: number;
    currentVersion?: number;
    metadata?: Record<string, unknown>;
}
export type PatientUpdatedEvent = EventEnvelope<PatientUpdatedPayload>;
export declare function isPatientUpdatedEvent(event: EventEnvelope<unknown>): event is PatientUpdatedEvent;
export declare function createPatientUpdatedEvent(payload: PatientUpdatedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): PatientUpdatedEvent;
