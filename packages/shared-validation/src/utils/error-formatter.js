"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatZodError = formatZodError;
exports.getFieldErrors = getFieldErrors;
exports.getSingleErrorMessage = getSingleErrorMessage;
exports.getAllErrorMessages = getAllErrorMessages;
exports.hasFieldError = hasFieldError;
exports.getFieldErrorMessages = getFieldErrorMessages;
exports.formatApiError = formatApiError;
exports.createUserFriendlyMessage = createUserFriendlyMessage;
function formatZodError(error, defaultMessage = 'Validation failed') {
    const fields = error.issues.map(issueToFieldError);
    return {
        message: fields.length > 0 ? `Validation failed: ${fields.length} error(s)` : defaultMessage,
        fields,
        count: fields.length,
        timestamp: new Date().toISOString(),
    };
}
function issueToFieldError(issue) {
    const field = issue.path.join('.');
    return {
        field: field || 'root',
        message: issue.message,
        code: issue.code,
        context: {
            ...issue,
            path: issue.path,
        },
    };
}
function getFieldErrors(error) {
    const fieldErrors = {};
    for (const issue of error.issues) {
        const field = issue.path.join('.') || 'root';
        if (!fieldErrors[field]) {
            fieldErrors[field] = [];
        }
        fieldErrors[field].push(issue.message);
    }
    return fieldErrors;
}
function getSingleErrorMessage(error, defaultMessage = 'Validation error') {
    if (error.issues.length === 0) {
        return defaultMessage;
    }
    const firstIssue = error.issues[0];
    const field = firstIssue.path.join('.');
    return field ? `${field}: ${firstIssue.message}` : firstIssue.message;
}
function getAllErrorMessages(error) {
    return error.issues.map((issue) => {
        const field = issue.path.join('.');
        return field ? `${field}: ${issue.message}` : issue.message;
    });
}
function hasFieldError(error, fieldPath) {
    return error.issues.some((issue) => issue.path.join('.') === fieldPath);
}
function getFieldErrorMessages(error, fieldPath) {
    return error.issues
        .filter((issue) => issue.path.join('.') === fieldPath)
        .map((issue) => issue.message);
}
function formatApiError(error, statusCode = 400) {
    const formatted = formatZodError(error);
    return {
        success: false,
        error: {
            code: 'VALIDATION_ERROR',
            message: formatted.message,
            statusCode,
            details: formatted,
        },
    };
}
function createUserFriendlyMessage(error) {
    const messages = getAllErrorMessages(error);
    if (messages.length === 0) {
        return 'Validation error occurred';
    }
    if (messages.length === 1) {
        return messages[0];
    }
    return `Please fix the following: ${messages.join(', ')}`;
}
//# sourceMappingURL=error-formatter.js.map