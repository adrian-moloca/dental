"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APPOINTMENT_RESCHEDULED_EVENT_VERSION = exports.APPOINTMENT_RESCHEDULED_EVENT_TYPE = void 0;
exports.isAppointmentRescheduledEvent = isAppointmentRescheduledEvent;
exports.createAppointmentRescheduledEvent = createAppointmentRescheduledEvent;
exports.APPOINTMENT_RESCHEDULED_EVENT_TYPE = 'dental.appointment.rescheduled';
exports.APPOINTMENT_RESCHEDULED_EVENT_VERSION = 1;
function isAppointmentRescheduledEvent(event) {
    return event.type === exports.APPOINTMENT_RESCHEDULED_EVENT_TYPE;
}
function createAppointmentRescheduledEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.APPOINTMENT_RESCHEDULED_EVENT_TYPE,
        version: exports.APPOINTMENT_RESCHEDULED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=appointment-rescheduled.event.js.map