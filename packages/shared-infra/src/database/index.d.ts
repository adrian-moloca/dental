export { PostgresClient, TransactionCallback } from './postgres.client';
export { MongoDBClient } from './mongodb.client';
export { baseSchemaPlugin, type BaseSchemaPluginOptions, } from './base-schema.plugin';
export { auditTrailPlugin, type AuditTrailPluginOptions, } from './audit-trail.plugin';
export { eventEmitterPlugin, type EventEmitterPluginOptions, } from './event-emitter.plugin';
export { BaseRepository, type PaginationOptions, type PaginatedResult, type RepositoryQueryOptions, } from './base-repository';
export { TransactionManager, type TransactionOptions, type TransactionCallback as MongoTransactionCallback, } from './transaction.manager';
export { QueryBuilder, AggregationBuilder } from './query-builder';
