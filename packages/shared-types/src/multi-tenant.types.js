"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantIsolationPolicy = exports.TenantType = void 0;
var TenantType;
(function (TenantType) {
    TenantType["ORGANIZATION"] = "ORGANIZATION";
    TenantType["CLINIC"] = "CLINIC";
})(TenantType || (exports.TenantType = TenantType = {}));
var TenantIsolationPolicy;
(function (TenantIsolationPolicy) {
    TenantIsolationPolicy["STRICT"] = "STRICT";
    TenantIsolationPolicy["RELAXED"] = "RELAXED";
    TenantIsolationPolicy["SHARED"] = "SHARED";
})(TenantIsolationPolicy || (exports.TenantIsolationPolicy = TenantIsolationPolicy = {}));
//# sourceMappingURL=multi-tenant.types.js.map