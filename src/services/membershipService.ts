import { Membership } from '../types';
import { StorageService } from './storage';
import { MembershipTierService } from './membershipTierService';

export class MembershipService {
  public static getAll(): Membership[] {
    return StorageService.getMemberships();
  }

  public static getActive(): Membership[] {
    return StorageService.getActiveMemberships();
  }

  public static getRecommended(): Membership | undefined {
    return StorageService.getRecommendedMembership();
  }

  public static getById(id: string): Membership | undefined {
    return MembershipTierService.getById(id);
  }

  public static create(membership: Omit<Membership, 'id' | 'createdAt'>, userRole: string = 'super_admin'): Promise<Membership> {
    return MembershipTierService.create(membership, userRole);
  }

  public static update(id: string, updates: Partial<Membership>, userRole: string = 'super_admin'): Promise<void> {
    return MembershipTierService.update(id, updates, userRole);
  }

  public static toggleStatus(id: string, currentStatus: 'active' | 'inactive', userRole: string = 'super_admin'): Promise<void> {
    return MembershipTierService.toggleStatus(id, currentStatus, userRole);
  }

  public static setRecommended(id: string, userRole: string = 'super_admin'): Promise<void> {
    return MembershipTierService.setRecommended(id, userRole);
  }

  public static delete(id: string, userRole: string = 'super_admin'): Promise<void> {
    return MembershipTierService.delete(id, userRole);
  }
}
