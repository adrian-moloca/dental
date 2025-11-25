"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STAFF_STATUS_CHANGED_EVENT_VERSION = exports.STAFF_STATUS_CHANGED_EVENT_TYPE = void 0;
exports.isStaffStatusChangedEvent = isStaffStatusChangedEvent;
exports.createStaffStatusChangedEvent = createStaffStatusChangedEvent;
exports.STAFF_STATUS_CHANGED_EVENT_TYPE = 'dental.hr.staff.status_changed';
exports.STAFF_STATUS_CHANGED_EVENT_VERSION = 1;
function isStaffStatusChangedEvent(event) {
    return event.type === exports.STAFF_STATUS_CHANGED_EVENT_TYPE;
}
function createStaffStatusChangedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.STAFF_STATUS_CHANGED_EVENT_TYPE,
        version: exports.STAFF_STATUS_CHANGED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=staff-status-changed.event.js.map