/**
 * TimeSlot Value Object
 *
 * Represents a time slot with start and end times for appointments, schedules, etc.
 * Ensures that end time is always after start time.
 *
 * IMPORTANT: All times are stored and handled in UTC. The application layer
 * is responsible for timezone conversions for display purposes.
 *
 * @module shared-domain/value-objects
 *
 * @example
 * ```typescript
 * const slot = TimeSlot.create(
 *   new Date('2025-01-15T09:00:00Z'),
 *   new Date('2025-01-15T10:00:00Z')
 * );
 * console.log(slot.getDurationMinutes()); // 60
 * ```
 */

import { ValueObject } from './value-object';

/**
 * Time slot value type
 */
export interface TimeSlotValue {
  readonly startTime: Date;
  readonly endTime: Date;
}

/**
 * TimeSlot value object
 *
 * Provides:
 * - Time slot validation (endTime > startTime)
 * - Duration calculation in minutes
 * - Overlap detection with other time slots
 * - Time containment checks
 * - UTC-based time handling
 */
export class TimeSlot extends ValueObject<TimeSlotValue> {
  private readonly _startTime: Date;
  private readonly _endTime: Date;

  // Minimum slot duration in minutes
  private static readonly MIN_DURATION_MINUTES = 1;
  // Maximum slot duration in hours (24 hours)
  private static readonly MAX_DURATION_HOURS = 24;

  /**
   * Private constructor to enforce factory pattern
   *
   * @param startTime - Start time of the slot (UTC)
   * @param endTime - End time of the slot (UTC)
   * @private
   */
  private constructor(startTime: Date, endTime: Date) {
    super();
    this._startTime = new Date(startTime);
    this._endTime = new Date(endTime);
  }

  /**
   * Creates a new TimeSlot value object
   *
   * @param startTime - Start time of the slot
   * @param endTime - End time of the slot
   * @returns A new TimeSlot instance
   * @throws {Error} If times are invalid or endTime is not after startTime
   *
   * @example
   * ```typescript
   * const slot = TimeSlot.create(
   *   new Date('2025-01-15T09:00:00Z'),
   *   new Date('2025-01-15T10:00:00Z')
   * );
   * ```
   */
  public static create(startTime: Date, endTime: Date): TimeSlot {
    // Validate times
    TimeSlot.validateTime(startTime, 'startTime');
    TimeSlot.validateTime(endTime, 'endTime');

    // Validate order (endTime must be AFTER startTime, not equal)
    if (endTime <= startTime) {
      throw new Error(
        `End time (${endTime.toISOString()}) must be after start time (${startTime.toISOString()})`
      );
    }

    // Calculate duration
    const durationMinutes =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60);

    // Validate minimum duration
    if (durationMinutes < TimeSlot.MIN_DURATION_MINUTES) {
      throw new Error(
        `Time slot duration must be at least ${TimeSlot.MIN_DURATION_MINUTES} minute(s)`
      );
    }

    // Validate maximum duration
    const maxDurationMinutes = TimeSlot.MAX_DURATION_HOURS * 60;
    if (durationMinutes > maxDurationMinutes) {
      throw new Error(
        `Time slot duration cannot exceed ${TimeSlot.MAX_DURATION_HOURS} hours`
      );
    }

    return new TimeSlot(startTime, endTime);
  }

  /**
   * Creates a TimeSlot with a specific duration
   *
   * @param startTime - Start time of the slot
   * @param durationMinutes - Duration in minutes
   * @returns A new TimeSlot instance
   * @throws {Error} If duration is invalid
   *
   * @example
   * ```typescript
   * const slot = TimeSlot.withDuration(
   *   new Date('2025-01-15T09:00:00Z'),
   *   60 // 1 hour
   * );
   * ```
   */
  public static withDuration(
    startTime: Date,
    durationMinutes: number
  ): TimeSlot {
    TimeSlot.validateTime(startTime, 'startTime');

    if (typeof durationMinutes !== 'number' || !isFinite(durationMinutes)) {
      throw new Error('Duration must be a finite number');
    }

    if (durationMinutes < TimeSlot.MIN_DURATION_MINUTES) {
      throw new Error(
        `Duration must be at least ${TimeSlot.MIN_DURATION_MINUTES} minute(s)`
      );
    }

    const maxDurationMinutes = TimeSlot.MAX_DURATION_HOURS * 60;
    if (durationMinutes > maxDurationMinutes) {
      throw new Error(
        `Duration cannot exceed ${TimeSlot.MAX_DURATION_HOURS} hours`
      );
    }

    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    return new TimeSlot(startTime, endTime);
  }

  /**
   * Gets the start time
   * @readonly
   */
  public get startTime(): Date {
    return new Date(this._startTime);
  }

  /**
   * Gets the end time
   * @readonly
   */
  public get endTime(): Date {
    return new Date(this._endTime);
  }

  /**
   * Gets the duration in milliseconds
   *
   * @returns Duration in milliseconds
   */
  public getDuration(): number {
    return this._endTime.getTime() - this._startTime.getTime();
  }

  /**
   * Gets the duration in minutes
   *
   * @returns Duration in minutes
   *
   * @example
   * ```typescript
   * const slot = TimeSlot.create(
   *   new Date('2025-01-15T09:00:00Z'),
   *   new Date('2025-01-15T10:30:00Z')
   * );
   * console.log(slot.getDurationMinutes()); // 90
   * ```
   */
  public getDurationMinutes(): number {
    return Math.floor(this.getDuration() / (1000 * 60));
  }

  /**
   * Gets the duration in hours
   *
   * @returns Duration in hours (decimal)
   */
  public getDurationHours(): number {
    return this.getDurationMinutes() / 60;
  }

  /**
   * Checks if a specific time is within this slot
   *
   * @param time - Time to check
   * @returns true if time is within the slot (inclusive of start, exclusive of end)
   *
   * @example
   * ```typescript
   * const slot = TimeSlot.create(
   *   new Date('2025-01-15T09:00:00Z'),
   *   new Date('2025-01-15T10:00:00Z')
   * );
   * console.log(slot.isWithin(new Date('2025-01-15T09:30:00Z'))); // true
   * console.log(slot.isWithin(new Date('2025-01-15T10:00:00Z'))); // false
   * ```
   */
  public isWithin(time: Date): boolean {
    TimeSlot.validateTime(time, 'time');
    const timeMs = time.getTime();
    return (
      timeMs >= this._startTime.getTime() && timeMs < this._endTime.getTime()
    );
  }

  /**
   * Checks if this time slot overlaps with another time slot
   *
   * @param other - TimeSlot to check for overlap
   * @returns true if slots overlap
   *
   * @example
   * ```typescript
   * const slot1 = TimeSlot.create(
   *   new Date('2025-01-15T09:00:00Z'),
   *   new Date('2025-01-15T10:00:00Z')
   * );
   * const slot2 = TimeSlot.create(
   *   new Date('2025-01-15T09:30:00Z'),
   *   new Date('2025-01-15T10:30:00Z')
   * );
   * console.log(slot1.overlaps(slot2)); // true
   * ```
   */
  public overlaps(other: TimeSlot): boolean {
    if (!(other instanceof TimeSlot)) {
      throw new Error('Argument must be a TimeSlot instance');
    }

    // Slots overlap if one starts before the other ends
    return (
      this._startTime.getTime() < other._endTime.getTime() &&
      this._endTime.getTime() > other._startTime.getTime()
    );
  }

  /**
   * Checks if this slot completely contains another slot
   *
   * @param other - TimeSlot to check
   * @returns true if this slot completely contains the other slot
   *
   * @example
   * ```typescript
   * const outer = TimeSlot.create(
   *   new Date('2025-01-15T09:00:00Z'),
   *   new Date('2025-01-15T11:00:00Z')
   * );
   * const inner = TimeSlot.create(
   *   new Date('2025-01-15T09:30:00Z'),
   *   new Date('2025-01-15T10:30:00Z')
   * );
   * console.log(outer.contains(inner)); // true
   * ```
   */
  public contains(other: TimeSlot): boolean {
    if (!(other instanceof TimeSlot)) {
      throw new Error('Argument must be a TimeSlot instance');
    }

    return (
      this._startTime.getTime() <= other._startTime.getTime() &&
      this._endTime.getTime() >= other._endTime.getTime()
    );
  }

  /**
   * Checks if this slot is before another slot (no overlap)
   *
   * @param other - TimeSlot to compare with
   * @returns true if this slot ends before or when the other starts
   */
  public isBefore(other: TimeSlot): boolean {
    if (!(other instanceof TimeSlot)) {
      throw new Error('Argument must be a TimeSlot instance');
    }

    return this._endTime.getTime() <= other._startTime.getTime();
  }

  /**
   * Checks if this slot is after another slot (no overlap)
   *
   * @param other - TimeSlot to compare with
   * @returns true if this slot starts after or when the other ends
   */
  public isAfter(other: TimeSlot): boolean {
    if (!(other instanceof TimeSlot)) {
      throw new Error('Argument must be a TimeSlot instance');
    }

    return this._startTime.getTime() >= other._endTime.getTime();
  }

  /**
   * Checks if this slot is on the same day as another slot (UTC)
   *
   * @param other - TimeSlot to compare with
   * @returns true if both slots are on the same UTC day
   */
  public isSameDay(other: TimeSlot): boolean {
    if (!(other instanceof TimeSlot)) {
      throw new Error('Argument must be a TimeSlot instance');
    }

    const thisDate = this._startTime.toISOString().split('T')[0];
    const otherDate = other._startTime.toISOString().split('T')[0];

    return thisDate === otherDate;
  }

  /**
   * Compares this slot with another for equality
   *
   * @param other - The slot to compare with
   * @returns true if slots have the same start and end times
   */
  public equals(other: ValueObject<TimeSlotValue>): boolean {
    if (!(other instanceof TimeSlot)) {
      return false;
    }

    return (
      this._startTime.getTime() === other._startTime.getTime() &&
      this._endTime.getTime() === other._endTime.getTime()
    );
  }

  /**
   * Returns string representation
   *
   * @returns ISO time range string
   *
   * @example
   * ```typescript
   * const slot = TimeSlot.create(...);
   * console.log(slot.toString());
   * // "2025-01-15T09:00:00.000Z - 2025-01-15T10:00:00.000Z"
   * ```
   */
  public toString(): string {
    return `${this._startTime.toISOString()} - ${this._endTime.toISOString()}`;
  }

  /**
   * Returns formatted time range for display
   *
   * @param locale - Locale for formatting (default: 'en-US')
   * @param timeZone - Timezone for display (default: 'UTC')
   * @returns Formatted time range string
   *
   * @example
   * ```typescript
   * const slot = TimeSlot.create(...);
   * console.log(slot.toFormattedString('en-US', 'America/New_York'));
   * // "9:00 AM - 10:00 AM"
   * ```
   */
  public toFormattedString(
    locale: string = 'en-US',
    timeZone: string = 'UTC'
  ): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      timeZone,
    };

    const formatter = new Intl.DateTimeFormat(locale, options);

    return `${formatter.format(this._startTime)} - ${formatter.format(this._endTime)}`;
  }

  /**
   * Validates that a value is a valid Date
   *
   * @param time - Time to validate
   * @param paramName - Parameter name for error messages
   * @throws {Error} If time is invalid
   * @private
   */
  private static validateTime(time: Date, paramName: string): void {
    ValueObject.checkNotNull(time, paramName);

    if (!(time instanceof Date)) {
      throw new Error(`${paramName} must be a Date instance`);
    }

    if (isNaN(time.getTime())) {
      throw new Error(`${paramName} is an invalid date`);
    }
  }
}
