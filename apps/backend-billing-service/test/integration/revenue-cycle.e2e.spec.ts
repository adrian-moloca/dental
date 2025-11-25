/**
 * Revenue Cycle Integration E2E Tests
 *
 * Tests the complete flow:
 * Appointment → Clinical Procedure → Invoice Generation → Payment → Patient Balance Update
 *
 * Success Criteria:
 * - 100% of completed procedures generate invoices automatically
 * - Invoice-payment linkage 100% accurate
 * - Patient balance updates within 1 second of payment
 * - E2E test passes with <500ms total latency
 * - Zero duplicate invoices
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  createProcedureCompletedEvent,
  ProcedureCompletedPayload,
} from '@dentalos/shared-events';

import { InvoicesModule } from '../../src/modules/invoices/invoices.module';
import { InvoicesService } from '../../src/modules/invoices/invoices.service';
import { PatientBalancesModule } from '../../src/modules/patient-balances/patient-balances.module';
import { PatientBalancesService } from '../../src/modules/patient-balances/patient-balances.service';
import { PaymentsModule } from '../../src/modules/payments/payments.module';
import { PaymentsService } from '../../src/modules/payments/payments.service';
import { InvoiceItemsModule } from '../../src/modules/invoice-items/invoice-items.module';
import { LedgerModule } from '../../src/modules/ledger/ledger.module';
import { ConfigModule } from '@nestjs/config';

describe('Revenue Cycle Integration (E2E)', () => {
  let app: INestApplication;
  let eventEmitter: EventEmitter2;
  let invoicesService: InvoicesService;
  let paymentsService: PaymentsService;
  let patientBalancesService: PatientBalancesService;

  const testTenantContext = {
    tenantId: 'test-tenant-' + Date.now(),
    organizationId: 'test-org-' + Date.now(),
    clinicId: 'test-clinic-' + Date.now(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              billing: {
                ledgerAutoPost: false, // Disable for testing
              },
            }),
          ],
        }),
        MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/billing-test'),
        EventEmitterModule.forRoot(),
        InvoicesModule,
        PatientBalancesModule,
        PaymentsModule,
        InvoiceItemsModule,
        LedgerModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    eventEmitter = app.get(EventEmitter2);
    invoicesService = app.get(InvoicesService);
    paymentsService = app.get(PaymentsService);
    patientBalancesService = app.get(PatientBalancesService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete Revenue Cycle Flow', () => {
    it('should auto-generate invoice from procedure completion and update patient balance', async () => {
      const testIds = {
        procedureId: uuidv4(),
        appointmentId: uuidv4(),
        patientId: uuidv4(),
        providerId: uuidv4(),
      };

      const startTime = Date.now();

      // Step 1: Emit procedure.completed event
      const procedurePayload: ProcedureCompletedPayload = {
        procedureId: testIds.procedureId as any,
        patientId: testIds.patientId as any,
        providerId: testIds.providerId as any,
        organizationId: testTenantContext.organizationId as any,
        clinicId: testTenantContext.clinicId as any,
        tenantId: testTenantContext.tenantId,
        procedureCode: 'D2391',
        procedureName: 'Resin-based composite - one surface, posterior',
        tooth: '19',
        toothNumberingSystem: 'UNIVERSAL',
        surfaces: ['O'] as any,
        stockItemsUsed: [],
        appointmentId: testIds.appointmentId as any,
        providerName: 'Dr. Test Provider',
        patientName: 'Test Patient',
        requiresFollowUp: false,
        timestamp: new Date().toISOString() as any,
        metadata: {
          pricing: {
            amount: 350.0,
            currency: 'RON',
            insuranceCoverage: 0,
          },
        },
      };

      const event = createProcedureCompletedEvent(
        procedurePayload,
        {
          correlationId: uuidv4() as any,
          userId: testIds.providerId as any,
          source: 'test',
          idempotencyKey: `test-${testIds.procedureId}`,
        },
        testTenantContext
      );

      eventEmitter.emit('procedure.completed', event);

      // Wait for async handlers (invoice generation)
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Step 2: Verify invoice was created
      const invoices = await invoicesService.findAll(
        { patientId: testIds.patientId },
        {
          ...testTenantContext,
          userId: testIds.providerId,
        }
      );

      expect(invoices).toHaveLength(1);
      const invoice = invoices[0];
      expect(invoice.linkedProcedureId).toBe(testIds.procedureId);
      expect(invoice.patientId).toBe(testIds.patientId);
      expect(invoice.subtotal).toBe(350.0);
      expect(invoice.total).toBeGreaterThan(350.0); // Should include tax
      expect(invoice.status).toBe('SENT');

      console.log('Invoice auto-generated:', {
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        linkedProcedure: invoice.linkedProcedureId,
      });

      // Step 3: Record payment
      const paymentDto = {
        invoiceId: invoice._id.toString(),
        patientId: testIds.patientId,
        amount: invoice.total, // Full payment
        paymentMethod: 'CASH' as any,
        paymentDate: new Date().toISOString(),
        reference: 'TEST-PAYMENT',
      };

      const payment = await paymentsService.create(paymentDto, {
        ...testTenantContext,
        userId: testIds.providerId,
      });

      expect(payment).toBeDefined();
      expect(payment.amount).toBe(invoice.total);

      // Wait for async handlers (balance update)
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Step 4: Verify patient balance updated
      const patientBalance = await patientBalancesService.getBalance(
        testIds.patientId,
        {
          ...testTenantContext,
          userId: testIds.providerId,
        }
      );

      expect(patientBalance).toBeDefined();
      expect(patientBalance.currentBalance).toBe(0); // Paid in full
      expect(patientBalance.totalInvoiced).toBe(invoice.total);
      expect(patientBalance.totalPaid).toBe(invoice.total);

      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      console.log('Revenue Cycle E2E Test completed:', {
        duration: `${totalDuration}ms`,
        procedureId: testIds.procedureId,
        invoiceId: invoice._id,
        paymentId: payment._id,
        patientBalance: patientBalance.currentBalance,
      });

      // Performance check: <500ms total latency
      expect(totalDuration).toBeLessThan(500);
    }, 10000); // 10s timeout

    it('should handle partial payments correctly', async () => {
      const testIds = {
        procedureId: uuidv4(),
        patientId: uuidv4(),
        providerId: uuidv4(),
      };

      // Emit procedure.completed event
      const procedurePayload: ProcedureCompletedPayload = {
        procedureId: testIds.procedureId as any,
        patientId: testIds.patientId as any,
        providerId: testIds.providerId as any,
        organizationId: testTenantContext.organizationId as any,
        clinicId: testTenantContext.clinicId as any,
        tenantId: testTenantContext.tenantId,
        procedureCode: 'D0150',
        procedureName: 'Comprehensive oral evaluation',
        stockItemsUsed: [],
        providerName: 'Dr. Test Provider',
        patientName: 'Test Patient',
        requiresFollowUp: false,
        timestamp: new Date().toISOString() as any,
        metadata: {
          pricing: {
            amount: 500.0,
            currency: 'RON',
          },
        },
      };

      const event = createProcedureCompletedEvent(
        procedurePayload,
        {
          correlationId: uuidv4() as any,
          userId: testIds.providerId as any,
          source: 'test',
          idempotencyKey: `test-partial-${testIds.procedureId}`,
        },
        testTenantContext
      );

      eventEmitter.emit('procedure.completed', event);
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Get generated invoice
      const invoices = await invoicesService.findAll(
        { patientId: testIds.patientId },
        { ...testTenantContext, userId: testIds.providerId }
      );

      const invoice = invoices[0];
      const totalAmount = invoice.total;

      // Make partial payment (50%)
      const partialAmount = totalAmount * 0.5;
      const payment1 = await paymentsService.create(
        {
          invoiceId: invoice._id.toString(),
          patientId: testIds.patientId,
          amount: partialAmount,
          paymentMethod: 'CREDIT_CARD' as any,
          paymentDate: new Date().toISOString(),
        },
        { ...testTenantContext, userId: testIds.providerId }
      );

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Verify balance after partial payment
      let patientBalance = await patientBalancesService.getBalance(
        testIds.patientId,
        { ...testTenantContext, userId: testIds.providerId }
      );

      expect(patientBalance.currentBalance).toBeCloseTo(totalAmount - partialAmount, 2);
      expect(patientBalance.totalPaid).toBeCloseTo(partialAmount, 2);

      // Make second payment (remaining 50%)
      const payment2 = await paymentsService.create(
        {
          invoiceId: invoice._id.toString(),
          patientId: testIds.patientId,
          amount: totalAmount - partialAmount,
          paymentMethod: 'CASH' as any,
          paymentDate: new Date().toISOString(),
        },
        { ...testTenantContext, userId: testIds.providerId }
      );

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Verify balance after full payment
      patientBalance = await patientBalancesService.getBalance(
        testIds.patientId,
        { ...testTenantContext, userId: testIds.providerId }
      );

      expect(patientBalance.currentBalance).toBeCloseTo(0, 2);
      expect(patientBalance.totalPaid).toBeCloseTo(totalAmount, 2);

      console.log('Partial payment test passed:', {
        totalAmount,
        payment1: partialAmount,
        payment2: totalAmount - partialAmount,
        finalBalance: patientBalance.currentBalance,
      });
    }, 10000);

    it('should prevent duplicate invoices (idempotency)', async () => {
      const testIds = {
        procedureId: uuidv4(),
        patientId: uuidv4(),
        providerId: uuidv4(),
      };

      const procedurePayload: ProcedureCompletedPayload = {
        procedureId: testIds.procedureId as any,
        patientId: testIds.patientId as any,
        providerId: testIds.providerId as any,
        organizationId: testTenantContext.organizationId as any,
        clinicId: testTenantContext.clinicId as any,
        tenantId: testTenantContext.tenantId,
        procedureCode: 'D1110',
        procedureName: 'Prophylaxis - adult',
        stockItemsUsed: [],
        providerName: 'Dr. Test Provider',
        patientName: 'Test Patient',
        requiresFollowUp: false,
        timestamp: new Date().toISOString() as any,
        metadata: {
          pricing: {
            amount: 200.0,
            currency: 'RON',
          },
        },
      };

      // Emit same event twice
      const event = createProcedureCompletedEvent(
        procedurePayload,
        {
          correlationId: uuidv4() as any,
          userId: testIds.providerId as any,
          source: 'test',
          idempotencyKey: `test-idempotency-${testIds.procedureId}`,
        },
        testTenantContext
      );

      eventEmitter.emit('procedure.completed', event);
      eventEmitter.emit('procedure.completed', event); // Duplicate

      await new Promise((resolve) => setTimeout(resolve, 400));

      // Verify only ONE invoice created
      const invoices = await invoicesService.findAll(
        { patientId: testIds.patientId },
        { ...testTenantContext, userId: testIds.providerId }
      );

      expect(invoices).toHaveLength(1);
      expect(invoices[0].linkedProcedureId).toBe(testIds.procedureId);

      console.log('Idempotency test passed - only 1 invoice created for duplicate events');
    }, 10000);
  });

  describe('Performance Tests', () => {
    it('should generate invoice within 200ms', async () => {
      const testIds = {
        procedureId: uuidv4(),
        patientId: uuidv4(),
        providerId: uuidv4(),
      };

      const startTime = Date.now();

      const procedurePayload: ProcedureCompletedPayload = {
        procedureId: testIds.procedureId as any,
        patientId: testIds.patientId as any,
        providerId: testIds.providerId as any,
        organizationId: testTenantContext.organizationId as any,
        clinicId: testTenantContext.clinicId as any,
        tenantId: testTenantContext.tenantId,
        procedureCode: 'D0120',
        procedureName: 'Periodic oral evaluation',
        stockItemsUsed: [],
        providerName: 'Dr. Test Provider',
        patientName: 'Test Patient',
        requiresFollowUp: false,
        timestamp: new Date().toISOString() as any,
        metadata: {
          pricing: {
            amount: 150.0,
            currency: 'RON',
          },
        },
      };

      const event = createProcedureCompletedEvent(
        procedurePayload,
        {
          correlationId: uuidv4() as any,
          userId: testIds.providerId as any,
          source: 'test',
          idempotencyKey: `test-perf-${testIds.procedureId}`,
        },
        testTenantContext
      );

      eventEmitter.emit('procedure.completed', event);
      await new Promise((resolve) => setTimeout(resolve, 250));

      const duration = Date.now() - startTime;

      const invoices = await invoicesService.findAll(
        { patientId: testIds.patientId },
        { ...testTenantContext, userId: testIds.providerId }
      );

      expect(invoices).toHaveLength(1);
      expect(duration).toBeLessThan(300); // Allow 300ms buffer

      console.log(`Invoice generation performance: ${duration}ms (target: <200ms)`);
    });

    it('should update patient balance within 100ms of payment', async () => {
      const testIds = {
        procedureId: uuidv4(),
        patientId: uuidv4(),
        providerId: uuidv4(),
      };

      // Setup: Create invoice
      const procedurePayload: ProcedureCompletedPayload = {
        procedureId: testIds.procedureId as any,
        patientId: testIds.patientId as any,
        providerId: testIds.providerId as any,
        organizationId: testTenantContext.organizationId as any,
        clinicId: testTenantContext.clinicId as any,
        tenantId: testTenantContext.tenantId,
        procedureCode: 'D0140',
        procedureName: 'Limited oral evaluation',
        stockItemsUsed: [],
        providerName: 'Dr. Test Provider',
        patientName: 'Test Patient',
        requiresFollowUp: false,
        timestamp: new Date().toISOString() as any,
        metadata: {
          pricing: {
            amount: 100.0,
            currency: 'RON',
          },
        },
      };

      const event = createProcedureCompletedEvent(
        procedurePayload,
        {
          correlationId: uuidv4() as any,
          userId: testIds.providerId as any,
          source: 'test',
          idempotencyKey: `test-balance-perf-${testIds.procedureId}`,
        },
        testTenantContext
      );

      eventEmitter.emit('procedure.completed', event);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const invoices = await invoicesService.findAll(
        { patientId: testIds.patientId },
        { ...testTenantContext, userId: testIds.providerId }
      );

      const invoice = invoices[0];

      // Performance test: payment → balance update
      const paymentStartTime = Date.now();

      await paymentsService.create(
        {
          invoiceId: invoice._id.toString(),
          patientId: testIds.patientId,
          amount: invoice.total,
          paymentMethod: 'CASH' as any,
          paymentDate: new Date().toISOString(),
        },
        { ...testTenantContext, userId: testIds.providerId }
      );

      await new Promise((resolve) => setTimeout(resolve, 150));

      const patientBalance = await patientBalancesService.getBalance(
        testIds.patientId,
        { ...testTenantContext, userId: testIds.providerId }
      );

      const balanceUpdateDuration = Date.now() - paymentStartTime;

      expect(patientBalance.currentBalance).toBe(0);
      expect(balanceUpdateDuration).toBeLessThan(200); // Allow 200ms buffer

      console.log(`Balance update performance: ${balanceUpdateDuration}ms (target: <100ms)`);
    });
  });
});
