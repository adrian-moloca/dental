import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum SupplierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLACKLISTED = 'BLACKLISTED',
}

export enum SupplierType {
  MANUFACTURER = 'MANUFACTURER',
  DISTRIBUTOR = 'DISTRIBUTOR',
  WHOLESALER = 'WHOLESALER',
  DIRECT = 'DIRECT',
}

/**
 * Supplier entity represents vendors and suppliers
 */
@Schema({ timestamps: true, collection: 'suppliers' })
export class Supplier extends Document {
  @Prop({ required: true, index: true })
  code!: string; // Unique supplier code

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, enum: SupplierType })
  type!: SupplierType;

  @Prop({ default: SupplierStatus.ACTIVE, enum: SupplierStatus })
  status!: SupplierStatus;

  // Contact information
  @Prop()
  contactPerson!: string;

  @Prop()
  email!: string;

  @Prop()
  phone!: string;

  @Prop()
  website!: string;

  // Address
  @Prop()
  addressLine1!: string;

  @Prop()
  addressLine2!: string;

  @Prop()
  city!: string;

  @Prop()
  state!: string;

  @Prop()
  postalCode!: string;

  @Prop()
  country!: string;

  // Financial information
  @Prop()
  taxId!: string;

  @Prop()
  paymentTerms!: string; // e.g., 'Net 30', 'Net 60'

  @Prop({ type: Number, default: 0 })
  creditLimit!: number;

  @Prop()
  bankAccount!: string;

  // Performance metrics
  @Prop({ type: Number, default: 0, min: 0, max: 5 })
  rating!: number;

  @Prop({ type: Number, default: 0 })
  leadTimeDays!: number; // Average delivery time

  @Prop({ type: Number, default: 0 })
  minimumOrderValue!: number;

  // Certifications and compliance
  @Prop({ type: [String] })
  certifications!: string[]; // e.g., ISO, FDA

  @Prop()
  certificationDocuments!: string[]; // URLs to documents

  @Prop()
  notes!: string;

  // Multi-tenant isolation
  @Prop({ required: true, index: true })
  tenantId!: string;

  @Prop({ required: true, index: true })
  organizationId!: string;

  @Prop({ required: true })
  createdBy!: string;

  @Prop()
  updatedBy!: string;

  @Prop({ default: true })
  isActive!: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);

SupplierSchema.index({ code: 1, tenantId: 1 }, { unique: true });
SupplierSchema.index({ name: 'text' });
SupplierSchema.index({ status: 1, tenantId: 1 });
