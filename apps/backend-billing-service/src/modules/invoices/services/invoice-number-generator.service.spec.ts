/**
 * Invoice Number Generator Service Tests
 *
 * Tests for the invoice number generation system including:
 * - Sequential number generation per series
 * - Format validation (INV-{SERIES}-{YEAR}-{SEQUENCE})
 * - Redis atomic increment
 * - Database fallback for initialization
 * - Range reservation for batch operations
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Redis from 'ioredis';
import { InvoiceNumberGeneratorService } from './invoice-number-generator.service';
import { Invoice } from '../entities/invoice.entity';

describe('InvoiceNumberGeneratorService', () => {
  let service: InvoiceNumberGeneratorService;
  let invoiceModel: Model<Invoice>;
  let redis: Redis;

  const mockTenantContext = {
    tenantId: 'tenant-123',
    organizationId: 'org-456',
    clinicId: 'clinic-789',
  };

  const mockInvoiceModel = {
    findOne: jest.fn(),
  };

  const mockRedis = {
    incr: jest.fn(),
    incrby: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    expire: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceNumberGeneratorService,
        {
          provide: getModelToken(Invoice.name),
          useValue: mockInvoiceModel,
        },
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: mockRedis,
        },
      ],
    }).compile();

    service = module.get<InvoiceNumberGeneratorService>(
      InvoiceNumberGeneratorService,
    );

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('generateNextNumber', () => {
    it('should generate invoice number with correct format', async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);
      mockInvoiceModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      const result = await service.generateNextNumber('BUC01', mockTenantContext);
      const currentYear = new Date().getFullYear();

      expect(result.invoiceNumber).toBe(`INV-BUC01-${currentYear}-00001`);
      expect(result.series).toBe('BUC01');
      expect(result.sequenceNumber).toBe(1);
      expect(result.year).toBe(currentYear);
    });

    it('should increment sequence number on subsequent calls', async () => {
      mockRedis.incr.mockResolvedValueOnce(5);
      mockRedis.expire.mockResolvedValue(1);

      const result = await service.generateNextNumber('TEST', mockTenantContext);
      const currentYear = new Date().getFullYear();

      expect(result.invoiceNumber).toBe(`INV-TEST-${currentYear}-00005`);
      expect(result.sequenceNumber).toBe(5);
    });

    it('should use tenant-specific Redis key', async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);

      await service.generateNextNumber('SERIES', mockTenantContext);
      const currentYear = new Date().getFullYear();

      expect(mockRedis.incr).toHaveBeenCalledWith(
        `billing:invoice:sequence:tenant-123:SERIES:${currentYear}`,
      );
    });

    it('should initialize from database if Redis returns 1', async () => {
      mockRedis.incr.mockResolvedValueOnce(1).mockResolvedValueOnce(11);
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.expire.mockResolvedValue(1);

      mockInvoiceModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue({ sequenceNumber: 10 }),
          }),
        }),
      });

      const result = await service.generateNextNumber('SYNC', mockTenantContext);

      expect(mockRedis.set).toHaveBeenCalled();
      expect(result.sequenceNumber).toBe(11);
    });
  });

  describe('generateFromClinic', () => {
    it('should sanitize clinic code for use as series', async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);
      mockInvoiceModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      const result = await service.generateFromClinic(
        'clinic-code-123',
        mockTenantContext,
      );

      // Should uppercase and remove special characters
      expect(result.series).toBe('CLINICCODE');
    });
  });

  describe('reserveRange', () => {
    it('should reserve sequential range of invoice numbers', async () => {
      mockRedis.incrby.mockResolvedValue(10);

      const results = await service.reserveRange('BATCH', 5, mockTenantContext);
      const currentYear = new Date().getFullYear();

      expect(results).toHaveLength(5);
      expect(results[0].invoiceNumber).toBe(`INV-BATCH-${currentYear}-00006`);
      expect(results[4].invoiceNumber).toBe(`INV-BATCH-${currentYear}-00010`);
    });

    it('should reject invalid count', async () => {
      await expect(
        service.reserveRange('TEST', 0, mockTenantContext),
      ).rejects.toThrow('Count must be between 1 and 1000');

      await expect(
        service.reserveRange('TEST', 1001, mockTenantContext),
      ).rejects.toThrow('Count must be between 1 and 1000');
    });
  });

  describe('validateFormat', () => {
    it('should validate correct invoice number format', () => {
      expect(service.validateFormat('INV-BUC01-2025-00123')).toBe(true);
      expect(service.validateFormat('INV-A-2025-00001')).toBe(true);
      expect(service.validateFormat('INV-CLINIC123-2025-99999')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(service.validateFormat('INV-BUC01-2025-123')).toBe(false); // Not 5 digits
      expect(service.validateFormat('BUC01-2025-00123')).toBe(false); // Missing INV prefix
      expect(service.validateFormat('INV-buc01-2025-00123')).toBe(false); // Lowercase
      expect(service.validateFormat('INV-BUC01-25-00123')).toBe(false); // 2-digit year
    });
  });

  describe('parseInvoiceNumber', () => {
    it('should parse valid invoice number', () => {
      const result = service.parseInvoiceNumber('INV-BUC01-2025-00123');

      expect(result).toEqual({
        series: 'BUC01',
        year: 2025,
        sequence: 123,
      });
    });

    it('should return null for invalid format', () => {
      expect(service.parseInvoiceNumber('invalid')).toBeNull();
      expect(service.parseInvoiceNumber('')).toBeNull();
    });
  });

  describe('getCurrentSequence', () => {
    it('should return current sequence from Redis', async () => {
      mockRedis.get.mockResolvedValue('42');

      const result = await service.getCurrentSequence('TEST', mockTenantContext);

      expect(result).toBe(42);
    });

    it('should fall back to database if Redis key not found', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockInvoiceModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue({ sequenceNumber: 15 }),
          }),
        }),
      });

      const result = await service.getCurrentSequence('TEST', mockTenantContext);

      expect(result).toBe(15);
    });

    it('should return 0 if no invoices exist', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockInvoiceModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      const result = await service.getCurrentSequence('NEW', mockTenantContext);

      expect(result).toBe(0);
    });
  });
});
