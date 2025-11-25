import { MongoClient, Db, Collection, MongoClientOptions } from 'mongodb';
import { MongoDBConfig } from '../config/database.config';
import { HealthCheckable, HealthCheckResult, HealthStatus } from '../health';

/**
 * MongoDB client with connection management and health checks
 */
export class MongoDBClient implements HealthCheckable {
  private client: MongoClient;
  private config: MongoDBConfig;
  private isConnected = false;
  private isShuttingDown = false;

  constructor(config: MongoDBConfig) {
    this.config = config;

    const options: MongoClientOptions = {
      maxPoolSize: config.maxPoolSize,
      minPoolSize: config.minPoolSize,
      maxIdleTimeMS: config.maxIdleTimeMS,
      serverSelectionTimeoutMS: config.serverSelectionTimeoutMS,
    };

    this.client = new MongoClient(config.uri, options);
  }

  /**
   * Connect to MongoDB
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    if (this.isShuttingDown) {
      throw new Error('MongoDBClient is shutting down');
    }

    try {
      await this.client.connect();
      this.isConnected = true;
    } catch (error) {
      throw new Error(
        `MongoDB connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get database instance
   */
  public getDatabase(databaseName?: string): Db {
    if (!this.isConnected) {
      throw new Error('MongoDB client not connected. Call connect() first.');
    }

    return this.client.db(databaseName || this.config.database);
  }

  /**
   * Get collection instance
   */
  public getCollection<T extends Record<string, unknown> = Record<string, unknown>>(
    collectionName: string,
    databaseName?: string
  ): Collection<T> {
    const db = this.getDatabase(databaseName);
    return db.collection<T>(collectionName);
  }

  /**
   * Check if the MongoDB connection is healthy
   */
  public async healthCheck(): Promise<HealthCheckResult> {
    try {
      if (!this.isConnected) {
        return {
          status: HealthStatus.UNHEALTHY,
          timestamp: new Date(),
          error: 'MongoDB client not connected',
        };
      }

      const start = Date.now();
      await this.client.db('admin').command({ ping: 1 });
      const duration = Date.now() - start;

      return {
        status: HealthStatus.HEALTHY,
        timestamp: new Date(),
        message: 'MongoDB connection healthy',
        metadata: {
          responseTimeMs: duration,
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
   * Get connection status
   */
  public isClientConnected(): boolean {
    return this.isConnected && !this.isShuttingDown;
  }

  /**
   * List all collections in the database
   */
  public async listCollections(databaseName?: string): Promise<string[]> {
    if (!this.isConnected) {
      throw new Error('MongoDB client not connected. Call connect() first.');
    }

    const db = this.getDatabase(databaseName);
    const collections = await db.listCollections().toArray();
    return collections.map((col) => col.name);
  }

  /**
   * Create a collection with options
   */
  public async createCollection<T extends Record<string, unknown> = Record<string, unknown>>(
    collectionName: string,
    options?: {
      capped?: boolean;
      size?: number;
      max?: number;
    }
  ): Promise<Collection<T>> {
    if (!this.isConnected) {
      throw new Error('MongoDB client not connected. Call connect() first.');
    }

    const db = this.getDatabase();
    return await db.createCollection<T>(collectionName, options);
  }

  /**
   * Drop a collection
   */
  public async dropCollection(collectionName: string, databaseName?: string): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('MongoDB client not connected. Call connect() first.');
    }

    const db = this.getDatabase(databaseName);
    return await db.dropCollection(collectionName);
  }

  /**
   * Gracefully shutdown the MongoDB connection
   */
  public async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;

    try {
      if (this.isConnected) {
        await this.client.close();
        this.isConnected = false;
      }
    } catch (error) {
      console.error(
        'Error during MongoDB shutdown:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }
}
