export interface LogContext {
    correlationId?: string;
    tenantId?: string;
    organizationId?: string;
    clinicId?: string;
    userId?: string;
    action?: string;
    resource?: string;
    [key: string]: any;
}
export interface StructuredLog {
    level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    message: string;
    timestamp: string;
    context?: LogContext;
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
}
export declare function maskPHI(data: any): any;
export declare function createStructuredLog(level: StructuredLog['level'], message: string, context?: LogContext, error?: Error): StructuredLog;
export declare class StructuredLogger {
    private readonly serviceName;
    private readonly defaultContext?;
    constructor(serviceName: string, defaultContext?: LogContext | undefined);
    private log;
    debug(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, error?: Error, context?: LogContext): void;
    fatal(message: string, error?: Error, context?: LogContext): void;
}
export declare function createLogger(serviceName: string, defaultContext?: LogContext): StructuredLogger;
