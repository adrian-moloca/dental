"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_PREDICTION_GENERATED_EVENT_VERSION = exports.AI_PREDICTION_GENERATED_EVENT_TYPE = void 0;
exports.isAIPredictionGeneratedEvent = isAIPredictionGeneratedEvent;
exports.createAIPredictionGeneratedEvent = createAIPredictionGeneratedEvent;
exports.AI_PREDICTION_GENERATED_EVENT_TYPE = 'dental.ai.prediction.generated';
exports.AI_PREDICTION_GENERATED_EVENT_VERSION = 1;
function isAIPredictionGeneratedEvent(event) {
    return event.type === exports.AI_PREDICTION_GENERATED_EVENT_TYPE;
}
function createAIPredictionGeneratedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.AI_PREDICTION_GENERATED_EVENT_TYPE,
        version: exports.AI_PREDICTION_GENERATED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=ai-prediction-generated.event.js.map