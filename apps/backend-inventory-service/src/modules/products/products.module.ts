import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductVariant, ProductVariantSchema } from './schemas/product-variant.schema';
import { LicenseGuard } from '@dentalos/shared-security';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductVariant.name, schema: ProductVariantSchema },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, LicenseGuard, Reflector],
  exports: [ProductsService],
})
export class ProductsModule {}
