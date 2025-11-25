import { Email } from '../value-objects/email';
import { Phone } from '../value-objects/phone';
import { Money } from '../value-objects/money';
import { Address, CreateAddressInput } from '../value-objects/address';
import { PersonName } from '../value-objects/person-name';
import { DateRange } from '../value-objects/date-range';
import { TimeSlot } from '../value-objects/time-slot';
export interface FactoryResult<T> {
    success: boolean;
    value?: T;
    error?: string;
}
export declare class ValueObjectFactory {
    static createEmail(email: string): Email;
    static createEmailSafe(email: string): FactoryResult<Email>;
    static createPhone(phone: string): Phone;
    static createPhoneSafe(phone: string): FactoryResult<Phone>;
    static createMoney(amount: number, currency: string): Money;
    static createMoneySafe(amount: number, currency: string): FactoryResult<Money>;
    static createZeroMoney(currency: string): Money;
    static createAddress(input: CreateAddressInput): Address;
    static createAddressSafe(input: CreateAddressInput): FactoryResult<Address>;
    static createPersonName(firstName: string, lastName: string, middleName?: string): PersonName;
    static createPersonNameSafe(firstName: string, lastName: string, middleName?: string): FactoryResult<PersonName>;
    static createDateRange(start: Date, end: Date): DateRange;
    static createDateRangeSafe(start: Date, end: Date): FactoryResult<DateRange>;
    static createDateRangeForDay(date: Date): DateRange;
    static createDateRangeForMonth(year: number, month: number): DateRange;
    static createTimeSlot(startTime: Date, endTime: Date): TimeSlot;
    static createTimeSlotSafe(startTime: Date, endTime: Date): FactoryResult<TimeSlot>;
    static createTimeSlotWithDuration(startTime: Date, durationMinutes: number): TimeSlot;
    static createTimeSlotWithDurationSafe(startTime: Date, durationMinutes: number): FactoryResult<TimeSlot>;
}
