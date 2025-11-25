export declare abstract class ValueObject<T> {
    protected constructor();
    abstract equals(other: ValueObject<T>): boolean;
    clone(): this;
    static isValueObject(obj: unknown): obj is ValueObject<unknown>;
    protected static deepFreeze<T extends object>(obj: T): Readonly<T>;
    protected static checkNotNull<T>(value: T | null | undefined, paramName: string): asserts value is T;
    protected static checkNotEmpty(value: string, paramName: string): void;
    protected static checkRange(value: number, min: number, max: number, paramName: string): void;
    protected static checkPattern(value: string, pattern: RegExp, paramName: string, errorMessage?: string): void;
}
