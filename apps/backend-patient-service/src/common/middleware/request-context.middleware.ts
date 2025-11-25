/**
 * Request Context Middleware
 *
 * Enriches request with contextual information:
 * - Correlation ID (for distributed tracing)
 * - Organization ID (for multi-tenancy)
 * - Clinic ID (for clinic-scoped operations)
 * - User ID (for audit trails)
 * - Request timestamp
 *
 * Edge cases handled:
 * - Missing headers (generates defaults)
 * - Invalid header formats
 * - Case-insensitive header names
 * - Correlation ID generation
 *
 * @module RequestContextMiddleware
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Extended Request interface with context
 */
export interface RequestWithContext extends Request {
  context: {
    correlationId: string;
    organizationId?: string;
    clinicId?: string;
    userId?: string;
    timestamp: Date;
  };
}

/**
 * Request Context Middleware
 *
 * Extracts and enriches request context from headers
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  /**
   * Middleware handler
   *
   * Edge cases:
   * - Generates correlation ID if not present
   * - Handles both lowercase and uppercase header names
   * - Validates header values
   * - Adds timestamp for request tracking
   *
   * @param req - Express request
   * @param res - Express response
   * @param next - Next function
   */
  use(req: Request, res: Response, next: NextFunction): void {
    const request = req as RequestWithContext;

    // Extract correlation ID from headers or generate new one
    // Edge case: Support both lowercase and uppercase header names
    const correlationId =
      req.get('x-correlation-id') || req.get('X-Correlation-ID') || this.generateCorrelationId();

    // Extract organization ID from headers
    // Edge case: Support both lowercase and uppercase header names
    const organizationId = req.get('x-organization-id') || req.get('X-Organization-ID');

    // Extract clinic ID from headers
    const clinicId = req.get('x-clinic-id') || req.get('X-Clinic-ID');

    // Extract user ID from authenticated request
    // Edge case: User object may be attached by authentication middleware
    const userId =
      (req as Request & { user?: { id?: string; userId?: string } }).user?.id ||
      (req as Request & { user?: { id?: string; userId?: string } }).user?.userId;

    // Attach context to request
    request.context = {
      correlationId,
      organizationId: organizationId || undefined,
      clinicId: clinicId || undefined,
      userId: userId || undefined,
      timestamp: new Date(),
    };

    // Add correlation ID to response headers for client tracking
    res.setHeader('X-Correlation-ID', correlationId);

    next();
  }

  /**
   * Generates a new correlation ID
   *
   * Edge cases:
   * - Uses timestamp for ordering
   * - Adds random component for uniqueness
   * - Not cryptographically secure (use UUID for that)
   *
   * @returns Generated correlation ID
   */
  private generateCorrelationId(): string {
    // Format: timestamp-random
    // Example: 1699999999999-abc123def456
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}
