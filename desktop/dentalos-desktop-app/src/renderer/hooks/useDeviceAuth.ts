import { useState, useEffect } from 'react';

export function useDeviceAuth() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkRegistration();
  }, []);

  const checkRegistration = async () => {
    try {
      const registered = await window.dentalos.device.isRegistered();
      setIsRegistered(registered);
    } catch (error) {
      console.error('Failed to check device registration:', error);
    } finally {
      setLoading(false);
    }
  };

  return { isRegistered, loading };
}
