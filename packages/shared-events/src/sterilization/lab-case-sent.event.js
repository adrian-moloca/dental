"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LAB_CASE_SENT_EVENT_VERSION = exports.LAB_CASE_SENT_EVENT_TYPE = void 0;
exports.isLabCaseSentEvent = isLabCaseSentEvent;
exports.createLabCaseSentEvent = createLabCaseSentEvent;
exports.LAB_CASE_SENT_EVENT_TYPE = 'dental.lab.case.sent';
exports.LAB_CASE_SENT_EVENT_VERSION = 1;
function isLabCaseSentEvent(event) {
    return event.type === exports.LAB_CASE_SENT_EVENT_TYPE;
}
function createLabCaseSentEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.LAB_CASE_SENT_EVENT_TYPE,
        version: exports.LAB_CASE_SENT_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=lab-case-sent.event.js.map