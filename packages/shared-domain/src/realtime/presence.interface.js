"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.PresenceStatus = void 0;
var PresenceStatus;
(function (PresenceStatus) {
    PresenceStatus["ONLINE"] = "ONLINE";
    PresenceStatus["OFFLINE"] = "OFFLINE";
    PresenceStatus["AWAY"] = "AWAY";
    PresenceStatus["BUSY"] = "BUSY";
})(PresenceStatus || (exports.PresenceStatus = PresenceStatus = {}));
var UserRole;
(function (UserRole) {
    UserRole["PROVIDER"] = "PROVIDER";
    UserRole["ASSISTANT"] = "ASSISTANT";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["RECEPTIONIST"] = "RECEPTIONIST";
    UserRole["DEVICE"] = "DEVICE";
})(UserRole || (exports.UserRole = UserRole = {}));
//# sourceMappingURL=presence.interface.js.map