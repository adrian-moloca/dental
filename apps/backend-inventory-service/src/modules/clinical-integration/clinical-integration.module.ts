import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProcedureCompletedHandler } from './handlers/procedure-completed.handler';
import { ProcedureTemplateService } from './services/procedure-template.service';
import { ProcedureTemplateController } from './controllers/procedure-template.controller';
import { ProcedureTemplate, ProcedureTemplateSchema } from './schemas/procedure-template.schema';
import { StockModule } from '../stock/stock.module';
import { ProductsModule } from '../products/products.module';

/**
 * Clinical Integration Module
 *
 * Handles integration with the clinical service via event-driven architecture:
 * - Procedure templates: Maps procedures to material requirements
 * - Stock deduction: Automatically deducts inventory when procedures complete
 * - Low stock alerts: Emits events when stock falls below reorder point
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: ProcedureTemplate.name, schema: ProcedureTemplateSchema }]),
    StockModule,
    ProductsModule,
  ],
  controllers: [ProcedureTemplateController],
  providers: [ProcedureCompletedHandler, ProcedureTemplateService],
  exports: [ProcedureTemplateService],
})
export class ClinicalIntegrationModule {}
