"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TASK_COMPLETED_EVENT_VERSION = exports.TASK_COMPLETED_EVENT_TYPE = void 0;
exports.isTaskCompletedEvent = isTaskCompletedEvent;
exports.createTaskCompletedEvent = createTaskCompletedEvent;
exports.TASK_COMPLETED_EVENT_TYPE = 'dental.hr.task.completed';
exports.TASK_COMPLETED_EVENT_VERSION = 1;
function isTaskCompletedEvent(event) {
    return event.type === exports.TASK_COMPLETED_EVENT_TYPE;
}
function createTaskCompletedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.TASK_COMPLETED_EVENT_TYPE,
        version: exports.TASK_COMPLETED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=task-completed.event.js.map