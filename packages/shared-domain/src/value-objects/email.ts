/**
 * Email Value Object
 *
 * Represents a validated email address following RFC 5322 standards.
 * Ensures that all email addresses in the domain are valid and normalized.
 *
 * @module shared-domain/value-objects
 *
 * @example
 * ```typescript
 * const email = Email.create('user@example.com');
 * console.log(email.value); // 'user@example.com'
 * console.log(email.toString()); // 'user@example.com'
 * ```
 */

import { ValueObject } from './value-object';

/**
 * Email value object
 *
 * Provides:
 * - RFC 5322 email validation
 * - Case-insensitive comparison
 * - Email normalization (lowercase)
 * - Domain extraction
 */
export class Email extends ValueObject<string> {
  private readonly _value: string;

  /**
   * Private constructor to enforce factory pattern
   *
   * @param value - Validated and normalized email address
   * @private
   */
  private constructor(value: string) {
    super();
    this._value = value;
  }

  /**
   * Creates a new Email value object
   *
   * @param email - Email address to validate and create
   * @returns A new Email instance
   * @throws {Error} If email is invalid
   *
   * @example
   * ```typescript
   * const email = Email.create('user@example.com');
   * const uppercase = Email.create('USER@EXAMPLE.COM'); // Normalized to lowercase
   * ```
   */
  public static create(email: string): Email {
    // Validate not null/undefined
    ValueObject.checkNotNull(email, 'email');

    // Trim whitespace
    const trimmed = email.trim();

    // Check not empty
    if (trimmed.length === 0) {
      throw new Error('Email cannot be empty');
    }

    // Normalize to lowercase for consistency
    const normalized = trimmed.toLowerCase();

    // Validate format
    Email.validateFormat(normalized);

    // Check length constraints
    Email.validateLength(normalized);

    return new Email(normalized);
  }

  /**
   * Gets the email address value
   * @readonly
   */
  public get value(): string {
    return this._value;
  }

  /**
   * Gets the local part of the email (before @)
   *
   * @returns The local part of the email
   *
   * @example
   * ```typescript
   * const email = Email.create('user@example.com');
   * console.log(email.getLocalPart()); // 'user'
   * ```
   */
  public getLocalPart(): string {
    const atIndex = this._value.indexOf('@');
    return this._value.substring(0, atIndex);
  }

  /**
   * Gets the domain part of the email (after @)
   *
   * @returns The domain part of the email
   *
   * @example
   * ```typescript
   * const email = Email.create('user@example.com');
   * console.log(email.getDomain()); // 'example.com'
   * ```
   */
  public getDomain(): string {
    const atIndex = this._value.indexOf('@');
    return this._value.substring(atIndex + 1);
  }

  /**
   * Checks if the email belongs to a specific domain
   *
   * @param domain - Domain to check (case-insensitive)
   * @returns true if email belongs to the domain
   *
   * @example
   * ```typescript
   * const email = Email.create('user@example.com');
   * console.log(email.isFromDomain('example.com')); // true
   * console.log(email.isFromDomain('EXAMPLE.COM')); // true
   * console.log(email.isFromDomain('other.com')); // false
   * ```
   */
  public isFromDomain(domain: string): boolean {
    if (!domain) {
      return false;
    }
    return this.getDomain() === domain.toLowerCase();
  }

  /**
   * Compares this email with another for equality
   *
   * @param other - The email to compare with
   * @returns true if emails are equal
   */
  public equals(other: ValueObject<string>): boolean {
    if (!(other instanceof Email)) {
      return false;
    }

    // Emails are already normalized to lowercase
    return this._value === other._value;
  }

  /**
   * Returns string representation of the email
   *
   * @returns The email address as a string
   */
  public toString(): string {
    return this._value;
  }

  /**
   * Validates email format using RFC 5322 compliant regex
   *
   * This regex covers most common email formats while being strict enough
   * to reject obviously invalid emails.
   *
   * @param email - Email to validate
   * @throws {Error} If email format is invalid
   * @private
   */
  private static validateFormat(email: string): void {
    // RFC 5322 compliant email regex (simplified but robust)
    // Covers: local-part@domain
    // - local-part: alphanumeric, dots, hyphens, underscores, plus signs
    // - domain: alphanumeric, dots, hyphens with valid TLD
    const emailRegex =
      /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

    if (!emailRegex.test(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }

    // Additional checks for common mistakes
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

  /**
   * Validates email length constraints
   *
   * @param email - Email to validate
   * @throws {Error} If email length is invalid
   * @private
   */
  private static validateLength(email: string): void {
    // RFC 5321 specifies maximum lengths
    const MAX_EMAIL_LENGTH = 254; // Total email length
    const MAX_LOCAL_PART_LENGTH = 64;
    const MAX_DOMAIN_LENGTH = 253;

    if (email.length > MAX_EMAIL_LENGTH) {
      throw new Error(
        `Email exceeds maximum length of ${MAX_EMAIL_LENGTH} characters`
      );
    }

    const [localPart, domain] = email.split('@');

    if (localPart.length > MAX_LOCAL_PART_LENGTH) {
      throw new Error(
        `Email local part exceeds maximum length of ${MAX_LOCAL_PART_LENGTH} characters`
      );
    }

    if (domain.length > MAX_DOMAIN_LENGTH) {
      throw new Error(
        `Email domain exceeds maximum length of ${MAX_DOMAIN_LENGTH} characters`
      );
    }
  }
}
