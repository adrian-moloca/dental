"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentCompleted = exports.AppointmentCancelled = exports.AppointmentRescheduled = exports.AppointmentBooked = void 0;
const shared_domain_1 = require("../../../shared-domain/src");
class AppointmentBooked extends shared_domain_1.DomainEvent {
    constructor(params) {
        super('AppointmentBooked', params.aggregateId, 1);
        this.appointmentId = params.appointmentId;
        this.patientId = params.patientId;
        this.providerId = params.providerId;
        this.scheduledAt = params.scheduledAt;
        this.duration = params.duration;
        this.appointmentType = params.appointmentType;
        this.organizationId = params.organizationId;
        this.clinicId = params.clinicId;
    }
}
exports.AppointmentBooked = AppointmentBooked;
class AppointmentRescheduled extends shared_domain_1.DomainEvent {
    constructor(params) {
        super('AppointmentRescheduled', params.aggregateId, 1);
        this.appointmentId = params.appointmentId;
        this.patientId = params.patientId;
        this.providerId = params.providerId;
        this.previousScheduledAt = params.previousScheduledAt;
        this.newScheduledAt = params.newScheduledAt;
        this.duration = params.duration;
        this.organizationId = params.organizationId;
        this.clinicId = params.clinicId;
        this.rescheduledBy = params.rescheduledBy;
        this.reason = params.reason;
    }
}
exports.AppointmentRescheduled = AppointmentRescheduled;
class AppointmentCancelled extends shared_domain_1.DomainEvent {
    constructor(params) {
        super('AppointmentCancelled', params.aggregateId, 1);
        this.appointmentId = params.appointmentId;
        this.patientId = params.patientId;
        this.providerId = params.providerId;
        this.scheduledAt = params.scheduledAt;
        this.organizationId = params.organizationId;
        this.clinicId = params.clinicId;
        this.cancelledBy = params.cancelledBy;
        this.reason = params.reason;
        this.cancellationType = params.cancellationType;
    }
}
exports.AppointmentCancelled = AppointmentCancelled;
class AppointmentCompleted extends shared_domain_1.DomainEvent {
    constructor(params) {
        super('AppointmentCompleted', params.aggregateId, 1);
        this.appointmentId = params.appointmentId;
        this.patientId = params.patientId;
        this.providerId = params.providerId;
        this.scheduledAt = params.scheduledAt;
        this.completedAt = params.completedAt;
        this.organizationId = params.organizationId;
        this.clinicId = params.clinicId;
        this.completedBy = params.completedBy;
        this.notes = params.notes;
    }
}
exports.AppointmentCompleted = AppointmentCompleted;
//# sourceMappingURL=appointment.events.js.map