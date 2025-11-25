import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InvoiceItem } from '../../invoice-items/entities/invoice-item.entity';
import { LedgerService } from '../../ledger/ledger.service';

interface StockDeductedEvent {
  productId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  procedureId?: string;
  invoiceId?: string;
  tenantId: string;
  organizationId: string;
  clinicId: string;
  userId: string;
}

@Injectable()
export class StockDeductedHandler {
  private readonly logger = new Logger(StockDeductedHandler.name);

  constructor(
    @InjectModel(InvoiceItem.name)
    private invoiceItemModel: Model<InvoiceItem>,
    private ledgerService: LedgerService,
  ) {}

  @OnEvent('stock.deducted')
  async handleStockDeducted(event: StockDeductedEvent): Promise<void> {
    this.logger.log(`Processing StockDeductedEvent for product ${event.productId}`);

    const context = {
      tenantId: event.tenantId,
      organizationId: event.organizationId,
      clinicId: event.clinicId,
      userId: event.userId,
    };

    try {
      // If linked to a procedure, find the invoice item and update COGS
      if (event.procedureId) {
        const invoiceItem = await this.invoiceItemModel.findOne({
          referenceId: event.procedureId,
          itemType: 'PROCEDURE',
          tenantId: event.tenantId,
        });

        if (invoiceItem) {
          const currentCogs = invoiceItem.costOfGoodsSold || 0;
          invoiceItem.costOfGoodsSold = currentCogs + event.totalCost;
          await invoiceItem.save();

          this.logger.log(`Updated COGS for invoice item ${invoiceItem._id}: +${event.totalCost}`);

          // Create COGS ledger entry
          if (invoiceItem.invoiceId) {
            await this.ledgerService.createCogsEntries(
              invoiceItem.invoiceId as Types.ObjectId,
              event.totalCost,
              context,
            );
          }
        }
      }

      // If directly linked to invoice, create separate product line item
      if (event.invoiceId && !event.procedureId) {
        // This would require creating a new invoice item
        // Implementation depends on business rules
        this.logger.log(
          `Stock deducted directly to invoice ${event.invoiceId} - requires manual handling`,
        );
      }
    } catch (error: any) {
      this.logger.error(`Failed to process stock deducted event: ${error?.message}`, error?.stack);
    }
  }
}
