/**
 * Configuration Loader
 * Loads and validates the complete application configuration
 */

import { detectEnvironment } from './environment-detector';
import { ConfigSchema, type Config } from '../schemas/config-schema';
import { loadDatabaseConfig } from '../schemas/database-config.schema';
import { loadRedisConfig } from '../schemas/cache-config.schema';
import { loadRabbitMQConfig } from '../schemas/messaging-config.schema';
import { loadOpenSearchConfig } from '../schemas/search-config.schema';
import { loadJWTConfig } from '../schemas/jwt-config.schema';
import { loadFeaturesConfig } from '../schemas/features-config.schema';
import { loadRateLimitConfig } from '../schemas/rate-limit-config.schema';
import { loadLoggingConfig } from '../schemas/logging-config.schema';
import { loadMultiTenantConfig } from '../schemas/multi-tenant-config.schema';
import {
  DEVELOPMENT_DEFAULTS,
  STAGING_DEFAULTS,
  PRODUCTION_DEFAULTS,
} from '../defaults';
import type { Environment } from '../types/environment.types';
import { validateProductionConfig, validateBasicConfig } from '../validators/production-validator';

/**
 * Cached configuration instance
 */
let cachedConfig: Readonly<Config> | null = null;

/**
 * Get environment-specific defaults
 *
 * @param environment - Current environment
 * @returns Default configuration for the environment
 */
function getEnvironmentDefaults(environment: Environment): Partial<Config> {
  switch (environment) {
    case 'development':
      return DEVELOPMENT_DEFAULTS;
    case 'staging':
      return STAGING_DEFAULTS;
    case 'production':
      return PRODUCTION_DEFAULTS;
    case 'test':
      // Test environment uses development defaults
      return DEVELOPMENT_DEFAULTS;
    default:
      // Exhaustive check
      const _exhaustive: never = environment;
      throw new Error(`Unknown environment: ${_exhaustive}`);
  }
}

/**
 * Load configuration from environment variables
 * This function loads individual config modules and merges them
 *
 * @returns Raw unvalidated configuration object
 */
function loadRawConfig(environment: Environment): unknown {
  try {
    const database = loadDatabaseConfig();
    const cache = loadRedisConfig();
    const messaging = loadRabbitMQConfig();
    const search = loadOpenSearchConfig();
    const jwt = loadJWTConfig();
    const features = loadFeaturesConfig();
    const rateLimit = loadRateLimitConfig();
    const logging = loadLoggingConfig();
    const multiTenant = loadMultiTenantConfig();

    return {
      environment,
      database,
      cache,
      messaging,
      search,
      jwt,
      features,
      rateLimit,
      logging,
      multiTenant,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to load configuration: ${error.message}`, {
        cause: error,
      });
    }
    throw error;
  }
}

/**
 * Load and validate the complete application configuration
 * Configuration is loaded once and cached for subsequent calls
 *
 * @param forceReload - Force reload configuration (ignore cache)
 * @returns Validated and frozen configuration object
 * @throws Error if configuration is invalid or required values are missing
 */
export function loadConfig(forceReload = false): Readonly<Config> {
  // Return cached config if available
  if (cachedConfig && !forceReload) {
    return cachedConfig;
  }

  const environment = detectEnvironment();
  const defaults = getEnvironmentDefaults(environment);

  // Load raw configuration from environment
  const rawConfig = loadRawConfig(environment);

  // Merge defaults with loaded config (loaded config takes precedence)
  const mergedConfig = Object.assign({}, defaults, rawConfig);

  // Validate merged configuration
  const result = ConfigSchema.safeParse(mergedConfig);

  if (!result.success) {
    const errorMessages = result.error.errors
      .map((err: { path: (string | number)[]; message: string }) => `${err.path.join('.')}: ${err.message}`)
      .join('\n  ');

    throw new Error(
      `Invalid configuration detected:\n  ${errorMessages}\n\nPlease check your environment variables and ensure all required values are set correctly.`,
    );
  }

  // Run basic validation for all environments
  validateBasicConfig(result.data);

  // Run production-specific validation
  validateProductionConfig(result.data);

  // Freeze configuration to prevent mutations
  cachedConfig = Object.freeze(result.data);

  return cachedConfig;
}

/**
 * Clear the cached configuration
 * Useful for testing or when configuration needs to be reloaded
 */
export function clearConfigCache(): void {
  cachedConfig = null;
}

/**
 * Get a specific configuration section
 *
 * @param section - Configuration section to retrieve
 * @returns The requested configuration section
 */
export function getConfigSection<K extends keyof Config>(section: K): Config[K] {
  const config = loadConfig();
  return config[section];
}

/**
 * Check if configuration is loaded and valid
 *
 * @returns True if configuration is loaded and cached
 */
export function isConfigLoaded(): boolean {
  return cachedConfig !== null;
}
