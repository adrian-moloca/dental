import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PatientBalancesService } from './patient-balances.service';
import { PatientBalance, PatientBalanceSchema } from './entities/patient-balance.entity';
import { Invoice, InvoiceSchema } from '../invoices/entities/invoice.entity';
import { PaymentRecordedHandler } from './handlers/payment-recorded.handler';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PatientBalance.name, schema: PatientBalanceSchema },
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
  ],
  providers: [PatientBalancesService, PaymentRecordedHandler],
  exports: [PatientBalancesService],
})
export class PatientBalancesModule {}
