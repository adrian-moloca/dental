import Redis from 'ioredis';
import { RedisConfig } from '../config/cache.config';
import { HealthCheckable, HealthCheckResult } from '../health';
export declare class RedisClient implements HealthCheckable {
    private client;
    private isShuttingDown;
    constructor(config: RedisConfig);
    private setupEventHandlers;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
    exists(key: string): Promise<boolean>;
    incr(key: string): Promise<number>;
    decr(key: string): Promise<number>;
    getClient(): Redis;
    healthCheck(): Promise<HealthCheckResult>;
    shutdown(): Promise<void>;
}
