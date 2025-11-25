// @ts-nocheck
/**
 * Value Object Factory
 * Creates domain value objects for testing
 * Uses real domain constructors to ensure type safety
 *
 * @module shared-testing/factories
 */

import {
  Email,
  Phone,
  PersonName,
  Money,
  Address,
  DateRange,
  TimeSlot,
} from '@dentalos/shared-domain';
import type {
  PersonNameValue,
  MoneyValue,
  AddressValue,
  DateRangeValue,
  TimeSlotValue,
} from '@dentalos/shared-domain';
import type { CurrencyCode } from '@dentalos/shared-types';
import {
  generateFakeEmail,
  generateFakePhone,
  generateFakeFirstName,
  generateFakeLastName,
  generateFakeAddress,
  generateRandomDate,
  generateFutureDate,
} from '../generators/fake-data-generator';

/**
 * Creates a test Email value object
 *
 * @param local - Local part (before @), defaults to random
 * @param domain - Domain part (after @), defaults to example.com
 * @returns Email instance
 *
 * @example
 * ```typescript
 * const email = createTestEmail();
 * // Email: test-a1b2c3@example.com
 *
 * const customEmail = createTestEmail('john', 'test.com');
 * // Email: john@test.com
 * ```
 */
export function createTestEmail(local?: string, domain?: string): Email {
  if (local && domain) {
    return Email.create(`${local}@${domain}`);
  }

  if (local) {
    return Email.create(`${local}@example.com`);
  }

  return Email.create(generateFakeEmail());
}

/**
 * Creates a test Phone value object
 *
 * @param countryCode - Country code (e.g., '+1'), defaults to +1
 * @param nationalNumber - National number, defaults to random
 * @returns Phone instance
 *
 * @example
 * ```typescript
 * const phone = createTestPhone();
 * // Phone: +1-555-0123 (random)
 *
 * const customPhone = createTestPhone('+1', '5551234567');
 * // Phone: +15551234567
 * ```
 */
export function createTestPhone(countryCode?: string, nationalNumber?: string): Phone {
  if (countryCode && nationalNumber) {
    // Remove any formatting from national number
    const cleaned = nationalNumber.replace(/[\s\-()\.]/g, '');
    return Phone.create(`${countryCode}${cleaned}`);
  }

  return Phone.create(generateFakePhone());
}

/**
 * Creates a test PersonName value object
 *
 * @param firstName - First name, defaults to random
 * @param lastName - Last name, defaults to random
 * @param middleName - Optional middle name
 * @returns PersonName instance
 *
 * @example
 * ```typescript
 * const name = createTestPersonName();
 * // PersonName: Test User123
 *
 * const customName = createTestPersonName('John', 'Doe', 'Michael');
 * // PersonName: John Michael Doe
 * ```
 */
export function createTestPersonName(
  firstName?: string,
  lastName?: string,
  middleName?: string
): PersonName {
  return PersonName.create(
    firstName ?? generateFakeFirstName(),
    lastName ?? generateFakeLastName(),
    middleName
  );
}

/**
 * Creates a test Money value object
 *
 * @param amount - Monetary amount, defaults to 100.00
 * @param currency - ISO 4217 currency code, defaults to USD
 * @returns Money instance
 *
 * @example
 * ```typescript
 * const money = createTestMoney();
 * // Money: USD 100.00
 *
 * const customMoney = createTestMoney(49.99, 'EUR');
 * // Money: EUR 49.99
 * ```
 */
export function createTestMoney(amount?: number, currency?: CurrencyCode): Money {
  return Money.create(amount ?? 100.0, currency ?? 'USD');
}

/**
 * Creates a zero Money value object
 *
 * @param currency - ISO 4217 currency code, defaults to USD
 * @returns Money instance with amount 0
 */
export function createZeroMoney(currency?: CurrencyCode): Money {
  return Money.zero(currency ?? 'USD');
}

/**
 * Creates a test Address value object
 *
 * @param overrides - Partial address to override defaults
 * @returns Address instance
 *
 * @example
 * ```typescript
 * const address = createTestAddress();
 * // Address: 123 Test Street, Test City, TS 12345, US
 *
 * const customAddress = createTestAddress({
 *   street1: '456 Main St',
 *   city: 'Sample City'
 * });
 * ```
 */
export function createTestAddress(overrides?: Partial<AddressValue>): Address {
  const defaults = generateFakeAddress();

  const addressInput = {
    street: overrides?.street1 ?? defaults.street1,
    city: overrides?.city ?? defaults.city,
    state: overrides?.state ?? defaults.state,
    postalCode: overrides?.postalCode ?? defaults.postalCode,
    country: overrides?.country ?? defaults.country,
  };

  return Address.create(addressInput);
}

/**
 * Creates a test DateRange value object
 *
 * @param start - Start date, defaults to now
 * @param end - End date, defaults to 30 days from now
 * @returns DateRange instance
 *
 * @example
 * ```typescript
 * const range = createTestDateRange();
 * // DateRange: now to 30 days from now
 *
 * const customRange = createTestDateRange(
 *   new Date('2024-01-01'),
 *   new Date('2024-01-31')
 * );
 * ```
 */
export function createTestDateRange(start?: Date, end?: Date): DateRange {
  const startDate = start ?? new Date();
  const endDate = end ?? generateFutureDate(30);

  return DateRange.create(startDate, endDate);
}

/**
 * Creates a test TimeSlot value object
 *
 * @param start - Start time, defaults to now
 * @param durationMinutes - Duration in minutes, defaults to 60
 * @returns TimeSlot instance
 *
 * @example
 * ```typescript
 * const slot = createTestTimeSlot();
 * // TimeSlot: now for 60 minutes
 *
 * const customSlot = createTestTimeSlot(
 *   new Date('2024-01-01T09:00:00'),
 *   30
 * );
 * // TimeSlot: 9:00 AM for 30 minutes
 * ```
 */
export function createTestTimeSlot(start?: Date, durationMinutes?: number): TimeSlot {
  const startTime = start ?? new Date();
  const duration = durationMinutes ?? 60;

  return TimeSlot.create(startTime, duration);
}

/**
 * Creates a random test date range
 *
 * @param maxDays - Maximum days between start and end, defaults to 30
 * @returns Random DateRange
 */
export function createRandomDateRange(maxDays: number = 30): DateRange {
  const start = generateRandomDate();
  const endTime = start.getTime() + Math.random() * maxDays * 24 * 60 * 60 * 1000;
  const end = new Date(endTime);

  return DateRange.create(start, end);
}

/**
 * Creates a random test time slot
 *
 * @param maxDurationMinutes - Maximum duration in minutes, defaults to 120
 * @returns Random TimeSlot
 */
export function createRandomTimeSlot(maxDurationMinutes: number = 120): TimeSlot {
  const start = generateRandomDate();
  const duration = Math.floor(Math.random() * maxDurationMinutes) + 15; // Min 15 minutes

  return TimeSlot.create(start, duration);
}
// @ts-nocheck
