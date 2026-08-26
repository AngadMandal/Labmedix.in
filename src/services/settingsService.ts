import { CompanyProfile } from '../types';
import { StorageService } from './storage';
import { AuditService } from './auditService';

export class SettingsService {
  public static getProfile(): CompanyProfile {
    return StorageService.getCompanyProfile();
  }

  public static updateProfile(profile: Partial<CompanyProfile>): CompanyProfile {
    const current = StorageService.getCompanyProfile();
    const updated = { ...current, ...profile };
    StorageService.saveCompanyProfile(updated);
    AuditService.log('SETTINGS_UPDATED', 'settings', 'Updated LABMEDIX organization profile settings.');
    return updated;
  }
}