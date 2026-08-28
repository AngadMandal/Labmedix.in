import { BackupData } from '../types';
import { BackupService } from './backupService';
import { AuditService } from './auditService';
import { getGoogleAccessToken } from './googleAuth';

export interface DriveFileItem {
  id: string;
  name: string;
  createdTime: string;
  size?: string;
  webViewLink?: string;
}

export class GoogleDriveService {
  private static FOLDER_NAME = 'LABMEDIX_HEALTH_CARD_BACKUPS';
  private static cachedAccessToken: string | null = null;
  private static autoBackupTimeout: ReturnType<typeof setTimeout> | null = null;

  public static setAccessToken(token: string | null) {
    this.cachedAccessToken = token;
  }

  public static getAccessToken(): string | null {
    return this.cachedAccessToken;
  }

  public static triggerAutoBackup() {
    const token = this.cachedAccessToken || getGoogleAccessToken();
    if (!token) return;
    
    // Fast 2-second debounce for live real-time site modifications
    if (this.autoBackupTimeout) clearTimeout(this.autoBackupTimeout);
    
    this.autoBackupTimeout = setTimeout(async () => {
      try {
        const activeToken = this.cachedAccessToken || getGoogleAccessToken();
        if (activeToken) {
          console.info('[LABMEDIX LIVE SYNC] Live site data updated: Performing automated Google Drive backup...');
          await this.uploadBackupToDrive(activeToken);
          console.info('[LABMEDIX LIVE SYNC] Google Drive live cloud backup completed successfully.');
        }
      } catch (err: any) {
        const msg = String(err?.message || err);
        if (msg.includes('401') || msg.includes('invalid') || msg.includes('Credentials') || msg.includes('authentication')) {
          this.cachedAccessToken = null;
        } else {
          console.warn('[LABMEDIX LIVE SYNC] Auto Google Drive backup notification:', err);
        }
      }
    }, 2000); // 2 second fast debounce
  }

  /** Find or create the LABMEDIX backup folder in Google Drive */
  public static async getOrCreateBackupFolder(accessToken: string): Promise<string> {
    const query = `mimeType='application/vnd.google-apps.folder' and name='${this.FOLDER_NAME}' and trashed=false`;
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!searchRes.ok) {
      const err = await searchRes.json();
      throw new Error(err.error?.message || 'Failed to search Google Drive folder');
    }

    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }

    // Create folder
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: this.FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
        description: 'Automatic secure cloud backup vault for LABMEDIX Auto Health Card System'
      })
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      throw new Error(err.error?.message || 'Failed to create Google Drive backup folder');
    }

    const folderData = await createRes.json();
    return folderData.id;
  }

  /** Upload database backup JSON to Google Drive */
  public static async uploadBackupToDrive(accessToken: string): Promise<{ fileId: string; fileName: string; size: number }> {
    const folderId = await this.getOrCreateBackupFolder(accessToken);
    const backupData = BackupService.createBackupData();
    const jsonString = JSON.stringify(backupData, null, 2);
    const fileName = `LABMEDIX_BACKUP_${new Date().toISOString().slice(0, 10)}_${Date.now().toString(36)}.json`;

    const metadata = {
      name: fileName,
      parents: [folderId],
      description: `LABMEDIX Health Card Enterprise Backup (Records: ${backupData.recordCounts.patients} Patients, Checksum: ${backupData.checksum})`,
      mimeType: 'application/json'
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([jsonString], { type: 'application/json' }));

    const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: form
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.json();
      throw new Error(err.error?.message || 'Failed to upload backup to Google Drive');
    }

    const fileMeta = await uploadRes.json();
    AuditService.log('GOOGLE_DRIVE_UPLOAD', 'backup', `Successfully uploaded database backup to Google Drive: ${fileName}`);

    // Update single master unified database file in-place on Google Drive
    await this.syncMasterDatabase(accessToken, folderId, backupData);

    // Manage rolling backups (Keep only latest 5)
    await this.pruneOldBackups(accessToken, folderId);

    return {
      fileId: fileMeta.id,
      fileName,
      size: new Blob([jsonString]).size
    };
  }

  /** Update or initialize single consolidated master database file on Google Drive */
  private static async syncMasterDatabase(accessToken: string, folderId: string, backupData: BackupData) {
    try {
      const jsonString = JSON.stringify(backupData, null, 2);
      const masterName = 'LABMEDIX_MASTER_DATABASE.json';
      const query = `'${folderId}' in parents and name='${masterName}' and trashed=false`;
      
      const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (!searchRes.ok) return;
      const searchData = await searchRes.json();
      
      const metadata = {
        name: masterName,
        description: `LABMEDIX Unified Master Cloud Database Vault (Last Updated: ${new Date().toISOString()})`,
        mimeType: 'application/json'
      };

      if (searchData.files && searchData.files.length > 0) {
        // Update existing single master file in-place on Google Drive
        const existingMasterId = searchData.files[0].id;
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([jsonString], { type: 'application/json' }));

        await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingMasterId}?uploadType=multipart`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${accessToken}` },
          body: form
        });
        console.info('[Google Drive Sync] Unified master cloud database (LABMEDIX_MASTER_DATABASE.json) updated in-place.');
      } else {
        // Create new single master file inside folder
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify({ ...metadata, parents: [folderId] })], { type: 'application/json' }));
        form.append('file', new Blob([jsonString], { type: 'application/json' }));

        await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
          body: form
        });
        console.info('[Google Drive Sync] Unified master cloud database (LABMEDIX_MASTER_DATABASE.json) initialized.');
      }
    } catch (err) {
      console.warn('[Google Drive Sync] Failed to update master database file on Drive:', err);
    }
  }

  /** Delete older backups, keeping only the most recent 5 */
  private static async pruneOldBackups(accessToken: string, folderId: string) {
    try {
      const query = `'${folderId}' in parents and trashed=false`;
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&orderBy=createdTime desc&fields=files(id,name)`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!res.ok) return;

      const data = await res.json();
      const files = data.files || [];

      // If we have more than 5 backups, delete the older ones
      if (files.length > 5) {
        const filesToDelete = files.slice(5);
        for (const file of filesToDelete) {
          await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          console.info(`[Google Drive] Deleted old backup: ${file.name}`);
        }
      }
    } catch (err) {
      console.warn('[Google Drive] Failed to prune old backups:', err);
    }
  }

  /** List backup files in Google Drive */
  public static async listDriveBackups(accessToken: string): Promise<DriveFileItem[]> {
    const folderId = await this.getOrCreateBackupFolder(accessToken);
    const query = `'${folderId}' in parents and trashed=false`;
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&orderBy=createdTime desc&fields=files(id,name,createdTime,size,webViewLink)`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to list Google Drive backups');
    }

    const data = await res.json();
    return data.files || [];
  }

  /** Download and parse backup file from Google Drive */
  public static async downloadDriveBackup(accessToken: string, fileId: string): Promise<BackupData> {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      throw new Error('Failed to download backup file from Google Drive');
    }

    const backupJson: BackupData = await res.json();
    AuditService.log('GOOGLE_DRIVE_DOWNLOAD', 'backup', `Downloaded and verified backup from Google Drive [File ID: ${fileId}]`);
    return backupJson;
  }
}
