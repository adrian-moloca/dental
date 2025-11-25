"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailStatus = exports.EmailProvider = void 0;
var EmailProvider;
(function (EmailProvider) {
    EmailProvider["SENDGRID"] = "SENDGRID";
    EmailProvider["SMTP"] = "SMTP";
})(EmailProvider || (exports.EmailProvider = EmailProvider = {}));
var EmailStatus;
(function (EmailStatus) {
    EmailStatus["QUEUED"] = "QUEUED";
    EmailStatus["SENT"] = "SENT";
    EmailStatus["DELIVERED"] = "DELIVERED";
    EmailStatus["OPENED"] = "OPENED";
    EmailStatus["CLICKED"] = "CLICKED";
    EmailStatus["BOUNCED"] = "BOUNCED";
    EmailStatus["SPAM"] = "SPAM";
    EmailStatus["FAILED"] = "FAILED";
})(EmailStatus || (exports.EmailStatus = EmailStatus = {}));
//# sourceMappingURL=email-provider.interface.js.map