"use strict";
var CorrelationMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorrelationMiddleware = void 0;
exports.createCorrelationMiddleware = createCorrelationMiddleware;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const correlation_id_1 = require("../correlation-id");
const types_1 = require("../types");
let CorrelationMiddleware = CorrelationMiddleware_1 = class CorrelationMiddleware {
    constructor(config) {
        this.logger = new common_1.Logger(CorrelationMiddleware_1.name);
        this.config = {
            serviceName: process.env.SERVICE_NAME || 'unknown-service',
            serviceVersion: process.env.SERVICE_VERSION || '1.0.0',
            enableLogging: true,
            includeInResponse: true,
            ...config,
        };
    }
    use(req, res, next) {
        const correlationId = (0, correlation_id_1.extractCorrelationId)(req.headers);
        const causationId = (0, correlation_id_1.extractCausationId)(req.headers);
        const context = (0, correlation_id_1.createCorrelationContext)({
            correlationId,
            causationId,
            source: {
                service: this.config.serviceName,
                version: this.config.serviceVersion,
            },
            metadata: {
                method: req.method,
                path: req.path,
                userAgent: req.get('user-agent'),
            },
        });
        if (this.config.includeInResponse) {
            res.setHeader(types_1.CORRELATION_ID_HEADER, correlationId);
            if (causationId) {
                res.setHeader(types_1.CAUSATION_ID_HEADER, causationId);
            }
        }
        if (this.config.enableLogging) {
            this.logger.debug(`Request ${req.method} ${req.path} - Correlation ID: ${correlationId}`, { correlationId, causationId, method: req.method, path: req.path });
        }
        (0, correlation_id_1.runWithCorrelationContext)(context, () => {
            next();
        });
    }
};
exports.CorrelationMiddleware = CorrelationMiddleware;
exports.CorrelationMiddleware = CorrelationMiddleware = CorrelationMiddleware_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [Object])
], CorrelationMiddleware);
function createCorrelationMiddleware(config) {
    return new CorrelationMiddleware(config);
}
//# sourceMappingURL=correlation.middleware.js.map