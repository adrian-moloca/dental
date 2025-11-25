import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

interface ImagingStudyCreatedEvent {
  studyId: string;
  patientId: string;
  providerId: string;
  appointmentId?: string;
  modality: string;
  studyDescription: string;
  fee: number;
  tenantId: string;
  organizationId: string;
  clinicId: string;
  userId: string;
}

const IMAGING_CODES: Record<string, string> = {
  CBCT: 'RAD-001',
  PANORAMIC: 'RAD-002',
  PERIAPICAL: 'RAD-003',
  BITEWING: 'RAD-004',
  CEPHALOMETRIC: 'RAD-005',
  INTRAORAL: 'RAD-006',
};

@Injectable()
export class ImagingStudyCreatedHandler {
  private readonly logger = new Logger(ImagingStudyCreatedHandler.name);

  constructor() {}

  @OnEvent('imaging.study.created')
  async handleImagingStudyCreated(event: ImagingStudyCreatedEvent): Promise<void> {
    this.logger.log(`Processing ImagingStudyCreatedEvent for study ${event.studyId}`);

    try {
      // Find existing draft invoice for this appointment/patient
      // For simplicity, we'll log - actual implementation would query invoices
      const billingCode = IMAGING_CODES[event.modality] || 'RAD-000';

      this.logger.log(`Imaging study ${event.modality} mapped to billing code ${billingCode}`);

      // If invoice exists, add imaging fee
      // This is a placeholder - actual implementation would:
      // 1. Find or create invoice for appointment
      // 2. Add imaging item to invoice
      // 3. Apply any imaging-specific price rules

      this.logger.log(
        `Imaging fee ${event.fee} ready to be added to invoice for patient ${event.patientId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to process imaging study created event: ${error?.message}`,
        error?.stack,
      );
    }
  }
}
