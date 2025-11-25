"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultipleIDsSchema = exports.UUIDParamSchema = exports.BatchResultSchema = exports.ErrorResponseSchema = exports.DateRangeParamsSchema = exports.ListQueryParamsSchema = exports.BaseQueryParamsSchema = exports.FilterSchema = exports.FilterConditionSchema = exports.FilterOperatorSchema = exports.FilterValueSchema = exports.SearchQuerySchema = exports.DateRangeQuerySchema = exports.MultiSortSchema = exports.SortConfigSchema = exports.PaginationMetaSchema = exports.PaginationParamsSchema = exports.CursorPaginationParamsSchema = exports.OffsetPaginationParamsSchema = void 0;
exports.createPaginatedResponseSchema = createPaginatedResponseSchema;
exports.createSuccessResponseSchema = createSuccessResponseSchema;
const zod_1 = require("zod");
const common_schemas_1 = require("../schemas/common.schemas");
exports.OffsetPaginationParamsSchema = zod_1.z.object({
    page: common_schemas_1.PositiveIntSchema.default(1),
    limit: common_schemas_1.PositiveIntSchema.max(100, 'Limit must not exceed 100').default(20),
    offset: common_schemas_1.NonNegativeIntSchema.optional(),
});
exports.CursorPaginationParamsSchema = zod_1.z.object({
    cursor: zod_1.z.string().optional(),
    limit: common_schemas_1.PositiveIntSchema.max(100, 'Limit must not exceed 100').default(20),
    direction: zod_1.z.enum(['forward', 'backward'], {
        errorMap: () => ({ message: 'Direction must be "forward" or "backward"' }),
    }).default('forward'),
});
exports.PaginationParamsSchema = zod_1.z.union([
    exports.OffsetPaginationParamsSchema,
    exports.CursorPaginationParamsSchema,
]);
exports.PaginationMetaSchema = zod_1.z.object({
    total: common_schemas_1.NonNegativeIntSchema,
    page: common_schemas_1.PositiveIntSchema.optional(),
    limit: common_schemas_1.PositiveIntSchema,
    totalPages: common_schemas_1.NonNegativeIntSchema.optional(),
    hasNextPage: zod_1.z.boolean(),
    hasPreviousPage: zod_1.z.boolean(),
    nextCursor: zod_1.z.string().nullable().optional(),
    previousCursor: zod_1.z.string().nullable().optional(),
});
exports.SortConfigSchema = zod_1.z.object({
    field: zod_1.z.string().min(1, 'Sort field is required'),
    order: common_schemas_1.SortOrderSchema.default('asc'),
});
exports.MultiSortSchema = zod_1.z.array(exports.SortConfigSchema).min(1, 'At least one sort field is required');
exports.DateRangeQuerySchema = zod_1.z
    .object({
    startDate: common_schemas_1.ISODateStringSchema.optional(),
    endDate: common_schemas_1.ISODateStringSchema.optional(),
})
    .refine((data) => {
    if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
}, {
    message: 'Start date must be before or equal to end date',
    path: ['endDate'],
});
exports.SearchQuerySchema = zod_1.z.object({
    query: zod_1.z.string().min(1, 'Search query cannot be empty').trim(),
    fields: zod_1.z.array(zod_1.z.string()).optional(),
    caseSensitive: zod_1.z.boolean().default(false),
    exactMatch: zod_1.z.boolean().default(false),
});
exports.FilterValueSchema = zod_1.z.union([
    zod_1.z.string(),
    zod_1.z.number(),
    zod_1.z.boolean(),
    zod_1.z.array(zod_1.z.string()),
    zod_1.z.array(zod_1.z.number()),
    zod_1.z.null(),
]);
exports.FilterOperatorSchema = zod_1.z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'contains', 'startsWith', 'endsWith', 'between'], {
    errorMap: () => ({ message: 'Invalid filter operator' }),
});
exports.FilterConditionSchema = zod_1.z.object({
    field: zod_1.z.string().min(1, 'Field name is required'),
    operator: exports.FilterOperatorSchema,
    value: exports.FilterValueSchema,
});
exports.FilterSchema = zod_1.z.object({
    conditions: zod_1.z.array(exports.FilterConditionSchema),
    logic: zod_1.z.enum(['AND', 'OR'], {
        errorMap: () => ({ message: 'Logic must be "AND" or "OR"' }),
    }).default('AND'),
});
exports.BaseQueryParamsSchema = zod_1.z.object({
    pagination: exports.PaginationParamsSchema.optional(),
    sort: zod_1.z.union([exports.SortConfigSchema, exports.MultiSortSchema]).optional(),
    filter: exports.FilterSchema.optional(),
    search: exports.SearchQuerySchema.optional(),
});
exports.ListQueryParamsSchema = zod_1.z.object({
    page: common_schemas_1.PositiveIntSchema.default(1),
    limit: common_schemas_1.PositiveIntSchema.max(100, 'Limit must not exceed 100').default(20),
    sortBy: zod_1.z.string().optional(),
    sortOrder: common_schemas_1.SortOrderSchema.default('asc'),
    search: zod_1.z.string().trim().optional(),
});
exports.DateRangeParamsSchema = zod_1.z
    .object({
    from: common_schemas_1.ISODateStringSchema.optional(),
    to: common_schemas_1.ISODateStringSchema.optional(),
})
    .refine((data) => {
    if (data.from && data.to) {
        return new Date(data.from) <= new Date(data.to);
    }
    return true;
}, {
    message: 'From date must be before or equal to to date',
    path: ['to'],
});
function createPaginatedResponseSchema(itemSchema) {
    return zod_1.z.object({
        data: zod_1.z.array(itemSchema),
        meta: exports.PaginationMetaSchema,
    });
}
function createSuccessResponseSchema(dataSchema) {
    return zod_1.z.object({
        success: zod_1.z.literal(true),
        data: dataSchema,
        message: zod_1.z.string().optional(),
    });
}
exports.ErrorResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(false),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        details: zod_1.z.unknown().optional(),
        field: zod_1.z.string().optional(),
        timestamp: common_schemas_1.ISODateStringSchema.optional(),
    }),
});
exports.BatchResultSchema = zod_1.z.object({
    successful: common_schemas_1.NonNegativeIntSchema,
    failed: common_schemas_1.NonNegativeIntSchema,
    total: common_schemas_1.NonNegativeIntSchema,
    errors: zod_1.z.array(zod_1.z.object({
        index: common_schemas_1.NonNegativeIntSchema,
        error: zod_1.z.string(),
    })).default([]),
});
exports.UUIDParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid UUID format'),
});
exports.MultipleIDsSchema = zod_1.z.object({
    ids: zod_1.z.array(zod_1.z.string().uuid('Invalid UUID format')).min(1, 'At least one ID is required'),
});
//# sourceMappingURL=common.dto.js.map