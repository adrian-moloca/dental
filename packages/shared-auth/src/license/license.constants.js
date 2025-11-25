"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_MODULES = exports.PREMIUM_MODULES = exports.CORE_MODULES = exports.WRITE_METHODS = exports.READ_METHODS = exports.GRACE_PERIOD_DAYS = void 0;
const jwt_payload_types_1 = require("../jwt/jwt-payload.types");
exports.GRACE_PERIOD_DAYS = 7;
exports.READ_METHODS = ['GET', 'HEAD', 'OPTIONS'];
exports.WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
exports.CORE_MODULES = Object.freeze([
    jwt_payload_types_1.ModuleCode.SCHEDULING,
    jwt_payload_types_1.ModuleCode.PATIENT_MANAGEMENT,
    jwt_payload_types_1.ModuleCode.CLINICAL_BASIC,
    jwt_payload_types_1.ModuleCode.BILLING_BASIC,
]);
exports.PREMIUM_MODULES = Object.freeze([
    jwt_payload_types_1.ModuleCode.CLINICAL_ADVANCED,
    jwt_payload_types_1.ModuleCode.IMAGING,
    jwt_payload_types_1.ModuleCode.INVENTORY,
    jwt_payload_types_1.ModuleCode.MARKETING,
    jwt_payload_types_1.ModuleCode.INSURANCE,
    jwt_payload_types_1.ModuleCode.TELEDENTISTRY,
    jwt_payload_types_1.ModuleCode.ANALYTICS_ADVANCED,
    jwt_payload_types_1.ModuleCode.MULTI_LOCATION,
]);
exports.ALL_MODULES = Object.freeze([
    ...exports.CORE_MODULES,
    ...exports.PREMIUM_MODULES,
]);
//# sourceMappingURL=license.constants.js.map