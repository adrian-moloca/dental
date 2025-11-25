/**
 * Value Object exports
 * @module shared-domain/value-objects
 */

// Base class
export { ValueObject } from './value-object';

// Simple value objects
export { Email } from './email';
export { Phone } from './phone';
export { PersonName } from './person-name';
export type { PersonNameValue } from './person-name';

// Complex value objects
export { Money } from './money';
export type { MoneyValue } from './money';

export { Address } from './address';
export type { AddressValue, CreateAddressInput } from './address';

export { DateRange } from './date-range';
export type { DateRangeValue } from './date-range';

export { TimeSlot } from './time-slot';
export type { TimeSlotValue } from './time-slot';
