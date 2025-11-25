"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STAFF_UPDATED_EVENT_VERSION = exports.STAFF_UPDATED_EVENT_TYPE = void 0;
exports.isStaffUpdatedEvent = isStaffUpdatedEvent;
exports.createStaffUpdatedEvent = createStaffUpdatedEvent;
exports.STAFF_UPDATED_EVENT_TYPE = 'dental.hr.staff.updated';
exports.STAFF_UPDATED_EVENT_VERSION = 1;
function isStaffUpdatedEvent(event) {
    return event.type === exports.STAFF_UPDATED_EVENT_TYPE;
}
function createStaffUpdatedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.STAFF_UPDATED_EVENT_TYPE,
        version: exports.STAFF_UPDATED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=staff-updated.event.js.map