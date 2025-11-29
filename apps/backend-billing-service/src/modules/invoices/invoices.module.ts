import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { Invoice, InvoiceSchema } from './entities/invoice.entity';
import { InvoiceItem, InvoiceItemSchema } from '../invoice-items/entities/invoice-item.entity';
import { LedgerModule } from '../ledger/ledger.module';
import { InvoiceItemsModule } from '../invoice-items/invoice-items.module';
import { PaymentsModule } from '../payments/payments.module';
import { ProcedureCompletedHandler } from './handlers/procedure-completed.handler';
import { AppointmentCompletedHandler } from './handlers/appointment-completed.handler';
import { InvoiceNumberGeneratorService } from './services/invoice-number-generator.service';
import { InvoiceGenerationService } from './services/invoice-generation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: InvoiceItem.name, schema: InvoiceItemSchema },
    ]),
    ConfigModule,
    LedgerModule,
    forwardRef(() => InvoiceItemsModule),
    forwardRef(() => PaymentsModule),
  ],
  controllers: [InvoicesController],
  providers: [
    InvoicesService,
    InvoiceNumberGeneratorService,
    InvoiceGenerationService,
    ProcedureCompletedHandler,
    AppointmentCompletedHandler,
  ],
  exports: [InvoicesService, InvoiceNumberGeneratorService, InvoiceGenerationService],
})
export class InvoicesModule {}
