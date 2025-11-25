/**
 * Configuration module for Inventory Service
 * Provides type-safe configuration values from environment variables
 */

export default () => ({
  port: parseInt(process.env.PORT || '3308', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory',
    database: process.env.MONGODB_DATABASE || 'inventory',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6381', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  inventory: {
    alertThreshold: parseInt(process.env.INVENTORY_ALERT_THRESHOLD_DEFAULT || '10', 10),
    expirationWarningDays: parseInt(process.env.INVENTORY_EXPIRATION_WARNING_DAYS || '30', 10),
    autoReorderEnabled: process.env.INVENTORY_AUTO_REORDER_ENABLED === 'true',
  },

  procurement: {
    autoOrderEnabled: process.env.PROCUREMENT_AUTO_ORDER_ENABLED === 'true',
    approvalRequired: process.env.PROCUREMENT_APPROVAL_REQUIRED !== 'false',
  },

  supplier: {
    apiEndpoint: process.env.SUPPLIER_API_ENDPOINT,
    apiKey: process.env.SUPPLIER_API_KEY,
  },

  storage: {
    bucket: process.env.STORAGE_BUCKET || 'dental-inventory',
    region: process.env.STORAGE_REGION || 'us-east-1',
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
    endpoint: process.env.STORAGE_ENDPOINT,
    forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === 'true',
  },

  services: {
    clinical: process.env.CLINICAL_SERVICE_URL || 'http://localhost:3305',
    patient: process.env.PATIENT_SERVICE_URL || 'http://localhost:3304',
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3301',
  },

  eventBus: {
    provider: process.env.EVENT_BUS_PROVIDER || 'redis',
    redisUrl:
      process.env.EVENT_BUS_REDIS_URL ||
      'rediss://:d5596a97c1e3cf602a6f2103c99b780c@master.dentalos-redis.iyu7la.euc1.cache.amazonaws.com:6379',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },

  cors: {
    enabled: process.env.CORS_ENABLED !== 'false',
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  },

  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  tenant: {
    isolationEnabled: process.env.TENANT_ISOLATION_ENABLED !== 'false',
  },
});
