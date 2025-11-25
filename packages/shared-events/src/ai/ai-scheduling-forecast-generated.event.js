"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_SCHEDULING_FORECAST_GENERATED_EVENT_VERSION = exports.AI_SCHEDULING_FORECAST_GENERATED_EVENT_TYPE = void 0;
exports.isAISchedulingForecastGeneratedEvent = isAISchedulingForecastGeneratedEvent;
exports.createAISchedulingForecastGeneratedEvent = createAISchedulingForecastGeneratedEvent;
exports.AI_SCHEDULING_FORECAST_GENERATED_EVENT_TYPE = 'dental.ai.scheduling.forecast.generated';
exports.AI_SCHEDULING_FORECAST_GENERATED_EVENT_VERSION = 1;
function isAISchedulingForecastGeneratedEvent(event) {
    return event.type === exports.AI_SCHEDULING_FORECAST_GENERATED_EVENT_TYPE;
}
function createAISchedulingForecastGeneratedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.AI_SCHEDULING_FORECAST_GENERATED_EVENT_TYPE,
        version: exports.AI_SCHEDULING_FORECAST_GENERATED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=ai-scheduling-forecast-generated.event.js.map