import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query,
  runTransaction,
  getDoc
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
import { BloodTestBooking, MedicineOrder } from './portalService';

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

  public static async syncLabBookings(bookings: BloodTestBooking[]): Promise<void> {
    for (const b of bookings) {
      if (b.id) {
        await this.saveDocument('labBookings', b.id, b);
      }
    }
  }

  public static async syncPharmacyOrders(orders: MedicineOrder[]): Promise<void> {
    for (const o of orders) {
      if (o.id) {
        await this.saveDocument('pharmacyOrders', o.id, o);
      }
    }
  }

  public static async approveApplicationTransaction(
    applicationId: string,
    approvedBy: string = 'Super Administrator'
  ): Promise<{ success: boolean; application?: any; patient?: any; card?: any; error?: string }> {
    try {
      const result = await runTransaction(db, async (transaction) => {
        const appRef = doc(db, 'cardApplications', applicationId);
        const appSnap = await transaction.get(appRef);

        if (!appSnap.exists()) {
          throw new Error('Application not found in Firestore.');
        }

        const appData = appSnap.data() as any;

        // Strict verification: PENDING_APPROVAL status & duplicate prevention
        const status = (appData.status || '').toLowerCase();
        if (status === 'approved' || status === 'issued' || appData.approvedCardNumber) {
          throw new Error('Duplicate Prevention Error: Card has already been approved and issued for this application.');
        }

        if (status !== 'pending_approval' && status !== 'submitted') {
          throw new Error(`Transaction Blocked: Application status must be PENDING_APPROVAL. Current status is "${status}".`);
        }

        const patientId = `lmdx-p-${Math.floor(1000 + Math.random() * 9000)}`;
        const cardId = `card_${Math.floor(1000 + Math.random() * 9000)}`;
        const cardNumber = `LHC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
        const cvv = String(Math.floor(100 + Math.random() * 900));
        const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const now = new Date().toISOString();
        const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const patientRef = doc(db, 'patients', patientId);
        const cardRef = doc(db, 'cards', cardId);
        const walletRef = doc(db, 'wallets', `wal_${patientId}`);

        const newPatient = {
          id: patientId,
          fullName: appData.fullName,
          dob: appData.dob || '1995-01-01',
          age: appData.age || 30,
          gender: appData.gender || 'male',
          mobile: appData.mobile,
          whatsapp: appData.whatsapp || appData.mobile,
          email: appData.email || `${appData.mobile}@labmedix.org`,
          bloodGroup: appData.bloodGroup || 'O+',
          photoUrl: appData.photoUrl || '/logo.jpg',
          address: appData.address || { villageArea: '', postOffice: '', policeStation: '', district: '', state: '', pinCode: '', fullAddress: '' },
          emergencyContact: appData.emergencyContact || { name: '', relation: '', phone: '' },
          medicalInfo: appData.medicalInfo || { chronicConditions: [], allergies: [], regularMedications: [] },
          healthCardId: cardId,
          membershipId: appData.membershipId || 'silver',
          status: 'active',
          createdAt: now,
          updatedAt: now
        };

        const newCard = {
          id: cardId,
          cardNumber,
          patientId,
          membershipId: appData.membershipId || 'silver',
          issueDate: now.split('T')[0],
          expiryDate,
          status: 'active',
          cvv,
          verificationCode,
          designConfig: appData.cardThemeConfig || { theme: 'emerald_health', material: 'gloss_pvc' },
          statusHistory: [
            {
              id: 'hist_' + Math.random().toString(36).substring(2, 8),
              cardId,
              date: now,
              previousStatus: 'pending_approval',
              newStatus: 'active',
              changedBy: approvedBy,
              reason: `Atomic Firestore transaction: Approved card application ${appData.trackingId}`
            }
          ],
          createdAt: now,
          updatedAt: now
        };

        const newWallet = {
          id: `wal_${patientId}`,
          patientId,
          balance: appData.initialDeposit || 0,
          status: 'active',
          transactions: appData.initialDeposit ? [
            {
              id: 'txn_' + Math.random().toString(36).substring(2, 8),
              walletId: `wal_${patientId}`,
              patientId,
              type: 'credit',
              amount: appData.initialDeposit,
              category: 'initial_deposit',
              description: 'Initial Wallet Opening Balance upon Card Approval',
              referenceNo: appData.trackingId,
              balanceAfter: appData.initialDeposit,
              createdBy: approvedBy,
              createdAt: now
            }
          ] : [],
          createdAt: now,
          updatedAt: now
        };

        const updatedApp = {
          ...appData,
          status: 'approved',
          paymentStatus: 'paid',
          approvedPatientId: patientId,
          approvedCardNumber: cardNumber,
          approvedBy,
          approvedAt: now,
          updatedAt: now,
          processingHistory: [
            {
              id: 'hist_' + Math.random().toString(36).substring(2, 8),
              date: now,
              status: 'approved',
              title: 'Atomic Firestore Transaction Approved & Card Minted',
              note: `Verified PENDING_APPROVAL status. Minted Card ${cardNumber} [Patient ID: ${patientId}].`,
              actor: approvedBy
            },
            ...(appData.processingHistory || [])
          ]
        };

        transaction.set(patientRef, newPatient);
        transaction.set(cardRef, newCard);
        transaction.set(walletRef, newWallet);
        transaction.set(appRef, updatedApp, { merge: true });

        return { success: true, application: updatedApp, patient: newPatient, card: newCard };
      });

      return result;
    } catch (error: any) {
      console.error('Atomic approval transaction error:', error);
      return { success: false, error: error.message || 'Transaction failed' };
    }
  }
}
