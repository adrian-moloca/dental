import { ClientSession, Connection } from 'mongoose';
export interface TransactionOptions {
    readConcern?: 'local' | 'majority' | 'linearizable' | 'available';
    writeConcern?: {
        w?: number | 'majority';
        j?: boolean;
        wtimeout?: number;
    };
    readPreference?: 'primary' | 'primaryPreferred' | 'secondary' | 'secondaryPreferred' | 'nearest';
    maxCommitTimeMS?: number;
}
export type TransactionCallback<T> = (session: ClientSession) => Promise<T>;
export declare class TransactionManager {
    private readonly connection;
    private readonly logger;
    constructor(connection: Connection);
    execute<T>(callback: TransactionCallback<T>, options?: TransactionOptions): Promise<T>;
    executeWithRetry<T>(callback: TransactionCallback<T>, options?: TransactionOptions, maxRetries?: number): Promise<T>;
    private isRetryableError;
    private delay;
    createSession(): Promise<ClientSession>;
    executeParallel<T>(callbacks: TransactionCallback<T>[], options?: TransactionOptions): Promise<T[]>;
    executeSequential<T>(callbacks: TransactionCallback<T>[], options?: TransactionOptions): Promise<T[]>;
}
