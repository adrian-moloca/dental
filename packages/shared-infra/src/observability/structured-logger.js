"use strict";
var StructuredLogger_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerFactory = exports.StructuredLogger = exports.LogLevel = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
let StructuredLogger = StructuredLogger_1 = class StructuredLogger {
    constructor(serviceName = 'DentalOS') {
        this.context = {};
        this.serviceName = serviceName;
    }
    setContext(context) {
        this.context = { ...this.context, ...context };
    }
    ensureCorrelationId() {
        if (!this.context.correlationId) {
            this.context.correlationId = (0, uuid_1.v4)();
        }
        return this.context.correlationId || '';
    }
    log(message, data) {
        this.write(LogLevel.INFO, message, data);
    }
    error(message, error, data) {
        const errorData = error
            ? {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                },
                ...data,
            }
            : data;
        this.write(LogLevel.ERROR, message, errorData);
    }
    warn(message, data) {
        this.write(LogLevel.WARN, message, data);
    }
    debug(message, data) {
        if (process.env.NODE_ENV !== 'production') {
            this.write(LogLevel.DEBUG, message, data);
        }
    }
    verbose(message, data) {
        this.debug(message, data);
    }
    child(additionalContext) {
        const childLogger = new StructuredLogger_1(this.serviceName);
        childLogger.setContext({ ...this.context, ...additionalContext });
        return childLogger;
    }
    write(level, message, data) {
        const logEntry = {
            level,
            service: this.serviceName,
            message,
            timestamp: new Date().toISOString(),
            ...this.context,
            ...data,
        };
        this.sanitizeLogEntry(logEntry);
        const output = JSON.stringify(logEntry);
        switch (level) {
            case LogLevel.ERROR:
                console.error(output);
                break;
            case LogLevel.WARN:
                console.warn(output);
                break;
            case LogLevel.DEBUG:
                console.debug(output);
                break;
            default:
                console.log(output);
        }
    }
    sanitizeLogEntry(entry) {
        const sensitiveFields = [
            'password',
            'token',
            'accessToken',
            'refreshToken',
            'secret',
            'apiKey',
            'authorization',
            'cookie',
            'encryptionKey',
        ];
        for (const field of sensitiveFields) {
            if (entry[field]) {
                entry[field] = '[REDACTED]';
            }
        }
        for (const key in entry) {
            if (typeof entry[key] === 'object' && entry[key] !== null && !Array.isArray(entry[key])) {
                this.sanitizeLogEntry(entry[key]);
            }
        }
    }
    audit(action, resource, data) {
        const auditEntry = {
            level: 'audit',
            service: this.serviceName,
            action,
            resource,
            timestamp: new Date().toISOString(),
            ...this.context,
            ...data,
        };
        this.sanitizeLogEntry(auditEntry);
        console.log(JSON.stringify(auditEntry));
    }
    async measureTime(operation, fn, data) {
        const startTime = Date.now();
        try {
            const result = await fn();
            const duration = Date.now() - startTime;
            this.log(`${operation} completed`, { ...data, durationMs: duration });
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.error(`${operation} failed`, error, { ...data, durationMs: duration });
            throw error;
        }
    }
};
exports.StructuredLogger = StructuredLogger;
exports.StructuredLogger = StructuredLogger = StructuredLogger_1 = tslib_1.__decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.TRANSIENT }),
    tslib_1.__metadata("design:paramtypes", [String])
], StructuredLogger);
class LoggerFactory {
    static create(serviceName, initialContext) {
        const logger = new StructuredLogger(serviceName);
        if (initialContext) {
            logger.setContext(initialContext);
        }
        return logger;
    }
}
exports.LoggerFactory = LoggerFactory;
//# sourceMappingURL=structured-logger.js.map