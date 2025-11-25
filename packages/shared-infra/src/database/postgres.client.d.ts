import { PoolClient, QueryResult, QueryResultRow } from 'pg';
import { PostgresConfig } from '../config/database.config';
import { HealthCheckable, HealthCheckResult } from '../health';
export type TransactionCallback<T> = (client: PoolClient) => Promise<T>;
export declare class PostgresClient implements HealthCheckable {
    private pool;
    private isShuttingDown;
    constructor(config: PostgresConfig);
    private setupEventHandlers;
    query<T extends QueryResultRow = QueryResultRow>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
    transaction<T>(callback: TransactionCallback<T>): Promise<T>;
    getClient(): Promise<PoolClient>;
    healthCheck(): Promise<HealthCheckResult>;
    getPoolStats(): {
        totalCount: number;
        idleCount: number;
        waitingCount: number;
    };
    shutdown(): Promise<void>;
    isShutdown(): boolean;
}
