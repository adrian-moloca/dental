import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Rate Limit Guard
 *
 * Simple in-memory rate limiting guard to prevent abuse.
 * For production, consider using Redis-based rate limiting.
 *
 * Edge cases handled:
 * - Per-IP rate limiting
 * - Configurable window and limit
 * - Automatic cleanup of old entries
 *
 * @implements {CanActivate}
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly requests: Map<string, number[]> = new Map();
  private readonly windowMs: number = 60000; // 1 minute
  private readonly maxRequests: number = 100; // 100 requests per minute

  constructor() {
    // Cleanup old entries every minute
    setInterval(() => this.cleanup(), this.windowMs);
  }

  /**
   * Checks if request should be allowed based on rate limits
   *
   * @param context - Execution context
   * @returns true if request is allowed, throws exception if rate limit exceeded
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = this.getClientIp(request);

    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests for this IP
    const ipRequests = this.requests.get(ip) || [];

    // Filter out requests outside the current window
    const recentRequests = ipRequests.filter((timestamp) => timestamp > windowStart);

    // Check if limit exceeded
    if (recentRequests.length >= this.maxRequests) {
      throw new HttpException(
        {
          status: 'error',
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil(this.windowMs / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(ip, recentRequests);

    return true;
  }

  /**
   * Extracts client IP from request
   *
   * Edge cases handled:
   * - X-Forwarded-For header (proxy/load balancer)
   * - X-Real-IP header
   * - Direct socket IP
   *
   * @param request - Express request object
   * @returns Client IP address
   */
  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (request.headers['x-real-ip'] as string) ||
      request.ip ||
      'unknown'
    );
  }

  /**
   * Cleans up old rate limit entries
   */
  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [ip, timestamps] of this.requests.entries()) {
      const recentRequests = timestamps.filter((timestamp) => timestamp > windowStart);

      if (recentRequests.length === 0) {
        this.requests.delete(ip);
      } else {
        this.requests.set(ip, recentRequests);
      }
    }
  }
}
