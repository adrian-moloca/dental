import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EFacturaService } from '../e-factura.service';
import { EFacturaConfigService } from '../services/e-factura-config.service';
import { EFacturaConfigStatus } from '../entities/e-factura-config.schema';

/**
 * Invoice issued event payload
 * Matches the event emitted by InvoicesService
 */
interface InvoiceIssuedEvent {
  invoiceId: string;
  invoiceNumber: string;
  patientId: string;
  total: number;
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  userId?: string;
}

/**
 * Invoice Issued Event Listener
 *
 * Listens for 'invoice.issued' events and automatically queues
 * E-Factura submissions based on configuration.
 *
 * Auto-submit behavior:
 * 1. Check if E-Factura is enabled and configured for the tenant
 * 2. Check if auto-submit is enabled
 * 3. Check if invoice meets criteria (B2B only, min amount, etc.)
 * 4. Queue the submission (with optional delay)
 */
@Injectable()
export class InvoiceIssuedListener {
  private readonly logger = new Logger(InvoiceIssuedListener.name);

  constructor(
    private readonly eFacturaService: EFacturaService,
    private readonly configService: EFacturaConfigService,
  ) {}

  /**
   * Handle invoice.issued event
   */
  @OnEvent('invoice.issued')
  async handleInvoiceIssued(event: InvoiceIssuedEvent): Promise<void> {
    const context = {
      tenantId: event.tenantId,
      organizationId: event.organizationId,
      clinicId: event.clinicId,
      userId: event.userId,
    };

    this.logger.debug(`Received invoice.issued event for invoice ${event.invoiceNumber}`);

    try {
      // Get E-Factura configuration
      const config = await this.configService.findOne(context);

      // Check if E-Factura is enabled
      if (!config) {
        this.logger.debug(
          `No E-Factura config found for tenant ${event.tenantId}. Skipping auto-submit.`,
        );
        return;
      }

      if (!config.enabled) {
        this.logger.debug(
          `E-Factura is disabled for tenant ${event.tenantId}. Skipping auto-submit.`,
        );
        return;
      }

      if (config.status !== EFacturaConfigStatus.ACTIVE) {
        this.logger.debug(
          `E-Factura config status is ${config.status} for tenant ${event.tenantId}. Skipping auto-submit.`,
        );
        return;
      }

      // Check if auto-submit is enabled
      if (!config.autoSubmit?.enabled) {
        this.logger.debug(`Auto-submit is disabled for tenant ${event.tenantId}. Skipping.`);
        return;
      }

      // Check minimum amount threshold
      if (config.autoSubmit.minAmount && event.total < config.autoSubmit.minAmount) {
        this.logger.debug(
          `Invoice total ${event.total} is below minimum ${config.autoSubmit.minAmount}. Skipping auto-submit.`,
        );
        return;
      }

      // For B2B-only setting, we need to check if the invoice has a buyer CUI
      // This requires fetching the invoice details
      if (config.autoSubmit.b2bOnly) {
        const isB2B = await this.eFacturaService.isInvoiceB2B(event.invoiceId, context);
        if (!isB2B) {
          this.logger.debug(
            `Invoice ${event.invoiceNumber} is B2C and auto-submit is B2B only. Skipping.`,
          );
          return;
        }
      }

      // Apply delay if configured
      const delayMs = (config.autoSubmit.delayMinutes || 0) * 60 * 1000;

      if (delayMs > 0) {
        this.logger.log(
          `Scheduling auto-submit for invoice ${event.invoiceNumber} in ${config.autoSubmit.delayMinutes} minutes`,
        );

        // Use setTimeout for delayed submission
        // In production, this should use a proper job queue (Bull/BullMQ)
        setTimeout(async () => {
          try {
            await this.submitInvoice(event.invoiceId, event.invoiceNumber, context);
          } catch (error) {
            this.logger.error(
              `Delayed auto-submit failed for invoice ${event.invoiceNumber}: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        }, delayMs);
      } else {
        // Submit immediately
        await this.submitInvoice(event.invoiceId, event.invoiceNumber, context);
      }
    } catch (error) {
      this.logger.error(
        `Error processing invoice.issued event for ${event.invoiceNumber}: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Don't throw - we don't want to disrupt the invoice issuance
    }
  }

  /**
   * Submit invoice to E-Factura
   */
  private async submitInvoice(
    invoiceId: string,
    invoiceNumber: string,
    context: {
      tenantId: string;
      organizationId: string;
      clinicId?: string;
      userId?: string;
    },
  ): Promise<void> {
    try {
      this.logger.log(`Auto-submitting invoice ${invoiceNumber} to E-Factura`);

      // Generate XML and submit
      const result = await this.eFacturaService.generateAndSubmit(invoiceId, context);

      this.logger.log(
        `Auto-submit successful for invoice ${invoiceNumber}. Upload index: ${result.uploadIndex}`,
      );
    } catch (error) {
      this.logger.error(
        `Auto-submit failed for invoice ${invoiceNumber}: ${error instanceof Error ? error.message : String(error)}`,
      );

      // Record error in config for monitoring
      await this.configService.recordError(
        context,
        `Auto-submit failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      // Don't re-throw - the error is logged and can be retried manually
    }
  }
}
