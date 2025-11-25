import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TreatmentPlan, TreatmentPlanDocument } from './entities/treatment-plan.schema';
import { CreateTreatmentPlanDto } from './dto/create-treatment-plan.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class TreatmentPlansService {
  constructor(
    @InjectModel(TreatmentPlan.name) private model: Model<TreatmentPlanDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(patientId: string, dto: CreateTreatmentPlanDto, context: any, userId: string) {
    const options = dto.options.map((opt) => ({
      optionId: randomUUID(),
      ...opt,
      totalCost: opt.procedures.reduce((sum, p) => sum + p.estimatedCost, 0),
      isAccepted: false,
    }));

    const plan = new this.model({
      patientId,
      ...context,
      status: 'DRAFT',
      options,
      version: 1,
      createdBy: userId,
    });

    const saved = await plan.save();
    this.eventEmitter.emit('treatment.plan.created', {
      planId: saved._id,
      patientId,
      optionsCount: options.length,
      tenantId: context.tenantId,
    });
    return saved;
  }

  async findByPatient(patientId: string, context: any) {
    return this.model
      .find({ patientId, tenantId: context.tenantId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async acceptOption(planId: string, optionId: string, context: any, userId: string) {
    const plan = await this.model.findOne({ _id: planId, tenantId: context.tenantId }).exec();
    if (!plan) throw new Error('Plan not found');

    plan.acceptedOptionId = optionId;
    plan.acceptedAt = new Date();
    plan.status = 'ACCEPTED';
    plan.options.forEach((opt) => {
      opt.isAccepted = opt.optionId === optionId;
    });

    const saved = await plan.save();
    this.eventEmitter.emit('treatment.plan.accepted', {
      planId,
      optionId,
      acceptedBy: userId,
      tenantId: context.tenantId,
    });
    return saved;
  }
}
