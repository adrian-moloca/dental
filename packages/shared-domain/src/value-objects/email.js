"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
const value_object_1 = require("./value-object");
class Email extends value_object_1.ValueObject {
    constructor(value) {
        super();
        this._value = value;
    }
    static create(email) {
        value_object_1.ValueObject.checkNotNull(email, 'email');
        const trimmed = email.trim();
        if (trimmed.length === 0) {
            throw new Error('Email cannot be empty');
        }
        const normalized = trimmed.toLowerCase();
        Email.validateFormat(normalized);
        Email.validateLength(normalized);
        return new Email(normalized);
    }
    get value() {
        return this._value;
    }
    getLocalPart() {
        const atIndex = this._value.indexOf('@');
        return this._value.substring(0, atIndex);
    }
    getDomain() {
        const atIndex = this._value.indexOf('@');
        return this._value.substring(atIndex + 1);
    }
    isFromDomain(domain) {
        if (!domain) {
            return false;
        }
        return this.getDomain() === domain.toLowerCase();
    }
    equals(other) {
        if (!(other instanceof Email)) {
            return false;
        }
        return this._value === other._value;
    }
    toString() {
        return this._value;
    }
    static validateFormat(email) {
        const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
        if (!emailRegex.test(email)) {
            throw new Error(`Invalid email format: ${email}`);
        }
        if (email.includes('..')) {
            throw new Error('Email cannot contain consecutive dots');
        }
        if (email.startsWith('.') || email.endsWith('.')) {
            throw new Error('Email cannot start or end with a dot');
        }
        const [localPart, domain] = email.split('@');
        if (localPart.length === 0) {
            throw new Error('Email local part cannot be empty');
        }
        if (domain.length === 0) {
            throw new Error('Email domain cannot be empty');
        }
        if (!domain.includes('.')) {
            throw new Error('Email domain must contain at least one dot');
        }
    }
    static validateLength(email) {
        const MAX_EMAIL_LENGTH = 254;
        const MAX_LOCAL_PART_LENGTH = 64;
        const MAX_DOMAIN_LENGTH = 253;
        if (email.length > MAX_EMAIL_LENGTH) {
            throw new Error(`Email exceeds maximum length of ${MAX_EMAIL_LENGTH} characters`);
        }
        const [localPart, domain] = email.split('@');
        if (localPart.length > MAX_LOCAL_PART_LENGTH) {
            throw new Error(`Email local part exceeds maximum length of ${MAX_LOCAL_PART_LENGTH} characters`);
        }
        if (domain.length > MAX_DOMAIN_LENGTH) {
            throw new Error(`Email domain exceeds maximum length of ${MAX_DOMAIN_LENGTH} characters`);
        }
    }
}
exports.Email = Email;
//# sourceMappingURL=email.js.map