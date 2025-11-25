import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
}

/**
 * PurchaseOrderLine represents individual line items in a purchase order
 */
export class PurchaseOrderLine {
  @Prop({ required: true })
  lineNumber!: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Product' })
  productId!: Types.ObjectId;

  @Prop()
  productSku!: string; // Denormalized

  @Prop()
  productName!: string; // Denormalized

  @Prop({ type: Types.ObjectId, ref: 'ProductVariant' })
  variantId!: Types.ObjectId;

  @Prop({ required: true, type: Number })
  orderedQuantity!: number;

  @Prop({ type: Number, default: 0 })
  receivedQuantity!: number;

  @Prop()
  unitOfMeasure!: string;

  @Prop({ required: true, type: Number })
  unitPrice!: number;

  @Prop({ type: Number, default: 0 })
  discount!: number; // Percentage

  @Prop({ type: Number, default: 0 })
  tax!: number; // Percentage

  @Prop({ required: true, type: Number })
  lineTotal!: number; // (unitPrice * orderedQuantity) - discount + tax

  @Prop()
  expectedDeliveryDate!: Date;

  @Prop()
  notes!: string;
}

/**
 * PurchaseOrder entity represents procurement orders from suppliers
 * Supports approval workflows and three-way matching (PO ↔ GRN ↔ Invoice)
 */
@Schema({ timestamps: true, collection: 'purchase_orders' })
export class PurchaseOrder extends Document {
  @Prop({ required: true, unique: true, index: true })
  orderNumber!: string; // e.g., 'PO-2024-0001'

  @Prop({ required: true, type: Types.ObjectId, ref: 'Supplier', index: true })
  supplierId!: Types.ObjectId;

  @Prop()
  supplierName!: string; // Denormalized

  @Prop({
    required: true,
    default: PurchaseOrderStatus.DRAFT,
    enum: PurchaseOrderStatus,
    index: true,
  })
  status!: PurchaseOrderStatus;

  @Prop({ default: PaymentStatus.UNPAID, enum: PaymentStatus })
  paymentStatus!: PaymentStatus;

  @Prop({ required: true })
  orderDate!: Date;

  @Prop()
  expectedDeliveryDate!: Date;

  @Prop()
  actualDeliveryDate!: Date;

  @Prop({ type: [PurchaseOrderLine], required: true })
  lines!: PurchaseOrderLine[];

  // Financial summary
  @Prop({ type: Number, required: true, default: 0 })
  subtotal!: number;

  @Prop({ type: Number, default: 0 })
  discountAmount!: number;

  @Prop({ type: Number, default: 0 })
  taxAmount!: number;

  @Prop({ type: Number, default: 0 })
  shippingCost!: number;

  @Prop({ type: Number, required: true, default: 0 })
  totalAmount!: number;

  @Prop({ type: Number, default: 0 })
  paidAmount!: number;

  // Delivery information
  @Prop({ type: Types.ObjectId, ref: 'StockLocation' })
  deliveryLocationId!: Types.ObjectId;

  @Prop()
  deliveryAddress!: string;

  @Prop()
  deliveryNotes!: string;

  // Approval workflow
  @Prop()
  requestedBy!: string;

  @Prop()
  approvedBy!: string;

  @Prop()
  approvedAt!: Date;

  @Prop()
  rejectedBy!: string;

  @Prop()
  rejectedAt!: Date;

  @Prop()
  rejectionReason!: string;

  // Payment terms
  @Prop()
  paymentTerms!: string; // e.g., 'Net 30'

  @Prop()
  paymentDueDate!: Date;

  @Prop()
  notes!: string;

  @Prop()
  internalNotes!: string; // Not shared with supplier

  // Attachments
  @Prop({ type: [String] })
  attachments!: string[]; // URLs to documents

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

export const PurchaseOrderSchema = SchemaFactory.createForClass(PurchaseOrder);

PurchaseOrderSchema.index({ orderNumber: 1, tenantId: 1 }, { unique: true });
PurchaseOrderSchema.index({ supplierId: 1, status: 1 });
PurchaseOrderSchema.index({ status: 1, tenantId: 1 });
PurchaseOrderSchema.index({ orderDate: -1 });
PurchaseOrderSchema.index({ createdBy: 1, orderDate: -1 });
PurchaseOrderSchema.index({ clinicId: 1, orderDate: -1 });
