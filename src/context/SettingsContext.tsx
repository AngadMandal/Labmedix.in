import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CompanyProfile } from '../types';
import { StorageService } from '../services/storage';
import { SettingsService } from '../services/settingsService';
import { ApiSyncService } from '../services/apiSyncService';

interface SettingsContextType {
  companyProfile: CompanyProfile;
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => void;
  refreshCompanyProfile: () => void;
  isCentralSynced: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => StorageService.getCompanyProfile());
  const [isCentralSynced, setIsCentralSynced] = useState<boolean>(true);

  const refreshCompanyProfile = useCallback(() => {
    const profile = StorageService.getCompanyProfile();
    setCompanyProfile(profile);
  }, []);

  // 1. Initial Cloud Fetch & Local Event Listener
  useEffect(() => {
    // Immediate async fetch from Central Firestore
    ApiSyncService.fetchCompanyProfile().then((cloudData) => {
      if (cloudData && cloudData.name) {
        StorageService.updateCacheAndNotify('labmedix_company_profile_v1', cloudData);
        setCompanyProfile(StorageService.getCompanyProfile());
        setIsCentralSynced(true);
      }
    }).catch(() => {});

    // Listen for local tab and cross-tab storage sync events
    const handleSync = (e: any) => {
      if (!e.detail || e.detail.key === 'labmedix_company_profile_v1' || e.detail.action === 'IMPORT_PROFILE') {
        const latest = StorageService.getCompanyProfile();
        setCompanyProfile(latest);
      }
    };

    window.addEventListener('labmedix_data_synced', handleSync as EventListener);
    window.addEventListener('storage', handleSync as EventListener);

    // 2. Direct Central Firestore Real-time Snapshot Subscription
    const unsubscribeFirestore = ApiSyncService.subscribeToCompanyProfile((cloudProfile) => {
      if (cloudProfile && cloudProfile.name) {
        setCompanyProfile(cloudProfile);
        setIsCentralSynced(true);
      }
    });

    return () => {
      window.removeEventListener('labmedix_data_synced', handleSync as EventListener);
      window.removeEventListener('storage', handleSync as EventListener);
      try { unsubscribeFirestore(); } catch {}
    };
  }, []);

  const updateCompanyProfile = (updates: Partial<CompanyProfile>) => {
    const updated = SettingsService.updateProfile(updates);
    setCompanyProfile(updated);
    setIsCentralSynced(true);
  };

  return (
    <SettingsContext.Provider value={{ companyProfile, updateCompanyProfile, refreshCompanyProfile, isCentralSynced }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};