import { ThrottlerModuleOptions } from '@nestjs/throttler';
import Redis from 'ioredis';

export interface RateLimitConfig {
  ttl: number;
  limit: number;
  skipIf?: (context: any) => boolean;
}

export interface RateLimitTier {
  name: string;
  ttl: number;
  limit: number;
}

export const DEFAULT_RATE_LIMITS: Record<string, RateLimitTier> = {
  strict: { name: 'strict', ttl: 60, limit: 10 },
  moderate: { name: 'moderate', ttl: 60, limit: 30 },
  relaxed: { name: 'relaxed', ttl: 60, limit: 100 },
  api: { name: 'api', ttl: 60, limit: 60 },
  auth: { name: 'auth', ttl: 900, limit: 5 },
  public: { name: 'public', ttl: 60, limit: 20 },
};

export function createThrottlerConfig(
  config?: Partial<RateLimitConfig>
): ThrottlerModuleOptions {
  const { ttl = 60, limit = 10 } = config || {};

  return {
    throttlers: [
      {
        ttl: ttl * 1000,
        limit,
      },
    ],
  };
}

export function createRedisThrottlerStorage(redisUrl?: string) {
  if (!redisUrl) {
    return undefined;
  }

  const redis = new Redis(redisUrl, {
    enableOfflineQueue: false,
    maxRetriesPerRequest: 3,
  });

  return {
    async increment(key: string, ttl: number): Promise<{ totalHits: number; timeToExpire: number }> {
      const pipeline = redis.pipeline();
      pipeline.incr(key);
      pipeline.pexpire(key, ttl);

      const results = await pipeline.exec();

      if (!results || results.length < 2) {
        throw new Error('Redis pipeline execution failed');
      }

      const [incrResult, _expireResult] = results;
      const totalHits = (incrResult[1] as number) || 0;

      const ttlResult = await redis.pttl(key);
      const timeToExpire = ttlResult > 0 ? ttlResult : ttl;

      return { totalHits, timeToExpire };
    },
  };
}

export function getRateLimitByTier(tierName: keyof typeof DEFAULT_RATE_LIMITS): RateLimitTier {
  return DEFAULT_RATE_LIMITS[tierName] || DEFAULT_RATE_LIMITS.moderate;
}
