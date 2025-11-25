import { ValueObject } from './value-object';
export interface PersonNameValue {
    readonly firstName: string;
    readonly lastName: string;
    readonly middleName?: string;
}
export declare class PersonName extends ValueObject<PersonNameValue> {
    private readonly _firstName;
    private readonly _lastName;
    private readonly _middleName;
    private constructor();
    static create(firstName: string, lastName: string, middleName?: string): PersonName;
    get firstName(): string;
    get lastName(): string;
    get middleName(): string | undefined;
    getDisplayName(): string;
    getFullName(): string;
    getFormalName(): string;
    getInitials(includeMiddle?: boolean): string;
    hasMiddleName(): boolean;
    equals(other: ValueObject<PersonNameValue>): boolean;
    toString(): string;
    private static validateAndNormalize;
    private static capitalize;
}
