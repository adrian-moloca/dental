"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STERILIZATION_CYCLE_COMPLETED_EVENT_VERSION = exports.STERILIZATION_CYCLE_COMPLETED_EVENT_TYPE = void 0;
exports.isSterilizationCycleCompletedEvent = isSterilizationCycleCompletedEvent;
exports.createSterilizationCycleCompletedEvent = createSterilizationCycleCompletedEvent;
exports.STERILIZATION_CYCLE_COMPLETED_EVENT_TYPE = 'dental.sterilization.cycle.completed';
exports.STERILIZATION_CYCLE_COMPLETED_EVENT_VERSION = 1;
function isSterilizationCycleCompletedEvent(event) {
    return event.type === exports.STERILIZATION_CYCLE_COMPLETED_EVENT_TYPE;
}
function createSterilizationCycleCompletedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.STERILIZATION_CYCLE_COMPLETED_EVENT_TYPE,
        version: exports.STERILIZATION_CYCLE_COMPLETED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=cycle-completed.event.js.map