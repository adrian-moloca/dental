import { z } from 'zod';
export declare const PaginationRequestSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortOrder: "asc" | "desc";
    sortBy?: string | undefined;
}, {
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export type PaginationRequest = z.infer<typeof PaginationRequestSchema>;
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
export declare function createPaginatedResponse<T>(data: T[], total: number, page: number, limit: number): PaginatedResponse<T>;
export declare function calculatePaginationParams(request: PaginationRequest): {
    skip: number;
    limit: number;
};
export interface CursorPaginationRequest {
    limit: number;
    cursor?: string;
}
export interface CursorPaginatedResponse<T> {
    data: T[];
    pagination: {
        limit: number;
        nextCursor?: string;
        hasNextPage: boolean;
    };
}
export declare function createCursorPaginatedResponse<T extends {
    _id: any;
}>(data: T[], limit: number): CursorPaginatedResponse<T>;
export declare function decodeCursor(cursor: string): string;
