"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_CHURN_SCORE_GENERATED_EVENT_VERSION = exports.AI_CHURN_SCORE_GENERATED_EVENT_TYPE = void 0;
exports.isAIChurnScoreGeneratedEvent = isAIChurnScoreGeneratedEvent;
exports.createAIChurnScoreGeneratedEvent = createAIChurnScoreGeneratedEvent;
exports.AI_CHURN_SCORE_GENERATED_EVENT_TYPE = 'dental.ai.churn.score.generated';
exports.AI_CHURN_SCORE_GENERATED_EVENT_VERSION = 1;
function isAIChurnScoreGeneratedEvent(event) {
    return event.type === exports.AI_CHURN_SCORE_GENERATED_EVENT_TYPE;
}
function createAIChurnScoreGeneratedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.AI_CHURN_SCORE_GENERATED_EVENT_TYPE,
        version: exports.AI_CHURN_SCORE_GENERATED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=ai-churn-score-generated.event.js.map