"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSuccess = isSuccess;
exports.isFailure = isFailure;
exports.safeParse = safeParse;
exports.parseOrThrow = parseOrThrow;
exports.parseOrDefault = parseOrDefault;
exports.parseOrNull = parseOrNull;
exports.parseOrUndefined = parseOrUndefined;
exports.safeParseAsync = safeParseAsync;
exports.parseOrThrowAsync = parseOrThrowAsync;
function isSuccess(result) {
    return result.success === true;
}
function isFailure(result) {
    return result.success === false;
}
function safeParse(schema, data) {
    const result = schema.safeParse(data);
    if (result.success) {
        return {
            success: true,
            data: result.data,
        };
    }
    return {
        success: false,
        error: result.error,
    };
}
function parseOrThrow(schema, data) {
    return schema.parse(data);
}
function parseOrDefault(schema, data, defaultValue) {
    const result = schema.safeParse(data);
    return result.success ? result.data : defaultValue;
}
function parseOrNull(schema, data) {
    const result = schema.safeParse(data);
    return result.success ? result.data : null;
}
function parseOrUndefined(schema, data) {
    const result = schema.safeParse(data);
    return result.success ? result.data : undefined;
}
async function safeParseAsync(schema, data) {
    const result = await schema.safeParseAsync(data);
    if (result.success) {
        return {
            success: true,
            data: result.data,
        };
    }
    return {
        success: false,
        error: result.error,
    };
}
async function parseOrThrowAsync(schema, data) {
    return await schema.parseAsync(data);
}
//# sourceMappingURL=safe-parse.js.map