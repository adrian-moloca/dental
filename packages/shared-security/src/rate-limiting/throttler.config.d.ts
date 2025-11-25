import { ThrottlerModuleOptions } from '@nestjs/throttler';
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
export declare const DEFAULT_RATE_LIMITS: Record<string, RateLimitTier>;
export declare function createThrottlerConfig(config?: Partial<RateLimitConfig>): ThrottlerModuleOptions;
export declare function createRedisThrottlerStorage(redisUrl?: string): {
    increment(key: string, ttl: number): Promise<{
        totalHits: number;
        timeToExpire: number;
    }>;
} | undefined;
export declare function getRateLimitByTier(tierName: keyof typeof DEFAULT_RATE_LIMITS): RateLimitTier;
