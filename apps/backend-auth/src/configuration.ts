/**
 * Configuration Factory for Backend Auth Service
 *
 * Loads and validates environment variables using Zod schemas.
 * Provides typed configuration object for the entire application.
 *
 * @module configuration
 */

import { z } from 'zod';

/**
 * Database configuration schema
 */
const DatabaseConfigSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().int().positive(),
  username: z.string().min(1),
  password: z.string().min(1),
  database: z.string().min(1),
  ssl: z
    .union([
      z.string(),
      z.boolean(),
      z.object({
        rejectUnauthorized: z.boolean(),
        ca: z.string().optional(),
        cert: z.string().optional(),
        key: z.string().optional(),
      }),
    ])
    .default(false)
    .transform(
      (
        value
      ): boolean | { rejectUnauthorized: boolean; ca?: string; cert?: string; key?: string } => {
        // Transform string 'true'/'false' to boolean
        if (typeof value === 'string') {
          if (value === 'true') return true;
          if (value === 'false') return false;
          // If string is not 'true' or 'false', default to false
          return false;
        }
        return value;
      }
    ),
  logging: z.coerce.boolean().default(false),
  synchronize: z.coerce.boolean().default(false),
  maxConnections: z.coerce.number().int().positive().default(10),
  connectTimeout: z.coerce.number().int().positive().default(10000),
});

/**
 * Redis configuration schema
 */
const RedisConfigSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().int().positive(),
  password: z.string().optional(),
  db: z.coerce.number().int().min(0).default(0),
  tls: z.coerce.boolean().default(false),
  keyPrefix: z.string().default('dentalos:auth:'),
});

/**
 * JWT configuration schema
 */
const JwtConfigSchema = z.object({
  accessSecret: z.string().min(32),
  refreshSecret: z.string().min(32),
  accessExpiration: z.string().default('15m'),
  refreshExpiration: z.string().default('7d'),
  issuer: z.string().default('dentalos-auth'),
  audience: z.string().default('dentalos-api'),
});

/**
 * Device configuration schema
 */
const DeviceConfigSchema = z.object({
  tokenSecret: z.string().min(32).default('dev-device-token-secret-change-me-please-32chars'),
});

/**
 * CORS configuration schema
 */
const CorsConfigSchema = z.object({
  origins: z.string().transform((val) => val.split(',')),
  credentials: z.coerce.boolean().default(true),
});

/**
 * Rate limiting configuration schema
 */
const RateLimitConfigSchema = z.object({
  ttl: z.coerce.number().int().positive().default(60000), // milliseconds
  maxRequests: z.coerce.number().int().positive().default(100),

  // Per-tenant rate limiting (prevents noisy neighbor)
  perTenant: z.object({
    enabled: z.coerce.boolean().default(true),
    defaultTenantLimit: z.object({
      ttl: z.coerce.number().int().positive().default(900000), // 15 minutes
      max: z.coerce.number().int().positive().default(5000),
    }),
  }),

  // Endpoint-specific overrides
  auth: z.object({
    ttl: z.coerce.number().int().positive().default(60000), // 1 minute
    max: z.coerce.number().int().positive().default(10),
  }),
  passwordReset: z.object({
    ttl: z.coerce.number().int().positive().default(300000), // 5 minutes
    max: z.coerce.number().int().positive().default(3),
  }),
});

/**
 * Security configuration schema (Argon2id password hashing)
 */
const SecurityConfigSchema = z.object({
  argon2: z.object({
    memoryCost: z.coerce.number().int().positive().default(65536),
    timeCost: z.coerce.number().int().positive().default(3),
    parallelism: z.coerce.number().int().positive().default(4),
  }),
});

/**
 * Subscription service configuration schema
 */
const SubscriptionServiceConfigSchema = z.object({
  url: z.string().url().default('http://localhost:3311'),
  timeout: z.coerce.number().int().positive().default(5000),
});

/**
 * Application configuration schema
 */
const ConfigSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().int().positive().default(3301),
  serviceName: z.string().default('backend-auth'),
  database: DatabaseConfigSchema,
  redis: RedisConfigSchema,
  jwt: JwtConfigSchema,
  device: DeviceConfigSchema,
  cors: CorsConfigSchema,
  rateLimit: RateLimitConfigSchema,
  security: SecurityConfigSchema,
  subscriptionService: SubscriptionServiceConfigSchema,
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  logFormat: z.enum(['json', 'pretty']).default('json'),
  swaggerEnabled: z.coerce.boolean().default(false),
  shutdownTimeout: z.coerce.number().int().positive().default(10000),
});

/**
 * Configuration type
 */
export type AppConfig = z.infer<typeof ConfigSchema>;

/**
 * Load and validate configuration from environment variables
 *
 * @returns Validated configuration object
 * @throws {Error} If configuration validation fails
 */
export function loadConfiguration(): AppConfig {
  const config = {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    serviceName: process.env.SERVICE_NAME,
    database: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      ssl: (() => {
        const sslEnabled = process.env.DATABASE_SSL === 'true';

        if (!sslEnabled) {
          return false;
        }

        // SSL enabled - determine configuration
        const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false';

        return {
          rejectUnauthorized,
          ca: process.env.DATABASE_SSL_CA,
          cert: process.env.DATABASE_SSL_CERT,
          key: process.env.DATABASE_SSL_KEY,
        };
      })(),
      logging: process.env.DATABASE_LOGGING,
      synchronize: process.env.DATABASE_SYNCHRONIZE,
      maxConnections: process.env.DATABASE_MAX_CONNECTIONS,
      connectTimeout: process.env.DATABASE_CONNECT_TIMEOUT,
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB,
      tls: process.env.REDIS_TLS,
      keyPrefix: process.env.REDIS_KEY_PREFIX,
    },
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET,
      refreshSecret: process.env.JWT_REFRESH_SECRET,
      accessExpiration: process.env.JWT_ACCESS_EXPIRATION,
      refreshExpiration: process.env.JWT_REFRESH_EXPIRATION,
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    },
    device: {
      tokenSecret: process.env.DEVICE_TOKEN_SECRET,
    },
    cors: {
      origins: process.env.CORS_ORIGINS,
      credentials: process.env.CORS_CREDENTIALS,
    },
    rateLimit: {
      ttl: process.env.RATE_LIMIT_TTL,
      maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS,
      perTenant: {
        enabled: process.env.RATE_LIMIT_PER_TENANT_ENABLED,
        defaultTenantLimit: {
          ttl: process.env.RATE_LIMIT_TENANT_TTL,
          max: process.env.RATE_LIMIT_TENANT_MAX,
        },
      },
      auth: {
        ttl: process.env.RATE_LIMIT_AUTH_TTL,
        max: process.env.RATE_LIMIT_AUTH_MAX,
      },
      passwordReset: {
        ttl: process.env.RATE_LIMIT_PASSWORD_RESET_TTL,
        max: process.env.RATE_LIMIT_PASSWORD_RESET_MAX,
      },
    },
    security: {
      argon2: {
        memoryCost: process.env.ARGON2_MEMORY_COST,
        timeCost: process.env.ARGON2_TIME_COST,
        parallelism: process.env.ARGON2_PARALLELISM,
      },
    },
    subscriptionService: {
      url: process.env.SUBSCRIPTION_SERVICE_URL,
      timeout: process.env.SUBSCRIPTION_SERVICE_TIMEOUT,
    },
    logLevel: process.env.LOG_LEVEL,
    logFormat: process.env.LOG_FORMAT,
    swaggerEnabled: process.env.SWAGGER_ENABLED,
    shutdownTimeout: process.env.SHUTDOWN_TIMEOUT,
  };

  try {
    return ConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }
    throw error;
  }
}
