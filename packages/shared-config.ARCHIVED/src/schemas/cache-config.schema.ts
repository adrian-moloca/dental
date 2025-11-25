/**
 * Cache Configuration Schema
 * Re-exports cache configuration from shared-infra
 */

import { RedisConfig, loadRedisConfig } from '@dentalos/shared-infra';

/**
 * Re-export Redis configuration type
 */
export type { RedisConfig };

/**
 * Re-export Redis configuration loader
 */
export { loadRedisConfig };
