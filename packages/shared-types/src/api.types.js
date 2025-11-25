"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthStatus = exports.ErrorCode = exports.ErrorSeverity = exports.ApiResponseStatus = void 0;
var ApiResponseStatus;
(function (ApiResponseStatus) {
    ApiResponseStatus["SUCCESS"] = "SUCCESS";
    ApiResponseStatus["ERROR"] = "ERROR";
    ApiResponseStatus["PARTIAL"] = "PARTIAL";
})(ApiResponseStatus || (exports.ApiResponseStatus = ApiResponseStatus = {}));
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "LOW";
    ErrorSeverity["MEDIUM"] = "MEDIUM";
    ErrorSeverity["HIGH"] = "HIGH";
    ErrorSeverity["CRITICAL"] = "CRITICAL";
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["BAD_REQUEST"] = "BAD_REQUEST";
    ErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ErrorCode["CONFLICT"] = "CONFLICT";
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    ErrorCode["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
    ErrorCode["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
    ErrorCode["DATABASE_ERROR"] = "DATABASE_ERROR";
    ErrorCode["EXTERNAL_SERVICE_ERROR"] = "EXTERNAL_SERVICE_ERROR";
    ErrorCode["INSUFFICIENT_PERMISSIONS"] = "INSUFFICIENT_PERMISSIONS";
    ErrorCode["RESOURCE_LOCKED"] = "RESOURCE_LOCKED";
    ErrorCode["OPERATION_NOT_ALLOWED"] = "OPERATION_NOT_ALLOWED";
    ErrorCode["DUPLICATE_ENTRY"] = "DUPLICATE_ENTRY";
    ErrorCode["DEPENDENCY_ERROR"] = "DEPENDENCY_ERROR";
    ErrorCode["TENANT_NOT_FOUND"] = "TENANT_NOT_FOUND";
    ErrorCode["TENANT_MISMATCH"] = "TENANT_MISMATCH";
    ErrorCode["CROSS_TENANT_ACCESS_DENIED"] = "CROSS_TENANT_ACCESS_DENIED";
    ErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
var HealthStatus;
(function (HealthStatus) {
    HealthStatus["HEALTHY"] = "HEALTHY";
    HealthStatus["DEGRADED"] = "DEGRADED";
    HealthStatus["UNHEALTHY"] = "UNHEALTHY";
})(HealthStatus || (exports.HealthStatus = HealthStatus = {}));
//# sourceMappingURL=api.types.js.map