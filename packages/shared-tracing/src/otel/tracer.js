"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openTelemetryApi = void 0;
exports.initializeTracer = initializeTracer;
exports.shutdownTracer = shutdownTracer;
exports.startSpan = startSpan;
exports.endSpan = endSpan;
exports.addSpanAttributes = addSpanAttributes;
exports.setSpanStatus = setSpanStatus;
exports.recordSpanError = recordSpanError;
exports.withSpan = withSpan;
exports.getActiveSpan = getActiveSpan;
exports.startChildSpan = startChildSpan;
const sdk_node_1 = require("@opentelemetry/sdk-node");
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
const exporter_jaeger_1 = require("@opentelemetry/exporter-jaeger");
const exporter_zipkin_1 = require("@opentelemetry/exporter-zipkin");
const resources_1 = require("@opentelemetry/resources");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
const api = require("@opentelemetry/api");
exports.openTelemetryApi = api;
const correlation_id_1 = require("../correlation-id");
let sdk = null;
let tracer = null;
function initializeTracer(config) {
    if (!config.enabled) {
        console.log('OpenTelemetry tracing is disabled');
        return;
    }
    let exporter;
    if (config.exporter?.type === 'jaeger') {
        exporter = new exporter_jaeger_1.JaegerExporter({
            endpoint: config.exporter.endpoint || 'http://localhost:14268/api/traces',
        });
    }
    else if (config.exporter?.type === 'zipkin') {
        exporter = new exporter_zipkin_1.ZipkinExporter({
            url: config.exporter.endpoint || 'http://localhost:9411/api/v2/spans',
        });
    }
    const resource = resources_1.Resource.default().merge(new resources_1.Resource({
        [semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME]: config.serviceName,
        [semantic_conventions_1.SemanticResourceAttributes.SERVICE_VERSION]: config.serviceVersion,
        [semantic_conventions_1.SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.environment,
    }));
    sdk = new sdk_node_1.NodeSDK({
        resource,
        traceExporter: exporter,
        instrumentations: [
            (0, auto_instrumentations_node_1.getNodeAutoInstrumentations)({
                '@opentelemetry/instrumentation-fs': {
                    enabled: false,
                },
            }),
        ],
    });
    sdk.start();
    tracer = api.trace.getTracer(config.serviceName, config.serviceVersion);
    console.log(`OpenTelemetry initialized for ${config.serviceName} v${config.serviceVersion}`);
}
async function shutdownTracer() {
    if (sdk) {
        await sdk.shutdown();
        console.log('OpenTelemetry SDK shut down successfully');
    }
}
function startSpan(name, attributes) {
    if (!tracer) {
        return null;
    }
    const context = (0, correlation_id_1.getCorrelationContext)();
    const spanAttributes = {
        ...attributes,
    };
    if (context?.correlationId) {
        spanAttributes['correlation.id'] = context.correlationId;
    }
    if (context?.causationId) {
        spanAttributes['causation.id'] = context.causationId;
    }
    if (context?.source?.service) {
        spanAttributes['source.service'] = context.source.service;
    }
    return tracer.startSpan(name, { attributes: spanAttributes });
}
function endSpan(span) {
    if (span) {
        span.end();
    }
}
function addSpanAttributes(span, attributes) {
    if (span) {
        span.setAttributes(attributes);
    }
}
function setSpanStatus(span, status, message) {
    if (span) {
        span.setStatus({ code: status, message });
    }
}
function recordSpanError(span, error) {
    if (span) {
        span.recordException(error);
        span.setStatus({
            code: api.SpanStatusCode.ERROR,
            message: error.message,
        });
    }
}
async function withSpan(name, fn, attributes) {
    const span = startSpan(name, attributes);
    try {
        const result = await fn(span);
        setSpanStatus(span, api.SpanStatusCode.OK);
        return result;
    }
    catch (error) {
        recordSpanError(span, error);
        throw error;
    }
    finally {
        endSpan(span);
    }
}
function getActiveSpan() {
    return api.trace.getActiveSpan();
}
function startChildSpan(name, attributes) {
    if (!tracer) {
        return null;
    }
    const context = (0, correlation_id_1.getCorrelationContext)();
    const activeSpan = getActiveSpan();
    const spanAttributes = {
        ...attributes,
    };
    if (context?.correlationId) {
        spanAttributes['correlation.id'] = context.correlationId;
    }
    const ctx = activeSpan
        ? api.trace.setSpan(api.context.active(), activeSpan)
        : api.context.active();
    return tracer.startSpan(name, { attributes: spanAttributes }, ctx);
}
//# sourceMappingURL=tracer.js.map