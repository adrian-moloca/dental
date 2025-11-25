import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { InvoiceStatus, InvoiceItemType, PaymentMethod } from '../src/common/types';

/**
 * E2E Test for Basic Billing Flow
 *
 * This test demonstrates the complete billing workflow:
 * 1. Create invoice (DRAFT)
 * 2. Add line items with 19% VAT
 * 3. Issue invoice (move to SENT)
 * 4. Record payment
 * 5. Verify invoice marked as PAID
 */
describe('Billing Flow (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let invoiceId: string;

  const mockContext = {
    tenantId: 'test-tenant-123',
    organizationId: 'test-org-123',
    clinicId: 'test-clinic-123',
    userId: 'test-user-123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // TODO: Get actual auth token from auth service
    // For now, mock it if you have JWT guards disabled or mock guards
    authToken = 'mock-jwt-token';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete Billing Flow', () => {
    it('Step 1: Create a new invoice', async () => {
      const createInvoiceDto = {
        patientId: 'patient-123',
        providerId: 'provider-123',
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        currency: 'RON',
        notes: 'Dental treatment invoice',
      };

      const response = await request(app.getHttpServer())
        .post('/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createInvoiceDto)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.invoiceNumber).toMatch(/INV-\d{4}-\d{5}/);
      expect(response.body.status).toBe(InvoiceStatus.DRAFT);
      expect(response.body.currency).toBe('RON');
      expect(response.body.total).toBe(0);
      expect(response.body.balance).toBe(0);

      invoiceId = response.body._id;
    });

    it('Step 2: Add line items with 19% VAT', async () => {
      // Add procedure item
      const procedureItem = {
        itemType: InvoiceItemType.PROCEDURE,
        code: 'PROC-001',
        description: 'Dental cleaning',
        quantity: 1,
        unitPrice: 100,
        // taxRate will default to 0.19 (19%)
      };

      const response1 = await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/items`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(procedureItem)
        .expect(201);

      expect(response1.body.taxRate).toBe(0.19);
      expect(response1.body.totalPrice).toBe(100);
      expect(response1.body.taxAmount).toBe(19);

      // Add product item
      const productItem = {
        itemType: InvoiceItemType.PRODUCT,
        code: 'PROD-001',
        description: 'Toothpaste',
        quantity: 2,
        unitPrice: 25,
        taxRate: 0.19,
      };

      const response2 = await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/items`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(productItem)
        .expect(201);

      expect(response2.body.taxRate).toBe(0.19);
      expect(response2.body.totalPrice).toBe(50);
      expect(response2.body.taxAmount).toBe(9.5);
    });

    it('Step 3: Verify invoice totals are calculated correctly', async () => {
      const response = await request(app.getHttpServer())
        .get(`/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Subtotal: 100 + 50 = 150
      // Tax: 19 + 9.5 = 28.5
      // Total: 150 + 28.5 = 178.5
      expect(response.body.subtotal).toBe(150);
      expect(response.body.taxAmount).toBe(28.5);
      expect(response.body.total).toBe(178.5);
      expect(response.body.balance).toBe(178.5);
      expect(response.body.status).toBe(InvoiceStatus.DRAFT);
    });

    it('Step 4: Update invoice before issuing', async () => {
      const updateDto = {
        notes: 'Updated notes before issuing',
        terms: 'Net 30',
      };

      const response = await request(app.getHttpServer())
        .patch(`/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.notes).toBe('Updated notes before issuing');
      expect(response.body.terms).toBe('Net 30');
    });

    it('Step 5: Issue the invoice', async () => {
      const response = await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/issue`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.status).toBe(InvoiceStatus.SENT);
    });

    it('Step 6: Attempt to update issued invoice (should fail)', async () => {
      const updateDto = {
        notes: 'This should fail',
      };

      await request(app.getHttpServer())
        .patch(`/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(400);
    });

    it('Step 7: Record partial payment', async () => {
      const paymentDto = {
        invoiceId: invoiceId,
        patientId: 'patient-123',
        paymentDate: new Date().toISOString(),
        amount: 100,
        currency: 'RON',
        paymentMethod: PaymentMethod.CASH,
      };

      const response = await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/payments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentDto)
        .expect(201);

      expect(response.body.amount).toBe(100);
      expect(response.body.paymentMethod).toBe(PaymentMethod.CASH);
      expect(response.body.status).toBe('COMPLETED');
    });

    it('Step 8: Verify invoice is partially paid', async () => {
      const response = await request(app.getHttpServer())
        .get(`/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.amountPaid).toBe(100);
      expect(response.body.balance).toBe(78.5);
      expect(response.body.status).toBe(InvoiceStatus.PARTIALLY_PAID);
    });

    it('Step 9: Record remaining payment', async () => {
      const paymentDto = {
        invoiceId: invoiceId,
        patientId: 'patient-123',
        paymentDate: new Date().toISOString(),
        amount: 78.5,
        currency: 'RON',
        paymentMethod: PaymentMethod.CARD,
      };

      const response = await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/payments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentDto)
        .expect(201);

      expect(response.body.amount).toBe(78.5);
      expect(response.body.paymentMethod).toBe(PaymentMethod.CARD);
    });

    it('Step 10: Verify invoice is fully paid', async () => {
      const response = await request(app.getHttpServer())
        .get(`/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.amountPaid).toBe(178.5);
      expect(response.body.balance).toBe(0);
      expect(response.body.status).toBe(InvoiceStatus.PAID);
      expect(response.body.paidDate).toBeTruthy();
    });

    it('Step 11: Get all payments for invoice', async () => {
      const response = await request(app.getHttpServer())
        .get(`/invoices/${invoiceId}/payments`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].amount + response.body[1].amount).toBe(178.5);
    });

    it('Step 12: Get all line items for invoice', async () => {
      const response = await request(app.getHttpServer())
        .get(`/invoices/${invoiceId}/items`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
  });

  describe('Pagination', () => {
    it('should return paginated invoices', async () => {
      const response = await request(app.getHttpServer())
        .get('/invoices?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should prevent overpayment', async () => {
      // Create a simple invoice
      const invoice = await request(app.getHttpServer())
        .post('/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: 'patient-456',
          providerId: 'provider-123',
          issueDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .expect(201);

      const testInvoiceId = invoice.body._id;

      // Add item
      await request(app.getHttpServer())
        .post(`/invoices/${testInvoiceId}/items`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemType: InvoiceItemType.PROCEDURE,
          code: 'TEST-001',
          description: 'Test',
          quantity: 1,
          unitPrice: 100,
          taxRate: 0.19,
        })
        .expect(201);

      // Issue
      await request(app.getHttpServer())
        .post(`/invoices/${testInvoiceId}/issue`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      // Try to overpay
      await request(app.getHttpServer())
        .post(`/invoices/${testInvoiceId}/payments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invoiceId: testInvoiceId,
          patientId: 'patient-456',
          paymentDate: new Date().toISOString(),
          amount: 200, // More than the total (119)
          currency: 'RON',
          paymentMethod: PaymentMethod.CASH,
        })
        .expect(400);
    });

    it('should handle invoice with zero VAT items', async () => {
      const invoice = await request(app.getHttpServer())
        .post('/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: 'patient-789',
          providerId: 'provider-123',
          issueDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .expect(201);

      const testInvoiceId = invoice.body._id;

      await request(app.getHttpServer())
        .post(`/invoices/${testInvoiceId}/items`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemType: InvoiceItemType.PROCEDURE,
          code: 'EXEMPT-001',
          description: 'VAT exempt service',
          quantity: 1,
          unitPrice: 100,
          taxRate: 0,
        })
        .expect(201);

      const result = await request(app.getHttpServer())
        .get(`/invoices/${testInvoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(result.body.subtotal).toBe(100);
      expect(result.body.taxAmount).toBe(0);
      expect(result.body.total).toBe(100);
    });
  });

  describe('PDF Generation', () => {
    it('should return placeholder for PDF generation', async () => {
      const response = await request(app.getHttpServer())
        .get(`/invoices/${invoiceId}/pdf`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('PDF generation not yet implemented');
    });
  });
});
