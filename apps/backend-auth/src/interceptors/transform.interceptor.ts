import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Response format for successful API responses
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

/**
 * Response Transform Interceptor
 *
 * Wraps all successful responses in a standardized format:
 * {
 *   success: true,
 *   data: <actual response>,
 *   timestamp: ISO 8601 timestamp
 * }
 *
 * Edge cases handled:
 * - Null or undefined responses (wrapped as data: null)
 * - Empty arrays and objects (preserved in data field)
 * - Primitive values (numbers, strings, booleans) wrapped in data field
 * - Nested objects and arrays (preserved as-is in data field)
 * - Streaming responses (not transformed, passed through)
 * - File downloads (not transformed, passed through)
 *
 * Note: This interceptor only transforms successful responses.
 * Error responses are handled by the GlobalExceptionFilter.
 *
 * @implements {NestInterceptor}
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, SuccessResponse<T> | T> {
  /**
   * Intercepts the response and wraps it in a standardized format
   *
   * @param context - Execution context
   * @param next - Call handler
   * @returns Observable of transformed response
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<SuccessResponse<T> | T> {
    return next.handle().pipe(
      map((data: T) => {
        console.log('=== TRANSFORM INTERCEPTOR - BEFORE ===');
        console.log('Data received:', JSON.stringify(data, null, 2));
        console.log('Data type:', typeof data);
        console.log('Data keys:', data && typeof data === 'object' ? Object.keys(data) : 'N/A');
        const app = context.switchToHttp().getResponse()?.app;
        if (app && typeof app.getGlobalInterceptors === 'function') {
          const gis = app.getGlobalInterceptors();
          console.log(
            'Global interceptors (order):',
            Array.isArray(gis) ? gis.map((i: any) => i.constructor?.name) : gis
          );
        }

        // Check if response should be transformed
        // Edge case: Skip transformation for streaming responses, file downloads
        if (this.shouldSkipTransformation(context, data)) {
          console.log('=== TRANSFORM INTERCEPTOR - SKIPPING TRANSFORMATION ===');
          return data;
        }

        // Wrap the response in standardized format
        // Edge case: Handle null/undefined data gracefully
        const result = {
          success: true,
          data: data !== undefined ? data : null,
          timestamp: new Date().toISOString(),
        } as SuccessResponse<T>;

        console.log('=== TRANSFORM INTERCEPTOR - AFTER ===');
        console.log('Result:', JSON.stringify(result, null, 2));

        return result;
      })
    );
  }

  /**
   * Determines if response transformation should be skipped
   *
   * Edge cases handled:
   * - File downloads (Content-Disposition header present)
   * - Streaming responses (Transfer-Encoding: chunked)
   * - Already transformed responses (has success field)
   * - Binary data (buffers, streams)
   *
   * @param context - Execution context
   * @param data - Response data
   * @returns true if transformation should be skipped
   */
  private shouldSkipTransformation(context: ExecutionContext, data: unknown): boolean {
    // Get response object from context
    const response = context.switchToHttp().getResponse();

    // Edge case: Skip if Content-Disposition header is set (file download)
    if (response.getHeader('Content-Disposition')) {
      return true;
    }

    // Edge case: Skip if Transfer-Encoding is chunked (streaming response)
    if (response.getHeader('Transfer-Encoding') === 'chunked') {
      return true;
    }

    // Edge case: Skip if response is already in standardized format
    // This prevents double-wrapping if another interceptor already transformed it
    if (
      data !== null &&
      typeof data === 'object' &&
      'success' in data &&
      'data' in data &&
      'timestamp' in data
    ) {
      return true;
    }

    // Edge case: Skip if response is a Buffer (binary data)
    if (Buffer.isBuffer(data)) {
      return true;
    }

    // Edge case: Skip if response is a Stream
    if (
      data !== null &&
      typeof data === 'object' &&
      'pipe' in data &&
      typeof (data as { pipe: unknown }).pipe === 'function'
    ) {
      return true;
    }

    // Transform all other responses
    return false;
  }
}
