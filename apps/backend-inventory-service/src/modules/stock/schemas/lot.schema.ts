import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum LotStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  QUARANTINED = 'QUARANTINED',
  EXPIRED = 'EXPIRED',
  DAMAGED = 'DAMAGED',
  RECALLED = 'RECALLED',
  DEPLETED = 'DEPLETED',
}

/**
 * Lot entity represents a batch of products received together
 * Critical for FEFO (First Expired, First Out) logic and traceability
 */
@Schema({ timestamps: true, collection: 'lots' })
export class Lot extends Document {
  @Prop({ required: true, index: true })
  lotNumber!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Product', index: true })
  productId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Supplier' })
  supplierId!: Types.ObjectId;

  @Prop()
  supplierLotNumber!: string; // Supplier's lot/batch number

  @Prop({ required: true })
  manufacturedDate!: Date;

  @Prop({ index: true }) // Critical index for FEFO queries
  expirationDate!: Date;

  @Prop({ required: true })
  receivedDate!: Date;

  @Prop({ type: Number, required: true, default: 0 })
  initialQuantity!: number; // Quantity when lot was created

  @Prop({ type: Number, required: true, default: 0 })
  currentQuantity!: number; // Current quantity across all locations

  @Prop({ default: LotStatus.AVAILABLE, enum: LotStatus, index: true })
  status!: LotStatus;

  @Prop({ type: Number, default: 0 })
  costPerUnit!: number;

  // Quality control
  @Prop()
  certificateOfAnalysis!: string; // URL to COA document

  @Prop()
  qualityControlNotes!: string;

  @Prop()
  quarantineReason!: string;

  @Prop()
  quarantinedAt!: Date;

  @Prop()
  quarantinedBy!: string;

  // Sterilization tracking (for instruments)
  @Prop({ default: false })
  requiresSterilization!: boolean;

  @Prop()
  lastSterilizationDate!: Date;

  @Prop()
  sterilizationCycleId!: string;

  // Multi-tenant isolation
  @Prop({ required: true, index: true })
  tenantId!: string;

  @Prop({ required: true, index: true })
  organizationId!: string;

  @Prop({ index: true })
  clinicId!: string;

  @Prop({ required: true })
  createdBy!: string;

  @Prop()
  updatedBy!: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const LotSchema = SchemaFactory.createForClass(Lot);

// Critical indexes for FEFO and performance
LotSchema.index({ lotNumber: 1, productId: 1, tenantId: 1 }, { unique: true });
LotSchema.index({ productId: 1, expirationDate: 1, status: 1 }); // FEFO query
LotSchema.index({ productId: 1, receivedDate: 1, status: 1 }); // FIFO query
LotSchema.index({ expirationDate: 1, status: 1 }); // Expiration monitoring
LotSchema.index({ status: 1, tenantId: 1 });
