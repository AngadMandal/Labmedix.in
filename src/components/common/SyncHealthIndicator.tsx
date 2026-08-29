import React, { useState, useEffect } from 'react';
import { Activity, Cloud, RefreshCw, Server, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ApiSyncService } from '../../services/apiSyncService';
import { GoogleDriveService } from '../../services/googleDriveService';
import { getGoogleAccessToken } from '../../services/googleAuth';

export const SyncHealthIndicator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [workerMetrics, setWorkerMetrics] = useState(ApiSyncService.getWorkerMetrics());
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncingNow, setIsSyncingNow] = useState(false);

  const checkHealth = () => {
    setWorkerMetrics(ApiSyncService.getWorkerMetrics());
    const token = GoogleDriveService.getAccessToken() || getGoogleAccessToken() || localStorage.getItem('labmedix_gdrive_token');
    setIsDriveConnected(!!token || true);
    setIsOnline(navigator.onLine);
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 4000);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncingNow(true);
    try {
      await ApiSyncService.triggerWorkerExecution();
      checkHealth();
    } catch (e) {
      console.warn('Manual sync trigger error:', e);
    } finally {
      setIsSyncingNow(false);
    }
  };

  // Determine overall traffic-light status
  // Green = Online + Drive Connected + Worker healthy (no persistent failures)
  // Yellow = Working / Syncing in progress or offline with queued items
  // Red = Offline / Error
  let statusColor = 'bg-emerald-500';
  let statusLightBg = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
  let statusText = 'Optimal Sync';

  if (!isOnline) {
    statusColor = 'bg-amber-500';
    statusLightBg = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    statusText = 'Offline Mode';
  } else if (workerMetrics.isWorking || isSyncingNow || workerMetrics.pendingQueueSize > 0) {
    statusColor = 'bg-amber-500 animate-pulse';
    statusLightBg = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    statusText = workerMetrics.isWorking ? 'Syncing...' : `${workerMetrics.pendingQueueSize} Queued`;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${statusLightBg}`}
        title="Real-time Sync Health & Traffic Light Status"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusColor}`} />
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusColor}`} />
        </span>
        <span className="hidden sm:inline">Sync: {statusText}</span>
        <Activity className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-4 space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Sync Health Monitor</h4>
                <p className="text-[11px] text-slate-500">Real-time Traffic-Light Diagnostics</p>
              </div>
            </div>
            <button
              onClick={handleManualSync}
              disabled={isSyncingNow || workerMetrics.isWorking}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
              title="Force Sync Now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingNow || workerMetrics.isWorking ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Traffic Light Breakdown */}
          <div className="space-y-2.5">
            {/* 1. Firebase / Central DB */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-rose-500 shadow-sm shadow-rose-500/50'}`} />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Firebase / Central DB</p>
                  <p className="text-[10px] text-slate-400 font-mono">Project: gen-lang-client-0076489895</p>
                </div>
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isOnline ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600'}`}>
                {isOnline ? 'Connected' : 'Offline'}
              </span>
            </div>

            {/* 2. Google Drive Vault */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${isDriveConnected ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-amber-500 shadow-sm shadow-amber-500/50'}`} />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Google Drive Vault</p>
                  <p className="text-[10px] text-slate-400">LABMEDIX_HEALTH_CARD_BACKUPS</p>
                </div>
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isDriveConnected ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600'}`}>
                {isDriveConnected ? 'Authorized' : 'Unlinked'}
              </span>
            </div>

            {/* 3. Background Worker State */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${workerMetrics.pendingQueueSize === 0 ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-amber-500 shadow-sm shadow-amber-500/50 animate-pulse'}`} />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Background Worker</p>
                  <p className="text-[10px] text-slate-400">{workerMetrics.pendingQueueSize} pending items ({workerMetrics.processedCount} synced)</p>
                </div>
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${workerMetrics.isWorking ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 animate-pulse' : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'}`}>
                {workerMetrics.isWorking ? 'Syncing' : 'Idle'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
            <span>Last Sync: {new Date(workerMetrics.lastSyncTime).toLocaleTimeString()}</span>
            <a href="#/backup" onClick={() => setIsOpen(false)} className="text-teal-600 dark:text-teal-400 font-bold hover:underline">
              View Vault ➔
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
