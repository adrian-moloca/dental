"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PATIENT_ANONYMIZED_EVENT_VERSION = exports.PATIENT_ANONYMIZED_EVENT = void 0;
exports.isPatientAnonymizedEvent = isPatientAnonymizedEvent;
exports.createPatientAnonymizedEvent = createPatientAnonymizedEvent;
exports.PATIENT_ANONYMIZED_EVENT = 'dental.patient.anonymized';
exports.PATIENT_ANONYMIZED_EVENT_VERSION = 1;
function isPatientAnonymizedEvent(event) {
    return event.type === exports.PATIENT_ANONYMIZED_EVENT;
}
function createPatientAnonymizedEvent(payload, metadata, tenantContext) {
    if (!payload.patientId) {
        throw new Error('PatientAnonymizedEvent: patientId is required');
    }
    if (!payload.anonymizedPatientId) {
        throw new Error('PatientAnonymizedEvent: anonymizedPatientId is required');
    }
    if (payload.patientId === payload.anonymizedPatientId) {
        throw new Error('PatientAnonymizedEvent: patientId and anonymizedPatientId must be different');
    }
    if (!payload.organizationId) {
        throw new Error('PatientAnonymizedEvent: organizationId is required');
    }
    if (!payload.clinicId) {
        throw new Error('PatientAnonymizedEvent: clinicId is required');
    }
    if (!payload.tenantId) {
        throw new Error('PatientAnonymizedEvent: tenantId is required');
    }
    if (!payload.originalPatientName || payload.originalPatientName.trim().length === 0) {
        throw new Error('PatientAnonymizedEvent: originalPatientName is required and cannot be empty');
    }
    if (!payload.anonymizedDisplayName || payload.anonymizedDisplayName.trim().length === 0) {
        throw new Error('PatientAnonymizedEvent: anonymizedDisplayName is required and cannot be empty');
    }
    if (!payload.anonymizationMethod) {
        throw new Error('PatientAnonymizedEvent: anonymizationMethod is required');
    }
    if (!payload.anonymizedBy) {
        throw new Error('PatientAnonymizedEvent: anonymizedBy is required');
    }
    if (!payload.anonymizedAt) {
        throw new Error('PatientAnonymizedEvent: anonymizedAt is required');
    }
    if (!payload.anonymizationReason) {
        throw new Error('PatientAnonymizedEvent: anonymizationReason is required');
    }
    if (!payload.anonymizedFields || payload.anonymizedFields.length === 0) {
        throw new Error('PatientAnonymizedEvent: anonymizedFields is required and cannot be empty');
    }
    if (!payload.impact) {
        throw new Error('PatientAnonymizedEvent: impact is required');
    }
    if (payload.impact.piiFieldsCount < 1) {
        throw new Error('PatientAnonymizedEvent: impact.piiFieldsCount must be at least 1');
    }
    if (payload.requiresApproval && !payload.approvalStatus) {
        throw new Error('PatientAnonymizedEvent: approvalStatus is required when anonymization requires approval');
    }
    if (payload.approvalStatus === 'APPROVED' && !payload.approvedBy) {
        throw new Error('PatientAnonymizedEvent: approvedBy is required when anonymization is approved');
    }
    if (payload.isReversible && !payload.reversibilityKeyId) {
        throw new Error('PatientAnonymizedEvent: reversibilityKeyId is required for reversible anonymization');
    }
    const hasInvalidFields = payload.anonymizedFields.some((field) => !field.fieldName || !field.originalDataType || !field.technique);
    if (hasInvalidFields) {
        throw new Error('PatientAnonymizedEvent: All anonymizedFields must have fieldName, originalDataType, and technique');
    }
    if (payload.isReversible) {
        console.warn('PatientAnonymizedEvent: Reversible anonymization may not meet GDPR compliance requirements');
    }
    return {
        id: crypto.randomUUID(),
        type: exports.PATIENT_ANONYMIZED_EVENT,
        version: exports.PATIENT_ANONYMIZED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=patient-anonymized.event.js.map