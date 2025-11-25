import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PerioChart, PerioChartDocument } from './entities/perio-chart.schema';
import { CreatePerioChartDto } from './dto/create-perio-chart.dto';

@Injectable()
export class PerioChartService {
  constructor(@InjectModel(PerioChart.name) private model: Model<PerioChartDocument>) {}

  async create(patientId: string, dto: CreatePerioChartDto, context: any, userId: string) {
    const recordedDate = new Date(dto.recordedDate);
    recordedDate.setHours(0, 0, 0, 0);

    const existing = await this.model.findOne({
      patientId,
      tenantId: context.tenantId,
      recordedDate: { $gte: recordedDate, $lt: new Date(recordedDate.getTime() + 86400000) },
    });

    if (existing) {
      throw new ConflictException('Perio chart already exists for this date');
    }

    const teeth = new Map();
    dto.teeth.forEach((t) => teeth.set(t.toothNumber, t));

    const chart = new this.model({
      patientId,
      ...context,
      recordedDate,
      teeth,
      recordedBy: userId,
    });

    return chart.save();
  }

  async findByPatient(patientId: string, context: any, limit = 10) {
    return this.model
      .find({ patientId, tenantId: context.tenantId })
      .sort({ recordedDate: -1 })
      .limit(limit)
      .exec();
  }

  async findById(chartId: string, context: any) {
    return this.model.findOne({ _id: chartId, tenantId: context.tenantId }).exec();
  }
}
