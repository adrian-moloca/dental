import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { Supplier, SupplierSchema } from './schemas/supplier.schema';
import { LicenseGuard } from '@dentalos/shared-security';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [MongooseModule.forFeature([{ name: Supplier.name, schema: SupplierSchema }])],
  controllers: [SuppliersController],
  providers: [SuppliersService, LicenseGuard, Reflector],
  exports: [SuppliersService],
})
export class SuppliersModule {}
