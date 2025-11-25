"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationEventType = exports.AuditEventType = exports.EntityEventType = exports.DomainEventCategory = void 0;
var DomainEventCategory;
(function (DomainEventCategory) {
    DomainEventCategory["LIFECYCLE"] = "LIFECYCLE";
    DomainEventCategory["BUSINESS_PROCESS"] = "BUSINESS_PROCESS";
    DomainEventCategory["INTEGRATION"] = "INTEGRATION";
    DomainEventCategory["SYSTEM"] = "SYSTEM";
    DomainEventCategory["AUDIT"] = "AUDIT";
    DomainEventCategory["NOTIFICATION"] = "NOTIFICATION";
})(DomainEventCategory || (exports.DomainEventCategory = DomainEventCategory = {}));
var EntityEventType;
(function (EntityEventType) {
    EntityEventType["CREATED"] = "ENTITY_CREATED";
    EntityEventType["UPDATED"] = "ENTITY_UPDATED";
    EntityEventType["DELETED"] = "ENTITY_DELETED";
    EntityEventType["RESTORED"] = "ENTITY_RESTORED";
    EntityEventType["ARCHIVED"] = "ENTITY_ARCHIVED";
})(EntityEventType || (exports.EntityEventType = EntityEventType = {}));
var AuditEventType;
(function (AuditEventType) {
    AuditEventType["ACCESS_GRANTED"] = "ACCESS_GRANTED";
    AuditEventType["ACCESS_DENIED"] = "ACCESS_DENIED";
    AuditEventType["PERMISSION_CHANGED"] = "PERMISSION_CHANGED";
    AuditEventType["DATA_EXPORTED"] = "DATA_EXPORTED";
    AuditEventType["DATA_IMPORTED"] = "DATA_IMPORTED";
    AuditEventType["SENSITIVE_DATA_ACCESSED"] = "SENSITIVE_DATA_ACCESSED";
    AuditEventType["COMPLIANCE_VIOLATION"] = "COMPLIANCE_VIOLATION";
})(AuditEventType || (exports.AuditEventType = AuditEventType = {}));
var IntegrationEventType;
(function (IntegrationEventType) {
    IntegrationEventType["EXTERNAL_SERVICE_CALLED"] = "EXTERNAL_SERVICE_CALLED";
    IntegrationEventType["EXTERNAL_SERVICE_FAILED"] = "EXTERNAL_SERVICE_FAILED";
    IntegrationEventType["WEBHOOK_RECEIVED"] = "WEBHOOK_RECEIVED";
    IntegrationEventType["MESSAGE_PUBLISHED"] = "MESSAGE_PUBLISHED";
    IntegrationEventType["MESSAGE_CONSUMED"] = "MESSAGE_CONSUMED";
})(IntegrationEventType || (exports.IntegrationEventType = IntegrationEventType = {}));
//# sourceMappingURL=event-types.js.map