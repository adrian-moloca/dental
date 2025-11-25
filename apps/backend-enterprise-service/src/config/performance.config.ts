import { z } from 'zod';

/**
 * Performance Configuration
 * Comprehensive settings for database, caching, resilience, and monitoring
 */

const PerformanceConfigSchema = z.object({
  // Database Performance
  database: z.object({
    // Connection Pool Settings
    poolSize: z.number().int().positive().default(10),
    maxPoolSize: z.number().int().positive().default(50),
    minPoolSize: z.number().int().positive().default(5),
    serverSelectionTimeoutMS: z.number().int().positive().default(30000),
    socketTimeoutMS: z.number().int().positive().default(45000),
    connectTimeoutMS: z.number().int().positive().default(30000),
    maxIdleTimeMS: z.number().int().positive().default(300000), // 5 minutes
    waitQueueTimeoutMS: z.number().int().positive().default(10000),

    // Query Performance
    enableQueryLogging: z.boolean().default(false),
    slowQueryThresholdMs: z.number().int().positive().default(100),
    enableExplainPlans: z.boolean().default(false),
    autoCreateIndexes: z.boolean().default(true),

    // Read Preferences
    readPreference: z
      .enum(['primary', 'primaryPreferred', 'secondary', 'secondaryPreferred', 'nearest'])
      .default('primaryPreferred'),
    readConcern: z
      .enum(['local', 'available', 'majority', 'linearizable', 'snapshot'])
      .default('majority'),
    writeConcern: z.object({
      w: z.union([z.number(), z.literal('majority')]).default('majority'),
      j: z.boolean().default(true), // Journal
      wtimeout: z.number().default(30000),
    }),
  }),

  // Cache Configuration
  cache: z.object({
    enabled: z.boolean().default(true),
    defaultTTL: z.number().int().positive().default(300), // 5 minutes

    // TTL by resource type (seconds)
    ttl: z.object({
      organization: z.number().int().positive().default(300),
      clinic: z.number().int().positive().default(300),
      assignment: z.number().int().positive().default(60),
      list: z.number().int().positive().default(30),
      stats: z.number().int().positive().default(120),
      session: z.number().int().positive().default(1800),
      config: z.number().int().positive().default(600),
    }),

    // Redis Configuration
    redis: z.object({
      maxRetriesPerRequest: z.number().int().positive().default(3),
      retryDelayMs: z.number().int().positive().default(50),
      maxRetryDelayMs: z.number().int().positive().default(2000),
      enableOfflineQueue: z.boolean().default(true),
      enableReadyCheck: z.boolean().default(true),
      connectionTimeout: z.number().int().positive().default(10000),
      commandTimeout: z.number().int().positive().default(5000),
    }),

    // Cache Warming
    warmCache: z.boolean().default(true),
    warmCacheOnStartup: z.boolean().default(false),
  }),

  // Pagination
  pagination: z.object({
    defaultLimit: z.number().int().positive().default(20),
    maxLimit: z.number().int().positive().default(100),
    defaultOffset: z.number().int().positive().default(0),
    useCursorPagination: z.boolean().default(false), // Use cursor for better perf
    enableCountEstimation: z.boolean().default(true), // Faster count for large datasets
  }),

  // Circuit Breaker
  circuitBreaker: z.object({
    enabled: z.boolean().default(true),
    failureThreshold: z.number().int().positive().default(5),
    successThreshold: z.number().int().positive().default(2),
    timeout: z.number().int().positive().default(60000), // 60 seconds
    monitoringPeriod: z.number().int().positive().default(120000), // 2 minutes
  }),

  // Request Timeouts
  timeouts: z.object({
    default: z.number().int().positive().default(30000), // 30 seconds
    search: z.number().int().positive().default(5000), // 5 seconds
    reports: z.number().int().positive().default(120000), // 2 minutes
    export: z.number().int().positive().default(120000), // 2 minutes
    background: z.number().int().positive().default(300000), // 5 minutes
  }),

  // Response Optimization
  response: z.object({
    enableCompression: z.boolean().default(true),
    compressionMinSize: z.number().int().positive().default(1024), // 1KB
    enableETag: z.boolean().default(true),
    enableFieldSelection: z.boolean().default(true),
    defaultFields: z.array(z.string()).optional(),
  }),

  // Query Optimization
  query: z.object({
    enableLeanQueries: z.boolean().default(true),
    enableProjection: z.boolean().default(true),
    enableBatchLoading: z.boolean().default(true),
    batchLoadingDelay: z.number().int().positive().default(10), // 10ms batching window
    maxBatchSize: z.number().int().positive().default(100),
  }),

  // Monitoring
  monitoring: z.object({
    enabled: z.boolean().default(true),
    slowRequestThreshold: z.number().int().positive().default(1000), // 1 second
    warningThreshold: z.number().int().positive().default(500), // 500ms
    enableMetricsCollection: z.boolean().default(true),
    metricsRetentionMs: z.number().int().positive().default(3600000), // 1 hour
    maxMetricsInMemory: z.number().int().positive().default(1000),
    logSlowQueries: z.boolean().default(true),
    logInterval: z.number().int().positive().default(60000), // 60 seconds
  }),

  // Graceful Degradation
  degradation: z.object({
    enabled: z.boolean().default(true),
    enableFallback: z.boolean().default(true),
    cacheStaleData: z.boolean().default(true),
    returnPartialResults: z.boolean().default(true),
    staleDataTTL: z.number().int().positive().default(3600), // 1 hour
  }),

  // Rate Limiting (basic)
  rateLimit: z.object({
    enabled: z.boolean().default(true),
    windowMs: z.number().int().positive().default(60000), // 1 minute
    maxRequests: z.number().int().positive().default(100),
    skipSuccessfulRequests: z.boolean().default(false),
    skipFailedRequests: z.boolean().default(false),
  }),

  // Memory Management
  memory: z.object({
    enableGarbageCollection: z.boolean().default(true),
    gcInterval: z.number().int().positive().default(300000), // 5 minutes
    maxOldSpaceSizeMB: z.number().int().positive().default(2048), // 2GB
    maxHeapSizeMB: z.number().int().positive().default(4096), // 4GB
  }),
});

export type PerformanceConfig = z.infer<typeof PerformanceConfigSchema>;

export const defaultPerformanceConfig = (): PerformanceConfig => {
  const config: PerformanceConfig = {
    database: {
      poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
      maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '50', 10),
      minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '5', 10),
      serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT || '30000', 10),
      socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT || '45000', 10),
      connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT || '30000', 10),
      maxIdleTimeMS: parseInt(process.env.DB_MAX_IDLE_TIME || '300000', 10),
      waitQueueTimeoutMS: parseInt(process.env.DB_WAIT_QUEUE_TIMEOUT || '10000', 10),
      enableQueryLogging: process.env.DB_ENABLE_QUERY_LOGGING === 'true',
      slowQueryThresholdMs: parseInt(process.env.DB_SLOW_QUERY_THRESHOLD || '100', 10),
      enableExplainPlans: process.env.DB_ENABLE_EXPLAIN_PLANS === 'true',
      autoCreateIndexes: process.env.DB_AUTO_CREATE_INDEXES !== 'false',
      readPreference: (process.env.DB_READ_PREFERENCE as any) || 'primaryPreferred',
      readConcern: (process.env.DB_READ_CONCERN as any) || 'majority',
      writeConcern: {
        w: (process.env.DB_WRITE_CONCERN_W || 'majority') as number | 'majority',
        j: process.env.DB_WRITE_CONCERN_J !== 'false',
        wtimeout: parseInt(process.env.DB_WRITE_CONCERN_TIMEOUT || '30000', 10),
      },
    },

    cache: {
      enabled: process.env.CACHE_ENABLED !== 'false',
      defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '300', 10),
      ttl: {
        organization: parseInt(process.env.CACHE_TTL_ORGANIZATION || '300', 10),
        clinic: parseInt(process.env.CACHE_TTL_CLINIC || '300', 10),
        assignment: parseInt(process.env.CACHE_TTL_ASSIGNMENT || '60', 10),
        list: parseInt(process.env.CACHE_TTL_LIST || '30', 10),
        stats: parseInt(process.env.CACHE_TTL_STATS || '120', 10),
        session: parseInt(process.env.CACHE_TTL_SESSION || '1800', 10),
        config: parseInt(process.env.CACHE_TTL_CONFIG || '600', 10),
      },
      redis: {
        maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
        retryDelayMs: parseInt(process.env.REDIS_RETRY_DELAY || '50', 10),
        maxRetryDelayMs: parseInt(process.env.REDIS_MAX_RETRY_DELAY || '2000', 10),
        enableOfflineQueue: process.env.REDIS_OFFLINE_QUEUE !== 'false',
        enableReadyCheck: process.env.REDIS_READY_CHECK !== 'false',
        connectionTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000', 10),
        commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT || '5000', 10),
      },
      warmCache: process.env.CACHE_WARM !== 'false',
      warmCacheOnStartup: process.env.CACHE_WARM_ON_STARTUP === 'true',
    },

    pagination: {
      defaultLimit: parseInt(process.env.PAGINATION_DEFAULT_LIMIT || '20', 10),
      maxLimit: parseInt(process.env.PAGINATION_MAX_LIMIT || '100', 10),
      defaultOffset: parseInt(process.env.PAGINATION_DEFAULT_OFFSET || '0', 10),
      useCursorPagination: process.env.PAGINATION_USE_CURSOR === 'true',
      enableCountEstimation: process.env.PAGINATION_ESTIMATE_COUNT !== 'false',
    },

    circuitBreaker: {
      enabled: process.env.CIRCUIT_BREAKER_ENABLED !== 'false',
      failureThreshold: parseInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || '5', 10),
      successThreshold: parseInt(process.env.CIRCUIT_BREAKER_SUCCESS_THRESHOLD || '2', 10),
      timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '60000', 10),
      monitoringPeriod: parseInt(process.env.CIRCUIT_BREAKER_MONITORING_PERIOD || '120000', 10),
    },

    timeouts: {
      default: parseInt(process.env.TIMEOUT_DEFAULT || '30000', 10),
      search: parseInt(process.env.TIMEOUT_SEARCH || '5000', 10),
      reports: parseInt(process.env.TIMEOUT_REPORTS || '120000', 10),
      export: parseInt(process.env.TIMEOUT_EXPORT || '120000', 10),
      background: parseInt(process.env.TIMEOUT_BACKGROUND || '300000', 10),
    },

    response: {
      enableCompression: process.env.RESPONSE_COMPRESSION !== 'false',
      compressionMinSize: parseInt(process.env.RESPONSE_COMPRESSION_MIN_SIZE || '1024', 10),
      enableETag: process.env.RESPONSE_ETAG !== 'false',
      enableFieldSelection: process.env.RESPONSE_FIELD_SELECTION !== 'false',
    },

    query: {
      enableLeanQueries: process.env.QUERY_LEAN !== 'false',
      enableProjection: process.env.QUERY_PROJECTION !== 'false',
      enableBatchLoading: process.env.QUERY_BATCH_LOADING !== 'false',
      batchLoadingDelay: parseInt(process.env.QUERY_BATCH_DELAY || '10', 10),
      maxBatchSize: parseInt(process.env.QUERY_MAX_BATCH_SIZE || '100', 10),
    },

    monitoring: {
      enabled: process.env.MONITORING_ENABLED !== 'false',
      slowRequestThreshold: parseInt(process.env.MONITORING_SLOW_THRESHOLD || '1000', 10),
      warningThreshold: parseInt(process.env.MONITORING_WARNING_THRESHOLD || '500', 10),
      enableMetricsCollection: process.env.MONITORING_METRICS !== 'false',
      metricsRetentionMs: parseInt(process.env.MONITORING_RETENTION || '3600000', 10),
      maxMetricsInMemory: parseInt(process.env.MONITORING_MAX_METRICS || '1000', 10),
      logSlowQueries: process.env.MONITORING_LOG_SLOW_QUERIES !== 'false',
      logInterval: parseInt(process.env.MONITORING_LOG_INTERVAL || '60000', 10),
    },

    degradation: {
      enabled: process.env.DEGRADATION_ENABLED !== 'false',
      enableFallback: process.env.DEGRADATION_FALLBACK !== 'false',
      cacheStaleData: process.env.DEGRADATION_CACHE_STALE !== 'false',
      returnPartialResults: process.env.DEGRADATION_PARTIAL_RESULTS !== 'false',
      staleDataTTL: parseInt(process.env.DEGRADATION_STALE_TTL || '3600', 10),
    },

    rateLimit: {
      enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true',
      skipFailedRequests: process.env.RATE_LIMIT_SKIP_FAILED === 'true',
    },

    memory: {
      enableGarbageCollection: process.env.MEMORY_GC_ENABLED !== 'false',
      gcInterval: parseInt(process.env.MEMORY_GC_INTERVAL || '300000', 10),
      maxOldSpaceSizeMB: parseInt(process.env.MEMORY_MAX_OLD_SPACE || '2048', 10),
      maxHeapSizeMB: parseInt(process.env.MEMORY_MAX_HEAP || '4096', 10),
    },
  };

  return PerformanceConfigSchema.parse(config);
};
