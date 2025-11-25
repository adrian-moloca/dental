"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantRole = exports.AppointmentPriority = exports.CancellationType = exports.AppointmentStatus = void 0;
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["SCHEDULED"] = "SCHEDULED";
    AppointmentStatus["CONFIRMED"] = "CONFIRMED";
    AppointmentStatus["CHECKED_IN"] = "CHECKED_IN";
    AppointmentStatus["IN_PROGRESS"] = "IN_PROGRESS";
    AppointmentStatus["COMPLETED"] = "COMPLETED";
    AppointmentStatus["CANCELLED"] = "CANCELLED";
    AppointmentStatus["NO_SHOW"] = "NO_SHOW";
    AppointmentStatus["RESCHEDULED"] = "RESCHEDULED";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
var CancellationType;
(function (CancellationType) {
    CancellationType["PATIENT"] = "PATIENT";
    CancellationType["PROVIDER"] = "PROVIDER";
    CancellationType["SYSTEM"] = "SYSTEM";
    CancellationType["NO_SHOW"] = "NO_SHOW";
})(CancellationType || (exports.CancellationType = CancellationType = {}));
var AppointmentPriority;
(function (AppointmentPriority) {
    AppointmentPriority["LOW"] = "LOW";
    AppointmentPriority["MEDIUM"] = "MEDIUM";
    AppointmentPriority["HIGH"] = "HIGH";
    AppointmentPriority["URGENT"] = "URGENT";
})(AppointmentPriority || (exports.AppointmentPriority = AppointmentPriority = {}));
var ParticipantRole;
(function (ParticipantRole) {
    ParticipantRole["PROVIDER"] = "PROVIDER";
    ParticipantRole["ASSISTANT"] = "ASSISTANT";
    ParticipantRole["HYGIENIST"] = "HYGIENIST";
    ParticipantRole["SPECIALIST"] = "SPECIALIST";
    ParticipantRole["OTHER"] = "OTHER";
})(ParticipantRole || (exports.ParticipantRole = ParticipantRole = {}));
//# sourceMappingURL=appointment.types.js.map