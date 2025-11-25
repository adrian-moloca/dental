"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsStatus = exports.SmsProvider = void 0;
var SmsProvider;
(function (SmsProvider) {
    SmsProvider["TWILIO"] = "TWILIO";
    SmsProvider["NEXMO"] = "NEXMO";
})(SmsProvider || (exports.SmsProvider = SmsProvider = {}));
var SmsStatus;
(function (SmsStatus) {
    SmsStatus["QUEUED"] = "QUEUED";
    SmsStatus["SENT"] = "SENT";
    SmsStatus["DELIVERED"] = "DELIVERED";
    SmsStatus["FAILED"] = "FAILED";
    SmsStatus["UNDELIVERED"] = "UNDELIVERED";
})(SmsStatus || (exports.SmsStatus = SmsStatus = {}));
//# sourceMappingURL=sms-provider.interface.js.map