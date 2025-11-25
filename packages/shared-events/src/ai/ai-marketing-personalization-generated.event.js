"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_MARKETING_PERSONALIZATION_GENERATED_EVENT_VERSION = exports.AI_MARKETING_PERSONALIZATION_GENERATED_EVENT_TYPE = void 0;
exports.isAIMarketingPersonalizationGeneratedEvent = isAIMarketingPersonalizationGeneratedEvent;
exports.createAIMarketingPersonalizationGeneratedEvent = createAIMarketingPersonalizationGeneratedEvent;
exports.AI_MARKETING_PERSONALIZATION_GENERATED_EVENT_TYPE = 'dental.ai.marketing.personalization.generated';
exports.AI_MARKETING_PERSONALIZATION_GENERATED_EVENT_VERSION = 1;
function isAIMarketingPersonalizationGeneratedEvent(event) {
    return event.type === exports.AI_MARKETING_PERSONALIZATION_GENERATED_EVENT_TYPE;
}
function createAIMarketingPersonalizationGeneratedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.AI_MARKETING_PERSONALIZATION_GENERATED_EVENT_TYPE,
        version: exports.AI_MARKETING_PERSONALIZATION_GENERATED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=ai-marketing-personalization-generated.event.js.map