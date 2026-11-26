'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { 
  getQueuedSubmissions, 
  flushOfflineSubmissions, 
  OFFLINE_SYNC_EVENT 
} from '@/lib/storage/offlineQueue';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });
  const [showReconnected, setShowReconnected] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(() => getQueuedSubmissions().length);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Register Service Worker in production
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.log('SW registration skipped or failed:', err));
    }

    const handleSyncEvent = () => {
      setPendingCount(getQueuedSubmissions().length);
    };

    const handleOnline = async () => {
      setIsOnline(true);
      setShowReconnected(true);
      
      // Auto-flush pending submissions
      const currentQueue = getQueuedSubmissions();
      if (currentQueue.length > 0) {
        setIsSyncing(true);
        await flushOfflineSubmissions();
        setIsSyncing(false);
        setPendingCount(getQueuedSubmissions().length);
      }

      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 5000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener(OFFLINE_SYNC_EVENT, handleSyncEvent);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(OFFLINE_SYNC_EVENT, handleSyncEvent);
    };
  }, []);

  const handleManualSync = async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    await flushOfflineSubmissions();
    setIsSyncing(false);
    setPendingCount(getQueuedSubmissions().length);
  };

  if (isOnline && !showReconnected && pendingCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-bounce-subtle">
      {!isOnline ? (
        <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-[#FFE4E6] border-2 border-[#BE123C] text-[#9F1239] shadow-[4px_4px_0px_0px_#BE123C] text-xs font-black">
          <WifiOff className="w-5 h-5 shrink-0 text-[#E11D48] mt-0.5" />
          <div className="space-y-1">
            <p className="uppercase tracking-wider">Offline Mode Active</p>
            <p className="font-normal text-[11px] opacity-90 leading-tight">
              Viewing cached welfare schemes and statutory rules. Submissions are queued safely locally.
            </p>
            {pendingCount > 0 && (
              <span className="inline-block mt-1 bg-[#BE123C] text-white text-[10px] font-mono px-2 py-0.5 rounded">
                {pendingCount} application(s) pending sync
              </span>
            )}
          </div>
        </div>
      ) : pendingCount > 0 ? (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#FEF3C7] border-2 border-[#D97706] text-[#92400E] shadow-[4px_4px_0px_0px_#D97706] text-xs font-black">
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 text-[#D97706] ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{pendingCount} Queued Offline Application(s)</span>
          </div>
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-2.5 py-1 bg-[#D97706] text-white rounded text-[10px] uppercase tracking-wider hover:opacity-90 disabled:opacity-50"
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#DCFCE7] border-2 border-[#15803D] text-[#166534] shadow-[4px_4px_0px_0px_#15803D] text-xs font-black">
          <Wifi className="w-4 h-4 shrink-0 text-[#16A34A]" />
          <p className="uppercase tracking-wider">Back Online • Synced with Sovereign Registry</p>
        </div>
      )}
    </div>
  );
}
