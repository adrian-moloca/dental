import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum LocationType {
  WAREHOUSE = 'WAREHOUSE',
  CLINIC = 'CLINIC',
  ROOM = 'ROOM',
  CABINET = 'CABINET',
  REFRIGERATOR = 'REFRIGERATOR',
  STERILIZATION_AREA = 'STERILIZATION_AREA',
  QUARANTINE = 'QUARANTINE',
  DISPOSAL = 'DISPOSAL',
}

/**
 * StockLocation represents physical or logical locations where inventory is stored
 * Supports hierarchical location structure (e.g., Warehouse > Clinic > Room > Cabinet)
 */
@Schema({ timestamps: true, collection: 'stock_locations' })
export class StockLocation extends Document {
  @Prop({ required: true })
  code!: string; // Unique location code (e.g., 'WH-001', 'CLINIC-NYC-ROOM-3')

  @Prop({ required: true })
  name!: string;

  @Prop()
  description!: string;

  @Prop({ required: true, enum: LocationType })
  type!: LocationType;

  @Prop({ type: String, ref: 'StockLocation' })
  parentLocationId!: string; // For hierarchical locations

  @Prop()
  address!: string;

  @Prop()
  capacity!: number; // Maximum capacity in units

  @Prop({ default: false })
  isTemperatureControlled!: boolean;

  @Prop()
  temperatureMin!: number;

  @Prop()
  temperatureMax!: number;

  @Prop({ default: true })
  isActive!: boolean;

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

export const StockLocationSchema = SchemaFactory.createForClass(StockLocation);

StockLocationSchema.index({ code: 1, tenantId: 1 }, { unique: true });
StockLocationSchema.index({ type: 1, tenantId: 1 });
StockLocationSchema.index({ clinicId: 1 });
StockLocationSchema.index({ parentLocationId: 1 });
