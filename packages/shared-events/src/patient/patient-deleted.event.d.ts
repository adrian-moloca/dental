import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
export declare const PATIENT_DELETED_EVENT: "dental.patient.deleted";
export declare const PATIENT_DELETED_EVENT_VERSION = 1;
export type DeletionType = 'soft' | 'anonymized' | 'hard' | 'archived';
export type DeletionReason = 'PATIENT_REQUEST' | 'GDPR_RIGHT_TO_BE_FORGOTTEN' | 'DUPLICATE_RECORD' | 'TEST_DATA' | 'DATA_QUALITY' | 'FRAUD' | 'DECEASED' | 'RETENTION_POLICY' | 'ADMINISTRATIVE' | 'OTHER';
export interface RetentionPolicy {
    policyName: string;
    retentionPeriodDays: number;
    retainFinancialData: boolean;
    retainMedicalRecords: boolean;
    legalRetentionPeriodDays?: number;
    jurisdiction?: string;
}
export interface DeletionImpact {
    appointmentsCount?: number;
    treatmentRecordsCount?: number;
    billingRecordsCount?: number;
    documentsCount?: number;
    prescriptionsCount?: number;
    affectedEntities?: readonly string[];
    hasRetainedData: boolean;
    retainedDataDescription?: string;
}
export interface PatientDeletedPayload {
    patientId: UUID;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    tenantId: string;
    patientName: string;
    chartNumber?: string;
    patientEmail?: string;
    deletionType: DeletionType;
    deletedBy: UUID;
    deletedByName?: string;
    deletedAt: ISODateString;
    deletionReason: DeletionReason;
    deletionJustification?: string;
    deletionRequestId?: UUID;
    impact?: DeletionImpact;
    retentionPolicy?: RetentionPolicy;
    isReversible: boolean;
    permanentDeletionInDays?: number;
    scheduledPermanentDeletion?: ISODateString;
    deletionOperationId?: UUID;
    requiresApproval: boolean;
    approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
    approvedBy?: UUID;
    approvedAt?: ISODateString;
    isUnderLegalHold: boolean;
    legalHoldInfo?: {
        caseId: string;
        reason: string;
        startDate: ISODateString;
        endDate?: ISODateString;
    };
    patientNotified: boolean;
    notificationMethod?: 'EMAIL' | 'PHONE' | 'MAIL' | 'IN_PERSON' | 'NONE';
    dataExportProvided: boolean;
    dataExportReference?: string;
    complianceNotes?: string;
    notes?: string;
    metadata?: Record<string, unknown>;
}
export type PatientDeletedEvent = EventEnvelope<PatientDeletedPayload>;
export declare function isPatientDeletedEvent(event: EventEnvelope<unknown>): event is PatientDeletedEvent;
export declare function createPatientDeletedEvent(payload: PatientDeletedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): PatientDeletedEvent;
