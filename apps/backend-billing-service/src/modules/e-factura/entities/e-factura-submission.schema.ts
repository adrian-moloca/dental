import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * E-Factura Submission Status
 *
 * Represents the lifecycle states of an e-factura submission to ANAF.
 */
export enum EFacturaSubmissionStatus {
  /** Initial state - submission created but not yet sent to ANAF */
  PENDING = 'PENDING',
  /** XML submitted to ANAF, awaiting processing */
  SUBMITTED = 'SUBMITTED',
  /** ANAF is processing the submission */
  PROCESSING = 'PROCESSING',
  /** ANAF validated the invoice successfully */
  VALIDATED = 'VALIDATED',
  /** ANAF signed the invoice - final successful state */
  SIGNED = 'SIGNED',
  /** ANAF rejected the invoice due to validation errors */
  REJECTED = 'REJECTED',
  /** Technical error occurred during submission */
  ERROR = 'ERROR',
  /** Submission was manually cancelled */
  CANCELLED = 'CANCELLED',
}

/**
 * Validation Error Structure
 * Stores ANAF validation errors with field-level detail
 */
export interface ValidationError {
  /** ANAF error code */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Field or XPath that caused the error */
  field?: string;
}

/**
 * E-Factura Submission Schema
 *
 * Tracks the submission of invoices to Romania's ANAF e-factura system.
 * This is a critical compliance record and must be preserved for audit purposes.
 *
 * Key responsibilities:
 * - Track submission lifecycle (pending -> submitted -> validated/rejected)
 * - Store ANAF-assigned identifiers (upload index, download ID)
 * - Maintain XML content for auditing
 * - Handle retries and error logging
 * - Ensure idempotent submissions
 */
@Schema({
  collection: 'e_factura_submissions',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc: Document, ret: Record<string, unknown>): Record<string, unknown> => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class EFacturaSubmission extends Document {
  /**
   * Reference to the source invoice
   */
  @Prop({ type: Types.ObjectId, ref: 'Invoice', required: true, index: true })
  invoiceId!: Types.ObjectId;

  /**
   * Invoice number (denormalized for quick lookups)
   */
  @Prop({ type: String, required: true, index: true })
  invoiceNumber!: string;

  /**
   * Invoice series (for multi-location/multi-series support)
   */
  @Prop({ type: String })
  invoiceSeries?: string;

  /**
   * ANAF Upload Index (id_incarcare)
   * Assigned by ANAF upon successful upload
   * Used for status checks and tracking
   */
  @Prop({ type: String, sparse: true, index: true })
  uploadIndex?: string;

  /**
   * ANAF Download ID (id_descarcare)
   * Assigned by ANAF after successful validation
   * Used to download the signed invoice
   */
  @Prop({ type: String, sparse: true })
  downloadId?: string;

  /**
   * Current submission status
   */
  @Prop({
    type: String,
    enum: Object.values(EFacturaSubmissionStatus),
    default: EFacturaSubmissionStatus.PENDING,
    required: true,
    index: true,
  })
  status!: EFacturaSubmissionStatus;

  /**
   * Timestamp when submitted to ANAF
   */
  @Prop({ type: Date, index: true })
  submittedAt?: Date;

  /**
   * Timestamp when ANAF validated the invoice
   */
  @Prop({ type: Date })
  validatedAt?: Date;

  /**
   * Timestamp when ANAF signed the invoice
   */
  @Prop({ type: Date })
  signedAt?: Date;

  /**
   * Original XML content sent to ANAF
   * Stored for audit and debugging purposes
   */
  @Prop({ type: String })
  xmlContent?: string;

  /**
   * Signed XML content received from ANAF
   * Contains ANAF's digital signature
   */
  @Prop({ type: String })
  signedXmlContent?: string;

  /**
   * Validation errors returned by ANAF
   */
  @Prop(
    raw([
      {
        code: { type: String, required: true },
        message: { type: String, required: true },
        field: { type: String },
      },
    ]),
  )
  validationErrors?: ValidationError[];

  /**
   * Last error message (for quick access)
   */
  @Prop({ type: String })
  lastErrorMessage?: string;

  /**
   * Number of retry attempts made
   */
  @Prop({ type: Number, default: 0 })
  retryCount!: number;

  /**
   * Timestamp of last retry attempt
   */
  @Prop({ type: Date })
  lastRetryAt?: Date;

  /**
   * Scheduled time for next retry
   * Used by the retry scheduler
   */
  @Prop({ type: Date, index: true })
  nextRetryAt?: Date;

  /**
   * Idempotency key to prevent duplicate submissions
   * Format: {tenantId}:{invoiceId}:{timestamp or version}
   */
  @Prop({ type: String, required: true, unique: true })
  idempotencyKey!: string;

  /**
   * Correlation ID for distributed tracing
   */
  @Prop({ type: String })
  correlationId?: string;

  // ============================================
  // Multi-tenancy Fields
  // ============================================

  /**
   * Tenant identifier for data isolation
   */
  @Prop({ type: String, required: true, index: true })
  tenantId!: string;

  /**
   * Organization within tenant
   */
  @Prop({ type: String, required: true, index: true })
  organizationId!: string;

  /**
   * Clinic that issued the invoice
   */
  @Prop({ type: String, required: true, index: true })
  clinicId!: string;

  /**
   * Seller CUI (Cod Unic de Identificare)
   * Romanian tax identification number
   * Used for token lookup and ANAF API calls
   */
  @Prop({ type: String, required: true, index: true })
  sellerCui!: string;

  /**
   * Buyer CUI (for B2B invoices)
   */
  @Prop({ type: String, index: true })
  buyerCui?: string;

  // ============================================
  // Audit Fields
  // ============================================

  /**
   * User who initiated the submission
   */
  @Prop({ type: String })
  createdBy?: string;

  /**
   * User who last updated the submission
   */
  @Prop({ type: String })
  updatedBy?: string;

  /**
   * Reason for cancellation (if cancelled)
   */
  @Prop({ type: String })
  cancellationReason?: string;

  /**
   * User who cancelled the submission
   */
  @Prop({ type: String })
  cancelledBy?: string;

  /**
   * Timestamp when cancelled
   */
  @Prop({ type: Date })
  cancelledAt?: Date;

  // ============================================
  // Additional Metadata
  // ============================================

  /**
   * Total invoice amount (for reference)
   */
  @Prop({ type: Number })
  invoiceTotal?: number;

  /**
   * Currency code
   */
  @Prop({ type: String, default: 'RON' })
  currency!: string;

  /**
   * Whether this is a test submission
   */
  @Prop({ type: Boolean, default: false })
  isTest!: boolean;

  /**
   * Schema version for migrations
   */
  @Prop({ type: Number, default: 1 })
  schemaVersion!: number;

  /**
   * Timestamp when created (managed by Mongoose timestamps option)
   */
  createdAt!: Date;

  /**
   * Timestamp when last updated (managed by Mongoose timestamps option)
   */
  updatedAt!: Date;
}

export const EFacturaSubmissionSchema = SchemaFactory.createForClass(EFacturaSubmission);

// ============================================
// Indexes
// ============================================

// Compound index for tenant-scoped queries
EFacturaSubmissionSchema.index(
  { tenantId: 1, organizationId: 1, clinicId: 1 },
  { name: 'idx_tenant_scope' },
);

// Index for finding pending/retryable submissions
EFacturaSubmissionSchema.index({ status: 1, nextRetryAt: 1 }, { name: 'idx_retry_queue' });

// Index for status queries by tenant
EFacturaSubmissionSchema.index({ tenantId: 1, status: 1 }, { name: 'idx_tenant_status' });

// Index for invoice lookup
EFacturaSubmissionSchema.index({ invoiceId: 1, status: 1 }, { name: 'idx_invoice_status' });

// Index for CUI-based queries (e.g., all submissions for a seller)
EFacturaSubmissionSchema.index(
  { sellerCui: 1, submittedAt: -1 },
  { name: 'idx_seller_submissions' },
);

// Text index for searching invoice numbers
EFacturaSubmissionSchema.index({ invoiceNumber: 'text' }, { name: 'idx_invoice_number_text' });

// TTL index for cleanup (optional - only if you want auto-deletion of old records)
// Note: Financial records should typically be retained for 10 years in Romania
// Uncomment only if you have a separate archiving strategy
// EFacturaSubmissionSchema.index(
//   { createdAt: 1 },
//   { expireAfterSeconds: 10 * 365 * 24 * 60 * 60, name: 'idx_ttl_cleanup' }
// );

// ============================================
// Virtual Properties
// ============================================

/**
 * Virtual property to check if submission is in a terminal state
 */
EFacturaSubmissionSchema.virtual('isTerminal').get(function (this: EFacturaSubmission) {
  return [
    EFacturaSubmissionStatus.SIGNED,
    EFacturaSubmissionStatus.REJECTED,
    EFacturaSubmissionStatus.CANCELLED,
  ].includes(this.status);
});

/**
 * Virtual property to check if submission can be retried
 */
EFacturaSubmissionSchema.virtual('canRetry').get(function (this: EFacturaSubmission) {
  return [EFacturaSubmissionStatus.ERROR, EFacturaSubmissionStatus.PENDING].includes(this.status);
});

// ============================================
// Pre-save Middleware
// ============================================

EFacturaSubmissionSchema.pre('save', function (next) {
  // Ensure schemaVersion is set
  if (!this.schemaVersion) {
    this.schemaVersion = 1;
  }

  // Update timestamps based on status changes
  if (this.isModified('status')) {
    const now = new Date();

    switch (this.status) {
      case EFacturaSubmissionStatus.SUBMITTED:
        if (!this.submittedAt) {
          this.submittedAt = now;
        }
        break;
      case EFacturaSubmissionStatus.VALIDATED:
        if (!this.validatedAt) {
          this.validatedAt = now;
        }
        break;
      case EFacturaSubmissionStatus.SIGNED:
        if (!this.signedAt) {
          this.signedAt = now;
        }
        break;
      case EFacturaSubmissionStatus.CANCELLED:
        if (!this.cancelledAt) {
          this.cancelledAt = now;
        }
        break;
    }
  }

  next();
});
