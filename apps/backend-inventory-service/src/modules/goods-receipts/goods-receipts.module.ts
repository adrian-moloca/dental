import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GoodsReceiptsService } from './goods-receipts.service';
import { GoodsReceiptsController } from './goods-receipts.controller';
import { GoodsReceipt, GoodsReceiptSchema } from './schemas/goods-receipt.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Supplier, SupplierSchema } from '../suppliers/schemas/supplier.schema';
import { StockModule } from '../stock/stock.module';
import { PurchaseOrdersModule } from '../purchase-orders/purchase-orders.module';
import { LicenseGuard } from '@dentalos/shared-security';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GoodsReceipt.name, schema: GoodsReceiptSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Supplier.name, schema: SupplierSchema },
    ]),
    StockModule,
    PurchaseOrdersModule,
  ],
  controllers: [GoodsReceiptsController],
  providers: [GoodsReceiptsService, LicenseGuard, Reflector],
  exports: [GoodsReceiptsService],
})
export class GoodsReceiptsModule {}
