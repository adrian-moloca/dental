"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENTERPRISE_ORGANIZATION_CREATED_EVENT_VERSION = exports.ENTERPRISE_ORGANIZATION_CREATED_EVENT_TYPE = void 0;
exports.isEnterpriseOrganizationCreatedEvent = isEnterpriseOrganizationCreatedEvent;
exports.createEnterpriseOrganizationCreatedEvent = createEnterpriseOrganizationCreatedEvent;
exports.ENTERPRISE_ORGANIZATION_CREATED_EVENT_TYPE = 'dental.enterprise.organization.created';
exports.ENTERPRISE_ORGANIZATION_CREATED_EVENT_VERSION = 1;
function isEnterpriseOrganizationCreatedEvent(event) {
    return event.type === exports.ENTERPRISE_ORGANIZATION_CREATED_EVENT_TYPE;
}
function createEnterpriseOrganizationCreatedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.ENTERPRISE_ORGANIZATION_CREATED_EVENT_TYPE,
        version: exports.ENTERPRISE_ORGANIZATION_CREATED_EVENT_VERSION,
        payload,
        metadata,
        tenantContext,
        occurredAt: new Date(),
    };
}
//# sourceMappingURL=organization-created.event.js.map