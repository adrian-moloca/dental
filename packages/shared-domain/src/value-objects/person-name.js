"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonName = void 0;
const value_object_1 = require("./value-object");
class PersonName extends value_object_1.ValueObject {
    constructor(firstName, lastName, middleName) {
        super();
        this._firstName = firstName;
        this._lastName = lastName;
        this._middleName = middleName;
    }
    static create(firstName, lastName, middleName) {
        const normalizedFirst = PersonName.validateAndNormalize(firstName, 'firstName');
        const normalizedLast = PersonName.validateAndNormalize(lastName, 'lastName');
        let normalizedMiddle;
        if (middleName !== undefined && middleName !== null) {
            normalizedMiddle = PersonName.validateAndNormalize(middleName, 'middleName');
        }
        return new PersonName(normalizedFirst, normalizedLast, normalizedMiddle);
    }
    get firstName() {
        return this._firstName;
    }
    get lastName() {
        return this._lastName;
    }
    get middleName() {
        return this._middleName;
    }
    getDisplayName() {
        return `${this._firstName} ${this._lastName}`;
    }
    getFullName() {
        if (this._middleName) {
            return `${this._firstName} ${this._middleName} ${this._lastName}`;
        }
        return this.getDisplayName();
    }
    getFormalName() {
        return `${this._lastName}, ${this._firstName}`;
    }
    getInitials(includeMiddle = false) {
        const firstInitial = this._firstName.charAt(0).toUpperCase();
        const lastInitial = this._lastName.charAt(0).toUpperCase();
        if (includeMiddle && this._middleName) {
            const middleInitial = this._middleName.charAt(0).toUpperCase();
            return `${firstInitial}${middleInitial}${lastInitial}`;
        }
        return `${firstInitial}${lastInitial}`;
    }
    hasMiddleName() {
        return this._middleName !== undefined;
    }
    equals(other) {
        if (!(other instanceof PersonName)) {
            return false;
        }
        return (this._firstName === other._firstName &&
            this._lastName === other._lastName &&
            this._middleName === other._middleName);
    }
    toString() {
        return this.getDisplayName();
    }
    static validateAndNormalize(value, paramName) {
        value_object_1.ValueObject.checkNotNull(value, paramName);
        const trimmed = value.trim();
        if (trimmed.length === 0) {
            throw new Error(`${paramName} cannot be empty or whitespace`);
        }
        const MIN_LENGTH = 1;
        const MAX_LENGTH = 50;
        if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) {
            throw new Error(`${paramName} must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters`);
        }
        const nameRegex = /^[a-zA-Z\s'-]+$/;
        if (!nameRegex.test(trimmed)) {
            throw new Error(`${paramName} can only contain letters, spaces, hyphens, and apostrophes`);
        }
        return PersonName.capitalize(trimmed);
    }
    static capitalize(value) {
        return value
            .split(/(\s+|-|')/)
            .map((part) => {
            if (part.match(/^[\s'-]+$/)) {
                return part;
            }
            if (part.length > 0) {
                return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
            }
            return part;
        })
            .join('');
    }
}
exports.PersonName = PersonName;
//# sourceMappingURL=person-name.js.map