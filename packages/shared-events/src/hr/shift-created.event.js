"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHIFT_CREATED_EVENT_VERSION = exports.SHIFT_CREATED_EVENT_TYPE = void 0;
exports.isShiftCreatedEvent = isShiftCreatedEvent;
exports.createShiftCreatedEvent = createShiftCreatedEvent;
exports.SHIFT_CREATED_EVENT_TYPE = 'dental.hr.shift.created';
exports.SHIFT_CREATED_EVENT_VERSION = 1;
function isShiftCreatedEvent(event) {
    return event.type === exports.SHIFT_CREATED_EVENT_TYPE;
}
function createShiftCreatedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.SHIFT_CREATED_EVENT_TYPE,
        version: exports.SHIFT_CREATED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=shift-created.event.js.map