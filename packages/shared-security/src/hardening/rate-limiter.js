"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitPresets = exports.RateLimiter = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
let RateLimiter = class RateLimiter {
    constructor(redis, config) {
        this.redis = redis;
        this.config = {
            message: 'Too many requests, please try again later',
            skipSuccessfulRequests: false,
            skipFailedRequests: false,
            keyGenerator: (req) => this.defaultKeyGenerator(req),
            ...config,
        };
    }
    async use(req, res, next) {
        const key = this.config.keyGenerator(req);
        const now = Date.now();
        const windowStart = now - this.config.windowMs;
        try {
            const redisKey = `ratelimit:${key}`;
            await this.redis.zremrangebyscore(redisKey, 0, windowStart);
            const currentCount = await this.redis.zcount(redisKey, windowStart, now);
            if (currentCount >= this.config.max) {
                const retryAfter = Math.ceil(this.config.windowMs / 1000);
                res.setHeader('Retry-After', retryAfter.toString());
                res.setHeader('X-RateLimit-Limit', this.config.max.toString());
                res.setHeader('X-RateLimit-Remaining', '0');
                res.setHeader('X-RateLimit-Reset', new Date(now + this.config.windowMs).toISOString());
                throw new common_1.HttpException({
                    statusCode: common_1.HttpStatus.TOO_MANY_REQUESTS,
                    message: this.config.message,
                    error: 'Too Many Requests',
                }, common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            await this.redis.zadd(redisKey, now, `${now}-${Math.random()}`);
            await this.redis.expire(redisKey, Math.ceil(this.config.windowMs / 1000) + 1);
            const remaining = this.config.max - currentCount - 1;
            res.setHeader('X-RateLimit-Limit', this.config.max.toString());
            res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining).toString());
            res.setHeader('X-RateLimit-Reset', new Date(now + this.config.windowMs).toISOString());
            if (this.config.skipSuccessfulRequests || this.config.skipFailedRequests) {
                const originalSend = res.send;
                const self = this;
                res.send = function (body) {
                    const statusCode = res.statusCode;
                    const shouldSkip = (self.config.skipSuccessfulRequests && statusCode < 400) ||
                        (self.config.skipFailedRequests && statusCode >= 400);
                    if (shouldSkip) {
                        self.redis.zrem(redisKey, `${now}-${Math.random()}`);
                    }
                    return originalSend.call(this, body);
                };
            }
            next();
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            console.error('Rate limiter error:', error);
            next();
        }
    }
    defaultKeyGenerator(req) {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const tenantId = req.headers['x-tenant-id'] || 'global';
        return `${ip}:${tenantId}`;
    }
    middleware() {
        return this.use.bind(this);
    }
};
exports.RateLimiter = RateLimiter;
exports.RateLimiter = RateLimiter = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [ioredis_1.default, Object])
], RateLimiter);
class RateLimitPresets {
    static auth(redis) {
        return new RateLimiter(redis, {
            windowMs: 15 * 60 * 1000,
            max: 5,
            message: 'Too many authentication attempts, please try again later',
        });
    }
    static api(redis) {
        return new RateLimiter(redis, {
            windowMs: 60 * 1000,
            max: 100,
        });
    }
    static readonly(redis) {
        return new RateLimiter(redis, {
            windowMs: 60 * 1000,
            max: 300,
            skipFailedRequests: true,
        });
    }
    static expensive(redis) {
        return new RateLimiter(redis, {
            windowMs: 60 * 60 * 1000,
            max: 10,
            message: 'Rate limit exceeded for this operation',
        });
    }
}
exports.RateLimitPresets = RateLimitPresets;
//# sourceMappingURL=rate-limiter.js.map