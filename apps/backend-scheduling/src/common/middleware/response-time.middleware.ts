/**
 * Response Time Middleware
 *
 * Measures and logs request/response time for performance monitoring.
 *
 * Edge cases handled:
 * - High-precision timing (process.hrtime)
 * - Slow request warnings
 * - Response header injection
 * - Error handling (timing even on errors)
 *
 * @module ResponseTimeMiddleware
 */

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Response Time Middleware
 *
 * Adds X-Response-Time header and logs slow requests
 */
@Injectable()
export class ResponseTimeMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ResponseTimeMiddleware.name);

  /**
   * Slow request threshold in milliseconds
   * Requests exceeding this will be logged as warnings
   */
  private readonly SLOW_REQUEST_THRESHOLD = 1000; // 1 second

  /**
   * Middleware handler
   *
   * Edge cases:
   * - Uses process.hrtime for high precision
   * - Logs slow requests as warnings
   * - Adds X-Response-Time header
   * - Works even if response fails
   *
   * @param req - Express request
   * @param res - Express response
   * @param next - Next function
   */
  use(req: Request, res: Response, next: NextFunction): void {
    // Record start time with high precision
    const startTime = process.hrtime.bigint();

    // Store original send function
    const originalSend = res.send;

    // Override send to calculate and set header before sending
    res.send = function (body?: any): Response {
      // Calculate elapsed time in nanoseconds
      const endTime = process.hrtime.bigint();
      const elapsedNs = endTime - startTime;

      // Convert to milliseconds
      const elapsedMs = Number(elapsedNs) / 1_000_000;

      // Add response time header (in milliseconds, 2 decimal places)
      res.setHeader('X-Response-Time', `${elapsedMs.toFixed(2)}ms`);

      // Restore original send and call it
      res.send = originalSend;
      return originalSend.call(this, body);
    };

    // Hook into response finish event for logging only
    res.on('finish', () => {
      // Calculate elapsed time in nanoseconds
      const endTime = process.hrtime.bigint();
      const elapsedNs = endTime - startTime;

      // Convert to milliseconds
      const elapsedMs = Number(elapsedNs) / 1_000_000;

      // Edge case: Log slow requests as warnings
      if (elapsedMs > this.SLOW_REQUEST_THRESHOLD) {
        this.logger.warn(
          `Slow request detected: ${req.method} ${req.url} took ${elapsedMs.toFixed(2)}ms`,
          {
            method: req.method,
            url: req.url,
            responseTime: elapsedMs,
            statusCode: res.statusCode,
            threshold: this.SLOW_REQUEST_THRESHOLD,
          },
        );
      }
    });

    next();
  }
}
