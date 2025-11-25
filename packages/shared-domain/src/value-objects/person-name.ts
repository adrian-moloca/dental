/**
 * PersonName Value Object
 *
 * Represents a person's name with first, last, and optional middle name.
 * Ensures consistent name handling and formatting across the domain.
 *
 * @module shared-domain/value-objects
 *
 * @example
 * ```typescript
 * const name = PersonName.create('John', 'Doe', 'Michael');
 * console.log(name.getDisplayName()); // 'John Doe'
 * console.log(name.getFullName()); // 'John Michael Doe'
 * ```
 */

import { ValueObject } from './value-object';

/**
 * Person name value type
 */
export interface PersonNameValue {
  readonly firstName: string;
  readonly lastName: string;
  readonly middleName?: string;
}

/**
 * PersonName value object
 *
 * Provides:
 * - Name validation
 * - Consistent formatting
 * - Display name generation
 * - Full name composition
 */
export class PersonName extends ValueObject<PersonNameValue> {
  private readonly _firstName: string;
  private readonly _lastName: string;
  private readonly _middleName: string | undefined;

  /**
   * Private constructor to enforce factory pattern
   *
   * @param firstName - First name (given name)
   * @param lastName - Last name (family name)
   * @param middleName - Optional middle name
   * @private
   */
  private constructor(
    firstName: string,
    lastName: string,
    middleName?: string
  ) {
    super();
    this._firstName = firstName;
    this._lastName = lastName;
    this._middleName = middleName;
  }

  /**
   * Creates a new PersonName value object
   *
   * @param firstName - First name (given name)
   * @param lastName - Last name (family name)
   * @param middleName - Optional middle name
   * @returns A new PersonName instance
   * @throws {Error} If name parts are invalid
   *
   * @example
   * ```typescript
   * const name1 = PersonName.create('John', 'Doe');
   * const name2 = PersonName.create('Jane', 'Smith', 'Marie');
   * ```
   */
  public static create(
    firstName: string,
    lastName: string,
    middleName?: string
  ): PersonName {
    // Validate and normalize first name
    const normalizedFirst = PersonName.validateAndNormalize(
      firstName,
      'firstName'
    );

    // Validate and normalize last name
    const normalizedLast = PersonName.validateAndNormalize(
      lastName,
      'lastName'
    );

    // Validate and normalize middle name if provided
    let normalizedMiddle: string | undefined;
    if (middleName !== undefined && middleName !== null) {
      normalizedMiddle = PersonName.validateAndNormalize(
        middleName,
        'middleName'
      );
    }

    return new PersonName(normalizedFirst, normalizedLast, normalizedMiddle);
  }

  /**
   * Gets the first name
   * @readonly
   */
  public get firstName(): string {
    return this._firstName;
  }

  /**
   * Gets the last name
   * @readonly
   */
  public get lastName(): string {
    return this._lastName;
  }

  /**
   * Gets the middle name (if present)
   * @readonly
   */
  public get middleName(): string | undefined {
    return this._middleName;
  }

  /**
   * Gets the display name (first name + last name)
   *
   * @returns Display name in "FirstName LastName" format
   *
   * @example
   * ```typescript
   * const name = PersonName.create('John', 'Doe', 'Michael');
   * console.log(name.getDisplayName()); // 'John Doe'
   * ```
   */
  public getDisplayName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  /**
   * Gets the full name including middle name if present
   *
   * @returns Full name in "FirstName MiddleName LastName" format
   *
   * @example
   * ```typescript
   * const name1 = PersonName.create('John', 'Doe', 'Michael');
   * console.log(name1.getFullName()); // 'John Michael Doe'
   *
   * const name2 = PersonName.create('Jane', 'Smith');
   * console.log(name2.getFullName()); // 'Jane Smith'
   * ```
   */
  public getFullName(): string {
    if (this._middleName) {
      return `${this._firstName} ${this._middleName} ${this._lastName}`;
    }
    return this.getDisplayName();
  }

  /**
   * Gets the formal name (last name, first name)
   *
   * @returns Formal name in "LastName, FirstName" format
   *
   * @example
   * ```typescript
   * const name = PersonName.create('John', 'Doe');
   * console.log(name.getFormalName()); // 'Doe, John'
   * ```
   */
  public getFormalName(): string {
    return `${this._lastName}, ${this._firstName}`;
  }

  /**
   * Gets initials from the name
   *
   * @param includeMiddle - Whether to include middle initial
   * @returns Initials in uppercase
   *
   * @example
   * ```typescript
   * const name = PersonName.create('John', 'Doe', 'Michael');
   * console.log(name.getInitials()); // 'JD'
   * console.log(name.getInitials(true)); // 'JMD'
   * ```
   */
  public getInitials(includeMiddle: boolean = false): string {
    const firstInitial = this._firstName.charAt(0).toUpperCase();
    const lastInitial = this._lastName.charAt(0).toUpperCase();

    if (includeMiddle && this._middleName) {
      const middleInitial = this._middleName.charAt(0).toUpperCase();
      return `${firstInitial}${middleInitial}${lastInitial}`;
    }

    return `${firstInitial}${lastInitial}`;
  }

  /**
   * Checks if this name has a middle name
   *
   * @returns true if middle name is present
   */
  public hasMiddleName(): boolean {
    return this._middleName !== undefined;
  }

  /**
   * Compares this name with another for equality
   *
   * @param other - The name to compare with
   * @returns true if names are equal
   */
  public equals(other: ValueObject<PersonNameValue>): boolean {
    if (!(other instanceof PersonName)) {
      return false;
    }

    return (
      this._firstName === other._firstName &&
      this._lastName === other._lastName &&
      this._middleName === other._middleName
    );
  }

  /**
   * Returns string representation (display name)
   *
   * @returns The display name
   */
  public toString(): string {
    return this.getDisplayName();
  }

  /**
   * Validates and normalizes a name part
   *
   * @param value - Name part to validate
   * @param paramName - Parameter name for error messages
   * @returns Normalized name part
   * @throws {Error} If name part is invalid
   * @private
   */
  private static validateAndNormalize(
    value: string,
    paramName: string
  ): string {
    // Check not null/undefined
    ValueObject.checkNotNull(value, paramName);

    // Trim whitespace
    const trimmed = value.trim();

    // Check not empty
    if (trimmed.length === 0) {
      throw new Error(`${paramName} cannot be empty or whitespace`);
    }

    // Check length constraints
    const MIN_LENGTH = 1;
    const MAX_LENGTH = 50;

    if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) {
      throw new Error(
        `${paramName} must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters`
      );
    }

    // Validate characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(trimmed)) {
      throw new Error(
        `${paramName} can only contain letters, spaces, hyphens, and apostrophes`
      );
    }

    // Normalize: capitalize first letter of each word
    return PersonName.capitalize(trimmed);
  }

  /**
   * Capitalizes the first letter of each word
   *
   * @param value - String to capitalize
   * @returns Capitalized string
   * @private
   */
  private static capitalize(value: string): string {
    return value
      .split(/(\s+|-|')/)
      .map((part) => {
        // Don't capitalize separators
        if (part.match(/^[\s'-]+$/)) {
          return part;
        }
        // Capitalize first letter, lowercase the rest
        if (part.length > 0) {
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        }
        return part;
      })
      .join('');
  }
}
