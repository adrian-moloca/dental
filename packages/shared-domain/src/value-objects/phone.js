"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Phone = void 0;
const value_object_1 = require("./value-object");
class Phone extends value_object_1.ValueObject {
    constructor(value, countryCode, nationalNumber) {
        super();
        this._value = value;
        this._countryCode = countryCode;
        this._nationalNumber = nationalNumber;
    }
    static create(phone) {
        value_object_1.ValueObject.checkNotNull(phone, 'phone');
        const trimmed = phone.trim();
        if (trimmed.length === 0) {
            throw new Error('Phone number cannot be empty');
        }
        const normalized = Phone.normalize(trimmed);
        Phone.validateE164Format(normalized);
        const { countryCode, nationalNumber } = Phone.parsePhone(normalized);
        return new Phone(normalized, countryCode, nationalNumber);
    }
    get value() {
        return this._value;
    }
    get countryCode() {
        return this._countryCode;
    }
    get nationalNumber() {
        return this._nationalNumber;
    }
    getFormatted() {
        if (this._countryCode === '+1' && this._nationalNumber.length === 10) {
            const areaCode = this._nationalNumber.substring(0, 3);
            const exchange = this._nationalNumber.substring(3, 6);
            const line = this._nationalNumber.substring(6);
            return `${this._countryCode} (${areaCode}) ${exchange}-${line}`;
        }
        return `${this._countryCode} ${this._nationalNumber}`;
    }
    isNorthAmerican() {
        return this._countryCode === '+1';
    }
    isFromCountry(countryCode) {
        if (!countryCode) {
            return false;
        }
        const normalized = countryCode.startsWith('+')
            ? countryCode
            : `+${countryCode}`;
        return this._countryCode === normalized;
    }
    equals(other) {
        if (!(other instanceof Phone)) {
            return false;
        }
        return this._value === other._value;
    }
    toString() {
        return this._value;
    }
    static normalize(phone) {
        let normalized = phone.replace(/[\s\-()\.]/g, '');
        if (!normalized.startsWith('+')) {
            throw new Error('Phone number must be in E.164 format starting with +');
        }
        return normalized;
    }
    static validateE164Format(phone) {
        const e164Regex = /^\+[1-9]\d{1,14}$/;
        if (!e164Regex.test(phone)) {
            throw new Error(`Invalid E.164 phone format: ${phone}. Expected format: +[country code][number] (max 15 digits)`);
        }
        const MIN_LENGTH = 8;
        if (phone.length < MIN_LENGTH) {
            throw new Error(`Phone number too short. Minimum length is ${MIN_LENGTH} characters`);
        }
        const MAX_LENGTH = 16;
        if (phone.length > MAX_LENGTH) {
            throw new Error(`Phone number too long. Maximum length is ${MAX_LENGTH} characters`);
        }
    }
    static parsePhone(phone) {
        const digitsOnly = phone.substring(1);
        if (digitsOnly.charAt(0) === '1' || digitsOnly.charAt(0) === '7') {
            return {
                countryCode: `+${digitsOnly.substring(0, 1)}`,
                nationalNumber: digitsOnly.substring(1),
            };
        }
        if (digitsOnly.length >= 10) {
            return {
                countryCode: `+${digitsOnly.substring(0, 2)}`,
                nationalNumber: digitsOnly.substring(2),
            };
        }
        if (digitsOnly.length >= 11) {
            return {
                countryCode: `+${digitsOnly.substring(0, 3)}`,
                nationalNumber: digitsOnly.substring(3),
            };
        }
        return {
            countryCode: `+${digitsOnly.substring(0, 2)}`,
            nationalNumber: digitsOnly.substring(2),
        };
    }
}
exports.Phone = Phone;
//# sourceMappingURL=phone.js.map