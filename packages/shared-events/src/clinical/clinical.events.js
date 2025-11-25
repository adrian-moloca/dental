"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOTH_STATUS_UPDATED_VERSION = exports.CONSENT_SIGNED_VERSION = exports.PROCEDURE_COMPLETED_VERSION = exports.TREATMENT_PLAN_UPDATED_VERSION = exports.TREATMENT_PLAN_CREATED_VERSION = exports.CLINICAL_NOTE_CREATED_VERSION = exports.TOOTH_STATUS_UPDATED_EVENT = exports.CONSENT_SIGNED_EVENT = exports.PROCEDURE_COMPLETED_EVENT = exports.TREATMENT_PLAN_UPDATED_EVENT = exports.TREATMENT_PLAN_CREATED_EVENT = exports.CLINICAL_NOTE_CREATED_EVENT = void 0;
exports.isClinicalNoteCreatedEvent = isClinicalNoteCreatedEvent;
exports.createClinicalNoteCreatedEvent = createClinicalNoteCreatedEvent;
exports.isTreatmentPlanCreatedEvent = isTreatmentPlanCreatedEvent;
exports.createTreatmentPlanCreatedEvent = createTreatmentPlanCreatedEvent;
exports.isTreatmentPlanUpdatedEvent = isTreatmentPlanUpdatedEvent;
exports.createTreatmentPlanUpdatedEvent = createTreatmentPlanUpdatedEvent;
exports.isProcedureCompletedEvent = isProcedureCompletedEvent;
exports.createProcedureCompletedEvent = createProcedureCompletedEvent;
exports.isConsentSignedEvent = isConsentSignedEvent;
exports.createConsentSignedEvent = createConsentSignedEvent;
exports.isToothStatusUpdatedEvent = isToothStatusUpdatedEvent;
exports.createToothStatusUpdatedEvent = createToothStatusUpdatedEvent;
exports.CLINICAL_NOTE_CREATED_EVENT = 'dental.clinical.note.created';
exports.TREATMENT_PLAN_CREATED_EVENT = 'dental.clinical.treatment-plan.created';
exports.TREATMENT_PLAN_UPDATED_EVENT = 'dental.clinical.treatment-plan.updated';
exports.PROCEDURE_COMPLETED_EVENT = 'dental.clinical.procedure.completed';
exports.CONSENT_SIGNED_EVENT = 'dental.clinical.consent.signed';
exports.TOOTH_STATUS_UPDATED_EVENT = 'dental.clinical.tooth.status-updated';
exports.CLINICAL_NOTE_CREATED_VERSION = 1;
exports.TREATMENT_PLAN_CREATED_VERSION = 1;
exports.TREATMENT_PLAN_UPDATED_VERSION = 1;
exports.PROCEDURE_COMPLETED_VERSION = 1;
exports.CONSENT_SIGNED_VERSION = 1;
exports.TOOTH_STATUS_UPDATED_VERSION = 1;
function isClinicalNoteCreatedEvent(event) {
    return event.type === exports.CLINICAL_NOTE_CREATED_EVENT;
}
function createClinicalNoteCreatedEvent(payload, metadata, tenantContext) {
    if (!payload.noteId) {
        throw new Error('ClinicalNoteCreatedEvent: noteId is required');
    }
    if (!payload.patientId) {
        throw new Error('ClinicalNoteCreatedEvent: patientId is required');
    }
    if (!payload.providerId) {
        throw new Error('ClinicalNoteCreatedEvent: providerId is required');
    }
    if (!payload.organizationId) {
        throw new Error('ClinicalNoteCreatedEvent: organizationId is required');
    }
    if (!payload.clinicId) {
        throw new Error('ClinicalNoteCreatedEvent: clinicId is required');
    }
    if (!payload.tenantId) {
        throw new Error('ClinicalNoteCreatedEvent: tenantId is required');
    }
    if (!payload.noteType) {
        throw new Error('ClinicalNoteCreatedEvent: noteType is required');
    }
    if (!payload.timestamp) {
        throw new Error('ClinicalNoteCreatedEvent: timestamp is required');
    }
    if (!payload.title || payload.title.trim().length === 0) {
        throw new Error('ClinicalNoteCreatedEvent: title is required and cannot be empty');
    }
    if (!payload.createdAt) {
        throw new Error('ClinicalNoteCreatedEvent: createdAt is required');
    }
    return {
        id: crypto.randomUUID(),
        type: exports.CLINICAL_NOTE_CREATED_EVENT,
        version: exports.CLINICAL_NOTE_CREATED_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
function isTreatmentPlanCreatedEvent(event) {
    return event.type === exports.TREATMENT_PLAN_CREATED_EVENT;
}
function createTreatmentPlanCreatedEvent(payload, metadata, tenantContext) {
    if (!payload.treatmentPlanId) {
        throw new Error('TreatmentPlanCreatedEvent: treatmentPlanId is required');
    }
    if (!payload.patientId) {
        throw new Error('TreatmentPlanCreatedEvent: patientId is required');
    }
    if (!payload.providerId) {
        throw new Error('TreatmentPlanCreatedEvent: providerId is required');
    }
    if (!payload.organizationId) {
        throw new Error('TreatmentPlanCreatedEvent: organizationId is required');
    }
    if (!payload.clinicId) {
        throw new Error('TreatmentPlanCreatedEvent: clinicId is required');
    }
    if (!payload.tenantId) {
        throw new Error('TreatmentPlanCreatedEvent: tenantId is required');
    }
    if (!payload.version || payload.version < 1) {
        throw new Error('TreatmentPlanCreatedEvent: version is required and must be >= 1');
    }
    if (payload.totalCost === undefined || payload.totalCost === null) {
        throw new Error('TreatmentPlanCreatedEvent: totalCost is required');
    }
    if (payload.totalCost < 0) {
        throw new Error('TreatmentPlanCreatedEvent: totalCost cannot be negative');
    }
    if (!payload.procedureCount || payload.procedureCount < 0) {
        throw new Error('TreatmentPlanCreatedEvent: procedureCount is required and must be >= 0');
    }
    if (!payload.timestamp) {
        throw new Error('TreatmentPlanCreatedEvent: timestamp is required');
    }
    return {
        id: crypto.randomUUID(),
        type: exports.TREATMENT_PLAN_CREATED_EVENT,
        version: exports.TREATMENT_PLAN_CREATED_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
function isTreatmentPlanUpdatedEvent(event) {
    return event.type === exports.TREATMENT_PLAN_UPDATED_EVENT;
}
function createTreatmentPlanUpdatedEvent(payload, metadata, tenantContext) {
    if (!payload.treatmentPlanId) {
        throw new Error('TreatmentPlanUpdatedEvent: treatmentPlanId is required');
    }
    if (!payload.patientId) {
        throw new Error('TreatmentPlanUpdatedEvent: patientId is required');
    }
    if (!payload.organizationId) {
        throw new Error('TreatmentPlanUpdatedEvent: organizationId is required');
    }
    if (!payload.clinicId) {
        throw new Error('TreatmentPlanUpdatedEvent: clinicId is required');
    }
    if (!payload.tenantId) {
        throw new Error('TreatmentPlanUpdatedEvent: tenantId is required');
    }
    if (!payload.version || payload.version < 1) {
        throw new Error('TreatmentPlanUpdatedEvent: version is required and must be >= 1');
    }
    if (!payload.previousVersion || payload.previousVersion < 1) {
        throw new Error('TreatmentPlanUpdatedEvent: previousVersion is required and must be >= 1');
    }
    if (payload.version <= payload.previousVersion) {
        throw new Error('TreatmentPlanUpdatedEvent: version must be greater than previousVersion');
    }
    if (!payload.changes || payload.changes.length === 0) {
        throw new Error('TreatmentPlanUpdatedEvent: changes array is required and cannot be empty');
    }
    if (!payload.updatedBy) {
        throw new Error('TreatmentPlanUpdatedEvent: updatedBy is required');
    }
    if (!payload.timestamp) {
        throw new Error('TreatmentPlanUpdatedEvent: timestamp is required');
    }
    return {
        id: crypto.randomUUID(),
        type: exports.TREATMENT_PLAN_UPDATED_EVENT,
        version: exports.TREATMENT_PLAN_UPDATED_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
function isProcedureCompletedEvent(event) {
    return event.type === exports.PROCEDURE_COMPLETED_EVENT;
}
function createProcedureCompletedEvent(payload, metadata, tenantContext) {
    if (!payload.procedureId) {
        throw new Error('ProcedureCompletedEvent: procedureId is required');
    }
    if (!payload.patientId) {
        throw new Error('ProcedureCompletedEvent: patientId is required');
    }
    if (!payload.providerId) {
        throw new Error('ProcedureCompletedEvent: providerId is required');
    }
    if (!payload.organizationId) {
        throw new Error('ProcedureCompletedEvent: organizationId is required');
    }
    if (!payload.clinicId) {
        throw new Error('ProcedureCompletedEvent: clinicId is required');
    }
    if (!payload.tenantId) {
        throw new Error('ProcedureCompletedEvent: tenantId is required');
    }
    if (!payload.procedureCode || payload.procedureCode.trim().length === 0) {
        throw new Error('ProcedureCompletedEvent: procedureCode is required and cannot be empty');
    }
    if (!payload.procedureName || payload.procedureName.trim().length === 0) {
        throw new Error('ProcedureCompletedEvent: procedureName is required and cannot be empty');
    }
    if (!Array.isArray(payload.stockItemsUsed)) {
        throw new Error('ProcedureCompletedEvent: stockItemsUsed must be an array');
    }
    if (!payload.timestamp) {
        throw new Error('ProcedureCompletedEvent: timestamp is required');
    }
    return {
        id: crypto.randomUUID(),
        type: exports.PROCEDURE_COMPLETED_EVENT,
        version: exports.PROCEDURE_COMPLETED_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
function isConsentSignedEvent(event) {
    return event.type === exports.CONSENT_SIGNED_EVENT;
}
function createConsentSignedEvent(payload, metadata, tenantContext) {
    if (!payload.consentId) {
        throw new Error('ConsentSignedEvent: consentId is required');
    }
    if (!payload.patientId) {
        throw new Error('ConsentSignedEvent: patientId is required');
    }
    if (!payload.organizationId) {
        throw new Error('ConsentSignedEvent: organizationId is required');
    }
    if (!payload.clinicId) {
        throw new Error('ConsentSignedEvent: clinicId is required');
    }
    if (!payload.tenantId) {
        throw new Error('ConsentSignedEvent: tenantId is required');
    }
    if (!payload.consentType) {
        throw new Error('ConsentSignedEvent: consentType is required');
    }
    if (!payload.signedBy) {
        throw new Error('ConsentSignedEvent: signedBy is required');
    }
    if (!payload.signerRelationship) {
        throw new Error('ConsentSignedEvent: signerRelationship is required');
    }
    if (!payload.signatureMethod) {
        throw new Error('ConsentSignedEvent: signatureMethod is required');
    }
    if (!payload.signature || payload.signature.trim().length === 0) {
        throw new Error('ConsentSignedEvent: signature is required and cannot be empty');
    }
    if (!payload.timestamp) {
        throw new Error('ConsentSignedEvent: timestamp is required');
    }
    return {
        id: crypto.randomUUID(),
        type: exports.CONSENT_SIGNED_EVENT,
        version: exports.CONSENT_SIGNED_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
function isToothStatusUpdatedEvent(event) {
    return event.type === exports.TOOTH_STATUS_UPDATED_EVENT;
}
function createToothStatusUpdatedEvent(payload, metadata, tenantContext) {
    if (!payload.patientId) {
        throw new Error('ToothStatusUpdatedEvent: patientId is required');
    }
    if (!payload.organizationId) {
        throw new Error('ToothStatusUpdatedEvent: organizationId is required');
    }
    if (!payload.clinicId) {
        throw new Error('ToothStatusUpdatedEvent: clinicId is required');
    }
    if (!payload.tenantId) {
        throw new Error('ToothStatusUpdatedEvent: tenantId is required');
    }
    if (payload.toothNumber === undefined || payload.toothNumber === null) {
        throw new Error('ToothStatusUpdatedEvent: toothNumber is required');
    }
    if (!payload.toothNumberingSystem) {
        throw new Error('ToothStatusUpdatedEvent: toothNumberingSystem is required');
    }
    if (!payload.previousCondition) {
        throw new Error('ToothStatusUpdatedEvent: previousCondition is required');
    }
    if (!payload.newCondition) {
        throw new Error('ToothStatusUpdatedEvent: newCondition is required');
    }
    if (payload.previousCondition === payload.newCondition) {
        throw new Error('ToothStatusUpdatedEvent: previousCondition and newCondition must be different');
    }
    if (!payload.updatedBy) {
        throw new Error('ToothStatusUpdatedEvent: updatedBy is required');
    }
    if (!payload.timestamp) {
        throw new Error('ToothStatusUpdatedEvent: timestamp is required');
    }
    return {
        id: crypto.randomUUID(),
        type: exports.TOOTH_STATUS_UPDATED_EVENT,
        version: exports.TOOTH_STATUS_UPDATED_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=clinical.events.js.map