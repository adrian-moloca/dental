import { PositiveInt, SortConfig, Nullable } from './common.types';
export declare enum PaginationStrategy {
    OFFSET = "OFFSET",
    CURSOR = "CURSOR"
}
export interface BasePaginationParams {
    strategy?: PaginationStrategy;
    sort?: SortConfig;
}
export interface OffsetPaginationParams extends BasePaginationParams {
    strategy: PaginationStrategy.OFFSET;
    page: PositiveInt;
    pageSize: PositiveInt;
}
export interface CursorPaginationParams extends BasePaginationParams {
    strategy: PaginationStrategy.CURSOR;
    cursor?: Nullable<string>;
    limit: PositiveInt;
}
export type PaginationParams = OffsetPaginationParams | CursorPaginationParams;
export interface OffsetPaginationMeta {
    strategy: PaginationStrategy.OFFSET;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
export interface CursorPaginationMeta {
    strategy: PaginationStrategy.CURSOR;
    nextCursor: Nullable<string>;
    previousCursor: Nullable<string>;
    hasMore: boolean;
    count: number;
}
export type PaginationMeta = OffsetPaginationMeta | CursorPaginationMeta;
export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}
export interface PaginatedList<T> {
    items: T[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}
export interface Cursor {
    value: string;
    metadata?: Record<string, unknown>;
}
export interface InfiniteScrollResponse<T> {
    items: T[];
    nextCursor: Nullable<string>;
    hasMore: boolean;
}
export declare const PAGINATION_DEFAULTS: {
    readonly DEFAULT_PAGE_SIZE: 20;
    readonly DEFAULT_LIMIT: 20;
    readonly MAX_PAGE_SIZE: 100;
    readonly MAX_LIMIT: 100;
    readonly DEFAULT_PAGE: 1;
};
export declare function isOffsetPagination(params: PaginationParams): params is OffsetPaginationParams;
export declare function isCursorPagination(params: PaginationParams): params is CursorPaginationParams;
export declare function isOffsetPaginationMeta(meta: PaginationMeta): meta is OffsetPaginationMeta;
export declare function isCursorPaginationMeta(meta: PaginationMeta): meta is CursorPaginationMeta;
