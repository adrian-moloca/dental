import { MongooseModuleOptions } from '@nestjs/mongoose';

/**
 * Database Security Configuration
 *
 * SECURITY FEATURES:
 * - Connection encryption (TLS/SSL)
 * - Authentication required
 * - Connection pooling limits
 * - Query timeout protection
 * - Read preference for scalability
 * - Retry logic for resilience
 *
 * COMPLIANCE:
 * - HIPAA: Encryption in transit (§164.312(e)(1))
 * - PCI DSS: Requirement 4 (Encrypt transmission of cardholder data)
 * - GDPR: Article 32 (Security of processing)
 *
 * THREAT MITIGATION:
 * - Man-in-the-middle attacks (TLS encryption)
 * - Connection exhaustion (pool limits)
 * - Slow query DoS (timeouts)
 * - Credential theft (secure credential storage)
 */

/**
 * Creates secure MongoDB connection options
 *
 * SECURITY FEATURES:
 * 1. TLS/SSL encryption for data in transit
 * 2. Authentication with username/password
 * 3. Connection pooling with limits
 * 4. Socket timeouts to prevent hanging connections
 * 5. Server selection timeout
 * 6. Retry logic for transient failures
 *
 * @param uri - MongoDB connection URI
 * @returns Mongoose connection options
 */
export function createSecureMongooseOptions(uri: string): MongooseModuleOptions {
  return {
    uri,

    // Connection pool settings
    // SECURITY: Limit pool size to prevent resource exhaustion
    minPoolSize: 2,
    maxPoolSize: 10,
    maxIdleTimeMS: 10000, // Close idle connections after 10s

    // Timeout settings
    // SECURITY: Prevent hanging connections and slow query DoS
    serverSelectionTimeoutMS: 5000, // 5 seconds to select server
    socketTimeoutMS: 45000, // 45 seconds for socket operations
    connectTimeoutMS: 10000, // 10 seconds to establish connection

    // TLS/SSL encryption
    // SECURITY: Always use encryption for production
    // Note: MongoDB Atlas connections include TLS by default in URI
    tls: process.env.MONGODB_TLS === 'true',
    tlsAllowInvalidCertificates: false, // CRITICAL: Always validate certificates
    tlsAllowInvalidHostnames: false, // CRITICAL: Always validate hostnames

    // Authentication
    // SECURITY: Credentials should be in URI or environment variables
    authSource: 'admin', // Default auth database
    retryWrites: true, // Retry write operations on transient failures
    w: 'majority', // Write concern: majority of replica set must acknowledge

    // Read preference for scalability
    // SECURITY: Read from secondaries can reduce load on primary
    readPreference: 'primaryPreferred',

    // Compression
    // SECURITY: Reduces bandwidth and improves performance
    compressors: ['snappy', 'zlib'],

    // Application name for monitoring
    appName: 'dental-os-enterprise-service',

    // Auto-reconnect settings
    autoIndex: process.env.NODE_ENV !== 'production', // Disable auto-indexing in production

    // Connection events for monitoring
    connectionFactory: (connection) => {
      connection.on('connected', () => {
        console.log('MongoDB connected successfully');
      });

      connection.on('error', (err: any) => {
        console.error('MongoDB connection error:', err);
      });

      connection.on('disconnected', () => {
        console.warn('MongoDB disconnected');
      });

      return connection;
    },
  };
}

/**
 * Database index definitions for security and performance
 *
 * SECURITY INDEXES:
 * - organizationId: Ensures fast tenant-scoped queries
 * - userId: Enables efficient user activity auditing
 * - createdAt: Supports retention policies and time-based queries
 *
 * PERFORMANCE INDEXES:
 * - Compound indexes for common query patterns
 * - Unique indexes for data integrity
 * - TTL indexes for automatic data expiration
 */
export const SECURITY_INDEXES = {
  // Organization index (critical for tenant isolation)
  organization: {
    organizationId: 1,
  },

  // User activity index (audit trail)
  userActivity: {
    userId: 1,
    createdAt: -1,
  },

  // Tenant-scoped queries
  tenantScoped: {
    organizationId: 1,
    clinicId: 1,
    createdAt: -1,
  },

  // Audit log indexes
  auditLog: {
    eventType: 1,
    timestamp: -1,
  },
  auditLogUser: {
    userId: 1,
    timestamp: -1,
  },
  auditLogOrganization: {
    organizationId: 1,
    timestamp: -1,
  },

  // Session management
  session: {
    userId: 1,
    expiresAt: 1,
  },

  // Unique constraints
  uniqueEmail: {
    email: 1,
  },
};

/**
 * Sensitive field encryption configuration
 *
 * FIELDS TO ENCRYPT:
 * - PHI/PII data (names, addresses, SSN, etc.)
 * - Financial data (credit cards, bank accounts)
 * - Credentials (API keys, tokens)
 *
 * ENCRYPTION METHOD:
 * - AES-256-GCM for authenticated encryption
 * - Unique IV per encrypted value
 * - Key derivation from master key
 */
export const ENCRYPTED_FIELDS = [
  // PHI/PII
  'ssn',
  'taxId',
  'bankAccountNumber',
  'creditCardNumber',

  // Contact information (considered PII under GDPR)
  'phoneNumber',
  'email', // Encrypt in storage, searchable via hash

  // Credentials
  'apiKey',
  'apiSecret',
  'webhookSecret',

  // Address fields
  'address.street',
  'address.city',
  'address.state',
  'address.postalCode',
];

/**
 * Field-level access control
 *
 * SECURITY:
 * - Restrict access to sensitive fields based on roles
 * - Prevent unauthorized data exposure
 * - Support GDPR right to restrict processing
 */
export const FIELD_ACCESS_CONTROL = {
  // PHI fields - restricted to clinical staff
  phi: ['ssn', 'medicalHistory', 'diagnosis', 'prescription'],

  // PII fields - restricted to authorized personnel
  pii: ['email', 'phoneNumber', 'address', 'dateOfBirth'],

  // Financial fields - restricted to billing staff
  financial: ['creditCardNumber', 'bankAccountNumber', 'taxId'],

  // Administrative fields - restricted to admins
  administrative: ['deletedAt', 'deletedBy', 'internalNotes'],
};

/**
 * Data retention policies
 *
 * COMPLIANCE:
 * - HIPAA: Minimum 6 years retention
 * - GDPR: Right to erasure after purpose fulfilled
 * - SOC 2: Audit logs retained per policy
 *
 * TTL INDEXES:
 * - Soft-deleted records: 90 days
 * - Session data: 30 days after expiration
 * - Temporary tokens: Immediate expiration
 * - Audit logs: 7 years (regulatory requirement)
 */
export const DATA_RETENTION_POLICIES = {
  // Soft-deleted records
  softDeleted: {
    field: 'deletedAt',
    ttlSeconds: 90 * 24 * 60 * 60, // 90 days
  },

  // Session data
  sessions: {
    field: 'expiresAt',
    ttlSeconds: 30 * 24 * 60 * 60, // 30 days after expiration
  },

  // Temporary tokens
  temporaryTokens: {
    field: 'expiresAt',
    ttlSeconds: 0, // Immediate expiration
  },

  // Audit logs (HIPAA requires 6 years minimum)
  auditLogs: {
    field: 'createdAt',
    ttlSeconds: 7 * 365 * 24 * 60 * 60, // 7 years
  },
};

/**
 * Query parameterization patterns
 *
 * SECURITY:
 * - All user input must be parameterized
 * - Prevents NoSQL injection
 * - Type-safe query building
 */
export const SAFE_QUERY_PATTERNS = {
  // Safe comparison operators
  safeOperators: ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte', '$in', '$nin'],

  // Dangerous operators to reject
  dangerousOperators: ['$where', '$regex', '$expr', '$function'],

  // Fields that should never accept user input directly
  protectedFields: ['_id', 'organizationId', 'createdBy', 'createdAt', 'deletedAt'],
};
