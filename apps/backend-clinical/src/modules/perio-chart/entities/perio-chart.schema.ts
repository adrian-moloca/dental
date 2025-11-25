/**
 * Periodontal Chart Schema
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class Site {
  @Prop({ required: true, min: 1, max: 6 })
  siteNumber!: number;

  @Prop({ required: true, min: 0, max: 20 })
  probingDepth!: number;

  @Prop({ required: true, min: -10, max: 10 })
  recession!: number;

  @Prop({ required: true, default: false })
  bleeding!: boolean;

  @Prop({ required: true, min: 0, max: 3 })
  mobility!: number;
}

export const SiteSchema = SchemaFactory.createForClass(Site);

@Schema({ _id: false })
export class ToothPerioData {
  @Prop({ required: true })
  toothNumber!: number;

  @Prop({ type: [SiteSchema], required: true })
  sites!: Site[];
}

export const ToothPerioDataSchema = SchemaFactory.createForClass(ToothPerioData);

@Schema({ timestamps: true, collection: 'perio_charts' })
export class PerioChart {
  @Prop({ required: true })
  patientId!: string;

  @Prop({ required: true, index: true })
  tenantId!: string;

  @Prop({ required: true, index: true })
  organizationId!: string;

  @Prop({ required: true, index: true })
  clinicId!: string;

  @Prop({ required: true })
  recordedDate!: Date;

  @Prop({ type: Map, of: ToothPerioDataSchema })
  teeth!: Map<number, ToothPerioData>;

  @Prop({ required: true })
  recordedBy!: string;
}

export type PerioChartDocument = PerioChart & Document;
export const PerioChartSchema = SchemaFactory.createForClass(PerioChart);

PerioChartSchema.index({ patientId: 1, tenantId: 1, recordedDate: -1 });
