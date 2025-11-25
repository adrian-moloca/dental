"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadRabbitMQConfig = loadRabbitMQConfig;
const zod_1 = require("zod");
const RabbitMQConfigSchema = zod_1.z.object({
    host: zod_1.z.string().default('localhost'),
    port: zod_1.z.number().int().positive().default(5672),
    username: zod_1.z.string().default('guest'),
    password: zod_1.z.string().default('guest'),
    vhost: zod_1.z.string().default('/'),
    heartbeat: zod_1.z.number().int().positive().default(60),
    connectionTimeout: zod_1.z.number().int().positive().default(10000),
    channelMax: zod_1.z.number().int().positive().default(100),
    prefetchCount: zod_1.z.number().int().positive().default(10),
    reconnectDelay: zod_1.z.number().int().positive().default(5000),
    maxReconnectAttempts: zod_1.z.number().int().positive().default(10),
});
function loadRabbitMQConfig() {
    return RabbitMQConfigSchema.parse({
        host: process.env.DENTALOS_RABBITMQ_HOST || 'localhost',
        port: process.env.DENTALOS_RABBITMQ_PORT
            ? parseInt(process.env.DENTALOS_RABBITMQ_PORT, 10)
            : 5672,
        username: process.env.DENTALOS_RABBITMQ_USERNAME || 'guest',
        password: process.env.DENTALOS_RABBITMQ_PASSWORD || 'guest',
        vhost: process.env.DENTALOS_RABBITMQ_VHOST || '/',
        heartbeat: process.env.DENTALOS_RABBITMQ_HEARTBEAT
            ? parseInt(process.env.DENTALOS_RABBITMQ_HEARTBEAT, 10)
            : 60,
        connectionTimeout: process.env.DENTALOS_RABBITMQ_CONNECTION_TIMEOUT
            ? parseInt(process.env.DENTALOS_RABBITMQ_CONNECTION_TIMEOUT, 10)
            : 10000,
        channelMax: process.env.DENTALOS_RABBITMQ_CHANNEL_MAX
            ? parseInt(process.env.DENTALOS_RABBITMQ_CHANNEL_MAX, 10)
            : 100,
        prefetchCount: process.env.DENTALOS_RABBITMQ_PREFETCH_COUNT
            ? parseInt(process.env.DENTALOS_RABBITMQ_PREFETCH_COUNT, 10)
            : 10,
        reconnectDelay: process.env.DENTALOS_RABBITMQ_RECONNECT_DELAY
            ? parseInt(process.env.DENTALOS_RABBITMQ_RECONNECT_DELAY, 10)
            : 5000,
        maxReconnectAttempts: process.env.DENTALOS_RABBITMQ_MAX_RECONNECT_ATTEMPTS
            ? parseInt(process.env.DENTALOS_RABBITMQ_MAX_RECONNECT_ATTEMPTS, 10)
            : 10,
    });
}
//# sourceMappingURL=messaging.config.js.map