"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDeleted = exports.UserUpdated = exports.UserCreated = void 0;
const shared_domain_1 = require("../../../shared-domain/src");
class UserCreated extends shared_domain_1.DomainEvent {
    constructor(params) {
        super('UserCreated', params.aggregateId, 1);
        this.userId = params.userId;
        this.email = params.email;
        this.roles = params.roles;
        this.organizationId = params.organizationId;
        this.clinicId = params.clinicId;
    }
}
exports.UserCreated = UserCreated;
class UserUpdated extends shared_domain_1.DomainEvent {
    constructor(params) {
        super('UserUpdated', params.aggregateId, 1);
        this.userId = params.userId;
        this.email = params.email;
        this.roles = params.roles;
        this.organizationId = params.organizationId;
        this.clinicId = params.clinicId;
        this.updatedFields = params.updatedFields;
    }
}
exports.UserUpdated = UserUpdated;
class UserDeleted extends shared_domain_1.DomainEvent {
    constructor(params) {
        super('UserDeleted', params.aggregateId, 1);
        this.userId = params.userId;
        this.email = params.email;
        this.organizationId = params.organizationId;
        this.clinicId = params.clinicId;
        this.deletedBy = params.deletedBy;
        this.reason = params.reason;
    }
}
exports.UserDeleted = UserDeleted;
//# sourceMappingURL=user.events.js.map