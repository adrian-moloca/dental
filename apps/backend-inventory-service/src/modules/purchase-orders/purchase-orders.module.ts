import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrder, PurchaseOrderSchema } from './schemas/purchase-order.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Supplier, SupplierSchema } from '../suppliers/schemas/supplier.schema';
import { LicenseGuard } from '@dentalos/shared-security';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PurchaseOrder.name, schema: PurchaseOrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Supplier.name, schema: SupplierSchema },
    ]),
  ],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService, LicenseGuard, Reflector],
  exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}
