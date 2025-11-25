import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { PostgresConfig } from '../config/database.config';
import { HealthCheckable, HealthCheckResult, HealthStatus } from '../health';

/**
 * Transaction callback function type
 */
export type TransactionCallback<T> = (client: PoolClient) => Promise<T>;

/**
 * PostgreSQL client with connection pooling and health checks
 */
export class PostgresClient implements HealthCheckable {
  private pool: Pool;
  private isShuttingDown = false;

  constructor(config: PostgresConfig) {
    this.pool = new Pool({
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

  /**
   * Setup pool event handlers for monitoring
   */
  private setupEventHandlers(): void {
    (this.pool as any).on('error', (err: any) => {
      // Log error without exposing sensitive connection details
      console.error('PostgreSQL pool error:', {
        message: err.message,
        code: (err as { code?: string }).code,
      });
    });

    (this.pool as any).on('connect', () => {
      // Connection established - can be logged for monitoring
    });

    (this.pool as any).on('remove', () => {
      // Client removed from pool - can be logged for monitoring
    });
  }

  /**
   * Execute a query with optional parameters
   */
  public async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    if (this.isShuttingDown) {
      throw new Error('PostgresClient is shutting down');
    }

    try {
      return await this.pool.query<T>(sql, params);
    } catch (error) {
      // Log error without exposing query details that might contain PHI
      throw new Error(
        `PostgreSQL query failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Execute multiple queries in a transaction
   */
  public async transaction<T>(callback: TransactionCallback<T>): Promise<T> {
    if (this.isShuttingDown) {
      throw new Error('PostgresClient is shutting down');
    }

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(
        `PostgreSQL transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      client.release();
    }
  }

  /**
   * Get a client from the pool for manual transaction management
   */
  public async getClient(): Promise<PoolClient> {
    if (this.isShuttingDown) {
      throw new Error('PostgresClient is shutting down');
    }

    return await this.pool.connect();
  }

  /**
   * Check if the PostgreSQL connection is healthy
   */
  public async healthCheck(): Promise<HealthCheckResult> {
    try {
      const start = Date.now();
      await this.pool.query('SELECT 1');
      const duration = Date.now() - start;

      return {
        status: HealthStatus.HEALTHY,
        timestamp: new Date(),
        message: 'PostgreSQL connection healthy',
        metadata: {
          responseTimeMs: duration,
          totalCount: (this.pool as any).totalCount,
          idleCount: (this.pool as any).idleCount,
          waitingCount: (this.pool as any).waitingCount,
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
   * Get pool statistics for monitoring
   */
  public getPoolStats(): {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
  } {
    return {
      totalCount: (this.pool as any).totalCount,
      idleCount: (this.pool as any).idleCount,
      waitingCount: (this.pool as any).waitingCount,
    };
  }

  /**
   * Gracefully shutdown the connection pool
   */
  public async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;

    try {
      await this.pool.end();
    } catch (error) {
      console.error(
        'Error during PostgreSQL shutdown:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Check if the client is shutting down
   */
  public isShutdown(): boolean {
    return this.isShuttingDown;
  }
}
