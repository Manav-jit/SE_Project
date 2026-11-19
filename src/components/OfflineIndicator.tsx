'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.log('SW registration skipped or failed:', err));
    }

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-bounce-subtle">
      {!isOnline ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#FFE4E6] border-2 border-[#BE123C] text-[#9F1239] shadow-[4px_4px_0px_0px_#BE123C] text-xs font-black">
          <WifiOff className="w-5 h-5 shrink-0 text-[#E11D48]" />
          <div>
            <p className="uppercase tracking-wider">Offline Mode Active</p>
            <p className="font-normal text-[11px] opacity-90 mt-0.5">
              Viewing cached welfare schemes and statutory rules. Reconnect to download live documents.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#DCFCE7] border-2 border-[#15803D] text-[#166534] shadow-[4px_4px_0px_0px_#15803D] text-xs font-black">
          <Wifi className="w-4 h-4 shrink-0 text-[#16A34A]" />
          <p className="uppercase tracking-wider">Back Online • Synced</p>
        </div>
      )}
    </div>
  );
}
