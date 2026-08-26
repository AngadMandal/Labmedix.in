import React, { createContext, useContext, useState, useEffect } from 'react';
import { CompanyProfile } from '../types';
import { StorageService } from '../services/storage';
import { SettingsService } from '../services/settingsService';

interface SettingsContextType {
  companyProfile: CompanyProfile;
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => void;
  refreshCompanyProfile: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => StorageService.getCompanyProfile());

  const refreshCompanyProfile = () => {
    setCompanyProfile(StorageService.getCompanyProfile());
  };

  useEffect(() => {
    const handleSync = (e: any) => {
      if (!e.detail || e.detail.key === 'labmedix_company_profile_v1') {
        setCompanyProfile(StorageService.getCompanyProfile());
      }
    };
    window.addEventListener('labmedix_data_synced', handleSync as EventListener);
    return () => window.removeEventListener('labmedix_data_synced', handleSync as EventListener);
  }, []);

  const updateCompanyProfile = (updates: Partial<CompanyProfile>) => {
    const updated = SettingsService.updateProfile(updates);
    setCompanyProfile(updated);
  };

  return (
    <SettingsContext.Provider value={{ companyProfile, updateCompanyProfile, refreshCompanyProfile }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};