import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

/**
 * Timeout Interceptor
 * Enforces request timeouts to prevent hanging requests
 */

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly timeoutMs: number = 30000) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () => new RequestTimeoutException(`Request timeout after ${this.timeoutMs}ms`),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}

/**
 * Configure different timeouts for different endpoints
 */
export function getTimeoutForEndpoint(path: string): number {
  // Long-running operations
  if (path.includes('/reports') || path.includes('/export')) {
    return 120000; // 2 minutes
  }

  // Search operations
  if (path.includes('/search')) {
    return 5000; // 5 seconds
  }

  // Default
  return 30000; // 30 seconds
}
