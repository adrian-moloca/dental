import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { extractCorrelationId, generateRequestId } from '../common/correlation-id.util';

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
    const correlationId = extractCorrelationId(req);

    // Generate unique request ID
    const requestId = generateRequestId();

    // Store in request for downstream use
    (req as Request & { correlationId?: string; requestId?: string }).correlationId = correlationId;
    (req as Request & { correlationId?: string; requestId?: string }).requestId = requestId;

    // Set response headers for client tracking
    res.setHeader('X-Correlation-ID', correlationId);
    res.setHeader('X-Request-ID', requestId);

    next();
  }
}
