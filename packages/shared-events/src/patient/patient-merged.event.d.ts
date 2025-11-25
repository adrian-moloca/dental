import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
export declare const PATIENT_MERGED_EVENT: "dental.patient.merged";
export declare const PATIENT_MERGED_EVENT_VERSION = 1;
export type MergeStrategy = 'MASTER_WINS' | 'DUPLICATE_WINS' | 'MANUAL_SELECTION' | 'MERGE_ALL' | 'CUSTOM';
export interface MergeConflictResolution {
    fieldName: string;
    masterValue: unknown;
    duplicateValue: unknown;
    selectedValue: unknown;
    resolutionStrategy: 'MASTER' | 'DUPLICATE' | 'MANUAL' | 'CONCATENATED' | 'OTHER';
    notes?: string;
}
export interface MergedDataSummary {
    appointmentsCount?: number;
    treatmentRecordsCount?: number;
    billingRecordsCount?: number;
    documentsCount?: number;
    notesCount?: number;
    prescriptionsCount?: number;
    mergedEntities?: readonly string[];
}
export interface PatientMergedPayload {
    masterId: UUID;
    duplicateId: UUID;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    tenantId: string;
    masterPatientName: string;
    duplicatePatientName: string;
    masterChartNumber?: string;
    duplicateChartNumber?: string;
    mergeStrategy: MergeStrategy;
    mergedBy: UUID;
    mergedByName?: string;
    mergedAt: ISODateString;
    mergeReason?: string;
    mergeJustification?: string;
    conflictingFields?: readonly string[];
    conflictResolutions?: readonly MergeConflictResolution[];
    dataSummary?: MergedDataSummary;
    isReversible: boolean;
    mergeOperationId?: UUID;
    additionalDuplicateIds?: readonly UUID[];
    mergeConfidenceScore?: number;
    mergeType: 'MANUAL' | 'AUTOMATED' | 'SEMI_AUTOMATED';
    approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
    approvedBy?: UUID;
    approvedAt?: ISODateString;
    notes?: string;
    metadata?: Record<string, unknown>;
}
export type PatientMergedEvent = EventEnvelope<PatientMergedPayload>;
export declare function isPatientMergedEvent(event: EventEnvelope<unknown>): event is PatientMergedEvent;
export declare function createPatientMergedEvent(payload: PatientMergedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): PatientMergedEvent;
