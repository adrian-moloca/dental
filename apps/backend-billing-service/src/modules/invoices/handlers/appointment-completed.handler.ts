/**
 * Appointment Completed Event Handler
 *
 * Listens for AppointmentCompleted events from the Scheduling Service and
 * automatically generates invoices for the completed appointment.
 *
 * Business Flow:
 * 1. Receive AppointmentCompleted event from Scheduling Service
 * 2. Fetch completed procedures from Clinical Service (via event metadata or API)
 * 3. Look up prices from procedure catalog
 * 4. Check for duplicate invoice (idempotency)
 * 5. Generate invoice with line items
 * 6. Emit InvoiceCreated event
 *
 * Performance Target: <500ms end-to-end
 *
 * Idempotency: Uses appointmentId to prevent duplicate invoice creation
 */

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import {
  InvoiceGenerationService,
  AppointmentData,
  ProcedureData,
} from '../services/invoice-generation.service';
import { PaymentTerms } from '../entities/invoice.entity';

// Import type from shared-events if available, otherwise define locally
interface AppointmentCompletedEventPayload {
  appointmentId: string;
  patientId: string;
  patientName?: string;
  providerId: string;
  providerName?: string;
  scheduledAt: string;
  completedAt: string;
  organizationId: string;
  clinicId: string;
  completedBy: string;
  notes?: string;
  // Procedures performed during the appointment
  procedures?: Array<{
    procedureId: string;
    procedureCode: string;
    procedureName: string;
    tooth?: string;
    surfaces?: string[];
    quantity?: number;
    unitPrice?: number;
    providerId?: string;
    commissionRate?: number;
    taxExempt?: boolean;
  }>;
  // Treatment plan reference
  treatmentPlanId?: string;
  // Patient contact info for invoice
  customerName?: string;
  customerAddress?: string;
  customerTaxId?: string;
  customerEmail?: string;
}

interface EventEnvelope<T> {
  id: string;
  type: string;
  version: number;
  occurredAt: Date;
  payload: T;
  metadata: {
    correlationId: string;
    causationId?: string;
    userId?: string;
    source?: {
      service: string;
      version: string;
    };
  };
  tenantContext: {
    tenantId: string;
    organizationId?: string;
    clinicId?: string;
  };
}

interface TenantContext {
  tenantId: string;
  organizationId: string;
  clinicId: string;
  userId?: string;
}

@Injectable()
export class AppointmentCompletedHandler {
  private readonly logger = new Logger(AppointmentCompletedHandler.name);

  // Default price to use if procedure price not provided
  private readonly DEFAULT_PROCEDURE_PRICE = 100;

  constructor(
    private invoiceGenerationService: InvoiceGenerationService,
    private configService: ConfigService,
  ) {}

  /**
   * Handle AppointmentCompleted event
   *
   * This handler is triggered when an appointment is marked as completed
   * in the scheduling service.
   */
  @OnEvent('appointment.completed', { async: true })
  async handleAppointmentCompleted(
    event: EventEnvelope<AppointmentCompletedEventPayload>,
  ): Promise<void> {
    const startTime = Date.now();

    // Validate event structure
    if (!event?.payload || !event?.tenantContext) {
      this.logger.warn('Received invalid appointment.completed event - missing payload or context');
      return;
    }

    const { payload, metadata, tenantContext } = event;

    this.logger.log('Processing appointment.completed event', {
      appointmentId: payload.appointmentId,
      patientId: payload.patientId,
      correlationId: metadata?.correlationId,
    });

    // Check if auto-invoice generation is enabled
    const autoInvoiceEnabled = this.configService.get<boolean>(
      'billing.autoInvoiceOnAppointmentComplete',
      true,
    );

    if (!autoInvoiceEnabled) {
      this.logger.log('Auto-invoice generation disabled, skipping invoice creation', {
        appointmentId: payload.appointmentId,
      });
      return;
    }

    try {
      // Build tenant context
      const context: TenantContext = {
        tenantId: tenantContext.tenantId,
        organizationId: tenantContext.organizationId || payload.organizationId,
        clinicId: tenantContext.clinicId || payload.clinicId,
        userId: metadata?.userId || payload.completedBy,
      };

      // Skip if no procedures
      if (!payload.procedures || payload.procedures.length === 0) {
        this.logger.log('No procedures in appointment, skipping invoice generation', {
          appointmentId: payload.appointmentId,
        });
        return;
      }

      // Transform procedures for invoice generation
      const procedures = this.transformProcedures(payload.procedures);

      // Build appointment data
      const appointmentData: AppointmentData = {
        appointmentId: payload.appointmentId,
        patientId: payload.patientId,
        patientName: payload.patientName || 'Unknown Patient',
        providerId: payload.providerId,
        providerName: payload.providerName || 'Unknown Provider',
        completedAt: payload.completedAt,
        procedures,
        treatmentPlanId: payload.treatmentPlanId,
        customerName: payload.customerName,
        customerAddress: payload.customerAddress,
        customerTaxId: payload.customerTaxId,
        customerEmail: payload.customerEmail,
      };

      // Generate invoice
      const result = await this.invoiceGenerationService.createFromAppointment(
        appointmentData,
        {
          paymentTerms: PaymentTerms.DUE_ON_RECEIPT,
          autoIssue: this.configService.get<boolean>('billing.autoIssueInvoice', false),
          defaultTaxRate: this.configService.get<number>('billing.defaultTaxRate', 0.19),
          currency: this.configService.get<string>('billing.defaultCurrency', 'RON'),
        },
        context,
      );

      const duration = Date.now() - startTime;

      this.logger.log('Invoice auto-generated from appointment', {
        appointmentId: payload.appointmentId,
        invoiceId: result.invoice._id.toString(),
        invoiceNumber: result.invoice.invoiceNumber,
        total: result.invoice.total,
        itemCount: result.invoiceItems.length,
        warnings: result.warnings,
        duration: `${duration}ms`,
      });

      // Performance check
      if (duration > 500) {
        this.logger.warn('Invoice auto-generation exceeded performance budget', {
          duration: `${duration}ms`,
          target: '500ms',
          appointmentId: payload.appointmentId,
        });
      }
    } catch (error) {
      // Handle duplicate invoice error gracefully
      if (error instanceof Error && error.message.includes('Invoice already exists')) {
        this.logger.log('Invoice already exists for appointment - skipping', {
          appointmentId: payload.appointmentId,
          correlationId: metadata?.correlationId,
        });
        return;
      }

      this.logger.error('Failed to auto-generate invoice from appointment', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        appointmentId: payload.appointmentId,
        correlationId: metadata?.correlationId,
      });

      // Don't rethrow - we want graceful degradation
      // The appointment completion should not fail because invoice generation failed
    }
  }

  /**
   * Handle legacy procedure.completed event for backward compatibility
   * This handler supports the existing ProcedureCompleted event format
   */
  @OnEvent('procedure.completed', { async: true })
  async handleProcedureCompleted(_event: EventEnvelope<unknown>): Promise<void> {
    // This is handled by the existing ProcedureCompletedHandler
    // This method is here for documentation/reference only
    this.logger.debug(
      'procedure.completed event received - delegating to ProcedureCompletedHandler',
    );
  }

  /**
   * Transform procedure data from event to invoice generation format
   */
  private transformProcedures(
    procedures: NonNullable<AppointmentCompletedEventPayload['procedures']>,
  ): ProcedureData[] {
    return procedures.map((proc) => ({
      procedureId: proc.procedureId,
      procedureCode: proc.procedureCode,
      procedureName: proc.procedureName,
      tooth: proc.tooth,
      surfaces: proc.surfaces,
      quantity: proc.quantity || 1,
      unitPrice: proc.unitPrice ?? this.lookupProcedurePrice(proc.procedureCode),
      providerId: proc.providerId,
      commissionRate: proc.commissionRate,
      taxExempt: proc.taxExempt,
    }));
  }

  /**
   * Look up procedure price from catalog
   * In production, this would query the price catalog service
   */
  private lookupProcedurePrice(procedureCode: string): number {
    // TODO: Implement actual price catalog lookup
    // For now, log a warning and use default price
    this.logger.warn(`No price provided for procedure ${procedureCode}, using default`, {
      procedureCode,
      defaultPrice: this.DEFAULT_PROCEDURE_PRICE,
    });
    return this.DEFAULT_PROCEDURE_PRICE;
  }
}
