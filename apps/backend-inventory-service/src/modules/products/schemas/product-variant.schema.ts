import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * ProductVariant entity for products with variations (e.g., different sizes, colors)
 * Each variant tracks its own inventory levels
 */
@Schema({ timestamps: true, collection: 'product_variants' })
export class ProductVariant extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Product', index: true })
  productId!: Types.ObjectId;

  @Prop({ required: true })
  sku!: string; // Variant-specific SKU

  @Prop({ required: true })
  name!: string;

  @Prop({ type: Object })
  attributes!: Record<string, any>; // e.g., { size: 'Large', color: 'Blue' }

  @Prop({ type: Number, default: 0 })
  costPrice!: number;

  @Prop({ type: Number, default: 0 })
  sellPrice!: number;

  @Prop()
  barcode!: string;

  @Prop()
  images!: string[];

  @Prop({ default: true })
  isActive!: boolean;

  // Multi-tenant isolation
  @Prop({ required: true, index: true })
  tenantId!: string;

  @Prop({ required: true, index: true })
  organizationId!: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);

ProductVariantSchema.index({ sku: 1, tenantId: 1 }, { unique: true });
ProductVariantSchema.index({ productId: 1, tenantId: 1 });
