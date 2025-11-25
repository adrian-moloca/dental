import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class SOAPNote {
  @Prop() subjective!: string;
  @Prop() objective!: string;
  @Prop() assessment!: string;
  @Prop() plan!: string;
}

@Schema({ timestamps: true, collection: 'clinical_notes' })
export class ClinicalNote {
  @Prop({ required: true }) patientId!: string;
  @Prop({ required: true, index: true }) tenantId!: string;
  @Prop({ required: true }) organizationId!: string;
  @Prop({ required: true }) clinicId!: string;
  @Prop() appointmentId?: string;
  @Prop({ required: true, enum: ['SOAP', 'PROGRESS', 'CONSULT', 'EMERGENCY'] }) noteType!: string;
  @Prop({ type: SOAPNote }) soap?: SOAPNote;
  @Prop({ required: true }) content!: string;
  @Prop() chiefComplaint?: string;
  @Prop({ type: [String] }) diagnosis?: string[];
  @Prop({ required: true }) createdBy!: string;
}

export type ClinicalNoteDocument = ClinicalNote & Document;
export const ClinicalNoteSchema = SchemaFactory.createForClass(ClinicalNote);
ClinicalNoteSchema.index({ patientId: 1, tenantId: 1, createdAt: -1 });
