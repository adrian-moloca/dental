import { z } from 'zod';

/**
 * Standard pagination request schema for all endpoints.
 */
export const PaginationRequestSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationRequest = z.infer<typeof PaginationRequestSchema>;

/**
 * Standard pagination response wrapper.
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Creates a paginated response from query results.
 *
 * @example
 * const patients = await db.patients.find().skip(skip).limit(limit);
 * const total = await db.patients.count();
 * return createPaginatedResponse(patients, total, page, limit);
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Calculates skip and limit for database queries based on pagination parameters.
 */
export function calculatePaginationParams(request: PaginationRequest): {
  skip: number;
  limit: number;
} {
  const skip = (request.page - 1) * request.limit;
  return { skip, limit: request.limit };
}

/**
 * Cursor-based pagination for better performance on large datasets.
 */
export interface CursorPaginationRequest {
  limit: number;
  cursor?: string; // Base64 encoded cursor
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    nextCursor?: string;
    hasNextPage: boolean;
  };
}

/**
 * Creates a cursor-based paginated response.
 * Cursor encodes the last item's ID for efficient queries.
 */
export function createCursorPaginatedResponse<T extends { _id: any }>(
  data: T[],
  limit: number,
): CursorPaginatedResponse<T> {
  const hasNextPage = data.length > limit;
  const items = hasNextPage ? data.slice(0, limit) : data;

  let nextCursor: string | undefined;
  if (hasNextPage && items.length > 0) {
    const lastItem = items[items.length - 1];
    nextCursor = Buffer.from(lastItem._id.toString()).toString('base64');
  }

  return {
    data: items,
    pagination: {
      limit,
      nextCursor,
      hasNextPage,
    },
  };
}

/**
 * Decodes a cursor to extract the last item ID.
 */
export function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, 'base64').toString('utf-8');
}
