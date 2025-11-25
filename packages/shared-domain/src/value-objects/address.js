"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = void 0;
const value_object_1 = require("./value-object");
class Address extends value_object_1.ValueObject {
    constructor(street, city, state, postalCode, country) {
        super();
        this._street = street;
        this._city = city;
        this._state = state;
        this._postalCode = postalCode;
        this._country = country;
    }
    static create(input) {
        Address.validateInput(input);
        const street = Address.validateAndNormalizeStreet(input.street);
        const city = Address.validateAndNormalizeCity(input.city);
        const state = Address.validateAndNormalizeState(input.state);
        const postalCode = Address.validateAndNormalizePostalCode(input.postalCode);
        const country = Address.validateAndNormalizeCountry(input.country);
        return new Address(street, city, state, postalCode, country);
    }
    get street() {
        return this._street;
    }
    get city() {
        return this._city;
    }
    get state() {
        return this._state;
    }
    get postalCode() {
        return this._postalCode;
    }
    get country() {
        return this._country;
    }
    getFormattedAddress() {
        return `${this._street}, ${this._city}, ${this._state} ${this._postalCode}, ${this._country}`;
    }
    getMultiLineAddress() {
        return [
            this._street,
            `${this._city}, ${this._state} ${this._postalCode}`,
            this._country,
        ];
    }
    isUSAddress() {
        const normalized = this._country.toUpperCase();
        return normalized === 'USA' || normalized === 'US' || normalized === 'UNITED STATES';
    }
    equals(other) {
        if (!(other instanceof Address)) {
            return false;
        }
        return (this._street === other._street &&
            this._city === other._city &&
            this._state === other._state &&
            this._postalCode === other._postalCode &&
            this._country === other._country);
    }
    toString() {
        return this.getFormattedAddress();
    }
    static validateInput(input) {
        if (!input) {
            throw new Error('Address input cannot be null or undefined');
        }
        const requiredFields = [
            'street',
            'city',
            'state',
            'postalCode',
            'country',
        ];
        for (const field of requiredFields) {
            if (input[field] === null || input[field] === undefined) {
                throw new Error(`Address ${field} is required`);
            }
        }
    }
    static validateAndNormalizeStreet(street) {
        value_object_1.ValueObject.checkNotEmpty(street, 'street');
        const trimmed = street.trim();
        if (trimmed.length < 3) {
            throw new Error('Street address must be at least 3 characters');
        }
        if (trimmed.length > 200) {
            throw new Error('Street address cannot exceed 200 characters');
        }
        return trimmed;
    }
    static validateAndNormalizeCity(city) {
        value_object_1.ValueObject.checkNotEmpty(city, 'city');
        const trimmed = city.trim();
        if (trimmed.length < 2) {
            throw new Error('City must be at least 2 characters');
        }
        if (trimmed.length > 100) {
            throw new Error('City cannot exceed 100 characters');
        }
        const cityRegex = /^[a-zA-Z\s\-'.]+$/;
        if (!cityRegex.test(trimmed)) {
            throw new Error('City contains invalid characters');
        }
        return trimmed;
    }
    static validateAndNormalizeState(state) {
        value_object_1.ValueObject.checkNotEmpty(state, 'state');
        const trimmed = state.trim();
        if (trimmed.length < 2) {
            throw new Error('State must be at least 2 characters');
        }
        if (trimmed.length > 50) {
            throw new Error('State cannot exceed 50 characters');
        }
        return trimmed;
    }
    static validateAndNormalizePostalCode(postalCode) {
        value_object_1.ValueObject.checkNotEmpty(postalCode, 'postalCode');
        const trimmed = postalCode.trim();
        if (trimmed.length < 3) {
            throw new Error('Postal code must be at least 3 characters');
        }
        if (trimmed.length > 20) {
            throw new Error('Postal code cannot exceed 20 characters');
        }
        const postalRegex = /^[a-zA-Z0-9\s\-]+$/;
        if (!postalRegex.test(trimmed)) {
            throw new Error('Postal code contains invalid characters');
        }
        return trimmed;
    }
    static validateAndNormalizeCountry(country) {
        value_object_1.ValueObject.checkNotEmpty(country, 'country');
        const trimmed = country.trim();
        if (trimmed.length < 2) {
            throw new Error('Country must be at least 2 characters');
        }
        if (trimmed.length > 100) {
            throw new Error('Country cannot exceed 100 characters');
        }
        return trimmed;
    }
}
exports.Address = Address;
//# sourceMappingURL=address.js.map