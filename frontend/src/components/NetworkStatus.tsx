'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export const NetworkStatus = () => {
  const { isOnline } = useNetworkStatus();
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineMessage(true);
    } else {
      // Hide offline message after 3 seconds when back online
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (isOnline && !showOfflineMessage) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {!isOnline ? (
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">You&apos;re offline</span>
        </div>
      ) : (
        <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-bounce">
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Back online</span>
        </div>
      )}
    </div>
  );
};

export default NetworkStatus;
