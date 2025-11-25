import {
  saveDeviceSecrets,
  loadDeviceSecrets,
  clearDeviceSecrets,
  saveLocalPin,
  loadLocalPin,
  clearLocalPin,
  DeviceContext,
  DeviceSecrets
} from '../../src/security/secure-storage';

jest.mock('keytar', () => ({
  setPassword: jest.fn().mockResolvedValue(undefined),
  getPassword: jest.fn(),
  deletePassword: jest.fn().mockResolvedValue(true)
}));

const keytar = require('keytar');

describe('SecureStorage', () => {
  const mockContext: DeviceContext = {
    tenantId: 'tenant-123',
    organizationId: 'org-456',
    deviceId: 'device-789'
  };

  const mockSecrets: DeviceSecrets = {
    deviceAccessToken: 'access-token-abc',
    deviceRefreshToken: 'refresh-token-xyz',
    encryptionKey: 'encryption-key-123',
    lastLoginAt: new Date('2025-01-15T10:00:00Z')
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveDeviceSecrets', () => {
    it('should save all device secrets to keytar with scoped keys', async () => {
      await saveDeviceSecrets(mockContext, mockSecrets);

      expect(keytar.setPassword).toHaveBeenCalledWith(
        'DentalOS-Desktop',
        'tenant-123:org-456:device-789:access-token',
        'access-token-abc'
      );

      expect(keytar.setPassword).toHaveBeenCalledWith(
        'DentalOS-Desktop',
        'tenant-123:org-456:device-789:refresh-token',
        'refresh-token-xyz'
      );

      expect(keytar.setPassword).toHaveBeenCalledWith(
        'DentalOS-Desktop',
        'tenant-123:org-456:device-789:encryption-key',
        'encryption-key-123'
      );

      expect(keytar.setPassword).toHaveBeenCalledWith(
        'DentalOS-Desktop',
        'tenant-123:org-456:device-789:last-login',
        '2025-01-15T10:00:00.000Z'
      );
    });

    it('should not save refresh token if not provided', async () => {
      const secretsWithoutRefresh = { ...mockSecrets, deviceRefreshToken: undefined };
      await saveDeviceSecrets(mockContext, secretsWithoutRefresh);

      const calls = (keytar.setPassword as jest.Mock).mock.calls;
      const hasRefreshTokenCall = calls.some((call: any[]) => call[1].includes('refresh-token'));
      expect(hasRefreshTokenCall).toBe(false);
    });
  });

  describe('loadDeviceSecrets', () => {
    it('should load all device secrets from keytar', async () => {
      keytar.getPassword
        .mockResolvedValueOnce('access-token-abc')
        .mockResolvedValueOnce('encryption-key-123')
        .mockResolvedValueOnce('2025-01-15T10:00:00.000Z')
        .mockResolvedValueOnce('refresh-token-xyz');

      const result = await loadDeviceSecrets(mockContext);

      expect(result).toEqual({
        deviceAccessToken: 'access-token-abc',
        deviceRefreshToken: 'refresh-token-xyz',
        encryptionKey: 'encryption-key-123',
        lastLoginAt: new Date('2025-01-15T10:00:00.000Z')
      });
    });

    it('should return null if any required secret is missing', async () => {
      keytar.getPassword
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('encryption-key-123')
        .mockResolvedValueOnce('2025-01-15T10:00:00.000Z');

      const result = await loadDeviceSecrets(mockContext);
      expect(result).toBeNull();
    });
  });

  describe('clearDeviceSecrets', () => {
    it('should delete all device secrets from keytar', async () => {
      await clearDeviceSecrets(mockContext);

      expect(keytar.deletePassword).toHaveBeenCalledWith(
        'DentalOS-Desktop',
        'tenant-123:org-456:device-789:access-token'
      );

      expect(keytar.deletePassword).toHaveBeenCalledWith(
        'DentalOS-Desktop',
        'tenant-123:org-456:device-789:refresh-token'
      );

      expect(keytar.deletePassword).toHaveBeenCalledWith(
        'DentalOS-Desktop',
        'tenant-123:org-456:device-789:encryption-key'
      );

      expect(keytar.deletePassword).toHaveBeenCalledWith(
        'DentalOS-Desktop',
        'tenant-123:org-456:device-789:last-login'
      );
    });
  });

  describe('PIN management', () => {
    it('should save local PIN hash', async () => {
      await saveLocalPin(mockContext, 'hashed-pin-123');

      expect(keytar.setPassword).toHaveBeenCalledWith(
        'DentalOS-Desktop',
        'tenant-123:org-456:device-789:local-pin',
        'hashed-pin-123'
      );
    });

    it('should load local PIN hash', async () => {
      keytar.getPassword.mockResolvedValueOnce('hashed-pin-123');

      const result = await loadLocalPin(mockContext);
      expect(result).toBe('hashed-pin-123');
    });

    it('should clear local PIN', async () => {
      await clearLocalPin(mockContext);

      expect(keytar.deletePassword).toHaveBeenCalledWith(
        'DentalOS-Desktop',
        'tenant-123:org-456:device-789:local-pin'
      );
    });
  });
});
