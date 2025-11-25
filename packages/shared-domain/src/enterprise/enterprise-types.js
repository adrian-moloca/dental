"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicLocationType = exports.ClinicRole = exports.EnterpriseRole = exports.ClinicStatus = exports.OrganizationStatus = void 0;
var OrganizationStatus;
(function (OrganizationStatus) {
    OrganizationStatus["ACTIVE"] = "ACTIVE";
    OrganizationStatus["SUSPENDED"] = "SUSPENDED";
    OrganizationStatus["INACTIVE"] = "INACTIVE";
})(OrganizationStatus || (exports.OrganizationStatus = OrganizationStatus = {}));
var ClinicStatus;
(function (ClinicStatus) {
    ClinicStatus["ACTIVE"] = "ACTIVE";
    ClinicStatus["SUSPENDED"] = "SUSPENDED";
    ClinicStatus["INACTIVE"] = "INACTIVE";
    ClinicStatus["PENDING_SETUP"] = "PENDING_SETUP";
})(ClinicStatus || (exports.ClinicStatus = ClinicStatus = {}));
var EnterpriseRole;
(function (EnterpriseRole) {
    EnterpriseRole["ORG_ADMIN"] = "ORG_ADMIN";
    EnterpriseRole["ORG_MANAGER"] = "ORG_MANAGER";
    EnterpriseRole["MULTI_CLINIC_MANAGER"] = "MULTI_CLINIC_MANAGER";
    EnterpriseRole["AUDITOR"] = "AUDITOR";
    EnterpriseRole["SYSTEM_OWNER"] = "SYSTEM_OWNER";
})(EnterpriseRole || (exports.EnterpriseRole = EnterpriseRole = {}));
var ClinicRole;
(function (ClinicRole) {
    ClinicRole["CLINIC_MANAGER"] = "CLINIC_MANAGER";
    ClinicRole["CLINIC_OWNER"] = "CLINIC_OWNER";
    ClinicRole["CLINIC_FINANCE"] = "CLINIC_FINANCE";
    ClinicRole["CLINIC_STAFF_ADMIN"] = "CLINIC_STAFF_ADMIN";
})(ClinicRole || (exports.ClinicRole = ClinicRole = {}));
var ClinicLocationType;
(function (ClinicLocationType) {
    ClinicLocationType["FLOOR"] = "FLOOR";
    ClinicLocationType["AREA"] = "AREA";
    ClinicLocationType["ROOM"] = "ROOM";
    ClinicLocationType["EQUIPMENT"] = "EQUIPMENT";
})(ClinicLocationType || (exports.ClinicLocationType = ClinicLocationType = {}));
//# sourceMappingURL=enterprise-types.js.map