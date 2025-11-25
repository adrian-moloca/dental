import { DeviceMetadata } from '@dentalos/shared-domain';

export interface DeviceRegisteredEvent {
  eventType: 'offline-sync.device.registered';
  deviceId: string;
  deviceName: string;
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  userId: string;
  metadata: DeviceMetadata;
  registeredAt: string;
  timestamp: string;
  correlationId?: string;
}
