"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LAB_CASE_RECEIVED_EVENT_VERSION = exports.LAB_CASE_RECEIVED_EVENT_TYPE = void 0;
exports.isLabCaseReceivedEvent = isLabCaseReceivedEvent;
exports.createLabCaseReceivedEvent = createLabCaseReceivedEvent;
exports.LAB_CASE_RECEIVED_EVENT_TYPE = 'dental.lab.case.received';
exports.LAB_CASE_RECEIVED_EVENT_VERSION = 1;
function isLabCaseReceivedEvent(event) {
    return event.type === exports.LAB_CASE_RECEIVED_EVENT_TYPE;
}
function createLabCaseReceivedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.LAB_CASE_RECEIVED_EVENT_TYPE,
        version: exports.LAB_CASE_RECEIVED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=lab-case-received.event.js.map