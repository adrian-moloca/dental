import { z } from 'zod';

/**
 * Configuration Schema
 */
export const configSchema = z.object({
  mongodb: z.object({
    uri: z.string(),
    dbName: z.string().optional(),
  }),
  redis: z.object({
    host: z.string(),
    port: z.number(),
    password: z.string().optional(),
    db: z.number().optional(),
  }),
  port: z.number().default(3002),
  cors: z.object({
    origin: z.string().or(z.array(z.string())),
  }),
});

export type AppConfig = z.infer<typeof configSchema>;

/**
 * Configuration Factory
 */
export default (): AppConfig => {
  const config = {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dentalos-scheduling',
      dbName: process.env.MONGODB_DB_NAME,
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
    },
    port: parseInt(process.env.PORT || '3002', 10),
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
    },
  };

  // Validate configuration
  return configSchema.parse(config);
};
