"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_JOB_STARTED_EVENT_VERSION = exports.AI_JOB_STARTED_EVENT_TYPE = void 0;
exports.isAIJobStartedEvent = isAIJobStartedEvent;
exports.createAIJobStartedEvent = createAIJobStartedEvent;
exports.AI_JOB_STARTED_EVENT_TYPE = 'dental.ai.job.started';
exports.AI_JOB_STARTED_EVENT_VERSION = 1;
function isAIJobStartedEvent(event) {
    return event.type === exports.AI_JOB_STARTED_EVENT_TYPE;
}
function createAIJobStartedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.AI_JOB_STARTED_EVENT_TYPE,
        version: exports.AI_JOB_STARTED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=ai-job-started.event.js.map