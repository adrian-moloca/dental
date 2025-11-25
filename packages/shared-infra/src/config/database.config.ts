import { z } from 'zod';

/**
 * PostgreSQL configuration schema
 */
const PostgresConfigSchema = z.object({
  host: z.string().default('localhost'),
  port: z.number().int().positive().default(5432),
  database: z.string(),
  user: z.string(),
  password: z.string(),
  maxConnections: z.number().int().positive().default(20),
  idleTimeoutMillis: z.number().int().positive().default(30000),
  connectionTimeoutMillis: z.number().int().positive().default(5000),
  ssl: z.boolean().default(false),
});

export type PostgresConfig = z.infer<typeof PostgresConfigSchema>;

/**
 * Load PostgreSQL configuration from environment variables
 */
export function loadPostgresConfig(): PostgresConfig {
  return PostgresConfigSchema.parse({
    host: process.env.DENTALOS_POSTGRES_HOST || 'localhost',
    port: process.env.DENTALOS_POSTGRES_PORT
      ? parseInt(process.env.DENTALOS_POSTGRES_PORT, 10)
      : 5432,
    database: process.env.DENTALOS_POSTGRES_DATABASE || 'dentalos',
    user: process.env.DENTALOS_POSTGRES_USER || 'postgres',
    password: process.env.DENTALOS_POSTGRES_PASSWORD || '',
    maxConnections: process.env.DENTALOS_POSTGRES_MAX_CONNECTIONS
      ? parseInt(process.env.DENTALOS_POSTGRES_MAX_CONNECTIONS, 10)
      : 20,
    idleTimeoutMillis: process.env.DENTALOS_POSTGRES_IDLE_TIMEOUT
      ? parseInt(process.env.DENTALOS_POSTGRES_IDLE_TIMEOUT, 10)
      : 30000,
    connectionTimeoutMillis: process.env.DENTALOS_POSTGRES_CONNECTION_TIMEOUT
      ? parseInt(process.env.DENTALOS_POSTGRES_CONNECTION_TIMEOUT, 10)
      : 5000,
    ssl: process.env.DENTALOS_POSTGRES_SSL === 'true',
  });
}

/**
 * MongoDB configuration schema
 */
const MongoDBConfigSchema = z.object({
  uri: z.string(),
  database: z.string(),
  maxPoolSize: z.number().int().positive().default(10),
  minPoolSize: z.number().int().nonnegative().default(0),
  maxIdleTimeMS: z.number().int().positive().default(60000),
  serverSelectionTimeoutMS: z.number().int().positive().default(5000),
});

export type MongoDBConfig = z.infer<typeof MongoDBConfigSchema>;

/**
 * Load MongoDB configuration from environment variables
 */
export function loadMongoDBConfig(): MongoDBConfig {
  return MongoDBConfigSchema.parse({
    uri: process.env.DENTALOS_MONGODB_URI || 'mongodb://localhost:27017',
    database: process.env.DENTALOS_MONGODB_DATABASE || 'dentalos',
    maxPoolSize: process.env.DENTALOS_MONGODB_MAX_POOL_SIZE
      ? parseInt(process.env.DENTALOS_MONGODB_MAX_POOL_SIZE, 10)
      : 10,
    minPoolSize: process.env.DENTALOS_MONGODB_MIN_POOL_SIZE
      ? parseInt(process.env.DENTALOS_MONGODB_MIN_POOL_SIZE, 10)
      : 0,
    maxIdleTimeMS: process.env.DENTALOS_MONGODB_MAX_IDLE_TIME
      ? parseInt(process.env.DENTALOS_MONGODB_MAX_IDLE_TIME, 10)
      : 60000,
    serverSelectionTimeoutMS: process.env.DENTALOS_MONGODB_SERVER_SELECTION_TIMEOUT
      ? parseInt(process.env.DENTALOS_MONGODB_SERVER_SELECTION_TIMEOUT, 10)
      : 5000,
  });
}
