import { Module } from '@nestjs/common';
import { ProcedureCompletedHandler } from './handlers/procedure-completed.handler';
import { StockModule } from '../stock/stock.module';

/**
 * Clinical Integration Module
 * Handles integration with the clinical service via event-driven architecture
 */
@Module({
  imports: [StockModule],
  providers: [ProcedureCompletedHandler],
})
export class ClinicalIntegrationModule {}
