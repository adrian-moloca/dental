/**
 * Schemas barrel export
 */

// Master config schema
export { ConfigSchema, validateConfig, isValidEnvironment } from './config-schema';
export type { Config } from './config-schema';

// JWT config
export { JWTConfigSchema, loadJWTConfig } from './jwt-config.schema';
export type { JWTConfig } from './jwt-config.schema';

// Features config
export { FeaturesConfigSchema, loadFeaturesConfig } from './features-config.schema';
export type { FeaturesConfig } from './features-config.schema';

// Rate limit config
export { RateLimitConfigSchema, loadRateLimitConfig } from './rate-limit-config.schema';
export type { RateLimitConfig } from './rate-limit-config.schema';

// Logging config
export { LoggingConfigSchema, loadLoggingConfig } from './logging-config.schema';
export type { LoggingConfig } from './logging-config.schema';

// Multi-tenant config
export {
  MultiTenantConfigSchema,
  loadMultiTenantConfig,
} from './multi-tenant-config.schema';
export type { MultiTenantConfig } from './multi-tenant-config.schema';

// Database config (re-exports from shared-infra)
export {
  loadDatabaseConfig,
  loadPostgresConfig,
  loadMongoDBConfig,
} from './database-config.schema';
export type { DatabaseConfig, PostgresConfig, MongoDBConfig } from './database-config.schema';

// Cache config (re-exports from shared-infra)
export { loadRedisConfig } from './cache-config.schema';
export type { RedisConfig } from './cache-config.schema';

// Messaging config (re-exports from shared-infra)
export { loadRabbitMQConfig } from './messaging-config.schema';
export type { RabbitMQConfig } from './messaging-config.schema';

// Search config (re-exports from shared-infra)
export { loadOpenSearchConfig } from './search-config.schema';
export type { OpenSearchConfig } from './search-config.schema';
