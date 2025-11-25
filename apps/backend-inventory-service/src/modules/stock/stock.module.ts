import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { StockItem, StockItemSchema } from './schemas/stock-item.schema';
import { Lot, LotSchema } from './schemas/lot.schema';
import { StockMovement, StockMovementSchema } from './schemas/stock-movement.schema';
import { StockLocation, StockLocationSchema } from './schemas/stock-location.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { LicenseGuard } from '@dentalos/shared-security';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StockItem.name, schema: StockItemSchema },
      { name: Lot.name, schema: LotSchema },
      { name: StockMovement.name, schema: StockMovementSchema },
      { name: StockLocation.name, schema: StockLocationSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [StockController],
  providers: [StockService, LicenseGuard, Reflector],
  exports: [StockService],
})
export class StockModule {}
