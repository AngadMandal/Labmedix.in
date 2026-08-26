const fs = require('fs');
let code = fs.readFileSync('src/services/storage.ts', 'utf8');

const backupLogic = `
  private static backupSyncTimeout: any = null;

  private static triggerServerBackupSync() {
    if (this.backupSyncTimeout) {
      clearTimeout(this.backupSyncTimeout);
    }
    
    // Debounce for 3 seconds
    this.backupSyncTimeout = setTimeout(() => {
      this.performServerBackupSync();
    }, 3000);
  }

  private static async performServerBackupSync() {
    try {
      // Gather all critical data
      const data = {
        users: this.getUsers(),
        patients: this.getPatients(),
        cards: this.getCards(), // Note: these are getting decrypted on read? Oh wait, getCards decrypts them.
        memberships: this.getMemberships(),
        families: this.getFamilies(),
        wallets: this.getWallets(),
        transactions: this.getTransactions(),
        auditLogs: this.getAuditLogs(),
        companyProfile: this.getCompanyProfile(),
        cashDeskVouchers: this.getCashDeskVouchers(),
        timestamp: new Date().toISOString()
      };

      await fetch('/api/backup/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });
    } catch (e) {
      console.warn('Failed to sync backup to server:', e);
    }
  }
`;

code = code.replace(
  /export class StorageService \{/,
  "export class StorageService {\n" + backupLogic
);

code = code.replace(
  /localStorage\.setItem\(key, serialized\);/g,
  `localStorage.setItem(key, serialized);\n      // Only sync if it's a critical key (not theme/screen_locked)\n      if (![STORAGE_KEYS.THEME, STORAGE_KEYS.SCREEN_LOCKED].includes(key)) {\n        this.triggerServerBackupSync();\n      }`
);

fs.writeFileSync('src/services/storage.ts', code);
console.log('Patched StorageService for background backups');
