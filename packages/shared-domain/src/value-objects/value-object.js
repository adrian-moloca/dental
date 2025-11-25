"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueObject = void 0;
class ValueObject {
    constructor() {
        Object.freeze(this);
    }
    clone() {
        return this;
    }
    static isValueObject(obj) {
        return obj instanceof ValueObject;
    }
    static deepFreeze(obj) {
        Object.freeze(obj);
        Object.getOwnPropertyNames(obj).forEach((prop) => {
            const value = obj[prop];
            if (value !== null &&
                typeof value === 'object' &&
                !Object.isFrozen(value)) {
                ValueObject.deepFreeze(value);
            }
        });
        return obj;
    }
    static checkNotNull(value, paramName) {
        if (value === null || value === undefined) {
            throw new Error(`${paramName} cannot be null or undefined`);
        }
    }
    static checkNotEmpty(value, paramName) {
        ValueObject.checkNotNull(value, paramName);
        if (value.trim().length === 0) {
            throw new Error(`${paramName} cannot be empty or whitespace`);
        }
    }
    static checkRange(value, min, max, paramName) {
        ValueObject.checkNotNull(value, paramName);
        if (value < min || value > max) {
            throw new Error(`${paramName} must be between ${min} and ${max}, got ${value}`);
        }
    }
    static checkPattern(value, pattern, paramName, errorMessage) {
        ValueObject.checkNotNull(value, paramName);
        if (!pattern.test(value)) {
            throw new Error(errorMessage || `${paramName} does not match required format`);
        }
    }
}
exports.ValueObject = ValueObject;
//# sourceMappingURL=value-object.js.map