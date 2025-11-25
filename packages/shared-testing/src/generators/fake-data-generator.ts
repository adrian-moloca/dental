// @ts-nocheck
/**
 * Fake Data Generator
 * Generates fake data for testing WITHOUT using external libraries
 * STRICT NO PHI POLICY: All generated data is obviously fake
 *
 * @module shared-testing/generators
 */

import type { AddressValue } from '@dentalos/shared-domain';
import { randomBytes } from 'crypto';

/**
 * Generates a fake email address
 * Format: test-{random}@example.com
 *
 * @returns Fake email address
 *
 * @example
 * ```typescript
 * const email = generateFakeEmail();
 * // 'test-a1b2c3@example.com'
 * ```
 */
export function generateFakeEmail(): string {
  const random = randomBytes(3).toString('hex');
  return `test-${random}@example.com`;
}

/**
 * Generates a deterministic fake email from a seed
 *
 * @param seed - Seed for deterministic generation
 * @returns Fake email address
 *
 * @example
 * ```typescript
 * const email = generateDeterministicEmail('user1');
 * // 'test-user1@example.com'
 * ```
 */
export function generateDeterministicEmail(seed: string): string {
  return `test-${seed}@example.com`;
}

/**
 * Generates a fake phone number
 * Format: +1-555-{random} (North American format)
 *
 * @returns Fake phone number
 *
 * @example
 * ```typescript
 * const phone = generateFakePhone();
 * // '+1-555-0123'
 * ```
 */
export function generateFakePhone(): string {
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `+1-555-${random}`;
}

/**
 * Generates a fake name
 * Format: Test User {random}
 *
 * @returns Fake name
 *
 * @example
 * ```typescript
 * const name = generateFakeName();
 * // 'Test User 123'
 * ```
 */
export function generateFakeName(): string {
  const random = Math.floor(Math.random() * 1000);
  return `Test User ${random}`;
}

/**
 * Generates a fake first name
 *
 * @returns Fake first name
 */
export function generateFakeFirstName(): string {
  const names = ['Test', 'Sample', 'Demo', 'Example', 'Mock'];
  const index = Math.floor(Math.random() * names.length);
  return names[index];
}

/**
 * Generates a fake last name
 *
 * @returns Fake last name
 */
export function generateFakeLastName(): string {
  const random = Math.floor(Math.random() * 1000);
  return `User${random}`;
}

/**
 * Generates a fake address
 * All addresses use obviously fake data
 *
 * @returns Fake address value
 *
 * @example
 * ```typescript
 * const address = generateFakeAddress();
 * // {
 * //   street1: '123 Test Street',
 * //   city: 'Test City',
 * //   state: 'TS',
 * //   postalCode: '12345',
 * //   country: 'US'
 * // }
 * ```
 */
export function generateFakeAddress(): AddressValue {
  const streetNumber = Math.floor(Math.random() * 9999) + 1;
  const zip = Math.floor(Math.random() * 90000) + 10000;

  return {
    street1: `${streetNumber} Test Street`,
    city: 'Test City',
    state: 'TS',
    postalCode: zip.toString(),
    country: 'US',
  };
}

/**
 * Generates a fake street address
 *
 * @returns Fake street address
 */
export function generateFakeStreet(): string {
  const streetNumber = Math.floor(Math.random() * 9999) + 1;
  const streets = ['Test St', 'Sample Ave', 'Demo Blvd', 'Example Rd', 'Mock Ln'];
  const index = Math.floor(Math.random() * streets.length);
  return `${streetNumber} ${streets[index]}`;
}

/**
 * Generates a fake city name
 *
 * @returns Fake city name
 */
export function generateFakeCity(): string {
  const cities = ['Test City', 'Sample Town', 'Demo Village', 'Example City', 'Mock City'];
  const index = Math.floor(Math.random() * cities.length);
  return cities[index];
}

/**
 * Generates a fake US state code
 *
 * @returns Two-letter state code
 */
export function generateFakeStateCode(): string {
  const states = ['TS', 'SM', 'DM', 'EX', 'MK'];
  const index = Math.floor(Math.random() * states.length);
  return states[index];
}

/**
 * Generates a fake postal code
 *
 * @returns Five-digit postal code
 */
export function generateFakePostalCode(): string {
  const zip = Math.floor(Math.random() * 90000) + 10000;
  return zip.toString();
}

/**
 * Generates a fake description text
 *
 * @param words - Number of words (default: 10)
 * @returns Fake description
 */
export function generateFakeDescription(words: number = 10): string {
  const loremWords = [
    'test', 'sample', 'demo', 'example', 'mock', 'data',
    'value', 'item', 'entity', 'object', 'record', 'field'
  ];

  const result: string[] = [];
  for (let i = 0; i < words; i++) {
    const index = Math.floor(Math.random() * loremWords.length);
    result.push(loremWords[index]);
  }

  return result.join(' ');
}

/**
 * Generates a random date within a range
 *
 * @param start - Start date
 * @param end - End date
 * @returns Random date
 */
export function generateRandomDate(start: Date = new Date(2020, 0, 1), end: Date = new Date()): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime);
}

/**
 * Generates a future date
 *
 * @param daysFromNow - Days from now (default: 30)
 * @returns Future date
 */
export function generateFutureDate(daysFromNow: number = 30): Date {
  const now = new Date();
  const future = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
  return future;
}

/**
 * Generates a past date
 *
 * @param daysAgo - Days ago (default: 30)
 * @returns Past date
 */
export function generatePastDate(daysAgo: number = 30): Date {
  const now = new Date();
  const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return past;
}
// @ts-nocheck
