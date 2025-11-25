/**
 * Address Value Object
 *
 * Represents a physical address with street, city, state, postal code, and country.
 * Ensures consistent address handling and formatting across the domain.
 *
 * @module shared-domain/value-objects
 *
 * @example
 * ```typescript
 * const address = Address.create({
 *   street: '123 Main St',
 *   city: 'San Francisco',
 *   state: 'CA',
 *   postalCode: '94102',
 *   country: 'USA'
 * });
 * console.log(address.toString());
 * // "123 Main St, San Francisco, CA 94102, USA"
 * ```
 */

import { ValueObject } from './value-object';

/**
 * Address value type
 */
export interface AddressValue {
  readonly street: string;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly country: string;
}

/**
 * Address creation input (all fields required)
 */
export interface CreateAddressInput {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * Address value object
 *
 * Provides:
 * - Address validation
 * - Consistent formatting
 * - Field normalization
 * - Structured address components
 */
export class Address extends ValueObject<AddressValue> {
  private readonly _street: string;
  private readonly _city: string;
  private readonly _state: string;
  private readonly _postalCode: string;
  private readonly _country: string;

  /**
   * Private constructor to enforce factory pattern
   *
   * @param street - Street address
   * @param city - City name
   * @param state - State/province/region
   * @param postalCode - Postal/ZIP code
   * @param country - Country name or code
   * @private
   */
  private constructor(
    street: string,
    city: string,
    state: string,
    postalCode: string,
    country: string
  ) {
    super();
    this._street = street;
    this._city = city;
    this._state = state;
    this._postalCode = postalCode;
    this._country = country;
  }

  /**
   * Creates a new Address value object
   *
   * @param input - Address components
   * @returns A new Address instance
   * @throws {Error} If any address field is invalid
   *
   * @example
   * ```typescript
   * const address = Address.create({
   *   street: '123 Main St, Apt 4B',
   *   city: 'New York',
   *   state: 'NY',
   *   postalCode: '10001',
   *   country: 'USA'
   * });
   * ```
   */
  public static create(input: CreateAddressInput): Address {
    // Validate all required fields are present
    Address.validateInput(input);

    // Validate and normalize each field
    const street = Address.validateAndNormalizeStreet(input.street);
    const city = Address.validateAndNormalizeCity(input.city);
    const state = Address.validateAndNormalizeState(input.state);
    const postalCode = Address.validateAndNormalizePostalCode(input.postalCode);
    const country = Address.validateAndNormalizeCountry(input.country);

    return new Address(street, city, state, postalCode, country);
  }

  /**
   * Gets the street address
   * @readonly
   */
  public get street(): string {
    return this._street;
  }

  /**
   * Gets the city
   * @readonly
   */
  public get city(): string {
    return this._city;
  }

  /**
   * Gets the state/province/region
   * @readonly
   */
  public get state(): string {
    return this._state;
  }

  /**
   * Gets the postal/ZIP code
   * @readonly
   */
  public get postalCode(): string {
    return this._postalCode;
  }

  /**
   * Gets the country
   * @readonly
   */
  public get country(): string {
    return this._country;
  }

  /**
   * Gets formatted single-line address
   *
   * @returns Address formatted as: "Street, City, State PostalCode, Country"
   *
   * @example
   * ```typescript
   * const address = Address.create({...});
   * console.log(address.getFormattedAddress());
   * // "123 Main St, San Francisco, CA 94102, USA"
   * ```
   */
  public getFormattedAddress(): string {
    return `${this._street}, ${this._city}, ${this._state} ${this._postalCode}, ${this._country}`;
  }

  /**
   * Gets formatted multi-line address
   *
   * @returns Address formatted as array of lines
   *
   * @example
   * ```typescript
   * const address = Address.create({...});
   * const lines = address.getMultiLineAddress();
   * // [
   * //   "123 Main St",
   * //   "San Francisco, CA 94102",
   * //   "USA"
   * // ]
   * ```
   */
  public getMultiLineAddress(): string[] {
    return [
      this._street,
      `${this._city}, ${this._state} ${this._postalCode}`,
      this._country,
    ];
  }

  /**
   * Checks if this is a US address
   *
   * @returns true if country is USA/US
   */
  public isUSAddress(): boolean {
    const normalized = this._country.toUpperCase();
    return normalized === 'USA' || normalized === 'US' || normalized === 'UNITED STATES';
  }

  /**
   * Compares this address with another for equality
   *
   * @param other - The address to compare with
   * @returns true if all address fields are equal
   */
  public equals(other: ValueObject<AddressValue>): boolean {
    if (!(other instanceof Address)) {
      return false;
    }

    return (
      this._street === other._street &&
      this._city === other._city &&
      this._state === other._state &&
      this._postalCode === other._postalCode &&
      this._country === other._country
    );
  }

  /**
   * Returns string representation (formatted single-line address)
   *
   * @returns The formatted address
   */
  public toString(): string {
    return this.getFormattedAddress();
  }

  /**
   * Validates that all required input fields are present
   *
   * @param input - Input to validate
   * @throws {Error} If any required field is missing
   * @private
   */
  private static validateInput(input: CreateAddressInput): void {
    if (!input) {
      throw new Error('Address input cannot be null or undefined');
    }

    const requiredFields: (keyof CreateAddressInput)[] = [
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

  /**
   * Validates and normalizes street address
   *
   * @param street - Street to validate
   * @returns Normalized street
   * @throws {Error} If street is invalid
   * @private
   */
  private static validateAndNormalizeStreet(street: string): string {
    ValueObject.checkNotEmpty(street, 'street');

    const trimmed = street.trim();

    if (trimmed.length < 3) {
      throw new Error('Street address must be at least 3 characters');
    }

    if (trimmed.length > 200) {
      throw new Error('Street address cannot exceed 200 characters');
    }

    return trimmed;
  }

  /**
   * Validates and normalizes city
   *
   * @param city - City to validate
   * @returns Normalized city
   * @throws {Error} If city is invalid
   * @private
   */
  private static validateAndNormalizeCity(city: string): string {
    ValueObject.checkNotEmpty(city, 'city');

    const trimmed = city.trim();

    if (trimmed.length < 2) {
      throw new Error('City must be at least 2 characters');
    }

    if (trimmed.length > 100) {
      throw new Error('City cannot exceed 100 characters');
    }

    // Validate contains only letters, spaces, hyphens, apostrophes
    const cityRegex = /^[a-zA-Z\s\-'.]+$/;
    if (!cityRegex.test(trimmed)) {
      throw new Error('City contains invalid characters');
    }

    return trimmed;
  }

  /**
   * Validates and normalizes state/province
   *
   * @param state - State to validate
   * @returns Normalized state
   * @throws {Error} If state is invalid
   * @private
   */
  private static validateAndNormalizeState(state: string): string {
    ValueObject.checkNotEmpty(state, 'state');

    const trimmed = state.trim();

    if (trimmed.length < 2) {
      throw new Error('State must be at least 2 characters');
    }

    if (trimmed.length > 50) {
      throw new Error('State cannot exceed 50 characters');
    }

    return trimmed;
  }

  /**
   * Validates and normalizes postal code
   *
   * @param postalCode - Postal code to validate
   * @returns Normalized postal code
   * @throws {Error} If postal code is invalid
   * @private
   */
  private static validateAndNormalizePostalCode(postalCode: string): string {
    ValueObject.checkNotEmpty(postalCode, 'postalCode');

    const trimmed = postalCode.trim();

    if (trimmed.length < 3) {
      throw new Error('Postal code must be at least 3 characters');
    }

    if (trimmed.length > 20) {
      throw new Error('Postal code cannot exceed 20 characters');
    }

    // Allow alphanumeric, spaces, hyphens (covers most international formats)
    const postalRegex = /^[a-zA-Z0-9\s\-]+$/;
    if (!postalRegex.test(trimmed)) {
      throw new Error('Postal code contains invalid characters');
    }

    return trimmed;
  }

  /**
   * Validates and normalizes country
   *
   * @param country - Country to validate
   * @returns Normalized country
   * @throws {Error} If country is invalid
   * @private
   */
  private static validateAndNormalizeCountry(country: string): string {
    ValueObject.checkNotEmpty(country, 'country');

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
