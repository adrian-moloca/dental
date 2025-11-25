import { LoggerService } from '@nestjs/common';
export interface LogContext {
    correlationId?: string;
    tenantId?: string;
    organizationId?: string;
    clinicId?: string;
    userId?: string;
    deviceId?: string;
    requestId?: string;
    [key: string]: any;
}
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug"
}
export declare class StructuredLogger implements LoggerService {
    private context;
    private readonly serviceName;
    constructor(serviceName?: string);
    setContext(context: Partial<LogContext>): void;
    ensureCorrelationId(): string;
    log(message: string, data?: Record<string, any>): void;
    error(message: string, error?: Error, data?: Record<string, any>): void;
    warn(message: string, data?: Record<string, any>): void;
    debug(message: string, data?: Record<string, any>): void;
    verbose(message: string, data?: Record<string, any>): void;
    child(additionalContext: Partial<LogContext>): StructuredLogger;
    private write;
    private sanitizeLogEntry;
    audit(action: string, resource: string, data?: Record<string, any>): void;
    measureTime<T>(operation: string, fn: () => Promise<T>, data?: Record<string, any>): Promise<T>;
}
export declare class LoggerFactory {
    static create(serviceName: string, initialContext?: Partial<LogContext>): StructuredLogger;
}
