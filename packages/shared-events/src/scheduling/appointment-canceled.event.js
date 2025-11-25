"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APPOINTMENT_CANCELED_EVENT_VERSION = exports.APPOINTMENT_CANCELED_EVENT_TYPE = void 0;
exports.isAppointmentCanceledEvent = isAppointmentCanceledEvent;
exports.createAppointmentCanceledEvent = createAppointmentCanceledEvent;
exports.APPOINTMENT_CANCELED_EVENT_TYPE = 'dental.appointment.canceled';
exports.APPOINTMENT_CANCELED_EVENT_VERSION = 1;
function isAppointmentCanceledEvent(event) {
    return event.type === exports.APPOINTMENT_CANCELED_EVENT_TYPE;
}
function createAppointmentCanceledEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.APPOINTMENT_CANCELED_EVENT_TYPE,
        version: exports.APPOINTMENT_CANCELED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=appointment-canceled.event.js.map