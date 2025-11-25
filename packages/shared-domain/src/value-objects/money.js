"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
const value_object_1 = require("./value-object");
class Money extends value_object_1.ValueObject {
    constructor(amount, currency) {
        super();
        this._amount = amount;
        this._currency = currency;
    }
    static create(amount, currency) {
        Money.validateAmount(amount);
        Money.validateCurrency(currency);
        const roundedAmount = Money.round(amount);
        return new Money(roundedAmount, currency.toUpperCase());
    }
    static zero(currency) {
        return Money.create(0, currency);
    }
    get amount() {
        return this._amount;
    }
    get currency() {
        return this._currency;
    }
    add(other) {
        this.assertSameCurrency(other);
        const result = this._amount + other._amount;
        return Money.create(result, this._currency);
    }
    subtract(other) {
        this.assertSameCurrency(other);
        const result = this._amount - other._amount;
        return Money.create(result, this._currency);
    }
    multiply(factor) {
        if (typeof factor !== 'number' || !isFinite(factor)) {
            throw new Error('Multiplication factor must be a finite number');
        }
        const result = this._amount * factor;
        return Money.create(result, this._currency);
    }
    divide(divisor) {
        if (typeof divisor !== 'number' || !isFinite(divisor)) {
            throw new Error('Divisor must be a finite number');
        }
        if (divisor === 0) {
            throw new Error('Cannot divide by zero');
        }
        const result = this._amount / divisor;
        return Money.create(result, this._currency);
    }
    isZero() {
        return this._amount === 0;
    }
    isPositive() {
        return this._amount > 0;
    }
    isNegative() {
        return this._amount < 0;
    }
    isGreaterThan(other) {
        this.assertSameCurrency(other);
        return this._amount > other._amount;
    }
    isLessThan(other) {
        this.assertSameCurrency(other);
        return this._amount < other._amount;
    }
    abs() {
        return Money.create(Math.abs(this._amount), this._currency);
    }
    negate() {
        return Money.create(-this._amount, this._currency);
    }
    equals(other) {
        if (!(other instanceof Money)) {
            return false;
        }
        return (this._amount === other._amount && this._currency === other._currency);
    }
    toString() {
        return `${this._currency} ${this._amount.toFixed(Money.DECIMAL_PRECISION)}`;
    }
    toLocaleString(locale = 'en-US') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: this._currency,
        }).format(this._amount);
    }
    static round(value) {
        return (Math.round(value * Money.PRECISION_FACTOR) / Money.PRECISION_FACTOR);
    }
    static validateAmount(amount) {
        if (typeof amount !== 'number') {
            throw new Error('Amount must be a number');
        }
        if (!isFinite(amount)) {
            throw new Error('Amount must be a finite number');
        }
        if (isNaN(amount)) {
            throw new Error('Amount cannot be NaN');
        }
    }
    static validateCurrency(currency) {
        value_object_1.ValueObject.checkNotNull(currency, 'currency');
        const trimmed = currency.trim();
        if (trimmed.length === 0) {
            throw new Error('Currency cannot be empty');
        }
        const currencyRegex = /^[A-Z]{3}$/;
        if (!currencyRegex.test(trimmed.toUpperCase())) {
            throw new Error(`Invalid currency code: ${currency}. Must be a 3-letter ISO 4217 code (e.g., USD, EUR, GBP)`);
        }
    }
    assertSameCurrency(other) {
        if (this._currency !== other._currency) {
            throw new Error(`Cannot perform operation on different currencies: ${this._currency} and ${other._currency}`);
        }
    }
}
exports.Money = Money;
Money.DECIMAL_PRECISION = 2;
Money.PRECISION_FACTOR = Math.pow(10, Money.DECIMAL_PRECISION);
//# sourceMappingURL=money.js.map