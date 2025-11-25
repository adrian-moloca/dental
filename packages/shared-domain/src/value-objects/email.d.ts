import { ValueObject } from './value-object';
export declare class Email extends ValueObject<string> {
    private readonly _value;
    private constructor();
    static create(email: string): Email;
    get value(): string;
    getLocalPart(): string;
    getDomain(): string;
    isFromDomain(domain: string): boolean;
    equals(other: ValueObject<string>): boolean;
    toString(): string;
    private static validateFormat;
    private static validateLength;
}
