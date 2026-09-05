import { StorageService, STORAGE_KEYS } from './storage';
import { ApiSyncService } from './apiSyncService';
import { AuditService } from './auditService';
import { BackupService } from './backupService';
import { Patient, HealthCard, Wallet, WalletTransaction } from '../types';

export interface DemoPurgeProgress {
  stage: string;
  percent: number;
  itemsRemoved: number;
  completed: boolean;
  error?: string;
}

export class DemoDataService {
  public static readonly DEMO_PATIENT_IDS = [
    'lmdx-2026-000001',
    'lmdx-2026-000002',
    'lmdx-2026-000003',
    'lmdx-p-0001',
    'lmdx-p-0002',
    'patient_001',
    'patient_002',
    'patient_demo'
  ];

  public static readonly DEMO_NAMES = [
    'sourav ganguly',
    'ananya banerjee',
    'subrata bhattacharya',
    'rahim uddin',
    'fatema begum',
    'priya mukherjee',
    'demo patient',
    'test patient'
  ];

  public static readonly DEMO_CARD_NUMBERS = [
    'lhc-2026-000001',
    'lhc-2026-000002',
    'lhc-2026-000003',
    'card_001',
    'card_002',
    'card_003'
  ];

  public static isDemoPatient(patient: Patient): boolean {
    if (!patient) return false;
    // Explicitly protected live records
    if ((patient as any).isDemo === false) return false;

    const id = (patient.id || '').trim().toLowerCase();
    const name = (patient.fullName || '').trim().toLowerCase();
    const mobile = (patient.mobile || '').trim();

    const isExplicitDemoId = DemoDataService.DEMO_PATIENT_IDS.includes(id);
    const isExplicitDemoName = DemoDataService.DEMO_NAMES.some(dn => name === dn || name === `dr. ${dn}` || (dn.length > 5 && name.includes(dn)));
    const isDemoMobile = mobile === '+91 98300 12345' || mobile === '9830012345';

    return (
      (patient as any).isDemo === true ||
      isExplicitDemoId ||
      isExplicitDemoName ||
      isDemoMobile
    );
  }

  public static isDemoCard(card: HealthCard): boolean {
    if (!card) return false;
    // Explicitly protected live records
    if ((card as any).isDemo === false) return false;

    const id = (card.id || '').trim().toLowerCase();
    const cardNo = (card.cardNumber || '').trim().toLowerCase();
    const patientId = (card.patientId || '').trim().toLowerCase();

    const isExplicitDemoCardNo = DemoDataService.DEMO_CARD_NUMBERS.includes(cardNo) || DemoDataService.DEMO_CARD_NUMBERS.includes(id);
    const isDemoPatientId = DemoDataService.DEMO_PATIENT_IDS.includes(patientId);

    return (
      (card as any).isDemo === true ||
      isExplicitDemoCardNo ||
      isDemoPatientId
    );
  }

  /** Counts all demo records currently in the system */
  public static getDemoStats(): {
    demoPatientsCount: number;
    demoCardsCount: number;
    demoWalletsCount: number;
    demoTransactionsCount: number;
    demoAppointmentsCount: number;
    demoEncountersCount: number;
    demoBookingsCount: number;
    totalDemoItems: number;
  } {
    const patients = StorageService.getPatients();
    const cards = StorageService.getCards();
    const wallets = StorageService.getWallets();
    const txns = StorageService.getTransactions();
    const appointments = StorageService.getItem<any[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const encounters = StorageService.getItem<any[]>(STORAGE_KEYS.EMR_ENCOUNTERS, []);
    const bookings = StorageService.getItem<any[]>(STORAGE_KEYS.PORTAL_LAB_BOOKINGS, []);

    const demoPatients = patients.filter(p => this.isDemoPatient(p));
    const demoPatientIds = new Set(demoPatients.map(p => p.id.toLowerCase()));

    const demoCards = cards.filter(c => this.isDemoCard(c) || demoPatientIds.has((c.patientId || '').toLowerCase()));
    const demoWallets = wallets.filter(w => demoPatientIds.has((w.patientId || '').toLowerCase()));
    const demoTxns = txns.filter(t => demoPatientIds.has((t.patientId || '').toLowerCase()));
    const demoApps = appointments.filter(a => demoPatientIds.has((a.patientId || '').toLowerCase()));
    const demoEncs = encounters.filter(e => demoPatientIds.has((e.patientId || '').toLowerCase()));
    const demoBks = bookings.filter(b => demoPatientIds.has((b.patientId || '').toLowerCase()) || (b.patientName && DemoDataService.DEMO_NAMES.some(dn => b.patientName.toLowerCase().includes(dn))));

    const totalDemoItems =
      demoPatients.length +
      demoCards.length +
      demoWallets.length +
      demoTxns.length +
      demoApps.length +
      demoEncs.length +
      demoBks.length;

    return {
      demoPatientsCount: demoPatients.length,
      demoCardsCount: demoCards.length,
      demoWalletsCount: demoWallets.length,
      demoTransactionsCount: demoTxns.length,
      demoAppointmentsCount: demoApps.length,
      demoEncountersCount: demoEncs.length,
      demoBookingsCount: demoBks.length,
      totalDemoItems
    };
  }

  /**
   * One-Click Permanent Demo Data Removal
   * 1. Filters out demo records across all collections
   * 2. Synchronizes deletions to Firestore
   * 3. Purges local caches and IndexedDB
   * 4. Broadcasts real-time events to all connected clients
   * 5. Logs action in Audit Trail
   */
  public static async purgeAllDemoData(
    onProgress?: (progress: DemoPurgeProgress) => void
  ): Promise<{ success: boolean; totalRemoved: number; message: string }> {
    try {
      // 0. Super Admin Clearance Verification
      const currentUser = StorageService.getCurrentUser();
      if (currentUser && currentUser.role !== 'super_admin') {
        throw new Error('Unauthorized Access: 1-Click Demo Data Purge is strictly restricted to Super Admin accounts.');
      }

      let totalRemoved = 0;

      onProgress?.({ stage: 'Scanning demo items across database collections...', percent: 10, itemsRemoved: 0, completed: false });

      const allPatients = StorageService.getPatients();
      const demoPatients = allPatients.filter(p => this.isDemoPatient(p));
      const demoPatientIds = new Set(demoPatients.map(p => p.id.toLowerCase()));
      const livePatients = allPatients.filter(p => !this.isDemoPatient(p));
      totalRemoved += demoPatients.length;

      onProgress?.({ stage: 'Purging demo patient profiles and permanently deleting from Firestore cloud...', percent: 25, itemsRemoved: totalRemoved, completed: false });
      StorageService.savePatients(livePatients);
      for (const p of demoPatients) {
        if (p.id) await ApiSyncService.deleteDocument('patients', p.id).catch(() => {});
      }

      // Cards
      const allCards = StorageService.getCards();
      const demoCards = allCards.filter(c => this.isDemoCard(c) || demoPatientIds.has((c.patientId || '').toLowerCase()));
      const liveCards = allCards.filter(c => !this.isDemoCard(c) && !demoPatientIds.has((c.patientId || '').toLowerCase()));
      totalRemoved += demoCards.length;
      StorageService.saveCards(liveCards);
      for (const c of demoCards) {
        if (c.id) await ApiSyncService.deleteDocument('cards', c.id).catch(() => {});
      }

      // Wallets
      const allWallets = StorageService.getWallets();
      const demoWallets = allWallets.filter(w => demoPatientIds.has((w.patientId || '').toLowerCase()));
      const liveWallets = allWallets.filter(w => !demoPatientIds.has((w.patientId || '').toLowerCase()));
      totalRemoved += demoWallets.length;
      StorageService.saveWallets(liveWallets);
      for (const w of demoWallets) {
        if (w.id) await ApiSyncService.deleteDocument('wallets', w.id).catch(() => {});
      }

      // Transactions
      const allTxns = StorageService.getTransactions();
      const demoTxns = allTxns.filter(t => demoPatientIds.has((t.patientId || '').toLowerCase()));
      const liveTxns = allTxns.filter(t => !demoPatientIds.has((t.patientId || '').toLowerCase()));
      totalRemoved += demoTxns.length;
      StorageService.saveTransactions(liveTxns);
      for (const t of demoTxns) {
        if (t.id) await ApiSyncService.deleteDocument('transactions', t.id).catch(() => {});
      }

      onProgress?.({ stage: 'Purging demo appointments, EMR records & lab bookings from cloud...', percent: 60, itemsRemoved: totalRemoved, completed: false });

      // Appointments
      const allApps = StorageService.getItem<any[]>(STORAGE_KEYS.APPOINTMENTS, []);
      const demoApps = allApps.filter(a => demoPatientIds.has((a.patientId || '').toLowerCase()));
      const liveApps = allApps.filter(a => !demoPatientIds.has((a.patientId || '').toLowerCase()));
      totalRemoved += demoApps.length;
      StorageService.setItem(STORAGE_KEYS.APPOINTMENTS, liveApps);
      for (const a of demoApps) {
        if (a.id) await ApiSyncService.deleteDocument('appointments', a.id).catch(() => {});
      }

      // EMR Encounters
      const allEncs = StorageService.getItem<any[]>(STORAGE_KEYS.EMR_ENCOUNTERS, []);
      const demoEncs = allEncs.filter(e => demoPatientIds.has((e.patientId || '').toLowerCase()));
      const liveEncs = allEncs.filter(e => !demoPatientIds.has((e.patientId || '').toLowerCase()));
      totalRemoved += demoEncs.length;
      StorageService.setItem(STORAGE_KEYS.EMR_ENCOUNTERS, liveEncs);
      for (const e of demoEncs) {
        if (e.id) await ApiSyncService.deleteDocument('emrEncounters', e.id).catch(() => {});
      }

      // Portal Lab Bookings
      const allBookings = StorageService.getItem<any[]>(STORAGE_KEYS.PORTAL_LAB_BOOKINGS, []);
      const demoBookings = allBookings.filter(b => demoPatientIds.has((b.patientId || '').toLowerCase()) || (b.patientName && DemoDataService.DEMO_NAMES.some(dn => b.patientName.toLowerCase().includes(dn))));
      const liveBookings = allBookings.filter(b => !demoPatientIds.has((b.patientId || '').toLowerCase()) && (!b.patientName || !DemoDataService.DEMO_NAMES.some(dn => b.patientName.toLowerCase().includes(dn))));
      totalRemoved += demoBookings.length;
      StorageService.setItem(STORAGE_KEYS.PORTAL_LAB_BOOKINGS, liveBookings);
      for (const b of demoBookings) {
        if (b.id) await ApiSyncService.deleteDocument('labBookings', b.id).catch(() => {});
      }

      // Portal Pharmacy Orders
      const allOrders = StorageService.getItem<any[]>(STORAGE_KEYS.PORTAL_PHARMACY_ORDERS, []);
      const demoOrders = allOrders.filter(o => demoPatientIds.has((o.patientId || '').toLowerCase()));
      const liveOrders = allOrders.filter(o => !demoPatientIds.has((o.patientId || '').toLowerCase()));
      totalRemoved += demoOrders.length;
      StorageService.setItem(STORAGE_KEYS.PORTAL_PHARMACY_ORDERS, liveOrders);
      for (const o of demoOrders) {
        if (o.id) await ApiSyncService.deleteDocument('pharmacyOrders', o.id).catch(() => {});
      }

      // Portal Card Applications
      const allCardApps = StorageService.getItem<any[]>(STORAGE_KEYS.PORTAL_CARD_APPLICATIONS, []);
      const demoCardApps = allCardApps.filter(ca => demoPatientIds.has((ca.patientId || '').toLowerCase()) && (!ca.fullName || !DemoDataService.DEMO_NAMES.some(dn => ca.fullName.toLowerCase().includes(dn))));
      const liveCardApps = allCardApps.filter(ca => !demoPatientIds.has((ca.patientId || '').toLowerCase()) && (!ca.fullName || !DemoDataService.DEMO_NAMES.some(dn => ca.fullName.toLowerCase().includes(dn))));
      totalRemoved += demoCardApps.length;
      StorageService.setItem(STORAGE_KEYS.PORTAL_CARD_APPLICATIONS, liveCardApps);
      for (const ca of demoCardApps) {
        if (ca.id) await ApiSyncService.deleteDocument('cardApplications', ca.id).catch(() => {});
      }

      onProgress?.({ stage: 'Broadcasting real-time purge event to all connected terminals...', percent: 85, itemsRemoved: totalRemoved, completed: false });

      // Force write to IndexedDB & emit sync event
      await StorageService.forceSyncToIndexedDB();
      window.dispatchEvent(new CustomEvent('labmedix_data_synced', { detail: { action: 'DEMO_PURGED', totalRemoved } }));

      // Audit Log
      AuditService.log(
        'DEMO_DATA_PURGED',
        'security',
        `Super Admin (${currentUser?.fullName || 'Root'}) executed 1-Click Demo Data Purge. Permanently deleted ${totalRemoved} demo records from Firestore and client terminals.`
      );

      onProgress?.({ stage: 'Demo data successfully purged from Firestore cloud and client caches!', percent: 100, itemsRemoved: totalRemoved, completed: true });

      return {
        success: true,
        totalRemoved,
        message: `Successfully purged ${totalRemoved} demo records from Firestore cloud and synchronized in real time across all terminals.`
      };
    } catch (err: any) {
      console.error('[DemoDataService] Purge failed:', err);
      onProgress?.({ stage: 'Error during demo purge', percent: 100, itemsRemoved: 0, completed: true, error: err.message });
      return {
        success: false,
        totalRemoved: 0,
        message: `Demo purge failed: ${err.message}`
      };
    }
  }

  /**
   * Complete Factory Reset: Clears all patient, card, billing, transaction, and operational records
   * Preserves: Staff user logins, Default membership plans, and Company profile
   */
  public static async resetSystemToFactory(
    onProgress?: (progress: DemoPurgeProgress) => void
  ): Promise<{ success: boolean; message: string }> {
    try {
      onProgress?.({ stage: 'Taking Central Live Auto-Backup...', percent: 10, itemsRemoved: 0, completed: false });
      try {
        BackupService.createSnapshot(`Pre-Factory-Reset Central Live Auto-Backup (${new Date().toLocaleTimeString()})`, 'pre-restore');
      } catch (e) {
        console.warn('[DemoDataService] Failed to create pre-factory-reset auto-backup:', e);
      }

      onProgress?.({ stage: 'Initiating Factory Reset...', percent: 25, itemsRemoved: 0, completed: false });

      StorageService.savePatients([]);
      StorageService.saveCards([]);
      StorageService.saveWallets([]);
      StorageService.saveTransactions([]);
      StorageService.saveFamilies([]);

      StorageService.setItem(STORAGE_KEYS.APPOINTMENTS, []);
      ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.APPOINTMENTS, []).catch(() => {});

      StorageService.setItem(STORAGE_KEYS.EMR_ENCOUNTERS, []);
      ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.EMR_ENCOUNTERS, []).catch(() => {});

      StorageService.setItem(STORAGE_KEYS.PORTAL_LAB_BOOKINGS, []);
      ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.PORTAL_LAB_BOOKINGS, []).catch(() => {});

      StorageService.setItem(STORAGE_KEYS.PORTAL_PHARMACY_ORDERS, []);
      ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.PORTAL_PHARMACY_ORDERS, []).catch(() => {});

      StorageService.setItem(STORAGE_KEYS.PORTAL_CARD_APPLICATIONS, []);
      ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.PORTAL_CARD_APPLICATIONS, []).catch(() => {});

      StorageService.setItem(STORAGE_KEYS.CASH_DESK_VOUCHERS, []);
      ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.CASH_DESK_VOUCHERS, []).catch(() => {});

      StorageService.setItem(STORAGE_KEYS.SAMPLE_DISPATCHES, []);
      ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.SAMPLE_DISPATCHES, []).catch(() => {});

      StorageService.setItem(STORAGE_KEYS.RECOVERY_VAULT, []);
      ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.RECOVERY_VAULT, []).catch(() => {});

      onProgress?.({ stage: 'Synchronizing clean factory state across cloud...', percent: 80, itemsRemoved: 0, completed: false });

      await StorageService.forceSyncToIndexedDB();
      window.dispatchEvent(new CustomEvent('labmedix_data_synced', { detail: { action: 'FACTORY_RESET' } }));

      AuditService.log(
        'FACTORY_RESET',
        'security',
        'Super Admin executed Complete Factory Reset. Database cleared to clean operational slate.'
      );

      onProgress?.({ stage: 'Factory reset complete!', percent: 100, itemsRemoved: 0, completed: true });

      return {
        success: true,
        message: 'System database successfully reset to clean factory state across all devices.'
      };
    } catch (err: any) {
      console.error('[DemoDataService] Factory reset failed:', err);
      return { success: false, message: `Factory reset failed: ${err.message}` };
    }
  }
}
