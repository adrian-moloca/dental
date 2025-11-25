import { ValueObject } from './value-object';
export interface TimeSlotValue {
    readonly startTime: Date;
    readonly endTime: Date;
}
export declare class TimeSlot extends ValueObject<TimeSlotValue> {
    private readonly _startTime;
    private readonly _endTime;
    private static readonly MIN_DURATION_MINUTES;
    private static readonly MAX_DURATION_HOURS;
    private constructor();
    static create(startTime: Date, endTime: Date): TimeSlot;
    static withDuration(startTime: Date, durationMinutes: number): TimeSlot;
    get startTime(): Date;
    get endTime(): Date;
    getDuration(): number;
    getDurationMinutes(): number;
    getDurationHours(): number;
    isWithin(time: Date): boolean;
    overlaps(other: TimeSlot): boolean;
    contains(other: TimeSlot): boolean;
    isBefore(other: TimeSlot): boolean;
    isAfter(other: TimeSlot): boolean;
    isSameDay(other: TimeSlot): boolean;
    equals(other: ValueObject<TimeSlotValue>): boolean;
    toString(): string;
    toFormattedString(locale?: string, timeZone?: string): string;
    private static validateTime;
}
