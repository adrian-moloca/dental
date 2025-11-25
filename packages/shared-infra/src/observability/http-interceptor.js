"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = exports.HttpLoggingInterceptor = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const uuid_1 = require("uuid");
const prometheus_metrics_1 = require("./prometheus-metrics");
const structured_logger_1 = require("./structured-logger");
let HttpLoggingInterceptor = class HttpLoggingInterceptor {
    constructor(metricsService) {
        this.metricsService = metricsService;
    }
    intercept(context, next) {
        if (context.getType() !== 'http') {
            return next.handle();
        }
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const correlationId = request.headers['x-correlation-id'] || (0, uuid_1.v4)();
        request.correlationId = correlationId;
        response.setHeader('x-correlation-id', correlationId);
        const tenantId = request.headers['x-tenant-id'] || request.user?.tenantId;
        const organizationId = request.headers['x-organization-id'] || request.user?.organizationId;
        const clinicId = request.headers['x-clinic-id'] || request.user?.clinicId;
        const startTime = Date.now();
        const method = request.method;
        const url = request.url;
        const route = this.getRoutePath(context);
        const structuredLogger = new structured_logger_1.StructuredLogger('HTTP');
        structuredLogger.setContext({
            correlationId,
            tenantId,
            organizationId,
            clinicId,
            requestId: correlationId,
        });
        structuredLogger.log('Incoming request', {
            method,
            url,
            route,
            userAgent: request.headers['user-agent'],
            ip: request.ip,
        });
        return next.handle().pipe((0, operators_1.tap)(() => {
            const duration = Date.now() - startTime;
            const statusCode = response.statusCode;
            structuredLogger.log('Request completed', {
                method,
                url,
                route,
                statusCode,
                durationMs: duration,
            });
            if (this.metricsService) {
                this.metricsService.recordHttpRequest(method, route, statusCode, duration, tenantId);
            }
        }), (0, operators_1.catchError)((error) => {
            const duration = Date.now() - startTime;
            const statusCode = error.status || 500;
            structuredLogger.error('Request failed', error, {
                method,
                url,
                route,
                statusCode,
                durationMs: duration,
            });
            if (this.metricsService) {
                this.metricsService.recordHttpRequest(method, route, statusCode, duration, tenantId);
            }
            throw error;
        }));
    }
    getRoutePath(context) {
        const request = context.switchToHttp().getRequest();
        if (request.route?.path) {
            return request.route.path;
        }
        const url = request.url?.split('?')[0] || 'unknown';
        return url;
    }
};
exports.HttpLoggingInterceptor = HttpLoggingInterceptor;
exports.HttpLoggingInterceptor = HttpLoggingInterceptor = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prometheus_metrics_1.PrometheusMetricsService])
], HttpLoggingInterceptor);
let AuditInterceptor = class AuditInterceptor {
    constructor() {
        this.logger = new structured_logger_1.StructuredLogger('Audit');
    }
    intercept(context, next) {
        if (context.getType() !== 'http') {
            return next.handle();
        }
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            return next.handle();
        }
        const tenantId = request.headers['x-tenant-id'] || request.user?.tenantId;
        const userId = request.user?.userId || request.user?.sub;
        const deviceId = request.headers['x-device-id'] || request.user?.deviceId;
        const route = request.route?.path || request.url;
        this.logger.setContext({
            tenantId,
            userId,
            deviceId,
            correlationId: request.correlationId,
        });
        return next.handle().pipe((0, operators_1.tap)((result) => {
            this.logger.audit(method, route, {
                result: result ? 'success' : 'no_content',
                resourceId: result?.id || result?._id || request.params?.id,
            });
        }), (0, operators_1.catchError)((error) => {
            this.logger.audit(method, route, {
                result: 'error',
                errorType: error.name,
                statusCode: error.status || 500,
            });
            throw error;
        }));
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AuditInterceptor);
//# sourceMappingURL=http-interceptor.js.map