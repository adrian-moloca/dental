import { z } from 'zod';
import { registerAs } from '@nestjs/config';

const MongoConfigSchema = z.object({
  uri: z.string().min(1),
  maxPoolSize: z.coerce.number().int().positive().default(10),
});

const RabbitMQConfigSchema = z.object({
  url: z.string().min(1),
  exchange: z.string().default('dentalos.events'),
  queuePrefix: z.string().default('offline-sync'),
});

const JwtConfigSchema = z.object({
  secret: z.string().min(32),
  expiresIn: z.string().default('7d'),
});

const DeviceConfigSchema = z.object({
  tokenSecret: z.string().min(32),
  tokenExpiresIn: z.string().default('90d'),
});

const EncryptionConfigSchema = z.object({
  key: z.string().min(32),
});

const CorsConfigSchema = z.object({
  origins: z.string().transform((val) => val.split(',')),
  credentials: z.coerce.boolean().default(true),
});

const ServerConfigSchema = z.object({
  port: z.coerce.number().int().positive(),
  nodeEnv: z.enum(['development', 'production', 'test']),
});

export const serverConfig = registerAs('server', () =>
  ServerConfigSchema.parse({
    port: process.env.PORT || 3019,
    nodeEnv: process.env.NODE_ENV || 'development',
  })
);

export const mongoConfig = registerAs('mongo', () =>
  MongoConfigSchema.parse({
    uri: process.env.MONGODB_URI,
    maxPoolSize: process.env.MONGODB_MAX_POOL_SIZE,
  })
);

export const rabbitmqConfig = registerAs('rabbitmq', () =>
  RabbitMQConfigSchema.parse({
    url: process.env.RABBITMQ_URL,
    exchange: process.env.RABBITMQ_EXCHANGE,
    queuePrefix: process.env.RABBITMQ_QUEUE_PREFIX,
  })
);

export const jwtConfig = registerAs('jwt', () =>
  JwtConfigSchema.parse({
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
);

export const deviceConfig = registerAs('device', () =>
  DeviceConfigSchema.parse({
    tokenSecret: process.env.DEVICE_TOKEN_SECRET,
    tokenExpiresIn: process.env.DEVICE_TOKEN_EXPIRES_IN,
  })
);

export const encryptionConfig = registerAs('encryption', () =>
  EncryptionConfigSchema.parse({
    key: process.env.ENCRYPTION_KEY,
  })
);

export const corsConfig = registerAs('cors', () =>
  CorsConfigSchema.parse({
    origins: process.env.CORS_ORIGINS,
    credentials: process.env.CORS_CREDENTIALS,
  })
);
