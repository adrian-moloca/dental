import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum MovementType {
  IN = 'IN', // Stock received (goods receipt)
  OUT = 'OUT', // Stock consumed or sold
  TRANSFER = 'TRANSFER', // Stock moved between locations
  ADJUSTMENT = 'ADJUSTMENT', // Manual inventory adjustment (count correction)
  DEDUCTION = 'DEDUCTION', // Stock consumed by procedure
  RETURN = 'RETURN', // Stock returned to supplier
  QUARANTINE = 'QUARANTINE', // Stock moved to quarantine
  RELEASE = 'RELEASE', // Stock released from quarantine
  DISPOSAL = 'DISPOSAL', // Stock disposed/destroyed
  RESERVATION = 'RESERVATION', // Stock reserved for future use
  RESERVATION_RELEASE = 'RESERVATION_RELEASE', // Reserved stock released
}

/**
 * StockMovement provides complete audit trail for all inventory changes
 * Implements double-entry accounting: every movement has source and destination
 * Immutable once created - append-only log
 */
@Schema({ timestamps: true, collection: 'stock_movements' })
export class StockMovement extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Product', index: true })
  productId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ProductVariant' })
  variantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lot', index: true })
  lotId!: Types.ObjectId;

  @Prop()
  lotNumber!: string;

  @Prop()
  serialNumber!: string;

  @Prop({ required: true, enum: MovementType, index: true })
  movementType!: MovementType;

  @Prop({ type: Number, required: true })
  quantity!: number;

  @Prop()
  unitOfMeasure!: string;

  // Double-entry: source and destination
  @Prop({ type: Types.ObjectId, ref: 'StockLocation' })
  fromLocationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'StockLocation' })
  toLocationId!: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  costPerUnit!: number;

  @Prop({ type: Number, default: 0 })
  totalCost!: number; // quantity * costPerUnit

  @Prop()
  expirationDate!: Date;

  // Reference to triggering event/document
  @Prop()
  referenceType!: string; // 'PROCEDURE', 'PURCHASE_ORDER', 'GOODS_RECEIPT', 'ADJUSTMENT'

  @Prop()
  referenceId!: string; // ID of the reference document

  @Prop({ required: true })
  reason!: string; // Human-readable reason for movement

  @Prop()
  notes!: string;

  // Audit fields
  @Prop({ required: true, index: true })
  performedBy!: string; // User ID who performed the movement

  @Prop()
  performedByName!: string; // Denormalized for reporting

  @Prop({ required: true, index: true })
  performedAt!: Date;

  // Multi-tenant isolation
  @Prop({ required: true, index: true })
  tenantId!: string;

  @Prop({ required: true, index: true })
  organizationId!: string;

  @Prop({ required: true, index: true })
  clinicId!: string;

  // Correlation ID for tracking related movements
  @Prop({ index: true })
  correlationId!: string; // Groups related movements (e.g., multi-item procedure)

  createdAt?: Date;
  updatedAt?: Date;
}

export const StockMovementSchema = SchemaFactory.createForClass(StockMovement);

// Critical indexes for audit queries and reporting
StockMovementSchema.index({ productId: 1, performedAt: -1 });
StockMovementSchema.index({ lotId: 1, performedAt: -1 });
StockMovementSchema.index({ fromLocationId: 1, performedAt: -1 });
StockMovementSchema.index({ toLocationId: 1, performedAt: -1 });
StockMovementSchema.index({ movementType: 1, performedAt: -1 });
StockMovementSchema.index({ referenceType: 1, referenceId: 1 });
StockMovementSchema.index({ correlationId: 1 });
StockMovementSchema.index({ tenantId: 1, clinicId: 1, performedAt: -1 });
StockMovementSchema.index({ performedBy: 1, performedAt: -1 });
