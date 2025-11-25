/**
 * Master Configuration Schema
 * Root schema that combines all configuration modules
 */

import { z } from 'zod';
import type { Environment } from '../types/environment.types';
import { JWTConfigSchema } from './jwt-config.schema';
import { FeaturesConfigSchema } from './features-config.schema';
import { RateLimitConfigSchema } from './rate-limit-config.schema';
import { LoggingConfigSchema } from './logging-config.schema';
import { MultiTenantConfigSchema } from './multi-tenant-config.schema';

/**
 * Environment schema
 */
const EnvironmentSchema = z.enum(['development', 'staging', 'production', 'test']);

/**
 * Master configuration schema
 * Combines all configuration modules into a single validated schema
 */
export const ConfigSchema = z.object({
  /** Runtime environment */
  environment: EnvironmentSchema.describe('Runtime environment'),

  /** Database configuration (loaded from shared-infra) */
  database: z
    .object({
      postgres: z.object({
        host: z.string(),
        port: z.number(),
        database: z.string(),
        user: z.string(),
        password: z.string(),
        maxConnections: z.number(),
        idleTimeoutMillis: z.number(),
        connectionTimeoutMillis: z.number(),
        ssl: z.boolean(),
      }),
      mongodb: z.object({
        uri: z.string(),
        database: z.string(),
        maxPoolSize: z.number(),
        minPoolSize: z.number(),
        maxIdleTimeMS: z.number(),
        serverSelectionTimeoutMS: z.number(),
      }),
    })
    .describe('Database configuration'),

  /** Cache configuration (loaded from shared-infra) */
  cache: z
    .object({
      host: z.string(),
      port: z.number(),
      password: z.string().optional(),
      db: z.number(),
      keyPrefix: z.string(),
      maxRetriesPerRequest: z.number(),
      connectTimeout: z.number(),
      enableReadyCheck: z.boolean(),
      lazyConnect: z.boolean(),
      maxLoadingRetryTime: z.number(),
    })
    .describe('Cache (Redis) configuration'),

  /** Messaging configuration (loaded from shared-infra) */
  messaging: z
    .object({
      url: z.string(),
      heartbeat: z.number(),
      prefetchCount: z.number(),
      connectionTimeout: z.number(),
      reconnectDelay: z.number(),
    })
    .describe('Messaging (RabbitMQ) configuration'),

  /** Search configuration (loaded from shared-infra) */
  search: z
    .object({
      node: z.string(),
      username: z.string().optional(),
      password: z.string().optional(),
      maxRetries: z.number(),
      requestTimeout: z.number(),
      sniffOnStart: z.boolean(),
    })
    .describe('Search (OpenSearch) configuration'),

  /** JWT authentication configuration */
  jwt: JWTConfigSchema.describe('JWT authentication configuration'),

  /** Feature flags configuration */
  features: FeaturesConfigSchema.describe('Feature flags'),

  /** Rate limiting configuration */
  rateLimit: RateLimitConfigSchema.describe('API rate limiting'),

  /** Logging configuration */
  logging: LoggingConfigSchema.describe('Application logging'),

  /** Multi-tenancy configuration */
  multiTenant: MultiTenantConfigSchema.describe('Multi-tenant settings'),
});

/**
 * Inferred TypeScript type from master config schema
 */
export type Config = z.infer<typeof ConfigSchema>;

/**
 * Validate a configuration object
 *
 * @param config - Configuration to validate
 * @returns Validation result
 */
export function validateConfig(
  config: unknown,
): { success: true; data: Config } | { success: false; error: z.ZodError } {
  const result = ConfigSchema.safeParse(config);
  return result;
}

/**
 * Type guard to check if a value is a valid Environment
 *
 * @param value - Value to check
 * @returns True if value is a valid Environment
 */
export function isValidEnvironment(value: unknown): value is Environment {
  return EnvironmentSchema.safeParse(value).success;
}
