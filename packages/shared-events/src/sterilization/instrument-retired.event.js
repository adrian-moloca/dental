"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STERILIZATION_INSTRUMENT_RETIRED_EVENT_VERSION = exports.STERILIZATION_INSTRUMENT_RETIRED_EVENT_TYPE = void 0;
exports.isSterilizationInstrumentRetiredEvent = isSterilizationInstrumentRetiredEvent;
exports.createSterilizationInstrumentRetiredEvent = createSterilizationInstrumentRetiredEvent;
exports.STERILIZATION_INSTRUMENT_RETIRED_EVENT_TYPE = 'dental.sterilization.instrument.retired';
exports.STERILIZATION_INSTRUMENT_RETIRED_EVENT_VERSION = 1;
function isSterilizationInstrumentRetiredEvent(event) {
    return event.type === exports.STERILIZATION_INSTRUMENT_RETIRED_EVENT_TYPE;
}
function createSterilizationInstrumentRetiredEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.STERILIZATION_INSTRUMENT_RETIRED_EVENT_TYPE,
        version: exports.STERILIZATION_INSTRUMENT_RETIRED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=instrument-retired.event.js.map