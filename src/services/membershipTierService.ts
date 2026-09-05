import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebaseService';
import { Membership, BenefitPackageItem } from '../types';
import { generateUuid } from '../utils/idGenerator';
import { AuditService } from './auditService';
import { StorageService } from './storage';
import { DEFAULT_MEMBERSHIPS } from '../constants/memberships';

export class MembershipTierService {
  private static readonly COLLECTION_NAME = 'membershipTiers';

  /** Remove all undefined fields recursively — Firestore rejects undefined values */
  private static sanitize<T extends object>(obj: T): T {
    const clean: any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined) continue;
      if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
        clean[k] = this.sanitize(v);
      } else if (Array.isArray(v)) {
        clean[k] = v.map(item =>
          item !== null && typeof item === 'object' ? this.sanitize(item) : item
        );
      } else {
        clean[k] = v;
      }
    }
    return clean as T;
  }

  /**
   * Real-time Multi-Channel Subscription:
   * Combines hot in-memory cache, window events, cross-tab BroadcastChannel, and Firestore snapshots.
   */
  public static subscribeToTiers(callback: (tiers: Membership[]) => void): () => void {
    // 1. Immediately emit current local storage tiers as optimistic baseline
    const initialTiers = StorageService.getMemberships();
    callback(initialTiers && initialTiers.length > 0 ? initialTiers : DEFAULT_MEMBERSHIPS);

    // 2. Listen to local/in-app data sync events
    const handleDataSynced = (e: any) => {
      const key = e?.detail?.key;
      if (!key || key === 'labmedix_memberships_v1' || key.includes('membership')) {
        const updated = StorageService.getMemberships();
        callback(updated);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || e.key === 'labmedix_memberships_v1' || e.key.includes('membership')) {
        const updated = StorageService.getMemberships();
        callback(updated);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('labmedix_data_synced', handleDataSynced);
      window.addEventListener('storage', handleStorageChange);
    }

    // 3. Firestore live snapshot listener
    let firestoreUnsub: (() => void) | null = null;
    try {
      const q = collection(db, this.COLLECTION_NAME);
      firestoreUnsub = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const cloudTiers: Membership[] = [];
            snapshot.forEach((d) => {
              const data = d.data();
              // Guard: skip any document missing required name field
              if (!data || !data.name) return;
              cloudTiers.push({ ...data, id: d.id } as Membership);
            });
            if (cloudTiers.length > 0) {
              // Reconcile and save
              StorageService.saveMemberships(cloudTiers);
              callback(cloudTiers);
            }
          }
        },
        (error) => {
          console.warn('[MembershipTierService] Firestore snapshot fallback:', error);
          callback(StorageService.getMemberships());
        }
      );
    } catch (e) {
      console.warn('[MembershipTierService] Firestore snapshot init error:', e);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('labmedix_data_synced', handleDataSynced);
        window.removeEventListener('storage', handleStorageChange);
      }
      if (firestoreUnsub) {
        firestoreUnsub();
      }
    };
  }

  public static getAll(): Membership[] {
    return StorageService.getMemberships();
  }

  public static getActive(): Membership[] {
    const all = StorageService.getMemberships();
    return all.filter(m => m.status === 'active');
  }

  public static getRecommended(): Membership | undefined {
    const active = this.getActive();
    return active.find(m => m.isRecommended) || active.find(m => m.isPopular) || active[0];
  }

  public static getById(id: string): Membership | undefined {
    if (!id) return undefined;
    const all = StorageService.getMemberships();
    return all.find(m => m.id === id || m.slug === id || m.name?.toLowerCase() === id?.toLowerCase());
  }

  public static async create(membership: Omit<Membership, 'id' | 'createdAt'>, userRole: string = 'super_admin'): Promise<Membership> {
    if (userRole !== 'super_admin') {
      throw new Error('SECURITY VIOLATION: Only Super Admin is authorized to create tiers.');
    }
    const newId = membership.slug ? `mem_${membership.slug}` : `mem_${generateUuid().slice(0, 8)}`;
    const newMembership: Membership = {
      ...membership,
      id: newId,
      status: membership.status || 'active',
      isRecommended: membership.isRecommended || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // If newly created tier is recommended, unset on others
    let local = StorageService.getMemberships().filter(m => m.id !== newId);
    if (newMembership.isRecommended) {
      local = local.map(m => ({ ...m, isRecommended: false }));
    }
    local.push(newMembership);
    StorageService.saveMemberships(local);

    try {
      await setDoc(doc(db, this.COLLECTION_NAME, newId), this.sanitize(newMembership));
      
      AuditService.log(
        'MEMBERSHIP_TIER_CREATED',
        'membership',
        `Super Admin created new tier "${newMembership.name}" via TierConfigManager`,
        newId,
        { newValue: newMembership, actorRole: userRole }
      );
      
      return newMembership;
    } catch (e: any) {
      handleFirestoreError(e, OperationType.CREATE, this.COLLECTION_NAME);
      return newMembership;
    }
  }

  public static async update(id: string, updates: Partial<Membership>, userRole: string = 'super_admin'): Promise<void> {
    if (userRole !== 'super_admin') {
      throw new Error('SECURITY VIOLATION: Only Super Admin is authorized to update tiers.');
    }

    const payload = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Update local storage single source of truth synchronously
    let local = StorageService.getMemberships();
    const idx = local.findIndex(m => m.id === id || m.slug === id);
    if (idx !== -1) {
      // If setting this tier as recommended, unset on others
      if (updates.isRecommended) {
        local = local.map((m, i) => (i === idx ? { ...m, ...payload, isRecommended: true } : { ...m, isRecommended: false }));
      } else {
        local[idx] = { ...local[idx], ...payload };
      }
      StorageService.saveMemberships(local);
    }

    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await setDoc(docRef, this.sanitize(payload), { merge: true });
      
      AuditService.log(
        'MEMBERSHIP_TIER_UPDATED',
        'membership',
        `Super Admin updated tier (ID: ${id})`,
        id,
        { newValue: updates, actorRole: userRole }
      );
    } catch (e: any) {
      handleFirestoreError(e, OperationType.UPDATE, this.COLLECTION_NAME);
    }
  }

  public static async toggleStatus(id: string, currentStatus: 'active' | 'inactive', userRole: string = 'super_admin'): Promise<void> {
    if (userRole !== 'super_admin') {
      throw new Error('SECURITY VIOLATION: Only Super Admin is authorized to change tier status.');
    }
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await this.update(id, { status: newStatus }, userRole);
  }

  public static async setRecommended(id: string, userRole: string = 'super_admin'): Promise<void> {
    if (userRole !== 'super_admin') {
      throw new Error('SECURITY VIOLATION: Only Super Admin is authorized to set recommended tier.');
    }
    await this.update(id, { isRecommended: true, status: 'active' }, userRole);
  }

  public static async delete(id: string, userRole: string = 'super_admin'): Promise<void> {
    if (userRole !== 'super_admin') {
      throw new Error('SECURITY VIOLATION: Only Super Admin is authorized to delete tiers.');
    }

    // Update local storage single source of truth synchronously
    const local = StorageService.getMemberships().filter(m => m.id !== id && m.slug !== id);
    StorageService.saveMemberships(local);

    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await deleteDoc(docRef);
      
      AuditService.log(
        'MEMBERSHIP_TIER_DELETED',
        'membership',
        `Super Admin deleted tier (ID: ${id})`,
        id,
        { actorRole: userRole }
      );
    } catch (e: any) {
      handleFirestoreError(e, OperationType.DELETE, this.COLLECTION_NAME);
    }
  }

  /**
   * Evaluates dynamic discount rates for any service department
   */
  public static calculateDynamicDiscount(
    membership: Membership | undefined,
    department: 'opd' | 'lab' | 'pharmacy' | 'home_collection' | 'emergency' | 'ipd' | 'teleconsult',
    amount: number
  ): { discountPct: number; discountAmount: number; finalPayable: number; cashbackEarned: number } {
    if (!membership || membership.status !== 'active') {
      return { discountPct: 0, discountAmount: 0, finalPayable: amount, cashbackEarned: 0 };
    }

    let discountPct = 0;
    switch (department) {
      case 'opd':
        discountPct = membership.opdDiscount || 0;
        break;
      case 'lab':
        discountPct = membership.labDiscount || 0;
        break;
      case 'pharmacy':
        discountPct = membership.pharmacyDiscount || 0;
        break;
      case 'home_collection':
        discountPct = membership.homeCollectionDiscount || 0;
        break;
      case 'emergency':
        discountPct = membership.emergencyDiscount || Math.round((membership.opdDiscount || 0) * 0.7);
        break;
      case 'ipd':
        discountPct = membership.ipdDiscount || Math.round((membership.labDiscount || 0) * 0.5);
        break;
      case 'teleconsult':
        discountPct = membership.teleconsultDiscount || membership.opdDiscount || 0;
        break;
    }

    const discountAmount = Math.round((amount * discountPct) / 100);
    const finalPayable = Math.max(0, amount - discountAmount);
    const cashbackPct = membership.cashbackPercentage || 0;
    const cashbackEarned = Math.round((finalPayable * cashbackPct) / 100);

    return { discountPct, discountAmount, finalPayable, cashbackEarned };
  }

  /**
   * Calculates total estimated monetary value of all included benefit packages
   */
  public static calculateTotalBenefitPackageValue(membership: Membership): number {
    if (!membership.benefitPackages || membership.benefitPackages.length === 0) {
      return membership.registrationFee * 3;
    }
    return membership.benefitPackages.reduce((acc, bp) => acc + (bp.valueInInr || 0), 0);
  }

  /**
   * Generates CSV string for Exporting Tier Master Sheet
   */
  public static generateTierMasterCsv(tiers: Membership[]): string {
    const headers = [
      'Tier ID',
      'Name',
      'Slug',
      'Plan Type',
      'Recommended',
      'Max Family Members',
      'Registration Fee (INR)',
      'Renewal Fee (INR)',
      'Validity (Months)',
      'OPD Discount (%)',
      'Lab Discount (%)',
      'Pharmacy Discount (%)',
      'Home Draw Discount (%)',
      'Emergency Discount (%)',
      'IPD Discount (%)',
      'Cashback (%)',
      'Total Benefits Count',
      'Estimated Benefit Value (INR)',
      'Status'
    ];

    const rows = tiers.map(t => [
      `"${t.id}"`,
      `"${t.name.replace(/"/g, '""')}"`,
      `"${t.slug}"`,
      `"${t.isFamilyPlan ? 'Family Plan' : 'Individual'}"`,
      t.isRecommended ? 'YES (RECOMMENDED)' : 'NO',
      t.isFamilyPlan ? (t.maxFamilyMembers || 4) : 1,
      t.registrationFee,
      t.annualRenewalFee,
      t.validityMonths,
      `${t.opdDiscount}%`,
      `${t.labDiscount}%`,
      `${t.pharmacyDiscount}%`,
      t.homeCollectionDiscount === 100 ? '100% Free' : `${t.homeCollectionDiscount}%`,
      `${t.emergencyDiscount || 0}%`,
      `${t.ipdDiscount || 0}%`,
      `${t.cashbackPercentage || 0}%`,
      (t.specialBenefits || []).length + (t.benefitPackages || []).length,
      this.calculateTotalBenefitPackageValue(t),
      `"${t.status.toUpperCase()}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}
