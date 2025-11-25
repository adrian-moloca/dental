/**
 * Mock OpenSearch Client
 * In-memory implementation of OpenSearchClient for testing
 *
 * @module shared-testing/mocks/infrastructure
 */

import { HealthStatus } from '@dentalos/shared-infra';
import type { HealthCheckResult, IndexSettings, SearchOptions } from '@dentalos/shared-infra';

/**
 * Mock OpenSearch client for testing
 * Stores indices and documents in memory
 */
export class MockOpenSearchClient {
  private indices: Map<string, Map<string, any>> = new Map();

  /**
   * Create an index
   */
  public async createIndex(
    indexName: string,
    settings?: IndexSettings,
    mappings?: Record<string, unknown>
  ): Promise<void> {
    if (!this.indices.has(indexName)) {
      this.indices.set(indexName, new Map());
    }
  }

  /**
   * Delete an index
   */
  public async deleteIndex(indexName: string): Promise<void> {
    this.indices.delete(indexName);
  }

  /**
   * Check if index exists
   */
  public async indexExists(indexName: string): Promise<boolean> {
    return this.indices.has(indexName);
  }

  /**
   * Index a document
   */
  public async index<T = Record<string, unknown>>(
    indexName: string,
    document: T,
    documentId?: string
  ): Promise<string> {
    if (!this.indices.has(indexName)) {
      this.indices.set(indexName, new Map());
    }

    const id = documentId ?? this.generateId();
    this.indices.get(indexName)!.set(id, document);
    return id;
  }

  /**
   * Search for documents
   */
  public async search<T = Record<string, unknown>>(
    indexName: string,
    query: Record<string, unknown>,
    options?: SearchOptions
  ): Promise<{ hits: Array<{ _id: string; _source: T; _score: number }>; total: number }> {
    const index = this.indices.get(indexName);
    if (!index) {
      return { hits: [], total: 0 };
    }

    const hits: Array<{ _id: string; _source: T; _score: number }> = [];
    for (const [id, doc] of index.entries()) {
      hits.push({ _id: id, _source: doc, _score: 1.0 });
    }

    const from = options?.from ?? 0;
    const size = options?.size ?? hits.length;
    const pagedHits = hits.slice(from, from + size);

    return { hits: pagedHits, total: hits.length };
  }

  /**
   * Update a document
   */
  public async update<T = Record<string, unknown>>(
    indexName: string,
    documentId: string,
    partialDocument: Partial<T>
  ): Promise<void> {
    const index = this.indices.get(indexName);
    if (index && index.has(documentId)) {
      const existing = index.get(documentId);
      index.set(documentId, { ...existing, ...partialDocument });
    }
  }

  /**
   * Delete a document
   */
  public async delete(indexName: string, documentId: string): Promise<void> {
    const index = this.indices.get(indexName);
    if (index) {
      index.delete(documentId);
    }
  }

  /**
   * Perform bulk operations
   */
  public async bulk(operations: any[]): Promise<void> {
    // Simplified bulk operation handling
    for (const op of operations) {
      if (op.index) {
        await this.index(op.index._index, op.doc, op.index._id);
      } else if (op.delete) {
        await this.delete(op.delete._index, op.delete._id);
      }
    }
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<HealthCheckResult> {
    return {
      status: HealthStatus.HEALTHY,
      timestamp: new Date(),
      message: 'OpenSearch cluster status: green',
      metadata: {
        responseTimeMs: 0,
        clusterName: 'mock-cluster',
        numberOfNodes: 1,
      },
    };
  }

  /**
   * Shutdown (no-op for mock)
   */
  public async shutdown(): Promise<void> {
    // No-op
  }

  /**
   * Get all documents in an index (testing utility)
   */
  public getAllDocuments(indexName: string): Array<{ id: string; doc: any }> {
    const index = this.indices.get(indexName);
    if (!index) return [];

    return Array.from(index.entries()).map(([id, doc]) => ({ id, doc }));
  }

  /**
   * Reset all stored data
   */
  public reset(): void {
    this.indices.clear();
  }

  /**
   * Generate a random document ID
   * @private
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
