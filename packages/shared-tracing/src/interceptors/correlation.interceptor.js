"use strict";
var CorrelationInterceptor_1, LoggingInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = exports.CorrelationInterceptor = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const correlation_id_1 = require("../correlation-id");
const types_1 = require("../types");
let CorrelationInterceptor = CorrelationInterceptor_1 = class CorrelationInterceptor {
    constructor() {
        this.logger = new common_1.Logger(CorrelationInterceptor_1.name);
    }
    intercept(context, next) {
        const startTime = Date.now();
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const correlationContext = (0, correlation_id_1.getCorrelationContext)();
        if (correlationContext) {
            response.setHeader(types_1.CORRELATION_ID_HEADER, correlationContext.correlationId);
            if (correlationContext.causationId) {
                response.setHeader(types_1.CAUSATION_ID_HEADER, correlationContext.causationId);
            }
        }
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                const duration = Date.now() - startTime;
                this.logger.debug(`Request completed: ${request.method} ${request.url}`, {
                    correlationId: correlationContext?.correlationId,
                    causationId: correlationContext?.causationId,
                    method: request.method,
                    url: request.url,
                    statusCode: response.statusCode,
                    duration_ms: duration,
                });
            },
            error: (error) => {
                const duration = Date.now() - startTime;
                this.logger.error(`Request failed: ${request.method} ${request.url}`, {
                    correlationId: correlationContext?.correlationId,
                    causationId: correlationContext?.causationId,
                    method: request.method,
                    url: request.url,
                    error: error.message,
                    duration_ms: duration,
                });
            },
        }));
    }
};
exports.CorrelationInterceptor = CorrelationInterceptor;
exports.CorrelationInterceptor = CorrelationInterceptor = CorrelationInterceptor_1 = tslib_1.__decorate([
    (0, common_1.Injectable)()
], CorrelationInterceptor);
let LoggingInterceptor = LoggingInterceptor_1 = class LoggingInterceptor {
    constructor() {
        this.logger = new common_1.Logger(LoggingInterceptor_1.name);
    }
    intercept(context, next) {
        const startTime = Date.now();
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const correlationContext = (0, correlation_id_1.getCorrelationContext)();
        const logContext = {
            correlationId: correlationContext?.correlationId,
            causationId: correlationContext?.causationId,
            method: request.method,
            url: request.url,
            userAgent: request.get('user-agent'),
            ip: request.ip,
        };
        this.logger.log(`Incoming request: ${request.method} ${request.url}`, logContext);
        return next.handle().pipe((0, operators_1.tap)({
            next: (_data) => {
                const duration = Date.now() - startTime;
                this.logger.log(`Request successful: ${request.method} ${request.url}`, {
                    ...logContext,
                    statusCode: response.statusCode,
                    duration_ms: duration,
                });
            },
            error: (error) => {
                const duration = Date.now() - startTime;
                this.logger.error(`Request failed: ${request.method} ${request.url} - ${error.message}`, {
                    ...logContext,
                    error: error.message,
                    stack: error.stack,
                    duration_ms: duration,
                });
            },
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = LoggingInterceptor_1 = tslib_1.__decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=correlation.interceptor.js.map