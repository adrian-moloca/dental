import { DeviceAuth } from '../../src/auth/device-auth';

describe('DeviceAuth Integration', () => {
  let deviceAuth: DeviceAuth;

  beforeEach(() => {
    deviceAuth = new DeviceAuth();
  });

  test('should map platform correctly', () => {
    const mapPlatform = (deviceAuth as any).mapPlatform.bind(deviceAuth);

    expect(mapPlatform('win32')).toBe('WINDOWS');
    expect(mapPlatform('Windows')).toBe('WINDOWS');
    expect(mapPlatform('darwin')).toBe('MACOS');
    expect(mapPlatform('MacOS')).toBe('MACOS');
    expect(mapPlatform('linux')).toBe('LINUX');
    expect(mapPlatform('Linux')).toBe('LINUX');
    expect(mapPlatform('unknown')).toBe('LINUX');
  });

  test('should collect device metadata', async () => {
    const metadata = await (deviceAuth as any).collectDeviceMetadata();

    expect(metadata).toHaveProperty('platform');
    expect(metadata).toHaveProperty('osVersion');
    expect(metadata).toHaveProperty('appVersion');
    expect(metadata).toHaveProperty('hardwareHash');
    expect(metadata).toHaveProperty('cpuArch');
    expect(metadata).toHaveProperty('totalMemoryMb');

    expect(['WINDOWS', 'MACOS', 'LINUX']).toContain(metadata.platform);
    expect(typeof metadata.hardwareHash).toBe('string');
    expect(metadata.totalMemoryMb).toBeGreaterThan(0);
  });
});
