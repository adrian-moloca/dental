"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_IMAGING_FINDINGS_GENERATED_EVENT_VERSION = exports.AI_IMAGING_FINDINGS_GENERATED_EVENT_TYPE = void 0;
exports.isAIImagingFindingsGeneratedEvent = isAIImagingFindingsGeneratedEvent;
exports.createAIImagingFindingsGeneratedEvent = createAIImagingFindingsGeneratedEvent;
exports.AI_IMAGING_FINDINGS_GENERATED_EVENT_TYPE = 'dental.ai.imaging.findings.generated';
exports.AI_IMAGING_FINDINGS_GENERATED_EVENT_VERSION = 1;
function isAIImagingFindingsGeneratedEvent(event) {
    return event.type === exports.AI_IMAGING_FINDINGS_GENERATED_EVENT_TYPE;
}
function createAIImagingFindingsGeneratedEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.AI_IMAGING_FINDINGS_GENERATED_EVENT_TYPE,
        version: exports.AI_IMAGING_FINDINGS_GENERATED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=ai-imaging-findings-generated.event.js.map