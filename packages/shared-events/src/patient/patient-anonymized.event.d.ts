import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
export declare const PATIENT_ANONYMIZED_EVENT: "dental.patient.anonymized";
export declare const PATIENT_ANONYMIZED_EVENT_VERSION = 1;
export type AnonymizationMethod = 'FULL_PSEUDONYMIZATION' | 'PARTIAL_PSEUDONYMIZATION' | 'DATA_MASKING' | 'GENERALIZATION' | 'DATA_AGGREGATION' | 'SUPPRESSION' | 'HYBRID';
export type AnonymizationReason = 'GDPR_COMPLIANCE' | 'PATIENT_REQUEST' | 'DATA_RETENTION_POLICY' | 'RESEARCH_PURPOSES' | 'LEGAL_REQUIREMENT' | 'DECEASED_PATIENT' | 'REGULATORY_COMPLIANCE' | 'QUALITY_IMPROVEMENT' | 'OTHER';
export interface AnonymizedField {
    fieldName: string;
    originalDataType: string;
    technique: 'MASKED' | 'PSEUDONYMIZED' | 'GENERALIZED' | 'SUPPRESSED' | 'HASHED' | 'RANDOMIZED';
    isReversible: boolean;
    exampleValue?: string;
}
export interface RetainedDataDetails {
    clinicalDataRetained: boolean;
    statisticalDataRetained: boolean;
    financialDataRetained: boolean;
    appointmentHistoryRetained: boolean;
    retainedFields?: readonly string[];
    retentionPeriodDays?: number;
    retentionPurpose?: string;
}
export interface AnonymizationImpact {
    piiFieldsCount: number;
    appointmentsCount?: number;
    documentsCount?: number;
    communicationsCount?: number;
    affectedEntities?: readonly string[];
    hasLinkedIdentifiableData: boolean;
}
export interface PatientAnonymizedPayload {
    patientId: UUID;
    anonymizedPatientId: UUID;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    tenantId: string;
    originalPatientName: string;
    originalChartNumber?: string;
    anonymizedDisplayName: string;
    anonymizationMethod: AnonymizationMethod;
    anonymizedBy: UUID;
    anonymizedByName?: string;
    anonymizedAt: ISODateString;
    anonymizationReason: AnonymizationReason;
    anonymizationJustification?: string;
    anonymizedFields: readonly AnonymizedField[];
    retainedData?: RetainedDataDetails;
    impact: AnonymizationImpact;
    isReversible: boolean;
    reversibilityKeyId?: UUID;
    anonymizationOperationId?: UUID;
    requiresApproval: boolean;
    approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
    approvedBy?: UUID;
    approvedAt?: ISODateString;
    complianceFramework?: 'GDPR' | 'HIPAA' | 'CCPA' | 'PIPEDA' | 'OTHER';
    auditLogReference?: string;
    patientNotified: boolean;
    notificationMethod?: 'EMAIL' | 'PHONE' | 'MAIL' | 'IN_PERSON' | 'NONE';
    dataExportProvided: boolean;
    dataExportReference?: string;
    validatedBy?: UUID;
    validatedAt?: ISODateString;
    meetsKAnonymity?: boolean;
    kAnonymityValue?: number;
    complianceNotes?: string;
    notes?: string;
    metadata?: Record<string, unknown>;
}
export type PatientAnonymizedEvent = EventEnvelope<PatientAnonymizedPayload>;
export declare function isPatientAnonymizedEvent(event: EventEnvelope<unknown>): event is PatientAnonymizedEvent;
export declare function createPatientAnonymizedEvent(payload: PatientAnonymizedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): PatientAnonymizedEvent;
