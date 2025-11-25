/**
 * Shared Configuration Package
 * Global type-safe configuration with feature flags for Dental OS
 *
 * @packageDocumentation
 */

// ============================================================================
// Core Configuration
// ============================================================================

// Config loader and utilities
export {
  loadConfig,
  clearConfigCache,
  getConfigSection,
  isConfigLoaded,
} from './loaders/config-loader';

// Environment detection
export {
  detectEnvironment,
  getEnvironmentInfo,
  isProduction,
  isDevelopment,
  isStaging,
  isTest,
  requireProduction,
  requireNonProduction,
} from './loaders/environment-detector';

// ============================================================================
// Schemas and Types
// ============================================================================

// Master config schema
export { ConfigSchema, validateConfig, isValidEnvironment } from './schemas/config-schema';
export type { Config } from './schemas/config-schema';

// Individual config schemas
export {
  JWTConfigSchema,
  FeaturesConfigSchema,
  RateLimitConfigSchema,
  LoggingConfigSchema,
  MultiTenantConfigSchema,
} from './schemas';

// Re-exported schemas from shared-infra
export {
  loadDatabaseConfig,
  loadPostgresConfig,
  loadMongoDBConfig,
  loadRedisConfig,
  loadRabbitMQConfig,
  loadOpenSearchConfig,
} from './schemas';

// Type exports
export type {
  JWTConfig,
  FeaturesConfig,
  RateLimitConfig,
  LoggingConfig,
  MultiTenantConfig,
  DatabaseConfig,
  PostgresConfig,
  MongoDBConfig,
  RedisConfig,
  RabbitMQConfig,
  OpenSearchConfig,
} from './schemas';

export type {
  Environment,
  EnvironmentInfo,
  EnvironmentOverrides,
  FeatureFlag,
  TenantFeatureFlag,
  RateLimitTier,
  PerTenantRateLimit,
  LogConfig,
  ConfigValidationResult,
  ConfigValidationError,
  ConfigValidationWarning,
  ConfigMetadata,
} from './types';

// ============================================================================
// Feature Flags
// ============================================================================

export {
  FeatureFlagManager,
  getFeatureFlagManager,
  resetFeatureFlagManager,
} from './feature-flags/feature-flag-manager';

export {
  batchUpdateTenantOverrides,
  applyTenantOverrides,
  getTenantOverridesWithMetadata,
  compareTenantOverridesWithGlobal,
  resetTenantToGlobal,
  hasTenantOverrides,
} from './feature-flags/tenant-feature-overrides';

export type { TenantFeatureOverride } from './feature-flags/tenant-feature-overrides';

// ============================================================================
// Utilities
// ============================================================================

export {
  sanitizeConfigForLogging,
  sanitizeDatabaseConfig,
  createConfigSummary,
} from './utils/secret-sanitizer';

// ============================================================================
// Validators
// ============================================================================

export {
  validateProductionConfig,
  validateBasicConfig,
} from './validators';

// ============================================================================
// Environment Defaults (for reference/testing)
// ============================================================================

export {
  DEVELOPMENT_DEFAULTS,
  STAGING_DEFAULTS,
  PRODUCTION_DEFAULTS,
} from './defaults';
