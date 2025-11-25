"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENTERPRISE_SETTINGS_UPDATED_EVENT_VERSION = exports.ENTERPRISE_SETTINGS_UPDATED_EVENT_TYPE = void 0;
exports.isEnterpriseSettingsUpdatedEvent = isEnterpriseSettingsUpdatedEvent;
exports.createEnterpriseSettingsUpdatedEvent = createEnterpriseSettingsUpdatedEvent;
exports.ENTERPRISE_SETTINGS_UPDATED_EVENT_TYPE = 'dental.enterprise.settings.updated';
exports.ENTERPRISE_SETTINGS_UPDATED_EVENT_VERSION = 1;
function isEnterpriseSettingsUpdatedEvent(event) {
    return event.type === exports.ENTERPRISE_SETTINGS_UPDATED_EVENT_TYPE;
}
function createEnterpriseSettingsUpdatedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.ENTERPRISE_SETTINGS_UPDATED_EVENT_TYPE,
        version: exports.ENTERPRISE_SETTINGS_UPDATED_EVENT_VERSION,
        payload,
        metadata,
        tenantContext,
        occurredAt: new Date(),
    };
}
//# sourceMappingURL=enterprise-settings-updated.event.js.map