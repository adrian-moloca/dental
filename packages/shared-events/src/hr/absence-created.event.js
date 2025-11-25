"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ABSENCE_CREATED_EVENT_VERSION = exports.ABSENCE_CREATED_EVENT_TYPE = void 0;
exports.isAbsenceCreatedEvent = isAbsenceCreatedEvent;
exports.createAbsenceCreatedEvent = createAbsenceCreatedEvent;
exports.ABSENCE_CREATED_EVENT_TYPE = 'dental.hr.absence.created';
exports.ABSENCE_CREATED_EVENT_VERSION = 1;
function isAbsenceCreatedEvent(event) {
    return event.type === exports.ABSENCE_CREATED_EVENT_TYPE;
}
function createAbsenceCreatedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.ABSENCE_CREATED_EVENT_TYPE,
        version: exports.ABSENCE_CREATED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=absence-created.event.js.map