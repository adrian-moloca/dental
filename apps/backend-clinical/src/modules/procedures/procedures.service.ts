import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Procedure, ProcedureDocument } from './entities/procedure.schema';
import { CreateProcedureDto, CompleteProcedureDto } from './dto/procedure.dto';
import {
  createProcedureCompletedEvent,
  ProcedureCompletedPayload,
  StockItemUsed,
} from '@dentalos/shared-events';
import { randomUUID } from 'crypto';

@Injectable()
export class ProceduresService {
  private readonly logger = new Logger(ProceduresService.name);

  constructor(
    @InjectModel(Procedure.name) private model: Model<ProcedureDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(patientId: string, dto: CreateProcedureDto, context: any, _userId: string) {
    const procedure = new this.model({ patientId, ...dto, ...context, status: 'PLANNED' });
    return procedure.save();
  }

  async findByPatient(patientId: string, context: any, filters: any) {
    const query: any = { patientId, tenantId: context.tenantId };
    if (filters.status) query.status = filters.status;
    return this.model.find(query).sort({ createdAt: -1 }).exec();
  }

  async complete(procedureId: string, dto: CompleteProcedureDto, context: any, userId: string) {
    const procedure = await this.model
      .findOne({ _id: procedureId, tenantId: context.tenantId })
      .exec();
    if (!procedure) throw new Error('Procedure not found');

    // Idempotency: If already completed, return existing
    if (procedure.status === 'COMPLETED') {
      this.logger.log(`Procedure ${procedureId} already completed - idempotent return`);
      return procedure;
    }

    procedure.status = 'COMPLETED';
    procedure.completedAt = new Date();
    procedure.performedBy = userId;
    procedure.materials = dto.materials || [];
    procedure.assistedBy = dto.assistedBy || [];

    const saved = await procedure.save();

    // Prepare enriched event with billing data
    const stockItemsUsed: StockItemUsed[] = (saved.materials || []).map((material) => ({
      stockItemId: material.itemId as any,
      itemName: `Material ${material.itemId}`, // TODO: Fetch actual name from inventory
      quantity: material.quantity,
      unit: 'unit',
    }));

    const payload: ProcedureCompletedPayload = {
      procedureId: saved._id.toString() as any,
      patientId: saved.patientId as any,
      providerId: userId as any,
      organizationId: context.organizationId as any,
      clinicId: context.clinicId as any,
      tenantId: context.tenantId,
      procedureCode: saved.procedureCode,
      procedureName: saved.description,
      tooth: saved.toothNumber?.toString(),
      toothNumberingSystem: 'UNIVERSAL',
      surfaces: saved.surfaces as any,
      stockItemsUsed,
      appointmentId: saved.appointmentId as any,
      treatmentPlanId: saved.treatmentPlanId as any,
      feeCharged: dto.pricing?.amount,
      providerName: 'Provider Name', // TODO: Fetch from user service
      patientName: 'Patient Name', // TODO: Fetch from patient service
      requiresFollowUp: false,
      timestamp: saved.completedAt!.toISOString() as any,
      metadata: {
        pricing: dto.pricing
          ? {
              amount: dto.pricing.amount,
              currency: dto.pricing.currency,
              insuranceCoverage: dto.pricing.insuranceCoverage,
            }
          : undefined,
      },
    };

    try {
      // Emit versioned domain event
      const event = createProcedureCompletedEvent(
        payload,
        {
          correlationId: randomUUID() as any,
          causationId: procedureId as any,
          userId: userId as any,
          source: { service: 'backend-clinical', version: '1.0.0' },
          idempotencyKey: `procedure-completion-${procedureId}`,
        },
        {
          organizationId: context.organizationId,
          clinicId: context.clinicId,
          tenantId: context.tenantId,
        },
      );

      this.eventEmitter.emit('procedure.completed', event);

      this.logger.log(`Procedure ${procedureId} completed - enriched event emitted`, {
        procedureId,
        patientId: saved.patientId,
        appointmentId: saved.appointmentId,
        feeCharged: dto.pricing?.amount,
      });
    } catch (error) {
      // Graceful degradation: procedure still completes even if event fails
      this.logger.error(`Failed to emit procedure.completed event for ${procedureId}`, error);
    }

    return saved;
  }
}
