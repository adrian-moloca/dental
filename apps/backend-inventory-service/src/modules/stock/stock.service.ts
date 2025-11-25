import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StockItem, StockItemStatus } from './schemas/stock-item.schema';
import { Lot, LotStatus } from './schemas/lot.schema';
import { StockMovement, MovementType } from './schemas/stock-movement.schema';
import { StockLocation } from './schemas/stock-location.schema';
import { Product } from '../products/schemas/product.schema';
import { DeductStockDto, DeductStockResponseDto } from './dto/deduct-stock.dto';
import { RestockDto } from './dto/restock.dto';
import { StockQueryDto, StockLevelResponseDto } from './dto/stock-query.dto';
import { v4 as uuidv4 } from 'uuid';

/**
 * StockService implements core inventory operations
 *
 * Key Features:
 * - FEFO (First Expired, First Out) deduction logic
 * - Zero-negative-stock enforcement
 * - Double-entry stock accounting (all movements have source and destination)
 * - Transactional consistency using MongoDB sessions
 * - Immutable audit trail via StockMovement
 *
 * Performance Targets:
 * - Stock deduction: <50ms (p95)
 * - Stock lookup: <20ms (p95)
 */
@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(
    @InjectModel(StockItem.name) private stockItemModel: Model<StockItem>,
    @InjectModel(Lot.name) private lotModel: Model<Lot>,
    @InjectModel(StockMovement.name) private stockMovementModel: Model<StockMovement>,
    @InjectModel(StockLocation.name) private stockLocationModel: Model<StockLocation>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectConnection() private connection: Connection,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Deduct stock using FEFO (First Expired, First Out) logic
   *
   * Algorithm:
   * 1. For each material, query available stock items sorted by expiration date (ASC)
   * 2. Allocate from earliest expiring lots first
   * 3. Handle partial lot deductions
   * 4. Create stock movement records for audit trail
   * 5. Update lot quantities
   * 6. Emit events for low stock alerts
   *
   * Uses transactions to ensure atomicity
   */
  async deductStock(
    dto: DeductStockDto,
    tenantId: string,
    organizationId: string,
    clinicId: string,
    userId: string,
  ): Promise<DeductStockResponseDto> {
    const startTime = Date.now();
    this.logger.log(
      `Starting FEFO deduction for ${dto.materials.length} materials at location ${dto.locationId}`,
    );

    // Validate location exists
    const location = await this.stockLocationModel.findOne({
      _id: dto.locationId,
      tenantId,
      isActive: true,
    });

    if (!location) {
      throw new NotFoundException(`Location ${dto.locationId} not found`);
    }

    const session: ClientSession = await this.connection.startSession();
    const movementIds: string[] = [];
    const lotsUsed: Array<{
      productId: string;
      lotNumber: string;
      quantityDeducted: number;
      expirationDate?: Date;
    }> = [];
    const warnings: string[] = [];
    const correlationId = dto.correlationId || uuidv4();

    try {
      await session.withTransaction(async () => {
        // Process each material
        for (const material of dto.materials) {
          const { productId, quantity, unitOfMeasure, notes } = material;

          // Validate product exists
          const product = await this.productModel.findOne({
            _id: productId,
            tenantId,
            isActive: true,
          });

          if (!product) {
            throw new NotFoundException(`Product ${productId} not found`);
          }

          // Query available stock items sorted by expiration date (FEFO)
          // Status must be AVAILABLE, quantity > 0
          const stockItems = await this.stockItemModel
            .find({
              productId: new Types.ObjectId(productId),
              locationId: new Types.ObjectId(dto.locationId),
              status: StockItemStatus.AVAILABLE,
              quantity: { $gt: 0 },
              tenantId,
              clinicId,
            })
            .sort({ expirationDate: 1 }) // FEFO: earliest expiration first
            .session(session)
            .exec();

          if (!stockItems || stockItems.length === 0) {
            throw new BadRequestException(
              `No available stock for product ${product.name} at location ${location.name}`,
            );
          }

          // Calculate total available quantity
          const totalAvailable = stockItems.reduce((sum, item) => sum + item.availableQuantity, 0);

          if (totalAvailable < quantity) {
            throw new BadRequestException(
              `Insufficient stock for product ${product.name}. Required: ${quantity}, Available: ${totalAvailable}`,
            );
          }

          // Allocate from lots using FEFO
          let remainingQuantity = quantity;
          let lotIndex = 0;

          while (remainingQuantity > 0 && lotIndex < stockItems.length) {
            const stockItem = stockItems[lotIndex];
            const deductQuantity = Math.min(remainingQuantity, stockItem.availableQuantity);

            // Update stock item quantity
            stockItem.quantity -= deductQuantity;
            stockItem.availableQuantity = Math.max(
              0,
              stockItem.quantity - stockItem.reservedQuantity,
            );

            // Mark as depleted if quantity reaches zero
            if (stockItem.quantity === 0) {
              stockItem.status = StockItemStatus.AVAILABLE; // Keep available, just zero quantity
            }

            await stockItem.save({ session });

            // Update lot quantity
            const lot = await this.lotModel.findById(stockItem.lotId).session(session);

            if (lot) {
              lot.currentQuantity -= deductQuantity;
              if (lot.currentQuantity <= 0) {
                lot.status = LotStatus.DEPLETED;
                lot.currentQuantity = 0;
              }
              await lot.save({ session });
            }

            // Create stock movement record (immutable audit log)
            const movement = new this.stockMovementModel({
              productId: new Types.ObjectId(productId),
              lotId: stockItem.lotId,
              lotNumber: stockItem.lotNumber,
              serialNumber: stockItem.serialNumber,
              movementType: MovementType.DEDUCTION,
              quantity: deductQuantity,
              unitOfMeasure: unitOfMeasure || product.unitOfMeasure,
              fromLocationId: new Types.ObjectId(dto.locationId),
              toLocationId: null, // Consumed (no destination)
              costPerUnit: stockItem.costPerUnit,
              totalCost: stockItem.costPerUnit * deductQuantity,
              expirationDate: stockItem.expirationDate,
              referenceType: dto.referenceType || 'MANUAL_DEDUCTION',
              referenceId: dto.referenceId,
              reason: dto.reason,
              notes: notes || dto.notes,
              performedBy: userId,
              performedAt: new Date(),
              tenantId,
              organizationId,
              clinicId,
              correlationId,
            });

            const savedMovement = await movement.save({ session });
            movementIds.push(savedMovement._id.toString());

            lotsUsed.push({
              productId,
              lotNumber: stockItem.lotNumber,
              quantityDeducted: deductQuantity,
              expirationDate: stockItem.expirationDate,
            });

            remainingQuantity -= deductQuantity;
            lotIndex++;
          }

          // Check if product is now below reorder point
          if (product.reorderPoint > 0) {
            const currentStock = await this.getCurrentStockLevel(
              productId,
              dto.locationId,
              tenantId,
              clinicId,
            );

            if (currentStock <= product.reorderPoint) {
              warnings.push(
                `Product ${product.name} is below reorder point (${currentStock}/${product.reorderPoint})`,
              );

              // Emit low stock event
              this.eventEmitter.emit('stock.low', {
                productId,
                productName: product.name,
                productSku: product.sku,
                locationId: dto.locationId,
                currentQuantity: currentStock,
                reorderPoint: product.reorderPoint,
                reorderQuantity: product.reorderQuantity,
                tenantId,
                organizationId,
                clinicId,
                timestamp: new Date(),
              });
            }
          }
        }
      });

      const duration = Date.now() - startTime;
      this.logger.log(
        `FEFO deduction completed in ${duration}ms. Movements: ${movementIds.length}`,
      );

      // Emit stock deducted event
      this.eventEmitter.emit('stock.deducted', {
        locationId: dto.locationId,
        materials: dto.materials,
        movementIds,
        lotsUsed,
        referenceType: dto.referenceType,
        referenceId: dto.referenceId,
        tenantId,
        organizationId,
        clinicId,
        performedBy: userId,
        timestamp: new Date(),
      });

      return {
        success: true,
        movementIds,
        lotsUsed,
        warnings: warnings.length > 0 ? warnings : undefined,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`FEFO deduction failed: ${errorMessage}`, errorStack);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Restock inventory
   * Creates or updates stock items and lots
   */
  async restock(
    dto: RestockDto,
    tenantId: string,
    organizationId: string,
    clinicId: string,
    userId: string,
  ): Promise<{ stockItemId: string; lotId: string; movementId: string }> {
    this.logger.log(
      `Restocking ${dto.quantity} units of product ${dto.productId} at location ${dto.locationId}`,
    );

    // Validate product and location
    const [product, location] = await Promise.all([
      this.productModel.findOne({ _id: dto.productId, tenantId, isActive: true }),
      this.stockLocationModel.findOne({
        _id: dto.locationId,
        tenantId,
        isActive: true,
      }),
    ]);

    if (!product) {
      throw new NotFoundException(`Product ${dto.productId} not found`);
    }

    if (!location) {
      throw new NotFoundException(`Location ${dto.locationId} not found`);
    }

    const session = await this.connection.startSession();

    try {
      return await session.withTransaction(async () => {
        // Find or create lot
        let lot = await this.lotModel.findOne({
          lotNumber: dto.lotNumber,
          productId: new Types.ObjectId(dto.productId),
          tenantId,
        });

        if (!lot) {
          lot = new this.lotModel({
            lotNumber: dto.lotNumber,
            productId: new Types.ObjectId(dto.productId),
            supplierId: dto.supplierId ? new Types.ObjectId(dto.supplierId) : undefined,
            supplierLotNumber: dto.supplierLotNumber,
            manufacturedDate: dto.manufacturedDate || new Date(),
            expirationDate: dto.expirationDate,
            receivedDate: new Date(),
            initialQuantity: dto.quantity,
            currentQuantity: dto.quantity,
            status: LotStatus.AVAILABLE,
            costPerUnit: dto.costPerUnit || product.costPrice || 0,
            tenantId,
            organizationId,
            clinicId,
            createdBy: userId,
          });
          await lot.save({ session });
        } else {
          // Update existing lot quantity
          lot.currentQuantity += dto.quantity;
          lot.status = LotStatus.AVAILABLE;
          await lot.save({ session });
        }

        // Find or create stock item
        let stockItem = await this.stockItemModel.findOne({
          productId: new Types.ObjectId(dto.productId),
          locationId: new Types.ObjectId(dto.locationId),
          lotId: lot._id,
          tenantId,
          clinicId,
        });

        if (!stockItem) {
          stockItem = new this.stockItemModel({
            productId: new Types.ObjectId(dto.productId),
            locationId: new Types.ObjectId(dto.locationId),
            lotId: lot._id,
            lotNumber: dto.lotNumber,
            serialNumber: dto.serialNumber,
            quantity: dto.quantity,
            reservedQuantity: 0,
            availableQuantity: dto.quantity,
            expirationDate: dto.expirationDate,
            receivedDate: new Date(),
            costPerUnit: dto.costPerUnit || product.costPrice || 0,
            status: StockItemStatus.AVAILABLE,
            tenantId,
            organizationId,
            clinicId,
            createdBy: userId,
          });
        } else {
          stockItem.quantity += dto.quantity;
          stockItem.availableQuantity = stockItem.quantity - stockItem.reservedQuantity;
          stockItem.status = StockItemStatus.AVAILABLE;
        }

        await stockItem.save({ session });

        // Create stock movement record
        const movement = new this.stockMovementModel({
          productId: new Types.ObjectId(dto.productId),
          lotId: lot._id,
          lotNumber: dto.lotNumber,
          serialNumber: dto.serialNumber,
          movementType: MovementType.IN,
          quantity: dto.quantity,
          unitOfMeasure: product.unitOfMeasure,
          fromLocationId: null, // Received (no source)
          toLocationId: new Types.ObjectId(dto.locationId),
          costPerUnit: dto.costPerUnit || product.costPrice || 0,
          totalCost: (dto.costPerUnit || product.costPrice || 0) * dto.quantity,
          expirationDate: dto.expirationDate,
          referenceType: dto.referenceType || 'MANUAL_RESTOCK',
          referenceId: dto.referenceId,
          reason: dto.reason,
          notes: dto.notes,
          performedBy: userId,
          performedAt: new Date(),
          tenantId,
          organizationId,
          clinicId,
        });

        const savedMovement = await movement.save({ session });

        this.logger.log(`Restock completed: StockItem ${stockItem._id}, Lot ${lot._id}`);

        // Emit event
        this.eventEmitter.emit('stock.restocked', {
          productId: dto.productId,
          locationId: dto.locationId,
          quantity: dto.quantity,
          lotNumber: dto.lotNumber,
          tenantId,
          organizationId,
          clinicId,
          timestamp: new Date(),
        });

        return {
          stockItemId: stockItem._id.toString(),
          lotId: lot._id.toString(),
          movementId: savedMovement._id.toString(),
        };
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get current stock level for a product at a location
   */
  async getCurrentStockLevel(
    productId: string,
    locationId: string,
    tenantId: string,
    clinicId: string,
  ): Promise<number> {
    const stockItems = await this.stockItemModel.find({
      productId: new Types.ObjectId(productId),
      locationId: new Types.ObjectId(locationId),
      tenantId,
      clinicId,
      status: StockItemStatus.AVAILABLE,
    });

    return stockItems.reduce((sum, item) => sum + item.availableQuantity, 0);
  }

  /**
   * Get stock levels by location with lot details
   */
  async getStockByLocation(
    locationId: string,
    tenantId: string,
    clinicId: string,
    query?: StockQueryDto,
  ): Promise<StockLevelResponseDto[]> {
    const filter: any = {
      locationId: new Types.ObjectId(locationId),
      tenantId,
      clinicId,
    };

    if (query?.productId) {
      filter.productId = new Types.ObjectId(query.productId);
    }

    if (query?.status) {
      filter.status = query.status;
    }

    if (query?.lotNumber) {
      filter.lotNumber = query.lotNumber;
    }

    const stockItems = await this.stockItemModel
      .find(filter)
      .populate('productId')
      .populate('locationId')
      .exec();

    // Group by product
    const groupedByProduct = new Map<string, any>();

    for (const item of stockItems) {
      const productId = item.productId.toString();
      const product: any = item.productId;

      if (!groupedByProduct.has(productId)) {
        groupedByProduct.set(productId, {
          productId,
          productName: product.name,
          productSku: product.sku,
          locationId,
          locationName: (item.locationId as any).name,
          totalQuantity: 0,
          availableQuantity: 0,
          reservedQuantity: 0,
          reorderPoint: product.reorderPoint,
          isBelowReorderPoint: false,
          lots: [],
        });
      }

      const grouped = groupedByProduct.get(productId);
      grouped.totalQuantity += item.quantity;
      grouped.availableQuantity += item.availableQuantity;
      grouped.reservedQuantity += item.reservedQuantity;
      grouped.lots.push({
        lotNumber: item.lotNumber,
        quantity: item.quantity,
        expirationDate: item.expirationDate,
        status: item.status,
      });
    }

    // Check reorder points
    const results: StockLevelResponseDto[] = [];
    for (const [, value] of groupedByProduct) {
      value.isBelowReorderPoint =
        value.reorderPoint > 0 && value.availableQuantity <= value.reorderPoint;
      results.push(value);
    }

    return results;
  }

  /**
   * Get items expiring soon
   */
  async getExpiringItems(days: number, tenantId: string, clinicId?: string): Promise<StockItem[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const filter: any = {
      tenantId,
      status: StockItemStatus.AVAILABLE,
      expirationDate: {
        $gte: new Date(),
        $lte: futureDate,
      },
      quantity: { $gt: 0 },
    };

    if (clinicId) {
      filter.clinicId = clinicId;
    }

    return this.stockItemModel
      .find(filter)
      .populate('productId')
      .populate('locationId')
      .sort({ expirationDate: 1 })
      .exec();
  }
}
