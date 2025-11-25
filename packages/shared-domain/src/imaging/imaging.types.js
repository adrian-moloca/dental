"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudyPriority = exports.ReportStatus = exports.ReportType = exports.AnnotationType = exports.FindingType = exports.FindingSeverity = exports.FileType = exports.Quadrant = exports.ImagingRegion = exports.ImagingModality = exports.ImagingStudyStatus = void 0;
var ImagingStudyStatus;
(function (ImagingStudyStatus) {
    ImagingStudyStatus["PENDING"] = "pending";
    ImagingStudyStatus["IN_PROGRESS"] = "in_progress";
    ImagingStudyStatus["COMPLETED"] = "completed";
    ImagingStudyStatus["REPORTED"] = "reported";
    ImagingStudyStatus["ARCHIVED"] = "archived";
    ImagingStudyStatus["CANCELLED"] = "cancelled";
    ImagingStudyStatus["ERROR"] = "error";
})(ImagingStudyStatus || (exports.ImagingStudyStatus = ImagingStudyStatus = {}));
var ImagingModality;
(function (ImagingModality) {
    ImagingModality["X_RAY"] = "xray";
    ImagingModality["CBCT"] = "cbct";
    ImagingModality["PANORAMIC"] = "panoramic";
    ImagingModality["INTRAORAL_PHOTO"] = "intraoral_photo";
    ImagingModality["CEPHALOMETRIC"] = "cephalometric";
    ImagingModality["BITEWING"] = "bitewing";
    ImagingModality["PERIAPICAL"] = "periapical";
    ImagingModality["OCCLUSAL"] = "occlusal";
    ImagingModality["TMJ"] = "tmj";
    ImagingModality["SINUS"] = "sinus";
    ImagingModality["EXTRAORAL_PHOTO"] = "extraoral_photo";
    ImagingModality["INTRAORAL_SCAN"] = "intraoral_scan";
    ImagingModality["OTHER"] = "other";
})(ImagingModality || (exports.ImagingModality = ImagingModality = {}));
var ImagingRegion;
(function (ImagingRegion) {
    ImagingRegion["TOOTH"] = "tooth";
    ImagingRegion["QUADRANT"] = "quadrant";
    ImagingRegion["FULL_ARCH"] = "full_arch";
    ImagingRegion["FULL_MOUTH"] = "full_mouth";
    ImagingRegion["TMJ"] = "tmj";
    ImagingRegion["SINUS"] = "sinus";
    ImagingRegion["MAXILLA"] = "maxilla";
    ImagingRegion["MANDIBLE"] = "mandible";
    ImagingRegion["ANTERIOR"] = "anterior";
    ImagingRegion["POSTERIOR"] = "posterior";
    ImagingRegion["OTHER"] = "other";
})(ImagingRegion || (exports.ImagingRegion = ImagingRegion = {}));
var Quadrant;
(function (Quadrant) {
    Quadrant["UPPER_RIGHT"] = "upper_right";
    Quadrant["UPPER_LEFT"] = "upper_left";
    Quadrant["LOWER_LEFT"] = "lower_left";
    Quadrant["LOWER_RIGHT"] = "lower_right";
})(Quadrant || (exports.Quadrant = Quadrant = {}));
var FileType;
(function (FileType) {
    FileType["DICOM"] = "dicom";
    FileType["JPEG"] = "jpeg";
    FileType["PNG"] = "png";
    FileType["TIFF"] = "tiff";
    FileType["PDF"] = "pdf";
    FileType["RAW"] = "raw";
    FileType["STL"] = "stl";
    FileType["OBJ"] = "obj";
})(FileType || (exports.FileType = FileType = {}));
var FindingSeverity;
(function (FindingSeverity) {
    FindingSeverity["LOW"] = "low";
    FindingSeverity["MEDIUM"] = "medium";
    FindingSeverity["HIGH"] = "high";
    FindingSeverity["CRITICAL"] = "critical";
})(FindingSeverity || (exports.FindingSeverity = FindingSeverity = {}));
var FindingType;
(function (FindingType) {
    FindingType["CARIES"] = "caries";
    FindingType["PERIAPICAL_LESION"] = "periapical_lesion";
    FindingType["BONE_LOSS"] = "bone_loss";
    FindingType["IMPACTED_TOOTH"] = "impacted_tooth";
    FindingType["FRACTURE"] = "fracture";
    FindingType["FOREIGN_BODY"] = "foreign_body";
    FindingType["SINUS_ISSUE"] = "sinus_issue";
    FindingType["TMJ_DISORDER"] = "tmj_disorder";
    FindingType["CALCULUS"] = "calculus";
    FindingType["ABSCESS"] = "abscess";
    FindingType["CYST_TUMOR"] = "cyst_tumor";
    FindingType["RESORPTION"] = "resorption";
    FindingType["PULP_EXPOSURE"] = "pulp_exposure";
    FindingType["ENAMEL_DEFECT"] = "enamel_defect";
    FindingType["RESTORATION_DEFECT"] = "restoration_defect";
    FindingType["WIDENED_PDL"] = "widened_pdl";
    FindingType["OTHER"] = "other";
})(FindingType || (exports.FindingType = FindingType = {}));
var AnnotationType;
(function (AnnotationType) {
    AnnotationType["BOUNDING_BOX"] = "bounding_box";
    AnnotationType["POLYGON"] = "polygon";
    AnnotationType["POINT"] = "point";
    AnnotationType["LINE"] = "line";
    AnnotationType["ANGLE"] = "angle";
    AnnotationType["AREA"] = "area";
    AnnotationType["TEXT"] = "text";
    AnnotationType["ARROW"] = "arrow";
})(AnnotationType || (exports.AnnotationType = AnnotationType = {}));
var ReportType;
(function (ReportType) {
    ReportType["PRELIMINARY"] = "preliminary";
    ReportType["FINAL"] = "final";
    ReportType["AMENDED"] = "amended";
    ReportType["ADDENDUM"] = "addendum";
})(ReportType || (exports.ReportType = ReportType = {}));
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["DRAFT"] = "draft";
    ReportStatus["FINAL"] = "final";
    ReportStatus["AMENDED"] = "amended";
    ReportStatus["VOID"] = "void";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
var StudyPriority;
(function (StudyPriority) {
    StudyPriority["ROUTINE"] = "routine";
    StudyPriority["URGENT"] = "urgent";
    StudyPriority["STAT"] = "stat";
})(StudyPriority || (exports.StudyPriority = StudyPriority = {}));
//# sourceMappingURL=imaging.types.js.map