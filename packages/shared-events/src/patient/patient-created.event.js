"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PATIENT_CREATED_EVENT_VERSION = exports.PATIENT_CREATED_EVENT = void 0;
exports.isPatientCreatedEvent = isPatientCreatedEvent;
exports.createPatientCreatedEvent = createPatientCreatedEvent;
exports.PATIENT_CREATED_EVENT = 'dental.patient.created';
exports.PATIENT_CREATED_EVENT_VERSION = 1;
function isPatientCreatedEvent(event) {
    return event.type === exports.PATIENT_CREATED_EVENT;
}
function createPatientCreatedEvent(payload, metadata, tenantContext) {
    if (!payload.patientId) {
        throw new Error('PatientCreatedEvent: patientId is required');
    }
    if (!payload.organizationId) {
        throw new Error('PatientCreatedEvent: organizationId is required');
    }
    if (!payload.clinicId) {
        throw new Error('PatientCreatedEvent: clinicId is required');
    }
    if (!payload.tenantId) {
        throw new Error('PatientCreatedEvent: tenantId is required');
    }
    if (!payload.firstName || payload.firstName.trim().length === 0) {
        throw new Error('PatientCreatedEvent: firstName is required and cannot be empty');
    }
    if (!payload.lastName || payload.lastName.trim().length === 0) {
        throw new Error('PatientCreatedEvent: lastName is required and cannot be empty');
    }
    if (!payload.dateOfBirth) {
        throw new Error('PatientCreatedEvent: dateOfBirth is required');
    }
    if (!payload.registrationSource) {
        throw new Error('PatientCreatedEvent: registrationSource is required');
    }
    if (!payload.status) {
        throw new Error('PatientCreatedEvent: status is required');
    }
    if (!payload.createdAt) {
        throw new Error('PatientCreatedEvent: createdAt is required');
    }
    return {
        id: crypto.randomUUID(),
        type: exports.PATIENT_CREATED_EVENT,
        version: exports.PATIENT_CREATED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=patient-created.event.js.map