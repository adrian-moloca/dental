import {
  DefaultBiometricProvider,
  BiometricType,
  setBiometricProvider,
  getBiometricProvider,
  authenticateWithBiometrics,
  checkBiometricCapability,
  isBiometricAvailable
} from '../../src/security/biometrics';

describe('Biometrics', () => {
  describe('DefaultBiometricProvider', () => {
    let provider: DefaultBiometricProvider;

    beforeEach(() => {
      provider = new DefaultBiometricProvider();
    });

    it('should report no biometric capability', async () => {
      const capability = await provider.checkCapability();

      expect(capability).toEqual({
        available: false,
        type: BiometricType.NONE,
        enrolled: false
      });
    });

    it('should fail authentication attempts', async () => {
      const result = await provider.authenticate('Test authentication');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Biometric authentication is not available on this platform');
      expect(result.biometricType).toBe(BiometricType.NONE);
    });

    it('should report as not available', async () => {
      const available = await provider.isAvailable();
      expect(available).toBe(false);
    });
  });

  describe('Global biometric functions', () => {
    it('should use default provider initially', () => {
      const provider = getBiometricProvider();
      expect(provider).toBeInstanceOf(DefaultBiometricProvider);
    });

    it('should allow setting custom provider', async () => {
      const mockProvider = {
        checkCapability: jest.fn().mockResolvedValue({
          available: true,
          type: BiometricType.FINGERPRINT,
          enrolled: true
        }),
        authenticate: jest.fn().mockResolvedValue({
          success: true,
          biometricType: BiometricType.FINGERPRINT
        }),
        isAvailable: jest.fn().mockResolvedValue(true)
      };

      setBiometricProvider(mockProvider);
      const provider = getBiometricProvider();

      expect(provider).toBe(mockProvider);
    });

    it('should authenticate using current provider', async () => {
      const result = await authenticateWithBiometrics('Unlock application');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should check capability using current provider', async () => {
      const capability = await checkBiometricCapability();

      expect(capability.available).toBe(false);
      expect(capability.type).toBe(BiometricType.NONE);
    });

    it('should check availability using current provider', async () => {
      const available = await isBiometricAvailable();
      expect(available).toBe(false);
    });
  });

  describe('Custom biometric provider integration', () => {
    it('should call custom provider methods', async () => {
      const mockProvider = {
        checkCapability: jest.fn().mockResolvedValue({
          available: true,
          type: BiometricType.TOUCH_ID,
          enrolled: true
        }),
        authenticate: jest.fn().mockResolvedValue({
          success: true,
          biometricType: BiometricType.TOUCH_ID
        }),
        isAvailable: jest.fn().mockResolvedValue(true)
      };

      setBiometricProvider(mockProvider);

      await checkBiometricCapability();
      expect(mockProvider.checkCapability).toHaveBeenCalled();

      await authenticateWithBiometrics('Test');
      expect(mockProvider.authenticate).toHaveBeenCalledWith('Test');

      await isBiometricAvailable();
      expect(mockProvider.isAvailable).toHaveBeenCalled();
    });
  });
});
