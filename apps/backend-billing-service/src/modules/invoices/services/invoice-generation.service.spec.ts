/**
 * Invoice Generation Service Tests
 *
 * Tests for the invoice generation system including:
 * - Creating invoices from appointments
 * - VAT calculation (19% for Romania)
 * - Discount handling
 * - Invoice number generation
 * - Ledger entry creation
 * - Event emission
 * - Credit note creation for cancellations
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  InvoiceGenerationService,
  AppointmentData,
  ProcedureData,
} from './invoice-generation.service';
import { InvoiceNumberGeneratorService } from './invoice-number-generator.service';
import { Invoice, PaymentTerms } from '../entities/invoice.entity';
import { InvoiceItem } from '../../invoice-items/entities/invoice-item.entity';
import { LedgerService } from '../../ledger/ledger.service';
import { InvoiceStatus } from '../../../common/types';

describe('InvoiceGenerationService', () => {
  let service: InvoiceGenerationService;
  let invoiceModel: any;
  let invoiceItemModel: any;
  let invoiceNumberGenerator: InvoiceNumberGeneratorService;
  let ledgerService: LedgerService;
  let eventEmitter: EventEmitter2;
  let configService: ConfigService;

  const mockTenantContext = {
    tenantId: 'tenant-123',
    organizationId: 'org-456',
    clinicId: 'clinic-789',
    userId: 'user-001',
  };

  const mockAppointmentData: AppointmentData = {
    appointmentId: 'appt-001',
    patientId: 'patient-001',
    patientName: 'John Doe',
    providerId: 'provider-001',
    providerName: 'Dr. Smith',
    completedAt: '2025-01-15T10:00:00Z',
    procedures: [
      {
        procedureId: 'proc-001',
        procedureCode: 'D0120',
        procedureName: 'Periodic oral evaluation',
        quantity: 1,
        unitPrice: 100,
        providerId: 'provider-001',
      },
      {
        procedureId: 'proc-002',
        procedureCode: 'D1110',
        procedureName: 'Prophylaxis - adult',
        quantity: 1,
        unitPrice: 150,
        providerId: 'provider-001',
      },
    ],
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
  };

  // Mock constructor function that returns a saveable object
  const createMockDocument = (data: any) => {
    const doc = {
      ...data,
      _id: { toString: () => 'mock-id' },
      save: jest.fn().mockResolvedValue({ ...data, _id: { toString: () => 'mock-id' } }),
    };
    return doc;
  };

  const MockInvoiceModel = jest.fn().mockImplementation((data) => createMockDocument(data));
  MockInvoiceModel.findOne = jest.fn();

  const MockInvoiceItemModel = jest.fn().mockImplementation((data) => createMockDocument(data));

  const mockInvoiceNumberGenerator = {
    generateNextNumber: jest.fn().mockResolvedValue({
      invoiceNumber: 'INV-TEST-2025-00001',
      series: 'TEST',
      sequenceNumber: 1,
      year: 2025,
    }),
  };

  const mockLedgerService = {
    createInvoiceIssuedEntries: jest.fn().mockResolvedValue(undefined),
    createInvoiceVoidEntries: jest.fn().mockResolvedValue(undefined),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string, defaultValue: any) => {
      const config: Record<string, any> = {
        'billing.ledgerAutoPost': true,
        'billing.autoInvoiceOnAppointmentComplete': true,
        'billing.autoIssueInvoice': false,
        'billing.defaultTaxRate': 0.19,
        'billing.defaultCurrency': 'RON',
      };
      return config[key] ?? defaultValue;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceGenerationService,
        {
          provide: getModelToken(Invoice.name),
          useValue: MockInvoiceModel,
        },
        {
          provide: getModelToken(InvoiceItem.name),
          useValue: MockInvoiceItemModel,
        },
        {
          provide: InvoiceNumberGeneratorService,
          useValue: mockInvoiceNumberGenerator,
        },
        {
          provide: LedgerService,
          useValue: mockLedgerService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<InvoiceGenerationService>(InvoiceGenerationService);
  });

  describe('createFromAppointment', () => {
    beforeEach(() => {
      MockInvoiceModel.findOne.mockResolvedValue(null);
    });

    it('should create invoice with correct totals including 19% VAT', async () => {
      const result = await service.createFromAppointment(
        mockAppointmentData,
        {},
        mockTenantContext,
      );

      // Base: 100 + 150 = 250
      // VAT 19%: 250 * 0.19 = 47.5
      // Total: 250 + 47.5 = 297.5
      expect(result.invoice.subtotal).toBe(250);
      expect(result.invoice.taxAmount).toBe(47.5);
      expect(result.invoice.total).toBe(297.5);
    });

    it('should generate correct invoice number', async () => {
      const result = await service.createFromAppointment(
        mockAppointmentData,
        {},
        mockTenantContext,
      );

      expect(mockInvoiceNumberGenerator.generateNextNumber).toHaveBeenCalledWith(
        expect.any(String),
        mockTenantContext,
      );
      expect(result.invoice.invoiceNumber).toBe('INV-TEST-2025-00001');
    });

    it('should create invoice items for each procedure', async () => {
      const result = await service.createFromAppointment(
        mockAppointmentData,
        {},
        mockTenantContext,
      );

      expect(result.invoiceItems).toHaveLength(2);
      expect(MockInvoiceItemModel).toHaveBeenCalledTimes(2);
    });

    it('should emit invoice.created event', async () => {
      await service.createFromAppointment(
        mockAppointmentData,
        {},
        mockTenantContext,
      );

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'invoice.created',
        expect.any(Object),
      );
    });

    it('should prevent duplicate invoice for same appointment', async () => {
      MockInvoiceModel.findOne.mockResolvedValue({
        invoiceNumber: 'INV-EXISTING-2025-00001',
      });

      await expect(
        service.createFromAppointment(
          mockAppointmentData,
          {},
          mockTenantContext,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle discount percentage correctly', async () => {
      const dataWithDiscount: AppointmentData = {
        ...mockAppointmentData,
        procedures: [
          {
            procedureId: 'proc-001',
            procedureCode: 'D0120',
            procedureName: 'Test procedure',
            quantity: 1,
            unitPrice: 100,
            discountPercent: 10, // 10% discount
          },
        ],
      };

      const result = await service.createFromAppointment(
        dataWithDiscount,
        {},
        mockTenantContext,
      );

      // 100 - 10% = 90, VAT 19% = 17.1, Total = 107.1
      expect(result.invoice.subtotal).toBe(100);
      expect(result.invoice.discountAmount).toBe(10);
      expect(result.invoice.taxAmount).toBe(17.1);
      expect(result.invoice.total).toBe(107.1);
    });

    it('should handle tax-exempt procedures', async () => {
      const dataWithExempt: AppointmentData = {
        ...mockAppointmentData,
        procedures: [
          {
            procedureId: 'proc-001',
            procedureCode: 'D0120',
            procedureName: 'Tax exempt procedure',
            quantity: 1,
            unitPrice: 100,
            taxExempt: true,
            taxExemptionReason: 'Medical exemption',
          },
        ],
      };

      const result = await service.createFromAppointment(
        dataWithExempt,
        {},
        mockTenantContext,
      );

      expect(result.invoice.subtotal).toBe(100);
      expect(result.invoice.taxAmount).toBe(0);
      expect(result.invoice.total).toBe(100);
    });

    it('should respect custom payment terms', async () => {
      const result = await service.createFromAppointment(
        mockAppointmentData,
        { paymentTerms: PaymentTerms.NET_30 },
        mockTenantContext,
      );

      expect(result.invoice.paymentTerms).toBe(PaymentTerms.NET_30);

      // Due date should be 30 days from issue date
      const issueDate = new Date(result.invoice.issueDate);
      const dueDate = new Date(result.invoice.dueDate);
      const diffDays = Math.ceil(
        (dueDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      expect(diffDays).toBe(30);
    });

    it('should use custom series when provided', async () => {
      await service.createFromAppointment(
        mockAppointmentData,
        { series: 'CUSTOM' },
        mockTenantContext,
      );

      expect(mockInvoiceNumberGenerator.generateNextNumber).toHaveBeenCalledWith(
        'CUSTOM',
        mockTenantContext,
      );
    });

    it('should validate required fields', async () => {
      const invalidData = {
        ...mockAppointmentData,
        patientId: '',
      };

      await expect(
        service.createFromAppointment(invalidData, {}, mockTenantContext),
      ).rejects.toThrow(BadRequestException);
    });

    it('should require at least one procedure', async () => {
      const noProcs = {
        ...mockAppointmentData,
        procedures: [],
      };

      await expect(
        service.createFromAppointment(noProcs, {}, mockTenantContext),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('issueInvoice', () => {
    it('should change status to SENT and create ledger entries', async () => {
      const mockInvoice = createMockDocument({
        _id: { toString: () => 'inv-001' },
        status: InvoiceStatus.DRAFT,
        total: 297.5,
        taxAmount: 47.5,
        subtotal: 250,
      });

      await service.issueInvoice(mockInvoice as any, mockTenantContext);

      expect(mockInvoice.status).toBe(InvoiceStatus.SENT);
      expect(mockInvoice.save).toHaveBeenCalled();
      expect(mockLedgerService.createInvoiceIssuedEntries).toHaveBeenCalledWith(
        mockInvoice._id,
        297.5,
        47.5,
        250,
        mockTenantContext,
      );
    });

    it('should emit invoice.issued event', async () => {
      const mockInvoice = createMockDocument({
        _id: { toString: () => 'inv-001' },
        invoiceNumber: 'INV-TEST-2025-00001',
        status: InvoiceStatus.DRAFT,
        patientId: 'patient-001',
        total: 297.5,
        taxAmount: 47.5,
        subtotal: 250,
      });

      await service.issueInvoice(mockInvoice as any, mockTenantContext);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'invoice.issued',
        expect.objectContaining({
          invoiceId: 'inv-001',
          invoiceNumber: 'INV-TEST-2025-00001',
        }),
      );
    });

    it('should reject issuing non-draft invoice', async () => {
      const mockInvoice = createMockDocument({
        status: InvoiceStatus.SENT,
      });

      await expect(
        service.issueInvoice(mockInvoice as any, mockTenantContext),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('sendInvoice', () => {
    it('should mark invoice as sent with email tracking', async () => {
      const mockInvoice = createMockDocument({
        _id: { toString: () => 'inv-001' },
        invoiceNumber: 'INV-TEST-2025-00001',
        status: InvoiceStatus.SENT,
        patientId: 'patient-001',
      });

      MockInvoiceModel.findOne.mockResolvedValue(mockInvoice);

      const result = await service.sendInvoice(
        'inv-001',
        'patient@example.com',
        mockTenantContext,
      );

      expect(result.sentAt).toBeDefined();
      expect(result.sentToEmail).toBe('patient@example.com');
      expect(result.sentMethod).toBe('email');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'invoice.sent',
        expect.objectContaining({
          email: 'patient@example.com',
        }),
      );
    });

    it('should reject sending draft invoice', async () => {
      const mockInvoice = createMockDocument({
        status: InvoiceStatus.DRAFT,
      });

      MockInvoiceModel.findOne.mockResolvedValue(mockInvoice);

      await expect(
        service.sendInvoice('inv-001', 'test@example.com', mockTenantContext),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent invoice', async () => {
      MockInvoiceModel.findOne.mockResolvedValue(null);

      await expect(
        service.sendInvoice('invalid-id', 'test@example.com', mockTenantContext),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelInvoice', () => {
    it('should create credit note and void original invoice', async () => {
      const mockInvoice = createMockDocument({
        _id: { toString: () => 'inv-001' },
        invoiceNumber: 'INV-TEST-2025-00001',
        series: 'TEST',
        status: InvoiceStatus.SENT,
        patientId: 'patient-001',
        providerId: 'provider-001',
        subtotal: 250,
        taxAmount: 47.5,
        discountAmount: 0,
        total: 297.5,
        currency: 'RON',
        customerName: 'John Doe',
        isCreditNote: false,
      });

      MockInvoiceModel.findOne.mockResolvedValue(mockInvoice);

      mockInvoiceNumberGenerator.generateNextNumber.mockResolvedValue({
        invoiceNumber: 'INV-CN-TEST-2025-00001',
        series: 'CN-TEST',
        sequenceNumber: 1,
        year: 2025,
      });

      const result = await service.cancelInvoice(
        'inv-001',
        'Customer request',
        mockTenantContext,
      );

      // Original invoice should be voided
      expect(result.originalInvoice.status).toBe(InvoiceStatus.VOID);
      expect(result.originalInvoice.voidedAt).toBeDefined();
      expect(result.originalInvoice.voidReason).toBe('Customer request');

      // Credit note should have negative amounts
      expect(result.creditNote.total).toBe(-297.5);
      expect(result.creditNote.isCreditNote).toBe(true);
      expect(result.creditNote.originalInvoiceId).toBe('inv-001');
    });

    it('should create reversal ledger entries', async () => {
      const mockInvoice = createMockDocument({
        _id: { toString: () => 'inv-001' },
        status: InvoiceStatus.SENT,
        total: 297.5,
        taxAmount: 47.5,
        subtotal: 250,
        series: 'TEST',
        isCreditNote: false,
      });

      MockInvoiceModel.findOne.mockResolvedValue(mockInvoice);

      await service.cancelInvoice('inv-001', 'Reason', mockTenantContext);

      expect(mockLedgerService.createInvoiceVoidEntries).toHaveBeenCalledWith(
        mockInvoice._id,
        297.5,
        47.5,
        250,
        mockTenantContext,
      );
    });

    it('should reject cancelling already voided invoice', async () => {
      const mockInvoice = createMockDocument({
        status: InvoiceStatus.VOID,
      });

      MockInvoiceModel.findOne.mockResolvedValue(mockInvoice);

      await expect(
        service.cancelInvoice('inv-001', 'Reason', mockTenantContext),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject cancelling a credit note', async () => {
      const mockInvoice = createMockDocument({
        status: InvoiceStatus.SENT,
        isCreditNote: true,
      });

      MockInvoiceModel.findOne.mockResolvedValue(mockInvoice);

      await expect(
        service.cancelInvoice('inv-001', 'Reason', mockTenantContext),
      ).rejects.toThrow(BadRequestException);
    });

    it('should emit invoice.cancelled event', async () => {
      const mockInvoice = createMockDocument({
        _id: { toString: () => 'inv-001' },
        invoiceNumber: 'INV-TEST-2025-00001',
        status: InvoiceStatus.SENT,
        total: 100,
        taxAmount: 19,
        subtotal: 81,
        series: 'TEST',
        isCreditNote: false,
      });

      MockInvoiceModel.findOne.mockResolvedValue(mockInvoice);

      await service.cancelInvoice('inv-001', 'Test reason', mockTenantContext);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'invoice.cancelled',
        expect.objectContaining({
          invoiceId: 'inv-001',
          reason: 'Test reason',
        }),
      );
    });
  });

  describe('VAT Calculation Edge Cases', () => {
    beforeEach(() => {
      MockInvoiceModel.findOne.mockResolvedValue(null);
    });

    it('should handle zero-value procedures', async () => {
      const dataWithZero: AppointmentData = {
        ...mockAppointmentData,
        procedures: [
          {
            procedureId: 'proc-001',
            procedureCode: 'D0000',
            procedureName: 'Free consultation',
            quantity: 1,
            unitPrice: 0,
          },
        ],
      };

      const result = await service.createFromAppointment(
        dataWithZero,
        {},
        mockTenantContext,
      );

      expect(result.invoice.total).toBe(0);
      expect(result.warnings).toContain('Invoice total is zero or negative');
    });

    it('should round VAT to 2 decimal places', async () => {
      const dataWithOddPrice: AppointmentData = {
        ...mockAppointmentData,
        procedures: [
          {
            procedureId: 'proc-001',
            procedureCode: 'D0120',
            procedureName: 'Test',
            quantity: 1,
            unitPrice: 33.33, // 33.33 * 0.19 = 6.3327
          },
        ],
      };

      const result = await service.createFromAppointment(
        dataWithOddPrice,
        {},
        mockTenantContext,
      );

      // Should round to 2 decimal places
      expect(result.invoice.taxAmount).toBe(6.33);
    });

    it('should handle multiple quantities', async () => {
      const dataWithQuantity: AppointmentData = {
        ...mockAppointmentData,
        procedures: [
          {
            procedureId: 'proc-001',
            procedureCode: 'D0120',
            procedureName: 'Test',
            quantity: 3,
            unitPrice: 50,
          },
        ],
      };

      const result = await service.createFromAppointment(
        dataWithQuantity,
        {},
        mockTenantContext,
      );

      // 50 * 3 = 150, VAT = 28.5, Total = 178.5
      expect(result.invoice.subtotal).toBe(150);
      expect(result.invoice.taxAmount).toBe(28.5);
      expect(result.invoice.total).toBe(178.5);
    });
  });
});
