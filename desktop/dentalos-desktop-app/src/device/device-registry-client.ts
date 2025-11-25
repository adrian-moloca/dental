import axios from 'axios';
import { DeviceContext } from '../security/secure-storage';
import * as os from 'os';
import * as crypto from 'crypto';

export interface DeviceMetadata {
  platform: string;
  osVersion: string;
  appVersion: string;
  hardwareHash: string;
  deviceName: string;
}

export interface LinkDeviceParams {
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  userAccessToken: string;
  deviceName?: string;
}

export interface LinkDeviceResult {
  deviceId: string;
  deviceAccessToken: string;
  deviceRefreshToken?: string;
  context: DeviceContext;
}

export class DeviceRegistryClient {
  private syncServiceUrl: string;
  private authServiceUrl: string;

  constructor(syncServiceUrl: string, authServiceUrl: string) {
    this.syncServiceUrl = syncServiceUrl;
    this.authServiceUrl = authServiceUrl;
  }

  async linkDevice(params: LinkDeviceParams): Promise<LinkDeviceResult> {
    const metadata = this.collectDeviceMetadata(params.deviceName);

    // Step 1: Register device with offline-sync service
    const registerResponse = await axios.post(
      `${this.syncServiceUrl}/api/v1/devices/register`,
      {
        tenantId: params.tenantId,
        organizationId: params.organizationId,
        clinicId: params.clinicId,
        metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${params.userAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const {
      deviceId,
      deviceAccessToken: syncDeviceToken,
    } = registerResponse.data;

    // Step 2: Login with device token via backend-auth
    const loginResponse = await axios.post(
      `${this.authServiceUrl}/api/v1/auth/device/login`,
      {
        deviceId,
        deviceAccessToken: syncDeviceToken,
        tenantId: params.tenantId,
        organizationId: params.organizationId,
        clinicId: params.clinicId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const {
      deviceAccessToken,
      deviceRefreshToken,
    } = loginResponse.data;

    return {
      deviceId,
      deviceAccessToken,
      deviceRefreshToken,
      context: {
        tenantId: params.tenantId,
        organizationId: params.organizationId,
        deviceId,
      },
    };
  }

  async unlinkDevice(
    context: DeviceContext,
    deviceAccessToken: string
  ): Promise<void> {
    await axios.post(
      `${this.syncServiceUrl}/api/v1/devices/${context.deviceId}/revoke`,
      {},
      {
        headers: {
          Authorization: `Bearer ${deviceAccessToken}`,
          'x-tenant-id': context.tenantId,
          'x-organization-id': context.organizationId,
        },
      }
    );
  }

  async listDevices(
    tenantId: string,
    organizationId: string,
    userAccessToken: string
  ): Promise<any[]> {
    const response = await axios.get(
      `${this.syncServiceUrl}/api/v1/devices`,
      {
        params: {
          tenantId,
          organizationId,
        },
        headers: {
          Authorization: `Bearer ${userAccessToken}`,
        },
      }
    );

    return response.data.devices || [];
  }

  private collectDeviceMetadata(customDeviceName?: string): DeviceMetadata {
    const hostname = os.hostname();
    const platform = os.platform();
    const osVersion = os.release();
    const appVersion = process.env.npm_package_version || '1.0.0';

    // Generate hardware hash from stable identifiers
    const cpus = os.cpus();
    const cpuModel = cpus[0]?.model || 'unknown';
    const cpuCount = cpus.length;
    const totalMemory = os.totalmem();

    const hardwareString = `${platform}-${cpuModel}-${cpuCount}-${totalMemory}`;
    const hardwareHash = crypto
      .createHash('sha256')
      .update(hardwareString)
      .digest('hex')
      .substring(0, 16);

    return {
      platform,
      osVersion,
      appVersion,
      hardwareHash,
      deviceName: customDeviceName || hostname,
    };
  }

  collectDeviceMetadataPublic(customDeviceName?: string): DeviceMetadata {
    return this.collectDeviceMetadata(customDeviceName);
  }
}

let clientInstance: DeviceRegistryClient | null = null;

export function getDeviceRegistryClient(
  syncServiceUrl?: string,
  authServiceUrl?: string
): DeviceRegistryClient {
  if (!clientInstance) {
    const syncUrl = syncServiceUrl || process.env.SYNC_SERVICE_URL || 'http://localhost:3019';
    const authUrl = authServiceUrl || process.env.AUTH_SERVICE_URL || 'http://localhost:3301';
    clientInstance = new DeviceRegistryClient(syncUrl, authUrl);
  }
  return clientInstance;
}
