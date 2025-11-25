/**
 * NestJS Middleware for Correlation ID Management
 *
 * Extracts or generates correlation IDs from HTTP requests and
 * establishes correlation context for the entire request lifecycle.
 *
 * @module shared-tracing/middleware
 */

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import {
  extractCorrelationId,
  extractCausationId,
  runWithCorrelationContext,
  createCorrelationContext,
} from '../correlation-id';
import { CORRELATION_ID_HEADER, CAUSATION_ID_HEADER } from '../types';

/**
 * Configuration for correlation middleware
 */
export interface CorrelationMiddlewareConfig {
  /**
   * Service name to include in correlation context
   */
  serviceName: string;

  /**
   * Service version to include in correlation context
   */
  serviceVersion: string;

  /**
   * Whether to log correlation IDs for each request
   */
  enableLogging?: boolean;

  /**
   * Whether to include correlation ID in response headers
   */
  includeInResponse?: boolean;
}

/**
 * Correlation ID Middleware
 *
 * This middleware MUST be applied globally in main.ts to ensure
 * all HTTP requests have a correlation context established.
 *
 * Usage in main.ts:
 * ```typescript
 * const correlationMiddleware = app.get(CorrelationMiddleware);
 * app.use(correlationMiddleware.use.bind(correlationMiddleware));
 * ```
 */
@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CorrelationMiddleware.name);
  private config: CorrelationMiddlewareConfig;

  constructor(config?: CorrelationMiddlewareConfig) {
    this.config = {
      serviceName: process.env.SERVICE_NAME || 'unknown-service',
      serviceVersion: process.env.SERVICE_VERSION || '1.0.0',
      enableLogging: true,
      includeInResponse: true,
      ...config,
    };
  }

  /**
   * Middleware handler
   *
   * Extracts or generates correlation context and runs the request
   * handler within that context using AsyncLocalStorage.
   */
  use(req: Request, res: Response, next: NextFunction): void {
    // Extract correlation ID from headers or generate new one
    const correlationId = extractCorrelationId(req.headers);
    const causationId = extractCausationId(req.headers);

    // Create correlation context
    const context = createCorrelationContext({
      correlationId,
      causationId,
      source: {
        service: this.config.serviceName,
        version: this.config.serviceVersion,
      },
      metadata: {
        method: req.method,
        path: req.path,
        userAgent: req.get('user-agent'),
      },
    });

    // Add correlation ID to response headers if enabled
    if (this.config.includeInResponse) {
      res.setHeader(CORRELATION_ID_HEADER, correlationId);
      if (causationId) {
        res.setHeader(CAUSATION_ID_HEADER, causationId);
      }
    }

    // Log correlation ID if enabled
    if (this.config.enableLogging) {
      this.logger.debug(
        `Request ${req.method} ${req.path} - Correlation ID: ${correlationId}`,
        { correlationId, causationId, method: req.method, path: req.path }
      );
    }

    // Run the request handler within correlation context
    runWithCorrelationContext(context, () => {
      next();
    });
  }
}

/**
 * Factory function to create correlation middleware
 *
 * Use this in module providers when you need to configure
 * the middleware with specific options.
 *
 * @param config - Middleware configuration
 * @returns Configured middleware instance
 */
export function createCorrelationMiddleware(
  config?: CorrelationMiddlewareConfig
): CorrelationMiddleware {
  return new CorrelationMiddleware(config);
}
