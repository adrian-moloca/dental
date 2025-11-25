import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);

/**
 * Compression Interceptor
 * Compresses responses when appropriate
 */

@Injectable()
export class CompressionInterceptor implements NestInterceptor {
  private readonly MIN_SIZE_FOR_COMPRESSION = 1024; // 1KB

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const acceptEncoding = request.headers['accept-encoding'] || '';
    const supportsGzip = acceptEncoding.includes('gzip');

    if (!supportsGzip) {
      return next.handle();
    }

    return next.handle().pipe(
      map(async (data) => {
        if (!data) {
          return data;
        }

        const serialized = JSON.stringify(data);

        // Only compress if response is large enough
        if (serialized.length < this.MIN_SIZE_FOR_COMPRESSION) {
          return data;
        }

        try {
          const compressed = await gzip(serialized);

          // Only use compression if it actually reduces size
          if (compressed.length < serialized.length) {
            response.setHeader('Content-Encoding', 'gzip');
            response.setHeader('Content-Type', 'application/json');
            return compressed;
          }
        } catch (error) {
          // If compression fails, return uncompressed
          return data;
        }

        return data;
      }),
    );
  }
}
