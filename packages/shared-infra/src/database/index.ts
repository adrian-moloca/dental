export { PostgresClient, TransactionCallback } from './postgres.client';
export { MongoDBClient } from './mongodb.client';

// MongoDB Schema Plugins
export {
  baseSchemaPlugin,
  type BaseSchemaPluginOptions,
} from './base-schema.plugin';
export {
  auditTrailPlugin,
  type AuditTrailPluginOptions,
} from './audit-trail.plugin';
export {
  eventEmitterPlugin,
  type EventEmitterPluginOptions,
} from './event-emitter.plugin';

// Repository Base Class
export {
  BaseRepository,
  type PaginationOptions,
  type PaginatedResult,
  type RepositoryQueryOptions,
} from './base-repository';

// Transaction Management
export {
  TransactionManager,
  type TransactionOptions,
  type TransactionCallback as MongoTransactionCallback,
} from './transaction.manager';

// Query Builders
export { QueryBuilder, AggregationBuilder } from './query-builder';
