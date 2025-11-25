"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabPriority = exports.LabCaseStatus = exports.LabType = void 0;
var LabType;
(function (LabType) {
    LabType["ALIGNER"] = "ALIGNER";
    LabType["CROWN_BRIDGE"] = "CROWN_BRIDGE";
    LabType["DENTURE"] = "DENTURE";
    LabType["IMPLANT"] = "IMPLANT";
    LabType["ORTHODONTIC"] = "ORTHODONTIC";
})(LabType || (exports.LabType = LabType = {}));
var LabCaseStatus;
(function (LabCaseStatus) {
    LabCaseStatus["SUBMITTED"] = "SUBMITTED";
    LabCaseStatus["RECEIVED"] = "RECEIVED";
    LabCaseStatus["IN_PRODUCTION"] = "IN_PRODUCTION";
    LabCaseStatus["QUALITY_CHECK"] = "QUALITY_CHECK";
    LabCaseStatus["SHIPPED"] = "SHIPPED";
    LabCaseStatus["DELIVERED"] = "DELIVERED";
    LabCaseStatus["COMPLETED"] = "COMPLETED";
    LabCaseStatus["REJECTED"] = "REJECTED";
    LabCaseStatus["CANCELED"] = "CANCELED";
})(LabCaseStatus || (exports.LabCaseStatus = LabCaseStatus = {}));
var LabPriority;
(function (LabPriority) {
    LabPriority["STANDARD"] = "STANDARD";
    LabPriority["RUSH"] = "RUSH";
    LabPriority["URGENT"] = "URGENT";
})(LabPriority || (exports.LabPriority = LabPriority = {}));
//# sourceMappingURL=lab-connector.interface.js.map