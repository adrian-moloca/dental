"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorrelationContextParam = exports.CausationId = exports.CorrelationId = void 0;
const common_1 = require("@nestjs/common");
const correlation_id_1 = require("../correlation-id");
exports.CorrelationId = (0, common_1.createParamDecorator)((_data, _ctx) => {
    return (0, correlation_id_1.getCorrelationId)();
});
exports.CausationId = (0, common_1.createParamDecorator)((_data, _ctx) => {
    return (0, correlation_id_1.getCausationId)();
});
exports.CorrelationContextParam = (0, common_1.createParamDecorator)((_data, _ctx) => {
    return (0, correlation_id_1.getCorrelationContext)();
});
//# sourceMappingURL=correlation-id.decorator.js.map