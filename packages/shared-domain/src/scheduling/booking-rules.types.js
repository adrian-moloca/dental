"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstraintType = exports.WaitlistStatus = exports.ConflictResolutionStrategy = exports.BookingRuleScope = exports.BookingRuleType = void 0;
var BookingRuleType;
(function (BookingRuleType) {
    BookingRuleType["MIN_ADVANCE_TIME"] = "MIN_ADVANCE_TIME";
    BookingRuleType["MAX_ADVANCE_TIME"] = "MAX_ADVANCE_TIME";
    BookingRuleType["MAX_APPOINTMENTS_PER_PATIENT"] = "MAX_APPOINTMENTS_PER_PATIENT";
    BookingRuleType["MAX_APPOINTMENTS_PER_DAY"] = "MAX_APPOINTMENTS_PER_DAY";
    BookingRuleType["REQUIRED_GAP"] = "REQUIRED_GAP";
    BookingRuleType["BLACKOUT_DATES"] = "BLACKOUT_DATES";
    BookingRuleType["ALLOWED_APPOINTMENT_TYPES"] = "ALLOWED_APPOINTMENT_TYPES";
    BookingRuleType["TIME_SLOT_CONSTRAINTS"] = "TIME_SLOT_CONSTRAINTS";
    BookingRuleType["CUSTOM"] = "CUSTOM";
})(BookingRuleType || (exports.BookingRuleType = BookingRuleType = {}));
var BookingRuleScope;
(function (BookingRuleScope) {
    BookingRuleScope["ORGANIZATION"] = "ORGANIZATION";
    BookingRuleScope["CLINIC"] = "CLINIC";
    BookingRuleScope["PROVIDER"] = "PROVIDER";
    BookingRuleScope["APPOINTMENT_TYPE"] = "APPOINTMENT_TYPE";
    BookingRuleScope["PATIENT_SEGMENT"] = "PATIENT_SEGMENT";
})(BookingRuleScope || (exports.BookingRuleScope = BookingRuleScope = {}));
var ConflictResolutionStrategy;
(function (ConflictResolutionStrategy) {
    ConflictResolutionStrategy["REJECT"] = "REJECT";
    ConflictResolutionStrategy["ALLOW_OVERLAP"] = "ALLOW_OVERLAP";
    ConflictResolutionStrategy["AUTO_RESCHEDULE"] = "AUTO_RESCHEDULE";
    ConflictResolutionStrategy["WAITLIST"] = "WAITLIST";
    ConflictResolutionStrategy["MANUAL_REVIEW"] = "MANUAL_REVIEW";
    ConflictResolutionStrategy["PRIORITY_BASED"] = "PRIORITY_BASED";
})(ConflictResolutionStrategy || (exports.ConflictResolutionStrategy = ConflictResolutionStrategy = {}));
var WaitlistStatus;
(function (WaitlistStatus) {
    WaitlistStatus["ACTIVE"] = "ACTIVE";
    WaitlistStatus["CONTACTED"] = "CONTACTED";
    WaitlistStatus["BOOKED"] = "BOOKED";
    WaitlistStatus["DECLINED"] = "DECLINED";
    WaitlistStatus["EXPIRED"] = "EXPIRED";
    WaitlistStatus["CANCELLED"] = "CANCELLED";
})(WaitlistStatus || (exports.WaitlistStatus = WaitlistStatus = {}));
var ConstraintType;
(function (ConstraintType) {
    ConstraintType["TIME"] = "TIME";
    ConstraintType["DATE"] = "DATE";
    ConstraintType["RESOURCE"] = "RESOURCE";
    ConstraintType["CAPACITY"] = "CAPACITY";
    ConstraintType["POLICY"] = "POLICY";
    ConstraintType["BUSINESS_RULE"] = "BUSINESS_RULE";
})(ConstraintType || (exports.ConstraintType = ConstraintType = {}));
//# sourceMappingURL=booking-rules.types.js.map