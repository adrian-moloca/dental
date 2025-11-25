import { ValueObject } from './value-object';
export interface DateRangeValue {
    readonly start: Date;
    readonly end: Date;
}
export declare class DateRange extends ValueObject<DateRangeValue> {
    private readonly _start;
    private readonly _end;
    private constructor();
    static create(start: Date, end: Date): DateRange;
    static forDay(date: Date): DateRange;
    static forMonth(year: number, month: number): DateRange;
    get start(): Date;
    get end(): Date;
    getDuration(): number;
    getDurationDays(): number;
    getDurationHours(): number;
    contains(date: Date): boolean;
    overlaps(other: DateRange): boolean;
    includes(other: DateRange): boolean;
    isBefore(other: DateRange): boolean;
    isAfter(other: DateRange): boolean;
    equals(other: ValueObject<DateRangeValue>): boolean;
    toString(): string;
    private static validateDate;
}
