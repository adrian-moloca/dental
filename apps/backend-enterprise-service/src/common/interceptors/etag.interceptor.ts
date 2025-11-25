import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as crypto from 'crypto';

/**
 * ETag Interceptor
 * Implements conditional requests using ETags for cache validation
 */

@Injectable()
export class ETagInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Only apply ETags to GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        if (!data) {
          return data;
        }

        // Generate ETag from response data
        const etag = this.generateETag(data);
        response.setHeader('ETag', etag);
        response.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');

        // Check if client has matching ETag
        const clientEtag = request.headers['if-none-match'];
        if (clientEtag === etag) {
          response.status(304); // Not Modified
          return null;
        }

        return data;
      }),
    );
  }

  private generateETag(data: any): string {
    const content = JSON.stringify(data);
    const hash = crypto.createHash('md5').update(content).digest('hex');
    return `"${hash}"`;
  }
}
