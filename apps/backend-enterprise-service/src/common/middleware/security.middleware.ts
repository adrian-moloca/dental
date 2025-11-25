/**
 * Security Middleware Configuration
 *
 * Configures various security middleware for the Enterprise Service:
 * - Helmet (security headers)
 * - CORS (cross-origin resource sharing)
 * - Rate limiting
 * - Body size limits
 * - Cookie security
 *
 * Edge cases handled:
 * - Production vs development configuration
 * - Multi-origin CORS support
 * - Tenant-specific rate limiting
 * - Request size limits for DoS prevention
 *
 * @module SecurityMiddleware
 */

import helmet from 'helmet';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import type { Request as ExpressRequest } from 'express';

/**
 * Helmet configuration for security headers
 *
 * Edge cases:
 * - Content Security Policy (CSP) for XSS prevention
 * - HSTS for HTTPS enforcement
 * - X-Frame-Options for clickjacking prevention
 * - Development mode allows less strict CSP for debugging
 *
 * @param isDevelopment - Whether running in development mode
 * @returns Helmet configuration
 */
export function getHelmetConfig(isDevelopment = false) {
  return helmet({
    // Content Security Policy
    contentSecurityPolicy: isDevelopment
      ? false // Disable in development for easier debugging
      : {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        },

    // HTTP Strict Transport Security (HSTS)
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },

    // X-Frame-Options (clickjacking prevention)
    frameguard: {
      action: 'deny',
    },

    // X-Content-Type-Options (MIME sniffing prevention)
    noSniff: true,

    // X-XSS-Protection
    xssFilter: true,

    // Referrer-Policy
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },

    // X-DNS-Prefetch-Control
    dnsPrefetchControl: {
      allow: false,
    },

    // X-Download-Options
    ieNoOpen: true,

    // Hide X-Powered-By header
    hidePoweredBy: true,
  });
}

/**
 * CORS configuration for multi-tenant applications
 *
 * Edge cases:
 * - Multiple allowed origins (array support)
 * - Dynamic origin validation
 * - Credentials support for authenticated requests
 * - Preflight request caching
 * - Custom headers for tenant context
 *
 * @param allowedOrigins - Allowed origins (string or array)
 * @param isDevelopment - Whether running in development mode
 * @returns CORS configuration
 */
export function getCorsConfig(
  allowedOrigins: string | string[],
  isDevelopment = false,
): CorsOptions {
  // Convert single origin to array for consistent handling
  const originsArray = Array.isArray(allowedOrigins) ? allowedOrigins : [allowedOrigins];

  return {
    // Origin validation
    origin: (origin, callback) => {
      // Edge case: Allow requests with no origin (mobile apps, Postman)
      if (!origin) {
        return callback(null, true);
      }

      // Edge case: In development, allow all origins
      if (isDevelopment) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (originsArray.includes(origin)) {
        return callback(null, true);
      }

      // Edge case: Support wildcard subdomains
      const isAllowed = originsArray.some((allowed) => {
        if (allowed.includes('*')) {
          const pattern = allowed.replace(/\*/g, '.*');
          const regex = new RegExp(`^${pattern}$`);
          return regex.test(origin);
        }
        return false;
      });

      if (isAllowed) {
        return callback(null, true);
      }

      // Origin not allowed
      callback(new Error('Not allowed by CORS'));
    },

    // Allow credentials (cookies, authorization headers)
    credentials: true,

    // Allowed HTTP methods
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    // Allowed headers
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Correlation-ID',
      'X-Organization-ID',
      'X-Clinic-ID',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],

    // Exposed headers (accessible to client)
    exposedHeaders: [
      'X-Correlation-ID',
      'X-Response-Time',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
    ],

    // Preflight cache duration (in seconds)
    maxAge: 86400, // 24 hours

    // Allow preflight to pass OPTIONS requests through
    preflightContinue: false,

    // Provide successful OPTIONS requests with 204 status
    optionsSuccessStatus: 204,
  };
}

/**
 * Body parser size limits configuration
 *
 * Edge cases:
 * - Different limits for JSON vs URL-encoded
 * - Protection against DoS attacks
 * - Large file uploads handled separately (use multipart)
 *
 * @returns Body parser limits
 */
export function getBodyParserLimits() {
  return {
    // JSON body limit
    json: {
      limit: '10mb', // Maximum 10 MB JSON payload
    },

    // URL-encoded body limit
    urlencoded: {
      extended: true,
      limit: '10mb', // Maximum 10 MB URL-encoded payload
    },

    // Raw body limit
    raw: {
      limit: '10mb',
    },

    // Text body limit
    text: {
      limit: '10mb',
    },
  };
}

/**
 * Cookie parser configuration
 *
 * Edge cases:
 * - Signed cookies for tamper protection
 * - Secure cookies in production
 * - SameSite attribute for CSRF protection
 *
 * @param secret - Cookie signing secret
 * @param isDevelopment - Whether running in development mode
 * @returns Cookie configuration
 */
export function getCookieConfig(secret: string, isDevelopment = false) {
  return {
    secret,
    signed: true, // Enable signed cookies

    // Cookie defaults
    httpOnly: true, // Prevent JavaScript access (XSS protection)
    secure: !isDevelopment, // HTTPS only in production
    sameSite: 'strict' as const, // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

/**
 * Rate limiting configuration
 *
 * Edge cases:
 * - Different limits for different endpoints
 * - Tenant-specific rate limiting
 * - Skip rate limiting for health checks
 * - Custom error responses
 *
 * Note: Requires express-rate-limit package
 */
export interface RateLimitConfig {
  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Maximum requests per window
   */
  max: number;

  /**
   * Message when rate limit exceeded
   */
  message?: string;

  /**
   * Status code when rate limit exceeded
   */
  statusCode?: number;

  /**
   * Skip function to bypass rate limiting for certain requests
   */
  skip?: (req: ExpressRequest) => boolean;

  /**
   * Key generator for custom rate limit keys
   * Default: IP address
   */
  keyGenerator?: (req: ExpressRequest) => string;
}

/**
 * Default rate limit configuration
 *
 * Edge cases:
 * - 100 requests per 15 minutes per IP
 * - Skips health check endpoints
 * - Custom error message
 */
export const defaultRateLimitConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later',
  statusCode: 429,

  // Edge case: Skip rate limiting for health checks
  skip: (req: ExpressRequest) => {
    return req.path === '/health' || req.path === '/api/v1/health';
  },
};

/**
 * Strict rate limit configuration (for sensitive endpoints)
 *
 * Edge cases:
 * - 10 requests per hour per IP
 * - For authentication, password reset, etc.
 */
export const strictRateLimitConfig: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per window
  message: 'Too many attempts, please try again later',
  statusCode: 429,
};

/**
 * Tenant-based rate limiting
 *
 * Edge cases:
 * - Rate limit per organization
 * - Different limits for different subscription tiers
 *
 * @param req - Express request
 * @returns Rate limit key
 */
export function tenantRateLimitKeyGenerator(
  req: ExpressRequest & { context?: { organizationId?: string } },
): string {
  // Use organization ID if available, otherwise fall back to IP
  const organizationId = req.context?.organizationId || req.get('x-organization-id');
  return organizationId || req.ip || 'unknown';
}
