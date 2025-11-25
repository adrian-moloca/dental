import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ProductType {
  CONSUMABLE = 'CONSUMABLE',
  INSTRUMENT = 'INSTRUMENT',
  MATERIAL = 'MATERIAL',
  MEDICATION = 'MEDICATION',
  EQUIPMENT = 'EQUIPMENT',
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCONTINUED = 'DISCONTINUED',
}

/**
 * Product entity represents catalog items in the inventory system
 * Supports multi-tenant isolation and comprehensive product attributes
 */
@Schema({ timestamps: true, collection: 'products' })
export class Product extends Document {
  @Prop({ required: true, unique: true, index: true })
  sku!: string;

  @Prop({ required: true })
  name!: string;

  @Prop()
  description!: string;

  @Prop({ required: true, enum: ProductType })
  type!: ProductType;

  @Prop({ default: ProductStatus.ACTIVE, enum: ProductStatus })
  status!: ProductStatus;

  @Prop({ required: true })
  category!: string;

  @Prop()
  subCategory!: string;

  @Prop({ required: true })
  unitOfMeasure!: string; // e.g., 'piece', 'box', 'ml', 'unit'

  @Prop({ type: Number, default: 0 })
  costPrice!: number;

  @Prop({ type: Number, default: 0 })
  sellPrice!: number;

  @Prop({ type: Number, default: 0 })
  reorderPoint!: number; // Minimum quantity before reorder alert

  @Prop({ type: Number, default: 0 })
  reorderQuantity!: number; // Quantity to order when below reorder point

  @Prop({ type: Number, default: 0 })
  safetyStockLevel!: number; // Safety stock buffer

  // Supplier information
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Supplier' }] })
  supplierIds!: Types.ObjectId[];

  @Prop()
  preferredSupplierId!: Types.ObjectId;

  // Product characteristics
  @Prop({ default: false })
  requiresLot!: boolean; // Requires lot number tracking

  @Prop({ default: false })
  requiresSerial!: boolean; // Requires serial number tracking

  @Prop({ default: false })
  requiresSterilization!: boolean; // Requires sterilization tracking

  @Prop({ default: false })
  hasExpiration!: boolean; // Has expiration date

  @Prop({ type: Number }) // Days before expiration to warn
  expirationWarningDays!: number;

  @Prop({ default: false })
  isTemperatureControlled!: boolean;

  @Prop()
  storageTemperatureMin!: number; // Celsius

  @Prop()
  storageTemperatureMax!: number; // Celsius

  // Variant support
  @Prop({ default: false })
  hasVariants!: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'ProductVariant' }] })
  variantIds!: Types.ObjectId[];

  // Metadata
  @Prop()
  manufacturer!: string;

  @Prop()
  manufacturerPartNumber!: string;

  @Prop()
  barcode!: string;

  @Prop()
  images!: string[]; // Array of image URLs

  @Prop()
  documents!: string[]; // Array of document URLs (SDS, certificates, etc.)

  @Prop({ type: Object })
  customAttributes!: Record<string, any>;

  // Multi-tenant isolation
  @Prop({ required: true, index: true })
  tenantId!: string;

  @Prop({ required: true, index: true })
  organizationId!: string;

  @Prop({ type: [String], index: true })
  clinicIds!: string[]; // Products can be available to multiple clinics

  // Audit fields
  @Prop({ required: true })
  createdBy!: string;

  @Prop()
  updatedBy!: string;

  @Prop({ default: true })
  isActive!: boolean;

  // Timestamps are auto-managed by timestamps: true
  createdAt?: Date;
  updatedAt?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Indexes for performance
ProductSchema.index({ sku: 1, tenantId: 1 }, { unique: true });
ProductSchema.index({ name: 'text', description: 'text' }); // Full-text search
ProductSchema.index({ type: 1, status: 1, tenantId: 1 });
ProductSchema.index({ category: 1, tenantId: 1 });
ProductSchema.index({ clinicIds: 1 });
ProductSchema.index({ supplierIds: 1 });
