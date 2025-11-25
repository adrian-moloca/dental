import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { StockService } from '../../stock/stock.service';

/**
 * Event payload from clinical service when a procedure is completed
 */
export interface ProcedureCompletedEvent {
  procedureId: string;
  treatmentId: string;
  patientId: string;
  clinicId: string;
  locationId: string; // Location where procedure was performed
  materials: Array<{
    productId: string;
    quantity: number;
    unitOfMeasure?: string;
  }>;
  performedBy: string;
  performedAt: Date;
  tenantId: string;
  organizationId: string;
}

/**
 * ProcedureCompletedHandler
 *
 * Listens for procedure completion events from the clinical service
 * Automatically deducts stock using FEFO logic
 * Emits low stock alerts if necessary
 */
@Injectable()
export class ProcedureCompletedHandler {
  private readonly logger = new Logger(ProcedureCompletedHandler.name);

  constructor(private readonly stockService: StockService) {}

  /**
   * Handle procedure.completed event
   * Automatically deduct materials used in the procedure
   */
  @OnEvent('procedure.completed')
  async handleProcedureCompleted(event: ProcedureCompletedEvent) {
    this.logger.log(`Handling procedure.completed event for procedure ${event.procedureId}`);

    if (!event.materials || event.materials.length === 0) {
      this.logger.log('No materials to deduct, skipping stock deduction');
      return;
    }

    try {
      // Deduct stock using FEFO logic
      const result = await this.stockService.deductStock(
        {
          locationId: event.locationId,
          materials: event.materials,
          referenceType: 'PROCEDURE',
          referenceId: event.procedureId,
          reason: `Stock consumed by procedure ${event.procedureId}`,
          notes: `Auto-deduction from procedure completed event`,
        },
        event.tenantId,
        event.organizationId,
        event.clinicId,
        event.performedBy,
      );

      this.logger.log(
        `Stock deducted successfully for procedure ${event.procedureId}. ` +
          `Movements: ${result.movementIds.length}, Lots used: ${result.lotsUsed.length}`,
      );

      if (result.warnings && result.warnings.length > 0) {
        this.logger.warn(
          `Low stock warnings for procedure ${event.procedureId}: ${result.warnings.join(', ')}`,
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to deduct stock for procedure ${event.procedureId}: ${errorMessage}`,
        errorStack,
      );

      // Emit error event for alerting/monitoring
      // In production, this could trigger notifications to staff
      throw error;
    }
  }
}
