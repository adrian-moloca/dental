"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENTERPRISE_STAFF_ASSIGNED_EVENT_VERSION = exports.ENTERPRISE_STAFF_ASSIGNED_EVENT_TYPE = void 0;
exports.isEnterpriseStaffAssignedEvent = isEnterpriseStaffAssignedEvent;
exports.createEnterpriseStaffAssignedEvent = createEnterpriseStaffAssignedEvent;
exports.ENTERPRISE_STAFF_ASSIGNED_EVENT_TYPE = 'dental.enterprise.staff.assigned';
exports.ENTERPRISE_STAFF_ASSIGNED_EVENT_VERSION = 1;
function isEnterpriseStaffAssignedEvent(event) {
    return event.type === exports.ENTERPRISE_STAFF_ASSIGNED_EVENT_TYPE;
}
function createEnterpriseStaffAssignedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.ENTERPRISE_STAFF_ASSIGNED_EVENT_TYPE,
        version: exports.ENTERPRISE_STAFF_ASSIGNED_EVENT_VERSION,
        payload,
        metadata,
        tenantContext,
        occurredAt: new Date(),
    };
}
//# sourceMappingURL=staff-assigned.event.js.map