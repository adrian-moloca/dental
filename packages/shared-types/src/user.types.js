"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = exports.ResourceType = exports.PermissionAction = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["ORG_ADMIN"] = "ORG_ADMIN";
    UserRole["CLINIC_ADMIN"] = "CLINIC_ADMIN";
    UserRole["DENTIST"] = "DENTIST";
    UserRole["HYGIENIST"] = "HYGIENIST";
    UserRole["ASSISTANT"] = "ASSISTANT";
    UserRole["RECEPTIONIST"] = "RECEPTIONIST";
    UserRole["OFFICE_MANAGER"] = "OFFICE_MANAGER";
    UserRole["BILLING_SPECIALIST"] = "BILLING_SPECIALIST";
    UserRole["VIEWER"] = "VIEWER";
})(UserRole || (exports.UserRole = UserRole = {}));
var PermissionAction;
(function (PermissionAction) {
    PermissionAction["CREATE"] = "CREATE";
    PermissionAction["READ"] = "READ";
    PermissionAction["UPDATE"] = "UPDATE";
    PermissionAction["DELETE"] = "DELETE";
    PermissionAction["EXECUTE"] = "EXECUTE";
    PermissionAction["APPROVE"] = "APPROVE";
    PermissionAction["EXPORT"] = "EXPORT";
    PermissionAction["IMPORT"] = "IMPORT";
})(PermissionAction || (exports.PermissionAction = PermissionAction = {}));
var ResourceType;
(function (ResourceType) {
    ResourceType["PATIENT"] = "PATIENT";
    ResourceType["APPOINTMENT"] = "APPOINTMENT";
    ResourceType["TREATMENT"] = "TREATMENT";
    ResourceType["INVOICE"] = "INVOICE";
    ResourceType["PRESCRIPTION"] = "PRESCRIPTION";
    ResourceType["MEDICAL_RECORD"] = "MEDICAL_RECORD";
    ResourceType["USER"] = "USER";
    ResourceType["CLINIC"] = "CLINIC";
    ResourceType["ORGANIZATION"] = "ORGANIZATION";
    ResourceType["REPORT"] = "REPORT";
    ResourceType["SETTINGS"] = "SETTINGS";
})(ResourceType || (exports.ResourceType = ResourceType = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["INACTIVE"] = "INACTIVE";
    UserStatus["PENDING"] = "PENDING";
    UserStatus["SUSPENDED"] = "SUSPENDED";
    UserStatus["LOCKED"] = "LOCKED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
//# sourceMappingURL=user.types.js.map