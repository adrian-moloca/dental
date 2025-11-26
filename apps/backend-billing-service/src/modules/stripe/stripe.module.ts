import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { StripeEventListener } from './stripe-event.listener';
import stripeConfig from './config/stripe.config';
import { Payment, PaymentSchema } from '../payments/entities/payment.entity';
import { Invoice, InvoiceSchema } from '../invoices/entities/invoice.entity';
import { LedgerModule } from '../ledger/ledger.module';
import { PatientBalancesModule } from '../patient-balances/patient-balances.module';

@Module({
  imports: [
    ConfigModule.forFeature(stripeConfig),
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
    LedgerModule,
    PatientBalancesModule,
  ],
  controllers: [StripeController],
  providers: [StripeService, StripeEventListener],
  exports: [StripeService],
})
export class StripeModule {}
