"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisClient = void 0;
const ioredis_1 = require("ioredis");
const health_1 = require("../health");
class RedisClient {
    constructor(config) {
        this.isShuttingDown = false;
        const options = {
            host: config.host,
            port: config.port,
            password: config.password,
            db: config.db,
            keyPrefix: config.keyPrefix,
            maxRetriesPerRequest: config.maxRetriesPerRequest,
            connectTimeout: config.connectTimeout,
            enableReadyCheck: config.enableReadyCheck,
            lazyConnect: config.lazyConnect,
            maxLoadingRetryTime: config.maxLoadingRetryTime,
        };
        this.client = new ioredis_1.default(options);
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.client.on('error', (err) => {
            console.error('Redis client error:', {
                message: err.message,
            });
        });
        this.client.on('connect', () => {
        });
        this.client.on('ready', () => {
        });
        this.client.on('close', () => {
        });
        this.client.on('reconnecting', () => {
        });
    }
    async get(key) {
        if (this.isShuttingDown) {
            throw new Error('RedisClient is shutting down');
        }
        try {
            return await this.client.get(key);
        }
        catch (error) {
            throw new Error(`Redis GET failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async set(key, value, ttlSeconds) {
        if (this.isShuttingDown) {
            throw new Error('RedisClient is shutting down');
        }
        try {
            if (ttlSeconds) {
                await this.client.setex(key, ttlSeconds, value);
            }
            else {
                await this.client.set(key, value);
            }
        }
        catch (error) {
            throw new Error(`Redis SET failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async del(key) {
        if (this.isShuttingDown) {
            throw new Error('RedisClient is shutting down');
        }
        try {
            return await this.client.del(key);
        }
        catch (error) {
            throw new Error(`Redis DEL failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async expire(key, seconds) {
        if (this.isShuttingDown) {
            throw new Error('RedisClient is shutting down');
        }
        try {
            return await this.client.expire(key, seconds);
        }
        catch (error) {
            throw new Error(`Redis EXPIRE failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async exists(key) {
        if (this.isShuttingDown) {
            throw new Error('RedisClient is shutting down');
        }
        try {
            const result = await this.client.exists(key);
            return result === 1;
        }
        catch (error) {
            throw new Error(`Redis EXISTS failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async incr(key) {
        if (this.isShuttingDown) {
            throw new Error('RedisClient is shutting down');
        }
        try {
            return await this.client.incr(key);
        }
        catch (error) {
            throw new Error(`Redis INCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async decr(key) {
        if (this.isShuttingDown) {
            throw new Error('RedisClient is shutting down');
        }
        try {
            return await this.client.decr(key);
        }
        catch (error) {
            throw new Error(`Redis DECR failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    getClient() {
        return this.client;
    }
    async healthCheck() {
        try {
            const start = Date.now();
            await this.client.ping();
            const duration = Date.now() - start;
            return {
                status: health_1.HealthStatus.HEALTHY,
                timestamp: new Date(),
                message: 'Redis connection healthy',
                metadata: {
                    responseTimeMs: duration,
                },
            };
        }
        catch (error) {
            return {
                status: health_1.HealthStatus.UNHEALTHY,
                timestamp: new Date(),
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async shutdown() {
        if (this.isShuttingDown) {
            return;
        }
        this.isShuttingDown = true;
        try {
            await this.client.quit();
        }
        catch (error) {
            console.error('Error during Redis shutdown:', error instanceof Error ? error.message : 'Unknown error');
            this.client.disconnect();
            throw error;
        }
    }
}
exports.RedisClient = RedisClient;
//# sourceMappingURL=redis.client.js.map