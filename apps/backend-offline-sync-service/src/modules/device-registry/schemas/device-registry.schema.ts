import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DeviceStatus, DevicePlatform, DeviceMetadata } from '@dentalos/shared-domain';

@Schema({ _id: false })
export class DeviceMetadataDoc implements DeviceMetadata {
  @Prop({ type: String, enum: DevicePlatform, required: true })
  platform!: DevicePlatform;

  @Prop({ type: String, required: true })
  osVersion!: string;

  @Prop({ type: String, required: true })
  appVersion!: string;

  @Prop({ type: String, required: true })
  hardwareHash!: string;

  @Prop({ type: String, required: true })
  cpuArch!: string;

  @Prop({ type: Number, required: true })
  totalMemoryMb!: number;
}

@Schema({ timestamps: true, collection: 'devices' })
export class DeviceRegistryDoc {
  @Prop({ type: String, required: true, unique: true, index: true })
  deviceId!: string;

  @Prop({ type: String, required: true })
  deviceName!: string;

  @Prop({ type: String, required: true, index: true })
  tenantId!: string;

  @Prop({ type: String, required: true, index: true })
  organizationId!: string;

  @Prop({ type: String, index: true })
  clinicId?: string;

  @Prop({ type: String, required: true, index: true })
  userId!: string;

  @Prop({ type: DeviceMetadataDoc, required: true })
  metadata!: DeviceMetadataDoc;

  @Prop({ type: String, enum: DeviceStatus, default: DeviceStatus.ACTIVE, index: true })
  status!: DeviceStatus;

  @Prop({ type: String })
  deviceAccessToken?: string;

  @Prop({ type: Date })
  lastSeenAt?: Date;

  @Prop({ type: Date })
  revokedAt?: Date;
}

export type DeviceRegistryDocument = DeviceRegistryDoc & Document;

export const DeviceRegistrySchema = SchemaFactory.createForClass(DeviceRegistryDoc);

DeviceRegistrySchema.index({ tenantId: 1, organizationId: 1, status: 1 });
DeviceRegistrySchema.index({ userId: 1, status: 1 });
