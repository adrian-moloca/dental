import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { InstrumentStatus, InstrumentType } from '@dentalos/shared-domain';

@Schema({ collection: 'instruments', timestamps: true })
export class Instrument extends Document {
  @Prop({ type: String, required: true })
  name!: string;

  @Prop({
    type: String,
    enum: Object.values(InstrumentType),
    required: true,
  })
  type!: InstrumentType;

  @Prop({
    type: String,
    enum: Object.values(InstrumentStatus),
    required: true,
    default: InstrumentStatus.ACTIVE,
  })
  status!: InstrumentStatus;

  @Prop({ type: String, unique: true, sparse: true })
  serialNumber?: string;

  @Prop({ type: String })
  manufacturer?: string;

  @Prop({ type: String })
  modelNumber?: string;

  @Prop({ type: String })
  barcode?: string;

  @Prop({ type: Types.ObjectId, ref: 'Product' })
  inventoryItemId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lot' })
  inventoryLotId?: Types.ObjectId;

  @Prop({ type: Date })
  purchaseDate?: Date;

  @Prop({ type: Number })
  purchaseCost?: number;

  @Prop({ type: Number, default: 0 })
  cyclesCompleted!: number;

  @Prop({ type: Number })
  maxCycles?: number;

  @Prop({ type: Date })
  lastSterilizedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'SterilizationCycle' })
  lastSterilizationCycleId?: Types.ObjectId;

  @Prop({ type: Date })
  retiredAt?: Date;

  @Prop({ type: String })
  retiredReason?: string;

  @Prop({ type: String })
  maintenanceNotes?: string;

  // Multi-tenancy
  @Prop({ type: String, required: true, index: true })
  tenantId!: string;

  @Prop({ type: String, required: true, index: true })
  organizationId!: string;

  @Prop({ type: String, required: true, index: true })
  clinicId!: string;

  // Audit fields
  @Prop({ type: String, required: true })
  createdBy!: string;

  @Prop({ type: String })
  updatedBy?: string;
}

export const InstrumentSchema = SchemaFactory.createForClass(Instrument);

// Indexes
InstrumentSchema.index({ tenantId: 1, organizationId: 1, clinicId: 1 });
InstrumentSchema.index({ status: 1 });
InstrumentSchema.index({ type: 1 });
InstrumentSchema.index({ serialNumber: 1 });
InstrumentSchema.index({ barcode: 1 });
InstrumentSchema.index({ lastSterilizedAt: -1 });
InstrumentSchema.index({ cyclesCompleted: 1 });
