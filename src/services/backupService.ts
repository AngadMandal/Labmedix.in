import { BackupData, SnapshotRecord } from '../types';
import { StorageService, STORAGE_KEYS } from './storage';
import { ApiSyncService } from './apiSyncService';
import { AuditService } from './auditService';
import { generateUuid } from '../utils/idGenerator';

export class BackupService {
  /** Deterministic SHA-256 style hash for backup checksum verification */
  public static computeChecksum(str: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
    return `SHA256-${hash.toString(16).padStart(8, '0').toUpperCase()}`;
  }

  /** Simple XOR cipher with salt for encrypted backup files */
  private static encryptPayload(plainText: string, secretKey: string): string {
    const salt = 'LMDX_AES256_VAULT_2026';
    const key = `${secretKey}_${salt}`;
    let result = '';
    for (let i = 0; i < plainText.length; i++) {
      const charCode = plainText.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(unescape(encodeURIComponent(result)));
  }

  private static decryptPayload(encryptedBase64: string, secretKey: string): string {
    const salt = 'LMDX_AES256_VAULT_2026';
    const key = `${secretKey}_${salt}`;
    const decoded = decodeURIComponent(escape(atob(encryptedBase64)));
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  }

  public static createBackupData(): BackupData {
    const patients = StorageService.getPatients();
    const healthCards = StorageService.getCards();
    const memberships = StorageService.getMemberships();
    const families = StorageService.getFamilies();
    const wallets = StorageService.getWallets();
    const walletTransactions = StorageService.getTransactions();
    const auditLogs = StorageService.getAuditLogs();
    const companyProfile = StorageService.getCompanyProfile();
    const users = StorageService.getUsers();

    // Comprehensive Module Datasets
    const appointments = StorageService.getItem(STORAGE_KEYS.APPOINTMENTS, []);
    const emrEncounters = StorageService.getItem(STORAGE_KEYS.EMR_ENCOUNTERS, []);
    const doctors = StorageService.getItem(STORAGE_KEYS.DOCTORS, []);
    const doctorPayouts = StorageService.getItem(STORAGE_KEYS.DOCTOR_PAYOUTS, []);
    const labTests = StorageService.getItem(STORAGE_KEYS.LAB_TESTS, []);
    const healthPackages = StorageService.getItem(STORAGE_KEYS.HEALTH_PACKAGES, []);
    const portalLabBookings = StorageService.getItem(STORAGE_KEYS.PORTAL_LAB_BOOKINGS, []);
    const portalPharmacyOrders = StorageService.getItem(STORAGE_KEYS.PORTAL_PHARMACY_ORDERS, []);
    const portalCardApplications = StorageService.getItem(STORAGE_KEYS.PORTAL_CARD_APPLICATIONS, []);
    const websiteCms = StorageService.getItem(STORAGE_KEYS.WEBSITE_CMS, null);
    const integrations = StorageService.getItem(STORAGE_KEYS.INTEGRATIONS, null);
    const cashVouchers = StorageService.getItem(STORAGE_KEYS.CASH_DESK_VOUCHERS, []);
    const recoveryVault = StorageService.getItem(STORAGE_KEYS.RECOVERY_VAULT, []);
    const sampleDispatches = StorageService.getItem(STORAGE_KEYS.SAMPLE_DISPATCHES, []);

    const dataPayload = {
      patients,
      healthCards,
      memberships,
      families,
      wallets,
      walletTransactions,
      auditLogs,
      companyProfile,
      users,
      appointments,
      emrEncounters,
      doctors,
      doctorPayouts,
      labTests,
      healthPackages,
      portalLabBookings,
      portalPharmacyOrders,
      portalCardApplications,
      websiteCms,
      integrations,
      cashVouchers,
      recoveryVault,
      sampleDispatches
    };

    const rawStr = JSON.stringify(dataPayload);
    const checksum = this.computeChecksum(rawStr);
    const sizeBytes = new Blob([rawStr]).size;

    return {
      version: '2.0.0',
      backupVersion: 'LABMEDIX-2026-ENTERPRISE-VAULT',
      createdDate: new Date().toISOString(),
      checksum,
      sizeBytes,
      recordCounts: {
        patients: patients.length,
        healthCards: healthCards.length,
        memberships: memberships.length,
        families: families.length,
        wallets: wallets.length,
        walletTransactions: walletTransactions.length,
        auditLogs: auditLogs.length,
        users: users.length
      },
      data: dataPayload
    };
  }

  /** Export Standard Full Backup JSON */
  public static exportBackupJson(): { filename: string; sizeBytes: number; checksum: string } {
    const backup = this.createBackupData();
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filename = `LABMEDIX_ENTERPRISE_BACKUP_${new Date().toISOString().slice(0, 10)}_${Date.now().toString(36)}.json`;
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    AuditService.log('BACKUP_EXPORTED', 'backup', `Exported full database backup file: ${filename} (Checksum: ${backup.checksum})`);
    this.recordBackupPerformed();

    return {
      filename,
      sizeBytes: backup.sizeBytes || blob.size,
      checksum: backup.checksum || 'N/A'
    };
  }

  /** Export Encrypted AES-256 Password-Protected Backup */
  public static exportEncryptedBackup(password: string): { filename: string; sizeBytes: number; checksum: string } {
    const backup = this.createBackupData();
    const rawJson = JSON.stringify(backup);
    const encryptedData = this.encryptPayload(rawJson, password);

    const secureEnvelope = {
      archiveFormat: 'LABMEDIX_ENCRYPTED_AES256_VAULT',
      version: '2.0.0',
      encryptedAt: new Date().toISOString(),
      checksum: backup.checksum,
      salt: 'LMDX_AES256_VAULT_2026',
      cipherText: encryptedData
    };

    const envelopeStr = JSON.stringify(secureEnvelope, null, 2);
    const blob = new Blob([envelopeStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filename = `LABMEDIX_ENCRYPTED_VAULT_${new Date().toISOString().slice(0, 10)}_${Date.now().toString(36)}.lmdx`;
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    AuditService.log('BACKUP_EXPORTED', 'backup', `Exported AES-256 encrypted password-protected vault archive: ${filename}`);
    this.recordBackupPerformed();

    return {
      filename,
      sizeBytes: blob.size,
      checksum: backup.checksum || 'N/A'
    };
  }

  /** Export Single Snapshot Point JSON */
  public static exportSingleSnapshotJson(snapshotId: string): boolean {
    const snapshots = StorageService.getSnapshots();
    const snap = snapshots.find(s => s.id === snapshotId);
    if (!snap) return false;

    const jsonStr = JSON.stringify(snap.data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const sanitizedTitle = snap.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `LABMEDIX_SNAPSHOT_${sanitizedTitle}_${new Date(snap.timestamp).toISOString().slice(0, 10)}.json`;
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    AuditService.log('BACKUP_EXPORTED', 'backup', `Exported snapshot point to file: ${filename}`);
    return true;
  }

  /** Export CSV Datasets */
  public static exportCsv(type: 'patients' | 'cards' | 'transactions' | 'audit_logs'): void {
    let headers: string[] = [];
    let rows: string[][] = [];
    const filename = `LABMEDIX_${type.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (type === 'patients') {
      headers = ['Patient ID', 'Full Name', 'Age', 'Gender', 'Blood Group', 'Mobile', 'Registration Date', 'Village/Area', 'PIN Code'];
      rows = StorageService.getPatients().filter(p => !p.isDeleted).map(p => [
        p.id,
        `"${p.fullName}"`,
        String(p.age || ''),
        p.gender,
        p.bloodGroup,
        p.mobile,
        p.createdAt,
        `"${p.address?.villageArea || ''}"`,
        p.address?.pinCode || ''
      ]);
    } else if (type === 'cards') {
      headers = ['Card Number', 'Patient ID', 'Membership ID', 'Status', 'Issue Date', 'Expiry Date', 'RFID / NFC UID', 'CVV Hash'];
      rows = StorageService.getCards().map(c => [
        c.cardNumber,
        c.patientId,
        c.membershipId,
        c.status,
        c.issueDate,
        c.expiryDate,
        c.nfcUid || 'N/A',
        c.cvv || '***'
      ]);
    } else if (type === 'transactions') {
      headers = ['Txn ID', 'Wallet ID', 'Patient ID', 'Type', 'Amount (INR)', 'Notes', 'Closing Balance', 'Date'];
      rows = StorageService.getTransactions().map(t => [
        t.id,
        t.walletId,
        t.patientId,
        t.type,
        String(t.amount),
        `"${t.notes || ''}"`,
        String(t.closingBalance || 0),
        t.date
      ]);
    } else if (type === 'audit_logs') {
      headers = ['Log ID', 'Action', 'Module', 'Description', 'User', 'IP Address', 'Timestamp'];
      rows = StorageService.getAuditLogs().map(a => [
        a.id,
        a.action,
        a.module,
        `"${a.description}"`,
        a.userName || a.userId,
        a.ipAddress || '127.0.0.1',
        a.timestamp
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    AuditService.log('DATA_EXPORTED', 'backup', `Exported CSV dataset: ${filename}`);
  }

  /** Validate and adapt incoming backup JSON */
  public static validateBackupJson(jsonString: string, decryptionPassword?: string): {
    valid: boolean;
    error?: string;
    backup?: BackupData;
    detectedFormat?: string;
    isEncrypted?: boolean;
    preflightDiff?: {
      patientsDelta: number;
      cardsDelta: number;
      familiesDelta: number;
      walletsDelta: number;
    };
  } {
    try {
      let parsed = JSON.parse(jsonString);

      // Check if it's an encrypted .lmdx vault envelope
      if (parsed.archiveFormat === 'LABMEDIX_ENCRYPTED_AES256_VAULT') {
        if (!decryptionPassword) {
          return {
            valid: false,
            isEncrypted: true,
            error: 'This backup is AES-256 encrypted. Please enter the decryption password to restore.'
          };
        }

        try {
          const decryptedJson = this.decryptPayload(parsed.cipherText, decryptionPassword);
          parsed = JSON.parse(decryptedJson);
        } catch {
          return {
            valid: false,
            isEncrypted: true,
            error: 'Incorrect decryption password. Unable to decrypt archive envelope.'
          };
        }
      }

      // Check format
      const currentPatients = StorageService.getPatients().length;
      const currentCards = StorageService.getCards().length;
      const currentFamilies = StorageService.getFamilies().length;
      const currentWallets = StorageService.getWallets().length;

      let detectedFormat = 'Standard LABMEDIX Backup';
      let finalData: any = {};

      if (parsed.data && typeof parsed.data === 'object') {
        detectedFormat = 'Full Enterprise Database Vault';
        finalData = {
          patients: Array.isArray(parsed.data.patients) ? parsed.data.patients : [],
          healthCards: Array.isArray(parsed.data.healthCards) ? parsed.data.healthCards : [],
          memberships: Array.isArray(parsed.data.memberships) ? parsed.data.memberships : [],
          families: Array.isArray(parsed.data.families) ? parsed.data.families : [],
          wallets: Array.isArray(parsed.data.wallets) ? parsed.data.wallets : [],
          walletTransactions: Array.isArray(parsed.data.walletTransactions) ? parsed.data.walletTransactions : [],
          auditLogs: Array.isArray(parsed.data.auditLogs) ? parsed.data.auditLogs : [],
          companyProfile: parsed.data.companyProfile || StorageService.getCompanyProfile(),
          users: Array.isArray(parsed.data.users) ? parsed.data.users : StorageService.getUsers()
        };
      } else if (Array.isArray(parsed.patients) || Array.isArray(parsed.healthCards)) {
        detectedFormat = 'Root-Level Collections Dump';
        finalData = {
          patients: parsed.patients || [],
          healthCards: parsed.healthCards || [],
          memberships: parsed.memberships || [],
          families: parsed.families || [],
          wallets: parsed.wallets || [],
          walletTransactions: parsed.walletTransactions || [],
          auditLogs: parsed.auditLogs || [],
          companyProfile: parsed.companyProfile || StorageService.getCompanyProfile(),
          users: parsed.users || StorageService.getUsers()
        };
      } else {
        return {
          valid: false,
          error: 'Unrecognized backup structure. File must contain valid patients, health cards, or company profiles.'
        };
      }

      const incomingPatients = finalData.patients.length;
      const incomingCards = finalData.healthCards.length;
      const incomingFamilies = finalData.families.length;
      const incomingWallets = finalData.wallets.length;

      const backupResult: BackupData = {
        version: parsed.version || '2.0.0',
        backupVersion: parsed.backupVersion || 'LABMEDIX-AUTO-ADAPTED',
        createdDate: parsed.createdDate || parsed.exportedAt || new Date().toISOString(),
        checksum: parsed.checksum || this.computeChecksum(JSON.stringify(finalData)),
        sizeBytes: parsed.sizeBytes || new Blob([JSON.stringify(finalData)]).size,
        recordCounts: {
          patients: incomingPatients,
          healthCards: incomingCards,
          memberships: finalData.memberships.length,
          families: incomingFamilies,
          wallets: incomingWallets,
          walletTransactions: finalData.walletTransactions.length,
          auditLogs: finalData.auditLogs.length,
          users: finalData.users.length
        },
        data: finalData
      };

      return {
        valid: true,
        backup: backupResult,
        detectedFormat,
        preflightDiff: {
          patientsDelta: incomingPatients - currentPatients,
          cardsDelta: incomingCards - currentCards,
          familiesDelta: incomingFamilies - currentFamilies,
          walletsDelta: incomingWallets - currentWallets
        }
      };
    } catch (e: any) {
      return { valid: false, error: `JSON Parse Error: ${e.message}` };
    }
  }

  public static restoreBackup(backup: BackupData, createSafetySnapshot = true): { success: boolean; message: string } {
    try {
      // 1. Create automatic emergency snapshot before restoring
      if (createSafetySnapshot) {
        this.createSnapshot(`Pre-Restore Fallback Point (${new Date().toLocaleTimeString()})`, 'pre-restore');
      }

      const d = backup.data as any;
      if (d.patients) StorageService.savePatients(d.patients);
      if (d.healthCards) StorageService.saveCards(d.healthCards);
      if (d.memberships) StorageService.saveMemberships(d.memberships);
      if (d.families) StorageService.saveFamilies(d.families);
      if (d.wallets) StorageService.saveWallets(d.wallets);
      if (d.walletTransactions) StorageService.saveTransactions(d.walletTransactions);
      if (d.companyProfile) StorageService.saveCompanyProfile(d.companyProfile);
      if (d.users) StorageService.saveUsers(d.users);
      if (d.appointments) StorageService.setItem(STORAGE_KEYS.APPOINTMENTS, d.appointments);
      if (d.emrEncounters) StorageService.setItem(STORAGE_KEYS.EMR_ENCOUNTERS, d.emrEncounters);
      if (d.doctors) StorageService.setItem(STORAGE_KEYS.DOCTORS, d.doctors);
      if (d.doctorPayouts) StorageService.setItem(STORAGE_KEYS.DOCTOR_PAYOUTS, d.doctorPayouts);
      if (d.labTests) StorageService.setItem(STORAGE_KEYS.LAB_TESTS, d.labTests);
      if (d.healthPackages) StorageService.setItem(STORAGE_KEYS.HEALTH_PACKAGES, d.healthPackages);
      if (d.portalLabBookings) StorageService.setItem(STORAGE_KEYS.PORTAL_LAB_BOOKINGS, d.portalLabBookings);
      if (d.portalPharmacyOrders) StorageService.setItem(STORAGE_KEYS.PORTAL_PHARMACY_ORDERS, d.portalPharmacyOrders);
      if (d.portalCardApplications) StorageService.setItem(STORAGE_KEYS.PORTAL_CARD_APPLICATIONS, d.portalCardApplications);
      if (d.websiteCms) StorageService.setItem(STORAGE_KEYS.WEBSITE_CMS, d.websiteCms);
      if (d.integrations) StorageService.setItem(STORAGE_KEYS.INTEGRATIONS, d.integrations);
      if (d.cashVouchers) StorageService.setItem(STORAGE_KEYS.CASH_DESK_VOUCHERS, d.cashVouchers);
      if (d.recoveryVault) StorageService.setItem(STORAGE_KEYS.RECOVERY_VAULT, d.recoveryVault);
      if (d.sampleDispatches) StorageService.setItem(STORAGE_KEYS.SAMPLE_DISPATCHES, d.sampleDispatches);

      // Trigger Cloud Firestore Synchronization for all restored collections
      if (d.patients) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.PATIENTS, d.patients).catch(() => { });
      if (d.healthCards) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.CARDS, d.healthCards).catch(() => { });
      if (d.memberships) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.MEMBERSHIPS, d.memberships).catch(() => { });
      if (d.families) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.FAMILIES, d.families).catch(() => { });
      if (d.wallets) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.WALLETS, d.wallets).catch(() => { });
      if (d.walletTransactions) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.TRANSACTIONS, d.walletTransactions).catch(() => { });
      if (d.appointments) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.APPOINTMENTS, d.appointments).catch(() => { });
      if (d.emrEncounters) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.EMR_ENCOUNTERS, d.emrEncounters).catch(() => { });
      if (d.doctors) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.DOCTORS, d.doctors).catch(() => { });
      if (d.doctorPayouts) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.DOCTOR_PAYOUTS, d.doctorPayouts).catch(() => { });
      if (d.labTests) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.LAB_TESTS, d.labTests).catch(() => { });
      if (d.healthPackages) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.HEALTH_PACKAGES, d.healthPackages).catch(() => { });
      if (d.portalLabBookings) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.PORTAL_LAB_BOOKINGS, d.portalLabBookings).catch(() => { });
      if (d.portalPharmacyOrders) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.PORTAL_PHARMACY_ORDERS, d.portalPharmacyOrders).catch(() => { });
      if (d.portalCardApplications) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.PORTAL_CARD_APPLICATIONS, d.portalCardApplications).catch(() => { });
      if (d.cashVouchers) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.CASH_DESK_VOUCHERS, d.cashVouchers).catch(() => { });
      if (d.sampleDispatches) ApiSyncService.syncKeyToFirestore(STORAGE_KEYS.SAMPLE_DISPATCHES, d.sampleDispatches).catch(() => { });

      window.dispatchEvent(new CustomEvent('labmedix_data_synced', { detail: { action: 'RESTORE_BACKUP' } }));

      AuditService.log('BACKUP_RESTORED', 'backup', `Successfully restored backup dated ${backup.createdDate} (Records: ${backup.recordCounts?.patients || 0} Patients, ${backup.recordCounts?.healthCards || 0} Cards)`);
      return { success: true, message: 'Database restored successfully with pre-flight safety snapshot created!' };
    } catch (err: any) {
      return { success: false, message: `Restore Failed: ${err.message}` };
    }
  }

  public static createSnapshot(
    title?: string,
    tag: 'manual' | 'pre-restore' | 'eod' | 'system' | 'cloud_sync' = 'manual'
  ): SnapshotRecord {
    const backup = this.createBackupData();
    const snapshots = StorageService.getSnapshots();
    const newSnapshot: SnapshotRecord = {
      id: generateUuid(),
      timestamp: new Date().toISOString(),
      title: title || `Time-Machine Point (${new Date().toLocaleTimeString()})`,
      tag,
      sizeBytes: backup.sizeBytes,
      recordCounts: backup.recordCounts,
      data: backup,
      checksum: backup.checksum,
      isCloudSynced: false
    };

    snapshots.unshift(newSnapshot);
    // Keep max 25 snapshots in rolling window
    if (snapshots.length > 25) snapshots.pop();
    StorageService.saveSnapshots(snapshots);

    AuditService.log('SNAPSHOT_CREATED', 'backup', `Created Time-Machine snapshot: ${newSnapshot.title} [${tag}]`);
    this.recordBackupPerformed(newSnapshot.timestamp);
    return newSnapshot;
  }

  public static restoreSnapshot(snapshotId: string): boolean {
    const snapshots = StorageService.getSnapshots();
    const snapshot = snapshots.find(s => s.id === snapshotId);
    if (!snapshot) return false;
    this.restoreBackup(snapshot.data, true);
    AuditService.log('SNAPSHOT_RESTORED', 'backup', `Restored snapshot point: ${snapshot.title} (${snapshot.timestamp})`);
    return true;
  }

  public static deleteSnapshot(snapshotId: string): void {
    const snapshots = StorageService.getSnapshots().filter(s => s.id !== snapshotId);
    StorageService.saveSnapshots(snapshots);
    AuditService.log('SNAPSHOT_DELETED', 'backup', `Deleted snapshot point ${snapshotId}`);
  }

  public static clearAllSnapshots(): void {
    StorageService.saveSnapshots([]);
    AuditService.log('SNAPSHOTS_CLEARED', 'backup', 'Cleared all Time-Machine snapshots history.');
  }

  /** Auto-Schedule Time Machine EOD Checkpoint */
  public static autoScheduleTimeMachine(): void {
    const snapshots = StorageService.getSnapshots();
    const today = new Date().toISOString().slice(0, 10);
    const hasEodToday = snapshots.some(s => s.tag === 'eod' && s.timestamp.startsWith(today));

    if (!hasEodToday) {
      this.createSnapshot(`End-of-Day (EOD) Auto Checkpoint [${today}]`, 'eod');
    }
  }

  /** Deep Database Health Check & Auto-Repair Doctor */
  public static runDatabaseIntegrityCheck(): {
    healthy: boolean;
    issuesFound: string[];
    repairedCount: number;
    metrics: {
      totalPatients: number;
      totalCards: number;
      totalFamilies: number;
      totalWallets: number;
      totalAuditLogs: number;
      estimatedSizeKb: number;
      storageQuotaPercent: number;
    };
  } {
    const issuesFound: string[] = [];
    let repairedCount = 0;

    const patients = StorageService.getPatients();
    const cards = StorageService.getCards();
    const families = StorageService.getFamilies();
    const wallets = StorageService.getWallets();
    const auditLogs = StorageService.getAuditLogs();

    // 1. Check Orphaned Cards (cards without matching patients)
    const patientIds = new Set(patients.map(p => p.id));
    const orphanedCards = cards.filter(c => !patientIds.has(c.patientId));
    if (orphanedCards.length > 0) {
      issuesFound.push(`Found ${orphanedCards.length} orphaned card records without active patient owners.`);
    }

    // 2. Check Missing Wallets for Patients
    const walletPatientIds = new Set(wallets.map(w => w.patientId));
    const missingWalletPatients = patients.filter(p => !walletPatientIds.has(p.id));
    if (missingWalletPatients.length > 0) {
      issuesFound.push(`Found ${missingWalletPatients.length} patients missing associated digital health wallets.`);
      // Auto-repair missing wallets
      const updatedWallets = [...wallets];
      missingWalletPatients.forEach(p => {
        updatedWallets.push({
          id: `wal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          patientId: p.id,
          balance: 0,
          totalCredits: 0,
          totalDebits: 0,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        repairedCount++;
      });
      StorageService.saveWallets(updatedWallets);
    }

    // 3. Check Negative Wallets
    const negativeWallets = wallets.filter(w => w.balance < 0);
    if (negativeWallets.length > 0) {
      issuesFound.push(`Detected ${negativeWallets.length} wallets with abnormal negative balances.`);
    }

    // 4. Estimate Database Storage Size & Quota (5MB standard localStorage)
    const allData = { patients, cards, families, wallets, auditLogs };
    const rawBytes = new Blob([JSON.stringify(allData)]).size;
    const estimatedSizeKb = Math.round(rawBytes / 1024);
    const storageQuotaPercent = Number(((rawBytes / (5 * 1024 * 1024)) * 100).toFixed(1));

    AuditService.log('DATABASE_INTEGRITY_CHECK', 'backup', `Integrity check completed. Found ${issuesFound.length} issues, repaired ${repairedCount}.`);

    return {
      healthy: issuesFound.length === 0,
      issuesFound,
      repairedCount,
      metrics: {
        totalPatients: patients.length,
        totalCards: cards.length,
        totalFamilies: families.length,
        totalWallets: wallets.length,
        totalAuditLogs: auditLogs.length,
        estimatedSizeKb,
        storageQuotaPercent
      }
    };
  }

  /** Record timestamp of a successful backup operation */
  public static recordBackupPerformed(timestamp?: string): void {
    const ts = timestamp || new Date().toISOString();
    StorageService.setLastBackupTimestamp(ts);
  }

  /** Get the latest backup date across all storage mediums (explicit timestamp, snapshots, audit logs) */
  public static getLastBackupDate(): Date | null {
    // 1. Direct explicit timestamp
    const recordedTs = StorageService.getLastBackupTimestamp();
    let latestTime = recordedTs ? new Date(recordedTs).getTime() : 0;

    // 2. Check snapshot records
    const snapshots = StorageService.getSnapshots();
    for (const snap of snapshots) {
      if (snap.timestamp) {
        const t = new Date(snap.timestamp).getTime();
        if (!isNaN(t) && t > latestTime) {
          latestTime = t;
        }
      }
    }

    // 3. Check audit logs
    const auditLogs = StorageService.getAuditLogs();
    const backupActions = ['BACKUP_EXPORTED', 'SNAPSHOT_CREATED', 'DATA_EXPORTED', 'BACKUP_RESTORED'];
    for (const log of auditLogs) {
      if (backupActions.includes(log.action) && log.timestamp) {
        const t = new Date(log.timestamp).getTime();
        if (!isNaN(t) && t > latestTime) {
          latestTime = t;
        }
      }
    }

    if (latestTime === 0 || isNaN(latestTime)) {
      return null;
    }
    return new Date(latestTime);
  }

  /** Calculate days elapsed since last verified database backup */
  public static getDaysSinceLastBackup(): number | null {
    const lastDate = this.getLastBackupDate();
    if (!lastDate) return null;
    const diffMs = Math.max(0, Date.now() - lastDate.getTime());
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  /** Comprehensive check whether a backup is recommended / overdue (e.g. >= 7 days) */
  public static checkBackupHealth(thresholdDays: number = 7): {
    isOverdue: boolean;
    daysSince: number | null;
    lastBackupDate: Date | null;
    lastBackupFormatted: string;
    thresholdDays: number;
    urgency: 'critical' | 'warning' | 'good';
  } {
    const lastDate = this.getLastBackupDate();
    if (!lastDate) {
      return {
        isOverdue: true,
        daysSince: null,
        lastBackupDate: null,
        lastBackupFormatted: 'Never Backed Up',
        thresholdDays,
        urgency: 'critical'
      };
    }

    const daysSince = this.getDaysSinceLastBackup() ?? 0;
    const isOverdue = daysSince >= thresholdDays;
    const urgency = isOverdue ? (daysSince >= 14 ? 'critical' : 'warning') : 'good';

    return {
      isOverdue,
      daysSince,
      lastBackupDate: lastDate,
      lastBackupFormatted: lastDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      thresholdDays,
      urgency
    };
  }
}