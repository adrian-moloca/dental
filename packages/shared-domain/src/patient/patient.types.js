"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailType = exports.PhoneType = exports.CommunicationChannel = exports.RelationshipType = exports.PatientStatus = exports.Gender = void 0;
var Gender;
(function (Gender) {
    Gender["MALE"] = "male";
    Gender["FEMALE"] = "female";
    Gender["OTHER"] = "other";
    Gender["PREFER_NOT_TO_SAY"] = "prefer_not_to_say";
})(Gender || (exports.Gender = Gender = {}));
var PatientStatus;
(function (PatientStatus) {
    PatientStatus["ACTIVE"] = "active";
    PatientStatus["INACTIVE"] = "inactive";
    PatientStatus["ARCHIVED"] = "archived";
})(PatientStatus || (exports.PatientStatus = PatientStatus = {}));
var RelationshipType;
(function (RelationshipType) {
    RelationshipType["PARENT"] = "parent";
    RelationshipType["CHILD"] = "child";
    RelationshipType["SPOUSE"] = "spouse";
    RelationshipType["SIBLING"] = "sibling";
    RelationshipType["GUARDIAN"] = "guardian";
    RelationshipType["EMERGENCY"] = "emergency";
})(RelationshipType || (exports.RelationshipType = RelationshipType = {}));
var CommunicationChannel;
(function (CommunicationChannel) {
    CommunicationChannel["EMAIL"] = "email";
    CommunicationChannel["SMS"] = "sms";
    CommunicationChannel["PHONE"] = "phone";
    CommunicationChannel["PORTAL"] = "portal";
})(CommunicationChannel || (exports.CommunicationChannel = CommunicationChannel = {}));
var PhoneType;
(function (PhoneType) {
    PhoneType["MOBILE"] = "mobile";
    PhoneType["HOME"] = "home";
    PhoneType["WORK"] = "work";
})(PhoneType || (exports.PhoneType = PhoneType = {}));
var EmailType;
(function (EmailType) {
    EmailType["PERSONAL"] = "personal";
    EmailType["WORK"] = "work";
})(EmailType || (exports.EmailType = EmailType = {}));
//# sourceMappingURL=patient.types.js.map