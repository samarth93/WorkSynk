'use client';

import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isReconnecting: boolean;
  lastOnline: Date | null;
  lastOffline: Date | null;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: true, // Default to true for SSR
    isReconnecting: false,
    lastOnline: null,
    lastOffline: null,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set initial status after mount
    setNetworkStatus(prev => ({
      ...prev,
      isOnline: navigator.onLine,
    }));

    const handleOnline = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: true,
        isReconnecting: false,
        lastOnline: new Date(),
      }));
    };

    const handleOffline = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: false,
        lastOffline: new Date(),
      }));
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return networkStatus;
};
