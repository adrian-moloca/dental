/**
 * Appointment Completed Handler Tests
 *
 * Tests for the AppointmentCompleted event handler including:
 * - Auto-generation of invoices from appointments
 * - Idempotency (preventing duplicate invoices)
 * - Configuration respect (enable/disable auto-invoice)
 * - Error handling and graceful degradation
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppointmentCompletedHandler } from './appointment-completed.handler';
import { InvoiceGenerationService } from '../services/invoice-generation.service';

describe('AppointmentCompletedHandler', () => {
  let handler: AppointmentCompletedHandler;
  let invoiceGenerationService: InvoiceGenerationService;
  let configService: ConfigService;

  const mockInvoiceGenerationService = {
    createFromAppointment: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string, defaultValue: any) => {
      const config: Record<string, any> = {
        'billing.autoInvoiceOnAppointmentComplete': true,
        'billing.autoIssueInvoice': false,
        'billing.defaultTaxRate': 0.19,
        'billing.defaultCurrency': 'RON',
      };
      return config[key] ?? defaultValue;
    }),
  };

  const createMockEvent = (overrides: any = {}) => ({
    id: 'event-001',
    type: 'appointment.completed',
    version: 1,
    occurredAt: new Date(),
    payload: {
      appointmentId: 'appt-001',
      patientId: 'patient-001',
      patientName: 'John Doe',
      providerId: 'provider-001',
      providerName: 'Dr. Smith',
      scheduledAt: '2025-01-15T09:00:00Z',
      completedAt: '2025-01-15T10:00:00Z',
      organizationId: 'org-456',
      clinicId: 'clinic-789',
      completedBy: 'user-001',
      procedures: [
        {
          procedureId: 'proc-001',
          procedureCode: 'D0120',
          procedureName: 'Periodic oral evaluation',
          quantity: 1,
          unitPrice: 100,
        },
      ],
      ...overrides.payload,
    },
    metadata: {
      correlationId: 'corr-001',
      userId: 'user-001',
      source: {
        service: 'backend-scheduling',
        version: '1.0.0',
      },
      ...overrides.metadata,
    },
    tenantContext: {
      tenantId: 'tenant-123',
      organizationId: 'org-456',
      clinicId: 'clinic-789',
      ...overrides.tenantContext,
    },
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentCompletedHandler,
        {
          provide: InvoiceGenerationService,
          useValue: mockInvoiceGenerationService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    handler = module.get<AppointmentCompletedHandler>(AppointmentCompletedHandler);
    invoiceGenerationService = module.get<InvoiceGenerationService>(
      InvoiceGenerationService,
    );
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('handleAppointmentCompleted', () => {
    it('should auto-generate invoice when event has procedures', async () => {
      mockInvoiceGenerationService.createFromAppointment.mockResolvedValue({
        invoice: {
          _id: { toString: () => 'inv-001' },
          invoiceNumber: 'INV-TEST-2025-00001',
          total: 119,
        },
        invoiceItems: [{}],
        warnings: [],
      });

      const event = createMockEvent();

      await handler.handleAppointmentCompleted(event);

      expect(mockInvoiceGenerationService.createFromAppointment).toHaveBeenCalledWith(
        expect.objectContaining({
          appointmentId: 'appt-001',
          patientId: 'patient-001',
          procedures: expect.arrayContaining([
            expect.objectContaining({
              procedureCode: 'D0120',
              unitPrice: 100,
            }),
          ]),
        }),
        expect.any(Object),
        expect.objectContaining({
          tenantId: 'tenant-123',
        }),
      );
    });

    it('should skip invoice generation when no procedures', async () => {
      const event = createMockEvent({
        payload: { procedures: [] },
      });

      await handler.handleAppointmentCompleted(event);

      expect(mockInvoiceGenerationService.createFromAppointment).not.toHaveBeenCalled();
    });

    it('should skip invoice generation when procedures undefined', async () => {
      const event = createMockEvent({
        payload: { procedures: undefined },
      });

      await handler.handleAppointmentCompleted(event);

      expect(mockInvoiceGenerationService.createFromAppointment).not.toHaveBeenCalled();
    });

    it('should skip invoice generation when disabled by config', async () => {
      mockConfigService.get.mockImplementation((key: string, defaultValue: any) => {
        if (key === 'billing.autoInvoiceOnAppointmentComplete') {
          return false;
        }
        return defaultValue;
      });

      const event = createMockEvent();

      await handler.handleAppointmentCompleted(event);

      expect(mockInvoiceGenerationService.createFromAppointment).not.toHaveBeenCalled();
    });

    it('should handle duplicate invoice gracefully (idempotency)', async () => {
      mockInvoiceGenerationService.createFromAppointment.mockRejectedValue(
        new Error('Invoice already exists for appointment appt-001: INV-EXISTING'),
      );

      const event = createMockEvent();

      // Should not throw - graceful handling
      await expect(handler.handleAppointmentCompleted(event)).resolves.not.toThrow();
    });

    it('should log error but not throw on invoice generation failure', async () => {
      mockInvoiceGenerationService.createFromAppointment.mockRejectedValue(
        new Error('Database connection failed'),
      );

      const event = createMockEvent();

      // Should not throw - graceful degradation
      await expect(handler.handleAppointmentCompleted(event)).resolves.not.toThrow();
    });

    it('should handle invalid event payload gracefully', async () => {
      const invalidEvent = {
        payload: null,
        tenantContext: null,
      };

      await expect(
        handler.handleAppointmentCompleted(invalidEvent as any),
      ).resolves.not.toThrow();

      expect(mockInvoiceGenerationService.createFromAppointment).not.toHaveBeenCalled();
    });

    it('should use default price when procedure price not provided', async () => {
      mockInvoiceGenerationService.createFromAppointment.mockResolvedValue({
        invoice: { _id: { toString: () => 'inv-001' } },
        invoiceItems: [{}],
        warnings: [],
      });

      const event = createMockEvent({
        payload: {
          procedures: [
            {
              procedureId: 'proc-001',
              procedureCode: 'D0120',
              procedureName: 'Test',
              quantity: 1,
              // No unitPrice provided
            },
          ],
        },
      });

      await handler.handleAppointmentCompleted(event);

      expect(mockInvoiceGenerationService.createFromAppointment).toHaveBeenCalledWith(
        expect.objectContaining({
          procedures: expect.arrayContaining([
            expect.objectContaining({
              unitPrice: 100, // Default price
            }),
          ]),
        }),
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('should include customer info from event', async () => {
      mockInvoiceGenerationService.createFromAppointment.mockResolvedValue({
        invoice: { _id: { toString: () => 'inv-001' } },
        invoiceItems: [{}],
        warnings: [],
      });

      const event = createMockEvent({
        payload: {
          customerName: 'Business Corp',
          customerAddress: '123 Main St',
          customerTaxId: 'RO12345678',
          customerEmail: 'billing@business.com',
        },
      });

      await handler.handleAppointmentCompleted(event);

      expect(mockInvoiceGenerationService.createFromAppointment).toHaveBeenCalledWith(
        expect.objectContaining({
          customerName: 'Business Corp',
          customerAddress: '123 Main St',
          customerTaxId: 'RO12345678',
          customerEmail: 'billing@business.com',
        }),
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('should include treatment plan reference when provided', async () => {
      mockInvoiceGenerationService.createFromAppointment.mockResolvedValue({
        invoice: { _id: { toString: () => 'inv-001' } },
        invoiceItems: [{}],
        warnings: [],
      });

      const event = createMockEvent({
        payload: {
          treatmentPlanId: 'tp-001',
        },
      });

      await handler.handleAppointmentCompleted(event);

      expect(mockInvoiceGenerationService.createFromAppointment).toHaveBeenCalledWith(
        expect.objectContaining({
          treatmentPlanId: 'tp-001',
        }),
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('should respect auto-issue configuration', async () => {
      mockConfigService.get.mockImplementation((key: string, defaultValue: any) => {
        const config: Record<string, any> = {
          'billing.autoInvoiceOnAppointmentComplete': true,
          'billing.autoIssueInvoice': true, // Enabled
          'billing.defaultTaxRate': 0.19,
          'billing.defaultCurrency': 'RON',
        };
        return config[key] ?? defaultValue;
      });

      mockInvoiceGenerationService.createFromAppointment.mockResolvedValue({
        invoice: { _id: { toString: () => 'inv-001' } },
        invoiceItems: [{}],
        warnings: [],
      });

      const event = createMockEvent();

      await handler.handleAppointmentCompleted(event);

      expect(mockInvoiceGenerationService.createFromAppointment).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          autoIssue: true,
        }),
        expect.any(Object),
      );
    });

    it('should use correct tenant context from event', async () => {
      mockInvoiceGenerationService.createFromAppointment.mockResolvedValue({
        invoice: { _id: { toString: () => 'inv-001' } },
        invoiceItems: [{}],
        warnings: [],
      });

      const event = createMockEvent({
        tenantContext: {
          tenantId: 'custom-tenant',
          organizationId: 'custom-org',
          clinicId: 'custom-clinic',
        },
      });

      await handler.handleAppointmentCompleted(event);

      expect(mockInvoiceGenerationService.createFromAppointment).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        expect.objectContaining({
          tenantId: 'custom-tenant',
          organizationId: 'custom-org',
          clinicId: 'custom-clinic',
        }),
      );
    });
  });
});
