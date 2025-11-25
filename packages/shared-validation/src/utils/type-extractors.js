"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractInputType = extractInputType;
exports.extractOutputType = extractOutputType;
exports.isType = isType;
exports.assertType = assertType;
function extractInputType(_schema) {
    return undefined;
}
function extractOutputType(_schema) {
    return undefined;
}
function isType(schema, value) {
    const result = schema.safeParse(value);
    return result.success;
}
function assertType(schema, value, errorMessage) {
    const result = schema.safeParse(value);
    if (!result.success) {
        throw new Error(errorMessage || `Type assertion failed: ${result.error.message}`);
    }
}
//# sourceMappingURL=type-extractors.js.map