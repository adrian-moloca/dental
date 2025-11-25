import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from '../invoice-items/entities/invoice-item.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceStatus } from '../../common/types';
import { Money } from '../../common/utils/money.utils';
import { LedgerService } from '../ledger/ledger.service';
import { ConfigService } from '@nestjs/config';

interface TenantContext {
  tenantId: string;
  organizationId: string;
  clinicId: string;
  userId?: string;
}

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    @InjectModel(Invoice.name)
    private invoiceModel: Model<Invoice>,
    @InjectModel(InvoiceItem.name)
    private invoiceItemModel: Model<InvoiceItem>,
    private ledgerService: LedgerService,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
  ) {}

  /**
   * Create a new invoice
   */
  async create(createInvoiceDto: CreateInvoiceDto, context: TenantContext): Promise<Invoice> {
    const invoiceNumber = await this.generateInvoiceNumber(context);

    const invoice = new this.invoiceModel({
      ...createInvoiceDto,
      invoiceNumber,
      status: InvoiceStatus.DRAFT,
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      total: 0,
      amountPaid: 0,
      balance: 0,
      currency: createInvoiceDto.currency || 'RON',
      items: [],
      ...context,
      createdBy: context.userId,
    });

    await invoice.save();

    this.logger.log(`Created invoice ${invoice.invoiceNumber}`);

    // Emit event
    this.eventEmitter.emit('invoice.created', {
      invoiceId: invoice._id.toString(),
      invoiceNumber: invoice.invoiceNumber,
      patientId: invoice.patientId,
      providerId: invoice.providerId,
      ...context,
    });

    return invoice;
  }

  /**
   * Get invoice by ID
   */
  async findOne(id: string, context: TenantContext): Promise<Invoice> {
    const invoice = await this.invoiceModel
      .findOne({
        _id: id,
        tenantId: context.tenantId,
        organizationId: context.organizationId,
      })
      .populate('items');

    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }

    return invoice;
  }

  /**
   * Find invoices with filters
   */
  async findAll(
    filters: {
      patientId?: string;
      providerId?: string;
      status?: InvoiceStatus;
      fromDate?: Date;
      toDate?: Date;
    },
    context: TenantContext,
  ): Promise<Invoice[]> {
    const query: any = {
      tenantId: context.tenantId,
      organizationId: context.organizationId,
    };

    if (filters.patientId) query.patientId = filters.patientId;
    if (filters.providerId) query.providerId = filters.providerId;
    if (filters.status) query.status = filters.status;
    if (filters.fromDate || filters.toDate) {
      query.issueDate = {};
      if (filters.fromDate) query.issueDate.$gte = filters.fromDate;
      if (filters.toDate) query.issueDate.$lte = filters.toDate;
    }

    return this.invoiceModel.find(query).sort({ issueDate: -1 });
  }

  /**
   * Find invoices with pagination
   */
  async findAllWithPagination(
    filters: {
      patientId?: string;
      providerId?: string;
      status?: InvoiceStatus;
      fromDate?: Date;
      toDate?: Date;
    },
    pagination: {
      page: number;
      limit: number;
    },
    context: TenantContext,
  ): Promise<{
    data: Invoice[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query: any = {
      tenantId: context.tenantId,
      organizationId: context.organizationId,
    };

    if (filters.patientId) query.patientId = filters.patientId;
    if (filters.providerId) query.providerId = filters.providerId;
    if (filters.status) query.status = filters.status;
    if (filters.fromDate || filters.toDate) {
      query.issueDate = {};
      if (filters.fromDate) query.issueDate.$gte = filters.fromDate;
      if (filters.toDate) query.issueDate.$lte = filters.toDate;
    }

    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.invoiceModel.find(query).sort({ issueDate: -1 }).skip(skip).limit(limit).exec(),
      this.invoiceModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Update invoice (only if unpaid)
   */
  async update(
    id: string,
    updateData: {
      providerId?: string;
      issueDate?: string;
      dueDate?: string;
      currency?: string;
      notes?: string;
      terms?: string;
    },
    context: TenantContext,
  ): Promise<Invoice> {
    const invoice = await this.findOne(id, context);

    // Only allow updates for DRAFT invoices
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot update invoice with status ${invoice.status}. Only DRAFT invoices can be updated.`,
      );
    }

    // Update allowed fields
    if (updateData.providerId !== undefined) {
      invoice.providerId = updateData.providerId;
    }
    if (updateData.issueDate !== undefined) {
      invoice.issueDate = new Date(updateData.issueDate);
    }
    if (updateData.dueDate !== undefined) {
      invoice.dueDate = new Date(updateData.dueDate);
    }
    if (updateData.currency !== undefined) {
      invoice.currency = updateData.currency;
    }
    if (updateData.notes !== undefined) {
      invoice.notes = updateData.notes;
    }
    if (updateData.terms !== undefined) {
      invoice.terms = updateData.terms;
    }

    invoice.updatedBy = context.userId;
    await invoice.save();

    this.logger.log(`Updated invoice ${invoice.invoiceNumber}`);

    return invoice;
  }

  /**
   * Update invoice status
   */
  async updateStatus(
    id: string,
    status: InvoiceStatus,
    reason: string | undefined,
    context: TenantContext,
  ): Promise<Invoice> {
    const invoice = await this.findOne(id, context);

    // Validate status transition
    this.validateStatusTransition(invoice.status, status);

    const oldStatus = invoice.status;
    invoice.status = status;
    invoice.updatedBy = context.userId;

    // Handle special status changes
    if (status === InvoiceStatus.VOID) {
      invoice.voidedAt = new Date();
      invoice.voidedBy = context.userId;
      invoice.voidReason = reason;

      // Create reversal ledger entries
      await this.ledgerService.createInvoiceVoidEntries(
        invoice._id,
        invoice.total,
        invoice.taxAmount,
        invoice.subtotal,
        context,
      );
    }

    if (status === InvoiceStatus.PAID) {
      invoice.paidDate = new Date();
    }

    await invoice.save();

    this.logger.log(
      `Invoice ${invoice.invoiceNumber} status changed from ${oldStatus} to ${status}`,
    );

    // Emit event
    this.eventEmitter.emit('invoice.status.changed', {
      invoiceId: invoice._id.toString(),
      invoiceNumber: invoice.invoiceNumber,
      oldStatus,
      newStatus: status,
      ...context,
    });

    return invoice;
  }

  /**
   * Recalculate invoice totals from items
   */
  async recalculateTotals(invoiceId: Types.ObjectId, context: TenantContext): Promise<Invoice> {
    const invoice = await this.invoiceModel.findById(invoiceId);
    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    const items = await this.invoiceItemModel.find({ invoiceId });

    let subtotal = Money.zero();
    let taxAmount = Money.zero();
    let discountAmount = Money.zero();
    let cogsTotal = Money.zero();

    for (const item of items) {
      const itemTotal = new Money(item.totalPrice);
      const itemTax = new Money(item.taxAmount);
      const itemCogs = new Money(item.costOfGoodsSold || 0);

      if (item.itemType === 'DISCOUNT') {
        discountAmount = discountAmount.add(itemTotal);
      } else {
        subtotal = subtotal.add(itemTotal);
        taxAmount = taxAmount.add(itemTax);
        cogsTotal = cogsTotal.add(itemCogs);
      }
    }

    const total = subtotal.add(taxAmount).subtract(discountAmount);
    const balance = total.subtract(new Money(invoice.amountPaid));

    // Update invoice
    invoice.subtotal = subtotal.toNumber();
    invoice.taxAmount = taxAmount.toNumber();
    invoice.discountAmount = discountAmount.toNumber();
    invoice.total = total.toNumber();
    invoice.balance = balance.toNumber();
    invoice.updatedBy = context.userId;

    await invoice.save();

    this.logger.log(
      `Recalculated totals for invoice ${invoice.invoiceNumber}: total=${total.toFixed()}`,
    );

    return invoice;
  }

  /**
   * Issue an invoice (move from DRAFT to SENT and create ledger entries)
   */
  async issueInvoice(id: string, context: TenantContext): Promise<Invoice> {
    const invoice = await this.findOne(id, context);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException(`Cannot issue invoice with status ${invoice.status}`);
    }

    // Update status to SENT
    invoice.status = InvoiceStatus.SENT;
    invoice.updatedBy = context.userId;
    await invoice.save();

    // Create ledger entries for invoice issuance
    const autoPostLedger = this.configService.get<boolean>('billing.ledgerAutoPost', true);

    if (autoPostLedger) {
      await this.ledgerService.createInvoiceIssuedEntries(
        invoice._id,
        invoice.total,
        invoice.taxAmount,
        invoice.subtotal,
        context,
      );

      // If there's COGS, create entries
      const items = await this.invoiceItemModel.find({
        invoiceId: invoice._id,
      });
      const totalCogs = Money.sum(items.map((item) => new Money(item.costOfGoodsSold || 0)));

      if (totalCogs.greaterThan(Money.zero())) {
        await this.ledgerService.createCogsEntries(invoice._id, totalCogs.toNumber(), context);
      }
    }

    this.logger.log(`Issued invoice ${invoice.invoiceNumber}`);

    // Emit event
    this.eventEmitter.emit('invoice.issued', {
      invoiceId: invoice._id.toString(),
      invoiceNumber: invoice.invoiceNumber,
      patientId: invoice.patientId,
      total: invoice.total,
      ...context,
    });

    return invoice;
  }

  /**
   * Mark invoice as paid
   */
  async markAsPaid(
    invoiceId: Types.ObjectId,
    amountPaid: number,
    context: TenantContext,
  ): Promise<void> {
    const invoice = await this.invoiceModel.findById(invoiceId);
    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    const currentPaid = new Money(invoice.amountPaid);
    const newPaid = currentPaid.add(new Money(amountPaid));
    const total = new Money(invoice.total);
    const balance = total.subtract(newPaid);

    invoice.amountPaid = newPaid.toNumber();
    invoice.balance = balance.toNumber();

    // Update status
    if (balance.isZero()) {
      invoice.status = InvoiceStatus.PAID;
      invoice.paidDate = new Date();
    } else if (newPaid.greaterThan(Money.zero())) {
      invoice.status = InvoiceStatus.PARTIALLY_PAID;
    }

    invoice.updatedBy = context.userId;
    await invoice.save();

    this.logger.log(
      `Invoice ${invoice.invoiceNumber} payment recorded: ${amountPaid}, balance: ${balance.toFixed()}`,
    );

    if (invoice.status === InvoiceStatus.PAID) {
      this.eventEmitter.emit('invoice.paid', {
        invoiceId: invoice._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
        patientId: invoice.patientId,
        total: invoice.total,
        ...context,
      });
    }
  }

  /**
   * Check for overdue invoices
   */
  async checkOverdueInvoices(context: TenantContext): Promise<void> {
    const overdueThreshold = this.configService.get<number>('billing.overdueThresholdDays', 7);

    const overdueDate = new Date();
    overdueDate.setDate(overdueDate.getDate() - overdueThreshold);

    const overdueInvoices = await this.invoiceModel.find({
      tenantId: context.tenantId,
      organizationId: context.organizationId,
      status: { $in: [InvoiceStatus.SENT, InvoiceStatus.PARTIALLY_PAID] },
      dueDate: { $lt: overdueDate },
    });

    for (const invoice of overdueInvoices) {
      invoice.status = InvoiceStatus.OVERDUE;
      await invoice.save();

      this.eventEmitter.emit('invoice.overdue', {
        invoiceId: invoice._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
        patientId: invoice.patientId,
        balance: invoice.balance,
        dueDate: invoice.dueDate,
        ...context,
      });
    }

    if (overdueInvoices.length > 0) {
      this.logger.log(`Marked ${overdueInvoices.length} invoices as overdue`);
    }
  }

  /**
   * Generate unique invoice number
   * Format: INV-{YYYY}-{sequential}
   * Example: INV-2025-00001
   */
  private async generateInvoiceNumber(context: TenantContext): Promise<string> {
    const prefix = 'INV';
    const year = new Date().getFullYear();

    // Find the last invoice for this year
    const lastInvoice = await this.invoiceModel
      .findOne({
        tenantId: context.tenantId,
        organizationId: context.organizationId,
        invoiceNumber: new RegExp(`^${prefix}-${year}-`),
      })
      .sort({ invoiceNumber: -1 });

    let sequence = 1;
    if (lastInvoice) {
      const lastNumber = lastInvoice.invoiceNumber.split('-').pop();
      sequence = parseInt(lastNumber || '0', 10) + 1;
    }

    const sequenceStr = String(sequence).padStart(5, '0');
    return `${prefix}-${year}-${sequenceStr}`;
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(currentStatus: InvoiceStatus, newStatus: InvoiceStatus): void {
    const validTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
      [InvoiceStatus.DRAFT]: [InvoiceStatus.SENT, InvoiceStatus.VOID],
      [InvoiceStatus.SENT]: [
        InvoiceStatus.PAID,
        InvoiceStatus.PARTIALLY_PAID,
        InvoiceStatus.OVERDUE,
        InvoiceStatus.VOID,
      ],
      [InvoiceStatus.PARTIALLY_PAID]: [
        InvoiceStatus.PAID,
        InvoiceStatus.OVERDUE,
        InvoiceStatus.VOID,
      ],
      [InvoiceStatus.OVERDUE]: [
        InvoiceStatus.PAID,
        InvoiceStatus.PARTIALLY_PAID,
        InvoiceStatus.VOID,
      ],
      [InvoiceStatus.PAID]: [InvoiceStatus.REFUNDED],
      [InvoiceStatus.VOID]: [],
      [InvoiceStatus.REFUNDED]: [],
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}
