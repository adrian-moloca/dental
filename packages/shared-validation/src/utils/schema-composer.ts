/**
 * Schema composition and manipulation utilities
 * @module shared-validation/utils/schema-composer
 */

import { z, ZodObject, ZodRawShape, ZodTypeAny } from 'zod';

// ============================================================================
// Schema Composition Functions
// ============================================================================

/**
 * Merge multiple Zod object schemas into one
 * Later schemas override earlier ones for conflicting keys
 *
 * @param schemas - Schemas to merge
 * @returns Merged schema
 *
 * @example
 * ```typescript
 * const BaseSchema = z.object({ id: z.string() });
 * const ExtendedSchema = z.object({ name: z.string() });
 * const MergedSchema = mergeSchemas(BaseSchema, ExtendedSchema);
 * ```
 */
export function mergeSchemas<T extends ZodRawShape[]>(
  ...schemas: { [K in keyof T]: ZodObject<T[K]> }
): ZodObject<T[number]> {
  if (schemas.length === 0) {
    throw new Error('At least one schema must be provided');
  }

  let result = schemas[0];

  for (let i = 1; i < schemas.length; i++) {
    result = result.merge(schemas[i]) as ZodObject<T[number]>;
  }

  return result as ZodObject<T[number]>;
}

/**
 * Extend a base schema with additional fields
 * Alias for merge with better naming for single extension
 *
 * @param baseSchema - Base schema to extend
 * @param extensionSchema - Schema with additional fields
 * @returns Extended schema
 *
 * @example
 * ```typescript
 * const UserSchema = extendSchema(
 *   BaseEntitySchema,
 *   z.object({ email: z.string().email() })
 * );
 * ```
 */
export function extendSchema<
  T extends ZodRawShape,
  U extends ZodRawShape
>(
  baseSchema: ZodObject<T>,
  extensionSchema: ZodObject<U>
): ZodObject<T & U> {
  return baseSchema.merge(extensionSchema) as any;
}

/**
 * Make all fields in a schema optional
 * Wrapper around Zod's .partial() with better typing
 *
 * @param schema - Schema to make partial
 * @returns Schema with all optional fields
 *
 * @example
 * ```typescript
 * const UpdateUserSchema = makePartial(CreateUserSchema);
 * ```
 */
export function makePartial<T extends ZodRawShape>(
  schema: ZodObject<T>
): ZodObject<{ [K in keyof T]: z.ZodOptional<T[K]> }> {
  return schema.partial();
}

/**
 * Make specific fields in a schema optional
 *
 * @param schema - Schema to modify
 * @param fields - Array of field names to make optional
 * @returns Schema with specified fields optional
 *
 * @example
 * ```typescript
 * const PartialUserSchema = makeOptional(UserSchema, ['phoneNumber', 'bio']);
 * ```
 */
export function makeOptional<
  T extends ZodRawShape,
  K extends keyof T
>(
  schema: ZodObject<T>,
  fields: K[]
): ZodObject<{
  [P in keyof T]: P extends K ? z.ZodOptional<T[P]> : T[P];
}> {
  const shape = schema.shape;
  const newShape: Record<string, ZodTypeAny> = { ...shape };

  for (const field of fields) {
    if (field in shape) {
      newShape[field as string] = shape[field].optional();
    }
  }

  return z.object(newShape) as ZodObject<{
    [P in keyof T]: P extends K ? z.ZodOptional<T[P]> : T[P];
  }>;
}

/**
 * Make specific fields in a schema required
 *
 * @param schema - Schema to modify
 * @param fields - Array of field names to make required
 * @returns Schema with specified fields required
 *
 * @example
 * ```typescript
 * const RequiredUserSchema = makeRequired(PartialUserSchema, ['email']);
 * ```
 */
export function makeRequired<
  T extends ZodRawShape,
  K extends keyof T
>(
  schema: ZodObject<T>,
  fields: K[]
): ZodObject<T> {
  const shape = schema.shape;
  const newShape: Record<string, ZodTypeAny> = { ...shape };

  for (const field of fields) {
    if (field in shape) {
      const fieldSchema = shape[field];
      // Remove optional wrapper if present
      if (fieldSchema instanceof z.ZodOptional) {
        newShape[field as string] = fieldSchema.unwrap();
      }
    }
  }

  return z.object(newShape) as ZodObject<T>;
}

/**
 * Pick specific fields from a schema
 * Wrapper around Zod's .pick() with better typing
 *
 * @param schema - Schema to pick from
 * @param fields - Array of field names to pick
 * @returns Schema with only picked fields
 *
 * @example
 * ```typescript
 * const UserSummarySchema = pickFields(UserSchema, ['id', 'email', 'name']);
 * ```
 */
export function pickFields<
  T extends ZodRawShape,
  K extends keyof T
>(
  schema: ZodObject<T>,
  fields: K[]
): ZodObject<Pick<T, K>> {
  const fieldsObject = Object.fromEntries(
    fields.map((field): [K, true] => [field, true])
  ) as any;

  return schema.pick(fieldsObject);
}

/**
 * Omit specific fields from a schema
 * Wrapper around Zod's .omit() with better typing
 *
 * @param schema - Schema to omit from
 * @param fields - Array of field names to omit
 * @returns Schema without omitted fields
 *
 * @example
 * ```typescript
 * const PublicUserSchema = omitFields(UserSchema, ['passwordHash', 'mfaSecret']);
 * ```
 */
export function omitFields<
  T extends ZodRawShape,
  K extends keyof T
>(
  schema: ZodObject<T>,
  fields: K[]
): ZodObject<Omit<T, K>> {
  const fieldsObject = Object.fromEntries(
    fields.map((field): [K, true] => [field, true])
  ) as any;

  return schema.omit(fieldsObject) as any;
}

/**
 * Create a deep partial schema (makes nested objects optional too)
 *
 * @param schema - Schema to make deep partial
 * @returns Deep partial schema
 *
 * @example
 * ```typescript
 * const DeepPartialUserSchema = makeDeepPartial(UserSchema);
 * ```
 */
export function makeDeepPartial<T extends ZodRawShape>(
  schema: ZodObject<T>
): ZodObject<{ [K in keyof T]: z.ZodOptional<T[K]> }> {
  return schema.deepPartial() as any;
}

/**
 * Extend schema with passthrough to allow additional properties
 *
 * @param schema - Schema to modify
 * @returns Schema that allows additional properties
 *
 * @example
 * ```typescript
 * const FlexibleUserSchema = allowAdditionalProperties(UserSchema);
 * ```
 */
export function allowAdditionalProperties<T extends ZodRawShape>(
  schema: ZodObject<T>
): ZodObject<T> {
  return schema.passthrough();
}

/**
 * Make schema strict (no additional properties allowed)
 *
 * @param schema - Schema to modify
 * @returns Strict schema
 *
 * @example
 * ```typescript
 * const StrictUserSchema = makeStrict(UserSchema);
 * ```
 */
export function makeStrict<T extends ZodRawShape>(
  schema: ZodObject<T>
): ZodObject<T> {
  return schema.strict();
}
