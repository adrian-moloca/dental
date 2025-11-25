/**
 * Procedure Completed Event Handler
 *
 * Listens to procedure.completed events from Clinical Service and automatically
 * generates invoices for billing. Implements idempotent invoice creation with
 * deduplication to prevent duplicate invoices.
 *
 * Business Flow:
 * 1. Receive procedure.completed event from Clinical Service
 * 2. Check if invoice already exists for this procedureId (deduplication)
 * 3. Generate invoice with procedure pricing as line item
 * 4. Link invoiceId ↔ procedureId for traceability
 * 5. Emit invoice.generated event for downstream consumers
 *
 * Performance Target: <200ms end-to-end
 */

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  isProcedureCompletedEvent,
  createInvoiceCreatedEvent,
  InvoiceCreatedPayload,
  type EventEnvelope,
  type TenantContext,
} from '@dentalos/shared-events';
import { Invoice } from '../entities/invoice.entity';
import { InvoiceItem } from '../../invoice-items/entities/invoice-item.entity';
import { InvoiceStatus } from '../../../common/types';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ProcedureCompletedHandler {
  private readonly logger = new Logger(ProcedureCompletedHandler.name);

  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<Invoice>,
    @InjectModel(InvoiceItem.name) private invoiceItemModel: Model<InvoiceItem>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Handle procedure.completed event
   * Auto-generates invoice from completed procedure
   */
  @OnEvent('procedure.completed', { async: true })
  async handleProcedureCompleted(event: EventEnvelope<unknown>): Promise<void> {
    // Validate event type
    if (!isProcedureCompletedEvent(event)) {
      this.logger.warn('Received invalid procedure.completed event', {
        eventType: (event as any)?.type,
      });
      return;
    }

    const { payload, metadata, tenantContext } = event;
    const startTime = Date.now();

    this.logger.log('Processing procedure.completed event', {
      procedureId: payload.procedureId,
      patientId: payload.patientId,
      correlationId: metadata.correlationId,
    });

    try {
      // Deduplication: Check if invoice already exists for this procedure
      const existingInvoice = await this.invoiceModel.findOne({
        linkedProcedureId: payload.procedureId,
        tenantId: tenantContext.tenantId,
        organizationId: tenantContext.organizationId,
      });

      if (existingInvoice) {
        this.logger.log('Invoice already exists for procedure - skipping', {
          procedureId: payload.procedureId,
          invoiceId: existingInvoice._id,
          invoiceNumber: existingInvoice.invoiceNumber,
        });
        return;
      }

      // Extract pricing from procedure metadata
      const pricing = payload.metadata?.pricing as any;
      if (!pricing || !pricing.amount) {
        this.logger.warn('No pricing data in procedure - skipping invoice generation', {
          procedureId: payload.procedureId,
        });
        return;
      }

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber(tenantContext);

      // Calculate invoice totals
      const subtotal = pricing.amount;
      const taxRate = 0.19; // 19% VAT (Romanian standard)
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount;

      // Calculate due date (30 days from now)
      const issueDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      // Create invoice
      const invoice = new this.invoiceModel({
        invoiceNumber,
        patientId: payload.patientId,
        providerId: payload.providerId,
        appointmentId: payload.appointmentId,
        linkedProcedureId: payload.procedureId, // Critical: link for traceability
        issueDate,
        dueDate,
        subtotal,
        taxAmount,
        discountAmount: 0,
        total,
        amountPaid: 0,
        balance: total,
        currency: pricing.currency || 'RON',
        status: InvoiceStatus.SENT, // Auto-issued
        items: [],
        tenantId: tenantContext.tenantId,
        organizationId: tenantContext.organizationId,
        clinicId: tenantContext.clinicId,
        createdBy: metadata.userId,
      });

      const savedInvoice = await invoice.save();

      // Create invoice line item
      const invoiceItem = new this.invoiceItemModel({
        invoiceId: savedInvoice._id,
        itemType: 'SERVICE',
        description: `${payload.procedureCode} - ${payload.procedureName}`,
        procedureCode: payload.procedureCode,
        quantity: 1,
        unitPrice: subtotal,
        totalPrice: subtotal,
        taxRate,
        taxAmount,
        linkedProcedureId: payload.procedureId,
        toothNumber: payload.tooth,
        surfaces: payload.surfaces,
        tenantId: tenantContext.tenantId,
        organizationId: tenantContext.organizationId,
        clinicId: tenantContext.clinicId,
      });

      await invoiceItem.save();

      // Update invoice with item reference
      savedInvoice.items = [invoiceItem._id as any];
      await savedInvoice.save();

      const duration = Date.now() - startTime;

      this.logger.log('Invoice auto-generated from procedure', {
        procedureId: payload.procedureId,
        invoiceId: savedInvoice._id,
        invoiceNumber: savedInvoice.invoiceNumber,
        total,
        duration: `${duration}ms`,
      });

      // Emit invoice.generated event
      try {
        const invoiceEvent: InvoiceCreatedPayload = {
          invoiceId: savedInvoice._id.toString() as any,
          invoiceNumber: savedInvoice.invoiceNumber,
          patientId: payload.patientId,
          patientName: payload.patientName,
          providerId: payload.providerId,
          providerName: payload.providerName,
          organizationId: tenantContext.organizationId as any,
          clinicId: tenantContext.clinicId as any,
          tenantId: tenantContext.tenantId,
          appointmentId: payload.appointmentId,
          issueDate: issueDate.toISOString() as any,
          dueDate: dueDate.toISOString() as any,
          subtotal,
          taxAmount,
          discountAmount: 0,
          total,
          currency: pricing.currency || 'RON',
          itemCount: 1,
          status: 'ISSUED',
          autoGenerated: true,
          timestamp: new Date().toISOString() as any,
          metadata: {
            linkedProcedureId: payload.procedureId,
            procedureCode: payload.procedureCode,
          },
        };

        const createdEvent = createInvoiceCreatedEvent(
          invoiceEvent,
          {
            correlationId: metadata.correlationId as any,
            causationId: event.id as any,
            userId: metadata.userId as any,
            source: metadata.source || {
              service: 'backend-billing-service',
              version: '1.0.0',
            },
          },
          tenantContext,
        );

        this.eventEmitter.emit('invoice.generated', createdEvent);
      } catch (eventError) {
        this.logger.error('Failed to emit invoice.generated event', {
          error: eventError,
          invoiceId: savedInvoice._id,
        });
      }

      // Performance check
      if (duration > 200) {
        this.logger.warn('Invoice auto-generation exceeded performance budget', {
          duration: `${duration}ms`,
          target: '200ms',
          procedureId: payload.procedureId,
        });
      }
    } catch (error) {
      this.logger.error('Failed to auto-generate invoice from procedure', {
        error,
        procedureId: payload.procedureId,
        correlationId: metadata.correlationId,
      });
      // Don't throw - graceful degradation
    }
  }

  /**
   * Generate unique invoice number
   * Format: INV-{YYYY}-{sequential}
   */
  private async generateInvoiceNumber(context: TenantContext): Promise<string> {
    const prefix = 'INV';
    const year = new Date().getFullYear();

    const lastInvoice = await this.invoiceModel
      .findOne({
        tenantId: context.tenantId,
        organizationId: context.organizationId,
        invoiceNumber: new RegExp(`^${prefix}-${year}-`),
      })
      .sort({ invoiceNumber: -1 });

    let sequence = 1;
    if (lastInvoice) {
      const lastNumber = lastInvoice.invoiceNumber.split('-').pop();
      sequence = parseInt(lastNumber || '0', 10) + 1;
    }

    const sequenceStr = String(sequence).padStart(5, '0');
    return `${prefix}-${year}-${sequenceStr}`;
  }
}
