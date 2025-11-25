import { Client, ClientOptions } from '@opensearch-project/opensearch';
import { OpenSearchConfig } from '../config/search.config';
import { HealthCheckable, HealthCheckResult, HealthStatus } from '../health';

/**
 * Index settings interface
 */
export interface IndexSettings {
  numberOfShards?: number;
  numberOfReplicas?: number;
  refreshInterval?: string;
}

/**
 * Search options interface
 */
export interface SearchOptions {
  from?: number;
  size?: number;
  sort?: Array<Record<string, { order: 'asc' | 'desc' }>>;
}

/**
 * Bulk operation type
 */
export interface BulkOperation {
  index?: { _index: string; _id?: string };
  delete?: { _index: string; _id: string };
  update?: { _index: string; _id: string };
  doc?: Record<string, unknown>;
}

/**
 * OpenSearch client for full-text search and analytics
 */
export class OpenSearchClient implements HealthCheckable {
  private client: Client;
  private isShuttingDown = false;

  constructor(config: OpenSearchConfig) {

    const options: ClientOptions = {
      node: config.node,
      maxRetries: config.maxRetries,
      requestTimeout: config.requestTimeout,
      sniffOnStart: config.sniffOnStart,
    };

    if (config.username && config.password) {
      options.auth = {
        username: config.username,
        password: config.password,
      };
    }

    if (config.sniffInterval) {
      options.sniffInterval = config.sniffInterval;
    }

    if (config.ssl) {
      options.ssl = {
        rejectUnauthorized: false,
      };
    }

    this.client = new Client(options);
  }

  /**
   * Create an index with optional settings and mappings
   */
  public async createIndex(
    indexName: string,
    settings?: IndexSettings,
    mappings?: Record<string, unknown>
  ): Promise<void> {
    if (this.isShuttingDown) {
      throw new Error('OpenSearchClient is shutting down');
    }

    try {
      const body: Record<string, unknown> = {};

      if (settings) {
        body.settings = {
          number_of_shards: settings.numberOfShards,
          number_of_replicas: settings.numberOfReplicas,
          refresh_interval: settings.refreshInterval,
        };
      }

      if (mappings) {
        body.mappings = mappings;
      }

      await this.client.indices.create({
        index: indexName,
        body: Object.keys(body).length > 0 ? body : undefined,
      });
    } catch (error) {
      throw new Error(
        `Failed to create index: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete an index
   */
  public async deleteIndex(indexName: string): Promise<void> {
    if (this.isShuttingDown) {
      throw new Error('OpenSearchClient is shutting down');
    }

    try {
      await this.client.indices.delete({
        index: indexName,
      });
    } catch (error) {
      throw new Error(
        `Failed to delete index: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if an index exists
   */
  public async indexExists(indexName: string): Promise<boolean> {
    if (this.isShuttingDown) {
      throw new Error('OpenSearchClient is shutting down');
    }

    try {
      const response = await this.client.indices.exists({
        index: indexName,
      });
      return response.body === true;
    } catch (error) {
      throw new Error(
        `Failed to check index existence: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Index a document
   */
  public async index<T = Record<string, unknown>>(
    indexName: string,
    document: T,
    documentId?: string
  ): Promise<string> {
    if (this.isShuttingDown) {
      throw new Error('OpenSearchClient is shutting down');
    }

    try {
      const response = await this.client.index({
        index: indexName,
        id: documentId,
        body: document as Record<string, unknown>,
      });
      return response.body._id;
    } catch (error) {
      throw new Error(
        `Failed to index document: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Search for documents
   */
  public async search<T = Record<string, unknown>>(
    indexName: string,
    query: Record<string, unknown>,
    options?: SearchOptions
  ): Promise<{ hits: Array<{ _id: string; _source: T; _score: number }>; total: number }> {
    if (this.isShuttingDown) {
      throw new Error('OpenSearchClient is shutting down');
    }

    try {
      const response = await this.client.search({
        index: indexName,
        body: {
          query,
          from: options?.from,
          size: options?.size,
          sort: options?.sort,
        },
      });

      return {
        hits: response.body.hits.hits,
        total: response.body.hits.total.value,
      };
    } catch (error) {
      throw new Error(
        `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update a document
   */
  public async update<T = Record<string, unknown>>(
    indexName: string,
    documentId: string,
    partialDocument: Partial<T>
  ): Promise<void> {
    if (this.isShuttingDown) {
      throw new Error('OpenSearchClient is shutting down');
    }

    try {
      await this.client.update({
        index: indexName,
        id: documentId,
        body: {
          doc: partialDocument,
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to update document: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete a document
   */
  public async delete(indexName: string, documentId: string): Promise<void> {
    if (this.isShuttingDown) {
      throw new Error('OpenSearchClient is shutting down');
    }

    try {
      await this.client.delete({
        index: indexName,
        id: documentId,
      });
    } catch (error) {
      throw new Error(
        `Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Perform bulk operations
   */
  public async bulk(operations: BulkOperation[]): Promise<void> {
    if (this.isShuttingDown) {
      throw new Error('OpenSearchClient is shutting down');
    }

    try {
      const body = operations.flatMap((op) => {
        const operation = op.index || op.delete || op.update;
        if (op.index && op.doc) {
          return [{ index: operation }, op.doc];
        } else if (op.update && op.doc) {
          return [{ update: operation }, { doc: op.doc }];
        } else if (op.delete) {
          return [{ delete: operation }];
        }
        return [];
      });

      await this.client.bulk({ body });
    } catch (error) {
      throw new Error(
        `Bulk operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get the underlying OpenSearch client for advanced operations
   */
  public getClient(): Client {
    return this.client;
  }

  /**
   * Check if OpenSearch is healthy
   */
  public async healthCheck(): Promise<HealthCheckResult> {
    try {
      const start = Date.now();
      const response = await this.client.cluster.health();
      const duration = Date.now() - start;

      const status = response.body.status;

      let healthStatus: HealthStatus;
      if (status === 'green') {
        healthStatus = HealthStatus.HEALTHY;
      } else if (status === 'yellow') {
        healthStatus = HealthStatus.DEGRADED;
      } else {
        healthStatus = HealthStatus.UNHEALTHY;
      }

      return {
        status: healthStatus,
        timestamp: new Date(),
        message: `OpenSearch cluster status: ${status}`,
        metadata: {
          responseTimeMs: duration,
          clusterName: response.body.cluster_name,
          numberOfNodes: response.body.number_of_nodes,
        },
      };
    } catch (error) {
      return {
        status: HealthStatus.UNHEALTHY,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Gracefully shutdown the OpenSearch client
   */
  public async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;

    try {
      await this.client.close();
    } catch (error) {
      console.error(
        'Error during OpenSearch shutdown:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }
}
