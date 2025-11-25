/**
 * Mock implementations
 * @module shared-testing/mocks
 */

// Infrastructure mocks
export {
  MockPostgresClient,
  MockRedisClient,
  MockRabbitMQClient,
  MockMongoDBClient,
  MockOpenSearchClient,
} from './infrastructure';

// In-memory implementations
export { InMemoryEventBus, InMemoryCache, InMemoryRepository } from './in-memory';
export type { CacheInterface, Repository } from './in-memory';

// Logger mock
export { MockLogger, createMockLogger } from './logger';
export type { LogEntry, Logger } from './logger';
