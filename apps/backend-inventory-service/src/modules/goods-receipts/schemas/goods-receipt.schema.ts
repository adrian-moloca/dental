import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ReceiptStatus {
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * GoodsReceiptLine represents individual line items in a goods receipt
 */
export class GoodsReceiptLine {
  @Prop({ required: true })
  lineNumber!: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Product' })
  productId!: Types.ObjectId;

  @Prop()
  productSku!: string;

  @Prop()
  productName!: string;

  @Prop({ type: Types.ObjectId, ref: 'ProductVariant' })
  variantId!: Types.ObjectId;

  @Prop()
  purchaseOrderLineNumber!: number; // Reference to PO line

  @Prop({ required: true, type: Number })
  receivedQuantity!: number;

  @Prop()
  unitOfMeasure!: string;

  @Prop({ required: true, type: Number })
  unitCost!: number;

  @Prop({ required: true, type: Number })
  lineTotal!: number;

  // Lot and expiration tracking
  @Prop({ required: true })
  lotNumber!: string;

  @Prop()
  supplierLotNumber!: string;

  @Prop()
  expirationDate!: Date;

  @Prop()
  manufacturedDate!: Date;

  @Prop()
  serialNumber!: string; // For serialized items

  // Quality control
  @Prop({ default: true })
  qualityAccepted!: boolean;

  @Prop()
  qualityNotes!: string;

  @Prop()
  damageReported!: boolean;

  @Prop()
  damageDescription!: string;

  // Location where stock was placed
  @Prop({ type: Types.ObjectId, ref: 'StockLocation' })
  locationId!: Types.ObjectId;

  @Prop()
  notes!: string;
}

/**
 * GoodsReceipt entity represents the physical receipt of inventory
 * Links to PurchaseOrder and creates stock entries and movements
 * Automatically updates stock levels upon completion
 */
@Schema({ timestamps: true, collection: 'goods_receipts' })
export class GoodsReceipt extends Document {
  @Prop({ required: true, unique: true, index: true })
  receiptNumber!: string; // e.g., 'GR-2024-0001' or 'NIR-2024-0001'

  @Prop({ type: Types.ObjectId, ref: 'PurchaseOrder', index: true })
  purchaseOrderId!: Types.ObjectId;

  @Prop()
  purchaseOrderNumber!: string; // Denormalized

  @Prop({ type: Types.ObjectId, ref: 'Supplier', index: true })
  supplierId!: Types.ObjectId;

  @Prop()
  supplierName!: string; // Denormalized

  @Prop({ required: true, default: ReceiptStatus.DRAFT, enum: ReceiptStatus })
  status!: ReceiptStatus;

  @Prop({ required: true })
  receivedDate!: Date;

  @Prop({ required: true })
  receivedBy!: string; // User ID

  @Prop()
  receivedByName!: string; // Denormalized

  @Prop({ type: [GoodsReceiptLine], required: true })
  lines!: GoodsReceiptLine[];

  // Delivery information
  @Prop()
  deliveryNote!: string; // Supplier's delivery note number

  @Prop()
  carrierName!: string;

  @Prop()
  trackingNumber!: string;

  @Prop()
  packagesReceived!: number;

  @Prop()
  notes!: string;

  // Quality control
  @Prop({ default: true })
  inspectionCompleted!: boolean;

  @Prop()
  inspectedBy!: string;

  @Prop()
  inspectionNotes!: string;

  // Attachments
  @Prop({ type: [String] })
  attachments!: string[]; // URLs to photos, documents

  // Financial
  @Prop({ type: Number, default: 0 })
  totalValue!: number;

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

export const GoodsReceiptSchema = SchemaFactory.createForClass(GoodsReceipt);

GoodsReceiptSchema.index({ receiptNumber: 1, tenantId: 1 }, { unique: true });
GoodsReceiptSchema.index({ purchaseOrderId: 1 });
GoodsReceiptSchema.index({ supplierId: 1, receivedDate: -1 });
GoodsReceiptSchema.index({ status: 1, tenantId: 1 });
GoodsReceiptSchema.index({ receivedDate: -1 });
GoodsReceiptSchema.index({ clinicId: 1, receivedDate: -1 });
