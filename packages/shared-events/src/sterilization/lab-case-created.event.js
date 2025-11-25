"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LAB_CASE_CREATED_EVENT_VERSION = exports.LAB_CASE_CREATED_EVENT_TYPE = void 0;
exports.isLabCaseCreatedEvent = isLabCaseCreatedEvent;
exports.createLabCaseCreatedEvent = createLabCaseCreatedEvent;
exports.LAB_CASE_CREATED_EVENT_TYPE = 'dental.lab.case.created';
exports.LAB_CASE_CREATED_EVENT_VERSION = 1;
function isLabCaseCreatedEvent(event) {
    return event.type === exports.LAB_CASE_CREATED_EVENT_TYPE;
}
function createLabCaseCreatedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.LAB_CASE_CREATED_EVENT_TYPE,
        version: exports.LAB_CASE_CREATED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=lab-case-created.event.js.map