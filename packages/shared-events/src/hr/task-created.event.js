"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TASK_CREATED_EVENT_VERSION = exports.TASK_CREATED_EVENT_TYPE = void 0;
exports.isTaskCreatedEvent = isTaskCreatedEvent;
exports.createTaskCreatedEvent = createTaskCreatedEvent;
exports.TASK_CREATED_EVENT_TYPE = 'dental.hr.task.created';
exports.TASK_CREATED_EVENT_VERSION = 1;
function isTaskCreatedEvent(event) {
    return event.type === exports.TASK_CREATED_EVENT_TYPE;
}
function createTaskCreatedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.TASK_CREATED_EVENT_TYPE,
        version: exports.TASK_CREATED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=task-created.event.js.map