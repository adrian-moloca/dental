import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'consents' })
export class Consent {
  @Prop({ required: true }) patientId!: string;
  @Prop({ required: true, index: true }) tenantId!: string;
  @Prop({ required: true }) organizationId!: string;
  @Prop({ required: true }) clinicId!: string;
  @Prop({
    required: true,
    enum: ['TREATMENT', 'ANESTHESIA', 'PHOTOGRAPHY', 'DATA_SHARING', 'CUSTOM'],
  })
  consentType!: string;
  @Prop({ required: true }) title!: string;
  @Prop({ required: true }) content!: string;
  @Prop() signedBy?: string;
  @Prop() signatureData?: string;
  @Prop() signedAt?: Date;
  @Prop() witnessedBy?: string;
  @Prop() witnessedAt?: Date;
  @Prop() expiresAt?: Date;
  @Prop({ required: true, enum: ['PENDING', 'SIGNED', 'DECLINED', 'EXPIRED'], default: 'PENDING' })
  status!: string;
  @Prop({ required: true }) createdBy!: string;
}

export type ConsentDocument = Consent & Document;
export const ConsentSchema = SchemaFactory.createForClass(Consent);
ConsentSchema.index({ patientId: 1, tenantId: 1, status: 1 });
