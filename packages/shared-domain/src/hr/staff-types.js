"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskCategory = exports.TaskPriority = exports.TaskStatus = exports.ContractType = exports.StaffStatus = exports.StaffRole = void 0;
var StaffRole;
(function (StaffRole) {
    StaffRole["DENTIST"] = "DENTIST";
    StaffRole["HYGIENIST"] = "HYGIENIST";
    StaffRole["DENTAL_ASSISTANT"] = "DENTAL_ASSISTANT";
    StaffRole["RECEPTIONIST"] = "RECEPTIONIST";
    StaffRole["OFFICE_MANAGER"] = "OFFICE_MANAGER";
    StaffRole["STERILIZATION_TECH"] = "STERILIZATION_TECH";
    StaffRole["LAB_TECHNICIAN"] = "LAB_TECHNICIAN";
    StaffRole["BILLING_SPECIALIST"] = "BILLING_SPECIALIST";
    StaffRole["MARKETING_COORDINATOR"] = "MARKETING_COORDINATOR";
    StaffRole["IT_SUPPORT"] = "IT_SUPPORT";
    StaffRole["OTHER"] = "OTHER";
})(StaffRole || (exports.StaffRole = StaffRole = {}));
var StaffStatus;
(function (StaffStatus) {
    StaffStatus["ACTIVE"] = "ACTIVE";
    StaffStatus["INACTIVE"] = "INACTIVE";
    StaffStatus["ONBOARDING"] = "ONBOARDING";
    StaffStatus["SUSPENDED"] = "SUSPENDED";
    StaffStatus["ON_LEAVE"] = "ON_LEAVE";
    StaffStatus["TERMINATED"] = "TERMINATED";
})(StaffStatus || (exports.StaffStatus = StaffStatus = {}));
var ContractType;
(function (ContractType) {
    ContractType["FULL_TIME"] = "FULL_TIME";
    ContractType["PART_TIME"] = "PART_TIME";
    ContractType["CONTRACT"] = "CONTRACT";
    ContractType["TEMPORARY"] = "TEMPORARY";
    ContractType["INTERN"] = "INTERN";
    ContractType["PER_DIEM"] = "PER_DIEM";
})(ContractType || (exports.ContractType = ContractType = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["TODO"] = "TODO";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["BLOCKED"] = "BLOCKED";
    TaskStatus["COMPLETED"] = "COMPLETED";
    TaskStatus["CANCELLED"] = "CANCELLED";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "LOW";
    TaskPriority["MEDIUM"] = "MEDIUM";
    TaskPriority["HIGH"] = "HIGH";
    TaskPriority["URGENT"] = "URGENT";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
var TaskCategory;
(function (TaskCategory) {
    TaskCategory["CLINICAL_SUPPORT"] = "CLINICAL_SUPPORT";
    TaskCategory["STERILIZATION"] = "STERILIZATION";
    TaskCategory["INVENTORY"] = "INVENTORY";
    TaskCategory["MAINTENANCE"] = "MAINTENANCE";
    TaskCategory["ADMINISTRATIVE"] = "ADMINISTRATIVE";
    TaskCategory["PATIENT_CARE"] = "PATIENT_CARE";
    TaskCategory["EQUIPMENT"] = "EQUIPMENT";
    TaskCategory["OTHER"] = "OTHER";
})(TaskCategory || (exports.TaskCategory = TaskCategory = {}));
//# sourceMappingURL=staff-types.js.map