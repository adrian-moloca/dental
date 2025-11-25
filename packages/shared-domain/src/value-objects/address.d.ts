import { ValueObject } from './value-object';
export interface AddressValue {
    readonly street: string;
    readonly city: string;
    readonly state: string;
    readonly postalCode: string;
    readonly country: string;
}
export interface CreateAddressInput {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}
export declare class Address extends ValueObject<AddressValue> {
    private readonly _street;
    private readonly _city;
    private readonly _state;
    private readonly _postalCode;
    private readonly _country;
    private constructor();
    static create(input: CreateAddressInput): Address;
    get street(): string;
    get city(): string;
    get state(): string;
    get postalCode(): string;
    get country(): string;
    getFormattedAddress(): string;
    getMultiLineAddress(): string[];
    isUSAddress(): boolean;
    equals(other: ValueObject<AddressValue>): boolean;
    toString(): string;
    private static validateInput;
    private static validateAndNormalizeStreet;
    private static validateAndNormalizeCity;
    private static validateAndNormalizeState;
    private static validateAndNormalizePostalCode;
    private static validateAndNormalizeCountry;
}
