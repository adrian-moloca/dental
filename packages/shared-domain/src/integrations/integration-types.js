"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationStatus = exports.ProviderStatus = exports.IntegrationType = void 0;
var IntegrationType;
(function (IntegrationType) {
    IntegrationType["SMS"] = "SMS";
    IntegrationType["EMAIL"] = "EMAIL";
    IntegrationType["PAYMENT"] = "PAYMENT";
    IntegrationType["WHATSAPP"] = "WHATSAPP";
    IntegrationType["DICOM"] = "DICOM";
    IntegrationType["LAB"] = "LAB";
    IntegrationType["E_FACTURA"] = "E_FACTURA";
    IntegrationType["WEBHOOK"] = "WEBHOOK";
})(IntegrationType || (exports.IntegrationType = IntegrationType = {}));
var ProviderStatus;
(function (ProviderStatus) {
    ProviderStatus["ACTIVE"] = "ACTIVE";
    ProviderStatus["INACTIVE"] = "INACTIVE";
    ProviderStatus["FAILED"] = "FAILED";
    ProviderStatus["MAINTENANCE"] = "MAINTENANCE";
})(ProviderStatus || (exports.ProviderStatus = ProviderStatus = {}));
var IntegrationStatus;
(function (IntegrationStatus) {
    IntegrationStatus["PENDING"] = "PENDING";
    IntegrationStatus["PROCESSING"] = "PROCESSING";
    IntegrationStatus["COMPLETED"] = "COMPLETED";
    IntegrationStatus["FAILED"] = "FAILED";
    IntegrationStatus["RETRYING"] = "RETRYING";
})(IntegrationStatus || (exports.IntegrationStatus = IntegrationStatus = {}));
//# sourceMappingURL=integration-types.js.map