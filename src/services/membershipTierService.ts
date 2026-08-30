import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebaseService';
import { Membership } from '../types';
import { generateUuid } from '../utils/idGenerator';
import { AuditService } from './auditService';

export class MembershipTierService {
  private static readonly COLLECTION_NAME = 'membershipTiers';

  public static subscribeToTiers(callback: (tiers: Membership[]) => void): () => void {
    const q = collection(db, this.COLLECTION_NAME);
    return onSnapshot(
      q,
      (snapshot) => {
        const tiers: Membership[] = [];
        snapshot.forEach((doc) => {
          tiers.push({ ...doc.data(), id: doc.id } as Membership);
        });
        callback(tiers);
      },
      (error) => {
        console.error('Error listening to membership tiers:', error);
      }
    );
  }

  public static async getAll(): Promise<Membership[]> {
    try {
      const q = collection(db, this.COLLECTION_NAME);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Membership));
    } catch (e: any) {
      handleFirestoreError(e, OperationType.GET, this.COLLECTION_NAME);
      return [];
    }
  }

  public static async getActive(): Promise<Membership[]> {
    try {
      const q = query(collection(db, this.COLLECTION_NAME), where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Membership));
    } catch (e: any) {
      handleFirestoreError(e, OperationType.GET, this.COLLECTION_NAME);
      return [];
    }
  }

  public static async create(membership: Omit<Membership, 'id' | 'createdAt'>, userRole: string = 'super_admin'): Promise<Membership> {
    if (userRole !== 'super_admin') {
      throw new Error('SECURITY VIOLATION: Only Super Admin is authorized to create tiers.');
    }
    const newId = membership.slug ? `mem_${membership.slug}` : `mem_${generateUuid().slice(0, 8)}`;
    const newMembership = {
      ...membership,
      id: newId,
      status: membership.status || 'active',
      createdAt: new Date().toISOString()
    };
    
    try {
      await setDoc(doc(db, this.COLLECTION_NAME, newId), newMembership);
      
      AuditService.log(
        'MEMBERSHIP_TIER_CREATED',
        'membership',
        `Super Admin created new tier "${newMembership.name}" via TierConfigManager`,
        newId,
        { newValue: newMembership, actorRole: userRole }
      );
      
      return newMembership as Membership;
    } catch (e: any) {
      handleFirestoreError(e, OperationType.CREATE, this.COLLECTION_NAME);
      throw e;
    }
  }

  public static async update(id: string, updates: Partial<Membership>, userRole: string = 'super_admin'): Promise<void> {
    if (userRole !== 'super_admin') {
      throw new Error('SECURITY VIOLATION: Only Super Admin is authorized to update tiers.');
    }
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(docRef, updates);
      
      AuditService.log(
        'MEMBERSHIP_TIER_UPDATED',
        'membership',
        `Super Admin updated tier (ID: ${id})`,
        id,
        { newValue: updates, actorRole: userRole }
      );
    } catch (e: any) {
      handleFirestoreError(e, OperationType.UPDATE, this.COLLECTION_NAME);
      throw e;
    }
  }

  public static async toggleStatus(id: string, currentStatus: 'active' | 'inactive', userRole: string = 'super_admin'): Promise<void> {
    if (userRole !== 'super_admin') {
      throw new Error('SECURITY VIOLATION: Only Super Admin is authorized to change tier status.');
    }
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(docRef, { status: newStatus });
    } catch (e: any) {
      handleFirestoreError(e, OperationType.UPDATE, this.COLLECTION_NAME);
      throw e;
    }
  }

  public static async delete(id: string, userRole: string = 'super_admin'): Promise<void> {
    if (userRole !== 'super_admin') {
      throw new Error('SECURITY VIOLATION: Only Super Admin is authorized to delete tiers.');
    }
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
      throw e;
    }
  }
}
