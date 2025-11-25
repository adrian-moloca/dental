/**
 * Mock MongoDB Client
 * In-memory implementation of MongoDBClient for testing
 *
 * @module shared-testing/mocks/infrastructure
 */

import { HealthStatus } from '@dentalos/shared-infra';
import type { HealthCheckResult } from '@dentalos/shared-infra';

/**
 * Mock MongoDB client for testing
 * Stores collections and documents in memory
 */
export class MockMongoDBClient {
  private collections: Map<string, Map<string, any>> = new Map();
  private connected: boolean = false;

  /**
   * Connect to MongoDB (no-op for mock)
   */
  public async connect(): Promise<void> {
    this.connected = true;
  }

  /**
   * Get database (returns this for chaining)
   */
  public getDatabase(databaseName?: string): this {
    return this;
  }

  /**
   * Get collection
   */
  public getCollection<T = any>(collectionName: string, databaseName?: string): MockCollection<T> {
    if (!this.collections.has(collectionName)) {
      this.collections.set(collectionName, new Map());
    }

    return new MockCollection<T>(this.collections.get(collectionName)!);
  }

  /**
   * List all collections
   */
  public async listCollections(databaseName?: string): Promise<string[]> {
    return Array.from(this.collections.keys());
  }

  /**
   * Create a collection
   */
  public async createCollection<T = any>(
    collectionName: string,
    options?: any
  ): Promise<MockCollection<T>> {
    if (!this.collections.has(collectionName)) {
      this.collections.set(collectionName, new Map());
    }
    return new MockCollection<T>(this.collections.get(collectionName)!);
  }

  /**
   * Drop a collection
   */
  public async dropCollection(collectionName: string, databaseName?: string): Promise<boolean> {
    return this.collections.delete(collectionName);
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<HealthCheckResult> {
    return {
      status: this.connected ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
      timestamp: new Date(),
      message: 'Mock MongoDB connection',
      metadata: { responseTimeMs: 0 },
    };
  }

  /**
   * Get connection status
   */
  public isClientConnected(): boolean {
    return this.connected;
  }

  /**
   * Shutdown (no-op for mock)
   */
  public async shutdown(): Promise<void> {
    this.connected = false;
  }

  /**
   * Reset all stored data
   */
  public reset(): void {
    this.collections.clear();
    this.connected = false;
  }
}

/**
 * Mock MongoDB collection
 */
class MockCollection<T> {
  constructor(private store: Map<string, any>) {}

  public async insertOne(doc: T): Promise<{ insertedId: string }> {
    const id = (doc as any)._id ?? this.generateId();
    this.store.set(id, { ...doc, _id: id });
    return { insertedId: id };
  }

  public async findOne(filter: any): Promise<T | null> {
    for (const doc of this.store.values()) {
      if (this.matchesFilter(doc, filter)) {
        return doc;
      }
    }
    return null;
  }

  public async find(filter: any = {}): Promise<{ toArray: () => Promise<T[]> }> {
    const matches: T[] = [];
    for (const doc of this.store.values()) {
      if (this.matchesFilter(doc, filter)) {
        matches.push(doc);
      }
    }
    return { toArray: async () => matches };
  }

  public async updateOne(filter: any, update: any): Promise<{ modifiedCount: number }> {
    for (const [id, doc] of this.store.entries()) {
      if (this.matchesFilter(doc, filter)) {
        const updated = update.$set ? { ...doc, ...update.$set } : update;
        this.store.set(id, updated);
        return { modifiedCount: 1 };
      }
    }
    return { modifiedCount: 0 };
  }

  public async deleteOne(filter: any): Promise<{ deletedCount: number }> {
    for (const [id, doc] of this.store.entries()) {
      if (this.matchesFilter(doc, filter)) {
        this.store.delete(id);
        return { deletedCount: 1 };
      }
    }
    return { deletedCount: 0 };
  }

  private matchesFilter(doc: any, filter: any): boolean {
    for (const key in filter) {
      if (doc[key] !== filter[key]) {
        return false;
      }
    }
    return true;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
