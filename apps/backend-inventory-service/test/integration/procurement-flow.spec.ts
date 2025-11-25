import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

import { PurchaseOrdersModule } from '../../src/modules/purchase-orders/purchase-orders.module';
import { GoodsReceiptsModule } from '../../src/modules/goods-receipts/goods-receipts.module';
import { SuppliersModule } from '../../src/modules/suppliers/suppliers.module';
import { ProductsModule } from '../../src/modules/products/products.module';
import { StockModule } from '../../src/modules/stock/stock.module';

import { PurchaseOrdersService } from '../../src/modules/purchase-orders/purchase-orders.service';
import { GoodsReceiptsService } from '../../src/modules/goods-receipts/goods-receipts.service';
import { SuppliersService } from '../../src/modules/suppliers/suppliers.service';
import { ProductsService } from '../../src/modules/products/products.service';
import { StockService } from '../../src/modules/stock/stock.service';

import { ProductType } from '../../src/modules/products/schemas/product.schema';
import { SupplierType } from '../../src/modules/suppliers/schemas/supplier.schema';
import { PurchaseOrderStatus } from '../../src/modules/purchase-orders/schemas/purchase-order.schema';

/**
 * Integration tests for complete procurement flow:
 * Create PO → Approve → Receive → Stock Updated
 */
describe('Procurement Flow Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  let app: TestingModule;
  let poService: PurchaseOrdersService;
  let grService: GoodsReceiptsService;
  let suppliersService: SuppliersService;
  let productsService: ProductsService;
  let stockService: StockService;
  let connection: Connection;

  const tenantId = 'test-tenant-001';
  const organizationId = 'test-org-001';
  const clinicId = 'test-clinic-001';
  const userId = 'test-user-001';

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    app = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        EventEmitterModule.forRoot(),
        ProductsModule,
        StockModule,
        SuppliersModule,
        PurchaseOrdersModule,
        GoodsReceiptsModule,
      ],
    }).compile();

    poService = app.get<PurchaseOrdersService>(PurchaseOrdersService);
    grService = app.get<GoodsReceiptsService>(GoodsReceiptsService);
    suppliersService = app.get<SuppliersService>(SuppliersService);
    productsService = app.get<ProductsService>(ProductsService);
    stockService = app.get<StockService>(StockService);
    connection = app.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    await connection.close();
    await mongoServer.stop();
    await app.close();
  });

  afterEach(async () => {
    const collections = connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  it('should complete full procurement flow: PO → Approve → Receive → Stock', async () => {
    // Step 1: Create supplier
    const supplier = await suppliersService.create(
      {
        code: 'SUP-001',
        name: 'Dental Supplies Inc.',
        type: SupplierType.DISTRIBUTOR,
        email: 'orders@dentalsupplies.com',
        phone: '555-0100',
        paymentTerms: 'Net 30',
        leadTimeDays: 7,
      },
      tenantId,
      organizationId,
      userId,
    );

    // Step 2: Create products
    const product1 = await productsService.create(
      {
        sku: 'COMPOSITE-001',
        name: 'Dental Composite Resin',
        type: ProductType.MATERIAL,
        category: 'Restorative Materials',
        unitOfMeasure: 'syringe',
        costPrice: 45.0,
        hasExpiration: true,
      },
      tenantId,
      organizationId,
      userId,
    );

    const product2 = await productsService.create(
      {
        sku: 'BOND-001',
        name: 'Bonding Agent',
        type: ProductType.MATERIAL,
        category: 'Restorative Materials',
        unitOfMeasure: 'bottle',
        costPrice: 65.0,
        hasExpiration: true,
      },
      tenantId,
      organizationId,
      userId,
    );

    // Step 3: Create purchase order
    const po = await poService.create(
      {
        supplierId: supplier._id.toString(),
        lines: [
          {
            productId: product1._id.toString(),
            orderedQuantity: 20,
            unitPrice: 45.0,
          },
          {
            productId: product2._id.toString(),
            orderedQuantity: 10,
            unitPrice: 65.0,
          },
        ],
        expectedDeliveryDate: new Date('2024-12-31'),
        paymentTerms: 'Net 30',
        notes: 'Regular monthly order',
      },
      tenantId,
      organizationId,
      clinicId,
      userId,
    );

    expect(po.status).toBe(PurchaseOrderStatus.DRAFT);
    expect(po.orderNumber).toMatch(/^PO-\d{4}-\d{4}$/);
    expect(po.lines).toHaveLength(2);
    expect(po.totalAmount).toBe(45 * 20 + 65 * 10); // 1550

    // Step 4: Approve purchase order
    const approvedPO = await poService.approve(
      po._id.toString(),
      tenantId,
      'approver-001',
    );

    expect(approvedPO.status).toBe(PurchaseOrderStatus.APPROVED);
    expect(approvedPO.approvedBy).toBe('approver-001');
    expect(approvedPO.approvedAt).toBeDefined();

    // Step 5: Create goods receipt (simulate receiving shipment)
    const locationId = 'warehouse-001';

    const gr = await grService.create(
      {
        purchaseOrderId: po._id.toString(),
        supplierId: supplier._id.toString(),
        lines: [
          {
            productId: product1._id.toString(),
            receivedQuantity: 20,
            unitCost: 45.0,
            lotNumber: 'COMP-LOT-2024-001',
            expirationDate: new Date('2025-12-31'),
            manufacturedDate: new Date('2024-01-15'),
            locationId,
            qualityAccepted: true,
          },
          {
            productId: product2._id.toString(),
            receivedQuantity: 10,
            unitCost: 65.0,
            lotNumber: 'BOND-LOT-2024-001',
            expirationDate: new Date('2025-06-30'),
            manufacturedDate: new Date('2024-01-10'),
            locationId,
            qualityAccepted: true,
          },
        ],
        deliveryNote: 'DN-2024-001',
        notes: 'All items received in good condition',
      },
      tenantId,
      organizationId,
      clinicId,
      userId,
      'Receiver Name',
    );

    expect(gr.receiptNumber).toMatch(/^GR-\d{4}-\d{4}$/);
    expect(gr.status).toBe('COMPLETED');
    expect(gr.lines).toHaveLength(2);

    // Step 6: Verify stock was updated
    const stock1 = await stockService.getCurrentStockLevel(
      product1._id.toString(),
      locationId,
      tenantId,
      clinicId,
    );

    const stock2 = await stockService.getCurrentStockLevel(
      product2._id.toString(),
      locationId,
      tenantId,
      clinicId,
    );

    expect(stock1).toBe(20);
    expect(stock2).toBe(10);

    // Step 7: Verify lots were created
    const stockItems = await stockService.getStockByLocation(
      locationId,
      tenantId,
      clinicId,
    );

    expect(stockItems).toHaveLength(2);

    const composite = stockItems.find(
      item => item.productId === product1._id.toString(),
    );
    expect(composite?.lots[0].lotNumber).toBe('COMP-LOT-2024-001');

    const bond = stockItems.find(item => item.productId === product2._id.toString());
    expect(bond?.lots[0].lotNumber).toBe('BOND-LOT-2024-001');

    // Step 8: Verify PO was marked as received
    const updatedPO = await poService.findById(po._id.toString(), tenantId);
    expect(updatedPO.status).toBe(PurchaseOrderStatus.RECEIVED);
    expect(updatedPO.lines[0].receivedQuantity).toBe(20);
    expect(updatedPO.lines[1].receivedQuantity).toBe(10);
  });

  it('should handle partial receipt', async () => {
    // Create supplier and product
    const supplier = await suppliersService.create(
      {
        code: 'SUP-002',
        name: 'Medical Supplies Co.',
        type: SupplierType.DISTRIBUTOR,
      },
      tenantId,
      organizationId,
      userId,
    );

    const product = await productsService.create(
      {
        sku: 'NEEDLE-001',
        name: 'Dental Needle',
        type: ProductType.CONSUMABLE,
        category: 'Consumables',
        unitOfMeasure: 'box',
      },
      tenantId,
      organizationId,
      userId,
    );

    // Create PO for 100 boxes
    const po = await poService.create(
      {
        supplierId: supplier._id.toString(),
        lines: [
          {
            productId: product._id.toString(),
            orderedQuantity: 100,
            unitPrice: 15.0,
          },
        ],
      },
      tenantId,
      organizationId,
      clinicId,
      userId,
    );

    await poService.approve(po._id.toString(), tenantId, userId);

    // Receive only 60 boxes (partial)
    const locationId = 'warehouse-001';

    await grService.create(
      {
        purchaseOrderId: po._id.toString(),
        supplierId: supplier._id.toString(),
        lines: [
          {
            productId: product._id.toString(),
            receivedQuantity: 60,
            unitCost: 15.0,
            lotNumber: 'NEEDLE-LOT-001',
            locationId,
          },
        ],
      },
      tenantId,
      organizationId,
      clinicId,
      userId,
      'Receiver',
    );

    // Verify PO is marked as partially received
    const updatedPO = await poService.findById(po._id.toString(), tenantId);
    expect(updatedPO.status).toBe(PurchaseOrderStatus.PARTIALLY_RECEIVED);
    expect(updatedPO.lines[0].receivedQuantity).toBe(60);
    expect(updatedPO.lines[0].orderedQuantity).toBe(100);

    // Verify stock
    const stock = await stockService.getCurrentStockLevel(
      product._id.toString(),
      locationId,
      tenantId,
      clinicId,
    );
    expect(stock).toBe(60);
  });
});
