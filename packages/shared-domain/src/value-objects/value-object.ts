/**
 * Abstract base class for Value Objects
 *
 * Value Objects are immutable domain concepts that are defined by their attributes
 * rather than a unique identity. Two value objects with the same attributes are
 * considered equal.
 *
 * @module shared-domain/value-objects
 * @abstract
 *
 * @example
 * ```typescript
 * class Email extends ValueObject<string> {
 *   private constructor(private readonly _value: string) {
 *     super();
 *   }
 *
 *   public static create(email: string): Email {
 *     // validation logic
 *     return new Email(email);
 *   }
 *
 *   public equals(other: ValueObject<string>): boolean {
 *     if (!(other instanceof Email)) return false;
 *     return this._value === other._value;
 *   }
 * }
 * ```
 */
export abstract class ValueObject<T> {
  /**
   * Protected constructor to enforce factory pattern usage
   * Subclasses should use private constructors and static factory methods
   */
  protected constructor() {
    // Freeze the object to ensure immutability at runtime
    // This prevents any property modifications after construction
    Object.freeze(this);
  }

  /**
   * Compares this value object with another for equality
   *
   * Value objects are equal if all their properties are equal.
   * Implementations must compare all relevant properties.
   *
   * @param other - The value object to compare with
   * @returns true if the objects are equal, false otherwise
   *
   * @example
   * ```typescript
   * const email1 = Email.create('test@example.com');
   * const email2 = Email.create('test@example.com');
   * email1.equals(email2); // true
   * ```
   */
  public abstract equals(other: ValueObject<T>): boolean;

  /**
   * Creates a shallow copy of the value object
   *
   * Since value objects are immutable, this returns the same instance.
   * Subclasses can override this if deep copying is needed for complex structures.
   *
   * @returns A copy of this value object
   */
  public clone(): this {
    // Since value objects are immutable, we can safely return the same instance
    return this;
  }

  /**
   * Type guard to check if an object is a ValueObject instance
   *
   * @param obj - The object to check
   * @returns true if obj is a ValueObject, false otherwise
   */
  public static isValueObject(obj: unknown): obj is ValueObject<unknown> {
    return obj instanceof ValueObject;
  }

  /**
   * Performs a deep freeze on an object to ensure complete immutability
   *
   * This is useful for value objects with nested objects that need to be
   * fully immutable. Standard Object.freeze only freezes the top level.
   *
   * @param obj - The object to deep freeze
   * @returns The deeply frozen object
   *
   * @protected
   */
  protected static deepFreeze<T extends object>(obj: T): Readonly<T> {
    // Freeze the object itself
    Object.freeze(obj);

    // Recursively freeze all properties
    Object.getOwnPropertyNames(obj).forEach((prop) => {
      const value = obj[prop as keyof T];

      if (
        value !== null &&
        typeof value === 'object' &&
        !Object.isFrozen(value)
      ) {
        ValueObject.deepFreeze(value);
      }
    });

    return obj as Readonly<T>;
  }

  /**
   * Validates that a value is not null or undefined
   *
   * @param value - The value to check
   * @param paramName - Name of the parameter for error messages
   * @throws {Error} If value is null or undefined
   *
   * @protected
   */
  protected static checkNotNull<T>(
    value: T | null | undefined,
    paramName: string
  ): asserts value is T {
    if (value === null || value === undefined) {
      throw new Error(`${paramName} cannot be null or undefined`);
    }
  }

  /**
   * Validates that a string is not empty or whitespace-only
   *
   * @param value - The string to check
   * @param paramName - Name of the parameter for error messages
   * @throws {Error} If value is empty or whitespace-only
   *
   * @protected
   */
  protected static checkNotEmpty(value: string, paramName: string): void {
    ValueObject.checkNotNull(value, paramName);

    if (value.trim().length === 0) {
      throw new Error(`${paramName} cannot be empty or whitespace`);
    }
  }

  /**
   * Validates that a number is within a specified range
   *
   * @param value - The number to check
   * @param min - Minimum allowed value (inclusive)
   * @param max - Maximum allowed value (inclusive)
   * @param paramName - Name of the parameter for error messages
   * @throws {Error} If value is outside the specified range
   *
   * @protected
   */
  protected static checkRange(
    value: number,
    min: number,
    max: number,
    paramName: string
  ): void {
    ValueObject.checkNotNull(value, paramName);

    if (value < min || value > max) {
      throw new Error(
        `${paramName} must be between ${min} and ${max}, got ${value}`
      );
    }
  }

  /**
   * Validates that a value matches a regular expression pattern
   *
   * @param value - The string to validate
   * @param pattern - The regex pattern to match against
   * @param paramName - Name of the parameter for error messages
   * @param errorMessage - Custom error message (optional)
   * @throws {Error} If value doesn't match the pattern
   *
   * @protected
   */
  protected static checkPattern(
    value: string,
    pattern: RegExp,
    paramName: string,
    errorMessage?: string
  ): void {
    ValueObject.checkNotNull(value, paramName);

    if (!pattern.test(value)) {
      throw new Error(
        errorMessage || `${paramName} does not match required format`
      );
    }
  }
}
