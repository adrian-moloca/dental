import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Supplier } from './schemas/supplier.schema';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(@InjectModel(Supplier.name) private supplierModel: Model<Supplier>) {}

  async create(
    dto: CreateSupplierDto,
    tenantId: string,
    organizationId: string,
    userId: string,
  ): Promise<Supplier> {
    const existing = await this.supplierModel.findOne({
      code: dto.code,
      tenantId,
    });

    if (existing) {
      throw new BadRequestException(`Supplier with code ${dto.code} already exists`);
    }

    const supplier = new this.supplierModel({
      ...dto,
      tenantId,
      organizationId,
      createdBy: userId,
      isActive: true,
    });

    return supplier.save();
  }

  async findById(id: string, tenantId: string): Promise<Supplier> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid supplier ID');
    }

    const supplier = await this.supplierModel.findOne({ _id: id, tenantId });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  async findAll(tenantId: string): Promise<Supplier[]> {
    return this.supplierModel.find({ tenantId, isActive: true }).exec();
  }

  async update(
    id: string,
    dto: Partial<CreateSupplierDto>,
    tenantId: string,
    userId: string,
  ): Promise<Supplier> {
    const supplier = await this.findById(id, tenantId);
    Object.assign(supplier, dto);
    supplier.updatedBy = userId;
    return supplier.save();
  }
}
