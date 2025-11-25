/**
 * Production Configuration Validator
 * Validates production configuration to prevent security vulnerabilities
 * and compliance violations
 */

import type { Config } from '../schemas/config-schema';

/**
 * Weak or development patterns in JWT secrets
 */
const WEAK_JWT_SECRET_PATTERNS = [
  'dev',
  'test',
  'demo',
  'example',
  'changeme',
  'secret',
  'password',
  '12345',
  'abc',
];

/**
 * Minimum JWT secret length for production (256 bits)
 */
const MIN_JWT_SECRET_LENGTH = 32;

/**
 * Validates JWT configuration for production
 *
 * @param config - Configuration to validate
 * @throws Error if JWT configuration is insecure
 */
function validateJWTConfig(config: Config): void {
  const { jwt } = config;

  // Check secret length
  if (jwt.secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `CRITICAL: JWT secret must be at least ${MIN_JWT_SECRET_LENGTH} characters in production (current: ${jwt.secret.length})`,
    );
  }

  // Check for weak patterns in secret
  const normalizedSecret = jwt.secret.toLowerCase();
  for (const pattern of WEAK_JWT_SECRET_PATTERNS) {
    if (normalizedSecret.includes(pattern)) {
      throw new Error(
        `CRITICAL: JWT secret contains weak or development pattern "${pattern}" in production`,
      );
    }
  }

  // Validate token TTL is reasonable for production
  if (jwt.accessTokenTTL > 3600) {
    console.warn(
      `WARNING: Access token TTL is high (${jwt.accessTokenTTL}s). Consider using shorter TTL for better security.`,
    );
  }

  if (jwt.refreshTokenTTL > 2592000) {
    // 30 days
    console.warn(
      `WARNING: Refresh token TTL is very high (${jwt.refreshTokenTTL}s). Consider using shorter TTL.`,
    );
  }
}

/**
 * Validates multi-tenant configuration for production
 *
 * @param config - Configuration to validate
 * @throws Error if multi-tenant configuration violates security requirements
 */
function validateMultiTenantConfig(config: Config): void {
  const { multiTenant } = config;

  // Cross-org access MUST be disabled in production
  if (multiTenant.enableCrossOrgAccess === true) {
    throw new Error(
      'CRITICAL: Cross-organization access must be disabled in production (HIPAA compliance violation)',
    );
  }

  // Isolation policy MUST be strict in production
  if (multiTenant.isolationPolicy !== 'strict') {
    throw new Error(
      `CRITICAL: Tenant isolation policy must be "strict" in production (current: ${multiTenant.isolationPolicy})`,
    );
  }
}

/**
 * Validates rate limiting configuration for production
 *
 * @param config - Configuration to validate
 */
function validateRateLimitConfig(config: Config): void {
  const { rateLimit } = config;

  // Warn if per-tenant rate limiting is disabled
  if (!rateLimit.perTenant.enabled) {
    console.warn(
      'WARNING: Per-tenant rate limiting is disabled in production. ' +
        'This may allow one tenant to exhaust platform resources (HIPAA availability violation).',
    );
  }

  // Validate rate limits are reasonable
  if (rateLimit.public.max > 1000) {
    console.warn(
      `WARNING: Public rate limit is very high (${rateLimit.public.max} requests per window). ` +
        'This may allow abuse.',
    );
  }

  if (rateLimit.perTenant.enabled) {
    const { defaultTenantLimit } = rateLimit.perTenant;

    // Warn if per-tenant limit is too high
    if (defaultTenantLimit.max > 50000) {
      console.warn(
        `WARNING: Per-tenant rate limit is very high (${defaultTenantLimit.max} requests per window). ` +
          'This may not prevent resource exhaustion.',
      );
    }

    // Ensure per-tenant limit is higher than authenticated limit
    if (defaultTenantLimit.max < rateLimit.authenticated.max) {
      console.warn(
        'WARNING: Per-tenant rate limit is lower than authenticated rate limit. ' +
          'This may cause issues for tenants with multiple users.',
      );
    }
  }
}

/**
 * Validates database configuration for production
 *
 * @param config - Configuration to validate
 */
function validateDatabaseConfig(config: Config): void {
  const { database } = config;

  // Warn if SSL is disabled for PostgreSQL
  if (!database.postgres.ssl) {
    console.warn(
      'WARNING: PostgreSQL SSL is disabled in production. ' +
        'This may violate HIPAA encryption in transit requirements.',
    );
  }

  // Warn if connection pool is too small
  if (database.postgres.maxConnections < 10) {
    console.warn(
      `WARNING: PostgreSQL max connections is very low (${database.postgres.maxConnections}). ` +
        'This may cause connection exhaustion under load.',
    );
  }

  // Warn if connection pool is too large
  if (database.postgres.maxConnections > 100) {
    console.warn(
      `WARNING: PostgreSQL max connections is very high (${database.postgres.maxConnections}). ` +
        'Ensure your database can handle this many connections.',
    );
  }
}

/**
 * Validates feature flag configuration for production
 *
 * @param config - Configuration to validate
 */
function validateFeaturesConfig(config: Config): void {
  const { features } = config;

  // Critical security features that should be enabled
  if (!features.enableAuditLogging) {
    console.warn(
      'WARNING: Audit logging is disabled in production. ' +
        'This violates HIPAA audit trail requirements.',
    );
  }

  if (!features.enableEncryptionAtRest) {
    console.warn(
      'WARNING: Encryption at rest is disabled in production. ' +
        'This may violate HIPAA data protection requirements.',
    );
  }

  if (!features.enableTwoFactorAuth) {
    console.warn(
      'WARNING: Two-factor authentication is disabled in production. ' +
        'This weakens security posture.',
    );
  }
}

/**
 * Validates logging configuration for production
 *
 * @param config - Configuration to validate
 */
function validateLoggingConfig(config: Config): void {
  const { logging } = config;

  // JSON format is required for production log aggregation
  if (logging.format !== 'json') {
    console.warn(
      `WARNING: Log format is "${logging.format}" in production. ` +
        'Consider using "json" for structured logging and better log aggregation.',
    );
  }

  // DEBUG level is too verbose for production
  if (logging.level === 'DEBUG') {
    console.warn(
      'WARNING: Log level is DEBUG in production. ' +
        'This may generate excessive logs and impact performance. Consider INFO or WARN.',
    );
  }
}

/**
 * Validates production configuration to prevent security issues and compliance violations
 * Should be called in production environment during config loading
 *
 * @param config - Configuration to validate
 * @throws Error if critical security or compliance issues are detected
 */
export function validateProductionConfig(config: Config): void {
  // Only validate in production environment
  if (config.environment !== 'production') {
    return;
  }

  console.log('Running production configuration validation...');

  try {
    // Critical validations (throw errors)
    validateJWTConfig(config);
    validateMultiTenantConfig(config);

    // Warning validations (log warnings but don't fail)
    validateRateLimitConfig(config);
    validateDatabaseConfig(config);
    validateFeaturesConfig(config);
    validateLoggingConfig(config);

    console.log('Production configuration validation completed successfully.');
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Re-throw with more context
      throw new Error(
        `Production configuration validation failed: ${error.message}`,
        { cause: error },
      );
    }
    throw error;
  }
}

/**
 * Validates configuration for any environment (subset of production checks)
 *
 * @param config - Configuration to validate
 */
export function validateBasicConfig(config: Config): void {
  // Check JWT secret is not empty
  if (!config.jwt.secret || config.jwt.secret.trim().length === 0) {
    throw new Error('JWT secret cannot be empty');
  }

  // Check database connection strings are not empty
  if (!config.database.postgres.host || config.database.postgres.host.trim().length === 0) {
    throw new Error('PostgreSQL host cannot be empty');
  }

  if (!config.database.mongodb.uri || config.database.mongodb.uri.trim().length === 0) {
    throw new Error('MongoDB URI cannot be empty');
  }

  // Validate rate limit values are positive
  if (config.rateLimit.public.max <= 0 || config.rateLimit.public.windowMs <= 0) {
    throw new Error('Rate limit values must be positive');
  }

  if (config.rateLimit.authenticated.max <= 0 || config.rateLimit.authenticated.windowMs <= 0) {
    throw new Error('Rate limit values must be positive');
  }

  if (config.rateLimit.admin.max <= 0 || config.rateLimit.admin.windowMs <= 0) {
    throw new Error('Rate limit values must be positive');
  }

  if (config.rateLimit.perTenant.enabled) {
    const { defaultTenantLimit } = config.rateLimit.perTenant;
    if (defaultTenantLimit.max <= 0 || defaultTenantLimit.windowMs <= 0) {
      throw new Error('Per-tenant rate limit values must be positive');
    }
  }
}
