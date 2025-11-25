import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InvoicesService } from '../../invoices/invoices.service';
import { InvoiceItemsService } from '../../invoice-items/invoice-items.service';
import { ConfigService } from '@nestjs/config';
import { InvoiceItemType } from '../../../common/types';

interface ProcedureCompletedEvent {
  procedureId: string;
  patientId: string;
  providerId: string;
  appointmentId: string;
  procedureCode: string;
  procedureName: string;
  quantity: number;
  fee: number;
  tenantId: string;
  organizationId: string;
  clinicId: string;
  userId: string;
}

@Injectable()
export class ProcedureCompletedHandler {
  private readonly logger = new Logger(ProcedureCompletedHandler.name);

  constructor(
    private invoicesService: InvoicesService,
    private invoiceItemsService: InvoiceItemsService,
    private configService: ConfigService,
  ) {}

  @OnEvent('procedure.completed')
  async handleProcedureCompleted(event: ProcedureCompletedEvent): Promise<void> {
    this.logger.log(`Processing ProcedureCompletedEvent for procedure ${event.procedureId}`);

    const autoGenerate = this.configService.get<boolean>('billing.autoGenerateInvoices', true);

    if (!autoGenerate) {
      this.logger.log('Auto-generate invoices disabled, skipping');
      return;
    }

    const context = {
      tenantId: event.tenantId,
      organizationId: event.organizationId,
      clinicId: event.clinicId,
      userId: event.userId,
    };

    try {
      // Check if invoice already exists for this appointment
      let invoice = (
        await this.invoicesService.findAll(
          {
            patientId: event.patientId,
            providerId: event.providerId,
          },
          context,
        )
      ).find((inv) => inv.appointmentId === event.appointmentId && inv.status === 'DRAFT');

      // Create invoice if doesn't exist
      if (!invoice) {
        const dueDate = new Date();
        dueDate.setDate(
          dueDate.getDate() + this.configService.get<number>('billing.invoiceDueDays', 30),
        );

        invoice = await this.invoicesService.create(
          {
            patientId: event.patientId,
            providerId: event.providerId,
            appointmentId: event.appointmentId,
            issueDate: new Date().toISOString(),
            dueDate: dueDate.toISOString(),
            currency: 'USD',
          },
          context,
        );

        this.logger.log(`Created invoice ${invoice.invoiceNumber} for procedure`);
      }

      // Add procedure as invoice item
      await this.invoiceItemsService.create(
        invoice._id.toString(),
        {
          itemType: InvoiceItemType.PROCEDURE,
          referenceId: event.procedureId,
          code: event.procedureCode,
          description: event.procedureName,
          quantity: event.quantity,
          unitPrice: event.fee,
          taxRate: this.configService.get<number>('billing.taxDefaultRate', 0.1),
          providerId: event.providerId,
        },
        context,
      );

      this.logger.log(`Added procedure ${event.procedureCode} to invoice ${invoice.invoiceNumber}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to process procedure completed event: ${error?.message}`,
        error?.stack,
      );
    }
  }
}
