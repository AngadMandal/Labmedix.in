import { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';

/**
 * Universal React Hook for Real-Time Synchronized Storage State
 * Automatically re-renders whenever Firestore or local storage pushes changes
 */
export function useStorageData<T>(storageKey: string, getter: () => T): T {
  const [data, setData] = useState<T>(() => getter());

  useEffect(() => {
    // Initial fetch
    setData(getter());

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (!customEvent.detail?.key || customEvent.detail.key === storageKey || customEvent.detail?.action) {
        setData(getter());
      }
    };

    window.addEventListener('labmedix_data_synced', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('labmedix_data_synced', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [storageKey]);

  return data;
}
