export enum BiometricType {
  FINGERPRINT = 'FINGERPRINT',
  FACE_ID = 'FACE_ID',
  TOUCH_ID = 'TOUCH_ID',
  WINDOWS_HELLO = 'WINDOWS_HELLO',
  NONE = 'NONE',
}

export interface BiometricCapability {
  available: boolean;
  type: BiometricType;
  enrolled: boolean;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometricType?: BiometricType;
}

export interface BiometricProvider {
  checkCapability(): Promise<BiometricCapability>;
  authenticate(reason: string): Promise<BiometricAuthResult>;
  isAvailable(): Promise<boolean>;
}

export class DefaultBiometricProvider implements BiometricProvider {
  async checkCapability(): Promise<BiometricCapability> {
    return {
      available: false,
      type: BiometricType.NONE,
      enrolled: false,
    };
  }

  async authenticate(reason: string): Promise<BiometricAuthResult> {
    console.warn('Biometric authentication not implemented:', reason);
    return {
      success: false,
      error: 'Biometric authentication is not available on this platform',
      biometricType: BiometricType.NONE,
    };
  }

  async isAvailable(): Promise<boolean> {
    return false;
  }
}

let provider: BiometricProvider = new DefaultBiometricProvider();

export function setBiometricProvider(customProvider: BiometricProvider): void {
  provider = customProvider;
}

export function getBiometricProvider(): BiometricProvider {
  return provider;
}

export async function authenticateWithBiometrics(reason: string = 'Unlock DentalOS Desktop'): Promise<BiometricAuthResult> {
  return provider.authenticate(reason);
}

export async function checkBiometricCapability(): Promise<BiometricCapability> {
  return provider.checkCapability();
}

export async function isBiometricAvailable(): Promise<boolean> {
  return provider.isAvailable();
}
