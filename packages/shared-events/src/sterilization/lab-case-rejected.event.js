"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LAB_CASE_REJECTED_EVENT_VERSION = exports.LAB_CASE_REJECTED_EVENT_TYPE = void 0;
exports.isLabCaseRejectedEvent = isLabCaseRejectedEvent;
exports.createLabCaseRejectedEvent = createLabCaseRejectedEvent;
exports.LAB_CASE_REJECTED_EVENT_TYPE = 'dental.lab.case.rejected';
exports.LAB_CASE_REJECTED_EVENT_VERSION = 1;
function isLabCaseRejectedEvent(event) {
    return event.type === exports.LAB_CASE_REJECTED_EVENT_TYPE;
}
function createLabCaseRejectedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.LAB_CASE_REJECTED_EVENT_TYPE,
        version: exports.LAB_CASE_REJECTED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=lab-case-rejected.event.js.map