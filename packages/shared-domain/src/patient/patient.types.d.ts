import type { UUID, ISODateString, OrganizationId, ClinicId, Metadata } from '@dentalos/shared-types';
export declare enum Gender {
    MALE = "male",
    FEMALE = "female",
    OTHER = "other",
    PREFER_NOT_TO_SAY = "prefer_not_to_say"
}
export declare enum PatientStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    ARCHIVED = "archived"
}
export declare enum RelationshipType {
    PARENT = "parent",
    CHILD = "child",
    SPOUSE = "spouse",
    SIBLING = "sibling",
    GUARDIAN = "guardian",
    EMERGENCY = "emergency"
}
export declare enum CommunicationChannel {
    EMAIL = "email",
    SMS = "sms",
    PHONE = "phone",
    PORTAL = "portal"
}
export declare enum PhoneType {
    MOBILE = "mobile",
    HOME = "home",
    WORK = "work"
}
export declare enum EmailType {
    PERSONAL = "personal",
    WORK = "work"
}
export interface PersonName {
    firstName: string;
    lastName: string;
    middleName?: string;
    preferredName?: string;
    suffix?: string;
    prefix?: string;
}
export interface PhoneContact {
    type: PhoneType;
    number: string;
    isPrimary: boolean;
    isVerified?: boolean;
}
export interface EmailContact {
    type: EmailType;
    address: string;
    isPrimary: boolean;
    isVerified?: boolean;
}
export interface PatientContacts {
    phones: PhoneContact[];
    emails: EmailContact[];
    addresses: AddressValue[];
}
export interface AddressValue {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isPrimary?: boolean;
    type?: 'home' | 'billing' | 'mailing';
}
export interface Demographics {
    preferredLanguage?: string;
    ethnicity?: string;
    race?: string;
    maritalStatus?: string;
    occupation?: string;
    employer?: string;
}
export interface MedicalFlags {
    allergies: string[];
    medications: string[];
    conditions: string[];
    flags: string[];
    notes?: string;
}
export interface InsuranceInfo {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
    subscriberId?: string;
    subscriberName?: string;
    subscriberRelationship?: string;
    effectiveDate?: ISODateString;
    expirationDate?: ISODateString;
}
export interface PatientInsurance {
    primary?: InsuranceInfo;
    secondary?: InsuranceInfo;
}
export interface CommunicationPreferences {
    preferredChannel: CommunicationChannel;
    appointmentReminders: boolean;
    recallReminders: boolean;
    marketingConsent: boolean;
    smsEnabled: boolean;
    emailEnabled: boolean;
    phoneCallsEnabled: boolean;
}
export interface ConsentRecord {
    gdprConsent: boolean;
    gdprConsentDate?: ISODateString;
    marketingConsent: boolean;
    marketingConsentDate?: ISODateString;
    dataProcessingConsent: boolean;
    dataProcessingConsentDate?: ISODateString;
    hipaaAcknowledged?: boolean;
    hipaaAcknowledgedDate?: ISODateString;
}
export interface Patient {
    id: UUID;
    tenantId: string;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    person: PersonName & {
        dateOfBirth: ISODateString;
        gender: Gender;
        ssn?: string;
    };
    contacts: PatientContacts;
    demographics?: Demographics;
    medical?: MedicalFlags;
    insurance?: PatientInsurance;
    tags: string[];
    communicationPreferences: CommunicationPreferences;
    consent: ConsentRecord;
    valueScore: number;
    status: PatientStatus;
    isDeleted: boolean;
    deletedAt?: ISODateString;
    deletedBy?: UUID;
    isAnonymized?: boolean;
    anonymizedAt?: ISODateString;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    createdBy?: UUID;
    updatedBy?: UUID;
    metadata?: Metadata;
}
export interface PatientRelationship {
    id: UUID;
    tenantId: string;
    patientId: UUID;
    relatedPatientId: UUID;
    relationshipType: RelationshipType;
    isActive: boolean;
    notes?: string;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}
export interface PatientTimelineEvent {
    id: UUID;
    patientId: UUID;
    tenantId: string;
    eventType: string;
    timestamp: ISODateString;
    title: string;
    description?: string;
    metadata?: Record<string, unknown>;
    source: string;
}
export interface PatientSearchCriteria {
    tenantId: string;
    search?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: ISODateString;
    phone?: string;
    email?: string;
    tags?: string[];
    status?: PatientStatus;
    clinicId?: ClinicId;
    limit?: number;
    offset?: number;
}
export interface DuplicatePatientMatch {
    patientId: UUID;
    duplicateId: UUID;
    matchScore: number;
    matchReasons: string[];
    patient: Partial<Patient>;
    duplicate: Partial<Patient>;
}
export interface PatientGDPRExport {
    patient: Patient;
    relationships: PatientRelationship[];
    timeline: PatientTimelineEvent[];
    appointments?: unknown[];
    communications?: unknown[];
    payments?: unknown[];
    exportedAt: ISODateString;
    exportedBy: UUID;
}
