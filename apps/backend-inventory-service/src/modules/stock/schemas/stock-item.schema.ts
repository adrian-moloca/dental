import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum StockItemStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  EXPIRED = 'EXPIRED',
  DAMAGED = 'DAMAGED',
  QUARANTINED = 'QUARANTINED',
}

/**
 * StockItem represents the actual inventory at a specific location
 * Linked to a lot for traceability and FEFO logic
 * This is the aggregate root for stock operations
 */
@Schema({ timestamps: true, collection: 'stock_items' })
export class StockItem extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Product', index: true })
  productId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ProductVariant' })
  variantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'StockLocation', index: true })
  locationId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Lot', index: true })
  lotId!: Types.ObjectId;

  @Prop({ required: true })
  lotNumber!: string; // Denormalized for query performance

  @Prop() // For serialized items
  serialNumber!: string;

  @Prop({ type: Number, required: true, default: 0, min: 0 })
  quantity!: number;

  @Prop({ type: Number, default: 0, min: 0 })
  reservedQuantity!: number; // Quantity reserved for procedures

  // Computed and persisted for faster reporting; updated via pre-save hook
  @Prop({ type: Number, default: 0, min: 0 })
  availableQuantity!: number;

  @Prop({ index: true }) // For FEFO sorting
  expirationDate!: Date;

  @Prop()
  receivedDate!: Date;

  @Prop({ type: Number, default: 0 })
  costPerUnit!: number;

  @Prop({ default: StockItemStatus.AVAILABLE, enum: StockItemStatus, index: true })
  status!: StockItemStatus;

  // Multi-tenant isolation
  @Prop({ required: true, index: true })
  tenantId!: string;

  @Prop({ required: true, index: true })
  organizationId!: string;

  @Prop({ required: true, index: true })
  clinicId!: string;

  @Prop({ required: true })
  createdBy!: string;

  @Prop()
  updatedBy!: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const StockItemSchema = SchemaFactory.createForClass(StockItem);

// Critical indexes for stock operations and FEFO
StockItemSchema.index({ productId: 1, locationId: 1, tenantId: 1 });
StockItemSchema.index({ productId: 1, locationId: 1, expirationDate: 1, status: 1 }); // FEFO
StockItemSchema.index({ lotId: 1, locationId: 1 });
StockItemSchema.index({ serialNumber: 1, tenantId: 1 }, { unique: true, sparse: true });
StockItemSchema.index({ status: 1, tenantId: 1 });
StockItemSchema.index({ expirationDate: 1, status: 1 }); // Expiration alerts

// Pre-save hook to compute available quantity
StockItemSchema.pre('save', function (next) {
  if (this.isModified('quantity') || this.isModified('reservedQuantity')) {
    this.availableQuantity = Math.max(0, this.quantity - this.reservedQuantity);
  }
  next();
});
