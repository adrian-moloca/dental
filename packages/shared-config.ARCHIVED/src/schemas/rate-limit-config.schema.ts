/**
 * Rate Limit Configuration Schema
 * Zod schema for API rate limiting configuration
 */

import { z } from 'zod';

/**
 * Rate limit tier schema
 * Defines time window and maximum request count
 */
const RateLimitTierSchema = z.object({
  /** Time window in milliseconds */
  windowMs: z
    .number()
    .int()
    .positive()
    .describe('Time window for rate limiting in milliseconds'),

  /** Maximum requests allowed in the time window */
  max: z
    .number()
    .int()
    .positive()
    .describe('Maximum requests allowed in the time window'),
});

/**
 * Rate limit configuration schema
 * Defines rate limits for different user tiers and per-tenant limits
 */
export const RateLimitConfigSchema = z.object({
  /** Rate limits for public/unauthenticated requests */
  public: RateLimitTierSchema.extend({
    windowMs: z.number().int().positive().default(900000), // 15 minutes
    max: z.number().int().positive().default(100),
  }),

  /** Rate limits for authenticated user requests */
  authenticated: RateLimitTierSchema.extend({
    windowMs: z.number().int().positive().default(900000), // 15 minutes
    max: z.number().int().positive().default(1000),
  }),

  /** Rate limits for admin/privileged requests */
  admin: RateLimitTierSchema.extend({
    windowMs: z.number().int().positive().default(900000), // 15 minutes
    max: z.number().int().positive().default(10000),
  }),

  /** Per-tenant rate limiting configuration */
  perTenant: z.object({
    /** Enable per-tenant rate limiting to prevent resource exhaustion */
    enabled: z
      .boolean()
      .default(true)
      .describe('Enable per-tenant rate limiting'),

    /** Default rate limit applied to all tenants */
    defaultTenantLimit: RateLimitTierSchema.extend({
      windowMs: z
        .number()
        .int()
        .positive()
        .default(900000)
        .describe('Time window for per-tenant rate limit (ms)'), // 15 minutes
      max: z
        .number()
        .int()
        .positive()
        .default(5000)
        .describe('Maximum requests per tenant in window'), // Per tenant
    }),

    /** Per-tenant overrides (loaded from database or configuration) */
    tenantOverrides: z
      .record(z.string(), RateLimitTierSchema)
      .optional()
      .describe('Tenant-specific rate limit overrides (tenantId -> limits)'),
  }),
});

/**
 * Inferred TypeScript type from rate limit config schema
 */
export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>;

/**
 * Parse boolean from environment variable
 *
 * @param value - Environment variable value
 * @returns Boolean value or undefined if not set
 */
function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  const normalized = value.toLowerCase();
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0') return false;
  return undefined;
}

/**
 * Load rate limit configuration from environment variables
 *
 * @returns Validated rate limit configuration
 * @throws ZodError if validation fails
 */
export function loadRateLimitConfig(): RateLimitConfig {
  const rawConfig = {
    public: {
      windowMs: process.env.DENTALOS_RATE_LIMIT_PUBLIC_WINDOW_MS
        ? parseInt(process.env.DENTALOS_RATE_LIMIT_PUBLIC_WINDOW_MS, 10)
        : undefined,
      max: process.env.DENTALOS_RATE_LIMIT_PUBLIC_MAX
        ? parseInt(process.env.DENTALOS_RATE_LIMIT_PUBLIC_MAX, 10)
        : undefined,
    },
    authenticated: {
      windowMs: process.env.DENTALOS_RATE_LIMIT_AUTHENTICATED_WINDOW_MS
        ? parseInt(process.env.DENTALOS_RATE_LIMIT_AUTHENTICATED_WINDOW_MS, 10)
        : undefined,
      max: process.env.DENTALOS_RATE_LIMIT_AUTHENTICATED_MAX
        ? parseInt(process.env.DENTALOS_RATE_LIMIT_AUTHENTICATED_MAX, 10)
        : undefined,
    },
    admin: {
      windowMs: process.env.DENTALOS_RATE_LIMIT_ADMIN_WINDOW_MS
        ? parseInt(process.env.DENTALOS_RATE_LIMIT_ADMIN_WINDOW_MS, 10)
        : undefined,
      max: process.env.DENTALOS_RATE_LIMIT_ADMIN_MAX
        ? parseInt(process.env.DENTALOS_RATE_LIMIT_ADMIN_MAX, 10)
        : undefined,
    },
    perTenant: {
      enabled: parseBoolean(process.env.DENTALOS_RATE_LIMIT_PER_TENANT_ENABLED),
      defaultTenantLimit: {
        windowMs: process.env.DENTALOS_RATE_LIMIT_PER_TENANT_WINDOW_MS
          ? parseInt(process.env.DENTALOS_RATE_LIMIT_PER_TENANT_WINDOW_MS, 10)
          : undefined,
        max: process.env.DENTALOS_RATE_LIMIT_PER_TENANT_MAX
          ? parseInt(process.env.DENTALOS_RATE_LIMIT_PER_TENANT_MAX, 10)
          : undefined,
      },
      // tenantOverrides typically loaded from database, not environment
      tenantOverrides: undefined,
    },
  };

  return RateLimitConfigSchema.parse(rawConfig);
}
