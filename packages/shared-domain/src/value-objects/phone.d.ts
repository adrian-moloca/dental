import { ValueObject } from './value-object';
export declare class Phone extends ValueObject<string> {
    private readonly _value;
    private readonly _countryCode;
    private readonly _nationalNumber;
    private constructor();
    static create(phone: string): Phone;
    get value(): string;
    get countryCode(): string;
    get nationalNumber(): string;
    getFormatted(): string;
    isNorthAmerican(): boolean;
    isFromCountry(countryCode: string): boolean;
    equals(other: ValueObject<string>): boolean;
    toString(): string;
    private static normalize;
    private static validateE164Format;
    private static parsePhone;
}
