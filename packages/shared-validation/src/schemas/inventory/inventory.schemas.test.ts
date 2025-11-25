/**
 * Inventory & Procurement Validation Schemas Tests
 * @module shared-validation/schemas/inventory
 */

import { describe, it, expect } from '@jest/globals';
import {
  ProductCategory,
  UnitOfMeasure,
  ProductStatus,
  StockStatus,
  MovementType,
  PurchaseOrderStatus,
  SupplierStatus,
} from '@dentalos/shared-types';
import {
  CreateProductDtoSchema,
  UpdateProductDtoSchema,
  QueryProductsDtoSchema,
  DeductStockDtoSchema,
  RestockDtoSchema,
  StockTransferDtoSchema,
  CreatePurchaseOrderDtoSchema,
  ApprovePurchaseOrderDtoSchema,
  CreateGoodsReceiptDtoSchema,
  CreateSupplierDtoSchema,
  ProcedureBillOfMaterialsSchema,
  QueryExpiringStockDtoSchema,
  SKUSchema,
  LotNumberSchema,
  QuantitySchema,
  PriceSchema,
} from './inventory.schemas';

describe('Inventory Schemas', () => {
  describe('Value Object Schemas', () => {
    describe('SKUSchema', () => {
      it('should validate and uppercase valid SKU', () => {
        const result = SKUSchema.parse('prod-123');
        expect(result).toBe('PROD-123');
      });

      it('should reject invalid characters', () => {
        expect(() => SKUSchema.parse('PROD@123')).toThrow();
      });

      it('should reject empty SKU', () => {
        expect(() => SKUSchema.parse('')).toThrow();
      });
    });

    describe('LotNumberSchema', () => {
      it('should validate lot number', () => {
        const result = LotNumberSchema.parse('LOT-2025-001');
        expect(result).toBe('LOT-2025-001');
      });

      it('should reject special characters except hyphens/underscores', () => {
        expect(() => LotNumberSchema.parse('LOT@2025')).toThrow();
      });
    });

    describe('QuantitySchema', () => {
      it('should accept positive quantities', () => {
        expect(QuantitySchema.parse(1)).toBe(1);
        expect(QuantitySchema.parse(100.5)).toBe(100.5);
      });

      it('should reject zero', () => {
        expect(() => QuantitySchema.parse(0)).toThrow();
      });

      it('should reject negative quantities', () => {
        expect(() => QuantitySchema.parse(-5)).toThrow();
      });
    });

    describe('PriceSchema', () => {
      it('should accept valid prices', () => {
        expect(PriceSchema.parse(0)).toBe(0);
        expect(PriceSchema.parse(99.99)).toBe(99.99);
      });

      it('should reject negative prices', () => {
        expect(() => PriceSchema.parse(-1)).toThrow();
      });
    });
  });

  describe('Product Schemas', () => {
    describe('CreateProductDtoSchema', () => {
      const validProduct = {
        sku: 'IMPL-001',
        name: 'Dental Implant',
        description: 'Premium implant',
        category: ProductCategory.IMPLANT,
        unitOfMeasure: UnitOfMeasure.PIECE,
        costPrice: 150.0,
        sellPrice: 250.0,
        reorderPoint: 5,
        reorderQuantity: 10,
        requiresLot: true,
        requiresSerial: false,
        requiresSterilization: false,
        clinicId: '123e4567-e89b-12d3-a456-426614174000',
      };

      it('should validate valid product', () => {
        const result = CreateProductDtoSchema.parse(validProduct);
        expect(result.sku).toBe('IMPL-001');
        expect(result.name).toBe('Dental Implant');
      });

      it('should reject sell price < cost price', () => {
        expect(() =>
          CreateProductDtoSchema.parse({
            ...validProduct,
            costPrice: 300,
            sellPrice: 200,
          })
        ).toThrow(/sell price must be greater than or equal to cost price/i);
      });

      it('should reject reorder quantity < reorder point', () => {
        expect(() =>
          CreateProductDtoSchema.parse({
            ...validProduct,
            reorderPoint: 20,
            reorderQuantity: 10,
          })
        ).toThrow(/reorder quantity must be greater than or equal to reorder point/i);
      });

      it('should reject both lot and serial tracking', () => {
        expect(() =>
          CreateProductDtoSchema.parse({
            ...validProduct,
            requiresLot: true,
            requiresSerial: true,
          })
        ).toThrow(/cannot require both lot tracking and serial tracking/i);
      });

      it('should accept optional supplier ID', () => {
        const result = CreateProductDtoSchema.parse({
          ...validProduct,
          supplierId: '123e4567-e89b-12d3-a456-426614174001',
        });
        expect(result.supplierId).toBeDefined();
      });
    });

    describe('UpdateProductDtoSchema', () => {
      it('should validate partial updates', () => {
        const result = UpdateProductDtoSchema.parse({
          name: 'Updated Name',
          costPrice: 140.0,
        });
        expect(result.name).toBe('Updated Name');
        expect(result.costPrice).toBe(140.0);
      });

      it('should validate price relationship when both provided', () => {
        expect(() =>
          UpdateProductDtoSchema.parse({
            costPrice: 300,
            sellPrice: 200,
          })
        ).toThrow(/sell price must be greater than or equal to cost price/i);
      });
    });

    describe('QueryProductsDtoSchema', () => {
      it('should use default values', () => {
        const result = QueryProductsDtoSchema.parse({});
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
        expect(result.sortBy).toBe('name');
        expect(result.sortOrder).toBe('asc');
      });

      it('should validate with filters', () => {
        const result = QueryProductsDtoSchema.parse({
          category: ProductCategory.INSTRUMENT,
          status: ProductStatus.ACTIVE,
          requiresSterilization: true,
          page: 2,
          limit: 50,
        });
        expect(result.category).toBe(ProductCategory.INSTRUMENT);
        expect(result.page).toBe(2);
      });
    });
  });

  describe('Stock Operation Schemas', () => {
    describe('DeductStockDtoSchema', () => {
      const validDeduction = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 2,
        locationId: '123e4567-e89b-12d3-a456-426614174001',
        reason: 'Used in procedure',
        performedBy: '123e4567-e89b-12d3-a456-426614174002',
      };

      it('should validate stock deduction', () => {
        const result = DeductStockDtoSchema.parse(validDeduction);
        expect(result.quantity).toBe(2);
        expect(result.reason).toBe('Used in procedure');
      });

      it('should accept optional lot number', () => {
        const result = DeductStockDtoSchema.parse({
          ...validDeduction,
          lotNumber: 'LOT-2025-001',
        });
        expect(result.lotNumber).toBe('LOT-2025-001');
      });

      it('should accept optional procedure ID', () => {
        const result = DeductStockDtoSchema.parse({
          ...validDeduction,
          procedureId: '123e4567-e89b-12d3-a456-426614174003',
        });
        expect(result.procedureId).toBeDefined();
      });
    });

    describe('RestockDtoSchema', () => {
      it('should validate restock with future expiration', () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const expirationDate = futureDate.toISOString().split('T')[0];

        const result = RestockDtoSchema.parse({
          productId: '123e4567-e89b-12d3-a456-426614174000',
          quantity: 100,
          lotNumber: 'LOT-2025-001',
          expirationDate,
          locationId: '123e4567-e89b-12d3-a456-426614174001',
          costPerUnit: 1.5,
          receivedBy: '123e4567-e89b-12d3-a456-426614174002',
        });

        expect(result.quantity).toBe(100);
        expect(result.expirationDate).toBe(expirationDate);
      });

      it('should reject past expiration date', () => {
        expect(() =>
          RestockDtoSchema.parse({
            productId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 100,
            expirationDate: '2020-01-01',
            locationId: '123e4567-e89b-12d3-a456-426614174001',
            costPerUnit: 1.5,
            receivedBy: '123e4567-e89b-12d3-a456-426614174002',
          })
        ).toThrow(/expiration date must be in the future/i);
      });
    });

    describe('StockTransferDtoSchema', () => {
      it('should validate stock transfer', () => {
        const result = StockTransferDtoSchema.parse({
          productId: '123e4567-e89b-12d3-a456-426614174000',
          quantity: 20,
          fromLocationId: '123e4567-e89b-12d3-a456-426614174001',
          toLocationId: '123e4567-e89b-12d3-a456-426614174002',
          reason: 'Replenishment',
          performedBy: '123e4567-e89b-12d3-a456-426614174003',
        });
        expect(result.quantity).toBe(20);
      });

      it('should reject same source and destination', () => {
        const sameLocationId = '123e4567-e89b-12d3-a456-426614174001';
        expect(() =>
          StockTransferDtoSchema.parse({
            productId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 20,
            fromLocationId: sameLocationId,
            toLocationId: sameLocationId,
            reason: 'Transfer',
            performedBy: '123e4567-e89b-12d3-a456-426614174003',
          })
        ).toThrow(/source and destination locations must be different/i);
      });
    });
  });

  describe('Purchase Order Schemas', () => {
    describe('CreatePurchaseOrderDtoSchema', () => {
      const getFutureDate = (daysAhead = 30): string => {
        const date = new Date();
        date.setDate(date.getDate() + daysAhead);
        return date.toISOString().split('T')[0];
      };

      it('should validate purchase order', () => {
        const result = CreatePurchaseOrderDtoSchema.parse({
          supplierId: '123e4567-e89b-12d3-a456-426614174000',
          items: [
            { productId: '123e4567-e89b-12d3-a456-426614174001', quantity: 100, unitPrice: 1.5 },
          ],
          expectedDeliveryDate: getFutureDate(),
          deliveryLocationId: '123e4567-e89b-12d3-a456-426614174002',
          clinicId: '123e4567-e89b-12d3-a456-426614174003',
          requestedBy: '123e4567-e89b-12d3-a456-426614174004',
        });

        expect(result.items).toHaveLength(1);
        expect(result.items[0].quantity).toBe(100);
      });

      it('should reject empty items array', () => {
        expect(() =>
          CreatePurchaseOrderDtoSchema.parse({
            supplierId: '123e4567-e89b-12d3-a456-426614174000',
            items: [],
            expectedDeliveryDate: getFutureDate(),
            deliveryLocationId: '123e4567-e89b-12d3-a456-426614174002',
            clinicId: '123e4567-e89b-12d3-a456-426614174003',
            requestedBy: '123e4567-e89b-12d3-a456-426614174004',
          })
        ).toThrow(/must have at least one item/i);
      });

      it('should reject past delivery date', () => {
        expect(() =>
          CreatePurchaseOrderDtoSchema.parse({
            supplierId: '123e4567-e89b-12d3-a456-426614174000',
            items: [
              { productId: '123e4567-e89b-12d3-a456-426614174001', quantity: 100, unitPrice: 1.5 },
            ],
            expectedDeliveryDate: '2020-01-01',
            deliveryLocationId: '123e4567-e89b-12d3-a456-426614174002',
            clinicId: '123e4567-e89b-12d3-a456-426614174003',
            requestedBy: '123e4567-e89b-12d3-a456-426614174004',
          })
        ).toThrow(/expected delivery date must be today or in the future/i);
      });
    });

    describe('ApprovePurchaseOrderDtoSchema', () => {
      it('should validate approval', () => {
        const result = ApprovePurchaseOrderDtoSchema.parse({
          approvedBy: '123e4567-e89b-12d3-a456-426614174000',
          approvalNotes: 'Budget approved',
        });
        expect(result.approvedBy).toBeDefined();
      });
    });
  });

  describe('Goods Receipt Schemas', () => {
    describe('CreateGoodsReceiptDtoSchema', () => {
      it('should validate goods receipt with PO', () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);

        const result = CreateGoodsReceiptDtoSchema.parse({
          purchaseOrderId: '123e4567-e89b-12d3-a456-426614174000',
          supplierId: '123e4567-e89b-12d3-a456-426614174001',
          items: [
            {
              productId: '123e4567-e89b-12d3-a456-426614174002',
              quantity: 100,
              lotNumber: 'LOT-2025-001',
              expirationDate: futureDate.toISOString().split('T')[0],
              costPerUnit: 1.5,
            },
          ],
          locationId: '123e4567-e89b-12d3-a456-426614174003',
          clinicId: '123e4567-e89b-12d3-a456-426614174004',
          receivedBy: '123e4567-e89b-12d3-a456-426614174005',
        });

        expect(result.items).toHaveLength(1);
        expect(result.purchaseOrderId).toBeDefined();
      });

      it('should validate standalone goods receipt (no PO)', () => {
        const result = CreateGoodsReceiptDtoSchema.parse({
          supplierId: '123e4567-e89b-12d3-a456-426614174001',
          items: [
            {
              productId: '123e4567-e89b-12d3-a456-426614174002',
              quantity: 50,
              costPerUnit: 2.0,
            },
          ],
          locationId: '123e4567-e89b-12d3-a456-426614174003',
          clinicId: '123e4567-e89b-12d3-a456-426614174004',
          receivedBy: '123e4567-e89b-12d3-a456-426614174005',
        });

        expect(result.purchaseOrderId).toBeUndefined();
      });
    });
  });

  describe('Supplier Schemas', () => {
    describe('CreateSupplierDtoSchema', () => {
      it('should validate supplier with full address', () => {
        const result = CreateSupplierDtoSchema.parse({
          name: 'Dental Supplies Inc.',
          code: 'DSI-001',
          contactName: 'John Smith',
          email: 'john@example.com',
          phone: '+14155551234',
          address: {
            street: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94103',
            country: 'USA',
          },
          paymentTerms: 'Net 30',
          clinicId: '123e4567-e89b-12d3-a456-426614174000',
        });

        expect(result.name).toBe('Dental Supplies Inc.');
        expect(result.address?.city).toBe('San Francisco');
      });

      it('should validate supplier without optional fields', () => {
        const result = CreateSupplierDtoSchema.parse({
          name: 'Simple Supplier',
          contactName: 'Jane Doe',
          email: 'jane@example.com',
          clinicId: '123e4567-e89b-12d3-a456-426614174000',
        });

        expect(result.name).toBe('Simple Supplier');
        expect(result.phone).toBeUndefined();
      });
    });
  });

  describe('Procedure Materials Schemas', () => {
    describe('ProcedureBillOfMaterialsSchema', () => {
      it('should validate procedure materials', () => {
        const result = ProcedureBillOfMaterialsSchema.parse({
          procedureId: '123e4567-e89b-12d3-a456-426614174000',
          patientId: '123e4567-e89b-12d3-a456-426614174001',
          materials: [
            { productId: '123e4567-e89b-12d3-a456-426614174002', quantity: 2 },
            {
              productId: '123e4567-e89b-12d3-a456-426614174003',
              quantity: 1,
              lotNumber: 'LOT-2025-001',
            },
          ],
          performedBy: '123e4567-e89b-12d3-a456-426614174004',
        });

        expect(result.materials).toHaveLength(2);
        expect(result.materials[1].lotNumber).toBe('LOT-2025-001');
      });

      it('should reject empty materials array', () => {
        expect(() =>
          ProcedureBillOfMaterialsSchema.parse({
            procedureId: '123e4567-e89b-12d3-a456-426614174000',
            patientId: '123e4567-e89b-12d3-a456-426614174001',
            materials: [],
            performedBy: '123e4567-e89b-12d3-a456-426614174004',
          })
        ).toThrow(/at least one material must be specified/i);
      });
    });
  });

  describe('Query Schemas', () => {
    describe('QueryExpiringStockDtoSchema', () => {
      it('should use default values', () => {
        const result = QueryExpiringStockDtoSchema.parse({
          clinicId: '123e4567-e89b-12d3-a456-426614174000',
        });

        expect(result.days).toBe(30);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should validate with custom days', () => {
        const result = QueryExpiringStockDtoSchema.parse({
          days: 90,
          clinicId: '123e4567-e89b-12d3-a456-426614174000',
        });

        expect(result.days).toBe(90);
      });

      it('should reject invalid day range', () => {
        expect(() =>
          QueryExpiringStockDtoSchema.parse({
            days: 500,
            clinicId: '123e4567-e89b-12d3-a456-426614174000',
          })
        ).toThrow();
      });
    });
  });
});
