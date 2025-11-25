/**
 * Shared Infrastructure Package
 * Provides infrastructure client abstractions for Dental OS
 */

// Configuration exports
export {
  PostgresConfig,
  loadPostgresConfig,
  MongoDBConfig,
  loadMongoDBConfig,
  RedisConfig,
  loadRedisConfig,
  RabbitMQConfig,
  loadRabbitMQConfig,
  OpenSearchConfig,
  loadOpenSearchConfig,
} from './config';

// Health check exports
export {
  HealthStatus,
  HealthCheckResult,
  HealthCheckable,
  HealthAggregator,
  DependencyHealthService,
  DependencyHealthCheck,
  HttpHealthCheckOptions,
} from './health';

// Database exports
export { PostgresClient, TransactionCallback, MongoDBClient } from './database';
export { baseSchemaPlugin } from './database/base-schema.plugin';
export { auditTrailPlugin } from './database/audit-trail.plugin';
export { eventEmitterPlugin } from './database/event-emitter.plugin';
export { BaseRepository, PaginationOptions as RepoPaginationOptions, PaginatedResult, RepositoryQueryOptions } from './database/base-repository';

// Cache exports
export { RedisClient } from './cache';

// Messaging exports
export { RabbitMQClient, MessageHandler, ExchangeOptions, QueueOptions } from './messaging';

// Search exports
export { OpenSearchClient, IndexSettings, SearchOptions, BulkOperation } from './search';

// Performance exports
export { CacheManager, CacheOptions } from './performance/cache-manager';
export {
  PaginationRequest,
  PaginatedResponse,
  PaginationRequestSchema,
  createPaginatedResponse,
  calculatePaginationParams,
  CursorPaginationRequest,
  CursorPaginatedResponse,
  createCursorPaginatedResponse,
  decodeCursor,
} from './performance/pagination';

// Reliability exports
export {
  CircuitBreaker,
  CircuitBreakerRegistry,
  CircuitState,
  CircuitBreakerOptions,
  CircuitBreakerOpenError,
} from './reliability/circuit-breaker';
export {
  HealthCheckService,
  HealthStatus as EnhancedHealthStatus,
  HealthCheckResult as EnhancedHealthCheckResult,
  ComponentHealth,
} from './reliability/health-check';

// Observability exports
export { PrometheusMetricsService } from './observability/prometheus-metrics';
export {
  StructuredLogger,
  LoggerFactory,
  LogContext,
  LogLevel,
} from './observability/structured-logger';
export {
  HttpLoggingInterceptor,
  AuditInterceptor,
} from './observability/http-interceptor';
