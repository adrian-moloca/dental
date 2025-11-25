import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Request Context Middleware
 *
 * Enriches the request object with context information for downstream processing:
 * - Correlation ID for distributed tracing
 * - Request timestamp for duration tracking
 * - Request ID for logging and debugging
 *
 * Edge cases handled:
 * - Missing correlation ID (generates new one)
 * - Existing correlation ID (preserved)
 * - Sets response headers for client tracking
 *
 * @implements {NestMiddleware}
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  /**
   * Enriches request with context information
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Next function
   */
  use(req: Request, res: Response, next: NextFunction): void {
    // Extract or generate correlation ID
    const correlationId = this.extractOrGenerateCorrelationId(req);

    // Generate unique request ID
    const requestId = this.generateRequestId();

    // Store in request for downstream use
    (req as Request & { correlationId?: string; requestId?: string }).correlationId = correlationId;
    (req as Request & { correlationId?: string; requestId?: string }).requestId = requestId;

    // Set response headers for client tracking
    res.setHeader('X-Correlation-ID', correlationId);
    res.setHeader('X-Request-ID', requestId);

    next();
  }

  /**
   * Extracts correlation ID from request headers or generates a new one
   *
   * Edge cases handled:
   * - Existing correlation ID in headers (preserved)
   * - Missing correlation ID (generates new one)
   * - Supports both lowercase and uppercase header names
   *
   * @param req - Express request object
   * @returns Correlation ID
   */
  private extractOrGenerateCorrelationId(req: Request): string {
    return (
      req.get('x-correlation-id') || req.get('X-Correlation-ID') || this.generateCorrelationId()
    );
  }

  /**
   * Generates a new correlation ID
   *
   * @returns Generated correlation ID
   */
  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Generates a unique request ID
   *
   * @returns Generated request ID
   */
  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
