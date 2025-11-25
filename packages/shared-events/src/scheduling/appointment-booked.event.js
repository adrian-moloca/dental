"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APPOINTMENT_BOOKED_EVENT_VERSION = exports.APPOINTMENT_BOOKED_EVENT_TYPE = void 0;
exports.isAppointmentBookedEvent = isAppointmentBookedEvent;
exports.createAppointmentBookedEvent = createAppointmentBookedEvent;
exports.APPOINTMENT_BOOKED_EVENT_TYPE = 'dental.appointment.booked';
exports.APPOINTMENT_BOOKED_EVENT_VERSION = 1;
function isAppointmentBookedEvent(event) {
    return event.type === exports.APPOINTMENT_BOOKED_EVENT_TYPE;
}
function createAppointmentBookedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.APPOINTMENT_BOOKED_EVENT_TYPE,
        version: exports.APPOINTMENT_BOOKED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=appointment-booked.event.js.map