/**
 * Type extraction utilities for Zod schemas
 * @module shared-validation/utils/type-extractors
 */

import { z, ZodSchema, ZodTypeAny } from 'zod';

// ============================================================================
// Type Extraction Utilities
// ============================================================================

/**
 * Extract input type from a Zod schema
 * Represents the type before any transformations
 *
 * @example
 * ```typescript
 * type UserInput = ExtractInput<typeof UserSchema>;
 * ```
 */
export type ExtractInput<T extends ZodTypeAny> = z.input<T>;

/**
 * Extract output type from a Zod schema
 * Represents the type after all transformations
 *
 * @example
 * ```typescript
 * type UserOutput = ExtractOutput<typeof UserSchema>;
 * ```
 */
export type ExtractOutput<T extends ZodTypeAny> = z.output<T>;

/**
 * Extract inferred type from a Zod schema
 * Alias for output type (most common use case)
 *
 * @example
 * ```typescript
 * type User = ExtractType<typeof UserSchema>;
 * ```
 */
export type ExtractType<T extends ZodTypeAny> = z.infer<T>;

/**
 * Extract shape type from a Zod object schema
 * Useful for accessing individual field schemas
 *
 * @example
 * ```typescript
 * type UserShape = ExtractShape<typeof UserSchema>;
 * const emailSchema = UserShape.email;
 * ```
 */
export type ExtractShape<T extends ZodSchema> = T extends z.ZodObject<infer S> ? S : never;

/**
 * Extract array element type from a Zod array schema
 *
 * @example
 * ```typescript
 * type User = ExtractArrayElement<typeof UsersArraySchema>;
 * ```
 */
export type ExtractArrayElement<T extends ZodTypeAny> = T extends z.ZodArray<infer E> ? z.infer<E> : never;

/**
 * Extract union type options from a Zod union schema
 *
 * @example
 * ```typescript
 * type StatusOption = ExtractUnionOptions<typeof StatusUnionSchema>;
 * ```
 */
export type ExtractUnionOptions<T extends ZodTypeAny> = T extends z.ZodUnion<infer U>
  ? U extends readonly [infer First, ...infer Rest]
    ? First extends ZodTypeAny
      ? z.infer<First> | (Rest extends readonly ZodTypeAny[] ? z.infer<Rest[number]> : never)
      : never
    : never
  : never;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get input type helper function
 * Runtime function to help with type extraction
 *
 * @param schema - Zod schema
 * @returns Type helper (for documentation purposes)
 *
 * @example
 * ```typescript
 * const inputType = extractInputType(UserSchema);
 * type UserInput = typeof inputType;
 * ```
 */
export function extractInputType<T extends ZodTypeAny>(
  _schema: T
): z.input<T> extends infer R ? R : never {
  // This is a type-level function, returns never at runtime
  return undefined as never;
}

/**
 * Get output type helper function
 * Runtime function to help with type extraction
 *
 * @param schema - Zod schema
 * @returns Type helper (for documentation purposes)
 *
 * @example
 * ```typescript
 * const outputType = extractOutputType(UserSchema);
 * type UserOutput = typeof outputType;
 * ```
 */
export function extractOutputType<T extends ZodTypeAny>(
  _schema: T
): z.output<T> extends infer R ? R : never {
  // This is a type-level function, returns never at runtime
  return undefined as never;
}

/**
 * Check if a value matches a schema's type
 * Type guard function for runtime type checking
 *
 * @param schema - Zod schema to check against
 * @param value - Value to check
 * @returns True if value matches schema
 *
 * @example
 * ```typescript
 * if (isType(UserSchema, data)) {
 *   // data is typed as User
 *   console.log(data.email);
 * }
 * ```
 */
export function isType<T extends ZodTypeAny>(
  schema: T,
  value: unknown
): value is z.infer<T> {
  const result = schema.safeParse(value);
  return result.success;
}

/**
 * Assert that a value matches a schema's type
 * Throws error if validation fails
 *
 * @param schema - Zod schema to check against
 * @param value - Value to check
 * @param errorMessage - Custom error message
 * @throws {Error} If value doesn't match schema
 *
 * @example
 * ```typescript
 * assertType(UserSchema, data);
 * // data is now typed as User
 * ```
 */
export function assertType<T extends ZodTypeAny>(
  schema: T,
  value: unknown,
  errorMessage?: string
): asserts value is z.infer<T> {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new Error(errorMessage || `Type assertion failed: ${result.error.message}`);
  }
}

// ============================================================================
// Common Type Patterns
// ============================================================================

/**
 * Nullable variant of extracted type
 *
 * @example
 * ```typescript
 * type NullableUser = Nullable<ExtractType<typeof UserSchema>>;
 * ```
 */
export type Nullable<T> = T | null;

/**
 * Optional variant of extracted type
 *
 * @example
 * ```typescript
 * type OptionalUser = Optional<ExtractType<typeof UserSchema>>;
 * ```
 */
export type Optional<T> = T | undefined;

/**
 * Maybe variant (nullable and optional) of extracted type
 *
 * @example
 * ```typescript
 * type MaybeUser = Maybe<ExtractType<typeof UserSchema>>;
 * ```
 */
export type Maybe<T> = T | null | undefined;

/**
 * Array variant of extracted type
 *
 * @example
 * ```typescript
 * type Users = ArrayOf<ExtractType<typeof UserSchema>>;
 * ```
 */
export type ArrayOf<T> = T[];

/**
 * Promise variant of extracted type
 *
 * @example
 * ```typescript
 * type UserPromise = PromiseOf<ExtractType<typeof UserSchema>>;
 * ```
 */
export type PromiseOf<T> = Promise<T>;
