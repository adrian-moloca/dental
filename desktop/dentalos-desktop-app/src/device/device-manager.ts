/**
 * Device Manager - Provides device identification and metadata
 */

let cachedDeviceId: string | null = null;

/**
 * Gets a unique device identifier for this installation.
 * Uses a persisted UUID or generates a new one.
 */
export function getDeviceId(): string {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }

  // TODO: Implement persistent device ID storage
  // For now, generate a random UUID
  cachedDeviceId = `device-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  return cachedDeviceId;
}

/**
 * Gets device metadata (platform, arch, version, etc.)
 */
export function getDeviceMetadata() {
  return {
    deviceId: getDeviceId(),
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
  };
}
