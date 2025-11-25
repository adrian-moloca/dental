/**
 * Mock PostgreSQL Client
 * In-memory implementation of PostgresClient for testing
 *
 * @module shared-testing/mocks/infrastructure
 */

import type { QueryResult, QueryResultRow, PoolClient } from 'pg';
import type { TransactionCallback } from '@dentalos/shared-infra';
import { HealthStatus } from '@dentalos/shared-infra';
import type { HealthCheckResult } from '@dentalos/shared-infra';

/**
 * Mock PostgreSQL client for testing
 * Stores query results in memory and allows mocking responses
 */
export class MockPostgresClient {
  private queryResults: Map<string, QueryResult<any>> = new Map();
  private queryCalls: Array<{ sql: string; params?: unknown[] }> = [];
  private transactionCalls: number = 0;
  private connected: boolean = true;

  /**
   * Mock a query response
   *
   * @param sql - SQL query to mock
   * @param result - Query result to return
   *
   * @example
   * ```typescript
   * const client = new MockPostgresClient();
   * client.mockQuery('SELECT * FROM users', {
   *   rows: [{ id: 1, name: 'Test User' }],
   *   rowCount: 1
   * });
   * ```
   */
  public mockQuery<T extends QueryResultRow = any>(
    sql: string,
    result: Partial<QueryResult<T>>
  ): void {
    this.queryResults.set(sql, {
      command: '',
      rowCount: result.rowCount ?? null,
      oid: 0,
      fields: [],
      rows: result.rows ?? [],
      ...result,
    } as QueryResult<T>);
  }

  /**
   * Execute a query
   */
  public async query<T extends QueryResultRow = any>(
    sql: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    this.queryCalls.push({ sql, params });

    const result = this.queryResults.get(sql);
    if (!result) {
      // Return empty result if not mocked
      return {
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
        rows: [],
      } as QueryResult<T>;
    }

    return result as QueryResult<T>;
  }

  /**
   * Execute a transaction
   */
  public async transaction<T>(callback: TransactionCallback<T>): Promise<T> {
    this.transactionCalls++;

    // Create a mock PoolClient
    const mockClient = this.createMockPoolClient();

    try {
      await mockClient.query('BEGIN');
      const result = await callback(mockClient as unknown as PoolClient);
      await mockClient.query('COMMIT');
      return result;
    } catch (error) {
      await mockClient.query('ROLLBACK');
      throw error;
    }
  }

  /**
   * Get a mock client for manual transaction management
   */
  public async getClient(): Promise<PoolClient> {
    return this.createMockPoolClient() as unknown as PoolClient;
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<HealthCheckResult> {
    return {
      status: this.connected ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
      timestamp: new Date(),
      message: 'Mock PostgreSQL connection',
      metadata: {
        responseTimeMs: 0,
        totalCount: 10,
        idleCount: 8,
        waitingCount: 0,
      },
    };
  }

  /**
   * Get pool statistics
   */
  public getPoolStats(): { totalCount: number; idleCount: number; waitingCount: number } {
    return {
      totalCount: 10,
      idleCount: 8,
      waitingCount: 0,
    };
  }

  /**
   * Shutdown (no-op for mock)
   */
  public async shutdown(): Promise<void> {
    this.connected = false;
  }

  /**
   * Get all query calls made
   */
  public getQueryCalls(): Array<{ sql: string; params?: unknown[] }> {
    return [...this.queryCalls];
  }

  /**
   * Get number of transactions executed
   */
  public getTransactionCount(): number {
    return this.transactionCalls;
  }

  /**
   * Reset all mocked data
   */
  public reset(): void {
    this.queryResults.clear();
    this.queryCalls = [];
    this.transactionCalls = 0;
    this.connected = true;
  }

  /**
   * Create a mock PoolClient
   * @private
   */
  private createMockPoolClient(): Partial<PoolClient> {
    return {
      query: this.query.bind(this),
      release: () => undefined,
    };
  }
}
