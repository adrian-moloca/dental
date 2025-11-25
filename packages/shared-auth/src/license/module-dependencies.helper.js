"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModuleDependencies = getModuleDependencies;
exports.getAllModuleDependencies = getAllModuleDependencies;
exports.hasModuleDependencies = hasModuleDependencies;
exports.getMissingDependencies = getMissingDependencies;
exports.getAllMissingDependencies = getAllMissingDependencies;
exports.areDependenciesSatisfied = areDependenciesSatisfied;
exports.getDependencyErrorMessage = getDependencyErrorMessage;
exports.validateModuleDependencies = validateModuleDependencies;
exports.dependsOn = dependsOn;
const jwt_payload_types_1 = require("../jwt/jwt-payload.types");
const MODULE_DEPENDENCIES = {
    [jwt_payload_types_1.ModuleCode.SCHEDULING]: [],
    [jwt_payload_types_1.ModuleCode.PATIENT_MANAGEMENT]: [],
    [jwt_payload_types_1.ModuleCode.CLINICAL_BASIC]: [],
    [jwt_payload_types_1.ModuleCode.BILLING_BASIC]: [],
    [jwt_payload_types_1.ModuleCode.CLINICAL_ADVANCED]: [jwt_payload_types_1.ModuleCode.CLINICAL_BASIC],
    [jwt_payload_types_1.ModuleCode.IMAGING]: [jwt_payload_types_1.ModuleCode.CLINICAL_BASIC],
    [jwt_payload_types_1.ModuleCode.INVENTORY]: [],
    [jwt_payload_types_1.ModuleCode.MARKETING]: [jwt_payload_types_1.ModuleCode.PATIENT_MANAGEMENT],
    [jwt_payload_types_1.ModuleCode.INSURANCE]: [jwt_payload_types_1.ModuleCode.BILLING_BASIC],
    [jwt_payload_types_1.ModuleCode.TELEDENTISTRY]: [jwt_payload_types_1.ModuleCode.CLINICAL_BASIC, jwt_payload_types_1.ModuleCode.SCHEDULING],
    [jwt_payload_types_1.ModuleCode.ANALYTICS_ADVANCED]: [],
    [jwt_payload_types_1.ModuleCode.MULTI_LOCATION]: [jwt_payload_types_1.ModuleCode.SCHEDULING],
};
function getModuleDependencies(moduleCode) {
    return MODULE_DEPENDENCIES[moduleCode] || [];
}
function getAllModuleDependencies(moduleCode) {
    const visited = new Set();
    const dependencies = [];
    function collectDependencies(code) {
        if (visited.has(code)) {
            return;
        }
        visited.add(code);
        const deps = getModuleDependencies(code);
        for (const dep of deps) {
            if (!dependencies.includes(dep)) {
                dependencies.push(dep);
            }
            collectDependencies(dep);
        }
    }
    collectDependencies(moduleCode);
    return dependencies;
}
function hasModuleDependencies(moduleCode) {
    const deps = getModuleDependencies(moduleCode);
    return deps.length > 0;
}
function getMissingDependencies(moduleCode, enabledModules) {
    const requiredDeps = getModuleDependencies(moduleCode);
    return requiredDeps.filter((dep) => !enabledModules.includes(dep));
}
function getAllMissingDependencies(moduleCode, enabledModules) {
    const allDeps = getAllModuleDependencies(moduleCode);
    return allDeps.filter((dep) => !enabledModules.includes(dep));
}
function areDependenciesSatisfied(moduleCode, enabledModules) {
    const missing = getMissingDependencies(moduleCode, enabledModules);
    return missing.length === 0;
}
function getDependencyErrorMessage(moduleCode, missingDeps) {
    if (missingDeps.length === 0) {
        return '';
    }
    const depList = missingDeps.join(', ');
    return `Module '${moduleCode}' requires the following modules: ${depList}`;
}
function validateModuleDependencies(moduleCodes, enabledModules) {
    const issues = new Map();
    for (const moduleCode of moduleCodes) {
        const missing = getMissingDependencies(moduleCode, enabledModules);
        if (missing.length > 0) {
            issues.set(moduleCode, missing);
        }
    }
    return issues;
}
function dependsOn(moduleCode, dependencyCode, includeTransitive = false) {
    const deps = includeTransitive
        ? getAllModuleDependencies(moduleCode)
        : getModuleDependencies(moduleCode);
    return deps.includes(dependencyCode);
}
//# sourceMappingURL=module-dependencies.helper.js.map