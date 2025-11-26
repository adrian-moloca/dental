import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * E-Factura Log Action Types
 *
 * Represents the different types of actions that can be logged
 * for audit and debugging purposes.
 */
export enum EFacturaLogAction {
  /** Initial submission to ANAF */
  SUBMIT = 'SUBMIT',
  /** Status check API call */
  STATUS_CHECK = 'STATUS_CHECK',
  /** Download signed invoice */
  DOWNLOAD = 'DOWNLOAD',
  /** Retry submission */
  RETRY = 'RETRY',
  /** Cancel submission */
  CANCEL = 'CANCEL',
  /** Validation error received */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  /** API error occurred */
  API_ERROR = 'API_ERROR',
  /** XML generation */
  XML_GENERATION = 'XML_GENERATION',
  /** OAuth token refresh */
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  /** Manual status update */
  MANUAL_UPDATE = 'MANUAL_UPDATE',
}

/**
 * E-Factura Log Schema
 *
 * Immutable audit log for all E-Factura operations.
 * This log is critical for:
 * - Debugging integration issues with ANAF
 * - Audit compliance
 * - Performance monitoring
 * - Error analysis and reporting
 *
 * Note: This collection should be append-only. Never update or delete log entries.
 */
@Schema({
  collection: 'e_factura_logs',
  timestamps: { createdAt: true, updatedAt: false }, // Only createdAt, logs are immutable
  toJSON: {
    virtuals: true,
    transform: (_doc: Document, ret: Record<string, unknown>): Record<string, unknown> => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      // Sanitize sensitive data in response
      if (ret.requestPayload) {
        ret.requestPayload = '[SANITIZED]';
      }
      return ret;
    },
  },
})
export class EFacturaLog extends Document {
  /**
   * Reference to the E-Factura submission
   */
  @Prop({ type: Types.ObjectId, ref: 'EFacturaSubmission', required: true, index: true })
  submissionId!: Types.ObjectId;

  /**
   * Type of action being logged
   */
  @Prop({
    type: String,
    enum: Object.values(EFacturaLogAction),
    required: true,
    index: true,
  })
  action!: EFacturaLogAction;

  /**
   * URL of the API endpoint called (if applicable)
   */
  @Prop({ type: String })
  requestUrl?: string;

  /**
   * HTTP method used
   */
  @Prop({ type: String })
  requestMethod?: string;

  /**
   * Request payload (sanitized - no sensitive data)
   * Stored as a JSON object for flexibility
   */
  @Prop(raw({}))
  requestPayload?: Record<string, unknown>;

  /**
   * Request headers (sanitized - no auth tokens)
   */
  @Prop(raw({}))
  requestHeaders?: Record<string, string>;

  /**
   * HTTP status code from response
   */
  @Prop({ type: Number })
  responseStatusCode?: number;

  /**
   * Response body (sanitized)
   * Stored as a JSON object for flexibility
   */
  @Prop(raw({}))
  responseBody?: Record<string, unknown>;

  /**
   * Duration of the operation in milliseconds
   */
  @Prop({ type: Number })
  durationMs?: number;

  /**
   * Error message if operation failed
   */
  @Prop({ type: String })
  errorMessage?: string;

  /**
   * Error stack trace (for debugging, only in non-production)
   */
  @Prop({ type: String })
  errorStack?: string;

  /**
   * Error code (ANAF error code or internal error code)
   */
  @Prop({ type: String })
  errorCode?: string;

  /**
   * Correlation ID for distributed tracing
   * Links this log entry to the broader request context
   */
  @Prop({ type: String, index: true })
  correlationId?: string;

  /**
   * Whether the operation was successful
   */
  @Prop({ type: Boolean, required: true })
  success!: boolean;

  // ============================================
  // Multi-tenancy Fields
  // ============================================

  /**
   * Tenant identifier
   */
  @Prop({ type: String, required: true, index: true })
  tenantId!: string;

  /**
   * Organization identifier
   */
  @Prop({ type: String, required: true, index: true })
  organizationId!: string;

  // ============================================
  // Additional Context
  // ============================================

  /**
   * User who performed the action (if manual)
   */
  @Prop({ type: String })
  performedBy?: string;

  /**
   * Invoice number (denormalized for searching)
   */
  @Prop({ type: String, index: true })
  invoiceNumber?: string;

  /**
   * ANAF upload index (denormalized for searching)
   */
  @Prop({ type: String, index: true })
  uploadIndex?: string;

  /**
   * IP address of the server making the request
   */
  @Prop({ type: String })
  serverIp?: string;

  /**
   * Environment indicator
   */
  @Prop({ type: String, enum: ['test', 'production'] })
  environment?: string;

  /**
   * Additional metadata for debugging
   */
  @Prop(raw({}))
  metadata?: Record<string, unknown>;

  /**
   * Schema version for migrations
   */
  @Prop({ type: Number, default: 1 })
  schemaVersion!: number;

  /**
   * Timestamp when created (managed by Mongoose timestamps option)
   */
  createdAt!: Date;
}

export const EFacturaLogSchema = SchemaFactory.createForClass(EFacturaLog);

// ============================================
// Indexes
// ============================================

// Compound index for tenant-scoped queries with time ordering
EFacturaLogSchema.index(
  { tenantId: 1, organizationId: 1, createdAt: -1 },
  { name: 'idx_tenant_logs_time' },
);

// Index for submission-based queries
EFacturaLogSchema.index({ submissionId: 1, createdAt: -1 }, { name: 'idx_submission_logs' });

// Index for action-based queries (e.g., find all errors)
EFacturaLogSchema.index({ action: 1, success: 1, createdAt: -1 }, { name: 'idx_action_success' });

// Index for correlation ID lookups
EFacturaLogSchema.index({ correlationId: 1 }, { name: 'idx_correlation', sparse: true });

// Index for invoice number lookups
EFacturaLogSchema.index({ invoiceNumber: 1, createdAt: -1 }, { name: 'idx_invoice_logs' });

// Index for error analysis
EFacturaLogSchema.index(
  { success: 1, errorCode: 1, createdAt: -1 },
  { name: 'idx_errors', sparse: true },
);

// Time-based index for recent logs (for dashboards)
EFacturaLogSchema.index({ createdAt: -1 }, { name: 'idx_recent_logs' });

// TTL index for automatic cleanup of old logs
// Keep logs for 2 years (legal requirement in Romania is typically 10 years for financial records,
// but detailed debug logs can be archived after 2 years)
// Note: Adjust this based on your retention policy
EFacturaLogSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 2 * 365 * 24 * 60 * 60, // 2 years
    name: 'idx_ttl_logs',
  },
);

// ============================================
// Static Methods
// ============================================

/**
 * Create a log entry from an HTTP request/response
 */
EFacturaLogSchema.statics.createFromHttpCall = function (params: {
  submissionId: Types.ObjectId;
  action: EFacturaLogAction;
  tenantId: string;
  organizationId: string;
  request: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: unknown;
  };
  response?: {
    status: number;
    body?: unknown;
  };
  durationMs: number;
  success: boolean;
  error?: Error;
  correlationId?: string;
  invoiceNumber?: string;
  uploadIndex?: string;
}) {
  // Sanitize headers - remove authorization
  const sanitizedHeaders = params.request.headers
    ? Object.fromEntries(
        Object.entries(params.request.headers).filter(
          ([key]) => !['authorization', 'cookie'].includes(key.toLowerCase()),
        ),
      )
    : undefined;

  // Sanitize request body - remove sensitive fields
  const sanitizedPayload = params.request.body
    ? sanitizePayload(params.request.body as Record<string, unknown>)
    : undefined;

  return new this({
    submissionId: params.submissionId,
    action: params.action,
    tenantId: params.tenantId,
    organizationId: params.organizationId,
    requestUrl: params.request.url,
    requestMethod: params.request.method,
    requestHeaders: sanitizedHeaders,
    requestPayload: sanitizedPayload,
    responseStatusCode: params.response?.status,
    responseBody: params.response?.body as Record<string, unknown>,
    durationMs: params.durationMs,
    success: params.success,
    errorMessage: params.error?.message,
    errorStack: process.env.NODE_ENV !== 'production' ? params.error?.stack : undefined,
    correlationId: params.correlationId,
    invoiceNumber: params.invoiceNumber,
    uploadIndex: params.uploadIndex,
  });
};

/**
 * Sanitize payload to remove sensitive data
 */
function sanitizePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = [
    'password',
    'secret',
    'token',
    'apiKey',
    'api_key',
    'authorization',
    'credit_card',
    'creditCard',
    'cnp',
    'nationalId',
  ];

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizePayload(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// ============================================
// Type Declarations
// ============================================

export interface EFacturaLogModel extends Document {
  createFromHttpCall: (params: {
    submissionId: Types.ObjectId;
    action: EFacturaLogAction;
    tenantId: string;
    organizationId: string;
    request: {
      url: string;
      method: string;
      headers?: Record<string, string>;
      body?: unknown;
    };
    response?: {
      status: number;
      body?: unknown;
    };
    durationMs: number;
    success: boolean;
    error?: Error;
    correlationId?: string;
    invoiceNumber?: string;
    uploadIndex?: string;
  }) => EFacturaLog;
}
