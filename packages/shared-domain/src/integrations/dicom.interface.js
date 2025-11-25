"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DicomQueryLevel = exports.DicomModality = exports.DicomStandard = void 0;
var DicomStandard;
(function (DicomStandard) {
    DicomStandard["WADO"] = "WADO";
    DicomStandard["QIDO"] = "QIDO";
    DicomStandard["STOW"] = "STOW";
})(DicomStandard || (exports.DicomStandard = DicomStandard = {}));
var DicomModality;
(function (DicomModality) {
    DicomModality["CR"] = "CR";
    DicomModality["CT"] = "CT";
    DicomModality["MR"] = "MR";
    DicomModality["US"] = "US";
    DicomModality["XA"] = "XA";
    DicomModality["DX"] = "DX";
    DicomModality["IO"] = "IO";
    DicomModality["PX"] = "PX";
})(DicomModality || (exports.DicomModality = DicomModality = {}));
var DicomQueryLevel;
(function (DicomQueryLevel) {
    DicomQueryLevel["PATIENT"] = "PATIENT";
    DicomQueryLevel["STUDY"] = "STUDY";
    DicomQueryLevel["SERIES"] = "SERIES";
    DicomQueryLevel["INSTANCE"] = "INSTANCE";
})(DicomQueryLevel || (exports.DicomQueryLevel = DicomQueryLevel = {}));
//# sourceMappingURL=dicom.interface.js.map