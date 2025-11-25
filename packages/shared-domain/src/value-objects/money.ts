/**
 * Money Value Object
 *
 * Represents monetary amounts with currency, ensuring type-safe financial calculations.
 * All arithmetic operations return new Money instances (immutability).
 *
 * Uses floating-point with precision handling to avoid common JavaScript
 * floating-point issues (e.g., 0.1 + 0.2 = 0.30000000000000004).
 *
 * @module shared-domain/value-objects
 *
 * @example
 * ```typescript
 * const price = Money.create(99.99, 'USD');
 * const tax = Money.create(7.50, 'USD');
 * const total = price.add(tax); // Money { amount: 107.49, currency: 'USD' }
 * ```
 */

import { ValueObject } from './value-object';

/**
 * Money value type
 */
export interface MoneyValue {
  readonly amount: number;
  readonly currency: string;
}

/**
 * Money value object
 *
 * Provides:
 * - Currency-aware monetary values
 * - Immutable arithmetic operations
 * - Precision handling for financial calculations
 * - Currency validation (ISO 4217)
 */
export class Money extends ValueObject<MoneyValue> {
  private readonly _amount: number;
  private readonly _currency: string;

  // Decimal precision for monetary calculations (2 decimal places)
  private static readonly DECIMAL_PRECISION = 2;
  private static readonly PRECISION_FACTOR = Math.pow(
    10,
    Money.DECIMAL_PRECISION
  );

  /**
   * Private constructor to enforce factory pattern
   *
   * @param amount - Monetary amount (rounded to 2 decimal places)
   * @param currency - ISO 4217 currency code (e.g., 'USD', 'EUR')
   * @private
   */
  private constructor(amount: number, currency: string) {
    super();
    this._amount = amount;
    this._currency = currency;
  }

  /**
   * Creates a new Money value object
   *
   * @param amount - Monetary amount
   * @param currency - ISO 4217 currency code (3 letters, e.g., 'USD')
   * @returns A new Money instance
   * @throws {Error} If amount or currency is invalid
   *
   * @example
   * ```typescript
   * const usd = Money.create(99.99, 'USD');
   * const eur = Money.create(85.50, 'EUR');
   * const zero = Money.create(0, 'USD');
   * ```
   */
  public static create(amount: number, currency: string): Money {
    // Validate amount
    Money.validateAmount(amount);

    // Validate currency
    Money.validateCurrency(currency);

    // Round to decimal precision
    const roundedAmount = Money.round(amount);

    return new Money(roundedAmount, currency.toUpperCase());
  }

  /**
   * Creates a zero Money instance for the given currency
   *
   * @param currency - ISO 4217 currency code
   * @returns A Money instance with amount 0
   *
   * @example
   * ```typescript
   * const zero = Money.zero('USD'); // Money { amount: 0, currency: 'USD' }
   * ```
   */
  public static zero(currency: string): Money {
    return Money.create(0, currency);
  }

  /**
   * Gets the monetary amount
   * @readonly
   */
  public get amount(): number {
    return this._amount;
  }

  /**
   * Gets the currency code
   * @readonly
   */
  public get currency(): string {
    return this._currency;
  }

  /**
   * Adds another Money value to this one
   *
   * @param other - Money to add
   * @returns New Money instance with the sum
   * @throws {Error} If currencies don't match
   *
   * @example
   * ```typescript
   * const a = Money.create(10.50, 'USD');
   * const b = Money.create(5.25, 'USD');
   * const sum = a.add(b); // Money { amount: 15.75, currency: 'USD' }
   * ```
   */
  public add(other: Money): Money {
    this.assertSameCurrency(other);
    const result = this._amount + other._amount;
    return Money.create(result, this._currency);
  }

  /**
   * Subtracts another Money value from this one
   *
   * @param other - Money to subtract
   * @returns New Money instance with the difference
   * @throws {Error} If currencies don't match
   *
   * @example
   * ```typescript
   * const a = Money.create(10.50, 'USD');
   * const b = Money.create(3.25, 'USD');
   * const diff = a.subtract(b); // Money { amount: 7.25, currency: 'USD' }
   * ```
   */
  public subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const result = this._amount - other._amount;
    return Money.create(result, this._currency);
  }

  /**
   * Multiplies this Money by a factor
   *
   * @param factor - Multiplication factor
   * @returns New Money instance with the product
   * @throws {Error} If factor is invalid
   *
   * @example
   * ```typescript
   * const price = Money.create(10.00, 'USD');
   * const total = price.multiply(3); // Money { amount: 30.00, currency: 'USD' }
   * const discounted = price.multiply(0.9); // Money { amount: 9.00, currency: 'USD' }
   * ```
   */
  public multiply(factor: number): Money {
    if (typeof factor !== 'number' || !isFinite(factor)) {
      throw new Error('Multiplication factor must be a finite number');
    }
    const result = this._amount * factor;
    return Money.create(result, this._currency);
  }

  /**
   * Divides this Money by a divisor
   *
   * @param divisor - Division divisor
   * @returns New Money instance with the quotient
   * @throws {Error} If divisor is invalid or zero
   *
   * @example
   * ```typescript
   * const total = Money.create(30.00, 'USD');
   * const perPerson = total.divide(3); // Money { amount: 10.00, currency: 'USD' }
   * ```
   */
  public divide(divisor: number): Money {
    if (typeof divisor !== 'number' || !isFinite(divisor)) {
      throw new Error('Divisor must be a finite number');
    }
    if (divisor === 0) {
      throw new Error('Cannot divide by zero');
    }
    const result = this._amount / divisor;
    return Money.create(result, this._currency);
  }

  /**
   * Checks if this Money is zero
   *
   * @returns true if amount is 0
   */
  public isZero(): boolean {
    return this._amount === 0;
  }

  /**
   * Checks if this Money is positive (> 0)
   *
   * @returns true if amount is positive
   */
  public isPositive(): boolean {
    return this._amount > 0;
  }

  /**
   * Checks if this Money is negative (< 0)
   *
   * @returns true if amount is negative
   */
  public isNegative(): boolean {
    return this._amount < 0;
  }

  /**
   * Checks if this Money is greater than another
   *
   * @param other - Money to compare with
   * @returns true if this amount is greater
   * @throws {Error} If currencies don't match
   */
  public isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this._amount > other._amount;
  }

  /**
   * Checks if this Money is less than another
   *
   * @param other - Money to compare with
   * @returns true if this amount is less
   * @throws {Error} If currencies don't match
   */
  public isLessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this._amount < other._amount;
  }

  /**
   * Gets the absolute value of this Money
   *
   * @returns New Money instance with absolute amount
   */
  public abs(): Money {
    return Money.create(Math.abs(this._amount), this._currency);
  }

  /**
   * Negates this Money value
   *
   * @returns New Money instance with negated amount
   */
  public negate(): Money {
    return Money.create(-this._amount, this._currency);
  }

  /**
   * Compares this Money with another for equality
   *
   * @param other - The Money to compare with
   * @returns true if amount and currency are equal
   */
  public equals(other: ValueObject<MoneyValue>): boolean {
    if (!(other instanceof Money)) {
      return false;
    }

    return (
      this._amount === other._amount && this._currency === other._currency
    );
  }

  /**
   * Returns formatted string representation
   *
   * @returns Formatted money string (e.g., "USD 99.99")
   */
  public toString(): string {
    return `${this._currency} ${this._amount.toFixed(Money.DECIMAL_PRECISION)}`;
  }

  /**
   * Returns locale-formatted string
   *
   * @param locale - Locale for formatting (e.g., 'en-US', 'de-DE')
   * @returns Formatted money string with locale-specific formatting
   *
   * @example
   * ```typescript
   * const money = Money.create(1234.56, 'USD');
   * console.log(money.toLocaleString('en-US')); // "$1,234.56"
   * console.log(money.toLocaleString('de-DE')); // "1.234,56 $"
   * ```
   */
  public toLocaleString(locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this._currency,
    }).format(this._amount);
  }

  /**
   * Rounds a number to the precision used for money
   *
   * @param value - Value to round
   * @returns Rounded value
   * @private
   */
  private static round(value: number): number {
    // Avoid floating-point errors by using integer arithmetic
    return (
      Math.round(value * Money.PRECISION_FACTOR) / Money.PRECISION_FACTOR
    );
  }

  /**
   * Validates monetary amount
   *
   * @param amount - Amount to validate
   * @throws {Error} If amount is invalid
   * @private
   */
  private static validateAmount(amount: number): void {
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

  /**
   * Validates currency code
   *
   * @param currency - Currency code to validate
   * @throws {Error} If currency is invalid
   * @private
   */
  private static validateCurrency(currency: string): void {
    ValueObject.checkNotNull(currency, 'currency');

    const trimmed = currency.trim();

    if (trimmed.length === 0) {
      throw new Error('Currency cannot be empty');
    }

    // ISO 4217 currency codes are exactly 3 uppercase letters
    const currencyRegex = /^[A-Z]{3}$/;

    if (!currencyRegex.test(trimmed.toUpperCase())) {
      throw new Error(
        `Invalid currency code: ${currency}. Must be a 3-letter ISO 4217 code (e.g., USD, EUR, GBP)`
      );
    }
  }

  /**
   * Asserts that two Money instances have the same currency
   *
   * @param other - Money to compare currency with
   * @throws {Error} If currencies don't match
   * @private
   */
  private assertSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error(
        `Cannot perform operation on different currencies: ${this._currency} and ${other._currency}`
      );
    }
  }
}
