'use client';

import { useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
  showLoader?: boolean;
}

export const ClientOnly: React.FC<ClientOnlyProps> = ({ 
  children, 
  fallback = null, 
  delay = 0,
  showLoader = false 
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!isMounted) {
    if (showLoader) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ClientOnly;
