"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditSeverity = exports.AuditAction = void 0;
var AuditAction;
(function (AuditAction) {
    AuditAction["CREATE"] = "CREATE";
    AuditAction["READ"] = "READ";
    AuditAction["UPDATE"] = "UPDATE";
    AuditAction["DELETE"] = "DELETE";
    AuditAction["RESTORE"] = "RESTORE";
    AuditAction["LOGIN"] = "LOGIN";
    AuditAction["LOGOUT"] = "LOGOUT";
    AuditAction["LOGIN_FAILED"] = "LOGIN_FAILED";
    AuditAction["PASSWORD_RESET"] = "PASSWORD_RESET";
    AuditAction["PASSWORD_CHANGED"] = "PASSWORD_CHANGED";
    AuditAction["MFA_ENABLED"] = "MFA_ENABLED";
    AuditAction["MFA_DISABLED"] = "MFA_DISABLED";
    AuditAction["USER_INVITED"] = "USER_INVITED";
    AuditAction["USER_ACTIVATED"] = "USER_ACTIVATED";
    AuditAction["USER_DEACTIVATED"] = "USER_DEACTIVATED";
    AuditAction["USER_ROLE_CHANGED"] = "USER_ROLE_CHANGED";
    AuditAction["EXPORT"] = "EXPORT";
    AuditAction["IMPORT"] = "IMPORT";
    AuditAction["BATCH_UPDATE"] = "BATCH_UPDATE";
    AuditAction["SUBMITTED_FOR_APPROVAL"] = "SUBMITTED_FOR_APPROVAL";
    AuditAction["APPROVED"] = "APPROVED";
    AuditAction["REJECTED"] = "REJECTED";
    AuditAction["SETTINGS_CHANGED"] = "SETTINGS_CHANGED";
    AuditAction["CONFIGURATION_CHANGED"] = "CONFIGURATION_CHANGED";
    AuditAction["CUSTOM"] = "CUSTOM";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
var AuditSeverity;
(function (AuditSeverity) {
    AuditSeverity["INFO"] = "INFO";
    AuditSeverity["WARNING"] = "WARNING";
    AuditSeverity["ERROR"] = "ERROR";
    AuditSeverity["CRITICAL"] = "CRITICAL";
})(AuditSeverity || (exports.AuditSeverity = AuditSeverity = {}));
//# sourceMappingURL=audit.types.js.map