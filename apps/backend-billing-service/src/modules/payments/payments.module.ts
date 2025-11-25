import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment, PaymentSchema } from './entities/payment.entity';
import { Invoice, InvoiceSchema } from '../invoices/entities/invoice.entity';
import { LedgerModule } from '../ledger/ledger.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { PatientBalancesModule } from '../patient-balances/patient-balances.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
    LedgerModule,
    forwardRef(() => InvoicesModule),
    PatientBalancesModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
