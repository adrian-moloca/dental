"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STAFF_CREATED_EVENT_VERSION = exports.STAFF_CREATED_EVENT_TYPE = void 0;
exports.isStaffCreatedEvent = isStaffCreatedEvent;
exports.createStaffCreatedEvent = createStaffCreatedEvent;
exports.STAFF_CREATED_EVENT_TYPE = 'dental.hr.staff.created';
exports.STAFF_CREATED_EVENT_VERSION = 1;
function isStaffCreatedEvent(event) {
    return event.type === exports.STAFF_CREATED_EVENT_TYPE;
}
function createStaffCreatedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.STAFF_CREATED_EVENT_TYPE,
        version: exports.STAFF_CREATED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=staff-created.event.js.map