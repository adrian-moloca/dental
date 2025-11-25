"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevicePlatform = exports.DeviceStatus = void 0;
var DeviceStatus;
(function (DeviceStatus) {
    DeviceStatus["ACTIVE"] = "ACTIVE";
    DeviceStatus["INACTIVE"] = "INACTIVE";
    DeviceStatus["REVOKED"] = "REVOKED";
})(DeviceStatus || (exports.DeviceStatus = DeviceStatus = {}));
var DevicePlatform;
(function (DevicePlatform) {
    DevicePlatform["WINDOWS"] = "WINDOWS";
    DevicePlatform["MACOS"] = "MACOS";
    DevicePlatform["LINUX"] = "LINUX";
})(DevicePlatform || (exports.DevicePlatform = DevicePlatform = {}));
//# sourceMappingURL=device-registration.interface.js.map