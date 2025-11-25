"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBClient = void 0;
const mongodb_1 = require("mongodb");
const health_1 = require("../health");
class MongoDBClient {
    constructor(config) {
        this.isConnected = false;
        this.isShuttingDown = false;
        this.config = config;
        const options = {
            maxPoolSize: config.maxPoolSize,
            minPoolSize: config.minPoolSize,
            maxIdleTimeMS: config.maxIdleTimeMS,
            serverSelectionTimeoutMS: config.serverSelectionTimeoutMS,
        };
        this.client = new mongodb_1.MongoClient(config.uri, options);
    }
    async connect() {
        if (this.isConnected) {
            return;
        }
        if (this.isShuttingDown) {
            throw new Error('MongoDBClient is shutting down');
        }
        try {
            await this.client.connect();
            this.isConnected = true;
        }
        catch (error) {
            throw new Error(`MongoDB connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    getDatabase(databaseName) {
        if (!this.isConnected) {
            throw new Error('MongoDB client not connected. Call connect() first.');
        }
        return this.client.db(databaseName || this.config.database);
    }
    getCollection(collectionName, databaseName) {
        const db = this.getDatabase(databaseName);
        return db.collection(collectionName);
    }
    async healthCheck() {
        try {
            if (!this.isConnected) {
                return {
                    status: health_1.HealthStatus.UNHEALTHY,
                    timestamp: new Date(),
                    error: 'MongoDB client not connected',
                };
            }
            const start = Date.now();
            await this.client.db('admin').command({ ping: 1 });
            const duration = Date.now() - start;
            return {
                status: health_1.HealthStatus.HEALTHY,
                timestamp: new Date(),
                message: 'MongoDB connection healthy',
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
    isClientConnected() {
        return this.isConnected && !this.isShuttingDown;
    }
    async listCollections(databaseName) {
        if (!this.isConnected) {
            throw new Error('MongoDB client not connected. Call connect() first.');
        }
        const db = this.getDatabase(databaseName);
        const collections = await db.listCollections().toArray();
        return collections.map((col) => col.name);
    }
    async createCollection(collectionName, options) {
        if (!this.isConnected) {
            throw new Error('MongoDB client not connected. Call connect() first.');
        }
        const db = this.getDatabase();
        return await db.createCollection(collectionName, options);
    }
    async dropCollection(collectionName, databaseName) {
        if (!this.isConnected) {
            throw new Error('MongoDB client not connected. Call connect() first.');
        }
        const db = this.getDatabase(databaseName);
        return await db.dropCollection(collectionName);
    }
    async shutdown() {
        if (this.isShuttingDown) {
            return;
        }
        this.isShuttingDown = true;
        try {
            if (this.isConnected) {
                await this.client.close();
                this.isConnected = false;
            }
        }
        catch (error) {
            console.error('Error during MongoDB shutdown:', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }
}
exports.MongoDBClient = MongoDBClient;
//# sourceMappingURL=mongodb.client.js.map