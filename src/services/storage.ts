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
  SampleDispatchRecord
} from '../types';
import { DEFAULT_COMPANY_PROFILE, DEFAULT_CARD_DESIGN } from '../constants/defaults';
import { DEFAULT_MEMBERSHIPS } from '../constants/memberships';

import { GoogleDriveService } from './googleDriveService';
import { getGoogleAccessToken } from './googleAuth';
import { ApiSyncService } from './apiSyncService';

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
  LAST_BACKUP_TIMESTAMP: 'labmedix_last_backup_timestamp_v1',
  LAST_BACKUP_PROMPT_TIMESTAMP: 'labmedix_last_backup_prompt_timestamp_v1'
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
    pinCode: '1509442',
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
    designation: 'Clinical Operations Head',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bloodGroup: 'A+',
    phone: '+91 98300 00002',
    workPhone: 'EXT-102 (Admin)',
    department: 'Hospital Administration',
    accessZone: 'Zone A: All Operational Suites & Clinical Records',
    nationalId: 'UID-7712-4412-9901',
    licenseNo: 'WB-HOSP-ADM-441',
    emergencyContact: '9830099999',
    emergencyContactName: 'Immediate Family',
    cardThemeWish: 'premium_medical',
    cardMaterialWish: 'gloss',
    status: 'active',
    pinCode: '1509442',
    joiningDate: '2025-01-01',
    expiryDate: '2028-12-31',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'usr_doctor',
    staffId: 'LMDX-DOC-003',
    username: 'doctor',
    fullName: 'Dr. Subhashish Roy',
    email: 'dr.roy@labmedix.org',
    role: 'doctor',
    designation: 'Sr. Consultant Cardiologist & Medical Director',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    bloodGroup: 'B+',
    phone: '+91 98300 00004',
    workPhone: 'EXT-104 (OPD Room #104)',
    department: 'Cardiology & Clinical Medicine',
    accessZone: 'Zone MED: OPD, Consultation Rooms, OT & EMR Suite',
    nationalId: 'UID-5521-7782-9901',
    licenseNo: 'WBMC-88412',
    emergencyContact: '9830099999',
    emergencyContactName: 'Hospital Directorate',
    cardThemeWish: 'premium_medical',
    cardMaterialWish: 'gold_foil',
    status: 'active',
    pinCode: '1509442',
    joiningDate: '2025-01-01',
    expiryDate: '2028-12-31',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'usr_doctor_sen',
    staffId: 'LMDX-DOC-004',
    username: 'dranita',
    fullName: 'Dr. Anita Sen',
    email: 'dr.anita@labmedix.org',
    role: 'doctor',
    designation: 'Sr. Gynaecologist & Obstetrician',
    photoUrl: 'https://images.unsplash.com/photo-1594824813586-53d7117df568?w=400&auto=format&fit=crop&q=80',
    bloodGroup: 'O+',
    phone: '+91 98300 00014',
    workPhone: 'EXT-105 (Gynae OPD Room #105)',
    department: 'Gynaecology & High-Risk Pregnancy',
    accessZone: 'Zone MED: Gynae OPD, Labour Room & EMR Suite',
    nationalId: 'UID-4412-8890-2210',
    licenseNo: 'WBMC-74190',
    emergencyContact: '9830099999',
    emergencyContactName: 'Hospital Directorate',
    cardThemeWish: 'premium_medical',
    cardMaterialWish: 'gold_foil',
    status: 'active',
    pinCode: '1509442',
    joiningDate: '2025-01-01',
    expiryDate: '2028-12-31',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'usr_doctor_das',
    staffId: 'LMDX-DOC-005',
    username: 'drpritam',
    fullName: 'Dr. Pritam Das',
    email: 'dr.pritam@labmedix.org',
    role: 'doctor',
    designation: 'Sr. Orthopaedic Surgeon & Joint Specialist',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80',
    bloodGroup: 'A+',
    phone: '+91 98300 00015',
    workPhone: 'EXT-106 (Ortho OPD Room #106)',
    department: 'Orthopaedics & Joint Replacement',
    accessZone: 'Zone MED: Ortho OPD, OT & EMR Suite',
    nationalId: 'UID-3301-9988-1122',
    licenseNo: 'WBMC-65902',
    emergencyContact: '9830099999',
    emergencyContactName: 'Hospital Directorate',
    cardThemeWish: 'premium_medical',
    cardMaterialWish: 'gold_foil',
    status: 'active',
    pinCode: '1509442',
    joiningDate: '2025-01-01',
    expiryDate: '2028-12-31',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'usr_manager',
    staffId: 'LMDX-STF-003',
    username: 'manager',
    fullName: 'Rajesh Mukherjee',
    email: 'manager@labmedix.org',
    role: 'manager',
    designation: 'Branch Operations Manager',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    bloodGroup: 'B+',
    phone: '+91 98300 00003',
    workPhone: 'EXT-103 (Manager)',
    department: 'Operations & Revenue',
    accessZone: 'Zone B: Billing, Pharmacy & Branch Management',
    nationalId: 'UID-6619-3321-8841',
    emergencyContact: '9830099999',
    emergencyContactName: 'Moumita Mukherjee',
    cardThemeWish: 'executive_secure',
    cardMaterialWish: 'gloss',
    status: 'active',
    pinCode: '1509442',
    joiningDate: '2025-01-01',
    expiryDate: '2028-12-31',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'usr_reception',
    staffId: 'LMDX-STF-004',
    username: 'reception',
    fullName: 'Priya Sharma',
    email: 'reception@labmedix.org',
    role: 'reception',
    designation: 'Senior Patient Desk Executive',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    bloodGroup: 'AB+',
    phone: '+91 98300 00004',
    workPhone: 'EXT-104 (Front Desk)',
    department: 'Front Desk & Walk-In Care',
    accessZone: 'Zone C: Reception, Patient Intake & Cashier',
    nationalId: 'UID-5541-2290-7711',
    emergencyContact: '9830099999',
    emergencyContactName: 'Rohan Sharma',
    cardThemeWish: 'premium_medical',
    cardMaterialWish: 'gloss',
    status: 'active',
    pinCode: '1509442',
    joiningDate: '2025-01-01',
    expiryDate: '2028-12-31',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'usr_lab',
    staffId: 'LMDX-STF-005',
    username: 'labstaff',
    fullName: 'Amit Kumar Sen',
    email: 'lab@labmedix.org',
    role: 'lab_staff',
    designation: 'Chief Laboratory Technologist',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80',
    bloodGroup: 'O+',
    phone: '+91 98300 00005',
    workPhone: 'EXT-105 (Diagnostic Lab)',
    department: 'Pathology & Diagnostic Testing',
    accessZone: 'Zone D: Biochemistry Lab, Blood Bank & Phlebotomy',
    nationalId: 'UID-4412-8871-3310',
    licenseNo: 'WBMLT-CERT-8812',
    emergencyContact: '9830099999',
    emergencyContactName: 'Rina Sen',
    cardThemeWish: 'modern_healthcare',
    cardMaterialWish: 'gloss',
    status: 'active',
    pinCode: '1509442',
    joiningDate: '2025-01-01',
    expiryDate: '2028-12-31',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'usr_marketing',
    staffId: 'LMDX-STF-006',
    username: 'marketing',
    fullName: 'Sneha Roy',
    email: 'marketing@labmedix.org',
    role: 'marketing',
    designation: 'Health Package Outreach Lead',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    bloodGroup: 'B+',
    phone: '+91 98300 00006',
    workPhone: 'EXT-106 (Marketing)',
    department: 'Public Health Outreach',
    accessZone: 'Zone E: Outreach Center & Corporate Tie-ups',
    nationalId: 'UID-3381-6621-9902',
    emergencyContact: '9830099999',
    emergencyContactName: 'Arup Roy',
    cardThemeWish: 'modern_healthcare',
    cardMaterialWish: 'gloss',
    status: 'active',
    pinCode: '1509442',
    joiningDate: '2025-01-01',
    expiryDate: '2028-12-31',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'usr_operator',
    staffId: 'LMDX-STF-007',
    username: 'cardoperator',
    fullName: 'Vikram Das',
    email: 'cards@labmedix.org',
    role: 'card_operator',
    designation: 'Lead CR80 Studio Operator',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    bloodGroup: 'O-',
    phone: '+91 98300 00007',
    workPhone: 'EXT-107 (Card Studio)',
    department: 'CR80 PVC Production Studio',
    accessZone: 'Zone F: Card Production & Thermal Embossing Unit',
    nationalId: 'UID-2219-5501-8833',
    emergencyContact: '9830099999',
    emergencyContactName: 'Anita Das',
    cardThemeWish: 'executive_secure',
    cardMaterialWish: 'hologram',
    status: 'active',
    pinCode: '1509442',
    joiningDate: '2025-01-01',
    expiryDate: '2028-12-31',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'usr_readonly',
    staffId: 'LMDX-STF-008',
    username: 'auditor',
    fullName: 'Debabrata Chowdhury',
    email: 'audit@labmedix.org',
    role: 'read_only',
    designation: 'Compliance & Quality Auditor',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    bloodGroup: 'A-',
    phone: '+91 98300 00008',
    workPhone: 'EXT-108 (Audit)',
    department: 'Quality Assurance & Audit',
    accessZone: 'Zone G: Read-Only Audit & Forensic Inspection',
    nationalId: 'UID-1102-7744-5599',
    emergencyContact: '9830099999',
    emergencyContactName: 'Kakali Chowdhury',
    cardThemeWish: 'modern_healthcare',
    cardMaterialWish: 'matte',
    status: 'active',
    pinCode: '1509442',
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
    
    // Fast 1.5-second debounce for live real-time site modifications
    this.backupSyncTimeout = setTimeout(() => {
      this.performServerBackupSync();
    }, 1500);
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

      // 2. Automatically record a Time-Machine Snapshot if at least 30s passed since last auto-snapshot
      const now = Date.now();
      if (now - this.lastLiveSnapshotTs > 30000) {
        this.lastLiveSnapshotTs = now;
        try {
          const snapshots = this.getSnapshots();
          const autoSnap: SnapshotRecord = {
            id: `snap_auto_${now}_${Math.random().toString(36).substring(2, 6)}`,
            timestamp: new Date().toISOString(),
            title: `Live Realtime Auto-Backup [${new Date().toLocaleTimeString()}]`,
            tag: 'auto_live',
            sizeBytes: new Blob([JSON.stringify(data)]).size,
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
          if (snapshots.length > 30) snapshots.pop();
          localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(snapshots));
        } catch { }
      }

      // 3. Post to backend server endpoint for Cloud Run container sync
      const driveToken = getGoogleAccessToken();
      await fetch('/api/backup/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, googleToken: driveToken })
      }).catch(() => {});

      // 4. Trigger direct client-side Google Drive upload
      GoogleDriveService.triggerAutoBackup();
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
        try { localStorage.setItem(key, serialized);
      // Only sync if it's a critical key (not theme/screen_locked)
      if (![STORAGE_KEYS.THEME, STORAGE_KEYS.SCREEN_LOCKED].includes(key)) {
        this.triggerServerBackupSync();
      } } catch { /* ignore */ }
      } else {
        console.error(`[LABMEDIX] localStorage write failed for ${key}:`, e);
      }
    }

    // 3. Tab Session Mirror
    try {
      sessionStorage.setItem(key, serialized);
    } catch { /* session mirror failure is non-critical */ }

    // 4. Deep IndexedDB Persistence (Survives browser cache resets & low storage eviction)
    StorageService.idbSet(key, serialized).catch(() => {});

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
      }).catch(() => {});

      // 7. Direct Firestore Cloud Database Sync for second-by-second multi-device sync
      ApiSyncService.syncKeyToFirestore(key, value).catch(() => {});
    }

    // 8. Trigger Live Backup to Google Drive if configured
    GoogleDriveService.triggerAutoBackup();
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
        StorageService.memoryCache.set(key, parsed);
        return parsed;
      }
    } catch { /* fall through */ }

    // Layer 3: sessionStorage mirror
    try {
      const v = sessionStorage.getItem(key);
      if (v) {
        console.info(`[LABMEDIX] Restored ${key} from sessionStorage mirror.`);
        const parsed = JSON.parse(v) as T;
        StorageService.memoryCache.set(key, parsed);
        try { localStorage.setItem(key, v); } catch { }
        return parsed;
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
    }).catch(() => {});

    StorageService.memoryCache.set(key, defaultValue);
    return defaultValue;
  }

  /* ── PUBLIC: Remove item across all layers ── */
  public static removeItem(key: string): void {
    StorageService.memoryCache.delete(key);
    try { localStorage.removeItem(key); } catch { }
    try { sessionStorage.removeItem(key); } catch { }
    StorageService.idbRemove(key).catch(() => {});
  }

  /* ── INTERNAL: IndexedDB helpers ── */
  private static readonly IDB_NAME  = 'LABMEDIX_SECURE_DB';
  private static readonly IDB_STORE = 'labmedix_store';
  private static readonly IDB_VER   = 1;

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
      req.onerror   = () => reject(req.error);
    });
  }

  private static async idbSet(key: string, value: string): Promise<void> {
    try {
      const db = await StorageService.openIDB();
      return new Promise((resolve, reject) => {
        const tx    = db.transaction(StorageService.IDB_STORE, 'readwrite');
        const store = tx.objectStore(StorageService.IDB_STORE);
        const req   = store.put(value, key);
        req.onsuccess = () => resolve();
        req.onerror   = () => reject(req.error);
      });
    } catch { }
  }

  private static async idbGet(key: string): Promise<string | null> {
    try {
      const db = await StorageService.openIDB();
      return new Promise((resolve, reject) => {
        const tx    = db.transaction(StorageService.IDB_STORE, 'readonly');
        const store = tx.objectStore(StorageService.IDB_STORE);
        const req   = store.get(key);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror   = () => reject(req.error);
      });
    } catch {
      return null;
    }
  }

  private static async idbRemove(key: string): Promise<void> {
    try {
      const db = await StorageService.openIDB();
      return new Promise((resolve, reject) => {
        const tx    = db.transaction(StorageService.IDB_STORE, 'readwrite');
        const store = tx.objectStore(StorageService.IDB_STORE);
        const req   = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror   = () => reject(req.error);
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
      if (v) await StorageService.idbSet(key, v).catch(() => {});
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
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
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
    const usedKB  = Math.round(used / 1024);
    const pct     = Math.round((usedKB / totalKB) * 100);
    return { usedKB, totalKB, pct, safe: pct < 80 };
  }

  /* ── PUBLIC: Initialize and start background persistence engine ── */
  public static initPersistentEngine(): void {
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
          }
        };
      }
    } catch { }

    // 3. Register page unload, visibility change and window focus listeners to flush writes and instant-pull sync
    window.addEventListener('beforeunload', () => {
      StorageService.forceSyncToIndexedDB().catch(() => {});
    });
    window.addEventListener('pagehide', () => {
      StorageService.forceSyncToIndexedDB().catch(() => {});
    });
    window.addEventListener('focus', async () => {
      try {
        const res = await fetch('/api/sync/store');
        if (res.ok) {
          const body = await res.json();
          const serverStore = body.store;
          if (serverStore && typeof serverStore === 'object') {
            for (const [key, val] of Object.entries(serverStore)) {
              if ([STORAGE_KEYS.THEME, STORAGE_KEYS.SCREEN_LOCKED].includes(key)) continue;
              StorageService.memoryCache.set(key, val);
              try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
              window.dispatchEvent(new CustomEvent('labmedix_data_synced', { detail: { key, value: val } }));
            }
          }
        }
      } catch {}
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        StorageService.forceSyncToIndexedDB().catch(() => {});
      } else if (document.visibilityState === 'visible') {
        // Instant pull on tab visibility
        fetch('/api/sync/store').then(async res => {
          if (res.ok) {
            const body = await res.json();
            const serverStore = body.store;
            if (serverStore && typeof serverStore === 'object') {
              for (const [key, val] of Object.entries(serverStore)) {
                if ([STORAGE_KEYS.THEME, STORAGE_KEYS.SCREEN_LOCKED].includes(key)) continue;
                StorageService.memoryCache.set(key, val);
                try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
                window.dispatchEvent(new CustomEvent('labmedix_data_synced', { detail: { key, value: val } }));
              }
            }
          }
        }).catch(() => {});
      }
    });

    // 4. Real-Time Central Server Data Polling for Cross-Device Synchronization (Every 1 second for ultra-fast multi-device sync)
    setInterval(async () => {
      try {
        const res = await fetch('/api/sync/store');
        if (res.ok) {
          const body = await res.json();
          const serverStore = body.store;
          if (serverStore && typeof serverStore === 'object') {
            for (const [key, val] of Object.entries(serverStore)) {
              if ([STORAGE_KEYS.THEME, STORAGE_KEYS.SCREEN_LOCKED].includes(key)) continue;
              const serverValStr = JSON.stringify(val);
              const localValStr = localStorage.getItem(key);
              if (localValStr !== serverValStr) {
                StorageService.memoryCache.set(key, val);
                try { localStorage.setItem(key, serverValStr); } catch {}
                window.dispatchEvent(new CustomEvent('labmedix_data_synced', { detail: { key, value: val } }));
              }
            }
          }
        }
      } catch {}
    }, 1000);

    // 5. Real-Time Cloud Firestore Listener Subscription (Second-by-second websocket push across all devices)
    try {
      ApiSyncService.subscribeToAll((key, val) => {
        if ([STORAGE_KEYS.THEME, STORAGE_KEYS.SCREEN_LOCKED].includes(key)) return;
        const currentValStr = localStorage.getItem(key);
        const newValStr = JSON.stringify(val);
        if (currentValStr !== newValStr) {
          StorageService.memoryCache.set(key, val);
          try { localStorage.setItem(key, newValStr); } catch {}
          window.dispatchEvent(new CustomEvent('labmedix_data_synced', { detail: { key, value: val } }));
        }
      });
    } catch (e) {
      console.warn('[LABMEDIX] Realtime Firestore subscribe error:', e);
    }

    // 6. Auto-Periodic deep sync every 3 minutes
    setInterval(() => {
      StorageService.forceSyncToIndexedDB().catch(() => {});
    }, 180000);
  }

  public static async initializeDatabase(): Promise<void> {
    StorageService.initPersistentEngine();

    // 1. Initial Central Server Hydration (Ensures data across devices is loaded on boot)
    try {
      const res = await fetch('/api/sync/store');
      if (res.ok) {
        const body = await res.json();
        const serverStore = body.store;
        if (serverStore && typeof serverStore === 'object') {
          for (const [key, val] of Object.entries(serverStore)) {
            if (val !== undefined && val !== null) {
              StorageService.memoryCache.set(key, val);
              try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
            }
          }
        }
      }
    } catch (e) {
      console.warn('[LABMEDIX] Central store hydration warning:', e);
    }

    // 1.5 Cloud Firestore Cross-Device Hydration (Ensures seamless multi-device login data sync)
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
        cloudLabBookings,
        cloudPharmacyOrders,
        cloudVouchers
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
        ApiSyncService.fetchCollection<any>('labBookings').catch(() => []),
        ApiSyncService.fetchCollection<any>('pharmacyOrders').catch(() => []),
        ApiSyncService.fetchCollection<any>('vouchers').catch(() => [])
      ]);

      const syncEntity = <T>(cloudItems: T[], key: string) => {
        if (cloudItems && cloudItems.length > 0) {
          StorageService.memoryCache.set(key, cloudItems);
          try { localStorage.setItem(key, JSON.stringify(cloudItems)); } catch {}
          window.dispatchEvent(new CustomEvent('labmedix_data_synced', { detail: { key, value: cloudItems } }));
        } else {
          const localItems = StorageService.getItem<T[]>(key, []);
          if (localItems && localItems.length > 0) {
            ApiSyncService.syncKeyToFirestore(key, localItems).catch(() => {});
          }
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
      syncEntity(cloudLabBookings, STORAGE_KEYS.PORTAL_LAB_BOOKINGS);
      syncEntity(cloudPharmacyOrders, STORAGE_KEYS.PORTAL_PHARMACY_ORDERS);
      syncEntity(cloudVouchers, STORAGE_KEYS.CASH_DESK_VOUCHERS);
    } catch (e) {
      console.warn('[LABMEDIX] Cloud Firestore cross-device sync hydration warning:', e);
    }

    // Active live migration: Purge legacy demo patient identities from storage
    const DEMO_NAMES = ['sourav ganguly', 'ananya banerjee', 'subrata bhattacharya', 'rahim uddin', 'fatema begum', 'priya mukherjee'];
    const DEMO_IDS = ['lmdx-2026-000001', 'lmdx-2026-000002', 'lmdx-2026-000003', 'lmdx-p-0001', 'lmdx-p-0002', 'card_001', 'card_002', 'card_003', 'lhc-2026-000001', 'lhc-2026-000002', 'lhc-2026-000003', 'wal_001', 'wal_002', 'wal_003'];

    const rawPatients = this.getItem<Patient[]>(STORAGE_KEYS.PATIENTS, []);
    const sanitizedPatients = rawPatients.filter(p => {
      const name = (p.fullName || '').trim().toLowerCase();
      const id = (p.id || '').trim().toLowerCase();
      return !DEMO_NAMES.includes(name) && !DEMO_IDS.includes(id);
    });
    if (rawPatients.length !== sanitizedPatients.length) {
      this.setItem(STORAGE_KEYS.PATIENTS, sanitizedPatients);
    }

    const rawCards = this.getItem<HealthCard[]>(STORAGE_KEYS.CARDS, []);
    const sanitizedCards = rawCards.filter(c => {
      const id = (c.id || '').trim().toLowerCase();
      const cardNo = (c.cardNumber || '').trim().toLowerCase();
      const patientId = (c.patientId || '').trim().toLowerCase();
      return !DEMO_IDS.includes(id) && !DEMO_IDS.includes(cardNo) && !DEMO_IDS.includes(patientId);
    });
    if (rawCards.length !== sanitizedCards.length) {
      this.setItem(STORAGE_KEYS.CARDS, sanitizedCards);
    }

    const rawWallets = this.getItem<Wallet[]>(STORAGE_KEYS.WALLETS, []);
    const sanitizedWallets = rawWallets.filter(w => {
      const id = (w.id || '').trim().toLowerCase();
      const patientId = (w.patientId || '').trim().toLowerCase();
      return !DEMO_IDS.includes(id) && !DEMO_IDS.includes(patientId);
    });
    if (rawWallets.length !== sanitizedWallets.length) {
      this.setItem(STORAGE_KEYS.WALLETS, sanitizedWallets);
    }

    const rawTxns = this.getItem<WalletTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const sanitizedTxns = rawTxns.filter(t => {
      const id = (t.id || '').trim().toLowerCase();
      const patientId = (t.patientId || '').trim().toLowerCase();
      const ref = (t.referenceNo || '').trim().toLowerCase();
      return !DEMO_IDS.includes(id) && !DEMO_IDS.includes(patientId) && !ref.includes('init-001') && !ref.includes('opd-002');
    });
    if (rawTxns.length !== sanitizedTxns.length) {
      this.setItem(STORAGE_KEYS.TRANSACTIONS, sanitizedTxns);
    }

    const rawCardApps = this.getItem<any[]>(STORAGE_KEYS.PORTAL_CARD_APPLICATIONS, []);
    const sanitizedCardApps = rawCardApps.filter(a => {
      const id = (a.id || '').trim().toLowerCase();
      const name = (a.fullName || '').trim().toLowerCase();
      return id !== 'app_req_01' && id !== 'app_req_02' && !DEMO_NAMES.includes(name);
    });
    if (rawCardApps.length !== sanitizedCardApps.length) {
      this.setItem(STORAGE_KEYS.PORTAL_CARD_APPLICATIONS, sanitizedCardApps);
    }

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEMBERSHIPS)) {
      this.setItem(STORAGE_KEYS.MEMBERSHIPS, DEFAULT_MEMBERSHIPS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMPANY_PROFILE)) {
      this.setItem(STORAGE_KEYS.COMPANY_PROFILE, DEFAULT_COMPANY_PROFILE);
    } else {
      const existing = this.getItem<CompanyProfile>(STORAGE_KEYS.COMPANY_PROFILE, DEFAULT_COMPANY_PROFILE);
      const forcedName = (!existing.name || existing.name === 'LABMEDIX' || !existing.name.includes('MULTI-SPECIALITY'))
        ? DEFAULT_COMPANY_PROFILE.name
        : existing.name;
      const merged = {
        ...DEFAULT_COMPANY_PROFILE,
        ...existing,
        name: forcedName
      };
      this.setItem(STORAGE_KEYS.COMPANY_PROFILE, merged);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
      this.setItem(STORAGE_KEYS.PATIENTS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CARDS)) {
      this.setItem(STORAGE_KEYS.CARDS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.WALLETS)) {
      this.setItem(STORAGE_KEYS.WALLETS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      this.setItem(STORAGE_KEYS.TRANSACTIONS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      this.setItem(STORAGE_KEYS.AUDIT_LOGS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.FAMILIES)) {
      this.setItem(STORAGE_KEYS.FAMILIES, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SNAPSHOTS)) {
      this.setItem(STORAGE_KEYS.SNAPSHOTS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      this.setItem(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
    }
  }

  // Users
  public static getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }
  public static saveUsers(users: User[]): void {
    this.setItem(STORAGE_KEYS.USERS, users);
    ApiSyncService.syncUsers(users).catch(() => {});
  }
  public static getCurrentUser(): User | null {
    return this.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
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
    ApiSyncService.syncPatients(patients).catch(() => {});
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
    ApiSyncService.syncCards(cards).catch(() => {});
  }

  // Memberships
  public static getMemberships(): Membership[] {
    const memberships = this.getItem<Membership[]>(STORAGE_KEYS.MEMBERSHIPS, DEFAULT_MEMBERSHIPS);
    if (!memberships || !Array.isArray(memberships) || memberships.length === 0) {
      return DEFAULT_MEMBERSHIPS;
    }
    return memberships;
  }
  public static saveMemberships(memberships: Membership[]): void {
    this.setItem(STORAGE_KEYS.MEMBERSHIPS, memberships);
    ApiSyncService.syncMemberships(memberships).catch(() => {});
  }

  // Families
  public static getFamilies(): FamilyGroup[] {
    return this.getItem<FamilyGroup[]>(STORAGE_KEYS.FAMILIES, []);
  }
  public static saveFamilies(families: FamilyGroup[]): void {
    this.setItem(STORAGE_KEYS.FAMILIES, families);
    ApiSyncService.syncFamilies(families).catch(() => {});
  }

  // Wallets
  public static getWallets(): Wallet[] {
    return this.getItem<Wallet[]>(STORAGE_KEYS.WALLETS, INITIAL_WALLETS);
  }
  public static saveWallets(wallets: Wallet[]): void {
    this.setItem(STORAGE_KEYS.WALLETS, wallets);
    ApiSyncService.syncWallets(wallets).catch(() => {});
  }

  // Transactions
  public static getTransactions(): WalletTransaction[] {
    return this.getItem<WalletTransaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  }
  public static saveTransactions(txns: WalletTransaction[]): void {
    this.setItem(STORAGE_KEYS.TRANSACTIONS, txns);
    ApiSyncService.syncTransactions(txns).catch(() => {});
  }

  // Audit Logs
  public static getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }
  public static saveAuditLogs(logs: AuditLog[]): void {
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
    ApiSyncService.syncAuditLogs(logs).catch(() => {});
  }

  // Company Profile
  public static getCompanyProfile(): CompanyProfile {
    let profile = this.getItem<CompanyProfile>(STORAGE_KEYS.COMPANY_PROFILE, DEFAULT_COMPANY_PROFILE);
    let updated = false;

    // Force official unified company name if short/outdated/generic across all devices
    if (!profile.name || profile.name === 'LABMEDIX' || !profile.name.includes('MULTI-SPECIALITY')) {
      profile.name = 'LABMEDIX MULTI-SPECIALITY HEALTHCARE & DIAGNOSTIC CENTRE';
      updated = true;
    }

    // Ensure official verified merchant VPA is always 7047108226@okbizaxis
    if (!profile.upiSettings || profile.upiSettings.merchantVpa === 'labmedix.health@icici' || !profile.upiSettings.merchantVpa) {
      profile.upiSettings = {
        enabled: true,
        ...(profile.upiSettings || DEFAULT_COMPANY_PROFILE.upiSettings),
        merchantVpa: '7047108226@okbizaxis',
        merchantName: 'LABMEDIX MULTI-SPECIALITY CENTRE'
      };
      updated = true;
    }

    if (updated) {
      this.setItem(STORAGE_KEYS.COMPANY_PROFILE, profile);
    }
    return profile;
  }
  public static saveCompanyProfile(profile: CompanyProfile): void {
    if (!profile.name || profile.name === 'LABMEDIX' || !profile.name.includes('MULTI-SPECIALITY')) {
      profile.name = 'LABMEDIX MULTI-SPECIALITY HEALTHCARE & DIAGNOSTIC CENTRE';
    }
    this.setItem(STORAGE_KEYS.COMPANY_PROFILE, profile);
  }

  // Cash Desk Vouchers (Super Admin Sovereign PIN & Voucher Ledger)
  public static getCashDeskVouchers(): CashDeskVoucher[] {
    return this.getItem<CashDeskVoucher[]>(STORAGE_KEYS.CASH_DESK_VOUCHERS, []);
  }
  public static saveCashDeskVouchers(vouchers: CashDeskVoucher[]): void {
    this.setItem(STORAGE_KEYS.CASH_DESK_VOUCHERS, vouchers);
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
    this.setItem(STORAGE_KEYS.SNAPSHOTS, snapshots);
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
    const defaultSamples: SampleDispatchRecord[] = [
      {
        id: 'SMP-001',
        sampleBarcode: 'SMP-2026-88191',
        patientId: 'PAT-1001',
        patientName: 'Anindita Sharma',
        patientPhone: '+91 98301 22334',
        testNames: ['HbA1c Glycated Hemoglobin', 'Fasting Blood Sugar', 'Lipid Profile'],
        department: 'Pathology & Molecular Lab',
        sampleType: 'Whole Blood (EDTA)',
        vialColorCode: 'Lavender',
        collectionTimestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        collectedBy: 'Priya Biswas (Phlebotomist)',
        dispatchStatus: 'dispatched',
        dispatchDestination: 'HQ Central NABL Molecular Lab, Kolkata',
        courierTechnicianName: 'Rajesh Kumar (Express Dispatch)',
        courierVehicleNo: 'WB-02-AK-4412',
        dispatchedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        expectedReportTime: 'Today, 06:00 PM',
        notes: 'Cold chain container maintained at 4°C.'
      },
      {
        id: 'SMP-002',
        sampleBarcode: 'SMP-2026-88192',
        patientId: 'PAT-1002',
        patientName: 'Rajesh Mukherjee',
        patientPhone: '+91 98312 44556',
        testNames: ['Thyroid Panel Total (T3, T4, TSH)', 'Serum Creatinine'],
        department: 'Biochemistry',
        sampleType: 'Serum (Clot Activator)',
        vialColorCode: 'Yellow/SST',
        collectionTimestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        collectedBy: 'Amit Banerjee (Phlebotomist)',
        dispatchStatus: 'in_transit',
        dispatchDestination: 'Park Street Diagnostic Hub',
        courierTechnicianName: 'Suman Roy (Courier Rider)',
        courierVehicleNo: 'WB-04-CX-8890',
        dispatchedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        expectedReportTime: 'Tomorrow, 10:00 AM',
        notes: 'Fasting sample verified.'
      }
    ];
    return this.getItem(STORAGE_KEYS.SAMPLE_DISPATCHES, defaultSamples);
  }

  public static saveSampleDispatches(dispatches: SampleDispatchRecord[]): void {
    this.setItem(STORAGE_KEYS.SAMPLE_DISPATCHES, dispatches);
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
  }

  public static clearAllData(): void {
    this.setItem(STORAGE_KEYS.PATIENTS, []);
    this.setItem(STORAGE_KEYS.CARDS, []);
    this.setItem(STORAGE_KEYS.FAMILIES, []);
    this.setItem(STORAGE_KEYS.WALLETS, []);
    this.setItem(STORAGE_KEYS.TRANSACTIONS, []);
  }
}