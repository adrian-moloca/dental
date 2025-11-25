"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TASK_ESCALATED_EVENT_VERSION = exports.TASK_ESCALATED_EVENT_TYPE = void 0;
exports.isTaskEscalatedEvent = isTaskEscalatedEvent;
exports.createTaskEscalatedEvent = createTaskEscalatedEvent;
exports.TASK_ESCALATED_EVENT_TYPE = 'dental.hr.task.escalated';
exports.TASK_ESCALATED_EVENT_VERSION = 1;
function isTaskEscalatedEvent(event) {
    return event.type === exports.TASK_ESCALATED_EVENT_TYPE;
}
function createTaskEscalatedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.TASK_ESCALATED_EVENT_TYPE,
        version: exports.TASK_ESCALATED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=task-escalated.event.js.map