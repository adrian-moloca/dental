import { Db, Collection } from 'mongodb';
import { MongoDBConfig } from '../config/database.config';
import { HealthCheckable, HealthCheckResult } from '../health';
export declare class MongoDBClient implements HealthCheckable {
    private client;
    private config;
    private isConnected;
    private isShuttingDown;
    constructor(config: MongoDBConfig);
    connect(): Promise<void>;
    getDatabase(databaseName?: string): Db;
    getCollection<T extends Record<string, unknown> = Record<string, unknown>>(collectionName: string, databaseName?: string): Collection<T>;
    healthCheck(): Promise<HealthCheckResult>;
    isClientConnected(): boolean;
    listCollections(databaseName?: string): Promise<string[]>;
    createCollection<T extends Record<string, unknown> = Record<string, unknown>>(collectionName: string, options?: {
        capped?: boolean;
        size?: number;
        max?: number;
    }): Promise<Collection<T>>;
    dropCollection(collectionName: string, databaseName?: string): Promise<boolean>;
    shutdown(): Promise<void>;
}
