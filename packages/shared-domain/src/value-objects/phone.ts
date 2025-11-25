/**
 * Phone Value Object
 *
 * Represents a validated phone number in E.164 format.
 * E.164 is the international standard for phone numbers: +[country code][number]
 *
 * @module shared-domain/value-objects
 *
 * @example
 * ```typescript
 * const phone = Phone.create('+14155552671');
 * console.log(phone.value); // '+14155552671'
 * console.log(phone.countryCode); // '+1'
 * console.log(phone.nationalNumber); // '4155552671'
 * ```
 */

import { ValueObject } from './value-object';

/**
 * Phone value object
 *
 * Provides:
 * - E.164 format validation
 * - Country code extraction
 * - National number extraction
 * - Formatted display
 */
export class Phone extends ValueObject<string> {
  private readonly _value: string;
  private readonly _countryCode: string;
  private readonly _nationalNumber: string;

  /**
   * Private constructor to enforce factory pattern
   *
   * @param value - Validated phone number in E.164 format
   * @param countryCode - Extracted country code (e.g., '+1', '+44')
   * @param nationalNumber - National number without country code
   * @private
   */
  private constructor(
    value: string,
    countryCode: string,
    nationalNumber: string
  ) {
    super();
    this._value = value;
    this._countryCode = countryCode;
    this._nationalNumber = nationalNumber;
  }

  /**
   * Creates a new Phone value object
   *
   * @param phone - Phone number (E.164 format: +[country code][number])
   * @returns A new Phone instance
   * @throws {Error} If phone number is invalid
   *
   * @example
   * ```typescript
   * const usPhone = Phone.create('+14155552671');
   * const ukPhone = Phone.create('+442071838750');
   * const dePhone = Phone.create('+4930123456');
   * ```
   */
  public static create(phone: string): Phone {
    // Validate not null/undefined
    ValueObject.checkNotNull(phone, 'phone');

    // Trim whitespace
    const trimmed = phone.trim();

    // Check not empty
    if (trimmed.length === 0) {
      throw new Error('Phone number cannot be empty');
    }

    // Normalize: remove all spaces, hyphens, parentheses
    const normalized = Phone.normalize(trimmed);

    // Validate E.164 format
    Phone.validateE164Format(normalized);

    // Extract country code and national number
    const { countryCode, nationalNumber } = Phone.parsePhone(normalized);

    return new Phone(normalized, countryCode, nationalNumber);
  }

  /**
   * Gets the full phone number in E.164 format
   * @readonly
   */
  public get value(): string {
    return this._value;
  }

  /**
   * Gets the country code (e.g., '+1', '+44', '+49')
   * @readonly
   */
  public get countryCode(): string {
    return this._countryCode;
  }

  /**
   * Gets the national number (without country code)
   * @readonly
   */
  public get nationalNumber(): string {
    return this._nationalNumber;
  }

  /**
   * Gets formatted display of the phone number
   *
   * Format depends on country code:
   * - US/Canada (+1): +1 (415) 555-2671
   * - Other: +[code] [number]
   *
   * @returns Formatted phone number
   *
   * @example
   * ```typescript
   * const phone = Phone.create('+14155552671');
   * console.log(phone.getFormatted()); // '+1 (415) 555-2671'
   * ```
   */
  public getFormatted(): string {
    // Format US/Canada numbers specially
    if (this._countryCode === '+1' && this._nationalNumber.length === 10) {
      const areaCode = this._nationalNumber.substring(0, 3);
      const exchange = this._nationalNumber.substring(3, 6);
      const line = this._nationalNumber.substring(6);
      return `${this._countryCode} (${areaCode}) ${exchange}-${line}`;
    }

    // Default format: +[code] [number]
    return `${this._countryCode} ${this._nationalNumber}`;
  }

  /**
   * Checks if this is a US/Canada phone number
   *
   * @returns true if country code is +1
   */
  public isNorthAmerican(): boolean {
    return this._countryCode === '+1';
  }

  /**
   * Checks if the phone number belongs to a specific country
   *
   * @param countryCode - Country code to check (e.g., '+1', '+44')
   * @returns true if phone belongs to the country
   *
   * @example
   * ```typescript
   * const phone = Phone.create('+14155552671');
   * console.log(phone.isFromCountry('+1')); // true
   * console.log(phone.isFromCountry('+44')); // false
   * ```
   */
  public isFromCountry(countryCode: string): boolean {
    if (!countryCode) {
      return false;
    }

    // Normalize the input country code
    const normalized = countryCode.startsWith('+')
      ? countryCode
      : `+${countryCode}`;

    return this._countryCode === normalized;
  }

  /**
   * Compares this phone with another for equality
   *
   * @param other - The phone to compare with
   * @returns true if phones are equal
   */
  public equals(other: ValueObject<string>): boolean {
    if (!(other instanceof Phone)) {
      return false;
    }

    // Compare normalized E.164 values
    return this._value === other._value;
  }

  /**
   * Returns string representation (E.164 format)
   *
   * @returns The phone number in E.164 format
   */
  public toString(): string {
    return this._value;
  }

  /**
   * Normalizes phone input by removing formatting characters
   *
   * @param phone - Phone number to normalize
   * @returns Normalized phone number
   * @private
   */
  private static normalize(phone: string): string {
    // Remove spaces, hyphens, parentheses, dots
    let normalized = phone.replace(/[\s\-()\.]/g, '');

    // Ensure it starts with +
    if (!normalized.startsWith('+')) {
      throw new Error(
        'Phone number must be in E.164 format starting with +'
      );
    }

    return normalized;
  }

  /**
   * Validates E.164 format
   *
   * E.164 format: +[country code][subscriber number]
   * - Starts with +
   * - 1-3 digit country code
   * - Up to 15 digits total (including country code)
   * - Only digits after +
   *
   * @param phone - Phone number to validate
   * @throws {Error} If phone format is invalid
   * @private
   */
  private static validateE164Format(phone: string): void {
    // E.164 regex: + followed by 1-15 digits
    const e164Regex = /^\+[1-9]\d{1,14}$/;

    if (!e164Regex.test(phone)) {
      throw new Error(
        `Invalid E.164 phone format: ${phone}. Expected format: +[country code][number] (max 15 digits)`
      );
    }

    // Additional validation: minimum length (country code + number)
    const MIN_LENGTH = 8; // +, 1-3 digit country code, at least 4 digit number
    if (phone.length < MIN_LENGTH) {
      throw new Error(
        `Phone number too short. Minimum length is ${MIN_LENGTH} characters`
      );
    }

    // Maximum length check (E.164 allows max 15 digits)
    const MAX_LENGTH = 16; // + plus 15 digits
    if (phone.length > MAX_LENGTH) {
      throw new Error(
        `Phone number too long. Maximum length is ${MAX_LENGTH} characters`
      );
    }
  }

  /**
   * Parses phone number to extract country code and national number
   *
   * @param phone - E.164 formatted phone number
   * @returns Object with country code and national number
   * @private
   */
  private static parsePhone(phone: string): {
    countryCode: string;
    nationalNumber: string;
  } {
    // Remove the leading +
    const digitsOnly = phone.substring(1);

    // Try to determine country code length (1-3 digits)
    // Common country codes:
    // - 1 digit: +1 (US/Canada), +7 (Russia)
    // - 2 digits: +44 (UK), +49 (Germany), +33 (France)
    // - 3 digits: +971 (UAE), +966 (Saudi Arabia)

    // Start with most common: check if first digit is 1 or 7
    if (digitsOnly.charAt(0) === '1' || digitsOnly.charAt(0) === '7') {
      return {
        countryCode: `+${digitsOnly.substring(0, 1)}`,
        nationalNumber: digitsOnly.substring(1),
      };
    }

    // Try 2-digit country code for most European countries
    if (digitsOnly.length >= 10) {
      // Most likely 2-digit country code
      return {
        countryCode: `+${digitsOnly.substring(0, 2)}`,
        nationalNumber: digitsOnly.substring(2),
      };
    }

    // Try 3-digit country code
    if (digitsOnly.length >= 11) {
      return {
        countryCode: `+${digitsOnly.substring(0, 3)}`,
        nationalNumber: digitsOnly.substring(3),
      };
    }

    // Default to 2-digit country code
    return {
      countryCode: `+${digitsOnly.substring(0, 2)}`,
      nationalNumber: digitsOnly.substring(2),
    };
  }
}
