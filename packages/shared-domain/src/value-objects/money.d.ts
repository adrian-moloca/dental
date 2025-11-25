import { ValueObject } from './value-object';
export interface MoneyValue {
    readonly amount: number;
    readonly currency: string;
}
export declare class Money extends ValueObject<MoneyValue> {
    private readonly _amount;
    private readonly _currency;
    private static readonly DECIMAL_PRECISION;
    private static readonly PRECISION_FACTOR;
    private constructor();
    static create(amount: number, currency: string): Money;
    static zero(currency: string): Money;
    get amount(): number;
    get currency(): string;
    add(other: Money): Money;
    subtract(other: Money): Money;
    multiply(factor: number): Money;
    divide(divisor: number): Money;
    isZero(): boolean;
    isPositive(): boolean;
    isNegative(): boolean;
    isGreaterThan(other: Money): boolean;
    isLessThan(other: Money): boolean;
    abs(): Money;
    negate(): Money;
    equals(other: ValueObject<MoneyValue>): boolean;
    toString(): string;
    toLocaleString(locale?: string): string;
    private static round;
    private static validateAmount;
    private static validateCurrency;
    private assertSameCurrency;
}
