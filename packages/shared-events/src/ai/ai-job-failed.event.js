"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_JOB_FAILED_EVENT_VERSION = exports.AI_JOB_FAILED_EVENT_TYPE = void 0;
exports.isAIJobFailedEvent = isAIJobFailedEvent;
exports.createAIJobFailedEvent = createAIJobFailedEvent;
exports.AI_JOB_FAILED_EVENT_TYPE = 'dental.ai.job.failed';
exports.AI_JOB_FAILED_EVENT_VERSION = 1;
function isAIJobFailedEvent(event) {
    return event.type === exports.AI_JOB_FAILED_EVENT_TYPE;
}
function createAIJobFailedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.AI_JOB_FAILED_EVENT_TYPE,
        version: exports.AI_JOB_FAILED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=ai-job-failed.event.js.map