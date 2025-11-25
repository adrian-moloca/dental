"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHIFT_ASSIGNED_EVENT_VERSION = exports.SHIFT_ASSIGNED_EVENT_TYPE = void 0;
exports.isShiftAssignedEvent = isShiftAssignedEvent;
exports.createShiftAssignedEvent = createShiftAssignedEvent;
exports.SHIFT_ASSIGNED_EVENT_TYPE = 'dental.hr.shift.assigned';
exports.SHIFT_ASSIGNED_EVENT_VERSION = 1;
function isShiftAssignedEvent(event) {
    return event.type === exports.SHIFT_ASSIGNED_EVENT_TYPE;
}
function createShiftAssignedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.SHIFT_ASSIGNED_EVENT_TYPE,
        version: exports.SHIFT_ASSIGNED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=shift-assigned.event.js.map