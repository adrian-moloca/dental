/**
 * Safe parsing utilities for Zod schemas
 * @module shared-validation/utils/safe-parse
 */

import { ZodError, ZodSchema } from 'zod';

// ============================================================================
// Result Types
// ============================================================================

/**
 * Success result type
 */
export interface Success<T> {
  readonly success: true;
  readonly data: T;
}

/**
 * Failure result type
 */
export interface Failure<E> {
  readonly success: false;
  readonly error: E;
}

/**
 * Result type representing either success or failure
 */
export type Result<T, E> = Success<T> | Failure<E>;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if result is successful
 * @param result - Result to check
 * @returns True if result is successful
 */
export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result.success === true;
}

/**
 * Type guard to check if result is a failure
 * @param result - Result to check
 * @returns True if result is a failure
 */
export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return result.success === false;
}

// ============================================================================
// Safe Parse Functions
// ============================================================================

/**
 * Safely parse data against a Zod schema
 * Returns a Result type instead of throwing errors
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Result containing either validated data or ZodError
 *
 * @example
 * ```typescript
 * const result = safeParse(UserSchema, userData);
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export function safeParse<T>(schema: ZodSchema<T>, data: unknown): Result<T, ZodError> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    error: result.error,
  };
}

/**
 * Parse data and throw error if validation fails
 * Convenience wrapper around schema.parse()
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data
 * @throws {ZodError} If validation fails
 *
 * @example
 * ```typescript
 * try {
 *   const user = parseOrThrow(UserSchema, userData);
 * } catch (error) {
 *   if (error instanceof ZodError) {
 *     // Handle validation error
 *   }
 * }
 * ```
 */
export function parseOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Parse data and return default value if validation fails
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param defaultValue - Default value to return on failure
 * @returns Validated data or default value
 *
 * @example
 * ```typescript
 * const config = parseOrDefault(ConfigSchema, rawConfig, defaultConfig);
 * ```
 */
export function parseOrDefault<T>(schema: ZodSchema<T>, data: unknown, defaultValue: T): T {
  const result = schema.safeParse(data);
  return result.success ? result.data : defaultValue;
}

/**
 * Parse data and return null if validation fails
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data or null
 *
 * @example
 * ```typescript
 * const user = parseOrNull(UserSchema, userData);
 * if (user !== null) {
 *   // Use user
 * }
 * ```
 */
export function parseOrNull<T>(schema: ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Parse data and return undefined if validation fails
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data or undefined
 *
 * @example
 * ```typescript
 * const user = parseOrUndefined(UserSchema, userData);
 * if (user) {
 *   // Use user
 * }
 * ```
 */
export function parseOrUndefined<T>(schema: ZodSchema<T>, data: unknown): T | undefined {
  const result = schema.safeParse(data);
  return result.success ? result.data : undefined;
}

// ============================================================================
// Async Parse Functions
// ============================================================================

/**
 * Safely parse data asynchronously against a Zod schema
 * Useful for schemas with async refinements
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Promise of Result containing either validated data or ZodError
 *
 * @example
 * ```typescript
 * const result = await safeParseAsync(AsyncUserSchema, userData);
 * if (result.success) {
 *   console.log(result.data);
 * }
 * ```
 */
export async function safeParseAsync<T>(schema: ZodSchema<T>, data: unknown): Promise<Result<T, ZodError>> {
  const result = await schema.safeParseAsync(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    error: result.error,
  };
}

/**
 * Parse data asynchronously and throw error if validation fails
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Promise of validated data
 * @throws {ZodError} If validation fails
 */
export async function parseOrThrowAsync<T>(schema: ZodSchema<T>, data: unknown): Promise<T> {
  return await schema.parseAsync(data);
}
