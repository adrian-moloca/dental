import { z } from 'zod';

const ConfigSchema = z.object({
  port: z.number().int().positive().default(3008),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  mongodb: z.object({
    uri: z.string().url(),
  }),
  redis: z.object({
    host: z.string().default('localhost'),
    port: z.number().int().positive().default(6379),
    password: z.string().optional(),
  }),
  cors: z.object({
    origin: z.string().default('http://localhost:3000,http://localhost:5173'),
  }),
  services: z.object({
    auth: z.string().url(),
    clinical: z.string().url(),
    scheduling: z.string().url(),
  }),
  logLevel: z.string().default('info'),
});

export type AppConfig = z.infer<typeof ConfigSchema>;

export default () => {
  const config = {
    port: parseInt(process.env.PORT || '3008', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory',
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
    },
    cors: {
      origin: process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173',
    },
    services: {
      auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3301',
      clinical: process.env.CLINICAL_SERVICE_URL || 'http://localhost:3305',
      scheduling: process.env.SCHEDULING_SERVICE_URL || 'http://localhost:3302',
    },
    logLevel: process.env.LOG_LEVEL || 'info',
  };

  return ConfigSchema.parse(config);
};
