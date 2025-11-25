import { BaseError, type ErrorResponse } from '../base/base-error';
export declare function buildErrorResponse(error: BaseError, includeStack?: boolean): ErrorResponse;
export declare function sanitizeErrorForClient(error: Error): ErrorResponse;
export declare function sanitizeMetadata(metadata: unknown, depth?: number): Record<string, unknown> | undefined;
export declare function buildDevelopmentErrorResponse(error: Error): ErrorResponse;
export declare function buildProductionErrorResponse(error: Error): ErrorResponse;
export declare function extractErrorCode(error: Error): string;
