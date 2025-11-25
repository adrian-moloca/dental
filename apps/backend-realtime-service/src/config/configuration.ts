import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const ServerConfigSchema = z.object({
  port: z.number().default(3020),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
});

const DatabaseConfigSchema = z.object({
  uri: z.string().default('mongodb://localhost:27017/dentalos-realtime'),
});

const RedisConfigSchema = z.object({
  host: z.string().default('localhost'),
  port: z.number().default(6381),
  password: z.string().optional(),
  db: z.number().default(0),
});

const JwtConfigSchema = z.object({
  secret: z.string().min(32),
  expiresIn: z.string().default('24h'),
});

const CorsConfigSchema = z.object({
  allowedOrigins: z.array(z.string()).default(['http://localhost:5173', 'http://localhost:3000']),
});

export const serverConfig = registerAs('server', () =>
  ServerConfigSchema.parse({
    port: parseInt(process.env.PORT || '3020', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  })
);

export const databaseConfig = registerAs('database', () =>
  DatabaseConfigSchema.parse({
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dentalos-realtime',
  })
);

export const redisConfig = registerAs('redis', () =>
  RedisConfigSchema.parse({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6381', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  })
);

export const jwtConfig = registerAs('jwt', () =>
  JwtConfigSchema.parse({
    secret: process.env.JWT_SECRET || 'change-this-secret-in-production-min-32-chars',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  })
);

export const corsConfig = registerAs('cors', () =>
  CorsConfigSchema.parse({
    allowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:5173',
      'http://localhost:3000',
    ],
  })
);
