import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { InvoiceStatus } from '../../../common/types';

/**
 * E-Factura Status for invoices
 * Tracks the status of the invoice in Romania's E-Factura system
 */
export enum EFacturaStatus {
  /** Invoice not submitted to E-Factura */
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  /** Invoice is pending submission */
  PENDING = 'PENDING',
  /** Invoice has been submitted to ANAF */
  SUBMITTED = 'SUBMITTED',
  /** Invoice is being processed by ANAF */
  PROCESSING = 'PROCESSING',
  /** Invoice has been signed by ANAF */
  SIGNED = 'SIGNED',
  /** Invoice was rejected by ANAF */
  REJECTED = 'REJECTED',
  /** Submission error occurred */
  ERROR = 'ERROR',
}

/**
 * Customer business information for B2B invoices
 * Required for E-Factura submissions
 */
export interface CustomerBusiness {
  /** CUI - Cod Unic de Identificare (Romanian company tax ID) */
  cui?: string;
  /** Registration number from Trade Registry (Registrul Comertului) */
  regCom?: string;
  /** Legal company name */
  legalName: string;
  /** Trade/commercial name (if different from legal name) */
  tradeName?: string;
  /** Business address */
  address?: {
    streetName: string;
    additionalStreetName?: string;
    city: string;
    county?: string;
    postalCode?: string;
    countryCode: string;
  };
  /** Bank account (IBAN) */
  iban?: string;
  /** Bank name */
  bankName?: string;
  /** Contact email */
  email?: string;
  /** Contact phone */
  phone?: string;
}

/**
 * E-Factura information embedded in invoice
 */
export interface EFacturaInfo {
  /** Current E-Factura status */
  status: EFacturaStatus;
  /** ANAF upload index (id_incarcare) */
  uploadIndex?: string;
  /** ANAF download ID (id_descarcare) */
  downloadId?: string;
  /** Timestamp when submitted to ANAF */
  submittedAt?: Date;
  /** Timestamp when signed by ANAF */
  signedAt?: Date;
  /** Last error message if any */
  lastError?: string;
  /** Reference to EFacturaSubmission document */
  submissionId?: Types.ObjectId;
  /** Whether this invoice requires E-Factura (B2B in Romania) */
  required: boolean;
}

/**
 * Tax breakdown entry for detailed tax reporting
 * Required for E-Factura and Romanian fiscal compliance
 */
export interface TaxBreakdownEntry {
  /** Tax category code (S, E, Z, etc.) */
  taxCategory: string;
  /** Taxable amount before tax */
  taxableAmount: number;
  /** Tax amount */
  taxAmount: number;
  /** Tax rate as decimal (e.g., 0.19 for 19%) */
  taxRate: number;
  /** Tax exemption reason code (if applicable) */
  exemptionReasonCode?: string;
  /** Tax exemption reason text */
  exemptionReasonText?: string;
}

/**
 * Payment terms enumeration
 */
export enum PaymentTerms {
  DUE_ON_RECEIPT = 'due_on_receipt',
  NET_15 = 'net_15',
  NET_30 = 'net_30',
}

/**
 * Invoice line item embedded document
 * Used for quick access to line item data without separate queries
 */
export interface InvoiceLineItem {
  lineNumber: number;
  itemType: 'treatment' | 'product' | 'lab_service';
  itemCode: string; // CDT code for treatments
  description: string;
  tooth?: string;
  surfaces?: string[];
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  discountAmount: number;
  taxRate: number; // 19% for Romania
  taxAmount: number;
  lineTotal: number;
  // For commission calculation
  providerId?: string;
  commissionRate?: number;
  // Reference to original item
  referenceId?: string;
}

/**
 * Customer information for invoice
 */
export interface CustomerInfo {
  name: string;
  address?: string;
  city?: string;
  county?: string;
  postalCode?: string;
  countryCode?: string;
  phone?: string;
  email?: string;
}

@Schema({ collection: 'invoices', timestamps: true })
export class Invoice extends Document {
  @Prop({ type: String, required: true, unique: true })
  invoiceNumber!: string;

  @Prop({ type: String, required: true, index: true })
  patientId!: string;

  @Prop({ type: String, required: true, index: true })
  providerId!: string;

  @Prop({ type: String, index: true })
  appointmentId?: string;

  @Prop({ type: String })
  linkedProcedureId?: string;

  @Prop({ type: String, index: true })
  treatmentPlanId?: string;

  @Prop({
    type: String,
    enum: Object.values(InvoiceStatus),
    default: InvoiceStatus.DRAFT,
    index: true,
  })
  status!: InvoiceStatus;

  @Prop({ type: Date, required: true, index: true })
  issueDate!: Date;

  @Prop({ type: Date, required: true, index: true })
  dueDate!: Date;

  @Prop({ type: Date, index: true })
  paidDate?: Date;

  @Prop({ type: Number, required: true, default: 0 })
  subtotal!: number;

  @Prop({ type: Number, required: true, default: 0 })
  taxAmount!: number;

  @Prop({ type: Number, required: true, default: 0 })
  discountAmount!: number;

  @Prop({ type: Number, required: true, default: 0 })
  total!: number;

  @Prop({ type: Number, required: true, default: 0 })
  amountPaid!: number;

  @Prop({ type: Number, required: true, default: 0 })
  balance!: number;

  @Prop({ type: String, default: 'RON' })
  currency!: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'InvoiceItem' }], default: [] })
  items!: Types.ObjectId[];

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: String })
  terms?: string;

  // ============================================
  // Payment Terms
  // ============================================

  /**
   * Payment terms for the invoice
   */
  @Prop({
    type: String,
    enum: Object.values(PaymentTerms),
    default: PaymentTerms.DUE_ON_RECEIPT,
  })
  paymentTerms?: PaymentTerms;

  // ============================================
  // Customer Information
  // ============================================

  /**
   * Customer name (from patient record)
   */
  @Prop({ type: String })
  customerName?: string;

  /**
   * Customer address (from patient record)
   */
  @Prop({ type: String })
  customerAddress?: string;

  /**
   * Customer tax ID (CUI for Romanian companies)
   */
  @Prop({ type: String })
  customerTaxId?: string;

  /**
   * Full customer information object
   */
  @Prop(
    raw({
      name: { type: String },
      address: { type: String },
      city: { type: String },
      county: { type: String },
      postalCode: { type: String },
      countryCode: { type: String },
      phone: { type: String },
      email: { type: String },
    }),
  )
  customer?: CustomerInfo;

  // ============================================
  // Embedded Line Items (denormalized for performance)
  // ============================================

  /**
   * Embedded line items for quick access
   * These are a denormalized copy of the invoice items
   */
  @Prop(
    raw([
      {
        lineNumber: { type: Number, required: true },
        itemType: {
          type: String,
          enum: ['treatment', 'product', 'lab_service'],
          required: true,
        },
        itemCode: { type: String, required: true },
        description: { type: String, required: true },
        tooth: { type: String },
        surfaces: [{ type: String }],
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        discountPercent: { type: Number },
        discountAmount: { type: Number, default: 0 },
        taxRate: { type: Number, required: true },
        taxAmount: { type: Number, required: true },
        lineTotal: { type: Number, required: true },
        providerId: { type: String },
        commissionRate: { type: Number },
        referenceId: { type: String },
      },
    ]),
  )
  lines?: InvoiceLineItem[];

  // ============================================
  // Invoice Series and Numbering (for E-Factura)
  // ============================================

  /**
   * Invoice series (e.g., 'A', 'B', 'BUC-001')
   * Required for Romanian fiscal compliance
   * Different series can be used for different clinics or invoice types
   */
  @Prop({ type: String, index: true })
  series?: string;

  /**
   * Sequential number within the series
   * Combined with series forms the full invoice number
   */
  @Prop({ type: Number })
  sequenceNumber?: number;

  // ============================================
  // Customer Business Information (for B2B / E-Factura)
  // ============================================

  /**
   * Business customer information
   * Required when invoice is for a business (B2B)
   * Contains CUI, registration info, and address needed for E-Factura
   */
  @Prop(
    raw({
      cui: { type: String },
      regCom: { type: String },
      legalName: { type: String },
      tradeName: { type: String },
      address: {
        streetName: { type: String },
        additionalStreetName: { type: String },
        city: { type: String },
        county: { type: String },
        postalCode: { type: String },
        countryCode: { type: String },
      },
      iban: { type: String },
      bankName: { type: String },
      email: { type: String },
      phone: { type: String },
    }),
  )
  customerBusiness?: CustomerBusiness;

  // ============================================
  // E-Factura Integration
  // ============================================

  /**
   * E-Factura submission information
   * Tracks the status and identifiers for ANAF E-Factura system
   */
  @Prop(
    raw({
      status: {
        type: String,
        enum: Object.values(EFacturaStatus),
        default: EFacturaStatus.NOT_SUBMITTED,
      },
      uploadIndex: { type: String },
      downloadId: { type: String },
      submittedAt: { type: Date },
      signedAt: { type: Date },
      lastError: { type: String },
      submissionId: { type: Types.ObjectId },
      required: { type: Boolean, default: false },
    }),
  )
  eFactura?: EFacturaInfo;

  // ============================================
  // Tax Breakdown (for E-Factura and Reporting)
  // ============================================

  /**
   * Detailed tax breakdown by tax category
   * Required for E-Factura XML generation
   * Supports multiple tax rates on same invoice
   */
  @Prop(
    raw([
      {
        taxCategory: { type: String, required: true },
        taxableAmount: { type: Number, required: true },
        taxAmount: { type: Number, required: true },
        taxRate: { type: Number, required: true },
        exemptionReasonCode: { type: String },
        exemptionReasonText: { type: String },
      },
    ]),
  )
  taxBreakdown?: TaxBreakdownEntry[];

  // ============================================
  // Seller Information
  // ============================================

  /**
   * Seller CUI (company tax ID)
   * Populated from clinic/organization fiscal settings
   * Required for E-Factura submissions
   */
  @Prop({ type: String, index: true })
  sellerCui?: string;

  // Multi-tenancy
  @Prop({ type: String, required: true, index: true })
  tenantId!: string;

  @Prop({ type: String, required: true, index: true })
  organizationId!: string;

  @Prop({ type: String, required: true, index: true })
  clinicId!: string;

  // Audit fields
  @Prop({ type: String })
  createdBy?: string;

  @Prop({ type: String })
  updatedBy?: string;

  @Prop({ type: Date })
  voidedAt?: Date;

  @Prop({ type: String })
  voidedBy?: string;

  @Prop({ type: String })
  voidReason?: string;

  // ============================================
  // Send Tracking
  // ============================================

  /**
   * Timestamp when invoice was sent to patient
   */
  @Prop({ type: Date })
  sentAt?: Date;

  /**
   * User who sent the invoice
   */
  @Prop({ type: String })
  sentBy?: string;

  /**
   * Method used to send (email, print, etc.)
   */
  @Prop({ type: String })
  sentMethod?: string;

  /**
   * Email address invoice was sent to
   */
  @Prop({ type: String })
  sentToEmail?: string;

  // ============================================
  // Credit Note Reference
  // ============================================

  /**
   * Reference to original invoice if this is a credit note
   */
  @Prop({ type: String })
  originalInvoiceId?: string;

  /**
   * Whether this invoice is a credit note
   */
  @Prop({ type: Boolean, default: false })
  isCreditNote?: boolean;

  /**
   * Credit note ID if this invoice was cancelled via credit note
   */
  @Prop({ type: String })
  creditNoteId?: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

// Indexes
InvoiceSchema.index({ tenantId: 1, organizationId: 1, clinicId: 1 });
InvoiceSchema.index({ patientId: 1, status: 1 });
InvoiceSchema.index({ issueDate: -1 });
InvoiceSchema.index({ dueDate: 1, status: 1 });
InvoiceSchema.index({ linkedProcedureId: 1 }, { sparse: true }); // For procedure-to-invoice lookup

// E-Factura related indexes
InvoiceSchema.index({ series: 1, sequenceNumber: 1 }, { sparse: true }); // Series-based numbering
InvoiceSchema.index({ 'customerBusiness.cui': 1 }, { sparse: true }); // B2B customer lookup
InvoiceSchema.index({ 'eFactura.status': 1, tenantId: 1 }, { sparse: true }); // E-Factura status queries
InvoiceSchema.index({ 'eFactura.uploadIndex': 1 }, { sparse: true }); // ANAF upload index lookup
InvoiceSchema.index({ sellerCui: 1, issueDate: -1 }, { sparse: true }); // Seller-based queries
