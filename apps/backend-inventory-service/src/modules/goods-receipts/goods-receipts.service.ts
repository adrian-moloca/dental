import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GoodsReceipt, ReceiptStatus } from './schemas/goods-receipt.schema';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { StockService } from '../stock/stock.service';
import { PurchaseOrdersService } from '../purchase-orders/purchase-orders.service';
import { Product } from '../products/schemas/product.schema';
import { Supplier } from '../suppliers/schemas/supplier.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Goods Receipts Service
 * Handles receiving inventory and automatically updating stock levels
 */
@Injectable()
export class GoodsReceiptsService {
  private readonly logger = new Logger(GoodsReceiptsService.name);

  constructor(
    @InjectModel(GoodsReceipt.name) private grModel: Model<GoodsReceipt>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Supplier.name) private supplierModel: Model<Supplier>,
    @InjectConnection() private connection: Connection,
    private stockService: StockService,
    private poService: PurchaseOrdersService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create goods receipt and update stock
   * Uses transaction to ensure atomicity
   */
  async create(
    dto: CreateGoodsReceiptDto,
    tenantId: string,
    organizationId: string,
    clinicId: string,
    userId: string,
    userName: string,
  ): Promise<GoodsReceipt> {
    this.logger.log(`Creating goods receipt for supplier ${dto.supplierId}`);

    // Validate supplier
    const supplier = await this.supplierModel.findOne({
      _id: dto.supplierId,
      tenantId,
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier ${dto.supplierId} not found`);
    }

    // Validate PO if provided
    let purchaseOrder: any = null;
    if (dto.purchaseOrderId) {
      purchaseOrder = await this.poService.findById(dto.purchaseOrderId, tenantId);
    }

    const session = await this.connection.startSession();

    try {
      return await session.withTransaction(async () => {
        // Generate receipt number
        const receiptNumber = await this.generateReceiptNumber(tenantId);

        // Build lines and validate products
        const lines = [];
        let totalValue = 0;
        const receivedQuantities = new Map<string, number>();

        for (let i = 0; i < dto.lines.length; i++) {
          const line = dto.lines[i];
          const product = await this.productModel.findOne({
            _id: line.productId,
            tenantId,
          });

          if (!product) {
            throw new NotFoundException(`Product ${line.productId} not found`);
          }

          const lineTotal = line.unitCost * line.receivedQuantity;

          lines.push({
            lineNumber: i + 1,
            productId: new Types.ObjectId(line.productId),
            productSku: product.sku,
            productName: product.name,
            receivedQuantity: line.receivedQuantity,
            unitOfMeasure: product.unitOfMeasure,
            unitCost: line.unitCost,
            lineTotal,
            lotNumber: line.lotNumber,
            supplierLotNumber: line.supplierLotNumber,
            expirationDate: line.expirationDate,
            manufacturedDate: line.manufacturedDate,
            serialNumber: line.serialNumber,
            locationId: new Types.ObjectId(line.locationId),
            qualityAccepted: line.qualityAccepted !== false,
            notes: line.notes,
          });

          totalValue += lineTotal;

          // Track quantities for PO update
          const currentQty = receivedQuantities.get(line.productId) || 0;
          receivedQuantities.set(line.productId, currentQty + line.receivedQuantity);

          // Restock inventory
          await this.stockService.restock(
            {
              productId: line.productId,
              locationId: line.locationId,
              quantity: line.receivedQuantity,
              lotNumber: line.lotNumber,
              supplierLotNumber: line.supplierLotNumber,
              expirationDate: line.expirationDate,
              manufacturedDate: line.manufacturedDate,
              serialNumber: line.serialNumber,
              costPerUnit: line.unitCost,
              supplierId: dto.supplierId,
              reason: 'Goods receipt',
              referenceType: 'GOODS_RECEIPT',
              referenceId: receiptNumber,
            },
            tenantId,
            organizationId,
            clinicId,
            userId,
          );
        }

        // Create goods receipt
        const goodsReceipt = new this.grModel({
          receiptNumber,
          purchaseOrderId: dto.purchaseOrderId
            ? new Types.ObjectId(dto.purchaseOrderId)
            : undefined,
          purchaseOrderNumber: purchaseOrder?.orderNumber,
          supplierId: new Types.ObjectId(dto.supplierId),
          supplierName: supplier.name,
          status: ReceiptStatus.COMPLETED,
          receivedDate: new Date(),
          receivedBy: userId,
          receivedByName: userName,
          lines,
          deliveryNote: dto.deliveryNote,
          notes: dto.notes,
          inspectionCompleted: true,
          totalValue,
          tenantId,
          organizationId,
          clinicId,
          createdBy: userId,
        });

        const savedGR = await goodsReceipt.save({ session });

        // Update purchase order if linked
        if (purchaseOrder) {
          await this.poService.markAsReceived(
            purchaseOrder._id.toString(),
            receivedQuantities,
            tenantId,
          );
        }

        this.eventEmitter.emit('goods-receipt.created', {
          goodsReceiptId: savedGR._id.toString(),
          receiptNumber: savedGR.receiptNumber,
          purchaseOrderId: dto.purchaseOrderId,
          supplierId: dto.supplierId,
          totalValue,
          tenantId,
          organizationId,
          clinicId,
          timestamp: new Date(),
        });

        this.logger.log(`Goods receipt created: ${savedGR.receiptNumber}`);
        return savedGR;
      });
    } finally {
      await session.endSession();
    }
  }

  async findById(id: string, tenantId: string): Promise<GoodsReceipt> {
    const gr = await this.grModel.findOne({ _id: id, tenantId }).populate('supplierId');

    if (!gr) {
      throw new NotFoundException(`Goods receipt ${id} not found`);
    }

    return gr;
  }

  async findAll(tenantId: string, clinicId?: string): Promise<GoodsReceipt[]> {
    const filter: any = { tenantId };
    if (clinicId) {
      filter.clinicId = clinicId;
    }

    return this.grModel.find(filter).sort({ receivedDate: -1 }).exec();
  }

  private async generateReceiptNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.grModel.countDocuments({
      tenantId,
      receiptNumber: { $regex: `^GR-${year}-` },
    });

    return `GR-${year}-${String(count + 1).padStart(4, '0')}`;
  }
}
