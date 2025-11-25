/**
 * Application Configuration
 *
 * Defines configuration structure for the Clinical Service
 */

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

export interface DatabaseConfig {
  uri: string;
}

export interface AppConfig {
  port: number;
  redis: RedisConfig;
  database: DatabaseConfig;
}

export function configuration(): AppConfig {
  return {
    port: parseInt(process.env.PORT || '3005', 10),
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
    },
    database: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dentalos_clinical',
    },
  };
}
