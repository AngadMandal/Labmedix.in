import { Membership } from '../types';
import { StorageService } from './storage';
import { AuditService } from './auditService';
import { generateUuid } from '../utils/idGenerator';

export class MembershipService {
  public static getAll(): Membership[] {
    return StorageService.getMemberships();
  }

  public static getById(id: string): Membership | undefined {
    return StorageService.getMemberships().find(m => m.id === id);
  }

  public static create(membership: Omit<Membership, 'id' | 'createdAt'>): Membership {
    const memberships = StorageService.getMemberships();
    const newMembership: Membership = {
      ...membership,
      id: `mem_${generateUuid().slice(0, 8)}`,
      createdAt: new Date().toISOString()
    };
    memberships.push(newMembership);
    StorageService.saveMemberships(memberships);
    AuditService.log('MEMBERSHIP_CREATED', 'membership', `Created membership tier ${newMembership.name}`, newMembership.id);
    return newMembership;
  }

  public static update(id: string, updates: Partial<Membership>): Membership | null {
    const memberships = StorageService.getMemberships();
    const index = memberships.findIndex(m => m.id === id);
    if (index === -1) return null;

    memberships[index] = { ...memberships[index], ...updates };
    StorageService.saveMemberships(memberships);
    AuditService.log('MEMBERSHIP_UPDATED', 'membership', `Updated membership tier ${memberships[index].name}`, id);
    return memberships[index];
  }

  public static toggleStatus(id: string): Membership | null {
    const memberships = StorageService.getMemberships();
    const mem = memberships.find(m => m.id === id);
    if (!mem) return null;
    mem.status = mem.status === 'active' ? 'inactive' : 'active';
    StorageService.saveMemberships(memberships);
    AuditService.log('MEMBERSHIP_STATUS_CHANGED', 'membership', `Toggled ${mem.name} status to ${mem.status}`, id);
    return mem;
  }
}