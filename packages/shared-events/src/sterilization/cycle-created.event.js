"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STERILIZATION_CYCLE_CREATED_EVENT_VERSION = exports.STERILIZATION_CYCLE_CREATED_EVENT_TYPE = void 0;
exports.isSterilizationCycleCreatedEvent = isSterilizationCycleCreatedEvent;
exports.createSterilizationCycleCreatedEvent = createSterilizationCycleCreatedEvent;
exports.STERILIZATION_CYCLE_CREATED_EVENT_TYPE = 'dental.sterilization.cycle.created';
exports.STERILIZATION_CYCLE_CREATED_EVENT_VERSION = 1;
function isSterilizationCycleCreatedEvent(event) {
    return event.type === exports.STERILIZATION_CYCLE_CREATED_EVENT_TYPE;
}
function createSterilizationCycleCreatedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.STERILIZATION_CYCLE_CREATED_EVENT_TYPE,
        version: exports.STERILIZATION_CYCLE_CREATED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=cycle-created.event.js.map