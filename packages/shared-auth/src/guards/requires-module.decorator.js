"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODULE_METADATA_KEY = void 0;
exports.RequiresModule = RequiresModule;
exports.getModuleMetadata = getModuleMetadata;
require("reflect-metadata");
exports.MODULE_METADATA_KEY = 'auth:required-module';
function RequiresModule(moduleCode) {
    return (target, _propertyKey, descriptor) => {
        const metadata = {
            moduleCode,
        };
        if (descriptor) {
            Reflect.defineMetadata(exports.MODULE_METADATA_KEY, metadata, descriptor.value);
            return descriptor;
        }
        Reflect.defineMetadata(exports.MODULE_METADATA_KEY, metadata, target);
    };
}
function getModuleMetadata(target) {
    return Reflect.getMetadata(exports.MODULE_METADATA_KEY, target);
}
//# sourceMappingURL=requires-module.decorator.js.map