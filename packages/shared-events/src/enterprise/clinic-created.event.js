"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENTERPRISE_CLINIC_CREATED_EVENT_VERSION = exports.ENTERPRISE_CLINIC_CREATED_EVENT_TYPE = void 0;
exports.isEnterpriseClinicCreatedEvent = isEnterpriseClinicCreatedEvent;
exports.createEnterpriseClinicCreatedEvent = createEnterpriseClinicCreatedEvent;
exports.ENTERPRISE_CLINIC_CREATED_EVENT_TYPE = 'dental.enterprise.clinic.created';
exports.ENTERPRISE_CLINIC_CREATED_EVENT_VERSION = 1;
function isEnterpriseClinicCreatedEvent(event) {
    return event.type === exports.ENTERPRISE_CLINIC_CREATED_EVENT_TYPE;
}
function createEnterpriseClinicCreatedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.ENTERPRISE_CLINIC_CREATED_EVENT_TYPE,
        version: exports.ENTERPRISE_CLINIC_CREATED_EVENT_VERSION,
        payload,
        metadata,
        tenantContext,
        occurredAt: new Date(),
    };
}
//# sourceMappingURL=clinic-created.event.js.map