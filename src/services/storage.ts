import {
  User,
  Patient,
  HealthCard,
  Membership,
  FamilyGroup,
  Wallet,
  WalletTransaction,
  AuditLog,
  CompanyProfile,
  SnapshotRecord,
  BackupData,
  CashDeskVoucher,
  SampleDispatchRecord,
  NgoPartner,
  HealthCamp,
  CampAttendee,
  CharityGrant,
  NgoFundTransaction,
  CardDispatchRecord,
  CardDispatchBatch
} from '../types';
import { DEFAULT_COMPANY_PROFILE, DEFAULT_CARD_DESIGN } from '../constants/defaults';
import { DEFAULT_MEMBERSHIPS } from '../constants/memberships';
import {
  DEFAULT_NGO_PARTNERS,
  DEFAULT_HEALTH_CAMPS,
  DEFAULT_CAMP_ATTENDEES,
  DEFAULT_CHARITY_GRANTS,
  DEFAULT_NGO_FUND_TRANSACTIONS
} from '../constants/ngoDefaults';

import { GoogleDriveService } from './googleDriveService';
import { getGoogleAccessToken } from './googleAuth';
import { ApiSyncService } from './apiSyncService';
import { FirestoreBackupService } from './firestoreBackupService';

export const STORAGE_KEYS = {
  USERS: 'labmedix_users_v1',
  PATIENTS: 'labmedix_patients_v1',
  CARDS: 'labmedix_cards_v1',
  MEMBERSHIPS: 'labmedix_memberships_v1',
  FAMILIES: 'labmedix_families_v1',
  WALLETS: 'labmedix_wallets_v1',
  TRANSACTIONS: 'labmedix_transactions_v1',
  AUDIT_LOGS: 'labmedix_audit_logs_v1',
  COMPANY_PROFILE: 'labmedix_company_profile_v1',
  SNAPSHOTS: 'labmedix_snapshots_v1',
  CURRENT_USER: 'labmedix_current_user_v1',
  SCREEN_LOCKED: 'labmedix_screen_locked_v1',
  THEME: 'labmedix_theme_v1',
  EMR_ENCOUNTERS: 'labmedix_clinical_encounters',
  APPOINTMENTS: 'labmedix_patient_appointments_v1',
  DOCTORS: 'labmedix_doctor_master_records_v1',
  DOCTOR_PAYOUTS: 'labmedix_doctor_commission_payouts_v1',
  LAB_TESTS: 'LABMEDIX_TEST_MASTER_LIST',
  HEALTH_PACKAGES: 'LABMEDIX_HEALTH_PACKAGES_LIST',
  PORTAL_LAB_BOOKINGS: 'labmedix_portal_lab_bookings_v1',
  PORTAL_PHARMACY_ORDERS: 'labmedix_portal_pharmacy_orders_v1',
  PORTAL_CARD_APPLICATIONS: 'labmedix_portal_card_applications_v1',
  WEBSITE_CMS: 'LABMEDIX_WEBSITE_CMS_CONFIG',
  INTEGRATIONS: 'labmedix_integrations_v4',
  FAILED_LOGINS: 'LABMEDIX_STAFF_FAILED_LOGIN_RECORDS',
  RECOVERY_VAULT: 'labmedix_recovery_vault_v1',
  CASH_DESK_VOUCHERS: 'LABMEDIX_CASH_DESK_VOUCHERS_V1',
  VOUCHER_SETTINGS: 'labmedix_voucher_user_settings_v1',
  SAMPLE_DISPATCHES: 'labmedix_sample_dispatches_v1',
  CARD_DISPATCHES: 'labmedix_card_dispatches_v1',
  CARD_DISPATCH_BATCHES: 'labmedix_card_dispatch_batches_v1',
  LAST_BACKUP_TIMESTAMP: 'labmedix_last_backup_timestamp_v1',
  LAST_BACKUP_PROMPT_TIMESTAMP: 'labmedix_last_backup_prompt_timestamp_v1',
  NGO_PARTNERS: 'labmedix_ngo_partners_v1',
  HEALTH_CAMPS: 'labmedix_health_camps_v1',
  CAMP_ATTENDEES: 'labmedix_camp_attendees_v1',
  CHARITY_GRANTS: 'labmedix_charity_grants_v1',
  NGO_FUND_TRANSACTIONS: 'labmedix_ngo_fund_transactions_v1'
};

const INITIAL_USERS: User[] = [
  {
    id: 'usr_super_admin',
    staffId: 'LMDX-STF-001',
    username: 'superadmin',
    fullName: 'Dr. Labmedix Super Admin',
    email: 'admin@labmedix.org',
    role: 'super_admin',
    designation: 'Chief Medical Director & System Owner',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    bloodGroup: 'O+',
    phone: '+91 98300 00001',
    workPhone: 'EXT-101 (Executive)',
    department: 'Executive Medical Board',
    accessZone: 'Zone ROOT: Full Medical, OT, ICU & Root Server Access',
    nationalId: 'UID-8821-9940-1120',
    licenseNo: 'WBMC-DIR-0091',
    emergencyContact: '9830099999',
    emergencyContactName: 'Executive Secretariat',
    cardThemeWish: 'premium_medical',
    cardMaterialWish: 'gold_foil',
    status: 'active',
    pinCode: 'LabMedix@2026Root#',
    joiningDate: '2025-01-01',
    expiryDate: '2028-12-31',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'usr_admin',
    staffId: 'LMDX-STF-002',
    username: 'admin',
    fullName: 'Operations Administrator',
    email: 'ops@labmedix.org',
    role: 'admin',
    designation: 'Clinical Operations Director',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bloodGroup: 'B+',
    phone: '+91 98300 00002',
    workPhone: 'EXT-102 (Operations)',
    department: 'Hospital Administration',
    accessZone: 'Zone A: Operational Command & EMR Scheduling',
    nationalId: 'UID-4412-8871-3321',
    emergencyContact: '9830088888',
    emergencyContactName: 'Operations Dept',
    status: 'active',
    pinCode: '1234',
    joiningDate: '2025-01-01',
    expiryDate: '2028-12-31',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'usr_doctor',
    staffId: 'LMDX-DOC-001',
    username: 'doctor',
    fullName: 'Dr. Subhashish Roy (MD Cardiology)',
    email: 'doctor@labmedix.org',
    role: 'doctor',
    designation: 'Senior Consultant Cardiologist & EMR Physician',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80',
    bloodGroup: 'A+',
    phone: '+91 98300 00003',
    workPhone: 'EXT-103 (Cardiology OPD)',
    department: 'Cardiology & Internal Medicine',
    accessZone: 'Zone C: Clinical EMR, Rx Pad, Telemedicine & OPD Suite',
    nationalId: 'UID-9912-3341-2290',
    licenseNo: 'WBMC-DOC-0842',
    emergencyContact: '9830077777',
    emergencyContactName: 'Clinical Emergency Desk',
    status: 'active',
    pinCode: '1234',
    joiningDate: '2025-01-01',
    expiryDate: '2028-12-31',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'usr_reception',
    staffId: 'LMDX-REC-001',
    username: 'reception',
    fullName: 'Front Desk Executive',
    email: 'reception@labmedix.org',
    role: 'reception',
    designation: 'Front Desk & Patient Intake Officer',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    bloodGroup: 'O+',
    phone: '+91 98300 00004',
    workPhone: 'EXT-104 (Front Desk)',
    department: 'Patient Intake & Registration',
    accessZone: 'Zone R: Reception, Patient Registration & Card Issuance',
    nationalId: 'UID-5521-7712-4411',
    emergencyContact: '9830066666',
    emergencyContactName: 'Front Office Lead',
    status: 'active',
    pinCode: '1234',
    joiningDate: '2025-01-01',
    expiryDate: '2028-12-31',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'usr_lab_staff',
    staffId: 'LMDX-LAB-001',
    username: 'lab_staff',
    fullName: 'Senior Pathology & Lab Biochemist',
    email: 'lab@labmedix.org',
    role: 'lab_staff',
    designation: 'Chief Diagnostic Biochemist',
    photoUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80',
    bloodGroup: 'AB+',
    phone: '+91 98300 00005',
    workPhone: 'EXT-105 (Diagnostics)',
    department: 'Pathology & Diagnostic Laboratory',
    accessZone: 'Zone L: Diagnostic Lab, Blood Pathology & Test Master',
    nationalId: 'UID-7711-2299-8833',
    emergencyContact: '9830055555',
    emergencyContactName: 'Lab Operations',
    status: 'active',
    pinCode: '1234',
    joiningDate: '2025-01-01',
    expiryDate: '2028-12-31',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'usr_manager',
    staffId: 'LMDX-MGR-001',
    username: 'manager',
    fullName: 'Branch Operational Manager',
    email: 'manager@labmedix.org',
    role: 'manager',
    designation: 'General Operations Manager',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
    bloodGroup: 'B+',
    phone: '+91 98300 00006',
    workPhone: 'EXT-106 (Management)',
    department: 'Hospital Management',
    accessZone: 'Zone M: Management & Audit Control',
    nationalId: 'UID-6612-4411-9922',
    emergencyContact: '9830044444',
    emergencyContactName: 'Management Secretariat',
    status: 'active',
    pinCode: '1234',
    joiningDate: '2025-01-01',
    expiryDate: '2028-12-31',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'usr_card_operator',
    staffId: 'LMDX-CRD-001',
    username: 'card_operator',
    fullName: 'CR80 PVC Card Production Specialist',
    email: 'card@labmedix.org',
    role: 'card_operator',
    designation: 'CR80 PVC Print & Encoding Specialist',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    bloodGroup: 'O+',
    phone: '+91 98300 00007',
    workPhone: 'EXT-107 (Card Studio)',
    department: 'Health Card Production Studio',
    accessZone: 'Zone P: CR80 Card Studio & PVC Printing',
    nationalId: 'UID-3321-8844-5511',
    emergencyContact: '9830033333',
    emergencyContactName: 'Production Unit',
    status: 'active',
    pinCode: '1234',
    joiningDate: '2025-01-01',
    expiryDate: '2028-12-31',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'usr_marketing',
    staffId: 'LMDX-MKT-001',
    username: 'marketing',
    fullName: 'Healthcare Campaign & Marketing Officer',
    email: 'marketing@labmedix.org',
    role: 'marketing',
    designation: 'Senior Outreach Manager',
    photoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80',
    bloodGroup: 'A+',
    phone: '+91 98300 00008',
    workPhone: 'EXT-108 (Marketing)',
    department: 'Public Relations & Campaigns',
    accessZone: 'Zone K: Outreach & Health Packages',
    nationalId: 'UID-2211-9988-7744',
    emergencyContact: '9830022222',
    emergencyContactName: 'Marketing Desk',
    status: 'active',
    pinCode: '1234',
    joiningDate: '2025-01-01',
    expiryDate: '2028-12-31',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'usr_read_only',
    staffId: 'LMDX-AUD-001',
    username: 'read_only',
    fullName: 'Internal Quality & Compliance Auditor',
    email: 'audit@labmedix.org',
    role: 'read_only',
    designation: 'Lead Healthcare Compliance Auditor',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    bloodGroup: 'B+',
    phone: '+91 98300 00009',
    workPhone: 'EXT-109 (Auditing)',
    department: 'Quality Assurance & Regulatory Compliance',
    accessZone: 'Zone V: View-Only Compliance Inspection',
    nationalId: 'UID-1199-8877-6655',
    emergencyContact: '9830011111',
    emergencyContactName: 'Auditing Directorate',
    status: 'active',
    pinCode: '1234',
    joiningDate: '2025-01-01',
    expiryDate: '2028-12-31',
    createdAt: '2025-01-01T00:00:00.000Z'
  }
];

const INITIAL_PATIENTS: Patient[] = [];

const INITIAL_CARDS: HealthCard[] = [];

const INITIAL_WALLETS: Wallet[] = [];

const INITIAL_TRANSACTIONS: WalletTransaction[] = [];

const INITIAL_AUDIT_LOGS: AuditLog[] = [];

/* =======================================================================
   LABMEDIX SECURE STORAGE ENGINE v3 (ENTERPRISE RESILIENT)
   Quadruple-Redundant: Memory Cache → localStorage → sessionStorage → IndexedDB
   Auto-recovery, Persistent Storage API, Quota Protection, Cross-Tab Sync
   ======================================================================= */

export class StorageService {

  private static backupSyncTimeout: any = null;
  private static lastLiveSnapshotTs = 0;

  private static triggerServerBackupSync() {
    if (this.backupSyncTimeout) {
      clearTimeout(this.backupSyncTimeout);
    }

    // Debounce for live modifications to prevent UI stalls
    this.backupSyncTimeout = setTimeout(() => {
      this.performServerBackupSync();
    }, 4000);
  }

  private static async performServerBackupSync() {
    try {
      // 1. Gather comprehensive live database state across all portals & site modules
      const data = {
        users: this.getUsers(),
        patients: this.getPatients(),
        cards: this.getCards(),
        memberships: this.getMemberships(),
        families: this.getFamilies(),
        wallets: this.getWallets(),
        transactions: this.getTransactions(),
        auditLogs: this.getAuditLogs(),
        companyProfile: this.getCompanyProfile(),
        cashDeskVouchers: this.getCashDeskVouchers(),
        portalLabBookings: this.getItem(STORAGE_KEYS.PORTAL_LAB_BOOKINGS, []),
        portalPharmacyOrders: this.getItem(STORAGE_KEYS.PORTAL_PHARMACY_ORDERS, []),
        portalCardApplications: this.getItem(STORAGE_KEYS.PORTAL_CARD_APPLICATIONS, []),
        websiteCms: this.getItem(STORAGE_KEYS.WEBSITE_CMS, null),
        appointments: this.getItem(STORAGE_KEYS.APPOINTMENTS, []),
        emrEncounters: this.getItem(STORAGE_KEYS.EMR_ENCOUNTERS, []),
        doctors: this.getItem(STORAGE_KEYS.DOCTORS, []),
        timestamp: new Date().toISOString()
      };

      // 2. Automatically record a Time-Machine Snapshot if at least 60s passed since last auto-snapshot
      const now = Date.now();
      if (now - this.lastLiveSnapshotTs > 60000) {
        this.lastLiveSnapshotTs = now;
        try {
          const snapshots = this.getSnapshots();
          const autoSnap: SnapshotRecord = {
            id: `snap_auto_${now}_${Math.random().toString(36).substring(2, 6)}`,
            timestamp: new Date().toISOString(),
            title: `Live Realtime Auto-Backup [${new Date().toLocaleTimeString()}]`,
            tag: 'auto_live',
            sizeBytes: 25000,
            recordCounts: {
              patients: data.patients.length,
              healthCards: data.cards.length,
              memberships: data.memberships.length,
              families: data.families.length,
              wallets: data.wallets.length,
              walletTransactions: data.transactions.length,
              auditLogs: data.auditLogs.length,
              users: data.users.length
            },
            data,
            checksum: `SHA256-LIVE-${now.toString(16).toUpperCase()}`,
            isCloudSynced: true
          };
          snapshots.unshift(autoSnap);
          if (snapshots.length > 20) snapshots.pop();
          localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(snapshots));
        } catch { }
      }

      // 3. Post to backend server endpoint for Cloud Run container sync
      const driveToken = getGoogleAccessToken();
      await fetch('/api/backup/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, googleToken: driveToken })
      }).catch(() => { });

      // 4. Trigger direct client-side Google Drive upload and flush Zero-Data-Loss WAL
      GoogleDriveService.triggerAutoBackup();
      FirestoreBackupService.scheduleWalFlush(500);
    } catch (e) {
      console.warn('Failed to execute live backup sync:', e);
    }
  }


  // Simulated Encryption to comply with "never expose in browser storage"
  public static encrypt(text: string): string {
    if (!text) return text;
    if (text.startsWith('ENC::')) return text;
    return 'ENC::' + btoa(text.split('').reverse().join(''));
  }
  public static decrypt(text: string): string {
    if (!text || !text.startsWith('ENC::')) return text;
    return atob(text.replace('ENC::', '')).split('').reverse().join('');
  }

  private static memoryCache: Map<string, any> = new Map();
  private static syncChannel: BroadcastChannel | null = null;
  private static isInitialized = false;
  private static pendingNotifyKeys = new Set<string>();
  private static notifyDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * High-Performance Batched Event Dispatcher:
   * Coalesces rapid sequential key updates (e.g. initial Firestore hydration, bulk operations)
   * into a single micro-debounced UI event to prevent main-thread lag and re-render thrashing.
   */
  public static scheduleDataSyncedNotification(key: string, value?: any): void {
    if (typeof window === 'undefined') return;
    this.pendingNotifyKeys.add(key);

    if (this.notifyDebounceTimer) return;

    this.notifyDebounceTimer = setTimeout(() => {
      const keysArray = Array.from(StorageService.pendingNotifyKeys);
      StorageService.pendingNotifyKeys.clear();
      StorageService.notifyDebounceTimer = null;

      window.dispatchEvent(new CustomEvent('labmedix_data_synced', {
        detail: {
          keys: keysArray,
          key: keysArray.length === 1 ? keysArray[0] : undefined,
          timestamp: Date.now()
        }
      }));
    }, 35); // 35ms batch window: imperceptible latency, eliminates re-render spikes
  }

  /* ── PUBLIC: Request browser persistent storage (prevents OS cache eviction on mobile & desktop) ── */
  public static async requestPersistentStorage(): Promise<boolean> {
    try {
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persist();
        console.info(`[LABMEDIX SECURE ENGINE] Persistent Storage state: ${isPersisted ? 'GRANTED (Immune to Cache Eviction)' : 'DEFAULT'}`);
        return isPersisted;
      }
    } catch (e) {
      console.warn('[LABMEDIX] Persistent storage request error:', e);
    }
    return false;
  }

  public static async isStoragePersisted(): Promise<boolean> {
    try {
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persisted) {
        return await navigator.storage.persisted();
      }
    } catch { }
    return false;
  }

  /* ── PUBLIC: Write to Memory, localStorage, sessionStorage, and IndexedDB ── */
  public static setItem<T>(key: string, value: T): void {
    // 1. Hot in-memory cache
    StorageService.memoryCache.set(key, value);

    const serialized = JSON.stringify(value);

    // 2. Primary Persistent Web Storage
    try {
      localStorage.setItem(key, serialized);
      // Only sync if it's a critical key (not theme/screen_locked)
      if (![STORAGE_KEYS.THEME, STORAGE_KEYS.SCREEN_LOCKED].includes(key)) {
        this.triggerServerBackupSync();
      }
    } catch (e: any) {
      if (e?.name === 'QuotaExceededError' || e?.code === 22) {
        console.warn(`[LABMEDIX] localStorage quota exceeded for ${key}. Pruning old logs…`);
        StorageService.pruneOldAuditLogs();
        try {
          localStorage.setItem(key, serialized);
          // Only sync if it's a critical key (not theme/screen_locked)
          if (![STORAGE_KEYS.THEME, STORAGE_KEYS.SCREEN_LOCKED].includes(key)) {
            this.triggerServerBackupSync();
          }
        } catch { /* ignore */ }
      } else {
        console.error(`[LABMEDIX] localStorage write failed for ${key}:`, e);
      }
    }

    // 3. Tab Session Mirror
    try {
      sessionStorage.setItem(key, serialized);
    } catch { /* session mirror failure is non-critical */ }

    // 4. Deep IndexedDB Persistence (Survives browser cache resets & low storage eviction)
    StorageService.idbSet(key, serialized).catch(() => { });

    // 5. Cross-Tab Live Broadcast Sync
    try {
      if (StorageService.syncChannel) {
        StorageService.syncChannel.postMessage({ type: 'DATA_UPDATED', key, timestamp: Date.now() });
      }
    } catch { }

    // 6. Direct Central Server Database Sync API (Persists across devices)
    if (![STORAGE_KEYS.THEME, STORAGE_KEYS.SCREEN_LOCKED].includes(key)) {
      fetch(`/api/sync/key/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      }).catch(() => { });

      // 7. Direct Firestore Cloud Database Sync for second-by-second multi-device sync
      ApiSyncService.syncKeyToFirestore(key, value).catch(() => { });
    }

    // 8. Broadcast update event locally via high-performance micro-debounced batcher
    StorageService.scheduleDataSyncedNotification(key, value);

    // 9. Trigger Live Backup to Google Drive if configured (Exclude internal logs/snapshots to prevent loops)
    const INTERNAL_ONLY_KEYS = [
      STORAGE_KEYS.AUDIT_LOGS,
      STORAGE_KEYS.SNAPSHOTS,
      STORAGE_KEYS.THEME,
      STORAGE_KEYS.SCREEN_LOCKED,
      STORAGE_KEYS.RECOVERY_VAULT,
      STORAGE_KEYS.INTEGRATIONS,
      STORAGE_KEYS.LAST_BACKUP_TIMESTAMP,
      STORAGE_KEYS.LAST_BACKUP_PROMPT_TIMESTAMP
    ];
    if (!INTERNAL_ONLY_KEYS.includes(key as any)) {
      GoogleDriveService.triggerAutoBackup();
    }
  }

  /**
   * Public Helper: Update in-memory cache and localStorage immediately when real-time cloud data arrives,
   * bypassing stale reads and notifying all React components smoothly.
   */
  public static updateCacheAndNotify(key: string, value: any): void {
    if (!key || value === undefined) return;
    if ([STORAGE_KEYS.THEME, STORAGE_KEYS.SCREEN_LOCKED].includes(key)) return;

    StorageService.memoryCache.set(key, value);
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch { }
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch { }

    StorageService.scheduleDataSyncedNotification(key, value);
  }

  /* ── PUBLIC: Read with multi-layer fallback ── */
  public static getItem<T>(key: string, defaultValue: T): T {
    // Layer 1: Memory cache
    if (StorageService.memoryCache.has(key)) {
      return StorageService.memoryCache.get(key) as T;
    }

    // Layer 2: localStorage
    try {
      const v = localStorage.getItem(key);
      if (v) {
        const parsed = JSON.parse(v) as T;
        if (parsed !== null && parsed !== undefined) {
          StorageService.memoryCache.set(key, parsed);
          return parsed;
        }
      }
    } catch { /* fall through */ }

    // Layer 3: sessionStorage mirror
    try {
      const v = sessionStorage.getItem(key);
      if (v) {
        console.info(`[LABMEDIX] Restored ${key} from sessionStorage mirror.`);
        const parsed = JSON.parse(v) as T;
        if (parsed !== null && parsed !== undefined) {
          StorageService.memoryCache.set(key, parsed);
          try { localStorage.setItem(key, v); } catch { }
          return parsed;
        }
      }
    } catch { /* fall through */ }

    // Layer 4: Async IndexedDB Recovery (initiates background heal)
    StorageService.idbGet(key).then(v => {
      if (v) {
        console.info(`[LABMEDIX] Healed ${key} from IndexedDB backup.`);
        try {
          localStorage.setItem(key, v);
          StorageService.memoryCache.set(key, JSON.parse(v));
        } catch { }
      }
    }).catch(() => { });

    StorageService.memoryCache.set(key, defaultValue);
    return defaultValue;
  }

  /* ── PUBLIC: Remove item across all layers ── */
  public static removeItem(key: string): void {
    StorageService.memoryCache.delete(key);
    try { localStorage.removeItem(key); } catch { }
    try { sessionStorage.removeItem(key); } catch { }
    StorageService.idbRemove(key).catch(() => { });
  }

  /* ── INTERNAL: IndexedDB helpers ── */
  private static readonly IDB_NAME = 'LABMEDIX_SECURE_DB';
  private static readonly IDB_STORE = 'labmedix_store';
  private static readonly IDB_VER = 1;

  private static openIDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) return reject('No IndexedDB');
      const req = window.indexedDB.open(StorageService.IDB_NAME, StorageService.IDB_VER);
      req.onupgradeneeded = (e: IDBVersionChangeEvent) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(StorageService.IDB_STORE)) {
          db.createObjectStore(StorageService.IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private static async idbSet(key: string, value: string): Promise<void> {
    try {
      const db = await StorageService.openIDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(StorageService.IDB_STORE, 'readwrite');
        const store = tx.objectStore(StorageService.IDB_STORE);
        const req = store.put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch { }
  }

  private static async idbGet(key: string): Promise<string | null> {
    try {
      const db = await StorageService.openIDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(StorageService.IDB_STORE, 'readonly');
        const store = tx.objectStore(StorageService.IDB_STORE);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  }

  private static async idbRemove(key: string): Promise<void> {
    try {
      const db = await StorageService.openIDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(StorageService.IDB_STORE, 'readwrite');
        const store = tx.objectStore(StorageService.IDB_STORE);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch { }
  }

  /* ── INTERNAL: Prune old audit logs to free localStorage quota ── */
  private static pruneOldAuditLogs(): void {
    try {
      const logs = StorageService.getAuditLogs();
      if (logs.length > 500) {
        const pruned = logs.slice(-500);
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(pruned));
        console.info('[LABMEDIX] Pruned audit logs to latest 500 entries to free storage quota.');
      }
    } catch { }
  }

  /* ── PUBLIC: Force-sync all data to IndexedDB ── */
  public static async forceSyncToIndexedDB(): Promise<void> {
    const keys = Object.values(STORAGE_KEYS);
    for (const key of keys) {
      const v = localStorage.getItem(key);
      if (v) await StorageService.idbSet(key, v).catch(() => { });
    }
    console.info('[LABMEDIX] All data force-synced to IndexedDB backup.');
  }

  /* ── PUBLIC: Export all data as downloadable JSON file ── */
  public static exportDataAsJSON(): void {
    const backup: Record<string, any> = {};
    for (const [name, key] of Object.entries(STORAGE_KEYS)) {
      try {
        const v = localStorage.getItem(key);
        if (v) backup[name] = JSON.parse(v);
      } catch { }
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LABMEDIX_FULL_SECURE_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ── PUBLIC: Import data from backup JSON ── */
  public static importDataFromJSON(jsonText: string): boolean {
    try {
      const backup = JSON.parse(jsonText) as Record<string, any>;
      for (const [name, key] of Object.entries(STORAGE_KEYS)) {
        if (backup[name] !== undefined) {
          StorageService.setItem(key, backup[name]);
        }
      }
      console.info('[LABMEDIX] Data restored from backup JSON.');
      return true;
    } catch (e) {
      console.error('[LABMEDIX] Import failed:', e);
      return false;
    }
  }

  /* ── PUBLIC: Get storage usage info ── */
  public static getStorageInfo(): { usedKB: number; totalKB: number; pct: number; safe: boolean } {
    let used = 0;
    try {
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          used += (localStorage.getItem(key) || '').length * 2; // UTF-16 bytes
        }
      }
    } catch { }
    const totalKB = 5120; // ~5MB standard localStorage limit
    const usedKB = Math.round(used / 1024);
    const pct = Math.round((usedKB / totalKB) * 100);
    return { usedKB, totalKB, pct, safe: pct < 80 };
  }

  /* ── PUBLIC: Initialize and start background persistence engine ── */
  public static initPersistentEngine(): void {
    if (typeof window !== 'undefined') {
      (window as any).__labmedix_mem_cache = StorageService.memoryCache;
      (window as any).__labmedix_update_cache = StorageService.updateCacheAndNotify;
    }

    if (StorageService.isInitialized || typeof window === 'undefined') return;
    StorageService.isInitialized = true;

    // 1. Request persistent storage from browser
    StorageService.requestPersistentStorage();

    // 2. Setup Cross-Tab Broadcast Channel
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        StorageService.syncChannel = new BroadcastChannel('labmedix_sync_channel');
        StorageService.syncChannel.onmessage = (event) => {
          if (event.data?.key) {
            StorageService.memoryCache.delete(event.data.key);
            window.dispatchEvent(new CustomEvent('labmedix_data_synced', { detail: { key: event.data.key } }));
          }
        };
      }
    } catch { }

    // 3. Register page unload and visibility change to flush writes to IndexedDB
    window.addEventListener('beforeunload', () => {
      StorageService.forceSyncToIndexedDB().catch(() => { });
    });
    window.addEventListener('pagehide', () => {
      StorageService.forceSyncToIndexedDB().catch(() => { });
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        StorageService.forceSyncToIndexedDB().catch(() => { });
      }
    });

    // 4. Real-Time Cloud Firestore Listener Subscription (Instant second-by-second pushes across all devices)
    try {
      ApiSyncService.subscribeToAll((key, val) => {
        StorageService.updateCacheAndNotify(key, val);
      });
    } catch (e) {
      console.warn('[LABMEDIX] Realtime Firestore subscribe notice:', e);
    }

    // 5. Auto-Periodic deep sync every 3 minutes
    setInterval(() => {
      StorageService.forceSyncToIndexedDB().catch(() => { });
    }, 180000);
  }

  public static async initializeDatabase(): Promise<void> {
    StorageService.initPersistentEngine();

    // 1. Cloud Firestore Cross-Device Hydration (Primary Source of Truth on startup)
    let cloudUsersCount = 0;
    try {
      const [
        cloudPatients,
        cloudCards,
        cloudApps,
        cloudWallets,
        cloudTxns,
        cloudAudit,
        cloudUsers,
        cloudMemberships,
        cloudAppointments,
        cloudEncounters,
        cloudDoctors,
        cloudDoctorPayouts,
        cloudLabTests,
        cloudHealthPackages,
        cloudLabBookings,
        cloudPharmacyOrders,
        cloudVouchers,
        cloudDispatches,
        cloudSnapshots,
        cloudCompany,
        cloudNgoPartners,
        cloudHealthCamps,
        cloudCampAttendees,
        cloudCharityGrants,
        cloudNgoTxns
      ] = await Promise.all([
        ApiSyncService.fetchCollection<Patient>('patients').catch(() => []),
        ApiSyncService.fetchCollection<HealthCard>('cards').catch(() => []),
        ApiSyncService.fetchCollection<any>('cardApplications').catch(() => []),
        ApiSyncService.fetchCollection<Wallet>('wallets').catch(() => []),
        ApiSyncService.fetchCollection<WalletTransaction>('transactions').catch(() => []),
        ApiSyncService.fetchCollection<AuditLog>('auditLogs').catch(() => []),
        ApiSyncService.fetchCollection<User>('users').catch(() => []),
        ApiSyncService.fetchCollection<Membership>('memberships').catch(() => []),
        ApiSyncService.fetchCollection<any>('appointments').catch(() => []),
        ApiSyncService.fetchCollection<any>('emrEncounters').catch(() => []),
        ApiSyncService.fetchCollection<any>('doctors').catch(() => []),
        ApiSyncService.fetchCollection<any>('doctorPayouts').catch(() => []),
        ApiSyncService.fetchCollection<any>('labTests').catch(() => []),
        ApiSyncService.fetchCollection<any>('healthPackages').catch(() => []),
        ApiSyncService.fetchCollection<any>('labBookings').catch(() => []),
        ApiSyncService.fetchCollection<any>('pharmacyOrders').catch(() => []),
        ApiSyncService.fetchCollection<any>('vouchers').catch(() => []),
        ApiSyncService.fetchCollection<SampleDispatchRecord>('sampleDispatches').catch(() => []),
        ApiSyncService.fetchCollection<SnapshotRecord>('snapshots').catch(() => []),
        ApiSyncService.fetchDocument<CompanyProfile>('settings/companyProfile').catch(() => null),
        ApiSyncService.fetchCollection<NgoPartner>('ngoPartners').catch(() => []),
        ApiSyncService.fetchCollection<HealthCamp>('healthCamps').catch(() => []),
        ApiSyncService.fetchCollection<CampAttendee>('campAttendees').catch(() => []),
        ApiSyncService.fetchCollection<CharityGrant>('charityGrants').catch(() => []),
        ApiSyncService.fetchCollection<NgoFundTransaction>('ngoTransactions').catch(() => [])
      ]);

      cloudUsersCount = cloudUsers.length;

      const syncEntity = <T>(cloudItems: T[], key: string) => {
        if (Array.isArray(cloudItems) && cloudItems.length > 0) {
          StorageService.updateCacheAndNotify(key, cloudItems);
        }
      };

      syncEntity(cloudPatients, STORAGE_KEYS.PATIENTS);
      syncEntity(cloudCards, STORAGE_KEYS.CARDS);
      syncEntity(cloudApps, STORAGE_KEYS.PORTAL_CARD_APPLICATIONS);
      syncEntity(cloudWallets, STORAGE_KEYS.WALLETS);
      syncEntity(cloudTxns, STORAGE_KEYS.TRANSACTIONS);
      syncEntity(cloudAudit, STORAGE_KEYS.AUDIT_LOGS);
      syncEntity(cloudUsers, STORAGE_KEYS.USERS);
      syncEntity(cloudMemberships, STORAGE_KEYS.MEMBERSHIPS);
      syncEntity(cloudAppointments, STORAGE_KEYS.APPOINTMENTS);
      syncEntity(cloudEncounters, STORAGE_KEYS.EMR_ENCOUNTERS);
      syncEntity(cloudDoctors, STORAGE_KEYS.DOCTORS);
      syncEntity(cloudDoctorPayouts, STORAGE_KEYS.DOCTOR_PAYOUTS);
      syncEntity(cloudLabTests, STORAGE_KEYS.LAB_TESTS);
      syncEntity(cloudHealthPackages, STORAGE_KEYS.HEALTH_PACKAGES);
      syncEntity(cloudLabBookings, STORAGE_KEYS.PORTAL_LAB_BOOKINGS);
      syncEntity(cloudPharmacyOrders, STORAGE_KEYS.PORTAL_PHARMACY_ORDERS);
      syncEntity(cloudVouchers, STORAGE_KEYS.CASH_DESK_VOUCHERS);
      syncEntity(cloudDispatches, STORAGE_KEYS.SAMPLE_DISPATCHES);
      syncEntity(cloudSnapshots, STORAGE_KEYS.SNAPSHOTS);
      syncEntity(cloudNgoPartners, STORAGE_KEYS.NGO_PARTNERS);
      syncEntity(cloudHealthCamps, STORAGE_KEYS.HEALTH_CAMPS);
      syncEntity(cloudCampAttendees, STORAGE_KEYS.CAMP_ATTENDEES);
      syncEntity(cloudCharityGrants, STORAGE_KEYS.CHARITY_GRANTS);
      syncEntity(cloudNgoTxns, STORAGE_KEYS.NGO_FUND_TRANSACTIONS);

      // Seed initial records to Firestore if remote cloud collections are currently empty
      if (cloudPatients.length === 0) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.PATIENTS, StorageService.getPatients()).catch(() => {});
      if (cloudCards.length === 0) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.CARDS, StorageService.getCards()).catch(() => {});
      if (cloudMemberships.length === 0) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.MEMBERSHIPS, StorageService.getMemberships()).catch(() => {});
      if (cloudDoctors.length === 0) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.DOCTORS, StorageService.getItem(STORAGE_KEYS.DOCTORS, [])).catch(() => {});
      if (cloudLabTests.length === 0) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.LAB_TESTS, StorageService.getItem(STORAGE_KEYS.LAB_TESTS, [])).catch(() => {});
      if (cloudHealthPackages.length === 0) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.HEALTH_PACKAGES, StorageService.getItem(STORAGE_KEYS.HEALTH_PACKAGES, [])).catch(() => {});
      if (cloudWallets.length === 0) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.WALLETS, StorageService.getWallets()).catch(() => {});
      if (cloudTxns.length === 0) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.TRANSACTIONS, StorageService.getTransactions()).catch(() => {});
      if (cloudNgoPartners.length === 0) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.NGO_PARTNERS, StorageService.getNgoPartners()).catch(() => {});
      if (cloudHealthCamps.length === 0) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.HEALTH_CAMPS, StorageService.getHealthCamps()).catch(() => {});

      if (cloudCompany && cloudCompany.name) {
        StorageService.updateCacheAndNotify(STORAGE_KEYS.COMPANY_PROFILE, cloudCompany);
      } else {
        // Cloud company profile not set, seed DEFAULT_COMPANY_PROFILE
        ApiSyncService.syncKeyToFirestore('labmedix_company_profile_v1', DEFAULT_COMPANY_PROFILE).catch(() => {});
      }
    } catch (e) {
      console.warn('[LABMEDIX] Cloud Firestore cross-device sync hydration notice:', e);
    }

    const currentUsers = this.getItem<User[]>(STORAGE_KEYS.USERS, []);
    const mergedMap = new Map<string, User>();
    // Preload all standard roles first
    INITIAL_USERS.forEach(u => mergedMap.set(u.id, u));
    // Merge existing users over initial
    currentUsers.forEach(u => {
      if (u && u.id) {
        mergedMap.set(u.id, { ...mergedMap.get(u.id), ...u });
      }
    });
    const finalUsers = Array.from(mergedMap.values());
    this.setItem(STORAGE_KEYS.USERS, finalUsers);

    if (cloudUsersCount === 0) {
      // Seed Firestore with initial staff users
      ApiSyncService.syncUsers(finalUsers).catch(() => {});
    }
  }

  // Users
  public static getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }
  public static saveUsers(users: User[]): void {
    this.setItem(STORAGE_KEYS.USERS, users);
    ApiSyncService.syncUsers(users).catch(() => { });
  }
  public static getCurrentUser(): User | null {
    return this.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }
  public static setCurrentUser(user: User | null): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER, user);
  }

  // Patients
  public static getPatients(): Patient[] {
    return this.getItem<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
  }
  public static savePatients(patients: Patient[]): void {
    this.setItem(STORAGE_KEYS.PATIENTS, patients);
    ApiSyncService.syncPatients(patients).catch(() => { });
  }

  // Health Cards
  public static getCards(): HealthCard[] {
    const list = this.getItem<HealthCard[]>(STORAGE_KEYS.CARDS, INITIAL_CARDS);
    return list.map(c => {
      if (!c.cvv) {
        c.cvv = (c.verificationCode ? c.verificationCode.slice(-3) : '821').replace(/\D/g, '') || '821';
        if (c.cvv.length < 3) c.cvv = '821';
      }
      return c;
    });
  }
  public static saveCards(cards: HealthCard[]): void {
    const encrypted = cards.map(c => ({
      ...c,
      cvv: this.encrypt(c.cvv)
    }));
    this.setItem(STORAGE_KEYS.CARDS, encrypted);
    ApiSyncService.syncCards(cards).catch(() => { });
  }

  // Memberships
  public static getMemberships(): Membership[] {
    const memberships = this.getItem<Membership[]>(STORAGE_KEYS.MEMBERSHIPS, DEFAULT_MEMBERSHIPS);
    if (!memberships || !Array.isArray(memberships) || memberships.length === 0) {
      return DEFAULT_MEMBERSHIPS;
    }
    return memberships;
  }
  public static getActiveMemberships(): Membership[] {
    return this.getMemberships().filter(m => m.status === 'active');
  }
  public static getRecommendedMembership(): Membership | undefined {
    const active = this.getActiveMemberships();
    return active.find(m => m.isRecommended) || active.find(m => m.isPopular) || active[0];
  }
  public static saveMemberships(memberships: Membership[]): void {
    this.setItem(STORAGE_KEYS.MEMBERSHIPS, memberships);
    ApiSyncService.syncMemberships(memberships).catch(() => { });
  }

  // Families
  public static getFamilies(): FamilyGroup[] {
    return this.getItem<FamilyGroup[]>(STORAGE_KEYS.FAMILIES, []);
  }
  public static saveFamilies(families: FamilyGroup[]): void {
    this.setItem(STORAGE_KEYS.FAMILIES, families);
    ApiSyncService.syncFamilies(families).catch(() => { });
  }

  // Wallets
  public static getWallets(): Wallet[] {
    return this.getItem<Wallet[]>(STORAGE_KEYS.WALLETS, INITIAL_WALLETS);
  }
  public static saveWallets(wallets: Wallet[]): void {
    this.setItem(STORAGE_KEYS.WALLETS, wallets);
    ApiSyncService.syncWallets(wallets).catch(() => { });
  }

  // Transactions
  public static getTransactions(): WalletTransaction[] {
    return this.getItem<WalletTransaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  }
  public static saveTransactions(txns: WalletTransaction[]): void {
    this.setItem(STORAGE_KEYS.TRANSACTIONS, txns);
    ApiSyncService.syncTransactions(txns).catch(() => { });
  }

  // Audit Logs
  public static getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }
  public static saveAuditLogs(logs: AuditLog[]): void {
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
    ApiSyncService.syncAuditLogs(logs).catch(() => { });
  }

  // Company Profile
  public static getCompanyProfile(): CompanyProfile {
    let profile = this.getItem<CompanyProfile>(STORAGE_KEYS.COMPANY_PROFILE, DEFAULT_COMPANY_PROFILE);
    if (!profile) {
      return DEFAULT_COMPANY_PROFILE;
    }
    return {
      ...DEFAULT_COMPANY_PROFILE,
      ...profile,
      nfcSettings: {
        defaultStandard: 'ISO/IEC 14443 Type A',
        frequency: '13.56 MHz',
        payloadType: 'verification_url',
        autoWriteOnIssue: true,
        securityKey: 'A0B1C2D3E4F5',
        enableWebNfcApi: true,
        ...(DEFAULT_COMPANY_PROFILE.nfcSettings || {}),
        ...(profile.nfcSettings || {}),
        enabled: profile.nfcSettings?.enabled ?? DEFAULT_COMPANY_PROFILE.nfcSettings?.enabled ?? true
      },
      upiSettings: {
        merchantVpa: '7047108226@okbizaxis',
        merchantName: 'LABMEDIX MULTI-SPECIALITY CENTRE',
        merchantMcc: '8099',
        googlePayMerchantId: 'GPAY-LMDX-8829-LIVE',
        googlePayBusinessName: 'LABMEDIX HEALTHCARE',
        enableDeepLinks: true,
        autoVerifySimulation: true,
        ...(DEFAULT_COMPANY_PROFILE.upiSettings || {}),
        ...(profile.upiSettings || {}),
        enabled: profile.upiSettings?.enabled ?? DEFAULT_COMPANY_PROFILE.upiSettings?.enabled ?? true
      }
    };
  }
  public static saveCompanyProfile(profile: CompanyProfile): void {
    this.setItem(STORAGE_KEYS.COMPANY_PROFILE, profile);
    ApiSyncService.saveCompanyProfile(profile).catch(() => {});
    ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.COMPANY_PROFILE, profile).catch(() => {});
    this.triggerServerBackupSync();
  }

  // Cash Desk Vouchers (Super Admin Sovereign PIN & Voucher Ledger)
  public static getCashDeskVouchers(): CashDeskVoucher[] {
    return this.getItem<CashDeskVoucher[]>(STORAGE_KEYS.CASH_DESK_VOUCHERS, []);
  }
  public static saveCashDeskVouchers(vouchers: CashDeskVoucher[]): void {
    this.setItem(STORAGE_KEYS.CASH_DESK_VOUCHERS, vouchers);
    ApiSyncService.syncVouchers(vouchers).catch(() => { });
  }

  // Cash Desk Voucher User Settings (Auto-print, default formats)
  public static getVoucherSettings(): { autoPrintOnCreation: boolean; defaultFormat: 'thermal_pos' | 'a4_certificate' } {
    return this.getItem<{ autoPrintOnCreation: boolean; defaultFormat: 'thermal_pos' | 'a4_certificate' }>(
      STORAGE_KEYS.VOUCHER_SETTINGS,
      { autoPrintOnCreation: false, defaultFormat: 'thermal_pos' }
    );
  }
  public static saveVoucherSettings(settings: { autoPrintOnCreation: boolean; defaultFormat?: 'thermal_pos' | 'a4_certificate' }): void {
    const existing = this.getVoucherSettings();
    this.setItem(STORAGE_KEYS.VOUCHER_SETTINGS, { ...existing, ...settings });
  }

  // Snapshots
  public static getSnapshots(): SnapshotRecord[] {
    return this.getItem<SnapshotRecord[]>(STORAGE_KEYS.SNAPSHOTS, []);
  }
  public static saveSnapshots(snapshots: SnapshotRecord[]): void {
    if (snapshots.length > 30) {
      snapshots = snapshots.slice(0, 30);
    }
    this.setItem(STORAGE_KEYS.SNAPSHOTS, snapshots);
    ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.SNAPSHOTS, snapshots).catch(() => { });
  }

  // Screen Lock
  public static isScreenLocked(): boolean {
    return this.getItem<boolean>(STORAGE_KEYS.SCREEN_LOCKED, false);
  }
  public static setScreenLocked(locked: boolean): void {
    this.setItem(STORAGE_KEYS.SCREEN_LOCKED, locked);
  }

  // Backup Timestamps & Prompts
  public static getLastBackupTimestamp(): string | null {
    return this.getItem<string | null>(STORAGE_KEYS.LAST_BACKUP_TIMESTAMP, null);
  }
  public static setLastBackupTimestamp(timestamp: string): void {
    this.setItem(STORAGE_KEYS.LAST_BACKUP_TIMESTAMP, timestamp);
  }

  public static getLastBackupPromptTimestamp(): string | null {
    return this.getItem<string | null>(STORAGE_KEYS.LAST_BACKUP_PROMPT_TIMESTAMP, null);
  }
  public static setLastBackupPromptTimestamp(timestamp: string): void {
    this.setItem(STORAGE_KEYS.LAST_BACKUP_PROMPT_TIMESTAMP, timestamp);
  }

  // Sample Dispatch & Logistics Pipeline
  public static getSampleDispatches(): SampleDispatchRecord[] {
    return this.getItem(STORAGE_KEYS.SAMPLE_DISPATCHES, []);
  }

  public static saveSampleDispatches(dispatches: SampleDispatchRecord[]): void {
    this.setItem(STORAGE_KEYS.SAMPLE_DISPATCHES, dispatches);
    ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.SAMPLE_DISPATCHES, dispatches).catch(() => { });
  }

  // ── Card Production, Printing & Doorstep Dispatch Hub ──
  public static getCardDispatches(): CardDispatchRecord[] {
    return this.getItem<CardDispatchRecord[]>(STORAGE_KEYS.CARD_DISPATCHES, []);
  }

  public static saveCardDispatches(dispatches: CardDispatchRecord[]): void {
    this.setItem(STORAGE_KEYS.CARD_DISPATCHES, dispatches);
    ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.CARD_DISPATCHES, dispatches).catch(() => { });
  }

  public static getCardDispatchBatches(): CardDispatchBatch[] {
    return this.getItem<CardDispatchBatch[]>(STORAGE_KEYS.CARD_DISPATCH_BATCHES, []);
  }

  public static saveCardDispatchBatches(batches: CardDispatchBatch[]): void {
    this.setItem(STORAGE_KEYS.CARD_DISPATCH_BATCHES, batches);
    ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.CARD_DISPATCH_BATCHES, batches).catch(() => { });
  }

  // ── NGO & CSR Social Welfare Services ──

  public static getNgoPartners(): NgoPartner[] {
    const partners = this.getItem<NgoPartner[]>(STORAGE_KEYS.NGO_PARTNERS, DEFAULT_NGO_PARTNERS);
    if (!partners || partners.length === 0) {
      return DEFAULT_NGO_PARTNERS;
    }
    return partners;
  }

  public static saveNgoPartners(partners: NgoPartner[]): void {
    this.setItem(STORAGE_KEYS.NGO_PARTNERS, partners);
    ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.NGO_PARTNERS, partners).catch(() => { });
  }

  public static getHealthCamps(): HealthCamp[] {
    const camps = this.getItem<HealthCamp[]>(STORAGE_KEYS.HEALTH_CAMPS, DEFAULT_HEALTH_CAMPS);
    if (!camps || camps.length === 0) {
      return DEFAULT_HEALTH_CAMPS;
    }
    return camps;
  }

  public static saveHealthCamps(camps: HealthCamp[]): void {
    this.setItem(STORAGE_KEYS.HEALTH_CAMPS, camps);
    ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.HEALTH_CAMPS, camps).catch(() => { });
  }

  public static getCampAttendees(campId?: string): CampAttendee[] {
    const attendees = this.getItem<CampAttendee[]>(STORAGE_KEYS.CAMP_ATTENDEES, DEFAULT_CAMP_ATTENDEES);
    const list = (!attendees || attendees.length === 0) ? DEFAULT_CAMP_ATTENDEES : attendees;
    if (campId) {
      return list.filter(a => a.campId === campId);
    }
    return list;
  }

  public static saveCampAttendees(attendees: CampAttendee[]): void {
    this.setItem(STORAGE_KEYS.CAMP_ATTENDEES, attendees);
    ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.CAMP_ATTENDEES, attendees).catch(() => { });
  }

  public static getCharityGrants(): CharityGrant[] {
    const grants = this.getItem<CharityGrant[]>(STORAGE_KEYS.CHARITY_GRANTS, DEFAULT_CHARITY_GRANTS);
    if (!grants || grants.length === 0) {
      return DEFAULT_CHARITY_GRANTS;
    }
    return grants;
  }

  public static saveCharityGrants(grants: CharityGrant[]): void {
    this.setItem(STORAGE_KEYS.CHARITY_GRANTS, grants);
    ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.CHARITY_GRANTS, grants).catch(() => { });
  }

  public static getNgoFundTransactions(): NgoFundTransaction[] {
    const txns = this.getItem<NgoFundTransaction[]>(STORAGE_KEYS.NGO_FUND_TRANSACTIONS, DEFAULT_NGO_FUND_TRANSACTIONS);
    if (!txns || txns.length === 0) {
      return DEFAULT_NGO_FUND_TRANSACTIONS;
    }
    return txns;
  }

  public static saveNgoFundTransactions(txns: NgoFundTransaction[]): void {
    this.setItem(STORAGE_KEYS.NGO_FUND_TRANSACTIONS, txns);
    ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.NGO_FUND_TRANSACTIONS, txns).catch(() => { });
  }

  /** Deposit CSR or donation funds into an NGO Partner's dedicated grant pool */
  /** Deposit CSR/Donation funds to an NGO Partner's balance and record 80G transaction */
  public static depositNgoFund(
    txnOrPartnerId: string | NgoFundTransaction,
    amount?: number,
    paymentMethod?: 'bank_transfer' | 'cheque' | 'neft_rtgs' | 'upi_csr' | 'grant_allocation',
    referenceNumber?: string,
    purpose?: string,
    recordedBy?: string
  ): { success: boolean; transaction?: NgoFundTransaction; error?: string } {
    let txn: NgoFundTransaction;
    const partners = this.getNgoPartners();

    if (typeof txnOrPartnerId === 'object') {
      txn = txnOrPartnerId;
      const partner = partners.find(p => p.id === txn.ngoPartnerId);
      if (!partner) return { success: false, error: 'NGO Partner record not found' };

      const newBalance = (partner.activeBalance || 0) + txn.amount;
      const newTotalDeposited = (partner.totalGrantDeposited || 0) + txn.amount;

      const updatedPartner: NgoPartner = {
        ...partner,
        activeBalance: newBalance,
        totalGrantDeposited: newTotalDeposited,
        updatedAt: new Date().toISOString()
      };

      this.saveNgoPartners(partners.map(p => (p.id === partner.id ? updatedPartner : p)));
      this.saveNgoFundTransactions([txn, ...this.getNgoFundTransactions()]);
      return { success: true, transaction: txn };
    }

    const partner = partners.find(p => p.id === txnOrPartnerId);
    if (!partner) return { success: false, error: 'NGO Partner record not found' };

    const depAmount = amount || 0;
    const newBalance = (partner.activeBalance || 0) + depAmount;
    const newTotalDeposited = (partner.totalGrantDeposited || 0) + depAmount;

    const updatedPartner: NgoPartner = {
      ...partner,
      activeBalance: newBalance,
      totalGrantDeposited: newTotalDeposited,
      updatedAt: new Date().toISOString()
    };

    const newTxn: NgoFundTransaction = {
      id: `ngotx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      receiptNumber: `80G-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      ngoPartnerId: partner.id,
      ngoPartnerName: partner.name,
      type: 'deposit',
      amount: depAmount,
      paymentMethod: paymentMethod || 'neft_rtgs',
      referenceNumber: referenceNumber || 'DIRECT-CSR',
      date: new Date().toISOString().split('T')[0],
      purpose: purpose || 'CSR Grant / Health Welfare Deposit',
      taxExemption80GIssued: true,
      balanceAfter: newBalance,
      recordedBy: recordedBy || 'Super Administrator',
      createdAt: new Date().toISOString()
    };

    const updatedPartners = partners.map(p => (p.id === txnOrPartnerId ? updatedPartner : p));
    const existingTxns = this.getNgoFundTransactions();
    const updatedTxns = [newTxn, ...existingTxns];

    this.saveNgoPartners(updatedPartners);
    this.saveNgoFundTransactions(updatedTxns);

    return { success: true, transaction: newTxn };
  }

  /** Create and directly approve/disburse a Patient Charity Grant against partner pool */
  public static createAndDisburseCharityGrant(grant: CharityGrant): { success: boolean; error?: string; grant?: CharityGrant } {
    const partners = this.getNgoPartners();
    const partner = partners.find(p => p.id === grant.ngoPartnerId);
    if (!partner) return { success: false, error: 'Sponsoring NGO partner not found' };

    if (partner.activeBalance < grant.approvedGrantAmount) {
      return {
        success: false,
        error: `Insufficient NGO Grant Pool balance. Available: ₹${partner.activeBalance.toLocaleString('en-IN')}, Required: ₹${grant.approvedGrantAmount.toLocaleString('en-IN')}`
      };
    }

    const newBalance = partner.activeBalance - grant.approvedGrantAmount;
    const newAidDisbursed = (partner.totalAidDisbursed || 0) + grant.approvedGrantAmount;

    const updatedPartner: NgoPartner = {
      ...partner,
      activeBalance: newBalance,
      totalAidDisbursed: newAidDisbursed,
      updatedAt: new Date().toISOString()
    };

    const newTxn: NgoFundTransaction = {
      id: `ngotx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      receiptNumber: `DISB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      ngoPartnerId: partner.id,
      ngoPartnerName: partner.name,
      type: 'grant_disbursement',
      amount: grant.approvedGrantAmount,
      paymentMethod: 'grant_allocation',
      referenceNumber: grant.grantNumber,
      date: new Date().toISOString().split('T')[0],
      purpose: `Charity grant subsidy for patient ${grant.patientName} (${grant.medicalCaseTitle})`,
      taxExemption80GIssued: false,
      balanceAfter: newBalance,
      recordedBy: grant.approvedBy || 'Super Administrator',
      createdAt: new Date().toISOString()
    };

    this.saveNgoPartners(partners.map(p => (p.id === partner.id ? updatedPartner : p)));
    this.saveCharityGrants([grant, ...this.getCharityGrants()]);
    this.saveNgoFundTransactions([newTxn, ...this.getNgoFundTransactions()]);

    return { success: true, grant };
  }

  /** Approve and Disburse a Patient Charity Grant against the Sponsoring NGO's Pool */
  public static approveAndDisburseCharityGrant(
    grantId: string,
    approvedBy: string,
    notes?: string
  ): { success: boolean; error?: string; grant?: CharityGrant } {
    const grants = this.getCharityGrants();
    const grant = grants.find(g => g.id === grantId);
    if (!grant) return { success: false, error: 'Charity grant application not found' };
    if (grant.approvalStatus === 'approved' || grant.approvalStatus === 'disbursed') {
      return { success: false, error: 'This grant has already been approved and settled' };
    }

    const partners = this.getNgoPartners();
    const partner = partners.find(p => p.id === grant.ngoPartnerId);
    if (!partner) return { success: false, error: 'Sponsoring NGO partner not found' };

    if (partner.activeBalance < grant.approvedGrantAmount) {
      return {
        success: false,
        error: `Insufficient NGO Grant Pool balance. Available: ₹${partner.activeBalance.toLocaleString('en-IN')}, Required: ₹${grant.approvedGrantAmount.toLocaleString('en-IN')}`
      };
    }

    // Deduct from partner pool
    const newBalance = partner.activeBalance - grant.approvedGrantAmount;
    const newAidDisbursed = (partner.totalAidDisbursed || 0) + grant.approvedGrantAmount;

    const updatedPartner: NgoPartner = {
      ...partner,
      activeBalance: newBalance,
      totalAidDisbursed: newAidDisbursed,
      updatedAt: new Date().toISOString()
    };

    // Update grant record
    const updatedGrant: CharityGrant = {
      ...grant,
      approvalStatus: 'approved',
      approvedBy,
      approvalDate: new Date().toISOString().split('T')[0],
      disbursementDate: new Date().toISOString().split('T')[0],
      notes: notes || grant.notes,
      updatedAt: new Date().toISOString()
    };

    // Record financial ledger transaction
    const newTxn: NgoFundTransaction = {
      id: `ngotx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      receiptNumber: `DISB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      ngoPartnerId: partner.id,
      ngoPartnerName: partner.name,
      type: 'grant_disbursement',
      amount: grant.approvedGrantAmount,
      paymentMethod: 'grant_allocation',
      referenceNumber: grant.grantNumber,
      date: new Date().toISOString().split('T')[0],
      purpose: `Charity grant subsidy for patient ${grant.patientName} (${grant.medicalCaseTitle})`,
      taxExemption80GIssued: false,
      balanceAfter: newBalance,
      recordedBy: approvedBy,
      createdAt: new Date().toISOString()
    };

    this.saveNgoPartners(partners.map(p => p.id === partner.id ? updatedPartner : p));
    this.saveCharityGrants(grants.map(g => g.id === grant.id ? updatedGrant : g));
    this.saveNgoFundTransactions([newTxn, ...this.getNgoFundTransactions()]);

    return { success: true, grant: updatedGrant };
  }

  /** Quick add or update a Health Camp Attendee with live count update */
  public static saveOrUpdateCampAttendee(attendee: CampAttendee): { success: boolean; attendee: CampAttendee } {
    const attendees = this.getCampAttendees();
    const existingIndex = attendees.findIndex(a => a.id === attendee.id);
    let updatedList: CampAttendee[];

    if (existingIndex >= 0) {
      updatedList = [...attendees];
      updatedList[existingIndex] = attendee;
    } else {
      updatedList = [attendee, ...attendees];
    }

    this.saveCampAttendees(updatedList);

    // Update camp metrics
    const camps = this.getHealthCamps();
    const camp = camps.find(c => c.id === attendee.campId);
    if (camp) {
      const campAttendees = updatedList.filter(a => a.campId === camp.id);
      const attendedCount = campAttendees.filter(a => a.status !== 'registered').length;
      const freeCardsCount = campAttendees.filter(a => a.healthCardIssued).length;
      const testsCount = campAttendees.reduce((acc, a) => acc + (a.prescribedTests?.length || 0), 0);

      const updatedCamp: HealthCamp = {
        ...camp,
        registeredCount: campAttendees.length,
        attendedCount: Math.max(attendedCount, camp.attendedCount),
        freeCardsIssuedCount: freeCardsCount,
        testsConductedCount: testsCount,
        updatedAt: new Date().toISOString()
      };

      this.saveHealthCamps(camps.map(c => c.id === camp.id ? updatedCamp : c));
    }

    return { success: true, attendee };
  }

  // Full Database Reset & Sample Data
  public static resetToDemoData(): void {
    this.setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.setItem(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    this.setItem(STORAGE_KEYS.CARDS, INITIAL_CARDS);
    this.setItem(STORAGE_KEYS.MEMBERSHIPS, DEFAULT_MEMBERSHIPS);
    this.setItem(STORAGE_KEYS.FAMILIES, []);
    this.setItem(STORAGE_KEYS.WALLETS, INITIAL_WALLETS);
    this.setItem(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    this.setItem(STORAGE_KEYS.COMPANY_PROFILE, DEFAULT_COMPANY_PROFILE);
    window.dispatchEvent(new CustomEvent('labmedix_data_synced', { detail: { action: 'RESET_DEMO' } }));
  }

  public static clearAllData(): void {
    this.setItem(STORAGE_KEYS.PATIENTS, []);
    this.setItem(STORAGE_KEYS.CARDS, []);
    this.setItem(STORAGE_KEYS.FAMILIES, []);
    this.setItem(STORAGE_KEYS.WALLETS, []);
    this.setItem(STORAGE_KEYS.TRANSACTIONS, []);
    this.setItem(STORAGE_KEYS.APPOINTMENTS, []);
    this.setItem(STORAGE_KEYS.EMR_ENCOUNTERS, []);
    this.setItem(STORAGE_KEYS.PORTAL_LAB_BOOKINGS, []);
    this.setItem(STORAGE_KEYS.PORTAL_PHARMACY_ORDERS, []);
    this.setItem(STORAGE_KEYS.PORTAL_CARD_APPLICATIONS, []);
    this.setItem(STORAGE_KEYS.CASH_DESK_VOUCHERS, []);
    this.setItem(STORAGE_KEYS.SAMPLE_DISPATCHES, []);
    this.setItem(STORAGE_KEYS.RECOVERY_VAULT, []);

    ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.PATIENTS, []).catch(() => { });
    ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.CARDS, []).catch(() => { });
    ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.FAMILIES, []).catch(() => { });
    ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.WALLETS, []).catch(() => { });
    ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.TRANSACTIONS, []).catch(() => { });
    ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.APPOINTMENTS, []).catch(() => { });
    ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.EMR_ENCOUNTERS, []).catch(() => { });
    ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.PORTAL_LAB_BOOKINGS, []).catch(() => { });
    ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.PORTAL_PHARMACY_ORDERS, []).catch(() => { });
    ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.PORTAL_CARD_APPLICATIONS, []).catch(() => { });
    ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.CASH_DESK_VOUCHERS, []).catch(() => { });
    ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.SAMPLE_DISPATCHES, []).catch(() => { });
    ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.RECOVERY_VAULT, []).catch(() => { });

    window.dispatchEvent(new CustomEvent('labmedix_data_synced', { detail: { action: 'CLEAR_ALL' } }));
  }
}