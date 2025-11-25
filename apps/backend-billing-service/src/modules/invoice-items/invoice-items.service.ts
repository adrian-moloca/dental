import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { CreateInvoiceItemDto } from './dto/create-invoice-item.dto';
import { Money, calculateTax } from '../../common/utils/money.utils';
import { InvoicesService } from '../invoices/invoices.service';

interface TenantContext {
  tenantId: string;
  organizationId: string;
  clinicId: string;
  userId?: string;
}

@Injectable()
export class InvoiceItemsService {
  private readonly logger = new Logger(InvoiceItemsService.name);

  constructor(
    @InjectModel(InvoiceItem.name)
    private invoiceItemModel: Model<InvoiceItem>,
    @InjectModel(Invoice.name)
    private invoiceModel: Model<Invoice>,
    private invoicesService: InvoicesService,
  ) {}

  async create(
    invoiceId: string,
    createInvoiceItemDto: CreateInvoiceItemDto,
    context: TenantContext,
  ): Promise<InvoiceItem> {
    const invoice = await this.invoiceModel.findOne({
      _id: invoiceId,
      tenantId: context.tenantId,
      organizationId: context.organizationId,
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    // Calculate amounts
    const quantity = new Money(createInvoiceItemDto.quantity || 1);
    const unitPrice = new Money(createInvoiceItemDto.unitPrice);
    const totalPrice = unitPrice.multiply(quantity.toNumber());
    // Default to 19% Romanian VAT if not specified
    const taxRate =
      createInvoiceItemDto.taxRate !== undefined ? createInvoiceItemDto.taxRate : 0.19;
    const taxAmount = calculateTax(totalPrice, taxRate);

    const invoiceItem = new this.invoiceItemModel({
      ...createInvoiceItemDto,
      invoiceId: new Types.ObjectId(invoiceId),
      quantity: quantity.toNumber(),
      totalPrice: totalPrice.toNumber(),
      taxAmount: taxAmount.toNumber(),
      ...context,
      createdBy: context.userId,
    });

    await invoiceItem.save();

    // Add to invoice items array
    invoice.items.push(invoiceItem._id);
    await invoice.save();

    // Recalculate invoice totals
    await this.invoicesService.recalculateTotals(invoice._id, context);

    this.logger.log(`Added item to invoice ${invoice.invoiceNumber}`);

    return invoiceItem;
  }

  async delete(invoiceId: string, itemId: string, context: TenantContext): Promise<void> {
    const invoice = await this.invoiceModel.findOne({
      _id: invoiceId,
      tenantId: context.tenantId,
      organizationId: context.organizationId,
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    await this.invoiceItemModel.deleteOne({
      _id: itemId,
      invoiceId: new Types.ObjectId(invoiceId),
    });

    // Remove from invoice items array
    invoice.items = invoice.items.filter((id) => id.toString() !== itemId);
    await invoice.save();

    // Recalculate invoice totals
    await this.invoicesService.recalculateTotals(invoice._id, context);

    this.logger.log(`Removed item ${itemId} from invoice ${invoice.invoiceNumber}`);
  }

  async findByInvoice(invoiceId: string, context: TenantContext): Promise<InvoiceItem[]> {
    return this.invoiceItemModel.find({
      invoiceId: new Types.ObjectId(invoiceId),
      tenantId: context.tenantId,
      organizationId: context.organizationId,
    });
  }
}
