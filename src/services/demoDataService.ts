import { StorageService, STORAGE_KEYS } from './storage';
import { ApiSyncService } from './apiSyncService';
import { AuditService } from './auditService';
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
    const id = (patient.id || '').trim().toLowerCase();
    const name = (patient.fullName || '').trim().toLowerCase();
    const mobile = (patient.mobile || '').trim();

    return (
      DemoDataService.DEMO_PATIENT_IDS.includes(id) ||
      DemoDataService.DEMO_NAMES.some(dn => name.includes(dn)) ||
      mobile === '+91 98300 12345' ||
      mobile === '9830012345' ||
      (patient as any).isDemo === true
    );
  }

  public static isDemoCard(card: HealthCard): boolean {
    if (!card) return false;
    const id = (card.id || '').trim().toLowerCase();
    const cardNo = (card.cardNumber || '').trim().toLowerCase();
    const patientId = (card.patientId || '').trim().toLowerCase();

    return (
      DemoDataService.DEMO_CARD_NUMBERS.includes(cardNo) ||
      DemoDataService.DEMO_CARD_NUMBERS.includes(id) ||
      DemoDataService.DEMO_PATIENT_IDS.includes(patientId) ||
      (card as any).isDemo === true
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
      let totalRemoved = 0;

      onProgress?.({ stage: 'Scanning demo items across database collections...', percent: 15, itemsRemoved: 0, completed: false });

      const allPatients = StorageService.getPatients();
      const demoPatients = allPatients.filter(p => this.isDemoPatient(p));
      const demoPatientIds = new Set(demoPatients.map(p => p.id.toLowerCase()));
      const livePatients = allPatients.filter(p => !this.isDemoPatient(p));
      totalRemoved += (allPatients.length - livePatients.length);

      onProgress?.({ stage: 'Purging demo patient profiles and syncing to cloud...', percent: 35, itemsRemoved: totalRemoved, completed: false });
      StorageService.savePatients(livePatients);

      // Cards
      const allCards = StorageService.getCards();
      const liveCards = allCards.filter(c => !this.isDemoCard(c) && !demoPatientIds.has((c.patientId || '').toLowerCase()));
      totalRemoved += (allCards.length - liveCards.length);
      StorageService.saveCards(liveCards);

      // Wallets
      const allWallets = StorageService.getWallets();
      const liveWallets = allWallets.filter(w => !demoPatientIds.has((w.patientId || '').toLowerCase()));
      totalRemoved += (allWallets.length - liveWallets.length);
      StorageService.saveWallets(liveWallets);

      // Transactions
      const allTxns = StorageService.getTransactions();
      const liveTxns = allTxns.filter(t => !demoPatientIds.has((t.patientId || '').toLowerCase()));
      totalRemoved += (allTxns.length - liveTxns.length);
      StorageService.saveTransactions(liveTxns);

      onProgress?.({ stage: 'Purging demo appointments, EMR records & lab bookings...', percent: 65, itemsRemoved: totalRemoved, completed: false });

      // Appointments
      const allApps = StorageService.getItem<any[]>(STORAGE_KEYS.APPOINTMENTS, []);
      const liveApps = allApps.filter(a => !demoPatientIds.has((a.patientId || '').toLowerCase()));
      totalRemoved += (allApps.length - liveApps.length);
      StorageService.setItem(STORAGE_KEYS.APPOINTMENTS, liveApps);
      ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.APPOINTMENTS, liveApps).catch(() => {});

      // EMR Encounters
      const allEncs = StorageService.getItem<any[]>(STORAGE_KEYS.EMR_ENCOUNTERS, []);
      const liveEncs = allEncs.filter(e => !demoPatientIds.has((e.patientId || '').toLowerCase()));
      totalRemoved += (allEncs.length - liveEncs.length);
      StorageService.setItem(STORAGE_KEYS.EMR_ENCOUNTERS, liveEncs);
      ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.EMR_ENCOUNTERS, liveEncs).catch(() => {});

      // Portal Lab Bookings
      const allBookings = StorageService.getItem<any[]>(STORAGE_KEYS.PORTAL_LAB_BOOKINGS, []);
      const liveBookings = allBookings.filter(b => !demoPatientIds.has((b.patientId || '').toLowerCase()) && (!b.patientName || !DemoDataService.DEMO_NAMES.some(dn => b.patientName.toLowerCase().includes(dn))));
      totalRemoved += (allBookings.length - liveBookings.length);
      StorageService.setItem(STORAGE_KEYS.PORTAL_LAB_BOOKINGS, liveBookings);
      ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.PORTAL_LAB_BOOKINGS, liveBookings).catch(() => {});

      // Portal Pharmacy Orders
      const allOrders = StorageService.getItem<any[]>(STORAGE_KEYS.PORTAL_PHARMACY_ORDERS, []);
      const liveOrders = allOrders.filter(o => !demoPatientIds.has((o.patientId || '').toLowerCase()));
      totalRemoved += (allOrders.length - liveOrders.length);
      StorageService.setItem(STORAGE_KEYS.PORTAL_PHARMACY_ORDERS, liveOrders);
      ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.PORTAL_PHARMACY_ORDERS, liveOrders).catch(() => {});

      // Portal Card Applications
      const allCardApps = StorageService.getItem<any[]>(STORAGE_KEYS.PORTAL_CARD_APPLICATIONS, []);
      const liveCardApps = allCardApps.filter(ca => !demoPatientIds.has((ca.patientId || '').toLowerCase()) && (!ca.fullName || !DemoDataService.DEMO_NAMES.some(dn => ca.fullName.toLowerCase().includes(dn))));
      totalRemoved += (allCardApps.length - liveCardApps.length);
      StorageService.setItem(STORAGE_KEYS.PORTAL_CARD_APPLICATIONS, liveCardApps);
      ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.PORTAL_CARD_APPLICATIONS, liveCardApps).catch(() => {});

      onProgress?.({ stage: 'Synchronizing clean database state across all devices...', percent: 85, itemsRemoved: totalRemoved, completed: false });

      // Force write to IndexedDB & emit sync event
      await StorageService.forceSyncToIndexedDB();
      window.dispatchEvent(new CustomEvent('labmedix_data_synced', { detail: { action: 'DEMO_PURGED', totalRemoved } }));

      // Audit Log
      AuditService.log(
        'DEMO_DATA_PURGED',
        'security',
        `Super Admin executed 1-Click Demo Data Purge. Permanently removed ${totalRemoved} demo records across all modules.`
      );

      onProgress?.({ stage: 'Demo data successfully removed!', percent: 100, itemsRemoved: totalRemoved, completed: true });

      return {
        success: true,
        totalRemoved,
        message: `Successfully purged ${totalRemoved} demo records across all portals and synchronized in real time.`
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
      onProgress?.({ stage: 'Initiating Factory Reset...', percent: 20, itemsRemoved: 0, completed: false });

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
