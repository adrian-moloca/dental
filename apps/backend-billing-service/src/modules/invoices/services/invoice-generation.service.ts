/**
 * Invoice Generation Service
 *
 * Creates invoices from completed appointments and treatment plans.
 * Handles the business logic for:
 * - Fetching procedure/treatment data from clinical service
 * - Looking up prices from procedure catalog
 * - Calculating VAT (19% for Romania)
 * - Creating invoice with proper line items
 * - Triggering ledger entries
 *
 * Romanian VAT Rules:
 * - Standard rate: 19% for most services
 * - Some medical services may be VAT exempt under certain conditions
 */

import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { Invoice, PaymentTerms, InvoiceLineItem } from '../entities/invoice.entity';
import { InvoiceItem } from '../../invoice-items/entities/invoice-item.entity';
import { InvoiceNumberGeneratorService } from './invoice-number-generator.service';
import { LedgerService } from '../../ledger/ledger.service';
import { InvoiceStatus, InvoiceItemType } from '../../../common/types';
import { Money, calculateTax } from '../../../common/utils/money.utils';
import { createInvoiceCreatedEvent, InvoiceCreatedPayload } from '@dentalos/shared-events';

interface TenantContext {
  tenantId: string;
  organizationId: string;
  clinicId: string;
  userId?: string;
}

/**
 * Procedure data received from clinical service
 */
export interface ProcedureData {
  procedureId: string;
  procedureCode: string;
  procedureName: string;
  tooth?: string;
  surfaces?: string[];
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  providerId?: string;
  commissionRate?: number;
  taxExempt?: boolean;
  taxExemptionReason?: string;
}

/**
 * Appointment data for invoice generation
 */
export interface AppointmentData {
  appointmentId: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  completedAt: string;
  procedures: ProcedureData[];
  treatmentPlanId?: string;
  customerName?: string;
  customerAddress?: string;
  customerTaxId?: string;
  customerEmail?: string;
}

/**
 * Options for invoice generation
 */
export interface InvoiceGenerationOptions {
  /** Custom invoice series (defaults to clinic code) */
  series?: string;
  /** Payment terms (defaults to DUE_ON_RECEIPT) */
  paymentTerms?: PaymentTerms;
  /** Due date (calculated from payment terms if not provided) */
  dueDate?: Date;
  /** Invoice notes */
  notes?: string;
  /** Whether to auto-issue the invoice (defaults to false) */
  autoIssue?: boolean;
  /** Default tax rate (defaults to 0.19 for Romania) */
  defaultTaxRate?: number;
  /** Currency (defaults to RON) */
  currency?: string;
}

/**
 * Result of invoice generation
 */
export interface InvoiceGenerationResult {
  invoice: Invoice;
  invoiceItems: InvoiceItem[];
  warnings: string[];
}

@Injectable()
export class InvoiceGenerationService {
  private readonly logger = new Logger(InvoiceGenerationService.name);
  private readonly DEFAULT_TAX_RATE = 0.19; // Romanian VAT
  private readonly DEFAULT_CURRENCY = 'RON';

  constructor(
    @InjectModel(Invoice.name)
    private invoiceModel: Model<Invoice>,
    @InjectModel(InvoiceItem.name)
    private invoiceItemModel: Model<InvoiceItem>,
    private invoiceNumberGenerator: InvoiceNumberGeneratorService,
    private ledgerService: LedgerService,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
  ) {}

  /**
   * Create an invoice from a completed appointment
   *
   * @param appointmentData - Data from the completed appointment
   * @param options - Generation options
   * @param context - Tenant context
   * @returns Generated invoice with line items
   */
  async createFromAppointment(
    appointmentData: AppointmentData,
    options: InvoiceGenerationOptions = {},
    context: TenantContext,
  ): Promise<InvoiceGenerationResult> {
    const startTime = Date.now();
    const warnings: string[] = [];

    this.logger.log(`Creating invoice from appointment ${appointmentData.appointmentId}`);

    // Validate input
    this.validateAppointmentData(appointmentData);

    // Check for duplicate invoice
    const existingInvoice = await this.checkForDuplicate(appointmentData.appointmentId, context);
    if (existingInvoice) {
      throw new BadRequestException(
        `Invoice already exists for appointment ${appointmentData.appointmentId}: ${existingInvoice.invoiceNumber}`,
      );
    }

    // Generate invoice number
    const series = options.series || this.getClinicSeries(context.clinicId);
    const numberResult = await this.invoiceNumberGenerator.generateNextNumber(series, context);

    // Calculate dates
    const issueDate = new Date();
    const dueDate =
      options.dueDate ||
      this.calculateDueDate(issueDate, options.paymentTerms || PaymentTerms.DUE_ON_RECEIPT);

    // Calculate line items and totals
    const { lines, subtotal, taxAmount, discountAmount, total, taxBreakdown } =
      this.calculateInvoiceTotals(
        appointmentData.procedures,
        options.defaultTaxRate ?? this.DEFAULT_TAX_RATE,
      );

    // Validate totals
    if (total.isZero() || total.isNegative()) {
      warnings.push('Invoice total is zero or negative');
    }

    // Create invoice document
    const invoice = new this.invoiceModel({
      invoiceNumber: numberResult.invoiceNumber,
      series: numberResult.series,
      sequenceNumber: numberResult.sequenceNumber,
      patientId: appointmentData.patientId,
      providerId: appointmentData.providerId,
      appointmentId: appointmentData.appointmentId,
      treatmentPlanId: appointmentData.treatmentPlanId,
      status: InvoiceStatus.DRAFT,
      issueDate,
      dueDate,
      paymentTerms: options.paymentTerms || PaymentTerms.DUE_ON_RECEIPT,
      currency: options.currency || this.DEFAULT_CURRENCY,
      subtotal: subtotal.toNumber(),
      taxAmount: taxAmount.toNumber(),
      discountAmount: discountAmount.toNumber(),
      total: total.toNumber(),
      amountPaid: 0,
      balance: total.toNumber(),
      customerName: appointmentData.customerName || appointmentData.patientName,
      customerAddress: appointmentData.customerAddress,
      customerTaxId: appointmentData.customerTaxId,
      customer: {
        name: appointmentData.customerName || appointmentData.patientName,
        address: appointmentData.customerAddress,
        email: appointmentData.customerEmail,
      },
      lines,
      taxBreakdown,
      notes: options.notes,
      items: [],
      tenantId: context.tenantId,
      organizationId: context.organizationId,
      clinicId: context.clinicId,
      createdBy: context.userId,
    });

    const savedInvoice = await invoice.save();

    // Create invoice item documents
    const invoiceItems = await this.createInvoiceItems(
      savedInvoice._id,
      appointmentData.procedures,
      options.defaultTaxRate ?? this.DEFAULT_TAX_RATE,
      context,
    );

    // Update invoice with item references
    savedInvoice.items = invoiceItems.map((item) => item._id);
    await savedInvoice.save();

    // Auto-issue if requested
    if (options.autoIssue) {
      await this.issueInvoice(savedInvoice, context);
    }

    // Emit event
    await this.emitInvoiceCreatedEvent(savedInvoice, appointmentData, context);

    const duration = Date.now() - startTime;
    this.logger.log(
      `Created invoice ${savedInvoice.invoiceNumber} from appointment ${appointmentData.appointmentId} in ${duration}ms`,
    );

    // Performance warning
    if (duration > 500) {
      this.logger.warn(`Invoice generation took ${duration}ms, exceeding 500ms threshold`);
    }

    return {
      invoice: savedInvoice,
      invoiceItems,
      warnings,
    };
  }

  /**
   * Create an invoice from procedures (manual creation)
   *
   * @param patientId - Patient ID
   * @param patientName - Patient name
   * @param procedures - List of procedures to invoice
   * @param options - Generation options
   * @param context - Tenant context
   * @returns Generated invoice with line items
   */
  async createFromProcedures(
    patientId: string,
    patientName: string,
    providerId: string,
    providerName: string,
    procedures: ProcedureData[],
    options: InvoiceGenerationOptions = {},
    context: TenantContext,
  ): Promise<InvoiceGenerationResult> {
    const appointmentData: AppointmentData = {
      appointmentId: '', // No appointment
      patientId,
      patientName,
      providerId,
      providerName,
      completedAt: new Date().toISOString(),
      procedures,
    };

    return this.createFromAppointment(appointmentData, options, context);
  }

  /**
   * Issue an invoice (finalize from draft)
   * Creates ledger entries for double-entry accounting
   */
  async issueInvoice(invoice: Invoice, context: TenantContext): Promise<Invoice> {
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException(`Cannot issue invoice with status ${invoice.status}`);
    }

    const oldStatus = invoice.status;
    invoice.status = InvoiceStatus.SENT;
    invoice.updatedBy = context.userId;
    await invoice.save();

    // Create ledger entries
    const autoPostLedger = this.configService.get<boolean>('billing.ledgerAutoPost', true);

    if (autoPostLedger) {
      await this.ledgerService.createInvoiceIssuedEntries(
        invoice._id,
        invoice.total,
        invoice.taxAmount,
        invoice.subtotal,
        context,
      );
    }

    // Emit event
    this.eventEmitter.emit('invoice.issued', {
      invoiceId: invoice._id.toString(),
      invoiceNumber: invoice.invoiceNumber,
      patientId: invoice.patientId,
      total: invoice.total,
      oldStatus,
      newStatus: invoice.status,
      ...context,
    });

    this.logger.log(`Issued invoice ${invoice.invoiceNumber}`);

    return invoice;
  }

  /**
   * Send invoice to patient (via email)
   */
  async sendInvoice(invoiceId: string, email: string, context: TenantContext): Promise<Invoice> {
    const invoice = await this.invoiceModel.findOne({
      _id: invoiceId,
      tenantId: context.tenantId,
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    if (invoice.status === InvoiceStatus.DRAFT) {
      throw new BadRequestException('Cannot send draft invoice. Issue it first.');
    }

    // Update sent tracking
    invoice.sentAt = new Date();
    invoice.sentBy = context.userId;
    invoice.sentMethod = 'email';
    invoice.sentToEmail = email;
    invoice.updatedBy = context.userId;
    await invoice.save();

    // Emit event for notification service to handle actual email sending
    this.eventEmitter.emit('invoice.sent', {
      invoiceId: invoice._id.toString(),
      invoiceNumber: invoice.invoiceNumber,
      patientId: invoice.patientId,
      email,
      total: invoice.total,
      ...context,
    });

    this.logger.log(`Invoice ${invoice.invoiceNumber} marked as sent to ${email}`);

    return invoice;
  }

  /**
   * Cancel invoice by creating a credit note
   */
  async cancelInvoice(
    invoiceId: string,
    reason: string,
    context: TenantContext,
  ): Promise<{ originalInvoice: Invoice; creditNote: Invoice }> {
    const invoice = await this.invoiceModel.findOne({
      _id: invoiceId,
      tenantId: context.tenantId,
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    if (invoice.status === InvoiceStatus.VOID) {
      throw new BadRequestException('Invoice is already voided');
    }

    if (invoice.isCreditNote) {
      throw new BadRequestException('Cannot cancel a credit note');
    }

    // Generate credit note number
    const numberResult = await this.invoiceNumberGenerator.generateNextNumber(
      `CN-${invoice.series}`,
      context,
    );

    // Create credit note (negative invoice)
    const creditNote = new this.invoiceModel({
      invoiceNumber: numberResult.invoiceNumber,
      series: numberResult.series,
      sequenceNumber: numberResult.sequenceNumber,
      patientId: invoice.patientId,
      providerId: invoice.providerId,
      appointmentId: invoice.appointmentId,
      treatmentPlanId: invoice.treatmentPlanId,
      status: InvoiceStatus.SENT, // Credit notes are auto-issued
      issueDate: new Date(),
      dueDate: new Date(),
      paymentTerms: PaymentTerms.DUE_ON_RECEIPT,
      currency: invoice.currency,
      subtotal: -invoice.subtotal,
      taxAmount: -invoice.taxAmount,
      discountAmount: -invoice.discountAmount,
      total: -invoice.total,
      amountPaid: 0,
      balance: -invoice.total,
      customerName: invoice.customerName,
      customerAddress: invoice.customerAddress,
      customerTaxId: invoice.customerTaxId,
      customer: invoice.customer,
      notes: `Credit note for invoice ${invoice.invoiceNumber}. Reason: ${reason}`,
      isCreditNote: true,
      originalInvoiceId: invoice._id.toString(),
      tenantId: context.tenantId,
      organizationId: context.organizationId,
      clinicId: context.clinicId,
      createdBy: context.userId,
    });

    await creditNote.save();

    // Update original invoice
    invoice.status = InvoiceStatus.VOID;
    invoice.voidedAt = new Date();
    invoice.voidedBy = context.userId;
    invoice.voidReason = reason;
    invoice.creditNoteId = creditNote._id.toString();
    invoice.updatedBy = context.userId;
    await invoice.save();

    // Create reversal ledger entries
    await this.ledgerService.createInvoiceVoidEntries(
      invoice._id,
      invoice.total,
      invoice.taxAmount,
      invoice.subtotal,
      context,
    );

    // Emit events
    this.eventEmitter.emit('invoice.cancelled', {
      invoiceId: invoice._id.toString(),
      invoiceNumber: invoice.invoiceNumber,
      creditNoteId: creditNote._id.toString(),
      creditNoteNumber: creditNote.invoiceNumber,
      reason,
      ...context,
    });

    this.logger.log(
      `Cancelled invoice ${invoice.invoiceNumber}, created credit note ${creditNote.invoiceNumber}`,
    );

    return { originalInvoice: invoice, creditNote };
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  /**
   * Validate appointment data
   */
  private validateAppointmentData(data: AppointmentData): void {
    if (!data.patientId) {
      throw new BadRequestException('Patient ID is required');
    }
    if (!data.providerId) {
      throw new BadRequestException('Provider ID is required');
    }
    if (!data.procedures || data.procedures.length === 0) {
      throw new BadRequestException('At least one procedure is required');
    }

    for (const proc of data.procedures) {
      if (!proc.procedureCode) {
        throw new BadRequestException('Procedure code is required');
      }
      if (proc.unitPrice === undefined || proc.unitPrice === null) {
        throw new BadRequestException(`Unit price is required for procedure ${proc.procedureCode}`);
      }
    }
  }

  /**
   * Check for duplicate invoice for an appointment
   */
  private async checkForDuplicate(
    appointmentId: string,
    context: TenantContext,
  ): Promise<Invoice | null> {
    if (!appointmentId) return null;

    return this.invoiceModel.findOne({
      appointmentId,
      tenantId: context.tenantId,
      status: { $ne: InvoiceStatus.VOID },
    });
  }

  /**
   * Get clinic series from clinic ID
   */
  private getClinicSeries(clinicId: string): string {
    // Use first 6 characters of clinic ID as series
    return clinicId
      .substring(0, 6)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
  }

  /**
   * Calculate due date from payment terms
   */
  private calculateDueDate(issueDate: Date, paymentTerms: PaymentTerms): Date {
    const dueDate = new Date(issueDate);

    switch (paymentTerms) {
      case PaymentTerms.NET_15:
        dueDate.setDate(dueDate.getDate() + 15);
        break;
      case PaymentTerms.NET_30:
        dueDate.setDate(dueDate.getDate() + 30);
        break;
      case PaymentTerms.DUE_ON_RECEIPT:
      default:
        // Due immediately
        break;
    }

    return dueDate;
  }

  /**
   * Calculate invoice totals from procedures
   */
  private calculateInvoiceTotals(
    procedures: ProcedureData[],
    defaultTaxRate: number,
  ): {
    lines: InvoiceLineItem[];
    subtotal: Money;
    taxAmount: Money;
    discountAmount: Money;
    total: Money;
    taxBreakdown: Array<{
      taxCategory: string;
      taxableAmount: number;
      taxAmount: number;
      taxRate: number;
      exemptionReasonCode?: string;
      exemptionReasonText?: string;
    }>;
  } {
    const lines: InvoiceLineItem[] = [];
    let subtotal = Money.zero();
    let taxAmount = Money.zero();
    let discountAmount = Money.zero();

    // Track tax by rate for breakdown
    const taxByRate = new Map<
      number,
      { taxableAmount: Money; taxAmount: Money; exempt: boolean; reason?: string }
    >();

    procedures.forEach((proc, index) => {
      const quantity = proc.quantity || 1;
      const unitPrice = new Money(proc.unitPrice);
      const lineSubtotal = unitPrice.multiply(quantity);

      // Calculate discount
      let lineDiscount = Money.zero();
      if (proc.discountPercent && proc.discountPercent > 0) {
        lineDiscount = lineSubtotal.multiply(proc.discountPercent / 100).round(2);
      }

      const lineAfterDiscount = lineSubtotal.subtract(lineDiscount);

      // Calculate tax
      const taxRate = proc.taxExempt ? 0 : defaultTaxRate;
      const lineTax = calculateTax(lineAfterDiscount, taxRate);
      const lineTotal = lineAfterDiscount.add(lineTax);

      // Track tax breakdown
      const existing = taxByRate.get(taxRate);
      if (existing) {
        existing.taxableAmount = existing.taxableAmount.add(lineAfterDiscount);
        existing.taxAmount = existing.taxAmount.add(lineTax);
      } else {
        taxByRate.set(taxRate, {
          taxableAmount: lineAfterDiscount,
          taxAmount: lineTax,
          exempt: proc.taxExempt || false,
          reason: proc.taxExemptionReason,
        });
      }

      // Create line item
      const line: InvoiceLineItem = {
        lineNumber: index + 1,
        itemType: 'treatment',
        itemCode: proc.procedureCode,
        description: proc.procedureName,
        tooth: proc.tooth,
        surfaces: proc.surfaces,
        quantity,
        unitPrice: unitPrice.toNumber(),
        discountPercent: proc.discountPercent,
        discountAmount: lineDiscount.toNumber(),
        taxRate,
        taxAmount: lineTax.toNumber(),
        lineTotal: lineTotal.toNumber(),
        providerId: proc.providerId,
        commissionRate: proc.commissionRate,
        referenceId: proc.procedureId,
      };

      lines.push(line);

      // Accumulate totals
      subtotal = subtotal.add(lineSubtotal);
      discountAmount = discountAmount.add(lineDiscount);
      taxAmount = taxAmount.add(lineTax);
    });

    const total = subtotal.subtract(discountAmount).add(taxAmount);

    // Build tax breakdown
    const taxBreakdown = Array.from(taxByRate.entries()).map(([rate, data]) => ({
      taxCategory: rate === 0 ? 'E' : 'S', // E = exempt, S = standard
      taxableAmount: data.taxableAmount.toNumber(),
      taxAmount: data.taxAmount.toNumber(),
      taxRate: rate,
      exemptionReasonCode: data.exempt ? 'VATEX-EU-IC' : undefined,
      exemptionReasonText: data.reason,
    }));

    return {
      lines,
      subtotal,
      taxAmount,
      discountAmount,
      total,
      taxBreakdown,
    };
  }

  /**
   * Create invoice item documents
   */
  private async createInvoiceItems(
    invoiceId: Types.ObjectId,
    procedures: ProcedureData[],
    defaultTaxRate: number,
    context: TenantContext,
  ): Promise<InvoiceItem[]> {
    const items: InvoiceItem[] = [];

    for (const proc of procedures) {
      const quantity = proc.quantity || 1;
      const unitPrice = new Money(proc.unitPrice);
      const totalPrice = unitPrice.multiply(quantity);
      const taxRate = proc.taxExempt ? 0 : defaultTaxRate;
      const taxAmount = calculateTax(totalPrice, taxRate);

      const item = new this.invoiceItemModel({
        invoiceId,
        itemType: InvoiceItemType.PROCEDURE,
        code: proc.procedureCode,
        procedureCode: proc.procedureCode,
        description: proc.procedureName,
        toothNumber: proc.tooth,
        surfaces: proc.surfaces,
        quantity,
        unitPrice: unitPrice.toNumber(),
        totalPrice: totalPrice.toNumber(),
        taxRate,
        taxAmount: taxAmount.toNumber(),
        providerId: proc.providerId,
        linkedProcedureId: proc.procedureId,
        tenantId: context.tenantId,
        organizationId: context.organizationId,
        clinicId: context.clinicId,
        createdBy: context.userId,
      });

      await item.save();
      items.push(item);
    }

    return items;
  }

  /**
   * Emit invoice created event
   */
  private async emitInvoiceCreatedEvent(
    invoice: Invoice,
    appointmentData: AppointmentData,
    context: TenantContext,
  ): Promise<void> {
    try {
      const payload: InvoiceCreatedPayload = {
        invoiceId: invoice._id.toString() as any,
        invoiceNumber: invoice.invoiceNumber,
        patientId: appointmentData.patientId as any,
        patientName: appointmentData.patientName,
        providerId: appointmentData.providerId as any,
        providerName: appointmentData.providerName,
        organizationId: context.organizationId as any,
        clinicId: context.clinicId as any,
        tenantId: context.tenantId,
        appointmentId: appointmentData.appointmentId as any,
        treatmentPlanId: appointmentData.treatmentPlanId as any,
        issueDate: invoice.issueDate.toISOString() as any,
        dueDate: invoice.dueDate.toISOString() as any,
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        discountAmount: invoice.discountAmount,
        total: invoice.total,
        currency: invoice.currency,
        itemCount: invoice.items?.length || 0,
        status: 'DRAFT',
        autoGenerated: !!appointmentData.appointmentId,
        timestamp: new Date().toISOString() as any,
        metadata: {
          series: invoice.series,
          sequenceNumber: invoice.sequenceNumber,
        },
      };

      const event = createInvoiceCreatedEvent(
        payload,
        {
          correlationId: crypto.randomUUID() as any,
          userId: context.userId as any,
          source: {
            service: 'backend-billing-service',
            version: '1.0.0',
          },
        },
        {
          tenantId: context.tenantId as any,
          organizationId: context.organizationId as any,
          clinicId: context.clinicId as any,
        },
      );

      this.eventEmitter.emit('invoice.created', event);
    } catch (error) {
      this.logger.error('Failed to emit invoice.created event', { error });
      // Don't throw - invoice creation succeeded, event emission is secondary
    }
  }
}
