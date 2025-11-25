/**
 * Logging Interceptor
 * Logs request/response with tenant context and performance metrics
 */

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CurrentUser } from '@dentalos/shared-auth';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const user: CurrentUser | undefined = request.user;

    const now = Date.now();
    const requestId = request.headers['x-request-id'] || `req-${Date.now()}`;

    // Log incoming request
    this.logger.log({
      type: 'REQUEST',
      requestId,
      method,
      url,
      tenantId: user?.tenantId,
      userId: user?.userId,
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - now;
          this.logger.log({
            type: 'RESPONSE',
            requestId,
            method,
            url,
            duration: `${duration}ms`,
            tenantId: user?.tenantId,
            userId: user?.userId,
          });
        },
        error: (error) => {
          const duration = Date.now() - now;
          this.logger.error({
            type: 'ERROR',
            requestId,
            method,
            url,
            duration: `${duration}ms`,
            error: error.message,
            tenantId: user?.tenantId,
            userId: user?.userId,
          });
        },
      }),
    );
  }
}
