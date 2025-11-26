/**
 * Configuration Factory for Backend Auth Service
 *
 * Loads and validates environment variables using Zod schemas.
 * Provides typed configuration object for the entire application.
 *
 * @security RS256 JWT Algorithm Enforcement
 * This configuration requires RSA key pairs for JWT operations.
 * Symmetric algorithms (HS256, etc.) are NOT supported to prevent
 * algorithm confusion attacks.
 *
 * @module configuration
 */

import { z } from 'zod';

/**
 * Decode a PEM key from base64 if it appears to be base64-encoded
 *
 * Environment variables often have issues with multiline PEM keys.
 * This helper allows keys to be provided as base64-encoded strings.
 *
 * @param key - Raw key string or base64-encoded key
 * @returns Decoded PEM key string
 */
function decodeKeyIfBase64(key: string | undefined): string | undefined {
  if (!key) return undefined;

  // If it already looks like a PEM key, return as-is
  if (key.includes('-----BEGIN')) {
    return key;
  }

  // Try to decode as base64
  try {
    const decoded = Buffer.from(key, 'base64').toString('utf-8');
    if (decoded.includes('-----BEGIN')) {
      return decoded;
    }
  } catch {
    // Not valid base64, return original
  }

  return key;
}

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
 *
 * @security CRITICAL: RS256 Algorithm Enforcement
 * This configuration requires RSA key pairs for JWT signing/verification.
 * RS256 (RSA + SHA-256) is mandatory to prevent algorithm confusion attacks.
 *
 * Key Requirements:
 * - accessPrivateKey: RSA private key (PEM format) for signing access tokens
 * - accessPublicKey: RSA public key (PEM format) for verifying access tokens
 * - refreshPrivateKey: RSA private key (PEM format) for signing refresh tokens
 * - refreshPublicKey: RSA public key (PEM format) for verifying refresh tokens
 *
 * Generate keys with:
 *   openssl genrsa -out private.pem 2048
 *   openssl rsa -in private.pem -pubout -out public.pem
 *
 * @see CVE-2015-9235 - Algorithm confusion vulnerability
 * @see CVE-2016-10555 - jsonwebtoken algorithm confusion
 */
const JwtConfigSchema = z.object({
  // RS256 requires RSA key pairs - private key for signing, public key for verification
  // Private keys should ONLY be available to the auth service (token generation)
  // Public keys can be distributed to all services for token verification

  // Access token keys (short-lived tokens for API authentication)
  accessPrivateKey: z
    .string()
    .min(100)
    .refine((key) => key.includes('-----BEGIN') && key.includes('PRIVATE KEY'), {
      message: 'accessPrivateKey must be a valid PEM-encoded RSA private key',
    }),
  accessPublicKey: z
    .string()
    .min(100)
    .refine((key) => key.includes('-----BEGIN') && key.includes('PUBLIC KEY'), {
      message: 'accessPublicKey must be a valid PEM-encoded RSA public key',
    }),

  // Refresh token keys (long-lived tokens for session renewal)
  refreshPrivateKey: z
    .string()
    .min(100)
    .refine((key) => key.includes('-----BEGIN') && key.includes('PRIVATE KEY'), {
      message: 'refreshPrivateKey must be a valid PEM-encoded RSA private key',
    }),
  refreshPublicKey: z
    .string()
    .min(100)
    .refine((key) => key.includes('-----BEGIN') && key.includes('PUBLIC KEY'), {
      message: 'refreshPublicKey must be a valid PEM-encoded RSA public key',
    }),

  // Token expiration settings
  accessExpiration: z.string().default('15m'),
  refreshExpiration: z.string().default('7d'),

  // Token validation settings
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
 * Security configuration schema (Argon2id password hashing, MFA encryption, CSRF)
 */
const SecurityConfigSchema = z.object({
  argon2: z.object({
    memoryCost: z.coerce.number().int().positive().default(65536),
    timeCost: z.coerce.number().int().positive().default(3),
    parallelism: z.coerce.number().int().positive().default(4),
  }),
  /**
   * Password History Configuration
   *
   * Number of previous passwords to check when user changes password.
   * Prevents users from reusing recent passwords.
   *
   * Default: 5 (checks last 5 passwords)
   * Min: 0 (disabled)
   * Max: 24 (2 years if password changed monthly)
   *
   * Compliance notes:
   * - NIST SP 800-63B no longer requires password history
   * - Some organizations still enforce it for compliance
   * - Consider setting to 0 for better user experience
   */
  passwordHistoryCount: z.coerce.number().int().min(0).max(24).default(5),
  /**
   * MFA TOTP Secret Encryption Key
   *
   * CRITICAL: TOTP secrets MUST be encrypted, not hashed.
   * TOTP verification requires the original secret to compute HMAC.
   * Hashing is one-way and would make verification impossible.
   *
   * AES-256-GCM requires a 32-byte (256-bit) key.
   * Generate with: openssl rand -hex 32
   *
   * @security This key protects all TOTP secrets in the database.
   * Compromise of this key allows attackers to bypass MFA for all users.
   * Store securely in secrets manager (AWS Secrets Manager, HashiCorp Vault).
   */
  mfaEncryptionKey: z
    .string()
    .length(64)
    .regex(/^[0-9a-fA-F]+$/, {
      message: 'MFA encryption key must be a 64-character hex string (32 bytes)',
    }),
  /**
   * CSRF Protection Configuration
   *
   * Implements double-submit cookie pattern for CSRF protection.
   * Token is generated on login, returned in response, and set as cookie.
   * Frontend must send token in X-CSRF-Token header on state-changing requests.
   *
   * @security CSRF tokens are cryptographically random (256-bit)
   * @security Uses timing-safe comparison to prevent timing attacks
   */
  csrf: z.object({
    /** Enable/disable CSRF protection globally */
    enabled: z.coerce.boolean().default(true),
    /** Token time-to-live in seconds (matches session timeout) */
    tokenTtl: z.coerce.number().int().positive().default(86400), // 24 hours
    /** Cookie name for CSRF token */
    cookieName: z.string().default('csrf_token'),
    /** Header name for CSRF token */
    headerName: z.string().default('X-CSRF-Token'),
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
      // RS256 key pairs for secure asymmetric JWT signing
      // Keys can be provided directly or as base64-encoded strings
      // Base64 encoding is useful when keys contain newlines that break env vars
      accessPrivateKey: decodeKeyIfBase64(process.env.JWT_ACCESS_PRIVATE_KEY),
      accessPublicKey: decodeKeyIfBase64(process.env.JWT_ACCESS_PUBLIC_KEY),
      refreshPrivateKey: decodeKeyIfBase64(process.env.JWT_REFRESH_PRIVATE_KEY),
      refreshPublicKey: decodeKeyIfBase64(process.env.JWT_REFRESH_PUBLIC_KEY),
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
      passwordHistoryCount: process.env.PASSWORD_HISTORY_COUNT,
      mfaEncryptionKey: process.env.MFA_ENCRYPTION_KEY,
      csrf: {
        enabled: process.env.CSRF_ENABLED,
        tokenTtl: process.env.CSRF_TOKEN_TTL,
        cookieName: process.env.CSRF_COOKIE_NAME,
        headerName: process.env.CSRF_HEADER_NAME,
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
