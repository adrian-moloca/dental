import * as keytar from 'keytar';
import Store from 'electron-store';
import { DeviceCredentials } from './device-auth';

const store = new Store();

const SERVICE_NAME = 'DentalOS-Desktop';
const TOKEN_KEY = 'device-access-token';
const REFRESH_KEY = 'device-refresh-token';
const ENCRYPTION_KEY = 'encryption-key';

export async function storeDeviceCredentials(credentials: DeviceCredentials): Promise<void> {
  await keytar.setPassword(SERVICE_NAME, TOKEN_KEY, credentials.deviceAccessToken);

  if (credentials.refreshToken) {
    await keytar.setPassword(SERVICE_NAME, REFRESH_KEY, credentials.refreshToken);
  }

  await keytar.setPassword(SERVICE_NAME, ENCRYPTION_KEY, credentials.encryptionKey);

  store.set('device', {
    deviceId: credentials.deviceId,
    deviceName: credentials.deviceName,
    tenantId: credentials.tenantId,
    organizationId: credentials.organizationId,
    clinicId: credentials.clinicId,
    userId: credentials.userId
  });
}
