'use client';

import { useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ClientOnly: React.FC<ClientOnlyProps> = ({ children, fallback = null }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ClientOnly;
