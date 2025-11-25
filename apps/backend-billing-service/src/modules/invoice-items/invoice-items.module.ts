import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceItemsService } from './invoice-items.service';
import { InvoiceItem, InvoiceItemSchema } from './entities/invoice-item.entity';
import { Invoice, InvoiceSchema } from '../invoices/entities/invoice.entity';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InvoiceItem.name, schema: InvoiceItemSchema },
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
    forwardRef(() => InvoicesModule),
  ],
  providers: [InvoiceItemsService],
  exports: [InvoiceItemsService],
})
export class InvoiceItemsModule {}
