"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldLogError = exports.calculateRetryDelay = exports.isTransientError = exports.isOperationalError = exports.extractCorrelationId = exports.extractErrorCode = exports.isCriticalError = exports.isUserError = exports.isRetryableError = void 0;
var error_classification_1 = require("./error-classification");
Object.defineProperty(exports, "isRetryableError", { enumerable: true, get: function () { return error_classification_1.isRetryableError; } });
Object.defineProperty(exports, "isUserError", { enumerable: true, get: function () { return error_classification_1.isUserError; } });
Object.defineProperty(exports, "isCriticalError", { enumerable: true, get: function () { return error_classification_1.isCriticalError; } });
Object.defineProperty(exports, "extractErrorCode", { enumerable: true, get: function () { return error_classification_1.extractErrorCode; } });
Object.defineProperty(exports, "extractCorrelationId", { enumerable: true, get: function () { return error_classification_1.extractCorrelationId; } });
Object.defineProperty(exports, "isOperationalError", { enumerable: true, get: function () { return error_classification_1.isOperationalError; } });
Object.defineProperty(exports, "isTransientError", { enumerable: true, get: function () { return error_classification_1.isTransientError; } });
Object.defineProperty(exports, "calculateRetryDelay", { enumerable: true, get: function () { return error_classification_1.calculateRetryDelay; } });
Object.defineProperty(exports, "shouldLogError", { enumerable: true, get: function () { return error_classification_1.shouldLogError; } });
//# sourceMappingURL=index.js.map