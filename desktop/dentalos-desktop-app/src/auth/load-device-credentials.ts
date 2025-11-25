import * as keytar from 'keytar';
import Store from 'electron-store';
import { DeviceCredentials } from './device-auth';

const store = new Store();

const SERVICE_NAME = 'DentalOS-Desktop';
const TOKEN_KEY = 'device-access-token';
const REFRESH_KEY = 'device-refresh-token';
const ENCRYPTION_KEY = 'encryption-key';

export async function loadDeviceCredentials(): Promise<DeviceCredentials | null> {
  const deviceInfo = store.get('device') as any;

  if (!deviceInfo) {
    return null;
  }

  const deviceAccessToken = await keytar.getPassword(SERVICE_NAME, TOKEN_KEY);
  const refreshToken = await keytar.getPassword(SERVICE_NAME, REFRESH_KEY);
  const encryptionKey = await keytar.getPassword(SERVICE_NAME, ENCRYPTION_KEY);

  if (!deviceAccessToken || !encryptionKey) {
    return null;
  }

  return {
    deviceId: deviceInfo.deviceId,
    deviceName: deviceInfo.deviceName,
    tenantId: deviceInfo.tenantId,
    organizationId: deviceInfo.organizationId,
    clinicId: deviceInfo.clinicId,
    userId: deviceInfo.userId,
    deviceAccessToken,
    refreshToken: refreshToken || undefined,
    encryptionKey
  };
}
