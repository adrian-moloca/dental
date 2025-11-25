import { z } from 'zod';

/**
 * Redis configuration schema
 */
const RedisConfigSchema = z.object({
  host: z.string().default('localhost'),
  port: z.number().int().positive().default(6381),
  password: z.string().optional(),
  db: z.number().int().nonnegative().default(0),
  keyPrefix: z.string().default('dentalos:'),
  maxRetriesPerRequest: z.number().int().positive().default(3),
  connectTimeout: z.number().int().positive().default(10000),
  enableReadyCheck: z.boolean().default(true),
  lazyConnect: z.boolean().default(false),
  maxLoadingRetryTime: z.number().int().positive().default(10000),
});

export type RedisConfig = z.infer<typeof RedisConfigSchema>;

/**
 * Load Redis configuration from environment variables
 */
export function loadRedisConfig(): RedisConfig {
  return RedisConfigSchema.parse({
    host: process.env.DENTALOS_REDIS_HOST || 'localhost',
    port: process.env.DENTALOS_REDIS_PORT
      ? parseInt(process.env.DENTALOS_REDIS_PORT, 10)
      : 6381,
    password: process.env.DENTALOS_REDIS_PASSWORD,
    db: process.env.DENTALOS_REDIS_DB
      ? parseInt(process.env.DENTALOS_REDIS_DB, 10)
      : 0,
    keyPrefix: process.env.DENTALOS_REDIS_KEY_PREFIX || 'dentalos:',
    maxRetriesPerRequest: process.env.DENTALOS_REDIS_MAX_RETRIES
      ? parseInt(process.env.DENTALOS_REDIS_MAX_RETRIES, 10)
      : 3,
    connectTimeout: process.env.DENTALOS_REDIS_CONNECT_TIMEOUT
      ? parseInt(process.env.DENTALOS_REDIS_CONNECT_TIMEOUT, 10)
      : 10000,
    enableReadyCheck: process.env.DENTALOS_REDIS_ENABLE_READY_CHECK !== 'false',
    lazyConnect: process.env.DENTALOS_REDIS_LAZY_CONNECT === 'true',
    maxLoadingRetryTime: process.env.DENTALOS_REDIS_MAX_LOADING_RETRY_TIME
      ? parseInt(process.env.DENTALOS_REDIS_MAX_LOADING_RETRY_TIME, 10)
      : 10000,
  });
}
