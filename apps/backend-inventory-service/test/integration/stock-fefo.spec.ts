import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

import { StockModule } from '../../src/modules/stock/stock.module';
import { ProductsModule } from '../../src/modules/products/products.module';
import { StockService } from '../../src/modules/stock/stock.service';
import { ProductsService } from '../../src/modules/products/products.service';
import { ProductType } from '../../src/modules/products/schemas/product.schema';

/**
 * Integration tests for FEFO (First-Expired-First-Out) stock deduction logic
 *
 * Test scenarios:
 * 1. Basic FEFO deduction with multiple lots
 * 2. Partial lot deduction
 * 3. Multi-item deduction (procedure scenario)
 * 4. Insufficient stock handling
 * 5. Low stock alert emission
 * 6. Concurrent stock operations
 */
describe('Stock FEFO Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  let app: TestingModule;
  let stockService: StockService;
  let productsService: ProductsService;
  let connection: Connection;

  const tenantId = 'test-tenant-001';
  const organizationId = 'test-org-001';
  const clinicId = 'test-clinic-001';
  const userId = 'test-user-001';

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    app = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        EventEmitterModule.forRoot(),
        StockModule,
        ProductsModule,
      ],
    }).compile();

    stockService = app.get<StockService>(StockService);
    productsService = app.get<ProductsService>(ProductsService);
    connection = app.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    await connection.close();
    await mongoServer.stop();
    await app.close();
  });

  afterEach(async () => {
    // Clean up collections after each test
    const collections = connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe('FEFO Deduction Logic', () => {
    it('should deduct from earliest expiring lot first', async () => {
      // Arrange: Create product
      const product = await productsService.create(
        {
          sku: 'GLOVE-001',
          name: 'Nitrile Gloves',
          type: ProductType.CONSUMABLE,
          category: 'PPE',
          unitOfMeasure: 'box',
          reorderPoint: 10,
          hasExpiration: true,
        },
        tenantId,
        organizationId,
        userId,
      );

      // Create location (simplified - in real test, create via LocationService)
      const locationId = 'location-001';

      // Restock with 3 lots with different expiration dates
      const lot1Date = new Date('2024-12-31'); // Expires soonest
      const lot2Date = new Date('2025-06-30');
      const lot3Date = new Date('2025-12-31'); // Expires latest

      await stockService.restock(
        {
          productId: product._id.toString(),
          locationId,
          quantity: 10,
          lotNumber: 'LOT-001',
          expirationDate: lot1Date,
          costPerUnit: 15.0,
          reason: 'Initial stock',
        },
        tenantId,
        organizationId,
        clinicId,
        userId,
      );

      await stockService.restock(
        {
          productId: product._id.toString(),
          locationId,
          quantity: 10,
          lotNumber: 'LOT-002',
          expirationDate: lot2Date,
          costPerUnit: 15.0,
          reason: 'Initial stock',
        },
        tenantId,
        organizationId,
        clinicId,
        userId,
      );

      await stockService.restock(
        {
          productId: product._id.toString(),
          locationId,
          quantity: 10,
          lotNumber: 'LOT-003',
          expirationDate: lot3Date,
          costPerUnit: 15.0,
          reason: 'Initial stock',
        },
        tenantId,
        organizationId,
        clinicId,
        userId,
      );

      // Act: Deduct 5 units using FEFO
      const result = await stockService.deductStock(
        {
          locationId,
          materials: [{ productId: product._id.toString(), quantity: 5 }],
          reason: 'Test deduction',
        },
        tenantId,
        organizationId,
        clinicId,
        userId,
      );

      // Assert: Should deduct from LOT-001 (earliest expiration)
      expect(result.success).toBe(true);
      expect(result.lotsUsed).toHaveLength(1);
      expect(result.lotsUsed[0].lotNumber).toBe('LOT-001');
      expect(result.lotsUsed[0].quantityDeducted).toBe(5);

      // Verify stock levels
      const stockLevel = await stockService.getCurrentStockLevel(
        product._id.toString(),
        locationId,
        tenantId,
        clinicId,
      );
      expect(stockLevel).toBe(25); // 30 - 5 = 25
    });

    it('should handle partial lot deduction across multiple lots', async () => {
      // Arrange
      const product = await productsService.create(
        {
          sku: 'MASK-001',
          name: 'Surgical Masks',
          type: ProductType.CONSUMABLE,
          category: 'PPE',
          unitOfMeasure: 'box',
          hasExpiration: true,
        },
        tenantId,
        organizationId,
        userId,
      );

      const locationId = 'location-001';

      // Restock 2 lots
      await stockService.restock(
        {
          productId: product._id.toString(),
          locationId,
          quantity: 7,
          lotNumber: 'LOT-A',
          expirationDate: new Date('2024-12-31'),
          costPerUnit: 10.0,
          reason: 'Initial stock',
        },
        tenantId,
        organizationId,
        clinicId,
        userId,
      );

      await stockService.restock(
        {
          productId: product._id.toString(),
          locationId,
          quantity: 10,
          lotNumber: 'LOT-B',
          expirationDate: new Date('2025-06-30'),
          costPerUnit: 10.0,
          reason: 'Initial stock',
        },
        tenantId,
        organizationId,
        clinicId,
        userId,
      );

      // Act: Deduct 12 units (more than first lot)
      const result = await stockService.deductStock(
        {
          locationId,
          materials: [{ productId: product._id.toString(), quantity: 12 }],
          reason: 'Test partial lot deduction',
        },
        tenantId,
        organizationId,
        clinicId,
        userId,
      );

      // Assert: Should deduct 7 from LOT-A, then 5 from LOT-B
      expect(result.success).toBe(true);
      expect(result.lotsUsed).toHaveLength(2);

      expect(result.lotsUsed[0].lotNumber).toBe('LOT-A');
      expect(result.lotsUsed[0].quantityDeducted).toBe(7);

      expect(result.lotsUsed[1].lotNumber).toBe('LOT-B');
      expect(result.lotsUsed[1].quantityDeducted).toBe(5);

      // Verify stock
      const stockLevel = await stockService.getCurrentStockLevel(
        product._id.toString(),
        locationId,
        tenantId,
        clinicId,
      );
      expect(stockLevel).toBe(5); // 17 - 12 = 5
    });

    it('should reject deduction when insufficient stock', async () => {
      // Arrange
      const product = await productsService.create(
        {
          sku: 'SYRINGE-001',
          name: 'Disposable Syringe',
          type: ProductType.CONSUMABLE,
          category: 'Medical Supplies',
          unitOfMeasure: 'piece',
        },
        tenantId,
        organizationId,
        userId,
      );

      const locationId = 'location-001';

      await stockService.restock(
        {
          productId: product._id.toString(),
          locationId,
          quantity: 5,
          lotNumber: 'LOT-X',
          costPerUnit: 2.0,
          reason: 'Initial stock',
        },
        tenantId,
        organizationId,
        clinicId,
        userId,
      );

      // Act & Assert: Try to deduct more than available
      await expect(
        stockService.deductStock(
          {
            locationId,
            materials: [{ productId: product._id.toString(), quantity: 10 }],
            reason: 'Test insufficient stock',
          },
          tenantId,
          organizationId,
          clinicId,
          userId,
        ),
      ).rejects.toThrow(/Insufficient stock/);
    });

    it('should deduct multiple products in single transaction (procedure scenario)', async () => {
      // Arrange: Create multiple products
      const product1 = await productsService.create(
        {
          sku: 'ANESTHETIC-001',
          name: 'Local Anesthetic',
          type: ProductType.MEDICATION,
          category: 'Anesthetics',
          unitOfMeasure: 'ml',
        },
        tenantId,
        organizationId,
        userId,
      );

      const product2 = await productsService.create(
        {
          sku: 'GAUZE-001',
          name: 'Sterile Gauze',
          type: ProductType.CONSUMABLE,
          category: 'Consumables',
          unitOfMeasure: 'piece',
        },
        tenantId,
        organizationId,
        userId,
      );

      const locationId = 'location-001';

      // Restock both products
      await stockService.restock(
        {
          productId: product1._id.toString(),
          locationId,
          quantity: 50,
          lotNumber: 'LOT-ANES-001',
          costPerUnit: 5.0,
          reason: 'Initial stock',
        },
        tenantId,
        organizationId,
        clinicId,
        userId,
      );

      await stockService.restock(
        {
          productId: product2._id.toString(),
          locationId,
          quantity: 100,
          lotNumber: 'LOT-GAUZE-001',
          costPerUnit: 0.5,
          reason: 'Initial stock',
        },
        tenantId,
        organizationId,
        clinicId,
        userId,
      );

      // Act: Deduct both products in single operation (simulating procedure)
      const correlationId = 'procedure-12345';
      const result = await stockService.deductStock(
        {
          locationId,
          materials: [
            { productId: product1._id.toString(), quantity: 5 },
            { productId: product2._id.toString(), quantity: 10 },
          ],
          referenceType: 'PROCEDURE',
          referenceId: 'procedure-12345',
          reason: 'Root canal procedure',
          correlationId,
        },
        tenantId,
        organizationId,
        clinicId,
        userId,
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.movementIds.length).toBeGreaterThanOrEqual(2);
      expect(result.lotsUsed).toHaveLength(2);

      // Verify stock levels
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

      expect(stock1).toBe(45);
      expect(stock2).toBe(90);
    });

    it('should emit low stock warning when below reorder point', async () => {
      // Arrange
      const product = await productsService.create(
        {
          sku: 'DRILL-BIT-001',
          name: 'Dental Drill Bit',
          type: ProductType.INSTRUMENT,
          category: 'Instruments',
          unitOfMeasure: 'piece',
          reorderPoint: 10,
          reorderQuantity: 20,
        },
        tenantId,
        organizationId,
        userId,
      );

      const locationId = 'location-001';

      // Restock with quantity just above reorder point
      await stockService.restock(
        {
          productId: product._id.toString(),
          locationId,
          quantity: 12,
          lotNumber: 'LOT-DRILL-001',
          costPerUnit: 25.0,
          reason: 'Initial stock',
        },
        tenantId,
        organizationId,
        clinicId,
        userId,
      );

      // Act: Deduct enough to go below reorder point
      const result = await stockService.deductStock(
        {
          locationId,
          materials: [{ productId: product._id.toString(), quantity: 5 }],
          reason: 'Test low stock warning',
        },
        tenantId,
        organizationId,
        clinicId,
        userId,
      );

      // Assert: Should have warning
      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings?.length).toBeGreaterThan(0);
      expect(result.warnings?.[0]).toContain('below reorder point');
    });
  });

  describe('Performance Tests', () => {
    it('should complete FEFO deduction in <50ms with 20 lots', async () => {
      // Arrange: Create product
      const product = await productsService.create(
        {
          sku: 'PERF-TEST-001',
          name: 'Performance Test Item',
          type: ProductType.CONSUMABLE,
          category: 'Test',
          unitOfMeasure: 'unit',
          hasExpiration: true,
        },
        tenantId,
        organizationId,
        userId,
      );

      const locationId = 'location-001';

      // Create 20 lots with different expiration dates
      const baseDate = new Date('2024-01-01');
      for (let i = 0; i < 20; i++) {
        const expirationDate = new Date(baseDate);
        expirationDate.setDate(baseDate.getDate() + i * 30); // 30 days apart

        await stockService.restock(
          {
            productId: product._id.toString(),
            locationId,
            quantity: 10,
            lotNumber: `PERF-LOT-${String(i + 1).padStart(3, '0')}`,
            expirationDate,
            costPerUnit: 10.0,
            reason: 'Performance test',
          },
          tenantId,
          organizationId,
          clinicId,
          userId,
        );
      }

      // Act: Measure deduction time
      const startTime = Date.now();

      await stockService.deductStock(
        {
          locationId,
          materials: [{ productId: product._id.toString(), quantity: 15 }],
          reason: 'Performance test deduction',
        },
        tenantId,
        organizationId,
        clinicId,
        userId,
      );

      const duration = Date.now() - startTime;

      // Assert: Should complete in <50ms
      expect(duration).toBeLessThan(50);
    });
  });
});
