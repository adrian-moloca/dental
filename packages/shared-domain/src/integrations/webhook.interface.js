"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookEventType = exports.WebhookStatus = exports.WebhookDirection = void 0;
var WebhookDirection;
(function (WebhookDirection) {
    WebhookDirection["OUTGOING"] = "OUTGOING";
    WebhookDirection["INCOMING"] = "INCOMING";
})(WebhookDirection || (exports.WebhookDirection = WebhookDirection = {}));
var WebhookStatus;
(function (WebhookStatus) {
    WebhookStatus["PENDING"] = "PENDING";
    WebhookStatus["SENT"] = "SENT";
    WebhookStatus["DELIVERED"] = "DELIVERED";
    WebhookStatus["FAILED"] = "FAILED";
    WebhookStatus["RETRYING"] = "RETRYING";
})(WebhookStatus || (exports.WebhookStatus = WebhookStatus = {}));
var WebhookEventType;
(function (WebhookEventType) {
    WebhookEventType["APPOINTMENT_BOOKED"] = "appointment.booked";
    WebhookEventType["APPOINTMENT_CANCELED"] = "appointment.canceled";
    WebhookEventType["PATIENT_CREATED"] = "patient.created";
    WebhookEventType["INVOICE_ISSUED"] = "invoice.issued";
    WebhookEventType["PAYMENT_RECEIVED"] = "payment.received";
    WebhookEventType["TREATMENT_COMPLETED"] = "treatment.completed";
    WebhookEventType["LAB_CASE_SUBMITTED"] = "lab_case.submitted";
    WebhookEventType["IMAGING_STUDY_COMPLETED"] = "imaging_study.completed";
    WebhookEventType["CUSTOM"] = "custom";
})(WebhookEventType || (exports.WebhookEventType = WebhookEventType = {}));
//# sourceMappingURL=webhook.interface.js.map