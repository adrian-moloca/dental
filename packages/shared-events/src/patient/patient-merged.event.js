"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PATIENT_MERGED_EVENT_VERSION = exports.PATIENT_MERGED_EVENT = void 0;
exports.isPatientMergedEvent = isPatientMergedEvent;
exports.createPatientMergedEvent = createPatientMergedEvent;
exports.PATIENT_MERGED_EVENT = 'dental.patient.merged';
exports.PATIENT_MERGED_EVENT_VERSION = 1;
function isPatientMergedEvent(event) {
    return event.type === exports.PATIENT_MERGED_EVENT;
}
function createPatientMergedEvent(payload, metadata, tenantContext) {
    if (!payload.masterId) {
        throw new Error('PatientMergedEvent: masterId is required');
    }
    if (!payload.duplicateId) {
        throw new Error('PatientMergedEvent: duplicateId is required');
    }
    if (payload.masterId === payload.duplicateId) {
        throw new Error('PatientMergedEvent: masterId and duplicateId cannot be the same');
    }
    if (!payload.organizationId) {
        throw new Error('PatientMergedEvent: organizationId is required');
    }
    if (!payload.clinicId) {
        throw new Error('PatientMergedEvent: clinicId is required');
    }
    if (!payload.tenantId) {
        throw new Error('PatientMergedEvent: tenantId is required');
    }
    if (!payload.masterPatientName || payload.masterPatientName.trim().length === 0) {
        throw new Error('PatientMergedEvent: masterPatientName is required and cannot be empty');
    }
    if (!payload.duplicatePatientName || payload.duplicatePatientName.trim().length === 0) {
        throw new Error('PatientMergedEvent: duplicatePatientName is required and cannot be empty');
    }
    if (!payload.mergeStrategy) {
        throw new Error('PatientMergedEvent: mergeStrategy is required');
    }
    if (!payload.mergedBy) {
        throw new Error('PatientMergedEvent: mergedBy is required');
    }
    if (!payload.mergedAt) {
        throw new Error('PatientMergedEvent: mergedAt is required');
    }
    if (!payload.mergeType) {
        throw new Error('PatientMergedEvent: mergeType is required');
    }
    if (payload.additionalDuplicateIds && payload.additionalDuplicateIds.length > 0) {
        const invalidIds = payload.additionalDuplicateIds.filter((id) => id === payload.masterId || id === payload.duplicateId);
        if (invalidIds.length > 0) {
            throw new Error('PatientMergedEvent: additionalDuplicateIds cannot include masterId or duplicateId');
        }
    }
    return {
        id: crypto.randomUUID(),
        type: exports.PATIENT_MERGED_EVENT,
        version: exports.PATIENT_MERGED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=patient-merged.event.js.map