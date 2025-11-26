import { z } from 'zod';

const ConfigSchema = z.object({
  port: z.number().int().positive().default(3308),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  mongodb: z.object({
    uri: z.string().url(),
  }),
  redis: z.object({
    host: z.string().default('localhost'),
    port: z.number().int().positive().default(6381),
    password: z.string().optional(),
  }),
  cors: z.object({
    origin: z.string().default('http://localhost:3000,http://localhost:5173'),
  }),
  jwt: z.object({
    secret: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    issuer: z.string().default('dentalos-auth-service'),
  }),
  internalApi: z.object({
    key: z.string().min(32, 'INTERNAL_API_KEY must be at least 32 characters'),
  }),
  services: z.object({
    auth: z.string().url(),
    hr: z.string().url(),
    scheduling: z.string().url(),
    clinical: z.string().url(),
    billing: z.string().url(),
    inventory: z.string().url(),
    marketing: z.string().url(),
    automation: z.string().url(),
    aiEngine: z.string().url(),
  }),
  logLevel: z.string().default('info'),
});

export type AppConfig = z.infer<typeof ConfigSchema>;

export default () => {
  const config = {
    port: parseInt(process.env.PORT || '3308', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/provider-schedule',
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6381', 10),
      password: process.env.REDIS_PASSWORD,
    },
    cors: {
      origin: process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173',
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'development-secret-key-min-32-chars!!',
      issuer: process.env.JWT_ISSUER || 'dentalos-auth-service',
    },
    internalApi: {
      key: process.env.INTERNAL_API_KEY || 'development-internal-api-key-provider-schedule-secure',
    },
    services: {
      auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3301',
      hr: process.env.HR_SERVICE_URL || 'http://localhost:3015',
      scheduling: process.env.SCHEDULING_SERVICE_URL || 'http://localhost:3302',
      clinical: process.env.CLINICAL_SERVICE_URL || 'http://localhost:3305',
      billing: process.env.BILLING_SERVICE_URL || 'http://localhost:3310',
      inventory: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3308',
      marketing: process.env.MARKETING_SERVICE_URL || 'http://localhost:3011',
      automation: process.env.AUTOMATION_SERVICE_URL || 'http://localhost:3013',
      aiEngine: process.env.AI_ENGINE_SERVICE_URL || 'http://localhost:3014',
    },
    logLevel: process.env.LOG_LEVEL || 'info',
  };

  return ConfigSchema.parse(config);
};
