import { Module } from '@nestjs/common';
import { ProcedureCompletedHandler } from './handlers/procedure-completed.handler';
import { InvoicesModule } from '../invoices/invoices.module';
import { InvoiceItemsModule } from '../invoice-items/invoice-items.module';

@Module({
  imports: [InvoicesModule, InvoiceItemsModule],
  providers: [ProcedureCompletedHandler],
})
export class ClinicalIntegrationModule {}
