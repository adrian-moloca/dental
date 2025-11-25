import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DeviceContext as DeviceContextData } from '../security/secure-storage';

interface DeviceRegistrationInfo extends DeviceContextData {
  deviceId: string;
  clinicId?: string;
  deviceName: string;
  isRegistered: boolean;
}

interface DeviceContextState {
  device: DeviceRegistrationInfo | null;
  loading: boolean;
  error: string | null;
  refreshDevice: () => Promise<void>;
  clearDevice: () => Promise<void>;
}

const DeviceContext = createContext<DeviceContextState | undefined>(undefined);

interface DeviceProviderProps {
  children: ReactNode;
}

export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
  const [device, setDevice] = useState<DeviceRegistrationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDeviceInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const deviceInfo = await window.dentalos.device.getInfo();

      if (deviceInfo) {
        setDevice({
          deviceId: deviceInfo.deviceId,
          tenantId: deviceInfo.tenantId,
          organizationId: deviceInfo.organizationId,
          clinicId: deviceInfo.clinicId,
          deviceName: deviceInfo.deviceName,
          isRegistered: true,
        });
      } else {
        setDevice(null);
      }
    } catch (err) {
      console.error('Failed to load device info:', err);
      setError('Failed to load device information');
      setDevice(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeviceInfo();
  }, []);

  const refreshDevice = async () => {
    await loadDeviceInfo();
  };

  const clearDevice = async () => {
    try {
      await window.dentalos.device.clear();
      setDevice(null);
    } catch (err) {
      console.error('Failed to clear device:', err);
      setError('Failed to clear device');
    }
  };

  return (
    <DeviceContext.Provider
      value={{
        device,
        loading,
        error,
        refreshDevice,
        clearDevice,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export function useDevice(): DeviceContextState {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within DeviceProvider');
  }
  return context;
}

export function useDeviceContext(): DeviceContextData | null {
  const { device } = useDevice();
  if (!device) return null;

  return {
    tenantId: device.tenantId,
    organizationId: device.organizationId,
    deviceId: device.deviceId,
  };
}
