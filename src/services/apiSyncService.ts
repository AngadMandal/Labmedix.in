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
  public static async saveDocument<T extends { id?: string }>(collectionName: string, id: string, data: T): Promise<boolean> {
    try {
      const docRef = doc(db, collectionName, id);
      const sanitized = JSON.parse(JSON.stringify(data));
      await setDoc(docRef, {
        ...sanitized,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return true;
    } catch (error) {
      console.warn(`[ApiSync] Firestore sync notice for ${collectionName}/${id} (Operating offline or permission restricted):`, error);
      return false;
    }
  }

  /** Generic delete document from Firestore */
  public static async deleteDocument(collectionName: string, id: string): Promise<boolean> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.warn(`[ApiSync] Firestore delete notice for ${collectionName}/${id}:`, error);
      return false;
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
  private static KEY_TO_FIRESTORE_MAP: Record<string, { type: 'collection' | 'doc'; path: string }> = {
    'labmedix_users_v1': { type: 'collection', path: 'users' },
    'labmedix_patients_v1': { type: 'collection', path: 'patients' },
    'labmedix_cards_v1': { type: 'collection', path: 'cards' },
    'labmedix_memberships_v1': { type: 'collection', path: 'memberships' },
    'labmedix_families_v1': { type: 'collection', path: 'families' },
    'labmedix_wallets_v1': { type: 'collection', path: 'wallets' },
    'labmedix_transactions_v1': { type: 'collection', path: 'transactions' },
    'labmedix_audit_logs_v1': { type: 'collection', path: 'auditLogs' },
    'labmedix_clinical_encounters': { type: 'collection', path: 'emrEncounters' },
    'labmedix_patient_appointments_v1': { type: 'collection', path: 'appointments' },
    'labmedix_doctor_master_records_v1': { type: 'collection', path: 'doctors' },
    'labmedix_doctor_commission_payouts_v1': { type: 'collection', path: 'doctorPayouts' },
    'LABMEDIX_TEST_MASTER_LIST': { type: 'collection', path: 'labTests' },
    'LABMEDIX_HEALTH_PACKAGES_LIST': { type: 'collection', path: 'healthPackages' },
    'labmedix_portal_lab_bookings_v1': { type: 'collection', path: 'labBookings' },
    'labmedix_portal_pharmacy_orders_v1': { type: 'collection', path: 'pharmacyOrders' },
    'labmedix_portal_card_applications_v1': { type: 'collection', path: 'cardApplications' },
    'LABMEDIX_CASH_DESK_VOUCHERS_V1': { type: 'collection', path: 'vouchers' },
    'labmedix_sample_dispatches_v1': { type: 'collection', path: 'sampleDispatches' },
    'labmedix_recovery_vault_v1': { type: 'collection', path: 'recoveryVault' },
    'labmedix_company_profile_v1': { type: 'doc', path: 'settings/companyProfile' },
    'LABMEDIX_WEBSITE_CMS_CONFIG': { type: 'doc', path: 'settings/websiteCms' },
    'labmedix_integrations_v4': { type: 'doc', path: 'settings/integrations' }
  };

  /** Dynamically sync any STORAGE_KEY value to Firestore */
  public static async syncKeyToFirestore(key: string, value: any): Promise<void> {
    const config = this.KEY_TO_FIRESTORE_MAP[key];
    if (!config || value === undefined || value === null) return;

    try {
      if (config.type === 'collection' && Array.isArray(value)) {
        const newIdsSet = new Set<string>();
        for (const item of value) {
          if (item && item.id) {
            newIdsSet.add(String(item.id));
            await this.saveDocument(config.path, String(item.id), item);
          }
        }

        // Clean up orphaned documents in Firestore that were deleted locally
        try {
          const snapshot = await getDocs(query(collection(db, config.path)));
          const deletePromises: Promise<void>[] = [];
          snapshot.forEach((docSnap) => {
            if (!newIdsSet.has(docSnap.id)) {
              deletePromises.push(deleteDoc(doc(db, config.path, docSnap.id)));
            }
          });
          if (deletePromises.length > 0) {
            await Promise.all(deletePromises);
            console.info(`[ApiSync] Removed ${deletePromises.length} deleted items from Firestore ${config.path}`);
          }
        } catch (delErr) {
          console.warn(`[ApiSync] Cleanup deleted docs error for ${config.path}:`, delErr);
        }
      } else if (config.type === 'doc' && typeof value === 'object') {
        const docRef = doc(db, config.path);
        const sanitized = JSON.parse(JSON.stringify(value));
        await setDoc(docRef, { ...sanitized, updatedAt: new Date().toISOString() }, { merge: true });
      }
    } catch (e) {
      console.warn(`[ApiSync] Firestore sync failed for ${key}:`, e);
    }
  }

  /** Subscribe to all Firestore collections for real-time second-by-second multi-device sync */
  public static subscribeToAll(onUpdate: (key: string, value: any) => void): () => void {
    const unsubs: (() => void)[] = [];

    for (const [key, config] of Object.entries(this.KEY_TO_FIRESTORE_MAP)) {
      try {
        if (config.type === 'collection') {
          const q = query(collection(db, config.path));
          const unsub = onSnapshot(q, (snapshot) => {
            const items: any[] = [];
            snapshot.forEach((docSnap) => {
              items.push({ id: docSnap.id, ...docSnap.data() });
            });
            onUpdate(key, items);
          }, (err) => {
            console.warn(`[ApiSync] Realtime subscription error on ${config.path}:`, err);
          });
          unsubs.push(unsub);
        } else if (config.type === 'doc') {
          const docRef = doc(db, config.path);
          const unsub = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              onUpdate(key, docSnap.data());
            }
          }, (err) => {
            console.warn(`[ApiSync] Realtime doc subscription error on ${config.path}:`, err);
          });
          unsubs.push(unsub);
        }
      } catch (e) {
        console.warn(`[ApiSync] Failed to subscribe to ${config.path}:`, e);
      }
    }

    return () => {
      unsubs.forEach(u => u());
    };
  }

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

  /** 🔄 Real-Time Multi-Device Cloud Sync Engine: Keeps all devices synchronized in 1 unified cloud store */
  public static initLiveCloudListeners(onDataSynced?: (collectionName: string, items: any[]) => void): () => void {
    const unsubscribers: (() => void)[] = [];

    const syncTargets = [
      { col: 'patients', storageKey: 'labmedix_patients_v1' },
      { col: 'cards', storageKey: 'labmedix_cards_v1' },
      { col: 'wallets', storageKey: 'labmedix_wallets_v1' },
      { col: 'transactions', storageKey: 'labmedix_transactions_v1' },
      { col: 'vouchers', storageKey: 'LABMEDIX_CASH_DESK_VOUCHERS_V1' },
      { col: 'auditLogs', storageKey: 'labmedix_audit_logs_v1' },
      { col: 'families', storageKey: 'labmedix_families_v1' },
      { col: 'memberships', storageKey: 'labmedix_memberships_v1' }
    ];

    for (const target of syncTargets) {
      try {
        const unsub = this.subscribeToCollection<any>(target.col, (items) => {
          if (items && items.length > 0) {
            try {
              localStorage.setItem(target.storageKey, JSON.stringify(items));
              if (onDataSynced) onDataSynced(target.col, items);
            } catch (e) {
              console.warn(`[ApiSync] Failed to update local storage for ${target.col}:`, e);
            }
          }
        });
        unsubscribers.push(unsub);
      } catch (e) {
        console.warn(`[ApiSync] Failed to setup live listener for ${target.col}:`, e);
      }
    }

    return () => {
      for (const unsub of unsubscribers) {
        try { unsub(); } catch {}
      }
    };
  }

  /** ⚡ Advanced Background Worker Queue & Automated Timeline Sync Engine */
  private static workerQueue: Array<{ collection: string; id: string; data: any; retries: number }> = [];
  private static workerRunning = false;
  private static lastTimelineSyncTime = new Date().toISOString();
  private static processedQueueCount = 0;

  public static enqueueWorkerTask(collection: string, id: string, data: any) {
    this.workerQueue.push({ collection, id, data, retries: 0 });
    this.triggerWorkerExecution();
  }

  public static async triggerWorkerExecution(): Promise<void> {
    if (this.workerRunning || this.workerQueue.length === 0) return;
    this.workerRunning = true;

    while (this.workerQueue.length > 0) {
      const task = this.workerQueue.shift();
      if (!task) break;

      try {
        const success = await this.saveDocument(task.collection, task.id, task.data);
        if (success) {
          this.processedQueueCount++;
          this.lastTimelineSyncTime = new Date().toISOString();
        } else {
          throw new Error('Save returned false status');
        }
      } catch (err) {
        if (task.retries < 5) {
          task.retries++;
          const backoffMs = Math.pow(2, task.retries) * 1000 + Math.random() * 500; // Exponential backoff with jitter
          console.warn(`[BackgroundWorker] Task failed for ${task.collection}/${task.id} (Attempt ${task.retries}/5). Retrying in ${Math.round(backoffMs)}ms...`);
          
          // Wait for backoff duration before re-queuing or delaying next run
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          this.workerQueue.push(task);
        } else {
          console.error(`[BackgroundWorker] Task permanently failed after 5 retries for ${task.collection}/${task.id}:`, err);
        }
      }
    }

    this.workerRunning = false;
  }

  public static getWorkerMetrics() {
    return {
      pendingQueueSize: this.workerQueue.length,
      processedCount: this.processedQueueCount,
      lastSyncTime: this.lastTimelineSyncTime,
      isWorking: this.workerRunning,
      projectId: "gen-lang-client-0076489895",
      databaseId: "ai-studio-labmedixautoheal-1ac13548-bbcc-4f91-96bd-c8c990bec0c8"
    };
  }
}

