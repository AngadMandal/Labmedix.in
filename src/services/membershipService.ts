import { Membership } from '../types';
import { StorageService } from './storage';
import { AuditService } from './auditService';
import { generateUuid } from '../utils/idGenerator';

export class MembershipService {
  public static getAll(): Membership[] {
    return StorageService.getMemberships();
  }

  public static getActive(): Membership[] {
    return StorageService.getMemberships().filter(m => m.status === 'active');
  }

  public static getById(id: string): Membership | undefined {
    if (!id) return undefined;
    const all = StorageService.getMemberships();
    return all.find(m => m.id === id || m.slug === id || m.name?.toLowerCase() === id.toLowerCase());
  }

  public static create(membership: Omit<Membership, 'id' | 'createdAt'>, userRole: string = 'super_admin'): Membership {
    if (userRole !== 'super_admin') {
      throw new Error('SECURITY VIOLATION: Only Super Admin is authorized to create Health Card Membership Tiers.');
    }

    const memberships = StorageService.getMemberships();
    const newMembership: Membership = {
      ...membership,
      id: membership.slug ? `mem_${membership.slug}` : `mem_${generateUuid().slice(0, 8)}`,
      status: membership.status || 'active',
      createdAt: new Date().toISOString()
    };

    memberships.push(newMembership);
    StorageService.saveMemberships(memberships);
    
    AuditService.log(
      'MEMBERSHIP_CREATED',
      'membership',
      `Super Admin created new membership tier "${newMembership.name}" (Fee: ₹${newMembership.registrationFee}, Validity: ${newMembership.validityMonths}m, Status: ${newMembership.status})`,
      newMembership.id,
      {
        previousValue: null,
        newValue: newMembership,
        actorRole: userRole
      }
    );
    return newMembership;
  }

  public static update(id: string, updates: Partial<Membership>, userRole: string = 'super_admin'): Membership | null {
    if (userRole !== 'super_admin') {
      throw new Error('SECURITY VIOLATION: Only Super Admin is authorized to edit Health Card Membership Tiers.');
    }

    const memberships = StorageService.getMemberships();
    const index = memberships.findIndex(m => m.id === id || m.slug === id);
    if (index === -1) return null;

    const previousValue = { ...memberships[index] };
    memberships[index] = { ...memberships[index], ...updates };
    
    StorageService.saveMemberships(memberships);

    AuditService.log(
      'MEMBERSHIP_UPDATED',
      'membership',
      `Super Admin updated membership tier "${memberships[index].name}" (ID: ${id})`,
      id,
      {
        previousValue,
        newValue: memberships[index],
        actorRole: userRole
      }
    );
    return memberships[index];
  }

  public static toggleStatus(id: string, userRole: string = 'super_admin'): Membership | null {
    if (userRole !== 'super_admin') {
      throw new Error('SECURITY VIOLATION: Only Super Admin is authorized to activate or deactivate Health Card Membership Tiers.');
    }

    const memberships = StorageService.getMemberships();
    const mem = memberships.find(m => m.id === id || m.slug === id);
    if (!mem) return null;

    const prevStatus = mem.status;
    mem.status = mem.status === 'active' ? 'inactive' : 'active';
    
    StorageService.saveMemberships(memberships);

    AuditService.log(
      'MEMBERSHIP_STATUS_CHANGED',
      'membership',
      `Super Admin ${mem.status === 'active' ? 'ACTIVATED' : 'DEACTIVATED'} membership tier "${mem.name}" (Previously: ${prevStatus})`,
      id,
      {
        previousValue: { status: prevStatus },
        newValue: { status: mem.status },
        actorRole: userRole
      }
    );
    return mem;
  }

  public static delete(id: string, userRole: string = 'super_admin'): boolean {
    if (userRole !== 'super_admin') {
      throw new Error('SECURITY VIOLATION: Only Super Admin is authorized to delete Health Card Membership Tiers.');
    }

    const memberships = StorageService.getMemberships();
    const memIndex = memberships.findIndex(m => m.id === id || m.slug === id);
    if (memIndex === -1) return false;

    const deleted = memberships.splice(memIndex, 1)[0];
    StorageService.saveMemberships(memberships);

    AuditService.log(
      'MEMBERSHIP_DELETED',
      'membership',
      `Super Admin deleted membership tier "${deleted.name}" (ID: ${id})`,
      id,
      {
        previousValue: deleted,
        newValue: null,
        actorRole: userRole
      }
    );
    return true;
  }
}
