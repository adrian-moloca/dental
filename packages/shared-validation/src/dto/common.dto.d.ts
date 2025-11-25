import { z } from 'zod';
export declare const OffsetPaginationParamsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    offset?: number | undefined;
}, {
    limit?: number | undefined;
    page?: number | undefined;
    offset?: number | undefined;
}>;
export declare const CursorPaginationParamsSchema: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    direction: z.ZodDefault<z.ZodEnum<["forward", "backward"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    direction: "forward" | "backward";
    cursor?: string | undefined;
}, {
    limit?: number | undefined;
    cursor?: string | undefined;
    direction?: "forward" | "backward" | undefined;
}>;
export declare const PaginationParamsSchema: z.ZodUnion<[z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    offset?: number | undefined;
}, {
    limit?: number | undefined;
    page?: number | undefined;
    offset?: number | undefined;
}>, z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    direction: z.ZodDefault<z.ZodEnum<["forward", "backward"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    direction: "forward" | "backward";
    cursor?: string | undefined;
}, {
    limit?: number | undefined;
    cursor?: string | undefined;
    direction?: "forward" | "backward" | undefined;
}>]>;
export declare const PaginationMetaSchema: z.ZodObject<{
    total: z.ZodNumber;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodNumber;
    totalPages: z.ZodOptional<z.ZodNumber>;
    hasNextPage: z.ZodBoolean;
    hasPreviousPage: z.ZodBoolean;
    nextCursor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    previousCursor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    total: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    page?: number | undefined;
    totalPages?: number | undefined;
    nextCursor?: string | null | undefined;
    previousCursor?: string | null | undefined;
}, {
    limit: number;
    total: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    page?: number | undefined;
    totalPages?: number | undefined;
    nextCursor?: string | null | undefined;
    previousCursor?: string | null | undefined;
}>;
export declare const SortConfigSchema: z.ZodObject<{
    field: z.ZodString;
    order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    field: string;
    order: "asc" | "desc";
}, {
    field: string;
    order?: "asc" | "desc" | undefined;
}>;
export declare const MultiSortSchema: z.ZodArray<z.ZodObject<{
    field: z.ZodString;
    order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    field: string;
    order: "asc" | "desc";
}, {
    field: string;
    order?: "asc" | "desc" | undefined;
}>, "many">;
export declare const DateRangeQuerySchema: z.ZodEffects<z.ZodObject<{
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
}>, {
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export declare const SearchQuerySchema: z.ZodObject<{
    query: z.ZodString;
    fields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    caseSensitive: z.ZodDefault<z.ZodBoolean>;
    exactMatch: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    query: string;
    caseSensitive: boolean;
    exactMatch: boolean;
    fields?: string[] | undefined;
}, {
    query: string;
    fields?: string[] | undefined;
    caseSensitive?: boolean | undefined;
    exactMatch?: boolean | undefined;
}>;
export declare const FilterValueSchema: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodNumber, "many">, z.ZodNull]>;
export declare const FilterOperatorSchema: z.ZodEnum<["eq", "ne", "gt", "gte", "lt", "lte", "in", "nin", "contains", "startsWith", "endsWith", "between"]>;
export declare const FilterConditionSchema: z.ZodObject<{
    field: z.ZodString;
    operator: z.ZodEnum<["eq", "ne", "gt", "gte", "lt", "lte", "in", "nin", "contains", "startsWith", "endsWith", "between"]>;
    value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodNumber, "many">, z.ZodNull]>;
}, "strip", z.ZodTypeAny, {
    value: string | number | boolean | string[] | number[] | null;
    field: string;
    operator: "endsWith" | "startsWith" | "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "contains" | "between";
}, {
    value: string | number | boolean | string[] | number[] | null;
    field: string;
    operator: "endsWith" | "startsWith" | "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "contains" | "between";
}>;
export declare const FilterSchema: z.ZodObject<{
    conditions: z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        operator: z.ZodEnum<["eq", "ne", "gt", "gte", "lt", "lte", "in", "nin", "contains", "startsWith", "endsWith", "between"]>;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodNumber, "many">, z.ZodNull]>;
    }, "strip", z.ZodTypeAny, {
        value: string | number | boolean | string[] | number[] | null;
        field: string;
        operator: "endsWith" | "startsWith" | "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "contains" | "between";
    }, {
        value: string | number | boolean | string[] | number[] | null;
        field: string;
        operator: "endsWith" | "startsWith" | "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "contains" | "between";
    }>, "many">;
    logic: z.ZodDefault<z.ZodEnum<["AND", "OR"]>>;
}, "strip", z.ZodTypeAny, {
    conditions: {
        value: string | number | boolean | string[] | number[] | null;
        field: string;
        operator: "endsWith" | "startsWith" | "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "contains" | "between";
    }[];
    logic: "AND" | "OR";
}, {
    conditions: {
        value: string | number | boolean | string[] | number[] | null;
        field: string;
        operator: "endsWith" | "startsWith" | "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "contains" | "between";
    }[];
    logic?: "AND" | "OR" | undefined;
}>;
export declare const BaseQueryParamsSchema: z.ZodObject<{
    pagination: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
        offset: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        page: number;
        offset?: number | undefined;
    }, {
        limit?: number | undefined;
        page?: number | undefined;
        offset?: number | undefined;
    }>, z.ZodObject<{
        cursor: z.ZodOptional<z.ZodString>;
        limit: z.ZodDefault<z.ZodNumber>;
        direction: z.ZodDefault<z.ZodEnum<["forward", "backward"]>>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        direction: "forward" | "backward";
        cursor?: string | undefined;
    }, {
        limit?: number | undefined;
        cursor?: string | undefined;
        direction?: "forward" | "backward" | undefined;
    }>]>>;
    sort: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
        field: z.ZodString;
        order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    }, "strip", z.ZodTypeAny, {
        field: string;
        order: "asc" | "desc";
    }, {
        field: string;
        order?: "asc" | "desc" | undefined;
    }>, z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    }, "strip", z.ZodTypeAny, {
        field: string;
        order: "asc" | "desc";
    }, {
        field: string;
        order?: "asc" | "desc" | undefined;
    }>, "many">]>>;
    filter: z.ZodOptional<z.ZodObject<{
        conditions: z.ZodArray<z.ZodObject<{
            field: z.ZodString;
            operator: z.ZodEnum<["eq", "ne", "gt", "gte", "lt", "lte", "in", "nin", "contains", "startsWith", "endsWith", "between"]>;
            value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodNumber, "many">, z.ZodNull]>;
        }, "strip", z.ZodTypeAny, {
            value: string | number | boolean | string[] | number[] | null;
            field: string;
            operator: "endsWith" | "startsWith" | "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "contains" | "between";
        }, {
            value: string | number | boolean | string[] | number[] | null;
            field: string;
            operator: "endsWith" | "startsWith" | "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "contains" | "between";
        }>, "many">;
        logic: z.ZodDefault<z.ZodEnum<["AND", "OR"]>>;
    }, "strip", z.ZodTypeAny, {
        conditions: {
            value: string | number | boolean | string[] | number[] | null;
            field: string;
            operator: "endsWith" | "startsWith" | "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "contains" | "between";
        }[];
        logic: "AND" | "OR";
    }, {
        conditions: {
            value: string | number | boolean | string[] | number[] | null;
            field: string;
            operator: "endsWith" | "startsWith" | "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "contains" | "between";
        }[];
        logic?: "AND" | "OR" | undefined;
    }>>;
    search: z.ZodOptional<z.ZodObject<{
        query: z.ZodString;
        fields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        caseSensitive: z.ZodDefault<z.ZodBoolean>;
        exactMatch: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        query: string;
        caseSensitive: boolean;
        exactMatch: boolean;
        fields?: string[] | undefined;
    }, {
        query: string;
        fields?: string[] | undefined;
        caseSensitive?: boolean | undefined;
        exactMatch?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    sort?: {
        field: string;
        order: "asc" | "desc";
    } | {
        field: string;
        order: "asc" | "desc";
    }[] | undefined;
    filter?: {
        conditions: {
            value: string | number | boolean | string[] | number[] | null;
            field: string;
            operator: "endsWith" | "startsWith" | "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "contains" | "between";
        }[];
        logic: "AND" | "OR";
    } | undefined;
    pagination?: {
        limit: number;
        page: number;
        offset?: number | undefined;
    } | {
        limit: number;
        direction: "forward" | "backward";
        cursor?: string | undefined;
    } | undefined;
    search?: {
        query: string;
        caseSensitive: boolean;
        exactMatch: boolean;
        fields?: string[] | undefined;
    } | undefined;
}, {
    sort?: {
        field: string;
        order?: "asc" | "desc" | undefined;
    } | {
        field: string;
        order?: "asc" | "desc" | undefined;
    }[] | undefined;
    filter?: {
        conditions: {
            value: string | number | boolean | string[] | number[] | null;
            field: string;
            operator: "endsWith" | "startsWith" | "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "contains" | "between";
        }[];
        logic?: "AND" | "OR" | undefined;
    } | undefined;
    pagination?: {
        limit?: number | undefined;
        page?: number | undefined;
        offset?: number | undefined;
    } | {
        limit?: number | undefined;
        cursor?: string | undefined;
        direction?: "forward" | "backward" | undefined;
    } | undefined;
    search?: {
        query: string;
        fields?: string[] | undefined;
        caseSensitive?: boolean | undefined;
        exactMatch?: boolean | undefined;
    } | undefined;
}>;
export declare const ListQueryParamsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    sortBy?: string | undefined;
}, {
    limit?: number | undefined;
    search?: string | undefined;
    page?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const DateRangeParamsSchema: z.ZodEffects<z.ZodObject<{
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    from?: string | undefined;
    to?: string | undefined;
}, {
    from?: string | undefined;
    to?: string | undefined;
}>, {
    from?: string | undefined;
    to?: string | undefined;
}, {
    from?: string | undefined;
    to?: string | undefined;
}>;
export declare function createPaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T): z.ZodObject<{
    data: z.ZodArray<T>;
    meta: typeof PaginationMetaSchema;
}>;
export declare function createSuccessResponseSchema<T extends z.ZodTypeAny>(dataSchema: T): z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: T;
    message: z.ZodOptional<z.ZodString>;
}>;
export declare const ErrorResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodUnknown>;
        field: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        timestamp?: string | undefined;
        field?: string | undefined;
        details?: unknown;
    }, {
        code: string;
        message: string;
        timestamp?: string | undefined;
        field?: string | undefined;
        details?: unknown;
    }>;
}, "strip", z.ZodTypeAny, {
    error: {
        code: string;
        message: string;
        timestamp?: string | undefined;
        field?: string | undefined;
        details?: unknown;
    };
    success: false;
}, {
    error: {
        code: string;
        message: string;
        timestamp?: string | undefined;
        field?: string | undefined;
        details?: unknown;
    };
    success: false;
}>;
export declare const BatchResultSchema: z.ZodObject<{
    successful: z.ZodNumber;
    failed: z.ZodNumber;
    total: z.ZodNumber;
    errors: z.ZodDefault<z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        error: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        error: string;
        index: number;
    }, {
        error: string;
        index: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    errors: {
        error: string;
        index: number;
    }[];
    total: number;
    successful: number;
    failed: number;
}, {
    total: number;
    successful: number;
    failed: number;
    errors?: {
        error: string;
        index: number;
    }[] | undefined;
}>;
export declare const UUIDParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const MultipleIDsSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    ids: string[];
}, {
    ids: string[];
}>;
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
