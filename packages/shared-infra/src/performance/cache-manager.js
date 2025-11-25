"use strict";
var CacheManager_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheManager = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
let CacheManager = CacheManager_1 = class CacheManager {
    constructor(redis) {
        this.redis = redis;
        this.logger = new common_1.Logger(CacheManager_1.name);
        this.DEFAULT_TTL = 300;
    }
    async getOrSet(key, computeFn, options) {
        const fullKey = this.buildKey(key, options?.namespace);
        try {
            const cached = await this.redis.get(fullKey);
            if (cached) {
                this.logger.debug(`Cache hit: ${fullKey}`);
                return JSON.parse(cached);
            }
            this.logger.debug(`Cache miss: ${fullKey}`);
            const value = await computeFn();
            await this.set(key, value, options);
            return value;
        }
        catch (error) {
            this.logger.error(`Cache error for ${fullKey}:`, error);
            return await computeFn();
        }
    }
    async set(key, value, options) {
        const fullKey = this.buildKey(key, options?.namespace);
        const ttl = options?.ttl ?? this.DEFAULT_TTL;
        try {
            const serialized = JSON.stringify(value);
            await this.redis.setex(fullKey, ttl, serialized);
            this.logger.debug(`Cache set: ${fullKey} (TTL: ${ttl}s)`);
        }
        catch (error) {
            this.logger.error(`Failed to set cache for ${fullKey}:`, error);
        }
    }
    async get(key, namespace) {
        const fullKey = this.buildKey(key, namespace);
        try {
            const cached = await this.redis.get(fullKey);
            if (!cached) {
                return null;
            }
            return JSON.parse(cached);
        }
        catch (error) {
            this.logger.error(`Failed to get cache for ${fullKey}:`, error);
            return null;
        }
    }
    async delete(key, namespace) {
        const fullKey = this.buildKey(key, namespace);
        try {
            await this.redis.del(fullKey);
            this.logger.debug(`Cache deleted: ${fullKey}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete cache for ${fullKey}:`, error);
        }
    }
    async deletePattern(pattern, namespace) {
        const fullPattern = this.buildKey(pattern, namespace);
        try {
            const keys = await this.redis.keys(fullPattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
                this.logger.debug(`Cache pattern deleted: ${fullPattern} (${keys.length} keys)`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to delete cache pattern ${fullPattern}:`, error);
        }
    }
    async invalidateTenant(tenantId) {
        await this.deletePattern('*', `tenant:${tenantId}`);
    }
    buildKey(key, namespace) {
        if (namespace) {
            return `cache:${namespace}:${key}`;
        }
        return `cache:${key}`;
    }
    memoize(fn, keyBuilder, options) {
        return async (...args) => {
            const key = keyBuilder(...args);
            return this.getOrSet(key, () => fn(...args), options);
        };
    }
};
exports.CacheManager = CacheManager;
exports.CacheManager = CacheManager = CacheManager_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [ioredis_1.default])
], CacheManager);
//# sourceMappingURL=cache-manager.js.map