"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_JOB_CREATED_EVENT_VERSION = exports.AI_JOB_CREATED_EVENT_TYPE = void 0;
exports.isAIJobCreatedEvent = isAIJobCreatedEvent;
exports.createAIJobCreatedEvent = createAIJobCreatedEvent;
exports.AI_JOB_CREATED_EVENT_TYPE = 'dental.ai.job.created';
exports.AI_JOB_CREATED_EVENT_VERSION = 1;
function isAIJobCreatedEvent(event) {
    return event.type === exports.AI_JOB_CREATED_EVENT_TYPE;
}
function createAIJobCreatedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.AI_JOB_CREATED_EVENT_TYPE,
        version: exports.AI_JOB_CREATED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=ai-job-created.event.js.map