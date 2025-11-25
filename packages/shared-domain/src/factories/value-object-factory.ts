/**
 * Value Object Factory
 *
 * Provides centralized factory methods for creating value objects with
 * consistent error handling and validation.
 *
 * @module shared-domain/factories
 */

import { Email } from '../value-objects/email';
import { Phone } from '../value-objects/phone';
import { Money } from '../value-objects/money';
import { Address, CreateAddressInput } from '../value-objects/address';
import { PersonName } from '../value-objects/person-name';
import { DateRange } from '../value-objects/date-range';
import { TimeSlot } from '../value-objects/time-slot';

/**
 * Factory result type
 */
export interface FactoryResult<T> {
  success: boolean;
  value?: T;
  error?: string;
}

/**
 * Value Object Factory
 *
 * Provides convenient factory methods for creating value objects with
 * enhanced error handling and validation feedback.
 */
export class ValueObjectFactory {
  // ============================================================================
  // Email Factory Methods
  // ============================================================================

  /**
   * Creates an Email value object
   *
   * @param email - Email address string
   * @returns Email value object
   * @throws {Error} If email is invalid
   */
  public static createEmail(email: string): Email {
    return Email.create(email);
  }

  /**
   * Safely creates an Email value object (no throw)
   *
   * @param email - Email address string
   * @returns Factory result with Email or error
   */
  public static createEmailSafe(email: string): FactoryResult<Email> {
    try {
      return {
        success: true,
        value: Email.create(email),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ============================================================================
  // Phone Factory Methods
  // ============================================================================

  /**
   * Creates a Phone value object
   *
   * @param phone - Phone number in E.164 format
   * @returns Phone value object
   * @throws {Error} If phone is invalid
   */
  public static createPhone(phone: string): Phone {
    return Phone.create(phone);
  }

  /**
   * Safely creates a Phone value object (no throw)
   *
   * @param phone - Phone number in E.164 format
   * @returns Factory result with Phone or error
   */
  public static createPhoneSafe(phone: string): FactoryResult<Phone> {
    try {
      return {
        success: true,
        value: Phone.create(phone),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ============================================================================
  // Money Factory Methods
  // ============================================================================

  /**
   * Creates a Money value object
   *
   * @param amount - Monetary amount
   * @param currency - ISO 4217 currency code
   * @returns Money value object
   * @throws {Error} If amount or currency is invalid
   */
  public static createMoney(amount: number, currency: string): Money {
    return Money.create(amount, currency);
  }

  /**
   * Safely creates a Money value object (no throw)
   *
   * @param amount - Monetary amount
   * @param currency - ISO 4217 currency code
   * @returns Factory result with Money or error
   */
  public static createMoneySafe(
    amount: number,
    currency: string
  ): FactoryResult<Money> {
    try {
      return {
        success: true,
        value: Money.create(amount, currency),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Creates a zero Money value object
   *
   * @param currency - ISO 4217 currency code
   * @returns Money value object with amount 0
   */
  public static createZeroMoney(currency: string): Money {
    return Money.zero(currency);
  }

  // ============================================================================
  // Address Factory Methods
  // ============================================================================

  /**
   * Creates an Address value object
   *
   * @param input - Address components
   * @returns Address value object
   * @throws {Error} If address is invalid
   */
  public static createAddress(input: CreateAddressInput): Address {
    return Address.create(input);
  }

  /**
   * Safely creates an Address value object (no throw)
   *
   * @param input - Address components
   * @returns Factory result with Address or error
   */
  public static createAddressSafe(
    input: CreateAddressInput
  ): FactoryResult<Address> {
    try {
      return {
        success: true,
        value: Address.create(input),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ============================================================================
  // PersonName Factory Methods
  // ============================================================================

  /**
   * Creates a PersonName value object
   *
   * @param firstName - First name
   * @param lastName - Last name
   * @param middleName - Optional middle name
   * @returns PersonName value object
   * @throws {Error} If name is invalid
   */
  public static createPersonName(
    firstName: string,
    lastName: string,
    middleName?: string
  ): PersonName {
    return PersonName.create(firstName, lastName, middleName);
  }

  /**
   * Safely creates a PersonName value object (no throw)
   *
   * @param firstName - First name
   * @param lastName - Last name
   * @param middleName - Optional middle name
   * @returns Factory result with PersonName or error
   */
  public static createPersonNameSafe(
    firstName: string,
    lastName: string,
    middleName?: string
  ): FactoryResult<PersonName> {
    try {
      return {
        success: true,
        value: PersonName.create(firstName, lastName, middleName),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ============================================================================
  // DateRange Factory Methods
  // ============================================================================

  /**
   * Creates a DateRange value object
   *
   * @param start - Start date
   * @param end - End date
   * @returns DateRange value object
   * @throws {Error} If date range is invalid
   */
  public static createDateRange(start: Date, end: Date): DateRange {
    return DateRange.create(start, end);
  }

  /**
   * Safely creates a DateRange value object (no throw)
   *
   * @param start - Start date
   * @param end - End date
   * @returns Factory result with DateRange or error
   */
  public static createDateRangeSafe(
    start: Date,
    end: Date
  ): FactoryResult<DateRange> {
    try {
      return {
        success: true,
        value: DateRange.create(start, end),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Creates a DateRange for a single day
   *
   * @param date - The date
   * @returns DateRange spanning the entire day
   */
  public static createDateRangeForDay(date: Date): DateRange {
    return DateRange.forDay(date);
  }

  /**
   * Creates a DateRange for a month
   *
   * @param year - Year
   * @param month - Month (1-12)
   * @returns DateRange spanning the entire month
   */
  public static createDateRangeForMonth(year: number, month: number): DateRange {
    return DateRange.forMonth(year, month);
  }

  // ============================================================================
  // TimeSlot Factory Methods
  // ============================================================================

  /**
   * Creates a TimeSlot value object
   *
   * @param startTime - Start time
   * @param endTime - End time
   * @returns TimeSlot value object
   * @throws {Error} If time slot is invalid
   */
  public static createTimeSlot(startTime: Date, endTime: Date): TimeSlot {
    return TimeSlot.create(startTime, endTime);
  }

  /**
   * Safely creates a TimeSlot value object (no throw)
   *
   * @param startTime - Start time
   * @param endTime - End time
   * @returns Factory result with TimeSlot or error
   */
  public static createTimeSlotSafe(
    startTime: Date,
    endTime: Date
  ): FactoryResult<TimeSlot> {
    try {
      return {
        success: true,
        value: TimeSlot.create(startTime, endTime),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Creates a TimeSlot with a specific duration
   *
   * @param startTime - Start time
   * @param durationMinutes - Duration in minutes
   * @returns TimeSlot value object
   * @throws {Error} If parameters are invalid
   */
  public static createTimeSlotWithDuration(
    startTime: Date,
    durationMinutes: number
  ): TimeSlot {
    return TimeSlot.withDuration(startTime, durationMinutes);
  }

  /**
   * Safely creates a TimeSlot with a specific duration (no throw)
   *
   * @param startTime - Start time
   * @param durationMinutes - Duration in minutes
   * @returns Factory result with TimeSlot or error
   */
  public static createTimeSlotWithDurationSafe(
    startTime: Date,
    durationMinutes: number
  ): FactoryResult<TimeSlot> {
    try {
      return {
        success: true,
        value: TimeSlot.withDuration(startTime, durationMinutes),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
