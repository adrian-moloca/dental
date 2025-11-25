import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { Invoice, InvoiceSchema } from './entities/invoice.entity';
import { InvoiceItem, InvoiceItemSchema } from '../invoice-items/entities/invoice-item.entity';
import { LedgerModule } from '../ledger/ledger.module';
import { InvoiceItemsModule } from '../invoice-items/invoice-items.module';
import { PaymentsModule } from '../payments/payments.module';
import { ProcedureCompletedHandler } from './handlers/procedure-completed.handler';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: InvoiceItem.name, schema: InvoiceItemSchema },
    ]),
    LedgerModule,
    forwardRef(() => InvoiceItemsModule),
    forwardRef(() => PaymentsModule),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService, ProcedureCompletedHandler],
  exports: [InvoicesService],
})
export class InvoicesModule {}
