/**
 * Database Configuration Schema
 * Re-exports database configuration from shared-infra
 */

import {
  PostgresConfig,
  loadPostgresConfig,
  MongoDBConfig,
  loadMongoDBConfig,
} from '@dentalos/shared-infra';

/**
 * Re-export PostgreSQL configuration type
 */
export type { PostgresConfig, MongoDBConfig };

/**
 * Re-export PostgreSQL configuration loader
 */
export { loadPostgresConfig, loadMongoDBConfig };

/**
 * Combined database configuration
 */
export interface DatabaseConfig {
  /** PostgreSQL configuration */
  postgres: PostgresConfig;
  /** MongoDB configuration */
  mongodb: MongoDBConfig;
}

/**
 * Load all database configurations
 *
 * @returns Combined database configuration
 */
export function loadDatabaseConfig(): DatabaseConfig {
  return {
    postgres: loadPostgresConfig(),
    mongodb: loadMongoDBConfig(),
  };
}
