import * as keytar from 'keytar';

const SERVICE_NAME = 'DentalOS-Desktop';

export interface DeviceContext {
  tenantId: string;
  organizationId: string;
  deviceId: string;
}

export interface DeviceSecrets {
  deviceAccessToken: string;
  deviceRefreshToken?: string;
  encryptionKey: string;
  lastLoginAt: Date;
}

function buildKey(context: DeviceContext, suffix: string): string {
  return `${context.tenantId}:${context.organizationId}:${context.deviceId}:${suffix}`;
}

export async function saveDeviceSecrets(
  context: DeviceContext,
  secrets: DeviceSecrets
): Promise<void> {
  const accessTokenKey = buildKey(context, 'access-token');
  const refreshTokenKey = buildKey(context, 'refresh-token');
  const encryptionKeyKey = buildKey(context, 'encryption-key');
  const lastLoginKey = buildKey(context, 'last-login');

  await keytar.setPassword(SERVICE_NAME, accessTokenKey, secrets.deviceAccessToken);

  if (secrets.deviceRefreshToken) {
    await keytar.setPassword(SERVICE_NAME, refreshTokenKey, secrets.deviceRefreshToken);
  }

  await keytar.setPassword(SERVICE_NAME, encryptionKeyKey, secrets.encryptionKey);
  await keytar.setPassword(SERVICE_NAME, lastLoginKey, secrets.lastLoginAt.toISOString());
}

export async function loadDeviceSecrets(
  context: DeviceContext
): Promise<DeviceSecrets | null> {
  const accessTokenKey = buildKey(context, 'access-token');
  const refreshTokenKey = buildKey(context, 'refresh-token');
  const encryptionKeyKey = buildKey(context, 'encryption-key');
  const lastLoginKey = buildKey(context, 'last-login');

  const accessToken = await keytar.getPassword(SERVICE_NAME, accessTokenKey);
  const encryptionKey = await keytar.getPassword(SERVICE_NAME, encryptionKeyKey);
  const lastLoginStr = await keytar.getPassword(SERVICE_NAME, lastLoginKey);

  if (!accessToken || !encryptionKey || !lastLoginStr) {
    return null;
  }

  const refreshToken = await keytar.getPassword(SERVICE_NAME, refreshTokenKey);

  return {
    deviceAccessToken: accessToken,
    deviceRefreshToken: refreshToken || undefined,
    encryptionKey,
    lastLoginAt: new Date(lastLoginStr)
  };
}

export async function clearDeviceSecrets(context: DeviceContext): Promise<void> {
  const accessTokenKey = buildKey(context, 'access-token');
  const refreshTokenKey = buildKey(context, 'refresh-token');
  const encryptionKeyKey = buildKey(context, 'encryption-key');
  const lastLoginKey = buildKey(context, 'last-login');

  await keytar.deletePassword(SERVICE_NAME, accessTokenKey);
  await keytar.deletePassword(SERVICE_NAME, refreshTokenKey);
  await keytar.deletePassword(SERVICE_NAME, encryptionKeyKey);
  await keytar.deletePassword(SERVICE_NAME, lastLoginKey);
}

export async function saveLocalPin(context: DeviceContext, pinHash: string): Promise<void> {
  const pinKey = buildKey(context, 'local-pin');
  await keytar.setPassword(SERVICE_NAME, pinKey, pinHash);
}

export async function loadLocalPin(context: DeviceContext): Promise<string | null> {
  const pinKey = buildKey(context, 'local-pin');
  return keytar.getPassword(SERVICE_NAME, pinKey);
}

export async function clearLocalPin(context: DeviceContext): Promise<void> {
  const pinKey = buildKey(context, 'local-pin');
  await keytar.deletePassword(SERVICE_NAME, pinKey);
}
