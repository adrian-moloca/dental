"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPostgresConfig = loadPostgresConfig;
exports.loadMongoDBConfig = loadMongoDBConfig;
const zod_1 = require("zod");
const PostgresConfigSchema = zod_1.z.object({
    host: zod_1.z.string().default('localhost'),
    port: zod_1.z.number().int().positive().default(5432),
    database: zod_1.z.string(),
    user: zod_1.z.string(),
    password: zod_1.z.string(),
    maxConnections: zod_1.z.number().int().positive().default(20),
    idleTimeoutMillis: zod_1.z.number().int().positive().default(30000),
    connectionTimeoutMillis: zod_1.z.number().int().positive().default(5000),
    ssl: zod_1.z.boolean().default(false),
});
function loadPostgresConfig() {
    return PostgresConfigSchema.parse({
        host: process.env.DENTALOS_POSTGRES_HOST || 'localhost',
        port: process.env.DENTALOS_POSTGRES_PORT
            ? parseInt(process.env.DENTALOS_POSTGRES_PORT, 10)
            : 5432,
        database: process.env.DENTALOS_POSTGRES_DATABASE || 'dentalos',
        user: process.env.DENTALOS_POSTGRES_USER || 'postgres',
        password: process.env.DENTALOS_POSTGRES_PASSWORD || '',
        maxConnections: process.env.DENTALOS_POSTGRES_MAX_CONNECTIONS
            ? parseInt(process.env.DENTALOS_POSTGRES_MAX_CONNECTIONS, 10)
            : 20,
        idleTimeoutMillis: process.env.DENTALOS_POSTGRES_IDLE_TIMEOUT
            ? parseInt(process.env.DENTALOS_POSTGRES_IDLE_TIMEOUT, 10)
            : 30000,
        connectionTimeoutMillis: process.env.DENTALOS_POSTGRES_CONNECTION_TIMEOUT
            ? parseInt(process.env.DENTALOS_POSTGRES_CONNECTION_TIMEOUT, 10)
            : 5000,
        ssl: process.env.DENTALOS_POSTGRES_SSL === 'true',
    });
}
const MongoDBConfigSchema = zod_1.z.object({
    uri: zod_1.z.string(),
    database: zod_1.z.string(),
    maxPoolSize: zod_1.z.number().int().positive().default(10),
    minPoolSize: zod_1.z.number().int().nonnegative().default(0),
    maxIdleTimeMS: zod_1.z.number().int().positive().default(60000),
    serverSelectionTimeoutMS: zod_1.z.number().int().positive().default(5000),
});
function loadMongoDBConfig() {
    return MongoDBConfigSchema.parse({
        uri: process.env.DENTALOS_MONGODB_URI || 'mongodb://localhost:27017',
        database: process.env.DENTALOS_MONGODB_DATABASE || 'dentalos',
        maxPoolSize: process.env.DENTALOS_MONGODB_MAX_POOL_SIZE
            ? parseInt(process.env.DENTALOS_MONGODB_MAX_POOL_SIZE, 10)
            : 10,
        minPoolSize: process.env.DENTALOS_MONGODB_MIN_POOL_SIZE
            ? parseInt(process.env.DENTALOS_MONGODB_MIN_POOL_SIZE, 10)
            : 0,
        maxIdleTimeMS: process.env.DENTALOS_MONGODB_MAX_IDLE_TIME
            ? parseInt(process.env.DENTALOS_MONGODB_MAX_IDLE_TIME, 10)
            : 60000,
        serverSelectionTimeoutMS: process.env.DENTALOS_MONGODB_SERVER_SELECTION_TIMEOUT
            ? parseInt(process.env.DENTALOS_MONGODB_SERVER_SELECTION_TIMEOUT, 10)
            : 5000,
    });
}
//# sourceMappingURL=database.config.js.map