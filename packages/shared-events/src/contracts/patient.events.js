"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientDeleted = exports.PatientUpdated = exports.PatientCreated = void 0;
const shared_domain_1 = require("../../../shared-domain/src");
class PatientCreated extends shared_domain_1.DomainEvent {
    constructor(params) {
        super('PatientCreated', params.aggregateId, 1);
        this.patientId = params.patientId;
        this.firstName = params.firstName;
        this.lastName = params.lastName;
        this.email = params.email;
        this.phone = params.phone;
        this.dateOfBirth = params.dateOfBirth;
        this.organizationId = params.organizationId;
        this.clinicId = params.clinicId;
    }
}
exports.PatientCreated = PatientCreated;
class PatientUpdated extends shared_domain_1.DomainEvent {
    constructor(params) {
        super('PatientUpdated', params.aggregateId, 1);
        this.patientId = params.patientId;
        this.firstName = params.firstName;
        this.lastName = params.lastName;
        this.email = params.email;
        this.phone = params.phone;
        this.dateOfBirth = params.dateOfBirth;
        this.organizationId = params.organizationId;
        this.clinicId = params.clinicId;
        this.updatedFields = params.updatedFields;
    }
}
exports.PatientUpdated = PatientUpdated;
class PatientDeleted extends shared_domain_1.DomainEvent {
    constructor(params) {
        super('PatientDeleted', params.aggregateId, 1);
        this.patientId = params.patientId;
        this.firstName = params.firstName;
        this.lastName = params.lastName;
        this.organizationId = params.organizationId;
        this.clinicId = params.clinicId;
        this.deletedBy = params.deletedBy;
        this.reason = params.reason;
    }
}
exports.PatientDeleted = PatientDeleted;
//# sourceMappingURL=patient.events.js.map