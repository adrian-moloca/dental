"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.correlationStorage = void 0;
exports.generateCorrelationId = generateCorrelationId;
exports.getCorrelationContext = getCorrelationContext;
exports.getCorrelationId = getCorrelationId;
exports.getCausationId = getCausationId;
exports.runWithCorrelationContext = runWithCorrelationContext;
exports.createCorrelationContext = createCorrelationContext;
exports.extractCorrelationId = extractCorrelationId;
exports.extractCausationId = extractCausationId;
exports.injectCorrelationId = injectCorrelationId;
exports.createCorrelationHeaders = createCorrelationHeaders;
const async_hooks_1 = require("async_hooks");
const uuid_1 = require("uuid");
const correlationStorage = new async_hooks_1.AsyncLocalStorage();
exports.correlationStorage = correlationStorage;
function generateCorrelationId() {
    return (0, uuid_1.v4)();
}
function getCorrelationContext() {
    return correlationStorage.getStore();
}
function getCorrelationId() {
    return correlationStorage.getStore()?.correlationId;
}
function getCausationId() {
    return correlationStorage.getStore()?.causationId;
}
function runWithCorrelationContext(context, callback) {
    return correlationStorage.run(context, callback);
}
function createCorrelationContext(options) {
    return {
        correlationId: options?.correlationId ?? generateCorrelationId(),
        causationId: options?.causationId,
        timestamp: new Date(),
        source: options?.source,
        metadata: options?.metadata,
    };
}
function extractCorrelationId(headers) {
    const headerValue = headers['x-correlation-id'] ??
        headers['X-Correlation-Id'] ??
        headers['x-request-id'] ??
        headers['X-Request-Id'];
    if (typeof headerValue === 'string' && headerValue.length > 0) {
        return headerValue;
    }
    if (Array.isArray(headerValue) && headerValue.length > 0) {
        return headerValue[0];
    }
    return generateCorrelationId();
}
function extractCausationId(headers) {
    const headerValue = headers['x-causation-id'] ?? headers['X-Causation-Id'];
    if (typeof headerValue === 'string' && headerValue.length > 0) {
        return headerValue;
    }
    if (Array.isArray(headerValue) && headerValue.length > 0) {
        return headerValue[0];
    }
    return undefined;
}
function injectCorrelationId(payload) {
    const context = getCorrelationContext();
    return {
        ...payload,
        correlationId: context?.correlationId ?? generateCorrelationId(),
        causationId: context?.causationId,
        timestamp: new Date(),
    };
}
function createCorrelationHeaders() {
    const context = getCorrelationContext();
    const headers = {};
    if (context?.correlationId) {
        headers['x-correlation-id'] = context.correlationId;
    }
    if (context?.causationId) {
        headers['x-causation-id'] = context.causationId;
    }
    return headers;
}
//# sourceMappingURL=correlation-id.js.map