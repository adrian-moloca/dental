"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientSortOrder = exports.PatientErrorCode = exports.PatientConsentType = exports.PatientDeletionStatus = exports.PatientDataExportStatus = exports.PatientReferralStatus = exports.PatientLoyaltyTier = exports.PatientInvoiceStatus = exports.PatientImagingType = exports.PatientAllergySeverity = exports.PatientConditionStatus = exports.PatientTreatmentPlanStatus = exports.PatientAppointmentStatus = exports.PatientMfaMethod = void 0;
var PatientMfaMethod;
(function (PatientMfaMethod) {
    PatientMfaMethod["SMS"] = "SMS";
    PatientMfaMethod["EMAIL"] = "EMAIL";
    PatientMfaMethod["TOTP"] = "TOTP";
})(PatientMfaMethod || (exports.PatientMfaMethod = PatientMfaMethod = {}));
var PatientAppointmentStatus;
(function (PatientAppointmentStatus) {
    PatientAppointmentStatus["UPCOMING"] = "UPCOMING";
    PatientAppointmentStatus["COMPLETED"] = "COMPLETED";
    PatientAppointmentStatus["CANCELLED"] = "CANCELLED";
    PatientAppointmentStatus["NO_SHOW"] = "NO_SHOW";
})(PatientAppointmentStatus || (exports.PatientAppointmentStatus = PatientAppointmentStatus = {}));
var PatientTreatmentPlanStatus;
(function (PatientTreatmentPlanStatus) {
    PatientTreatmentPlanStatus["PROPOSED"] = "PROPOSED";
    PatientTreatmentPlanStatus["ACCEPTED"] = "ACCEPTED";
    PatientTreatmentPlanStatus["IN_PROGRESS"] = "IN_PROGRESS";
    PatientTreatmentPlanStatus["COMPLETED"] = "COMPLETED";
    PatientTreatmentPlanStatus["DECLINED"] = "DECLINED";
})(PatientTreatmentPlanStatus || (exports.PatientTreatmentPlanStatus = PatientTreatmentPlanStatus = {}));
var PatientConditionStatus;
(function (PatientConditionStatus) {
    PatientConditionStatus["ACTIVE"] = "ACTIVE";
    PatientConditionStatus["RESOLVED"] = "RESOLVED";
})(PatientConditionStatus || (exports.PatientConditionStatus = PatientConditionStatus = {}));
var PatientAllergySeverity;
(function (PatientAllergySeverity) {
    PatientAllergySeverity["MILD"] = "MILD";
    PatientAllergySeverity["MODERATE"] = "MODERATE";
    PatientAllergySeverity["SEVERE"] = "SEVERE";
})(PatientAllergySeverity || (exports.PatientAllergySeverity = PatientAllergySeverity = {}));
var PatientImagingType;
(function (PatientImagingType) {
    PatientImagingType["XRAY"] = "XRAY";
    PatientImagingType["CBCT"] = "CBCT";
    PatientImagingType["INTRAORAL_SCAN"] = "INTRAORAL_SCAN";
    PatientImagingType["PHOTO"] = "PHOTO";
})(PatientImagingType || (exports.PatientImagingType = PatientImagingType = {}));
var PatientInvoiceStatus;
(function (PatientInvoiceStatus) {
    PatientInvoiceStatus["OUTSTANDING"] = "OUTSTANDING";
    PatientInvoiceStatus["OVERDUE"] = "OVERDUE";
    PatientInvoiceStatus["PAID"] = "PAID";
    PatientInvoiceStatus["CANCELLED"] = "CANCELLED";
})(PatientInvoiceStatus || (exports.PatientInvoiceStatus = PatientInvoiceStatus = {}));
var PatientLoyaltyTier;
(function (PatientLoyaltyTier) {
    PatientLoyaltyTier["BRONZE"] = "BRONZE";
    PatientLoyaltyTier["SILVER"] = "SILVER";
    PatientLoyaltyTier["GOLD"] = "GOLD";
    PatientLoyaltyTier["PLATINUM"] = "PLATINUM";
})(PatientLoyaltyTier || (exports.PatientLoyaltyTier = PatientLoyaltyTier = {}));
var PatientReferralStatus;
(function (PatientReferralStatus) {
    PatientReferralStatus["PENDING"] = "PENDING";
    PatientReferralStatus["COMPLETED"] = "COMPLETED";
    PatientReferralStatus["REDEEMED"] = "REDEEMED";
    PatientReferralStatus["EXPIRED"] = "EXPIRED";
})(PatientReferralStatus || (exports.PatientReferralStatus = PatientReferralStatus = {}));
var PatientDataExportStatus;
(function (PatientDataExportStatus) {
    PatientDataExportStatus["REQUESTED"] = "REQUESTED";
    PatientDataExportStatus["READY"] = "READY";
    PatientDataExportStatus["EXPIRED"] = "EXPIRED";
    PatientDataExportStatus["FAILED"] = "FAILED";
})(PatientDataExportStatus || (exports.PatientDataExportStatus = PatientDataExportStatus = {}));
var PatientDeletionStatus;
(function (PatientDeletionStatus) {
    PatientDeletionStatus["REQUESTED"] = "REQUESTED";
    PatientDeletionStatus["IN_PROGRESS"] = "IN_PROGRESS";
    PatientDeletionStatus["COMPLETED"] = "COMPLETED";
    PatientDeletionStatus["DENIED"] = "DENIED";
})(PatientDeletionStatus || (exports.PatientDeletionStatus = PatientDeletionStatus = {}));
var PatientConsentType;
(function (PatientConsentType) {
    PatientConsentType["MARKETING"] = "MARKETING";
    PatientConsentType["DATA_SHARING"] = "DATA_SHARING";
    PatientConsentType["RESEARCH"] = "RESEARCH";
    PatientConsentType["COMMUNICATIONS"] = "COMMUNICATIONS";
})(PatientConsentType || (exports.PatientConsentType = PatientConsentType = {}));
var PatientErrorCode;
(function (PatientErrorCode) {
    PatientErrorCode["INVALID_CREDENTIALS"] = "INVALID_CREDENTIALS";
    PatientErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    PatientErrorCode["ACCOUNT_LOCKED"] = "ACCOUNT_LOCKED";
    PatientErrorCode["EMAIL_NOT_VERIFIED"] = "EMAIL_NOT_VERIFIED";
    PatientErrorCode["APPOINTMENT_CONFLICT"] = "APPOINTMENT_CONFLICT";
    PatientErrorCode["APPOINTMENT_NOT_CANCELLABLE"] = "APPOINTMENT_NOT_CANCELLABLE";
    PatientErrorCode["PAYMENT_FAILED"] = "PAYMENT_FAILED";
    PatientErrorCode["INSUFFICIENT_BALANCE"] = "INSUFFICIENT_BALANCE";
    PatientErrorCode["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
    PatientErrorCode["INVALID_REQUEST"] = "INVALID_REQUEST";
    PatientErrorCode["NOT_FOUND"] = "NOT_FOUND";
    PatientErrorCode["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
})(PatientErrorCode || (exports.PatientErrorCode = PatientErrorCode = {}));
var PatientSortOrder;
(function (PatientSortOrder) {
    PatientSortOrder["ASC"] = "ASC";
    PatientSortOrder["DESC"] = "DESC";
})(PatientSortOrder || (exports.PatientSortOrder = PatientSortOrder = {}));
//# sourceMappingURL=patient-portal.types.js.map