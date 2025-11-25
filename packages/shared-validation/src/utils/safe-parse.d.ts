import { ZodError, ZodSchema } from 'zod';
export interface Success<T> {
    readonly success: true;
    readonly data: T;
}
export interface Failure<E> {
    readonly success: false;
    readonly error: E;
}
export type Result<T, E> = Success<T> | Failure<E>;
export declare function isSuccess<T, E>(result: Result<T, E>): result is Success<T>;
export declare function isFailure<T, E>(result: Result<T, E>): result is Failure<E>;
export declare function safeParse<T>(schema: ZodSchema<T>, data: unknown): Result<T, ZodError>;
export declare function parseOrThrow<T>(schema: ZodSchema<T>, data: unknown): T;
export declare function parseOrDefault<T>(schema: ZodSchema<T>, data: unknown, defaultValue: T): T;
export declare function parseOrNull<T>(schema: ZodSchema<T>, data: unknown): T | null;
export declare function parseOrUndefined<T>(schema: ZodSchema<T>, data: unknown): T | undefined;
export declare function safeParseAsync<T>(schema: ZodSchema<T>, data: unknown): Promise<Result<T, ZodError>>;
export declare function parseOrThrowAsync<T>(schema: ZodSchema<T>, data: unknown): Promise<T>;
