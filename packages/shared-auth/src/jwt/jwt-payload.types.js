"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleCode = exports.SubscriptionStatus = void 0;
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["TRIAL"] = "TRIAL";
    SubscriptionStatus["ACTIVE"] = "ACTIVE";
    SubscriptionStatus["EXPIRED"] = "EXPIRED";
    SubscriptionStatus["SUSPENDED"] = "SUSPENDED";
    SubscriptionStatus["CANCELLED"] = "CANCELLED";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
var ModuleCode;
(function (ModuleCode) {
    ModuleCode["SCHEDULING"] = "scheduling";
    ModuleCode["PATIENT_MANAGEMENT"] = "patient_management";
    ModuleCode["CLINICAL_BASIC"] = "clinical_basic";
    ModuleCode["BILLING_BASIC"] = "billing_basic";
    ModuleCode["CLINICAL_ADVANCED"] = "clinical_advanced";
    ModuleCode["IMAGING"] = "imaging";
    ModuleCode["INVENTORY"] = "inventory";
    ModuleCode["MARKETING"] = "marketing";
    ModuleCode["INSURANCE"] = "insurance";
    ModuleCode["TELEDENTISTRY"] = "teledentistry";
    ModuleCode["ANALYTICS_ADVANCED"] = "analytics_advanced";
    ModuleCode["MULTI_LOCATION"] = "multi_location";
})(ModuleCode || (exports.ModuleCode = ModuleCode = {}));
//# sourceMappingURL=jwt-payload.types.js.map