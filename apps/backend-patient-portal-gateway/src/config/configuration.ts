/**
 * Configuration Factory for Backend Patient Portal Gateway
 *
 * Loads and validates environment variables using Zod schemas.
 * Provides typed configuration object for the entire application.
 *
 * @module config/configuration
 */

import { z } from 'zod';

/**
 * Redis configuration schema
 */
const RedisConfigSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().int().positive(),
  password: z.string().optional(),
  db: z.coerce.number().int().min(0).default(0),
  tls: z.coerce.boolean().default(false),
  keyPrefix: z.string().default('dentalos:portal:'),
});

/**
 * JWT configuration schema
 */
const JwtConfigSchema = z.object({
  accessSecret: z.string().min(32),
  publicKey: z.string().optional(),
  issuer: z.string().default('dentalos-auth'),
  audience: z.string().default('dentalos-api'),
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
  maxRequests: z.coerce.number().int().positive().default(60),

  // Auth endpoints rate limiting
  auth: z.object({
    ttl: z.coerce.number().int().positive().default(60000), // 1 minute
    max: z.coerce.number().int().positive().default(10),
  }),

  // Feedback/NPS rate limiting
  feedback: z.object({
    ttl: z.coerce.number().int().positive().default(3600000), // 1 hour
    max: z.coerce.number().int().positive().default(5),
  }),
});

/**
 * Microservices URL configuration schema
 */
const MicroservicesConfigSchema = z.object({
  authServiceUrl: z.string().url(),
  patientServiceUrl: z.string().url(),
  schedulingServiceUrl: z.string().url(),
  clinicalServiceUrl: z.string().url(),
  imagingServiceUrl: z.string().url(),
  billingServiceUrl: z.string().url(),
  marketingServiceUrl: z.string().url(),
});

/**
 * HTTP client configuration schema
 */
const HttpConfigSchema = z.object({
  timeout: z.coerce.number().int().positive().default(5000),
  maxRetries: z.coerce.number().int().min(0).default(3),
  retryDelay: z.coerce.number().int().positive().default(1000),
});

/**
 * Cache configuration schema
 */
const CacheConfigSchema = z.object({
  ttlProfile: z.coerce.number().int().positive().default(300), // 5 minutes
  ttlAppointments: z.coerce.number().int().positive().default(60), // 1 minute
  ttlLoyalty: z.coerce.number().int().positive().default(300), // 5 minutes
});

/**
 * Application configuration schema
 */
const ConfigSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().int().positive().default(3012),
  serviceName: z.string().default('backend-patient-portal-gateway'),
  redis: RedisConfigSchema,
  jwt: JwtConfigSchema,
  cors: CorsConfigSchema,
  rateLimit: RateLimitConfigSchema,
  microservices: MicroservicesConfigSchema,
  http: HttpConfigSchema,
  cache: CacheConfigSchema,
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
      publicKey: process.env.JWT_PUBLIC_KEY,
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    },
    cors: {
      origins: process.env.CORS_ORIGINS,
      credentials: process.env.CORS_CREDENTIALS,
    },
    rateLimit: {
      ttl: process.env.RATE_LIMIT_TTL,
      maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS,
      auth: {
        ttl: process.env.RATE_LIMIT_AUTH_TTL,
        max: process.env.RATE_LIMIT_AUTH_MAX,
      },
      feedback: {
        ttl: process.env.RATE_LIMIT_FEEDBACK_TTL,
        max: process.env.RATE_LIMIT_FEEDBACK_MAX,
      },
    },
    microservices: {
      authServiceUrl: process.env.AUTH_SERVICE_URL,
      patientServiceUrl: process.env.PATIENT_SERVICE_URL,
      schedulingServiceUrl: process.env.SCHEDULING_SERVICE_URL,
      clinicalServiceUrl: process.env.CLINICAL_SERVICE_URL,
      imagingServiceUrl: process.env.IMAGING_SERVICE_URL,
      billingServiceUrl: process.env.BILLING_SERVICE_URL,
      marketingServiceUrl: process.env.MARKETING_SERVICE_URL,
    },
    http: {
      timeout: process.env.HTTP_TIMEOUT_MS,
      maxRetries: process.env.HTTP_MAX_RETRIES,
      retryDelay: process.env.HTTP_RETRY_DELAY_MS,
    },
    cache: {
      ttlProfile: process.env.CACHE_TTL_PROFILE,
      ttlAppointments: process.env.CACHE_TTL_APPOINTMENTS,
      ttlLoyalty: process.env.CACHE_TTL_LOYALTY,
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
