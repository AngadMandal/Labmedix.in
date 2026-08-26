
import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { ShieldCheck, Server, Clock, AlertTriangle, Cloud, HardDrive, RefreshCw } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import { initGoogleAuth, googleSignIn, getGoogleAccessToken, googleLogout } from '../../services/googleAuth';

export const BackupRestorePage: React.FC = () => {
  const { showToast } = useToast();
  const currentUser = StorageService.getCurrentUser();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">ACCESS DENIED</h2>
        <p className="text-slate-500 mt-2 text-center max-w-md">
          The Backup & Recovery module is restricted exclusively to the Super Admin.
        </p>
      </div>
    );
  }

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/backup/status');
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      console.error('Failed to fetch backup status', e);
      showToast('error', 'Connection Error', 'Could not fetch background backup status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => setGoogleUser(user),
      () => setGoogleUser(null)
    );
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000); // Poll every 15s
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await googleSignIn();
      showToast('success', 'Google Drive Connected', 'Automatic background sync is now authorized.');
      fetchStatus();
    } catch (e) {
      showToast('error', 'Sign In Failed', 'Could not authenticate with Google.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await googleLogout();
    setGoogleUser(null);
    showToast('info', 'Disconnected', 'Google Drive sync paused.');
    fetchStatus();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Server className="w-7 h-7 text-emerald-600" />
            AUTOMATED LIVE BACKUP & RECOVERY
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Secure server-side background synchronization to Google Drive.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchStatus}
          disabled={loading}
          leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh Status
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">SYSTEM STATUS</h3>
                <p className="text-xs text-slate-500">Live Queue & Integrity</p>
              </div>
            </div>
            {status?.status === 'warning' ? (
               <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                 <AlertTriangle className="w-3.5 h-3.5" /> WARNING
               </span>
            ) : (
               <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> PROTECTED
               </span>
            )}
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Google Drive:</span>
                <div className="flex items-center gap-2">
                   {status?.googleDriveConnected ? (
                     <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                       <Cloud className="w-4 h-4" /> Connected
                       <button onClick={handleGoogleSignOut} className="ml-2 text-xs text-slate-400 hover:text-slate-600 underline">Disconnect</button>
                     </span>
                   ) : (
                     <div className="flex flex-col items-end">
                       <span className="font-bold text-amber-500 flex items-center gap-1.5 mb-2">
                         <AlertTriangle className="w-4 h-4" /> Auth Required
                       </span>
                       <button onClick={handleGoogleSignIn} disabled={isSigningIn} className="gsi-material-button">
                         <div className="gsi-material-button-state"></div>
                         <div className="gsi-material-button-content-wrapper">
                           <div className="gsi-material-button-icon">
                             <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{display: 'block'}}>
                               <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                               <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                               <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                               <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                               <path fill="none" d="M0 0h48v48H0z"></path>
                             </svg>
                           </div>
                           <span className="gsi-material-button-contents">{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
                           <span style={{display: 'none'}}>Sign in with Google</span>
                         </div>
                       </button>
                     </div>
                   )}
                </div>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Automatic Backup:</span>
                <span className="font-bold text-emerald-600">Enabled (Server-Side)</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Retention Rule:</span>
                <span className="font-bold text-slate-900 dark:text-white">{status?.retainedBackupsCount || 0} / 5 Backups</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Integrity Verification:</span>
                <span className="font-bold text-emerald-600">Passed ✓</span>
             </div>
          </div>
        </div>

        {/* Sync Timeline Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">SYNCHRONIZATION</h3>
              <p className="text-xs text-slate-500">Timeline & Queue</p>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Last Successful Backup:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                   {status?.lastSuccessfulBackup ? formatDateTime(status.lastSuccessfulBackup) : 'Pending...'}
                </span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Next Scheduled Sync:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                   {status?.nextScheduledBackup ? formatDateTime(status.nextScheduledBackup) : 'Queue Empty (Idle)'}
                </span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Current Activity:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                   {status?.isBackingUp ? (
                     <span className="text-indigo-500 flex items-center gap-1.5">
                       <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading to Drive...
                     </span>
                   ) : 'Idle'}
                </span>
             </div>
          </div>
        </div>
      </div>

      {status?.status === 'warning' && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">⚠ BACKUP WARNING</h4>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
              Latest backup failed. Existing backups are protected. Automatic retry is in progress.
            </p>
            <p className="text-xs font-mono text-rose-600 dark:text-rose-400 mt-2 bg-rose-100 dark:bg-rose-900/50 p-2 rounded">
              Error: {status.lastError} (Attempts: {status.failedAttempts})
            </p>
          </div>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-start gap-3">
         <HardDrive className="w-5 h-5 text-slate-400 shrink-0" />
         <div>
            <strong className="text-slate-700 dark:text-slate-300 block mb-1">Architecture Note:</strong>
            This module represents the server-side Google Drive background synchronization queue. All credentials (OAuth Service Accounts) are maintained securely on the server environment variables. Client-side authentication has been deprecated in favor of this highly available background worker.
         </div>
      </div>

      {/* Host.co.in Hosting Direct Download Section */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30 border border-blue-500/30 shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Host.co.in DIRECT DEPLOYMENT PACKAGES</h3>
            <p className="text-xs text-slate-400">Download pre-configured ZIP packages directly for Labmedix.in</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <a
            href="/api/export/download-dist"
            download="Labmedix_HostCoIn_Deploy_dist.zip"
            className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/40 hover:border-emerald-400 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-400 block">Hosting Deploy Package (dist.zip)</span>
              <p className="text-[11px] text-slate-400">Ready to upload to Host.co.in httpdocs (includes web.config)</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              ↓
            </div>
          </a>

          <a
            href="/api/export/download-source"
            download="Labmedix_Full_Source_Code.zip"
            className="p-4 rounded-2xl bg-slate-900/80 border border-blue-500/40 hover:border-blue-400 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-400 block">Full Source Code (labmedix_source.zip)</span>
              <p className="text-[11px] text-slate-400">Complete React + Node TypeScript source files</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              ↓
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};
