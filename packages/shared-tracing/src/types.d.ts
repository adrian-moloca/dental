export interface CorrelationContext {
    correlationId: string;
    causationId?: string;
    timestamp: Date;
    source?: {
        service: string;
        version: string;
    };
    metadata?: Record<string, unknown>;
}
export interface TracerConfig {
    enabled: boolean;
    serviceName: string;
    serviceVersion: string;
    environment: string;
    exporter?: {
        type: 'jaeger' | 'zipkin' | 'otlp';
        endpoint?: string;
    };
    sampling?: {
        alwaysSampleErrors: boolean;
        successSampleRate: number;
    };
}
export interface SpanAttributes {
    [key: string]: string | number | boolean | undefined;
}
export declare const CORRELATION_ID_HEADER = "x-correlation-id";
export declare const CAUSATION_ID_HEADER = "x-causation-id";
export declare const REQUEST_ID_HEADER = "x-request-id";
export interface EventCorrelationMetadata {
    correlationId: string;
    causationId?: string;
    timestamp: Date;
    source: {
        service: string;
        version: string;
    };
}
