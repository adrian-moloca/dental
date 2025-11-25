/**
 * Secret Sanitizer
 * Utilities for sanitizing configuration objects before logging
 */

import type { Config } from '../schemas/config-schema';

/**
 * Sensitive field patterns to redact
 * Fields matching these patterns will be replaced with '[REDACTED]'
 */
const SENSITIVE_FIELD_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /apikey/i,
  /api_key/i,
  /private/i,
  /credential/i,
];

/**
 * Redaction placeholder
 */
const REDACTED = '[REDACTED]';

/**
 * Check if a field name is sensitive
 *
 * @param fieldName - Field name to check
 * @returns True if field is sensitive
 */
function isSensitiveField(fieldName: string): boolean {
  return SENSITIVE_FIELD_PATTERNS.some((pattern) => pattern.test(fieldName));
}

/**
 * Sanitize a configuration object for logging
 * Recursively redacts sensitive fields
 *
 * @param config - Configuration object to sanitize
 * @returns Sanitized configuration safe for logging
 */
export function sanitizeConfigForLogging(config: Config): Partial<Config> {
  return sanitizeObject(config) as Partial<Config>;
}

/**
 * Recursively sanitize an object
 *
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
function sanitizeObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveField(key)) {
      // Redact sensitive fields
      sanitized[key] = REDACTED;
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeObject(value);
    } else {
      // Keep non-sensitive primitive values
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Sanitize a database configuration
 * Specifically handles database connection strings and credentials
 *
 * @param config - Database config to sanitize
 * @returns Sanitized database config
 */
export function sanitizeDatabaseConfig(config: Config['database']): unknown {
  return {
    postgres: {
      host: config.postgres.host,
      port: config.postgres.port,
      database: config.postgres.database,
      user: config.postgres.user,
      password: REDACTED,
      maxConnections: config.postgres.maxConnections,
      idleTimeoutMillis: config.postgres.idleTimeoutMillis,
      connectionTimeoutMillis: config.postgres.connectionTimeoutMillis,
      ssl: config.postgres.ssl,
    },
    mongodb: {
      uri: sanitizeConnectionString(config.mongodb.uri),
      database: config.mongodb.database,
      maxPoolSize: config.mongodb.maxPoolSize,
      minPoolSize: config.mongodb.minPoolSize,
      maxIdleTimeMS: config.mongodb.maxIdleTimeMS,
      serverSelectionTimeoutMS: config.mongodb.serverSelectionTimeoutMS,
    },
  };
}

/**
 * Sanitize a connection string by removing credentials
 *
 * @param connectionString - Connection string to sanitize
 * @returns Sanitized connection string
 */
function sanitizeConnectionString(connectionString: string): string {
  try {
    // Handle MongoDB connection strings: mongodb://user:pass@host:port/db
    // Replace credentials with [REDACTED]
    const sanitized = connectionString.replace(
      /\/\/([^:]+):([^@]+)@/,
      `//${REDACTED}:${REDACTED}@`,
    );
    return sanitized;
  } catch {
    // If sanitization fails, redact entire string
    return REDACTED;
  }
}

/**
 * Create a safe summary of configuration for logging
 * Only includes non-sensitive metadata
 *
 * @param config - Configuration object
 * @returns Safe configuration summary
 */
export function createConfigSummary(config: Config): Record<string, unknown> {
  return {
    environment: config.environment,
    database: {
      postgres: {
        host: config.database.postgres.host,
        port: config.database.postgres.port,
        database: config.database.postgres.database,
      },
      mongodb: {
        database: config.database.mongodb.database,
      },
    },
    cache: {
      host: config.cache.host,
      port: config.cache.port,
    },
    features: config.features,
    logging: config.logging,
    multiTenant: config.multiTenant,
  };
}
