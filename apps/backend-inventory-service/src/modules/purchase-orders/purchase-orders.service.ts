import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PurchaseOrder, PurchaseOrderStatus } from './schemas/purchase-order.schema';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { Product } from '../products/schemas/product.schema';
import { Supplier } from '../suppliers/schemas/supplier.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Purchase Orders Service
 * Handles procurement workflow including approval and receiving
 */
@Injectable()
export class PurchaseOrdersService {
  private readonly logger = new Logger(PurchaseOrdersService.name);

  constructor(
    @InjectModel(PurchaseOrder.name) private poModel: Model<PurchaseOrder>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Supplier.name) private supplierModel: Model<Supplier>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new purchase order
   */
  async create(
    dto: CreatePurchaseOrderDto,
    tenantId: string,
    organizationId: string,
    clinicId: string,
    userId: string,
  ): Promise<PurchaseOrder> {
    this.logger.log(`Creating purchase order for supplier ${dto.supplierId}`);

    // Validate supplier
    const supplier = await this.supplierModel.findOne({
      _id: dto.supplierId,
      tenantId,
      isActive: true,
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier ${dto.supplierId} not found`);
    }

    // Validate products and build lines
    const lines = [];
    let subtotal = 0;

    for (let i = 0; i < dto.lines.length; i++) {
      const line = dto.lines[i];
      const product = await this.productModel.findOne({
        _id: line.productId,
        tenantId,
        isActive: true,
      });

      if (!product) {
        throw new NotFoundException(`Product ${line.productId} not found`);
      }

      const discount = line.discount || 0;
      const tax = line.tax || 0;
      const lineTotal =
        line.unitPrice * line.orderedQuantity * (1 - discount / 100) * (1 + tax / 100);

      lines.push({
        lineNumber: i + 1,
        productId: new Types.ObjectId(line.productId),
        productSku: product.sku,
        productName: product.name,
        orderedQuantity: line.orderedQuantity,
        receivedQuantity: 0,
        unitOfMeasure: product.unitOfMeasure,
        unitPrice: line.unitPrice,
        discount,
        tax,
        lineTotal,
        expectedDeliveryDate: line.expectedDeliveryDate,
        notes: line.notes,
      });

      subtotal += lineTotal;
    }

    // Generate order number
    const orderNumber = await this.generateOrderNumber(tenantId);

    // Calculate totals
    const shippingCost = dto.shippingCost || 0;
    const totalAmount = subtotal + shippingCost;

    const purchaseOrder = new this.poModel({
      orderNumber,
      supplierId: new Types.ObjectId(dto.supplierId),
      supplierName: supplier.name,
      status: PurchaseOrderStatus.DRAFT,
      orderDate: new Date(),
      expectedDeliveryDate: dto.expectedDeliveryDate,
      lines,
      subtotal,
      discountAmount: 0,
      taxAmount: 0,
      shippingCost,
      totalAmount,
      deliveryLocationId: dto.deliveryLocationId
        ? new Types.ObjectId(dto.deliveryLocationId)
        : undefined,
      paymentTerms: dto.paymentTerms || supplier.paymentTerms,
      notes: dto.notes,
      internalNotes: dto.internalNotes,
      requestedBy: userId,
      tenantId,
      organizationId,
      clinicId,
      createdBy: userId,
    });

    const savedPO = await purchaseOrder.save();

    this.eventEmitter.emit('purchase-order.created', {
      purchaseOrderId: savedPO._id.toString(),
      orderNumber: savedPO.orderNumber,
      supplierId: dto.supplierId,
      totalAmount,
      tenantId,
      organizationId,
      clinicId,
      timestamp: new Date(),
    });

    this.logger.log(`Purchase order created: ${savedPO.orderNumber}`);
    return savedPO;
  }

  /**
   * Approve purchase order
   */
  async approve(id: string, tenantId: string, userId: string): Promise<PurchaseOrder> {
    this.logger.log(`Approving purchase order ${id}`);

    const po = await this.findById(id, tenantId);

    if (po.status !== PurchaseOrderStatus.DRAFT && po.status !== PurchaseOrderStatus.SUBMITTED) {
      throw new BadRequestException(`Cannot approve purchase order in status ${po.status}`);
    }

    po.status = PurchaseOrderStatus.APPROVED;
    po.approvedBy = userId;
    po.approvedAt = new Date();
    po.updatedBy = userId;

    const updatedPO = await po.save();

    this.eventEmitter.emit('purchase-order.approved', {
      purchaseOrderId: updatedPO._id.toString(),
      orderNumber: updatedPO.orderNumber,
      approvedBy: userId,
      tenantId,
      timestamp: new Date(),
    });

    this.logger.log(`Purchase order approved: ${updatedPO.orderNumber}`);
    return updatedPO;
  }

  /**
   * Mark purchase order as received
   * Triggered by goods receipt creation
   */
  async markAsReceived(
    id: string,
    receivedQuantities: Map<string, number>,
    tenantId: string,
  ): Promise<PurchaseOrder> {
    this.logger.log(`Marking purchase order ${id} as received`);

    const po = await this.findById(id, tenantId);

    // Update received quantities
    for (const line of po.lines) {
      const productId = line.productId.toString();
      const receivedQty = receivedQuantities.get(productId) || 0;
      line.receivedQuantity += receivedQty;
    }

    // Check if fully or partially received
    const allFullyReceived = po.lines.every(
      (line) => line.receivedQuantity >= line.orderedQuantity,
    );

    const anyReceived = po.lines.some((line) => line.receivedQuantity > 0);

    if (allFullyReceived) {
      po.status = PurchaseOrderStatus.RECEIVED;
      po.actualDeliveryDate = new Date();
    } else if (anyReceived) {
      po.status = PurchaseOrderStatus.PARTIALLY_RECEIVED;
    }

    return po.save();
  }

  async findById(id: string, tenantId: string): Promise<PurchaseOrder> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid purchase order ID');
    }

    const po = await this.poModel.findOne({ _id: id, tenantId }).populate('supplierId');

    if (!po) {
      throw new NotFoundException(`Purchase order ${id} not found`);
    }

    return po;
  }

  async findAll(
    tenantId: string,
    clinicId?: string,
    status?: PurchaseOrderStatus,
  ): Promise<PurchaseOrder[]> {
    const filter: any = { tenantId };

    if (clinicId) {
      filter.clinicId = clinicId;
    }

    if (status) {
      filter.status = status;
    }

    return this.poModel.find(filter).sort({ orderDate: -1 }).exec();
  }

  private async generateOrderNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.poModel.countDocuments({
      tenantId,
      orderNumber: { $regex: `^PO-${year}-` },
    });

    return `PO-${year}-${String(count + 1).padStart(4, '0')}`;
  }
}
