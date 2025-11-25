import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

export interface SlidingWindowRateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

/**
 * Redis-based rate limiter middleware for protecting against abuse.
 * Uses sliding window algorithm for accurate rate limiting across distributed instances.
 *
 * @example
 * // In module providers
 * {
 *   provide: 'RATE_LIMITER',
 *   useFactory: (redis: Redis) => new RateLimiter(redis, {
 *     windowMs: 60000, // 1 minute
 *     max: 100, // 100 requests per minute
 *   }),
 *   inject: ['REDIS_CLIENT'],
 * }
 *
 * // Apply as middleware
 * app.use(rateLimiter.middleware());
 */
@Injectable()
export class RateLimiter implements NestMiddleware {
  private readonly config: Required<SlidingWindowRateLimitConfig>;

  constructor(
    private readonly redis: Redis,
    config: SlidingWindowRateLimitConfig,
  ) {
    this.config = {
      message: 'Too many requests, please try again later',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: (req) => this.defaultKeyGenerator(req),
      ...config,
    };
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const key = this.config.keyGenerator(req);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      // Use Redis sorted set for sliding window
      const redisKey = `ratelimit:${key}`;

      // Remove old entries outside the window
      await this.redis.zremrangebyscore(redisKey, 0, windowStart);

      // Count current requests in window
      const currentCount = await this.redis.zcount(redisKey, windowStart, now);

      if (currentCount >= this.config.max) {
        // Rate limit exceeded
        const retryAfter = Math.ceil(this.config.windowMs / 1000);
        res.setHeader('Retry-After', retryAfter.toString());
        res.setHeader('X-RateLimit-Limit', this.config.max.toString());
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('X-RateLimit-Reset', new Date(now + this.config.windowMs).toISOString());

        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: this.config.message,
            error: 'Too Many Requests',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Add current request to window
      await this.redis.zadd(redisKey, now, `${now}-${Math.random()}`);
      await this.redis.expire(redisKey, Math.ceil(this.config.windowMs / 1000) + 1);

      // Set rate limit headers
      const remaining = this.config.max - currentCount - 1;
      res.setHeader('X-RateLimit-Limit', this.config.max.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining).toString());
      res.setHeader('X-RateLimit-Reset', new Date(now + this.config.windowMs).toISOString());

      // Intercept response to conditionally count
      if (this.config.skipSuccessfulRequests || this.config.skipFailedRequests) {
        const originalSend = res.send;
        const self = this;
        res.send = function (body: any) {
          const statusCode = res.statusCode;
          const shouldSkip =
            (self.config.skipSuccessfulRequests && statusCode < 400) ||
            (self.config.skipFailedRequests && statusCode >= 400);

          if (shouldSkip) {
            // Remove the request we just added
            self.redis.zrem(redisKey, `${now}-${Math.random()}`);
          }

          return originalSend.call(this, body);
        };
      }

      next();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      // On Redis failure, allow request through (fail open)
      console.error('Rate limiter error:', error);
      next();
    }
  }

  /**
   * Default key generator uses IP + tenant ID for rate limiting.
   */
  private defaultKeyGenerator(req: Request): string {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const tenantId = req.headers['x-tenant-id'] || 'global';
    return `${ip}:${tenantId}`;
  }

  /**
   * Creates middleware function compatible with Express.
   */
  middleware() {
    return this.use.bind(this);
  }
}

/**
 * Pre-configured rate limiters for common scenarios.
 */
export class RateLimitPresets {
  /**
   * Strict rate limit for authentication endpoints (login, register, password reset).
   * 5 requests per 15 minutes per IP.
   */
  static auth(redis: Redis): RateLimiter {
    return new RateLimiter(redis, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5,
      message: 'Too many authentication attempts, please try again later',
    });
  }

  /**
   * Standard rate limit for API endpoints.
   * 100 requests per minute per tenant.
   */
  static api(redis: Redis): RateLimiter {
    return new RateLimiter(redis, {
      windowMs: 60 * 1000, // 1 minute
      max: 100,
    });
  }

  /**
   * Relaxed rate limit for read-only endpoints.
   * 300 requests per minute per tenant.
   */
  static readonly(redis: Redis): RateLimiter {
    return new RateLimiter(redis, {
      windowMs: 60 * 1000, // 1 minute
      max: 300,
      skipFailedRequests: true, // Don't count errors
    });
  }

  /**
   * Very strict rate limit for expensive operations.
   * 10 requests per hour per tenant.
   */
  static expensive(redis: Redis): RateLimiter {
    return new RateLimiter(redis, {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10,
      message: 'Rate limit exceeded for this operation',
    });
  }
}
