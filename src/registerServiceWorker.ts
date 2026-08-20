import { useState, useEffect } from 'react';
import { offlineStorage } from './services/offlineStorageService';

export function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[ServiceWorker] Registered with scope:', registration.scope);
        })
        .catch((err) => {
          console.warn('[ServiceWorker] Registration failed:', err);
        });
    });
  }

  // Ensure offline storage initializes
  offlineStorage.init();
}

export async function requestBackgroundSync(tag: string = 'sync-pending-data'): Promise<boolean> {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      // @ts-expect-error SyncManager is part of the Background Sync API specification
      if (registration.sync) {
        // @ts-expect-error sync is not in default DOM types
        await registration.sync.register(tag);
        console.log(`[Background Sync] Registered sync tag: "${tag}"`);
        return true;
      }
    } catch (err) {
      console.warn('[Background Sync] Failed to register sync:', err);
    }
  }
  return false;
}

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
