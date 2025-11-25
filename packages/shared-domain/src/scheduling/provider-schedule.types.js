"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleRecurrence = exports.AbsenceStatus = exports.AbsenceType = exports.TimeSlotType = exports.DayOfWeek = void 0;
var DayOfWeek;
(function (DayOfWeek) {
    DayOfWeek[DayOfWeek["SUNDAY"] = 0] = "SUNDAY";
    DayOfWeek[DayOfWeek["MONDAY"] = 1] = "MONDAY";
    DayOfWeek[DayOfWeek["TUESDAY"] = 2] = "TUESDAY";
    DayOfWeek[DayOfWeek["WEDNESDAY"] = 3] = "WEDNESDAY";
    DayOfWeek[DayOfWeek["THURSDAY"] = 4] = "THURSDAY";
    DayOfWeek[DayOfWeek["FRIDAY"] = 5] = "FRIDAY";
    DayOfWeek[DayOfWeek["SATURDAY"] = 6] = "SATURDAY";
})(DayOfWeek || (exports.DayOfWeek = DayOfWeek = {}));
var TimeSlotType;
(function (TimeSlotType) {
    TimeSlotType["AVAILABLE"] = "AVAILABLE";
    TimeSlotType["BREAK"] = "BREAK";
    TimeSlotType["BLOCKED"] = "BLOCKED";
    TimeSlotType["EMERGENCY"] = "EMERGENCY";
    TimeSlotType["BUFFER"] = "BUFFER";
    TimeSlotType["ADMINISTRATIVE"] = "ADMINISTRATIVE";
})(TimeSlotType || (exports.TimeSlotType = TimeSlotType = {}));
var AbsenceType;
(function (AbsenceType) {
    AbsenceType["VACATION"] = "VACATION";
    AbsenceType["SICK_LEAVE"] = "SICK_LEAVE";
    AbsenceType["CONFERENCE"] = "CONFERENCE";
    AbsenceType["PERSONAL"] = "PERSONAL";
    AbsenceType["BEREAVEMENT"] = "BEREAVEMENT";
    AbsenceType["PARENTAL_LEAVE"] = "PARENTAL_LEAVE";
    AbsenceType["SABBATICAL"] = "SABBATICAL";
    AbsenceType["OTHER"] = "OTHER";
})(AbsenceType || (exports.AbsenceType = AbsenceType = {}));
var AbsenceStatus;
(function (AbsenceStatus) {
    AbsenceStatus["PENDING"] = "PENDING";
    AbsenceStatus["APPROVED"] = "APPROVED";
    AbsenceStatus["REJECTED"] = "REJECTED";
    AbsenceStatus["CANCELLED"] = "CANCELLED";
})(AbsenceStatus || (exports.AbsenceStatus = AbsenceStatus = {}));
var ScheduleRecurrence;
(function (ScheduleRecurrence) {
    ScheduleRecurrence["NONE"] = "NONE";
    ScheduleRecurrence["DAILY"] = "DAILY";
    ScheduleRecurrence["WEEKLY"] = "WEEKLY";
    ScheduleRecurrence["MONTHLY"] = "MONTHLY";
    ScheduleRecurrence["CUSTOM"] = "CUSTOM";
})(ScheduleRecurrence || (exports.ScheduleRecurrence = ScheduleRecurrence = {}));
//# sourceMappingURL=provider-schedule.types.js.map