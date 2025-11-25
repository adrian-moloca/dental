"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PATIENT_UPDATED_EVENT_VERSION = exports.PATIENT_UPDATED_EVENT = void 0;
exports.isPatientUpdatedEvent = isPatientUpdatedEvent;
exports.createPatientUpdatedEvent = createPatientUpdatedEvent;
exports.PATIENT_UPDATED_EVENT = 'dental.patient.updated';
exports.PATIENT_UPDATED_EVENT_VERSION = 1;
function isPatientUpdatedEvent(event) {
    return event.type === exports.PATIENT_UPDATED_EVENT;
}
function createPatientUpdatedEvent(payload, metadata, tenantContext) {
    if (!payload.patientId) {
        throw new Error('PatientUpdatedEvent: patientId is required');
    }
    if (!payload.organizationId) {
        throw new Error('PatientUpdatedEvent: organizationId is required');
    }
    if (!payload.clinicId) {
        throw new Error('PatientUpdatedEvent: clinicId is required');
    }
    if (!payload.tenantId) {
        throw new Error('PatientUpdatedEvent: tenantId is required');
    }
    if (!payload.updatedFields || payload.updatedFields.length === 0) {
        throw new Error('PatientUpdatedEvent: updatedFields is required and cannot be empty');
    }
    if (!payload.updatedAt) {
        throw new Error('PatientUpdatedEvent: updatedAt is required');
    }
    const hasUpdatedData = payload.updatedFields.some((field) => {
        return payload[field] !== undefined;
    });
    if (!hasUpdatedData && !payload.changes) {
        throw new Error('PatientUpdatedEvent: No updated data provided for specified fields');
    }
    return {
        id: crypto.randomUUID(),
        type: exports.PATIENT_UPDATED_EVENT,
        version: exports.PATIENT_UPDATED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=patient-updated.event.js.map