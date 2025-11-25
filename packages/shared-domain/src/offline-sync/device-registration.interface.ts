export enum DeviceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REVOKED = 'REVOKED',
}

export enum DevicePlatform {
  WINDOWS = 'WINDOWS',
  MACOS = 'MACOS',
  LINUX = 'LINUX',
}

export interface DeviceMetadata {
  platform: DevicePlatform;
  osVersion: string;
  appVersion: string;
  hardwareHash: string;
  cpuArch: string;
  totalMemoryMb: number;
}

export interface DeviceRegistration {
  deviceId: string;
  deviceName: string;
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  userId: string;
  metadata: DeviceMetadata;
  status: DeviceStatus;
  deviceAccessToken?: string;
  lastSeenAt?: Date;
  registeredAt: Date;
  revokedAt?: Date;
}

export interface DeviceLoginRequest {
  deviceId: string;
  deviceName: string;
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  userId: string;
  metadata: DeviceMetadata;
}

export interface DeviceLoginResponse {
  deviceAccessToken: string;
  expiresIn: string;
  deviceId: string;
}
