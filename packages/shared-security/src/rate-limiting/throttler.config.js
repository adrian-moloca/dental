"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_RATE_LIMITS = void 0;
exports.createThrottlerConfig = createThrottlerConfig;
exports.createRedisThrottlerStorage = createRedisThrottlerStorage;
exports.getRateLimitByTier = getRateLimitByTier;
const ioredis_1 = require("ioredis");
exports.DEFAULT_RATE_LIMITS = {
    strict: { name: 'strict', ttl: 60, limit: 10 },
    moderate: { name: 'moderate', ttl: 60, limit: 30 },
    relaxed: { name: 'relaxed', ttl: 60, limit: 100 },
    api: { name: 'api', ttl: 60, limit: 60 },
    auth: { name: 'auth', ttl: 900, limit: 5 },
    public: { name: 'public', ttl: 60, limit: 20 },
};
function createThrottlerConfig(config) {
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
function createRedisThrottlerStorage(redisUrl) {
    if (!redisUrl) {
        return undefined;
    }
    const redis = new ioredis_1.default(redisUrl, {
        enableOfflineQueue: false,
        maxRetriesPerRequest: 3,
    });
    return {
        async increment(key, ttl) {
            const pipeline = redis.pipeline();
            pipeline.incr(key);
            pipeline.pexpire(key, ttl);
            const results = await pipeline.exec();
            if (!results || results.length < 2) {
                throw new Error('Redis pipeline execution failed');
            }
            const [incrResult, _expireResult] = results;
            const totalHits = incrResult[1] || 0;
            const ttlResult = await redis.pttl(key);
            const timeToExpire = ttlResult > 0 ? ttlResult : ttl;
            return { totalHits, timeToExpire };
        },
    };
}
function getRateLimitByTier(tierName) {
    return exports.DEFAULT_RATE_LIMITS[tierName] || exports.DEFAULT_RATE_LIMITS.moderate;
}
//# sourceMappingURL=throttler.config.js.map