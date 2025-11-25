"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppTemplateCategory = exports.WhatsAppMessageStatus = exports.WhatsAppMessageType = void 0;
var WhatsAppMessageType;
(function (WhatsAppMessageType) {
    WhatsAppMessageType["TEXT"] = "TEXT";
    WhatsAppMessageType["TEMPLATE"] = "TEMPLATE";
    WhatsAppMessageType["IMAGE"] = "IMAGE";
    WhatsAppMessageType["DOCUMENT"] = "DOCUMENT";
})(WhatsAppMessageType || (exports.WhatsAppMessageType = WhatsAppMessageType = {}));
var WhatsAppMessageStatus;
(function (WhatsAppMessageStatus) {
    WhatsAppMessageStatus["QUEUED"] = "QUEUED";
    WhatsAppMessageStatus["SENT"] = "SENT";
    WhatsAppMessageStatus["DELIVERED"] = "DELIVERED";
    WhatsAppMessageStatus["READ"] = "READ";
    WhatsAppMessageStatus["FAILED"] = "FAILED";
})(WhatsAppMessageStatus || (exports.WhatsAppMessageStatus = WhatsAppMessageStatus = {}));
var WhatsAppTemplateCategory;
(function (WhatsAppTemplateCategory) {
    WhatsAppTemplateCategory["APPOINTMENT_REMINDER"] = "APPOINTMENT_REMINDER";
    WhatsAppTemplateCategory["APPOINTMENT_CONFIRMATION"] = "APPOINTMENT_CONFIRMATION";
    WhatsAppTemplateCategory["PAYMENT_REMINDER"] = "PAYMENT_REMINDER";
    WhatsAppTemplateCategory["TREATMENT_FOLLOWUP"] = "TREATMENT_FOLLOWUP";
    WhatsAppTemplateCategory["MARKETING"] = "MARKETING";
})(WhatsAppTemplateCategory || (exports.WhatsAppTemplateCategory = WhatsAppTemplateCategory = {}));
//# sourceMappingURL=whatsapp.interface.js.map