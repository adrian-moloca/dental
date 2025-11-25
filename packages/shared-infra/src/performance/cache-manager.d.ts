import Redis from 'ioredis';
export interface CacheOptions {
    ttl?: number;
    namespace?: string;
}
export declare class CacheManager {
    private readonly redis;
    private readonly logger;
    private readonly DEFAULT_TTL;
    constructor(redis: Redis);
    getOrSet<T>(key: string, computeFn: () => Promise<T>, options?: CacheOptions): Promise<T>;
    set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
    get<T>(key: string, namespace?: string): Promise<T | null>;
    delete(key: string, namespace?: string): Promise<void>;
    deletePattern(pattern: string, namespace?: string): Promise<void>;
    invalidateTenant(tenantId: string): Promise<void>;
    private buildKey;
    memoize<TArgs extends any[], TResult>(fn: (...args: TArgs) => Promise<TResult>, keyBuilder: (...args: TArgs) => string, options?: CacheOptions): (...args: TArgs) => Promise<TResult>;
}
