"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_PATIENT_RISK_UPDATED_EVENT_VERSION = exports.AI_PATIENT_RISK_UPDATED_EVENT_TYPE = void 0;
exports.isAIPatientRiskUpdatedEvent = isAIPatientRiskUpdatedEvent;
exports.createAIPatientRiskUpdatedEvent = createAIPatientRiskUpdatedEvent;
exports.AI_PATIENT_RISK_UPDATED_EVENT_TYPE = 'dental.ai.patient.risk.updated';
exports.AI_PATIENT_RISK_UPDATED_EVENT_VERSION = 1;
function isAIPatientRiskUpdatedEvent(event) {
    return event.type === exports.AI_PATIENT_RISK_UPDATED_EVENT_TYPE;
}
function createAIPatientRiskUpdatedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.AI_PATIENT_RISK_UPDATED_EVENT_TYPE,
        version: exports.AI_PATIENT_RISK_UPDATED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=ai-patient-risk-updated.event.js.map