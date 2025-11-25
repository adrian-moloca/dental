"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresClient = void 0;
const pg_1 = require("pg");
const health_1 = require("../health");
class PostgresClient {
    constructor(config) {
        this.isShuttingDown = false;
        this.pool = new pg_1.Pool({
            host: config.host,
            port: config.port,
            database: config.database,
            user: config.user,
            password: config.password,
            max: config.maxConnections,
            idleTimeoutMillis: config.idleTimeoutMillis,
            connectionTimeoutMillis: config.connectionTimeoutMillis,
            ssl: config.ssl ? { rejectUnauthorized: false } : false,
        });
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.pool.on('error', (err) => {
            console.error('PostgreSQL pool error:', {
                message: err.message,
                code: err.code,
            });
        });
        this.pool.on('connect', () => {
        });
        this.pool.on('remove', () => {
        });
    }
    async query(sql, params) {
        if (this.isShuttingDown) {
            throw new Error('PostgresClient is shutting down');
        }
        try {
            return await this.pool.query(sql, params);
        }
        catch (error) {
            throw new Error(`PostgreSQL query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async transaction(callback) {
        if (this.isShuttingDown) {
            throw new Error('PostgresClient is shutting down');
        }
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw new Error(`PostgreSQL transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        finally {
            client.release();
        }
    }
    async getClient() {
        if (this.isShuttingDown) {
            throw new Error('PostgresClient is shutting down');
        }
        return await this.pool.connect();
    }
    async healthCheck() {
        try {
            const start = Date.now();
            await this.pool.query('SELECT 1');
            const duration = Date.now() - start;
            return {
                status: health_1.HealthStatus.HEALTHY,
                timestamp: new Date(),
                message: 'PostgreSQL connection healthy',
                metadata: {
                    responseTimeMs: duration,
                    totalCount: this.pool.totalCount,
                    idleCount: this.pool.idleCount,
                    waitingCount: this.pool.waitingCount,
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
    getPoolStats() {
        return {
            totalCount: this.pool.totalCount,
            idleCount: this.pool.idleCount,
            waitingCount: this.pool.waitingCount,
        };
    }
    async shutdown() {
        if (this.isShuttingDown) {
            return;
        }
        this.isShuttingDown = true;
        try {
            await this.pool.end();
        }
        catch (error) {
            console.error('Error during PostgreSQL shutdown:', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }
    isShutdown() {
        return this.isShuttingDown;
    }
}
exports.PostgresClient = PostgresClient;
//# sourceMappingURL=postgres.client.js.map