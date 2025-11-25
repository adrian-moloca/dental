import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ChangeOperation } from '@dentalos/shared-domain';

@Schema({ timestamps: true, collection: 'changelogs' })
export class ChangeLogDoc {
  @Prop({ type: String, required: true, unique: true, index: true })
  changeId!: string;

  @Prop({ type: Number, required: true, unique: true, index: true })
  sequenceNumber!: number;

  @Prop({ type: String, required: true, index: true })
  tenantId!: string;

  @Prop({ type: String, required: true, index: true })
  organizationId!: string;

  @Prop({ type: String, index: true })
  clinicId?: string;

  @Prop({ type: String, required: true, index: true })
  entityType!: string;

  @Prop({ type: String, required: true, index: true })
  entityId!: string;

  @Prop({ type: String, enum: ChangeOperation, required: true })
  operation!: ChangeOperation;

  @Prop({ type: Object, required: true })
  data!: Record<string, any>;

  @Prop({ type: Object })
  previousData?: Record<string, any>;

  @Prop({ type: Date, required: true, index: true })
  timestamp!: Date;

  @Prop({ type: String })
  sourceDeviceId?: string;

  @Prop({ type: String })
  eventId?: string;

  @Prop({ type: String })
  eventType?: string;
}

export type ChangeLogDocument = ChangeLogDoc & Document;

export const ChangeLogSchema = SchemaFactory.createForClass(ChangeLogDoc);

// Compound indexes for efficient incremental sync queries
ChangeLogSchema.index({ tenantId: 1, sequenceNumber: 1 });
ChangeLogSchema.index({ tenantId: 1, organizationId: 1, sequenceNumber: 1 });
ChangeLogSchema.index({ tenantId: 1, organizationId: 1, clinicId: 1, sequenceNumber: 1 });
ChangeLogSchema.index({ tenantId: 1, entityType: 1, entityId: 1, sequenceNumber: -1 });
ChangeLogSchema.index({ timestamp: 1 });
