"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicDeleted = exports.ClinicUpdated = exports.ClinicCreated = exports.TenantDeleted = exports.TenantUpdated = exports.TenantCreated = void 0;
const shared_domain_1 = require("../../../shared-domain/src");
class TenantCreated extends shared_domain_1.DomainEvent {
    constructor(params) {
        super('TenantCreated', params.aggregateId, 1);
        this.tenantId = params.tenantId;
        this.organizationId = params.organizationId;
        this.organizationName = params.organizationName;
        this.ownerId = params.ownerId;
    }
}
exports.TenantCreated = TenantCreated;
class TenantUpdated extends shared_domain_1.DomainEvent {
    constructor(params) {
        super('TenantUpdated', params.aggregateId, 1);
        this.tenantId = params.tenantId;
        this.organizationId = params.organizationId;
        this.organizationName = params.organizationName;
        this.updatedFields = params.updatedFields;
    }
}
exports.TenantUpdated = TenantUpdated;
class TenantDeleted extends shared_domain_1.DomainEvent {
    constructor(params) {
        super('TenantDeleted', params.aggregateId, 1);
        this.tenantId = params.tenantId;
        this.organizationId = params.organizationId;
        this.deletedBy = params.deletedBy;
        this.reason = params.reason;
    }
}
exports.TenantDeleted = TenantDeleted;
class ClinicCreated extends shared_domain_1.DomainEvent {
    constructor(params) {
        super('ClinicCreated', params.aggregateId, 1);
        this.clinicId = params.clinicId;
        this.organizationId = params.organizationId;
        this.clinicName = params.clinicName;
        this.address = params.address;
    }
}
exports.ClinicCreated = ClinicCreated;
class ClinicUpdated extends shared_domain_1.DomainEvent {
    constructor(params) {
        super('ClinicUpdated', params.aggregateId, 1);
        this.clinicId = params.clinicId;
        this.organizationId = params.organizationId;
        this.clinicName = params.clinicName;
        this.address = params.address;
        this.updatedFields = params.updatedFields;
    }
}
exports.ClinicUpdated = ClinicUpdated;
class ClinicDeleted extends shared_domain_1.DomainEvent {
    constructor(params) {
        super('ClinicDeleted', params.aggregateId, 1);
        this.clinicId = params.clinicId;
        this.organizationId = params.organizationId;
        this.deletedBy = params.deletedBy;
        this.reason = params.reason;
    }
}
exports.ClinicDeleted = ClinicDeleted;
//# sourceMappingURL=tenant.events.js.map