"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxEventStatus = void 0;
var OutboxEventStatus;
(function (OutboxEventStatus) {
    OutboxEventStatus["PENDING"] = "PENDING";
    OutboxEventStatus["PROCESSING"] = "PROCESSING";
    OutboxEventStatus["PROCESSED"] = "PROCESSED";
    OutboxEventStatus["FAILED"] = "FAILED";
})(OutboxEventStatus || (exports.OutboxEventStatus = OutboxEventStatus = {}));
//# sourceMappingURL=outbox-event.interface.js.map