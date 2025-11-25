"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicalLogisticsTaskStatus = exports.ClinicalLogisticsTaskType = exports.LabCaseType = exports.LabCaseStatus = exports.InstrumentType = exports.InstrumentStatus = exports.BiologicalIndicatorResult = exports.SterilizationCycleType = exports.SterilizationCycleStatus = void 0;
var SterilizationCycleStatus;
(function (SterilizationCycleStatus) {
    SterilizationCycleStatus["PENDING"] = "PENDING";
    SterilizationCycleStatus["RUNNING"] = "RUNNING";
    SterilizationCycleStatus["PASSED"] = "PASSED";
    SterilizationCycleStatus["FAILED"] = "FAILED";
    SterilizationCycleStatus["CANCELLED"] = "CANCELLED";
})(SterilizationCycleStatus || (exports.SterilizationCycleStatus = SterilizationCycleStatus = {}));
var SterilizationCycleType;
(function (SterilizationCycleType) {
    SterilizationCycleType["STEAM"] = "STEAM";
    SterilizationCycleType["DRY_HEAT"] = "DRY_HEAT";
    SterilizationCycleType["CHEMICAL"] = "CHEMICAL";
    SterilizationCycleType["PLASMA"] = "PLASMA";
})(SterilizationCycleType || (exports.SterilizationCycleType = SterilizationCycleType = {}));
var BiologicalIndicatorResult;
(function (BiologicalIndicatorResult) {
    BiologicalIndicatorResult["PASS"] = "PASS";
    BiologicalIndicatorResult["FAIL"] = "FAIL";
    BiologicalIndicatorResult["PENDING"] = "PENDING";
})(BiologicalIndicatorResult || (exports.BiologicalIndicatorResult = BiologicalIndicatorResult = {}));
var InstrumentStatus;
(function (InstrumentStatus) {
    InstrumentStatus["ACTIVE"] = "ACTIVE";
    InstrumentStatus["RETIRED"] = "RETIRED";
    InstrumentStatus["DAMAGED"] = "DAMAGED";
    InstrumentStatus["UNDER_MAINTENANCE"] = "UNDER_MAINTENANCE";
    InstrumentStatus["IN_STERILIZATION"] = "IN_STERILIZATION";
})(InstrumentStatus || (exports.InstrumentStatus = InstrumentStatus = {}));
var InstrumentType;
(function (InstrumentType) {
    InstrumentType["HANDPIECE"] = "HANDPIECE";
    InstrumentType["SCALER"] = "SCALER";
    InstrumentType["FORCEPS"] = "FORCEPS";
    InstrumentType["ELEVATOR"] = "ELEVATOR";
    InstrumentType["CURETTE"] = "CURETTE";
    InstrumentType["MIRROR"] = "MIRROR";
    InstrumentType["EXPLORER"] = "EXPLORER";
    InstrumentType["SYRINGE"] = "SYRINGE";
    InstrumentType["SURGICAL_BLADE"] = "SURGICAL_BLADE";
    InstrumentType["RETRACTOR"] = "RETRACTOR";
    InstrumentType["OTHER"] = "OTHER";
})(InstrumentType || (exports.InstrumentType = InstrumentType = {}));
var LabCaseStatus;
(function (LabCaseStatus) {
    LabCaseStatus["CREATED"] = "CREATED";
    LabCaseStatus["SENT"] = "SENT";
    LabCaseStatus["IN_PROGRESS"] = "IN_PROGRESS";
    LabCaseStatus["RECEIVED"] = "RECEIVED";
    LabCaseStatus["COMPLETED"] = "COMPLETED";
    LabCaseStatus["REJECTED"] = "REJECTED";
    LabCaseStatus["CANCELLED"] = "CANCELLED";
})(LabCaseStatus || (exports.LabCaseStatus = LabCaseStatus = {}));
var LabCaseType;
(function (LabCaseType) {
    LabCaseType["CROWN"] = "CROWN";
    LabCaseType["BRIDGE"] = "BRIDGE";
    LabCaseType["DENTURE"] = "DENTURE";
    LabCaseType["IMPLANT"] = "IMPLANT";
    LabCaseType["ALIGNER"] = "ALIGNER";
    LabCaseType["IMPRESSION"] = "IMPRESSION";
    LabCaseType["NIGHTGUARD"] = "NIGHTGUARD";
    LabCaseType["VENEER"] = "VENEER";
    LabCaseType["OTHER"] = "OTHER";
})(LabCaseType || (exports.LabCaseType = LabCaseType = {}));
var ClinicalLogisticsTaskType;
(function (ClinicalLogisticsTaskType) {
    ClinicalLogisticsTaskType["ROOM_PREP"] = "ROOM_PREP";
    ClinicalLogisticsTaskType["ROOM_TURNOVER"] = "ROOM_TURNOVER";
    ClinicalLogisticsTaskType["CONSUMABLES_PREP"] = "CONSUMABLES_PREP";
    ClinicalLogisticsTaskType["INSTRUMENT_SETUP"] = "INSTRUMENT_SETUP";
    ClinicalLogisticsTaskType["WASTE_DISPOSAL"] = "WASTE_DISPOSAL";
})(ClinicalLogisticsTaskType || (exports.ClinicalLogisticsTaskType = ClinicalLogisticsTaskType = {}));
var ClinicalLogisticsTaskStatus;
(function (ClinicalLogisticsTaskStatus) {
    ClinicalLogisticsTaskStatus["TODO"] = "TODO";
    ClinicalLogisticsTaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ClinicalLogisticsTaskStatus["COMPLETED"] = "COMPLETED";
    ClinicalLogisticsTaskStatus["CANCELLED"] = "CANCELLED";
})(ClinicalLogisticsTaskStatus || (exports.ClinicalLogisticsTaskStatus = ClinicalLogisticsTaskStatus = {}));
//# sourceMappingURL=sterilization-types.js.map