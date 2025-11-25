/**
 * DateRange Value Object
 *
 * Represents a range of dates with a start and end date.
 * Ensures that end date is always after or equal to start date.
 *
 * @module shared-domain/value-objects
 *
 * @example
 * ```typescript
 * const range = DateRange.create(
 *   new Date('2025-01-01'),
 *   new Date('2025-01-31')
 * );
 * console.log(range.getDurationDays()); // 30
 * console.log(range.contains(new Date('2025-01-15'))); // true
 * ```
 */

import { ValueObject } from './value-object';

/**
 * Date range value type
 */
export interface DateRangeValue {
  readonly start: Date;
  readonly end: Date;
}

/**
 * DateRange value object
 *
 * Provides:
 * - Date range validation (end >= start)
 * - Duration calculation
 * - Overlap detection
 * - Date containment checks
 * - Range comparison
 */
export class DateRange extends ValueObject<DateRangeValue> {
  private readonly _start: Date;
  private readonly _end: Date;

  /**
   * Private constructor to enforce factory pattern
   *
   * @param start - Start date of the range
   * @param end - End date of the range
   * @private
   */
  private constructor(start: Date, end: Date) {
    super();
    this._start = new Date(start);
    this._end = new Date(end);
  }

  /**
   * Creates a new DateRange value object
   *
   * @param start - Start date of the range
   * @param end - End date of the range
   * @returns A new DateRange instance
   * @throws {Error} If dates are invalid or end is before start
   *
   * @example
   * ```typescript
   * const range = DateRange.create(
   *   new Date('2025-01-01'),
   *   new Date('2025-12-31')
   * );
   * ```
   */
  public static create(start: Date, end: Date): DateRange {
    // Validate dates
    DateRange.validateDate(start, 'start');
    DateRange.validateDate(end, 'end');

    // Validate order (end >= start)
    if (end < start) {
      throw new Error(
        `End date (${end.toISOString()}) cannot be before start date (${start.toISOString()})`
      );
    }

    return new DateRange(start, end);
  }

  /**
   * Creates a DateRange for a single day
   *
   * @param date - The date
   * @returns A DateRange spanning the entire day
   *
   * @example
   * ```typescript
   * const today = DateRange.forDay(new Date());
   * ```
   */
  public static forDay(date: Date): DateRange {
    DateRange.validateDate(date, 'date');

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return new DateRange(start, end);
  }

  /**
   * Creates a DateRange for a month
   *
   * @param year - Year (e.g., 2025)
   * @param month - Month (1-12)
   * @returns A DateRange spanning the entire month
   *
   * @example
   * ```typescript
   * const january = DateRange.forMonth(2025, 1);
   * ```
   */
  public static forMonth(year: number, month: number): DateRange {
    if (month < 1 || month > 12) {
      throw new Error('Month must be between 1 and 12');
    }

    const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    return new DateRange(start, end);
  }

  /**
   * Gets the start date
   * @readonly
   */
  public get start(): Date {
    return new Date(this._start);
  }

  /**
   * Gets the end date
   * @readonly
   */
  public get end(): Date {
    return new Date(this._end);
  }

  /**
   * Gets the duration in milliseconds
   *
   * @returns Duration in milliseconds
   */
  public getDuration(): number {
    return this._end.getTime() - this._start.getTime();
  }

  /**
   * Gets the duration in days
   *
   * @returns Duration in days (rounded down)
   *
   * @example
   * ```typescript
   * const range = DateRange.create(
   *   new Date('2025-01-01'),
   *   new Date('2025-01-31')
   * );
   * console.log(range.getDurationDays()); // 30
   * ```
   */
  public getDurationDays(): number {
    const milliseconds = this.getDuration();
    return Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  }

  /**
   * Gets the duration in hours
   *
   * @returns Duration in hours (rounded down)
   */
  public getDurationHours(): number {
    const milliseconds = this.getDuration();
    return Math.floor(milliseconds / (1000 * 60 * 60));
  }

  /**
   * Checks if this range contains a specific date
   *
   * @param date - Date to check
   * @returns true if date is within the range (inclusive)
   *
   * @example
   * ```typescript
   * const range = DateRange.create(
   *   new Date('2025-01-01'),
   *   new Date('2025-01-31')
   * );
   * console.log(range.contains(new Date('2025-01-15'))); // true
   * console.log(range.contains(new Date('2025-02-01'))); // false
   * ```
   */
  public contains(date: Date): boolean {
    DateRange.validateDate(date, 'date');
    const time = date.getTime();
    return time >= this._start.getTime() && time <= this._end.getTime();
  }

  /**
   * Checks if this range overlaps with another range
   *
   * @param other - DateRange to check for overlap
   * @returns true if ranges overlap
   *
   * @example
   * ```typescript
   * const range1 = DateRange.create(
   *   new Date('2025-01-01'),
   *   new Date('2025-01-15')
   * );
   * const range2 = DateRange.create(
   *   new Date('2025-01-10'),
   *   new Date('2025-01-20')
   * );
   * console.log(range1.overlaps(range2)); // true
   * ```
   */
  public overlaps(other: DateRange): boolean {
    if (!(other instanceof DateRange)) {
      throw new Error('Argument must be a DateRange instance');
    }

    // Ranges overlap if one starts before the other ends
    return (
      this._start.getTime() <= other._end.getTime() &&
      this._end.getTime() >= other._start.getTime()
    );
  }

  /**
   * Checks if this range completely contains another range
   *
   * @param other - DateRange to check
   * @returns true if this range completely contains the other range
   *
   * @example
   * ```typescript
   * const outer = DateRange.create(
   *   new Date('2025-01-01'),
   *   new Date('2025-12-31')
   * );
   * const inner = DateRange.create(
   *   new Date('2025-06-01'),
   *   new Date('2025-06-30')
   * );
   * console.log(outer.includes(inner)); // true
   * ```
   */
  public includes(other: DateRange): boolean {
    if (!(other instanceof DateRange)) {
      throw new Error('Argument must be a DateRange instance');
    }

    return (
      this._start.getTime() <= other._start.getTime() &&
      this._end.getTime() >= other._end.getTime()
    );
  }

  /**
   * Checks if this range is before another range
   *
   * @param other - DateRange to compare with
   * @returns true if this range ends before the other starts
   */
  public isBefore(other: DateRange): boolean {
    if (!(other instanceof DateRange)) {
      throw new Error('Argument must be a DateRange instance');
    }

    return this._end.getTime() < other._start.getTime();
  }

  /**
   * Checks if this range is after another range
   *
   * @param other - DateRange to compare with
   * @returns true if this range starts after the other ends
   */
  public isAfter(other: DateRange): boolean {
    if (!(other instanceof DateRange)) {
      throw new Error('Argument must be a DateRange instance');
    }

    return this._start.getTime() > other._end.getTime();
  }

  /**
   * Compares this range with another for equality
   *
   * @param other - The range to compare with
   * @returns true if ranges have the same start and end dates
   */
  public equals(other: ValueObject<DateRangeValue>): boolean {
    if (!(other instanceof DateRange)) {
      return false;
    }

    return (
      this._start.getTime() === other._start.getTime() &&
      this._end.getTime() === other._end.getTime()
    );
  }

  /**
   * Returns string representation
   *
   * @returns ISO date range string
   *
   * @example
   * ```typescript
   * const range = DateRange.create(...);
   * console.log(range.toString());
   * // "2025-01-01T00:00:00.000Z to 2025-01-31T23:59:59.999Z"
   * ```
   */
  public toString(): string {
    return `${this._start.toISOString()} to ${this._end.toISOString()}`;
  }

  /**
   * Validates that a value is a valid Date
   *
   * @param date - Date to validate
   * @param paramName - Parameter name for error messages
   * @throws {Error} If date is invalid
   * @private
   */
  private static validateDate(date: Date, paramName: string): void {
    ValueObject.checkNotNull(date, paramName);

    if (!(date instanceof Date)) {
      throw new Error(`${paramName} must be a Date instance`);
    }

    if (isNaN(date.getTime())) {
      throw new Error(`${paramName} is an invalid date`);
    }
  }
}
