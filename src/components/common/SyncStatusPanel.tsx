import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Activity, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Copy, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Maximize2, 
  Minimize2, 
  Server, 
  Wifi, 
  WifiOff, 
  Key, 
  User as UserIcon, 
  Layers, 
  Radio, 
  Terminal, 
  Zap, 
  Search, 
  Trash2, 
  ExternalLink,
  Shield,
  Smartphone,
  Cpu
} from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../../services/firebaseService';
import { ApiSyncService, DiagnosticLogEntry, SyncHealthMetrics } from '../../services/apiSyncService';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';
import { ROLE_CONFIGS } from '../../constants/roles';
import { FirestoreConnectionDiagnostic } from './FirestoreConnectionDiagnostic';

const DEVICE_SESSION_KEY = 'labmedix_device_session_id';

const getDeviceSessionId = () => {
  try {
    let id = sessionStorage.getItem(DEVICE_SESSION_KEY);
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      sessionStorage.setItem(DEVICE_SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'dev_session_local';
  }
};

export const SyncStatusPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'connection' | 'listeners' | 'auth' | 'logs'>('overview');
  
  // Real-time Firebase & Firestore states
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(() => auth.currentUser);
  const [metrics, setMetrics] = useState<SyncHealthMetrics>(() => ApiSyncService.getSyncHealthMetrics());
  const [logs, setLogs] = useState<DiagnosticLogEntry[]>(() => ApiSyncService.getDiagnosticLogs());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Diagnostics interactive states
  const [isPinging, setIsPinging] = useState(false);
  const [lastPingLatency, setLastPingLatency] = useState<number | null>(null);
  const [isResyncing, setIsResyncing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<string>('ALL');
  const [searchLogQuery, setSearchLogQuery] = useState('');
  const [collectionStats, setCollectionStats] = useState<Record<string, number>>({});
  
  const deviceSessionId = useMemo(() => getDeviceSessionId(), []);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Monitor Firebase Auth changes
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      ApiSyncService.addDiagnosticLog({
        type: 'AUTH',
        pathOrCollection: 'firebase/auth',
        details: user 
          ? `Auth state changed: UID=${user.uid} (${user.email || 'Anonymous'})` 
          : 'Auth state changed: Unauthenticated / Local session'
      });
    });

    return () => unsubAuth();
  }, []);

  // Monitor Diagnostic Logs
  useEffect(() => {
    const unsubLogs = ApiSyncService.onDiagnosticLog((newLog) => {
      setLogs(ApiSyncService.getDiagnosticLogs());
    });

    return () => unsubLogs();
  }, []);

  // Refresh collection item counts & connection metrics
  const refreshStats = () => {
    setMetrics(ApiSyncService.getSyncHealthMetrics());
    setIsOnline(navigator.onLine);

    // Calculate document counts from local mirror storage for instant view
    const stats: Record<string, number> = {
      patients: StorageService.getPatients().length,
      cards: StorageService.getCards().length,
      cardApplications: StorageService.getItem<any[]>('labmedix_portal_card_applications_v1', []).length,
      wallets: StorageService.getWallets().length,
      transactions: StorageService.getTransactions().length,
      users: StorageService.getUsers().length,
      memberships: StorageService.getMemberships().length,
      families: StorageService.getFamilies().length,
      auditLogs: StorageService.getAuditLogs().length,
      doctors: StorageService.getItem<any[]>('labmedix_doctor_master_records_v1', []).length,
      labTests: StorageService.getItem<any[]>('labmedix_diagnostic_test_catalog_v1', []).length,
      labBookings: StorageService.getItem<any[]>('labmedix_portal_lab_bookings_v1', []).length,
      appointments: StorageService.getItem<any[]>('labmedix_patient_appointments_v1', []).length,
      vouchers: StorageService.getItem<any[]>('LABMEDIX_CASH_DESK_VOUCHERS_V1', []).length
    };
    setCollectionStats(stats);
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 3000);
    const handleOnline = () => { setIsOnline(true); refreshStats(); };
    const handleOffline = () => { setIsOnline(false); refreshStats(); };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Keyboard shortcut: Ctrl + Shift + D or Cmd + Shift + D to toggle overlay
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleRunPing = async () => {
    setIsPinging(true);
    try {
      const result = await ApiSyncService.pingFirestore();
      if (result.success) {
        setLastPingLatency(result.latencyMs);
      } else {
        setLastPingLatency(-1);
      }
      refreshStats();
    } finally {
      setIsPinging(false);
    }
  };

  const handleForceResync = async () => {
    setIsResyncing(true);
    try {
      await ApiSyncService.triggerWorkerExecution();
      refreshStats();
      ApiSyncService.addDiagnosticLog({
        type: 'INFO',
        pathOrCollection: 'system/sync',
        details: 'Manual full re-synchronization executed successfully.'
      });
    } catch (e: any) {
      ApiSyncService.addDiagnosticLog({
        type: 'ERROR',
        pathOrCollection: 'system/sync',
        details: `Manual re-sync encountered issue: ${e?.message || e}`
      });
    } finally {
      setIsResyncing(false);
    }
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyDiagnosticJson = () => {
    const diagnosticPayload = {
      timestamp: new Date().toISOString(),
      firebase: {
        projectId: metrics.projectId,
        databaseId: metrics.databaseId,
        authUid: firebaseUser?.uid || 'unauthenticated',
        authEmail: firebaseUser?.email || null,
        isAnonymous: firebaseUser?.isAnonymous || false
      },
      clientUser: {
        id: currentUser?.id || 'none',
        username: currentUser?.username || 'anonymous',
        role: currentUser?.role || 'guest',
        fullName: currentUser?.fullName || 'Guest User'
      },
      connection: {
        isOnline,
        status: metrics.status,
        activeListenersCount: metrics.activeListenersCount,
        lastSyncTime: metrics.lastSyncTime,
        lastPingLatencyMs: lastPingLatency
      },
      device: {
        sessionId: deviceSessionId,
        userAgent: navigator.userAgent,
        screen: `${window.innerWidth}x${window.innerHeight}`
      },
      collections: collectionStats,
      recentLogs: logs.slice(0, 30)
    };

    copyToClipboard(JSON.stringify(diagnosticPayload, null, 2), 'full_json');
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesType = logFilter === 'ALL' || log.type === logFilter;
      const matchesQuery = !searchLogQuery || 
        log.details.toLowerCase().includes(searchLogQuery.toLowerCase()) || 
        log.pathOrCollection.toLowerCase().includes(searchLogQuery.toLowerCase());
      return matchesType && matchesQuery;
    });
  }, [logs, logFilter, searchLogQuery]);

  const authUid = firebaseUser?.uid || 'AUTH_GUEST_SESSION';
  const projectId = metrics.projectId || 'gen-lang-client-0076489895';

  // Status badges
  const isHealthy = isOnline && metrics.status === 'connected';

  const location = useLocation();
  const isOnAdminPanel = location.pathname.includes('/settings') || location.pathname.includes('/super-admin');

  // Only allow super admin to view the diagnostic connection tools
  if (currentUser?.role !== 'super_admin' || !isOnAdminPanel) {
    return null;
  }

  return (
    <>
      {/* Floating Developer Overlay Toggle Button (Top-Right) */}
      <div className="fixed top-20 right-4 z-[999] flex items-center gap-2 font-mono select-none">
        <button
          id="sync-status-panel-trigger"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl shadow-xl backdrop-blur-md border transition-all text-xs font-semibold cursor-pointer ${
            isOpen 
              ? 'bg-slate-900 text-white border-blue-500 shadow-blue-500/20' 
              : isHealthy 
                ? 'bg-slate-900/90 hover:bg-slate-900 text-slate-200 border-slate-700/80 hover:border-emerald-500/80 shadow-black/40' 
                : 'bg-rose-950/90 hover:bg-rose-900 text-rose-200 border-rose-600 shadow-rose-900/40'
          }`}
          title="Toggle Developer Sync Diagnostics HUD (Ctrl+Shift+D)"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isHealthy ? 'bg-emerald-400' : 'bg-rose-500'
            }`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isHealthy ? 'bg-emerald-500' : 'bg-rose-500'
            }`} />
          </span>

          <span className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-300">HUD:</span>
            <span className="text-[11px] font-mono font-medium text-emerald-400">{metrics.activeListenersCount} Listeners</span>
          </span>

          {lastPingLatency !== null && (
            <span className="hidden sm:inline-flex text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {lastPingLatency === -1 ? 'Err' : `${lastPingLatency}ms`}
            </span>
          )}

          <Activity className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Main Diagnostic Overlay Drawer / Panel */}
      {isOpen && (
        <div 
          id="sync-status-panel-modal"
          className="fixed top-32 right-4 sm:right-6 z-[999] w-[95vw] sm:w-[580px] max-h-[80vh] flex flex-col bg-slate-950/95 text-slate-100 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden font-sans animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/80 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-inner">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black tracking-wider uppercase font-mono text-white">
                    Sync Diagnostics Panel
                  </h3>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    DEV HUD
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-400 truncate max-w-[260px]">
                  Project: <strong className="text-slate-200">{projectId}</strong>
                </p>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRunPing}
                disabled={isPinging}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 text-[10px] font-mono flex items-center gap-1"
                title="Run Firestore Latency Ping"
              >
                <Zap className={`w-3.5 h-3.5 text-amber-400 ${isPinging ? 'animate-bounce' : ''}`} />
                <span className="hidden sm:inline">Ping</span>
              </button>

              <button
                onClick={handleForceResync}
                disabled={isResyncing}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                title="Force Central Multi-Device Re-Sync"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isResyncing ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={copyDiagnosticJson}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                title="Copy Full Diagnostic State JSON"
              >
                {copiedKey === 'full_json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              <button
                onClick={() => setIsMinimized((prev) => !prev)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
                title={isMinimized ? 'Expand HUD' : 'Collapse HUD'}
              >
                {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition-colors border border-slate-700 hover:border-rose-700"
                title="Close HUD"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Navigation Tabs */}
              <div className="flex items-center gap-1 px-4 py-2 bg-slate-900/40 border-b border-slate-800/60 overflow-x-auto text-xs font-mono">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === 'overview' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  Overview & Keys
                </button>
                <button
                  onClick={() => setActiveTab('connection')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === 'connection' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Server className="w-3.5 h-3.5 text-blue-400" />
                  Backend Connection
                </button>
                <button
                  onClick={() => setActiveTab('listeners')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === 'listeners' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  Listeners ({metrics.activeListenersCount})
                </button>
                <button
                  onClick={() => setActiveTab('auth')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === 'auth' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  Auth & Identity
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === 'logs' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-purple-400" />
                  Live Logs ({logs.length})
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto p-4 max-h-[55vh] space-y-4 text-xs">
                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    {/* Live Real-time Firestore Connection Diagnostic Card */}
                    <FirestoreConnectionDiagnostic />

                    {/* Primary Key-Value Diagnostic HUD Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Firebase Project ID Card */}
                      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-slate-400 mb-1">
                          <span className="text-[10px] font-mono uppercase font-bold flex items-center gap-1.5">
                            <Database className="w-3.5 h-3.5 text-blue-400" />
                            Firebase Project ID
                          </span>
                          <button
                            onClick={() => copyToClipboard(projectId, 'proj_id')}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                            title="Copy Project ID"
                          >
                            {copiedKey === 'proj_id' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <div className="font-mono font-bold text-slate-100 text-xs truncate bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800/80">
                          {projectId}
                        </div>
                        <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                          <span>Database ID:</span>
                          <span className="text-blue-300 font-semibold">{metrics.databaseId}</span>
                        </div>
                      </div>

                      {/* Firestore Listener State Card */}
                      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-slate-400 mb-1">
                          <span className="text-[10px] font-mono uppercase font-bold flex items-center gap-1.5">
                            <Radio className="w-3.5 h-3.5 text-emerald-400" />
                            Firestore Connection
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                            isHealthy 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}>
                            {isHealthy ? 'LIVE SYNC' : 'OFFLINE'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800/80 font-mono">
                          <span className="text-slate-300">Active Listeners:</span>
                          <span className="font-bold text-emerald-400">{metrics.activeListenersCount} active</span>
                        </div>
                        <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                          <span>Roundtrip Latency:</span>
                          <span className={`font-bold ${
                            lastPingLatency === null 
                              ? 'text-slate-500' 
                              : lastPingLatency < 150 
                                ? 'text-emerald-400' 
                                : 'text-amber-400'
                          }`}>
                            {lastPingLatency === null ? 'Not tested' : `${lastPingLatency} ms`}
                          </span>
                        </div>
                      </div>

                      {/* Firebase Auth UID Card */}
                      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between sm:col-span-2">
                        <div className="flex items-center justify-between text-slate-400 mb-1">
                          <span className="text-[10px] font-mono uppercase font-bold flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-amber-400" />
                            Firebase Auth UID (Cloud Auth Identity)
                          </span>
                          <button
                            onClick={() => copyToClipboard(authUid, 'auth_uid')}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                            title="Copy Auth UID"
                          >
                            {copiedKey === 'auth_uid' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <div className="font-mono font-bold text-amber-300 text-xs truncate bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800/80">
                          {authUid}
                        </div>
                        <div className="mt-2 text-[10px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3 text-slate-400" />
                            Client Staff Profile: <strong className="text-slate-200">{currentUser?.username || 'Guest'}</strong> ({currentUser?.role || 'Portal User'})
                          </span>
                          <span className="text-slate-400">
                            Device Session: <strong className="text-slate-300">{deviceSessionId}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Metric Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Patients</div>
                        <div className="text-base font-bold text-white mt-0.5">{collectionStats.patients ?? 0}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Health Cards</div>
                        <div className="text-base font-bold text-emerald-400 mt-0.5">{collectionStats.cards ?? 0}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Applications</div>
                        <div className="text-base font-bold text-blue-400 mt-0.5">{collectionStats.cardApplications ?? 0}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Staff Accounts</div>
                        <div className="text-base font-bold text-purple-400 mt-0.5">{collectionStats.users ?? 0}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: DEDICATED BACKEND CONNECTION & HEALTH CHECK */}
                {activeTab === 'connection' && (
                  <div className="space-y-4">
                    <FirestoreConnectionDiagnostic />

                    <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono">
                      <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-emerald-400" />
                          Firestore Multi-Device Sync Pipeline
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800">
                          {isHealthy ? 'ACTIVE PERSISTENCE' : 'OFFLINE CACHE'}
                        </span>
                      </div>

                      <div className="space-y-2 text-[11px] text-slate-300">
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                          <div>
                            <strong className="text-white block">Authoritative Firestore Storage</strong>
                            <span className="text-[10px] text-slate-400">All entity mutations write directly to Central Cloud Firestore with multi-tab mutex synchronization.</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                          <div>
                            <strong className="text-white block">Real-time Snapshot Observers</strong>
                            <span className="text-[10px] text-slate-400">{metrics.activeListenersCount} active collection listeners propagate cross-device changes instantly without polling lag.</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                          <div>
                            <strong className="text-white block">Offline Fault Tolerance</strong>
                            <span className="text-[10px] text-slate-400">IndexedDB persistence automatically buffers mutations when offline and drains queues upon reconnect.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: LISTENERS & COLLECTIONS */}
                {activeTab === 'listeners' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono px-1">
                      <span>Synchronized Central Collections ({Object.keys(ApiSyncService.KEY_TO_FIRESTORE_MAP).length})</span>
                      <span className="text-emerald-400 font-bold">ALL ACTIVE</span>
                    </div>

                    <div className="space-y-1.5 font-mono">
                      {Object.entries(ApiSyncService.KEY_TO_FIRESTORE_MAP).map(([key, conf]) => {
                        const count = collectionStats[conf.path] ?? null;
                        return (
                          <div 
                            key={key}
                            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              <div className="truncate">
                                <div className="font-bold text-slate-200 text-xs truncate">{conf.path}</div>
                                <div className="text-[10px] text-slate-500 truncate">{key}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                                {conf.type}
                              </span>
                              {count !== null && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                                  {count} docs
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 3: AUTH & IDENTITY */}
                {activeTab === 'auth' && (
                  <div className="space-y-3 font-mono">
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-blue-400" />
                        Firebase Authentication Context
                      </div>
                      <div className="space-y-1.5 text-[11px] text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                        <div className="flex justify-between">
                          <span className="text-slate-500">UID:</span>
                          <span className="font-bold text-amber-300 select-all">{authUid}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Email:</span>
                          <span>{firebaseUser?.email || 'N/A (Local / Anonymous)'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Is Anonymous:</span>
                          <span>{firebaseUser?.isAnonymous ? 'true' : 'false'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Provider:</span>
                          <span>{firebaseUser?.providerData?.[0]?.providerId || 'password / internal'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <UserIcon className="w-4 h-4 text-emerald-400" />
                        Application Profile Context
                      </div>
                      <div className="space-y-1.5 text-[11px] text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Staff User ID:</span>
                          <span className="font-bold text-white select-all">{currentUser?.id || 'GUEST_USER'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Username:</span>
                          <span>{currentUser?.username || 'anonymous'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Full Name:</span>
                          <span>{currentUser?.fullName || 'Portal Visitor'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Security Role:</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 uppercase">
                            {currentUser?.role || 'public_portal'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Permissions Count:</span>
                          <span>{currentUser?.role && ROLE_CONFIGS[currentUser.role] ? ROLE_CONFIGS[currentUser.role].permissions.length : 0} permissions active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: LIVE EVENT STREAM */}
                {activeTab === 'logs' && (
                  <div className="space-y-2.5 font-mono">
                    {/* Log Filters & Search */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          placeholder="Filter logs by collection or keyword..."
                          value={searchLogQuery}
                          onChange={(e) => setSearchLogQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-1 overflow-x-auto">
                        {['ALL', 'SNAPSHOT', 'WRITE', 'PING', 'ERROR'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setLogFilter(type)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                              logFilter === type 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                          >
                            {type}
                          </button>
                        ))}

                        <button
                          onClick={() => ApiSyncService.clearDiagnosticLogs()}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 transition-colors"
                          title="Clear Logs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Log Stream Box */}
                    <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800/90 max-h-[35vh] overflow-y-auto space-y-1 text-[10px]">
                      {filteredLogs.length === 0 ? (
                        <div className="py-8 text-center text-slate-500">
                          No diagnostic logs match the current filter.
                        </div>
                      ) : (
                        filteredLogs.map((log) => {
                          const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                          let badgeColor = 'bg-slate-800 text-slate-300';
                          if (log.type === 'SNAPSHOT') badgeColor = 'bg-emerald-950 text-emerald-300 border border-emerald-800';
                          if (log.type === 'WRITE') badgeColor = 'bg-blue-950 text-blue-300 border border-blue-800';
                          if (log.type === 'PING') badgeColor = 'bg-amber-950 text-amber-300 border border-amber-800';
                          if (log.type === 'ERROR') badgeColor = 'bg-rose-950 text-rose-300 border border-rose-800';
                          if (log.type === 'AUTH') badgeColor = 'bg-purple-950 text-purple-300 border border-purple-800';

                          return (
                            <div 
                              key={log.id} 
                              className="p-1.5 rounded-lg bg-slate-900/40 hover:bg-slate-900 border border-slate-800/40 hover:border-slate-700 flex flex-col gap-0.5 transition-colors"
                            >
                              <div className="flex items-center justify-between text-slate-500">
                                <span className="flex items-center gap-1.5">
                                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${badgeColor}`}>
                                    {log.type}
                                  </span>
                                  <span className="text-slate-400 font-semibold">{log.pathOrCollection}</span>
                                </span>
                                <span>{timeStr}</span>
                              </div>
                              <div className="text-slate-300 pl-0.5 leading-relaxed break-all">
                                {log.details}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={logsEndRef} />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Status Bar */}
              <div className="px-5 py-2.5 bg-slate-900/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-slate-400 gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Wifi className={`w-3 h-3 ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`} />
                    {isOnline ? 'Network Online' : 'Network Offline'}
                  </span>
                  <span>•</span>
                  <span>Last Sync: <strong className="text-slate-200">{new Date(metrics.lastSyncTime).toLocaleTimeString()}</strong></span>
                </div>

                <div className="text-[9px] text-slate-500">
                  Press <kbd className="px-1 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">Shift</kbd> + <kbd className="px-1 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">D</kbd> to toggle HUD
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
