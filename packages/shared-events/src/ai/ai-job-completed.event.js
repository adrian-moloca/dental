"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_JOB_COMPLETED_EVENT_VERSION = exports.AI_JOB_COMPLETED_EVENT_TYPE = void 0;
exports.isAIJobCompletedEvent = isAIJobCompletedEvent;
exports.createAIJobCompletedEvent = createAIJobCompletedEvent;
exports.AI_JOB_COMPLETED_EVENT_TYPE = 'dental.ai.job.completed';
exports.AI_JOB_COMPLETED_EVENT_VERSION = 1;
function isAIJobCompletedEvent(event) {
    return event.type === exports.AI_JOB_COMPLETED_EVENT_TYPE;
}
function createAIJobCompletedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.AI_JOB_COMPLETED_EVENT_TYPE,
        version: exports.AI_JOB_COMPLETED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=ai-job-completed.event.js.map