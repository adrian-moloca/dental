/**
 * Common DTO validation schemas
 * @module shared-validation/dto/common
 */

import { z } from 'zod';
import { PositiveIntSchema, NonNegativeIntSchema, SortOrderSchema, ISODateStringSchema } from '../schemas/common.schemas';

// ============================================================================
// Pagination Schemas
// ============================================================================

/**
 * Offset-based pagination parameters schema
 */
export const OffsetPaginationParamsSchema = z.object({
  page: PositiveIntSchema.default(1),
  limit: PositiveIntSchema.max(100, 'Limit must not exceed 100').default(20),
  offset: NonNegativeIntSchema.optional(),
});

/**
 * Cursor-based pagination parameters schema
 */
export const CursorPaginationParamsSchema = z.object({
  cursor: z.string().optional(),
  limit: PositiveIntSchema.max(100, 'Limit must not exceed 100').default(20),
  direction: z.enum(['forward', 'backward'], {
    errorMap: (): { message: string } => ({ message: 'Direction must be "forward" or "backward"' }),
  }).default('forward'),
});

/**
 * Generic pagination parameters schema
 */
export const PaginationParamsSchema = z.union([
  OffsetPaginationParamsSchema,
  CursorPaginationParamsSchema,
]);

/**
 * Pagination metadata schema
 */
export const PaginationMetaSchema = z.object({
  total: NonNegativeIntSchema,
  page: PositiveIntSchema.optional(),
  limit: PositiveIntSchema,
  totalPages: NonNegativeIntSchema.optional(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
  nextCursor: z.string().nullable().optional(),
  previousCursor: z.string().nullable().optional(),
});

// ============================================================================
// Sorting Schemas
// ============================================================================

/**
 * Sort configuration schema
 */
export const SortConfigSchema = z.object({
  field: z.string().min(1, 'Sort field is required'),
  order: SortOrderSchema.default('asc'),
});

/**
 * Multi-field sort schema
 */
export const MultiSortSchema = z.array(SortConfigSchema).min(1, 'At least one sort field is required');

// ============================================================================
// Filtering Schemas
// ============================================================================

/**
 * Date range query schema
 */
export const DateRangeQuerySchema = z
  .object({
    startDate: ISODateStringSchema.optional(),
    endDate: ISODateStringSchema.optional(),
  })
  .refine(
    (data): boolean => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    },
  );

/**
 * Search query schema
 */
export const SearchQuerySchema = z.object({
  query: z.string().min(1, 'Search query cannot be empty').trim(),
  fields: z.array(z.string()).optional(),
  caseSensitive: z.boolean().default(false),
  exactMatch: z.boolean().default(false),
});

/**
 * Generic filter value schema
 */
export const FilterValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.array(z.number()),
  z.null(),
]);

/**
 * Filter operator schema
 */
export const FilterOperatorSchema = z.enum(
  ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'contains', 'startsWith', 'endsWith', 'between'],
  {
    errorMap: (): { message: string } => ({ message: 'Invalid filter operator' }),
  },
);

/**
 * Single filter condition schema
 */
export const FilterConditionSchema = z.object({
  field: z.string().min(1, 'Field name is required'),
  operator: FilterOperatorSchema,
  value: FilterValueSchema,
});

/**
 * Complex filter schema with AND/OR logic
 */
export const FilterSchema = z.object({
  conditions: z.array(FilterConditionSchema),
  logic: z.enum(['AND', 'OR'], {
    errorMap: (): { message: string } => ({ message: 'Logic must be "AND" or "OR"' }),
  }).default('AND'),
});

// ============================================================================
// Query Schemas
// ============================================================================

/**
 * Base query parameters schema
 */
export const BaseQueryParamsSchema = z.object({
  pagination: PaginationParamsSchema.optional(),
  sort: z.union([SortConfigSchema, MultiSortSchema]).optional(),
  filter: FilterSchema.optional(),
  search: SearchQuerySchema.optional(),
});

/**
 * List query parameters schema
 */
export const ListQueryParamsSchema = z.object({
  page: PositiveIntSchema.default(1),
  limit: PositiveIntSchema.max(100, 'Limit must not exceed 100').default(20),
  sortBy: z.string().optional(),
  sortOrder: SortOrderSchema.default('asc'),
  search: z.string().trim().optional(),
});

/**
 * Date range filter params schema
 */
export const DateRangeParamsSchema = z
  .object({
    from: ISODateStringSchema.optional(),
    to: ISODateStringSchema.optional(),
  })
  .refine(
    (data): boolean => {
      if (data.from && data.to) {
        return new Date(data.from) <= new Date(data.to);
      }
      return true;
    },
    {
      message: 'From date must be before or equal to to date',
      path: ['to'],
    },
  );

// ============================================================================
// Response Schemas
// ============================================================================

/**
 * Paginated response schema factory
 * Creates a paginated response schema for any data type
 */
export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T): z.ZodObject<{
  data: z.ZodArray<T>;
  meta: typeof PaginationMetaSchema;
}> {
  return z.object({
    data: z.array(itemSchema),
    meta: PaginationMetaSchema,
  });
}

/**
 * Success response schema factory
 */
export function createSuccessResponseSchema<T extends z.ZodTypeAny>(dataSchema: T): z.ZodObject<{
  success: z.ZodLiteral<true>;
  data: T;
  message: z.ZodOptional<z.ZodString>;
}> {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
  });
}

/**
 * Error response schema
 */
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
    field: z.string().optional(),
    timestamp: ISODateStringSchema.optional(),
  }),
});

/**
 * Batch operation result schema
 */
export const BatchResultSchema = z.object({
  successful: NonNegativeIntSchema,
  failed: NonNegativeIntSchema,
  total: NonNegativeIntSchema,
  errors: z.array(
    z.object({
      index: NonNegativeIntSchema,
      error: z.string(),
    }),
  ).default([]),
});

// ============================================================================
// ID Parameter Schemas
// ============================================================================

/**
 * UUID parameter schema for route params
 */
export const UUIDParamSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
});

/**
 * Multiple IDs schema for batch operations
 */
export const MultipleIDsSchema = z.object({
  ids: z.array(z.string().uuid('Invalid UUID format')).min(1, 'At least one ID is required'),
});

// ============================================================================
// Type Inference
// ============================================================================

export type OffsetPaginationParamsInput = z.input<typeof OffsetPaginationParamsSchema>;
export type OffsetPaginationParamsOutput = z.output<typeof OffsetPaginationParamsSchema>;
export type CursorPaginationParamsInput = z.input<typeof CursorPaginationParamsSchema>;
export type CursorPaginationParamsOutput = z.output<typeof CursorPaginationParamsSchema>;
export type PaginationParamsInput = z.input<typeof PaginationParamsSchema>;
export type PaginationParamsOutput = z.output<typeof PaginationParamsSchema>;
export type PaginationMetaInput = z.input<typeof PaginationMetaSchema>;
export type PaginationMetaOutput = z.output<typeof PaginationMetaSchema>;
export type SortConfigInput = z.input<typeof SortConfigSchema>;
export type SortConfigOutput = z.output<typeof SortConfigSchema>;
export type DateRangeQueryInput = z.input<typeof DateRangeQuerySchema>;
export type DateRangeQueryOutput = z.output<typeof DateRangeQuerySchema>;
export type SearchQueryInput = z.input<typeof SearchQuerySchema>;
export type SearchQueryOutput = z.output<typeof SearchQuerySchema>;
export type FilterConditionInput = z.input<typeof FilterConditionSchema>;
export type FilterConditionOutput = z.output<typeof FilterConditionSchema>;
export type FilterInput = z.input<typeof FilterSchema>;
export type FilterOutput = z.output<typeof FilterSchema>;
export type BaseQueryParamsInput = z.input<typeof BaseQueryParamsSchema>;
export type BaseQueryParamsOutput = z.output<typeof BaseQueryParamsSchema>;
export type ListQueryParamsInput = z.input<typeof ListQueryParamsSchema>;
export type ListQueryParamsOutput = z.output<typeof ListQueryParamsSchema>;
export type DateRangeParamsInput = z.input<typeof DateRangeParamsSchema>;
export type DateRangeParamsOutput = z.output<typeof DateRangeParamsSchema>;
export type ErrorResponseInput = z.input<typeof ErrorResponseSchema>;
export type ErrorResponseOutput = z.output<typeof ErrorResponseSchema>;
export type BatchResultInput = z.input<typeof BatchResultSchema>;
export type BatchResultOutput = z.output<typeof BatchResultSchema>;
export type UUIDParamInput = z.input<typeof UUIDParamSchema>;
export type UUIDParamOutput = z.output<typeof UUIDParamSchema>;
export type MultipleIDsInput = z.input<typeof MultipleIDsSchema>;
export type MultipleIDsOutput = z.output<typeof MultipleIDsSchema>;
