import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebaseService';
import { 
  Patient, 
  HealthCard, 
  CardApplicationRequest, 
  PatientAppointment, 
  WalletTransaction, 
  CashDeskVoucher, 
  User, 
  Membership,
  AuditLog,
  Wallet,
  FamilyGroup
} from '../types';

export class ApiSyncService {
  /** Generic fetch collection from Firestore */
  public static async fetchCollection<T>(collectionName: string): Promise<T[]> {
    try {
      const q = query(collection(db, collectionName));
      const snapshot = await getDocs(q);
      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as unknown as T);
      });
      return items;
    } catch (error) {
      console.warn(`[ApiSync] Fallback for fetching ${collectionName} from local storage:`, error);
      return [];
    }
  }

  /** Generic save or update document in Firestore */
  public static async saveDocument<T extends { id?: string }>(collectionName: string, id: string, data: T): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await setDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${id}`);
    }
  }

  /** Generic delete document from Firestore */
  public static async deleteDocument(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
    }
  }

  /** Real-time listener for multi-device sync */
  public static subscribeToCollection<T>(collectionName: string, callback: (items: T[]) => void): () => void {
    try {
      const q = query(collection(db, collectionName));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as unknown as T);
        });
        callback(items);
      }, (error) => {
        console.warn(`[ApiSync] Snapshot error on ${collectionName}:`, error);
      });
      return unsubscribe;
    } catch (e) {
      console.warn(`[ApiSync] Failed to subscribe to ${collectionName}:`, e);
      return () => {};
    }
  }

  /** Specific sync helpers for core entities */
  public static async syncPatients(patients: Patient[]): Promise<void> {
    for (const p of patients) {
      if (p.id) {
        await this.saveDocument('patients', p.id, p);
      }
    }
  }

  public static async syncCards(cards: HealthCard[]): Promise<void> {
    for (const c of cards) {
      if (c.id) {
        await this.saveDocument('cards', c.id, c);
      }
    }
  }

  public static async syncCardApplications(apps: CardApplicationRequest[]): Promise<void> {
    for (const app of apps) {
      if (app.id) {
        await this.saveDocument('cardApplications', app.id, app);
      }
    }
  }

  public static async syncAppointments(appointments: PatientAppointment[]): Promise<void> {
    for (const apt of appointments) {
      if (apt.id) {
        await this.saveDocument('appointments', apt.id, apt);
      }
    }
  }

  public static async syncTransactions(txns: WalletTransaction[]): Promise<void> {
    for (const tx of txns) {
      if (tx.id) {
        await this.saveDocument('transactions', tx.id, tx);
      }
    }
  }

  public static async syncWallets(wallets: Wallet[]): Promise<void> {
    for (const w of wallets) {
      if (w.id) {
        await this.saveDocument('wallets', w.id, w);
      }
    }
  }

  public static async syncFamilies(families: FamilyGroup[]): Promise<void> {
    for (const f of families) {
      if (f.id) {
        await this.saveDocument('families', f.id, f);
      }
    }
  }

  public static async syncAuditLogs(logs: AuditLog[]): Promise<void> {
    for (const l of logs) {
      if (l.id) {
        await this.saveDocument('auditLogs', l.id, l);
      }
    }
  }

  public static async syncUsers(users: User[]): Promise<void> {
    for (const u of users) {
      if (u.id) {
        await this.saveDocument('users', u.id, u);
      }
    }
  }

  public static async syncMemberships(memberships: Membership[]): Promise<void> {
    for (const m of memberships) {
      if (m.id) {
        await this.saveDocument('memberships', m.id, m);
      }
    }
  }

  public static async syncVouchers(vouchers: CashDeskVoucher[]): Promise<void> {
    for (const v of vouchers) {
      if (v.id) {
        await this.saveDocument('vouchers', v.id, v);
      }
    }
  }
}
