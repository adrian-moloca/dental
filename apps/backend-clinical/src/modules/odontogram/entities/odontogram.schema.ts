/**
 * Odontogram Schema
 * Stores tooth chart data with Universal Numbering System (1-32)
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ToothStatus = 'present' | 'missing' | 'implant' | 'bridge' | 'crown' | 'filling';

export interface SurfaceData {
  conditions: string[]; // e.g., ['caries', 'fracture', 'wear']
  procedures: string[]; // e.g., ['amalgam_restoration', 'composite']
}

export interface ToothData {
  toothNumber: number; // 1-32 (Universal Numbering)
  status: ToothStatus;
  surfaces: {
    buccal?: SurfaceData;
    lingual?: SurfaceData;
    mesial?: SurfaceData;
    distal?: SurfaceData;
    occlusal?: SurfaceData;
  };
  notes?: string;
}

@Schema({ _id: false })
export class Surface {
  @Prop({ type: [String], default: [] })
  conditions!: string[];

  @Prop({ type: [String], default: [] })
  procedures!: string[];
}

export const SurfaceSchema = SchemaFactory.createForClass(Surface);

@Schema({ _id: false })
export class Tooth {
  @Prop({ required: true, min: 1, max: 32 })
  toothNumber!: number;

  @Prop({ required: true, enum: ['present', 'missing', 'implant', 'bridge', 'crown', 'filling'] })
  status!: ToothStatus;

  @Prop({ type: SurfaceSchema })
  buccal?: Surface;

  @Prop({ type: SurfaceSchema })
  lingual?: Surface;

  @Prop({ type: SurfaceSchema })
  mesial?: Surface;

  @Prop({ type: SurfaceSchema })
  distal?: Surface;

  @Prop({ type: SurfaceSchema })
  occlusal?: Surface;

  @Prop()
  notes?: string;
}

export const ToothSchema = SchemaFactory.createForClass(Tooth);

@Schema({ timestamps: true, collection: 'odontograms' })
export class Odontogram {
  @Prop({ required: true, type: String, index: true })
  patientId!: string;

  @Prop({ required: true, type: String, index: true })
  tenantId!: string;

  @Prop({ required: true, type: String, index: true })
  organizationId!: string;

  @Prop({ required: true, type: String, index: true })
  clinicId!: string;

  @Prop({ type: Map, of: ToothSchema, required: true })
  teeth!: Map<number, Tooth>;

  @Prop({ required: true, type: String })
  updatedBy!: string;

  @Prop({ type: Number, default: 1 })
  version!: number;
}

export type OdontogramDocument = Odontogram & Document;

export const OdontogramSchema = SchemaFactory.createForClass(Odontogram);

// Create compound index for tenant isolation
OdontogramSchema.index({ patientId: 1, tenantId: 1, organizationId: 1 }, { unique: true });

// Create index for efficient queries
OdontogramSchema.index({ updatedBy: 1, updatedAt: -1 });
