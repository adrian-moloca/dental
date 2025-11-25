import { Client } from '@opensearch-project/opensearch';
import { OpenSearchConfig } from '../config/search.config';
import { HealthCheckable, HealthCheckResult } from '../health';
export interface IndexSettings {
    numberOfShards?: number;
    numberOfReplicas?: number;
    refreshInterval?: string;
}
export interface SearchOptions {
    from?: number;
    size?: number;
    sort?: Array<Record<string, {
        order: 'asc' | 'desc';
    }>>;
}
export interface BulkOperation {
    index?: {
        _index: string;
        _id?: string;
    };
    delete?: {
        _index: string;
        _id: string;
    };
    update?: {
        _index: string;
        _id: string;
    };
    doc?: Record<string, unknown>;
}
export declare class OpenSearchClient implements HealthCheckable {
    private client;
    private isShuttingDown;
    constructor(config: OpenSearchConfig);
    createIndex(indexName: string, settings?: IndexSettings, mappings?: Record<string, unknown>): Promise<void>;
    deleteIndex(indexName: string): Promise<void>;
    indexExists(indexName: string): Promise<boolean>;
    index<T = Record<string, unknown>>(indexName: string, document: T, documentId?: string): Promise<string>;
    search<T = Record<string, unknown>>(indexName: string, query: Record<string, unknown>, options?: SearchOptions): Promise<{
        hits: Array<{
            _id: string;
            _source: T;
            _score: number;
        }>;
        total: number;
    }>;
    update<T = Record<string, unknown>>(indexName: string, documentId: string, partialDocument: Partial<T>): Promise<void>;
    delete(indexName: string, documentId: string): Promise<void>;
    bulk(operations: BulkOperation[]): Promise<void>;
    getClient(): Client;
    healthCheck(): Promise<HealthCheckResult>;
    shutdown(): Promise<void>;
}
