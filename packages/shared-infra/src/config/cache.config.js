"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadRedisConfig = loadRedisConfig;
const zod_1 = require("zod");
const RedisConfigSchema = zod_1.z.object({
    host: zod_1.z.string().default('localhost'),
    port: zod_1.z.number().int().positive().default(6381),
    password: zod_1.z.string().optional(),
    db: zod_1.z.number().int().nonnegative().default(0),
    keyPrefix: zod_1.z.string().default('dentalos:'),
    maxRetriesPerRequest: zod_1.z.number().int().positive().default(3),
    connectTimeout: zod_1.z.number().int().positive().default(10000),
    enableReadyCheck: zod_1.z.boolean().default(true),
    lazyConnect: zod_1.z.boolean().default(false),
    maxLoadingRetryTime: zod_1.z.number().int().positive().default(10000),
});
function loadRedisConfig() {
    return RedisConfigSchema.parse({
        host: process.env.DENTALOS_REDIS_HOST || 'localhost',
        port: process.env.DENTALOS_REDIS_PORT
            ? parseInt(process.env.DENTALOS_REDIS_PORT, 10)
            : 6381,
        password: process.env.DENTALOS_REDIS_PASSWORD,
        db: process.env.DENTALOS_REDIS_DB
            ? parseInt(process.env.DENTALOS_REDIS_DB, 10)
            : 0,
        keyPrefix: process.env.DENTALOS_REDIS_KEY_PREFIX || 'dentalos:',
        maxRetriesPerRequest: process.env.DENTALOS_REDIS_MAX_RETRIES
            ? parseInt(process.env.DENTALOS_REDIS_MAX_RETRIES, 10)
            : 3,
        connectTimeout: process.env.DENTALOS_REDIS_CONNECT_TIMEOUT
            ? parseInt(process.env.DENTALOS_REDIS_CONNECT_TIMEOUT, 10)
            : 10000,
        enableReadyCheck: process.env.DENTALOS_REDIS_ENABLE_READY_CHECK !== 'false',
        lazyConnect: process.env.DENTALOS_REDIS_LAZY_CONNECT === 'true',
        maxLoadingRetryTime: process.env.DENTALOS_REDIS_MAX_LOADING_RETRY_TIME
            ? parseInt(process.env.DENTALOS_REDIS_MAX_LOADING_RETRY_TIME, 10)
            : 10000,
    });
}
//# sourceMappingURL=cache.config.js.map