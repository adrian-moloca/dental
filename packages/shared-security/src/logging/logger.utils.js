"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructuredLogger = void 0;
exports.maskPHI = maskPHI;
exports.createStructuredLog = createStructuredLog;
exports.createLogger = createLogger;
const PHI_FIELDS = [
    'ssn',
    'socialSecurityNumber',
    'dateOfBirth',
    'dob',
    'birthDate',
    'phone',
    'phoneNumber',
    'mobile',
    'email',
    'address',
    'street',
    'city',
    'zipCode',
    'postalCode',
    'medicalRecordNumber',
    'mrn',
    'patientId',
    'firstName',
    'lastName',
    'fullName',
    'name',
    'creditCard',
    'cardNumber',
    'cvv',
    'password',
    'token',
    'secret',
    'apiKey',
];
const REDACTED = '[REDACTED]';
function maskPHI(data) {
    if (data === null || data === undefined) {
        return data;
    }
    if (typeof data === 'string') {
        return data;
    }
    if (Array.isArray(data)) {
        return data.map((item) => maskPHI(item));
    }
    if (typeof data === 'object') {
        const masked = {};
        for (const [key, value] of Object.entries(data)) {
            const lowerKey = key.toLowerCase();
            if (PHI_FIELDS.some((field) => lowerKey.includes(field.toLowerCase()))) {
                masked[key] = REDACTED;
            }
            else if (typeof value === 'object' && value !== null) {
                masked[key] = maskPHI(value);
            }
            else {
                masked[key] = value;
            }
        }
        return masked;
    }
    return data;
}
function createStructuredLog(level, message, context, error) {
    const log = {
        level,
        message,
        timestamp: new Date().toISOString(),
    };
    if (context) {
        log.context = maskPHI(context);
    }
    if (error) {
        log.error = {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
    }
    return log;
}
class StructuredLogger {
    constructor(serviceName, defaultContext) {
        this.serviceName = serviceName;
        this.defaultContext = defaultContext;
    }
    log(level, message, context, error) {
        const mergedContext = { ...this.defaultContext, ...context, service: this.serviceName };
        const log = createStructuredLog(level, message, mergedContext, error);
        console.log(JSON.stringify(log));
    }
    debug(message, context) {
        this.log('debug', message, context);
    }
    info(message, context) {
        this.log('info', message, context);
    }
    warn(message, context) {
        this.log('warn', message, context);
    }
    error(message, error, context) {
        this.log('error', message, context, error);
    }
    fatal(message, error, context) {
        this.log('fatal', message, context, error);
    }
}
exports.StructuredLogger = StructuredLogger;
function createLogger(serviceName, defaultContext) {
    return new StructuredLogger(serviceName, defaultContext);
}
//# sourceMappingURL=logger.utils.js.map