import axios from 'axios';
import { machineId } from 'node-machine-id';
import * as si from 'systeminformation';
import { storeDeviceCredentials } from './store-device-credentials';
import { loadDeviceCredentials } from './load-device-credentials';
import { EncryptionService } from '../sync/encryption';

export interface DeviceCredentials {
  deviceId: string;
  deviceName: string;
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  userId: string;
  deviceAccessToken: string;
  refreshToken?: string;
  encryptionKey: string;
}

export interface DeviceRegistrationParams {
  deviceName: string;
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  userId: string;
}

export class DeviceAuth {
  private syncServiceUrl: string;
  private authServiceUrl: string;

  constructor() {
    this.syncServiceUrl = process.env.SYNC_API_URL || 'http://localhost:3019';
    this.authServiceUrl = process.env.AUTH_API_URL || 'http://localhost:3301';
  }

  async initialize(): Promise<void> {
    const existing = await loadDeviceCredentials();

    if (existing) {
      await this.refreshToken(existing);
    }
  }

  async register(params: DeviceRegistrationParams): Promise<DeviceCredentials> {
    const metadata = await this.collectDeviceMetadata();

    const registrationPayload = {
      deviceName: params.deviceName,
      tenantId: params.tenantId,
      organizationId: params.organizationId,
      clinicId: params.clinicId,
      userId: params.userId,
      metadata
    };

    const registerResponse = await axios.post(
      `${this.syncServiceUrl}/api/v1/devices/register`,
      registrationPayload,
      {
        headers: {
          'x-tenant-id': params.tenantId,
          'x-organization-id': params.organizationId,
          'x-clinic-id': params.clinicId || ''
        }
      }
    );

    const { deviceId, deviceAccessToken } = registerResponse.data;

    const loginResponse = await axios.post(
      `${this.authServiceUrl}/api/v1/auth/device/login`,
      {
        deviceId,
        deviceAccessToken,
        organizationId: params.organizationId,
        tenantId: params.tenantId,
        clinicId: params.clinicId
      }
    );

    const { accessToken, refreshToken } = loginResponse.data;

    const encryption = new EncryptionService('temp-key');
    const encryptionKey = encryption.generateKey();

    const credentials: DeviceCredentials = {
      deviceId,
      deviceName: params.deviceName,
      tenantId: params.tenantId,
      organizationId: params.organizationId,
      clinicId: params.clinicId,
      userId: params.userId,
      deviceAccessToken: accessToken,
      refreshToken,
      encryptionKey
    };

    await storeDeviceCredentials(credentials);

    return credentials;
  }

  private async refreshToken(credentials: DeviceCredentials): Promise<void> {
    if (!credentials.refreshToken) {
      return;
    }

    try {
      const response = await axios.post(
        `${this.authServiceUrl}/api/v1/auth/refresh`,
        {
          refreshToken: credentials.refreshToken,
          organizationId: credentials.organizationId
        }
      );

      const { accessToken, refreshToken } = response.data;

      const updated: DeviceCredentials = {
        ...credentials,
        deviceAccessToken: accessToken,
        refreshToken
      };

      await storeDeviceCredentials(updated);
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  }

  private async collectDeviceMetadata(): Promise<any> {
    const hwHash = await machineId();
    const osInfo = await si.osInfo();
    const cpu = await si.cpu();
    const mem = await si.mem();

    return {
      platform: this.mapPlatform(osInfo.platform),
      osVersion: osInfo.release,
      appVersion: process.env.APP_VERSION || '1.0.0',
      hardwareHash: hwHash,
      cpuArch: cpu.manufacturer + ' ' + cpu.brand,
      totalMemoryMb: Math.round(mem.total / 1024 / 1024)
    };
  }

  private mapPlatform(platform: string): string {
    if (platform === 'win32' || platform === 'Windows') return 'WINDOWS';
    if (platform === 'darwin' || platform === 'MacOS') return 'MACOS';
    if (platform === 'linux' || platform === 'Linux') return 'LINUX';
    return 'LINUX';
  }

  async isRegistered(): Promise<boolean> {
    const credentials = await loadDeviceCredentials();
    return !!credentials;
  }

  async getDeviceInfo(): Promise<any> {
    const credentials = await loadDeviceCredentials();
    if (!credentials) {
      return null;
    }

    return {
      deviceId: credentials.deviceId,
      deviceName: credentials.deviceName,
      tenantId: credentials.tenantId,
      organizationId: credentials.organizationId,
      clinicId: credentials.clinicId
    };
  }

  async clearDevice(): Promise<void> {
    const credentials = await loadDeviceCredentials();
    if (!credentials) {
      return;
    }

    const keytar = await import('keytar');
    const Store = (await import('electron-store')).default;
    const store = new Store();

    await keytar.deletePassword('DentalOS-Desktop', 'device-access-token');
    await keytar.deletePassword('DentalOS-Desktop', 'device-refresh-token');
    await keytar.deletePassword('DentalOS-Desktop', 'encryption-key');

    store.delete('device');
  }
}
