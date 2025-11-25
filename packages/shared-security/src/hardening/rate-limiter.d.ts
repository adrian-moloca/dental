import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
export interface SlidingWindowRateLimitConfig {
    windowMs: number;
    max: number;
    message?: string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    keyGenerator?: (req: Request) => string;
}
export declare class RateLimiter implements NestMiddleware {
    private readonly redis;
    private readonly config;
    constructor(redis: Redis, config: SlidingWindowRateLimitConfig);
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
    private defaultKeyGenerator;
    middleware(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare class RateLimitPresets {
    static auth(redis: Redis): RateLimiter;
    static api(redis: Redis): RateLimiter;
    static readonly(redis: Redis): RateLimiter;
    static expensive(redis: Redis): RateLimiter;
}
