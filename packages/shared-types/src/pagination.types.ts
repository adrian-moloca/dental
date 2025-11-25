/**
 * Pagination types for API responses
 * @module shared-types/pagination
 */

import { PositiveInt, SortConfig, Nullable } from './common.types';

/**
 * Pagination strategy
 */
export enum PaginationStrategy {
  /** Offset-based pagination (page number and size) */
  OFFSET = 'OFFSET',
  /** Cursor-based pagination (for infinite scroll) */
  CURSOR = 'CURSOR',
}

/**
 * Base pagination request parameters
 */
export interface BasePaginationParams {
  /** Pagination strategy to use */
  strategy?: PaginationStrategy;
  /** Sort configuration */
  sort?: SortConfig;
}

/**
 * Offset-based pagination parameters
 */
export interface OffsetPaginationParams extends BasePaginationParams {
  strategy: PaginationStrategy.OFFSET;
  /** Page number (1-indexed) */
  page: PositiveInt;
  /** Number of items per page */
  pageSize: PositiveInt;
}

/**
 * Cursor-based pagination parameters
 */
export interface CursorPaginationParams extends BasePaginationParams {
  strategy: PaginationStrategy.CURSOR;
  /** Cursor for next page */
  cursor?: Nullable<string>;
  /** Number of items to fetch */
  limit: PositiveInt;
}

/**
 * Union of pagination parameter types
 */
export type PaginationParams = OffsetPaginationParams | CursorPaginationParams;

/**
 * Offset pagination metadata
 */
export interface OffsetPaginationMeta {
  strategy: PaginationStrategy.OFFSET;
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Items per page */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items */
  totalItems: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
}

/**
 * Cursor pagination metadata
 */
export interface CursorPaginationMeta {
  strategy: PaginationStrategy.CURSOR;
  /** Cursor for next page (null if no more pages) */
  nextCursor: Nullable<string>;
  /** Cursor for previous page (null if first page) */
  previousCursor: Nullable<string>;
  /** Whether there are more items */
  hasMore: boolean;
  /** Number of items in current result */
  count: number;
}

/**
 * Union of pagination metadata types
 */
export type PaginationMeta = OffsetPaginationMeta | CursorPaginationMeta;

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  /** Array of items for current page */
  data: T[];
  /** Pagination metadata */
  pagination: PaginationMeta;
}

/**
 * Simple paginated list (offset-based only)
 */
export interface PaginatedList<T> {
  /** Array of items */
  items: T[];
  /** Current page (1-indexed) */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Total items across all pages */
  total: number;
  /** Total pages */
  totalPages: number;
}

/**
 * Cursor for cursor-based pagination
 */
export interface Cursor {
  /** Cursor value (opaque string) */
  value: string;
  /** Optional cursor metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Infinite scroll response
 */
export interface InfiniteScrollResponse<T> {
  /** Items for current batch */
  items: T[];
  /** Cursor for next batch */
  nextCursor: Nullable<string>;
  /** Whether more items exist */
  hasMore: boolean;
}

/**
 * Pagination defaults and limits
 */
export const PAGINATION_DEFAULTS = {
  /** Default page size for offset pagination */
  DEFAULT_PAGE_SIZE: 20 as const,
  /** Default limit for cursor pagination */
  DEFAULT_LIMIT: 20 as const,
  /** Maximum page size allowed */
  MAX_PAGE_SIZE: 100 as const,
  /** Maximum limit allowed */
  MAX_LIMIT: 100 as const,
  /** Default page number */
  DEFAULT_PAGE: 1 as const,
} as const;

/**
 * Type guard for offset pagination params
 */
export function isOffsetPagination(
  params: PaginationParams,
): params is OffsetPaginationParams {
  return params.strategy === PaginationStrategy.OFFSET;
}

/**
 * Type guard for cursor pagination params
 */
export function isCursorPagination(
  params: PaginationParams,
): params is CursorPaginationParams {
  return params.strategy === PaginationStrategy.CURSOR;
}

/**
 * Type guard for offset pagination meta
 */
export function isOffsetPaginationMeta(
  meta: PaginationMeta,
): meta is OffsetPaginationMeta {
  return meta.strategy === PaginationStrategy.OFFSET;
}

/**
 * Type guard for cursor pagination meta
 */
export function isCursorPaginationMeta(
  meta: PaginationMeta,
): meta is CursorPaginationMeta {
  return meta.strategy === PaginationStrategy.CURSOR;
}
