import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductStatus } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * ProductsService handles all product catalog operations
 * Implements CRUD with multi-tenant isolation
 */
@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new product
   */
  async create(
    dto: CreateProductDto,
    tenantId: string,
    organizationId: string,
    userId: string,
  ): Promise<Product> {
    this.logger.log(`Creating product ${dto.sku} for tenant ${tenantId}`);

    // Check for duplicate SKU
    const existing = await this.productModel.findOne({
      sku: dto.sku,
      tenantId,
    });

    if (existing) {
      throw new BadRequestException(`Product with SKU ${dto.sku} already exists`);
    }

    // Convert supplier IDs to ObjectIds
    const supplierIds = dto.supplierIds?.map((id) => new Types.ObjectId(id)) || [];
    const preferredSupplierId = dto.preferredSupplierId
      ? new Types.ObjectId(dto.preferredSupplierId)
      : undefined;

    const product = new this.productModel({
      ...dto,
      supplierIds,
      preferredSupplierId,
      tenantId,
      organizationId,
      createdBy: userId,
      status: ProductStatus.ACTIVE,
      isActive: true,
    });

    const savedProduct = await product.save();

    // Emit event
    this.eventEmitter.emit('product.created', {
      productId: savedProduct._id.toString(),
      sku: savedProduct.sku,
      name: savedProduct.name,
      type: savedProduct.type,
      tenantId,
      organizationId,
      timestamp: new Date(),
    });

    this.logger.log(`Product created: ${savedProduct._id}`);
    return savedProduct;
  }

  /**
   * Find product by ID
   */
  async findById(id: string, tenantId: string): Promise<Product> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel
      .findOne({ _id: id, tenantId })
      .populate('supplierIds')
      .exec();

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  /**
   * Find product by SKU
   */
  async findBySku(sku: string, tenantId: string): Promise<Product | null> {
    return this.productModel.findOne({ sku, tenantId }).exec();
  }

  /**
   * Query products with filtering, pagination, and sorting
   */
  async findAll(
    query: ProductQueryDto,
    tenantId: string,
    organizationId: string,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const {
      search,
      type,
      status,
      category,
      supplierId,
      clinicId,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc',
    } = query;

    // Build filter
    const filter: any = { tenantId, organizationId, isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (supplierId) {
      filter.supplierIds = new Types.ObjectId(supplierId);
    }

    if (clinicId) {
      filter.clinicIds = clinicId;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Update product
   */
  async update(
    id: string,
    dto: UpdateProductDto,
    tenantId: string,
    userId: string,
  ): Promise<Product> {
    this.logger.log(`Updating product ${id} for tenant ${tenantId}`);

    const product = await this.findById(id, tenantId);

    // Convert supplier IDs if provided
    if (dto.supplierIds) {
      product.supplierIds = dto.supplierIds.map((id) => new Types.ObjectId(id));
    }

    if (dto.preferredSupplierId) {
      product.preferredSupplierId = new Types.ObjectId(dto.preferredSupplierId);
    }

    // Update fields
    Object.assign(product, dto);
    product.updatedBy = userId;

    const updatedProduct = await product.save();

    // Emit event
    this.eventEmitter.emit('product.updated', {
      productId: updatedProduct._id.toString(),
      sku: updatedProduct.sku,
      name: updatedProduct.name,
      tenantId,
      timestamp: new Date(),
    });

    this.logger.log(`Product updated: ${updatedProduct._id}`);
    return updatedProduct;
  }

  /**
   * Soft delete product (set isActive to false)
   */
  async remove(id: string, tenantId: string, userId: string): Promise<void> {
    this.logger.log(`Soft deleting product ${id} for tenant ${tenantId}`);

    const product = await this.findById(id, tenantId);
    product.isActive = false;
    product.status = ProductStatus.DISCONTINUED;
    product.updatedBy = userId;
    await product.save();

    this.logger.log(`Product soft deleted: ${id}`);
  }

  /**
   * Get products below reorder point
   * This requires aggregation with stock data (will be called by StockService)
   */
  async getProductsBelowReorderPoint(tenantId: string, clinicId?: string): Promise<Product[]> {
    const filter: any = {
      tenantId,
      isActive: true,
      reorderPoint: { $gt: 0 },
    };

    if (clinicId) {
      filter.clinicIds = clinicId;
    }

    return this.productModel.find(filter).exec();
  }
}
