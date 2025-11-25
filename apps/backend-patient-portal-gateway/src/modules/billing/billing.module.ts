import { Module } from '@nestjs/common';
import { BillingController } from './controllers/billing.controller';
import { BillingService } from './services/billing.service';

@Module({
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}
