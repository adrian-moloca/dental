"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PATIENT_DELETED_EVENT_VERSION = exports.PATIENT_DELETED_EVENT = void 0;
exports.isPatientDeletedEvent = isPatientDeletedEvent;
exports.createPatientDeletedEvent = createPatientDeletedEvent;
exports.PATIENT_DELETED_EVENT = 'dental.patient.deleted';
exports.PATIENT_DELETED_EVENT_VERSION = 1;
function isPatientDeletedEvent(event) {
    return event.type === exports.PATIENT_DELETED_EVENT;
}
function createPatientDeletedEvent(payload, metadata, tenantContext) {
    if (!payload.patientId) {
        throw new Error('PatientDeletedEvent: patientId is required');
    }
    if (!payload.organizationId) {
        throw new Error('PatientDeletedEvent: organizationId is required');
    }
    if (!payload.clinicId) {
        throw new Error('PatientDeletedEvent: clinicId is required');
    }
    if (!payload.tenantId) {
        throw new Error('PatientDeletedEvent: tenantId is required');
    }
    if (!payload.patientName || payload.patientName.trim().length === 0) {
        throw new Error('PatientDeletedEvent: patientName is required and cannot be empty');
    }
    if (!payload.deletionType) {
        throw new Error('PatientDeletedEvent: deletionType is required');
    }
    if (!payload.deletedBy) {
        throw new Error('PatientDeletedEvent: deletedBy is required');
    }
    if (!payload.deletedAt) {
        throw new Error('PatientDeletedEvent: deletedAt is required');
    }
    if (!payload.deletionReason) {
        throw new Error('PatientDeletedEvent: deletionReason is required');
    }
    if (payload.isUnderLegalHold && payload.deletionType === 'hard') {
        throw new Error('PatientDeletedEvent: Cannot perform hard deletion on record under legal hold');
    }
    if (payload.deletionType === 'hard' && !payload.impact?.retainedDataDescription) {
        throw new Error('PatientDeletedEvent: Hard deletion requires documentation of retained data (if any) for compliance');
    }
    if (payload.requiresApproval && !payload.approvalStatus) {
        throw new Error('PatientDeletedEvent: approvalStatus is required when deletion requires approval');
    }
    if (payload.approvalStatus === 'APPROVED' && !payload.approvedBy) {
        throw new Error('PatientDeletedEvent: approvedBy is required when deletion is approved');
    }
    if (payload.deletionType === 'soft' && !payload.permanentDeletionInDays) {
        throw new Error('PatientDeletedEvent: permanentDeletionInDays is required for soft deletions');
    }
    return {
        id: crypto.randomUUID(),
        type: exports.PATIENT_DELETED_EVENT,
        version: exports.PATIENT_DELETED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=patient-deleted.event.js.map