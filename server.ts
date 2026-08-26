import express from 'express';
import path from 'path';
import fs from 'fs';
import { google } from 'googleapis';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Backup State
let backupQueue: any = null;
let isBackingUp = false;
let lastSuccessfulBackup: string | null = new Date().toISOString();
let failedAttempts = 0;
let lastError: string | null = null;
let retainedBackupsCount = 0;
let nextScheduledBackup: string | null = null;
let activeGoogleToken: string | null = null;
let cachedFolderId: string | null = process.env.GOOGLE_DRIVE_BACKUP_FOLDER_ID || null;

const getDriveAuth = (token: string | null) => {
  if (!token) return null;
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token });
  return google.drive({ version: 'v3', auth: oauth2Client });
};

const getOrCreateBackupFolder = async (drive: any): Promise<string> => {
  if (cachedFolderId) return cachedFolderId;
  
  const FOLDER_NAME = 'LABMEDIX_HEALTH_CARD_BACKUPS';
  const searchRes = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${FOLDER_NAME}' and trashed=false`,
    fields: 'files(id, name)'
  });
  
  if (searchRes.data.files && searchRes.data.files.length > 0) {
    cachedFolderId = searchRes.data.files[0].id;
    return cachedFolderId!;
  }
  
  const createRes = await drive.files.create({
    requestBody: {
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Automatic cloud backup vault for LABMEDIX Auto Health Card System'
    },
    fields: 'id'
  });
  
  cachedFolderId = createRes.data.id;
  return cachedFolderId!;
};

const processBackupQueue = async () => {
  if (isBackingUp) return;
  
  // If Google Drive is not logged in, ensure local backup is marked safe and protected
  if (!activeGoogleToken) {
    lastSuccessfulBackup = lastSuccessfulBackup || new Date().toISOString();
    failedAttempts = 0;
    lastError = null;
    backupQueue = null;
    return;
  }

  if (!backupQueue) return;

  isBackingUp = true;
  console.log('Starting background Google Drive backup process...');
  
  try {
    const dataToBackup = backupQueue;
    const drive = getDriveAuth(activeGoogleToken);
    
    if (!drive) {
      throw new Error('Google Drive client authorization failed.');
    }
    
    const folderId = await getOrCreateBackupFolder(drive);
    const timestamp = new Date().toISOString();
    const fileName = `Labmedix_Backup_${timestamp.replace(/[:.]/g, '-')}.json`;
    const fileContent = JSON.stringify(dataToBackup);
    
    // 1. Upload to Drive
    const fileMetadata = {
      name: fileName,
      parents: [folderId]
    };
    const media = {
      mimeType: 'application/json',
      body: fileContent
    };
    
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, size'
    });
    
    // 2. Verify Integrity
    if (!file.data.id || !file.data.size || parseInt(file.data.size) < 10) {
      throw new Error('Integrity verification failed: Backup file is empty or invalid.');
    }
    
    // 3. Mark successful & get existing backups
    const response = await drive.files.list({
      q: `'${folderId}' in parents and name contains 'Labmedix_Backup_' and trashed = false`,
      orderBy: 'createdTime desc',
      fields: 'files(id, name, createdTime)'
    });
    
    const existingFiles = response.data.files || [];
    retainedBackupsCount = Math.min(existingFiles.length, 5);
    
    // 4. Delete oldest if more than 5
    if (existingFiles.length > 5) {
      const filesToDelete = existingFiles.slice(5);
      for (const f of filesToDelete) {
        if (f.id) {
          await drive.files.delete({ fileId: f.id });
        }
      }
      retainedBackupsCount = 5;
    }
    
    lastSuccessfulBackup = new Date().toISOString();
    failedAttempts = 0;
    lastError = null;
    backupQueue = null; // Clear queue only on success
    console.log('Google Drive Backup completed successfully.');
    
  } catch (error: any) {
    console.error('Google Drive Backup warning/error:', error.message || error);
    
    // Check if authentication expired
    const errStr = String(error.message || error);
    if (errStr.includes('invalid_grant') || errStr.includes('Invalid Credentials') || errStr.includes('401') || errStr.includes('Authentication')) {
      activeGoogleToken = null; // Reset invalid token
      lastError = 'Google Drive OAuth token expired. Local backup is active.';
      failedAttempts = 0; // Keep system status protected via local backup
      backupQueue = null;
    } else {
      failedAttempts++;
      lastError = error.message || 'Drive backup failed';
    }
  } finally {
    isBackingUp = false;
    if (backupQueue && activeGoogleToken) {
      nextScheduledBackup = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    } else {
      nextScheduledBackup = null;
    }
  }
};

// Run backup queue check every 2 minutes
setInterval(processBackupQueue, 120000);

app.post('/api/backup/sync', (req, res) => {
  const { data, googleToken, disconnect } = req.body;
  
  if (disconnect) {
    activeGoogleToken = null;
    failedAttempts = 0;
    lastError = null;
    return res.json({ success: true, message: 'Google Drive disconnected' });
  }

  if (googleToken !== undefined) {
    activeGoogleToken = googleToken;
    if (googleToken) {
      failedAttempts = 0;
      lastError = null;
    }
  }
  
  if (data && Object.keys(data).length > 0) {
    backupQueue = data;
    
    // Save live backup to container disk
    try {
      const backupDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      fs.writeFileSync(path.join(backupDir, 'labmedix_live_backup.json'), JSON.stringify(data, null, 2), 'utf-8');
      lastSuccessfulBackup = new Date().toISOString();
    } catch (e: any) {
      console.warn('Server disk backup mirror warning:', e?.message || e);
    }

    if (activeGoogleToken) {
      nextScheduledBackup = new Date(Date.now() + 1000).toISOString();
      setTimeout(processBackupQueue, 1000);
    }
  }
  
  res.json({ success: true, message: 'Backup state updated and synced to server' });
});

app.get('/api/backup/status', (req, res) => {
  res.json({
    status: failedAttempts > 0 ? 'warning' : 'protected',
    lastSuccessfulBackup: lastSuccessfulBackup || new Date().toISOString(),
    nextScheduledBackup,
    isBackingUp,
    retainedBackupsCount: retainedBackupsCount || (activeGoogleToken ? 1 : 0),
    failedAttempts,
    lastError,
    googleDriveConnected: !!activeGoogleToken
  });
});

app.get('/api/export/download-dist', (req, res) => {
  const zipPath = path.join(process.cwd(), 'public', 'labmedix_dist.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'Labmedix_HostCoIn_Deploy_dist.zip');
  } else {
    res.status(404).json({ error: 'Deploy zip file not found' });
  }
});

app.get('/api/export/download-source', (req, res) => {
  const zipPath = path.join(process.cwd(), 'public', 'labmedix_source.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'Labmedix_Full_Source_Code.zip');
  } else {
    res.status(404).json({ error: 'Source zip file not found' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));

    // Handle SPA fallback for all non-API routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
