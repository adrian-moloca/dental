import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import Redis from 'ioredis';
import { AppConfig } from '../config/configuration';

/**
 * Rate limit configuration interface
 */
export interface RateLimitConfig {
  /** Maximum requests allowed in time window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Key prefix for Redis storage */
  keyPrefix?: string;
}

/**
 * Default rate limit configurations by endpoint type
 */
export const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  default: { limit: 100, windowSeconds: 60 }, // 100 requests per minute
  auth: { limit: 5, windowSeconds: 60 }, // 5 login attempts per minute
  write: { limit: 50, windowSeconds: 60 }, // 50 write operations per minute
  read: { limit: 200, windowSeconds: 60 }, // 200 read operations per minute
  public: { limit: 20, windowSeconds: 60 }, // 20 requests per minute for unauthenticated
};

/**
 * Rate Limiting Guard for Enterprise Service
 *
 * SECURITY RESPONSIBILITIES:
 * - Prevents API abuse and DoS attacks
 * - Enforces per-user and per-IP rate limits
 * - Returns 429 Too Many Requests when limit exceeded
 * - Provides X-RateLimit-* headers for client awareness
 *
 * THREAT MITIGATION:
 * - Prevents brute force attacks (CWE-307)
 * - Mitigates Denial of Service (DoS) attacks
 * - Prevents resource exhaustion
 * - Limits automated scraping and enumeration
 *
 * IMPLEMENTATION:
 * - Uses Redis for distributed rate limiting
 * - Sliding window algorithm for accurate limiting
 * - Per-user limits for authenticated requests
 * - Per-IP limits for unauthenticated requests
 *
 * COMPLIANCE:
 * - OWASP API Security: API4:2023 Unrestricted Resource Consumption
 * - PCI DSS: Requirement 6.5.10 (Broken Authentication and Session Management)
 *
 * USAGE:
 * @UseGuards(RateLimitGuard)
 * async createResource() { ... }
 *
 * IMPORTANT: Apply more restrictive limits to:
 * - Authentication endpoints (prevent brute force)
 * - Write operations (prevent data manipulation)
 * - Resource-intensive operations (prevent resource exhaustion)
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);
  private readonly redis: Redis;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService<AppConfig>) {
    // Initialize Redis connection for rate limiting
    const redisConfig = this.configService.get('redis', { infer: true })!;

    this.redis = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: 'rate-limit:',
      retryStrategy: (times: number) => {
        // Exponential backoff: 50ms, 100ms, 200ms, ..., max 2000ms
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    // Enable/disable rate limiting via environment variable
    this.enabled = process.env.RATE_LIMIT_ENABLED !== 'false';

    if (!this.enabled) {
      this.logger.warn('Rate limiting is DISABLED - not recommended for production');
    }
  }

  /**
   * Determines if request can proceed based on rate limits
   *
   * ALGORITHM:
   * 1. Extract rate limit key (userId or IP address)
   * 2. Get current request count from Redis
   * 3. Increment count if within limit
   * 4. Return 429 if limit exceeded
   * 5. Set X-RateLimit-* headers for client awareness
   *
   * @param context - Execution context containing HTTP request
   * @returns true if within rate limit, throws HttpException(429) otherwise
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip rate limiting if disabled (development mode)
    if (!this.enabled) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Determine rate limit configuration based on endpoint
    const config = this.getRateLimitConfig(request);

    // Generate unique rate limit key
    const rateLimitKey = this.generateRateLimitKey(request);

    try {
      // Check and increment rate limit using Redis
      const result = await this.checkRateLimit(rateLimitKey, config);

      // Set rate limit headers for client awareness
      this.setRateLimitHeaders(response, result, config);

      // Allow request if within limit
      if (result.allowed) {
        return true;
      }

      // Log rate limit exceeded
      this.logger.warn('Rate limit exceeded', {
        key: rateLimitKey,
        limit: config.limit,
        current: result.current,
        retryAfter: result.retryAfter,
        method: request.method,
        url: request.url,
        ip: request.ip,
      });

      // Return 429 Too Many Requests
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Rate limit exceeded',
          error: 'Too Many Requests',
          retryAfter: result.retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    } catch (error) {
      // Handle Redis connection errors gracefully
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Rate limit check failed', {
        error: error instanceof Error ? error.message : String(error),
        key: rateLimitKey,
      });

      // Fail open: allow request if Redis is unavailable
      // SECURITY TRADEOFF: Prefer availability over strict rate limiting
      // In production, consider failing closed (blocking requests)
      return true;
    }
  }

  /**
   * Checks rate limit using Redis sliding window algorithm
   *
   * ALGORITHM:
   * 1. Get current timestamp
   * 2. Remove expired entries from sorted set
   * 3. Count entries in current window
   * 4. If under limit, add new entry
   * 5. Return result with remaining requests and retry time
   *
   * @param key - Rate limit key (userId or IP)
   * @param config - Rate limit configuration
   * @returns Rate limit check result
   */
  private async checkRateLimit(
    key: string,
    config: RateLimitConfig,
  ): Promise<{
    allowed: boolean;
    current: number;
    remaining: number;
    retryAfter: number;
  }> {
    const now = Date.now();
    const windowStart = now - config.windowSeconds * 1000;

    // Use Redis pipeline for atomic operations
    const pipeline = this.redis.pipeline();

    // Remove expired entries
    pipeline.zremrangebyscore(key, '-inf', windowStart);

    // Count current entries in window
    pipeline.zcard(key);

    // Add current request
    pipeline.zadd(key, now, `${now}`);

    // Set expiration on key (cleanup)
    pipeline.expire(key, config.windowSeconds);

    // Execute pipeline
    const results = await pipeline.exec();

    // Extract count from results
    // Pipeline returns: [[err, result], [err, result], ...]
    const count = (results?.[1]?.[1] as number) || 0;

    // Check if under limit
    const allowed = count < config.limit;
    const remaining = Math.max(0, config.limit - count - 1);
    const retryAfter = allowed ? 0 : config.windowSeconds;

    return {
      allowed,
      current: count + 1,
      remaining,
      retryAfter,
    };
  }

  /**
   * Generates unique rate limit key based on request context
   *
   * PRIORITY:
   * 1. Authenticated: user:{userId}
   * 2. Unauthenticated: ip:{ipAddress}
   *
   * @param request - Express request object
   * @returns Rate limit key
   */
  private generateRateLimitKey(request: Request): string {
    // Use userId for authenticated requests
    const user = (request as any).user;
    if (user?.userId) {
      return `user:${user.userId}`;
    }

    // Use IP address for unauthenticated requests
    const ip = this.getClientIp(request);
    return `ip:${ip}`;
  }

  /**
   * Extracts client IP address from request
   *
   * PRIORITY:
   * 1. X-Forwarded-For header (behind proxy/load balancer)
   * 2. X-Real-IP header (alternative proxy header)
   * 3. request.ip (direct connection)
   *
   * @param request - Express request object
   * @returns Client IP address
   */
  private getClientIp(request: Request): string {
    // Check X-Forwarded-For header (proxy/load balancer)
    const forwardedFor = request.get('x-forwarded-for');
    if (forwardedFor) {
      // X-Forwarded-For can contain multiple IPs: "client, proxy1, proxy2"
      return forwardedFor.split(',')[0].trim();
    }

    // Check X-Real-IP header
    const realIp = request.get('x-real-ip');
    if (realIp) {
      return realIp;
    }

    // Fallback to request.ip
    return request.ip || 'unknown';
  }

  /**
   * Determines rate limit configuration based on request
   *
   * LOGIC:
   * - Unauthenticated requests: stricter limits
   * - Write operations (POST, PUT, PATCH, DELETE): moderate limits
   * - Read operations (GET): relaxed limits
   *
   * @param request - Express request object
   * @returns Rate limit configuration
   */
  private getRateLimitConfig(request: Request): RateLimitConfig {
    const user = (request as any).user;

    // Unauthenticated requests get stricter limits
    if (!user) {
      return DEFAULT_RATE_LIMITS.public;
    }

    // Write operations get moderate limits
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      return DEFAULT_RATE_LIMITS.write;
    }

    // Read operations get relaxed limits
    if (request.method === 'GET') {
      return DEFAULT_RATE_LIMITS.read;
    }

    // Default limits for other methods
    return DEFAULT_RATE_LIMITS.default;
  }

  /**
   * Sets rate limit headers on response
   *
   * HEADERS:
   * - X-RateLimit-Limit: Maximum requests allowed
   * - X-RateLimit-Remaining: Requests remaining in window
   * - X-RateLimit-Reset: Unix timestamp when limit resets
   * - Retry-After: Seconds until limit resets (if exceeded)
   *
   * @param response - Express response object
   * @param result - Rate limit check result
   * @param config - Rate limit configuration
   */
  private setRateLimitHeaders(
    response: Response,
    result: { allowed: boolean; current: number; remaining: number; retryAfter: number },
    config: RateLimitConfig,
  ): void {
    const resetTime = Math.ceil(Date.now() / 1000) + config.windowSeconds;

    response.setHeader('X-RateLimit-Limit', config.limit);
    response.setHeader('X-RateLimit-Remaining', result.remaining);
    response.setHeader('X-RateLimit-Reset', resetTime);

    if (!result.allowed) {
      response.setHeader('Retry-After', result.retryAfter);
    }
  }

  /**
   * Cleanup Redis connection on module destroy
   */
  async onModuleDestroy() {
    await this.redis.quit();
  }
}
