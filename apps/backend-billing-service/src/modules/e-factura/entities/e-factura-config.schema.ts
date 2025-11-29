import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * E-Factura Configuration Status
 * Tracks whether the configuration is active and ready for use
 */
export enum EFacturaConfigStatus {
  /** Configuration created but not yet verified */
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  /** OAuth authorization needed */
  PENDING_AUTHORIZATION = 'PENDING_AUTHORIZATION',
  /** Configuration is active and ready */
  ACTIVE = 'ACTIVE',
  /** Configuration is disabled */
  DISABLED = 'DISABLED',
  /** OAuth token expired, needs re-authorization */
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  /** Configuration error, check errorMessage */
  ERROR = 'ERROR',
}

/**
 * Stored OAuth tokens (encrypted at rest)
 */
export interface StoredOAuthTokens {
  /** Access token for ANAF API */
  accessToken: string;
  /** Refresh token for obtaining new access tokens */
  refreshToken?: string;
  /** Token type (usually 'Bearer') */
  tokenType: string;
  /** Expiration timestamp */
  expiresAt: Date;
  /** Scope granted */
  scope?: string;
  /** When the token was obtained */
  obtainedAt: Date;
}

/**
 * Auto-submit configuration
 */
export interface AutoSubmitConfig {
  /** Whether to auto-submit invoices when issued */
  enabled: boolean;
  /** Only auto-submit B2B invoices (with buyer CUI) */
  b2bOnly: boolean;
  /** Delay in minutes before auto-submitting (allows for manual review) */
  delayMinutes: number;
  /** Maximum retry attempts for failed submissions */
  maxRetries: number;
  /** Minimum invoice amount for auto-submit (in RON) */
  minAmount?: number;
}

/**
 * Notification settings for E-Factura events
 */
export interface NotificationSettings {
  /** Email addresses to notify on acceptance */
  notifyOnAccepted: string[];
  /** Email addresses to notify on rejection */
  notifyOnRejected: string[];
  /** Email addresses to notify on errors */
  notifyOnError: string[];
  /** Whether to send daily digest instead of immediate notifications */
  dailyDigest: boolean;
}

/**
 * E-Factura Configuration Schema
 *
 * Stores per-tenant/organization configuration for E-Factura integration.
 * This includes:
 * - ANAF OAuth credentials and tokens
 * - Company fiscal information
 * - Auto-submit settings
 * - Notification preferences
 *
 * Security Notes:
 * - OAuth tokens are encrypted at rest using field-level encryption
 * - Certificate passwords are never stored in plain text
 * - Access to this collection should be restricted to admin roles
 */
@Schema({
  collection: 'e_factura_configs',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc: Document, ret: Record<string, unknown>): Record<string, unknown> => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      // Never expose tokens in JSON response
      delete ret.oauthTokens;
      delete ret.certificatePassword;
      return ret;
    },
  },
})
export class EFacturaConfig extends Document {
  // ============================================
  // Multi-tenancy and Identity
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

  /**
   * Clinic identifier (optional - for clinic-specific config)
   */
  @Prop({ type: String, index: true })
  clinicId?: string;

  // ============================================
  // Configuration Status
  // ============================================

  /**
   * Current status of the E-Factura configuration
   */
  @Prop({
    type: String,
    enum: Object.values(EFacturaConfigStatus),
    default: EFacturaConfigStatus.PENDING_AUTHORIZATION,
    index: true,
  })
  status!: EFacturaConfigStatus;

  /**
   * Whether E-Factura integration is enabled
   */
  @Prop({ type: Boolean, default: false })
  enabled!: boolean;

  /**
   * Error message if status is ERROR
   */
  @Prop({ type: String })
  errorMessage?: string;

  // ============================================
  // Company Fiscal Information
  // ============================================

  /**
   * CUI (Cod Unic de Identificare) - Romanian tax ID
   * Format: RO followed by 2-10 digits (e.g., RO12345678)
   */
  @Prop({ type: String, required: true, index: true })
  cui!: string;

  /**
   * Company legal name (as registered)
   */
  @Prop({ type: String, required: true })
  companyName!: string;

  /**
   * Trade/commercial name (if different from legal name)
   */
  @Prop({ type: String })
  tradeName?: string;

  /**
   * Registration number from Trade Registry (Registrul Comertului)
   * Format: Jxx/xxxx/xxxx
   */
  @Prop({ type: String })
  registrationNumber?: string;

  /**
   * Company address for invoices
   */
  @Prop(
    raw({
      streetName: { type: String, required: true },
      additionalStreetName: { type: String },
      city: { type: String, required: true },
      county: { type: String },
      postalCode: { type: String },
      countryCode: { type: String, default: 'RO' },
    }),
  )
  address!: {
    streetName: string;
    additionalStreetName?: string;
    city: string;
    county?: string;
    postalCode?: string;
    countryCode: string;
  };

  /**
   * Contact information
   */
  @Prop(
    raw({
      name: { type: String },
      phone: { type: String },
      email: { type: String },
    }),
  )
  contact?: {
    name?: string;
    phone?: string;
    email?: string;
  };

  /**
   * Bank account information for payment
   */
  @Prop(
    raw({
      iban: { type: String },
      bankName: { type: String },
      swift: { type: String },
    }),
  )
  bankAccount?: {
    iban?: string;
    bankName?: string;
    swift?: string;
  };

  // ============================================
  // OAuth Configuration
  // ============================================

  /**
   * OAuth client ID from ANAF
   */
  @Prop({ type: String })
  oauthClientId?: string;

  /**
   * OAuth client secret (encrypted)
   */
  @Prop({ type: String })
  oauthClientSecret?: string;

  /**
   * OAuth redirect URI
   */
  @Prop({ type: String })
  oauthRedirectUri?: string;

  /**
   * Stored OAuth tokens (encrypted at rest)
   * These are the actual access/refresh tokens obtained from ANAF
   */
  @Prop(
    raw({
      accessToken: { type: String },
      refreshToken: { type: String },
      tokenType: { type: String },
      expiresAt: { type: Date },
      scope: { type: String },
      obtainedAt: { type: Date },
    }),
  )
  oauthTokens?: StoredOAuthTokens;

  // ============================================
  // Certificate Configuration
  // ============================================

  /**
   * Path to PFX/P12 certificate file
   * For production, this should be a reference to a secrets manager
   */
  @Prop({ type: String })
  certificatePath?: string;

  /**
   * Certificate password (encrypted)
   */
  @Prop({ type: String })
  certificatePassword?: string;

  /**
   * Certificate expiration date
   */
  @Prop({ type: Date })
  certificateExpiresAt?: Date;

  // ============================================
  // Environment Configuration
  // ============================================

  /**
   * Whether to use ANAF test environment
   * true = api.anaf.ro/test
   * false = api.anaf.ro/prod
   */
  @Prop({ type: Boolean, default: true })
  useTestEnvironment!: boolean;

  // ============================================
  // Auto-Submit Configuration
  // ============================================

  /**
   * Auto-submit settings for invoices
   */
  @Prop(
    raw({
      enabled: { type: Boolean, default: false },
      b2bOnly: { type: Boolean, default: true },
      delayMinutes: { type: Number, default: 0 },
      maxRetries: { type: Number, default: 3 },
      minAmount: { type: Number },
    }),
  )
  autoSubmit!: AutoSubmitConfig;

  // ============================================
  // Notification Settings
  // ============================================

  /**
   * Email notification settings
   */
  @Prop(
    raw({
      notifyOnAccepted: [{ type: String }],
      notifyOnRejected: [{ type: String }],
      notifyOnError: [{ type: String }],
      dailyDigest: { type: Boolean, default: false },
    }),
  )
  notifications?: NotificationSettings;

  // ============================================
  // Rate Limiting
  // ============================================

  /**
   * Maximum submissions per minute (ANAF limit is 100)
   */
  @Prop({ type: Number, default: 50 })
  maxSubmissionsPerMinute!: number;

  /**
   * Maximum status checks per minute
   */
  @Prop({ type: Number, default: 100 })
  maxStatusChecksPerMinute!: number;

  // ============================================
  // Retry Configuration
  // ============================================

  /**
   * Maximum retry attempts for failed submissions
   */
  @Prop({ type: Number, default: 3 })
  maxRetries!: number;

  /**
   * Base delay for retry backoff (in milliseconds)
   */
  @Prop({ type: Number, default: 60000 })
  retryBaseDelayMs!: number;

  /**
   * Maximum delay for retry backoff (in milliseconds)
   */
  @Prop({ type: Number, default: 3600000 })
  retryMaxDelayMs!: number;

  // ============================================
  // Statistics
  // ============================================

  /**
   * Total number of successful submissions
   */
  @Prop({ type: Number, default: 0 })
  totalSubmissions!: number;

  /**
   * Total number of accepted invoices
   */
  @Prop({ type: Number, default: 0 })
  totalAccepted!: number;

  /**
   * Total number of rejected invoices
   */
  @Prop({ type: Number, default: 0 })
  totalRejected!: number;

  /**
   * Last successful submission timestamp
   */
  @Prop({ type: Date })
  lastSubmissionAt?: Date;

  /**
   * Last error timestamp
   */
  @Prop({ type: Date })
  lastErrorAt?: Date;

  // ============================================
  // Audit Fields
  // ============================================

  /**
   * User who created the configuration
   */
  @Prop({ type: String })
  createdBy?: string;

  /**
   * User who last updated the configuration
   */
  @Prop({ type: String })
  updatedBy?: string;

  /**
   * When OAuth was last verified
   */
  @Prop({ type: Date })
  lastOAuthVerifiedAt?: Date;

  /**
   * Schema version for migrations
   */
  @Prop({ type: Number, default: 1 })
  schemaVersion!: number;

  /**
   * Timestamps managed by Mongoose
   */
  createdAt!: Date;
  updatedAt!: Date;
}

export const EFacturaConfigSchema = SchemaFactory.createForClass(EFacturaConfig);

// ============================================
// Indexes
// ============================================

// Unique constraint on tenant + organization + clinic (null clinic means org-level config)
EFacturaConfigSchema.index(
  { tenantId: 1, organizationId: 1, clinicId: 1 },
  { unique: true, name: 'idx_tenant_org_clinic_unique' },
);

// CUI lookup (for ANAF callbacks)
EFacturaConfigSchema.index({ cui: 1 }, { name: 'idx_cui' });

// Status queries (find configs needing attention)
EFacturaConfigSchema.index({ status: 1, tenantId: 1 }, { name: 'idx_status_tenant' });

// Enabled configs for auto-submit processing
EFacturaConfigSchema.index(
  { enabled: 1, 'autoSubmit.enabled': 1 },
  { name: 'idx_enabled_autosubmit' },
);

// OAuth expiry check (find configs with expiring tokens)
EFacturaConfigSchema.index(
  { 'oauthTokens.expiresAt': 1 },
  { name: 'idx_token_expiry', sparse: true },
);

// Certificate expiry check
EFacturaConfigSchema.index({ certificateExpiresAt: 1 }, { name: 'idx_cert_expiry', sparse: true });

// ============================================
// Instance Methods
// ============================================

EFacturaConfigSchema.methods.isTokenExpired = function (): boolean {
  if (!this.oauthTokens?.expiresAt) return true;
  // Add 5 minute buffer for safety
  const bufferMs = 5 * 60 * 1000;
  return new Date(this.oauthTokens.expiresAt).getTime() - bufferMs < Date.now();
};

EFacturaConfigSchema.methods.isReady = function (): boolean {
  return (
    this.enabled &&
    this.status === EFacturaConfigStatus.ACTIVE &&
    this.cui &&
    this.companyName &&
    this.address?.streetName &&
    this.address?.city &&
    !this.isTokenExpired()
  );
};

EFacturaConfigSchema.methods.needsReauthorization = function (): boolean {
  return (
    this.status === EFacturaConfigStatus.PENDING_AUTHORIZATION ||
    this.status === EFacturaConfigStatus.TOKEN_EXPIRED ||
    this.isTokenExpired()
  );
};

// ============================================
// Type declarations for methods
// ============================================

export interface EFacturaConfigMethods {
  isTokenExpired(): boolean;
  isReady(): boolean;
  needsReauthorization(): boolean;
}

export type EFacturaConfigDocument = EFacturaConfig & EFacturaConfigMethods;
