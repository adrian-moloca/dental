/**
 * Test Database Helper
 *
 * Utilities for managing test database with testcontainers.
 * Provides PostgreSQL container lifecycle management and connection setup.
 */

import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import { Subscription } from '../../src/modules/subscriptions/entities/subscription.entity';
import { SubscriptionModule } from '../../src/modules/subscriptions/entities/subscription-module.entity';
import { Cabinet } from '../../src/modules/cabinets/entities/cabinet.entity';

export class TestDatabase {
  private container: StartedPostgreSqlContainer | null = null;
  private dataSource: DataSource | null = null;

  /**
   * Start PostgreSQL container and initialize database
   */
  async start(): Promise<DataSource> {
    console.log('Starting PostgreSQL container...');

    this.container = await new PostgreSqlContainer('postgres:15-alpine')
      .withDatabase('test_subscription_db')
      .withUsername('test_user')
      .withPassword('test_password')
      .withExposedPorts(5432)
      .start();

    console.log(`PostgreSQL container started on port ${this.container.getPort()}`);

    // Create TypeORM data source
    this.dataSource = new DataSource({
      type: 'postgres',
      host: this.container.getHost(),
      port: this.container.getPort(),
      username: this.container.getUsername(),
      password: this.container.getPassword(),
      database: this.container.getDatabase(),
      entities: [Subscription, SubscriptionModule, Cabinet],
      synchronize: true, // Auto-create schema for tests
      logging: false,
      dropSchema: false,
    });

    await this.dataSource.initialize();
    console.log('Database connection established and schema synchronized');

    return this.dataSource;
  }

  /**
   * Stop PostgreSQL container and close connections
   */
  async stop(): Promise<void> {
    if (this.dataSource?.isInitialized) {
      await this.dataSource.destroy();
      console.log('Database connection closed');
    }

    if (this.container) {
      await this.container.stop();
      console.log('PostgreSQL container stopped');
    }
  }

  /**
   * Clear all data from database (keep schema)
   */
  async clearData(): Promise<void> {
    if (!this.dataSource?.isInitialized) {
      throw new Error('Database not initialized');
    }

    const entities = this.dataSource.entityMetadatas;

    // Disable foreign key checks
    await this.dataSource.query('SET session_replication_role = replica;');

    // Truncate all tables
    for (const entity of entities) {
      const repository = this.dataSource.getRepository(entity.name);
      await repository.clear();
    }

    // Re-enable foreign key checks
    await this.dataSource.query('SET session_replication_role = DEFAULT;');
  }

  /**
   * Get active data source
   */
  getDataSource(): DataSource {
    if (!this.dataSource?.isInitialized) {
      throw new Error('Database not initialized');
    }
    return this.dataSource;
  }

  /**
   * Get connection details for manual connections
   */
  getConnectionDetails() {
    if (!this.container) {
      throw new Error('Container not started');
    }

    return {
      host: this.container.getHost(),
      port: this.container.getPort(),
      username: this.container.getUsername(),
      password: this.container.getPassword(),
      database: this.container.getDatabase(),
    };
  }
}
