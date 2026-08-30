import React, { useState, useEffect, useCallback } from 'react';
import { 
  Database, 
  Server, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  Radio, 
  Zap, 
  Clock, 
  Globe,
  HardDrive,
  ShieldCheck
} from 'lucide-react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, firebaseConfig } from '../../services/firebaseService';
import { ApiSyncService } from '../../services/apiSyncService';

export interface FirestoreConnectionDiagnosticProps {
  compact?: boolean;
  className?: string;
  onStatusChange?: (status: 'connected' | 'connecting' | 'disconnected' | 'error') => void;
}

export const FirestoreConnectionDiagnostic: React.FC<FirestoreConnectionDiagnosticProps> = ({
  compact = false,
  className = '',
  onStatusChange
}) => {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('connecting');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);
  const [lastPingLatency, setLastPingLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [hasPendingWrites, setHasPendingWrites] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [healthCheckDocCount, setHealthCheckDocCount] = useState<number>(0);

  const projectId = firebaseConfig.projectId || 'gen-lang-client-0668341047';
  const databaseId = '(default)';
  const databaseRestUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents`;
  const consoleUrl = `https://console.firebase.google.com/project/${projectId}/firestore`;

  // Monitor browser online/offline state
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (connectionStatus === 'disconnected') {
        setConnectionStatus('connecting');
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setConnectionStatus('disconnected');
      setErrorMessage('Network interface is offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [connectionStatus]);

  // Set up real-time Health Check Listener to Firestore document
  useEffect(() => {
    let isSubscribed = true;
    const healthDocRef = doc(db, '_system_health', 'heartbeat');

    const unsubscribe = onSnapshot(
      healthDocRef,
      { includeMetadataChanges: true },
      (snapshot) => {
        if (!isSubscribed) return;

        const fromCache = snapshot.metadata.fromCache;
        const hasPending = snapshot.metadata.hasPendingWrites;

        setIsFromCache(fromCache);
        setHasPendingWrites(hasPending);
        setHealthCheckDocCount((prev) => prev + 1);

        if (navigator.onLine) {
          setConnectionStatus('connected');
          setErrorMessage(null);
          setLastHeartbeat(new Date().toISOString());
        } else {
          setConnectionStatus('disconnected');
          setErrorMessage('Operating on local offline cache');
        }

        onStatusChange?.('connected');
      },
      (error) => {
        if (!isSubscribed) return;
        console.warn('[FirestoreDiagnostic] Health check listener error:', error);
        setConnectionStatus('error');
        setErrorMessage(error.message || 'Health check listener encountered an error');
        onStatusChange?.('error');
      }
    );

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [onStatusChange]);

  // Execute diagnostic ping roundtrip test
  const executePing = useCallback(async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const healthDocRef = doc(db, '_system_health', 'heartbeat');
      await setDoc(healthDocRef, {
        timestamp: new Date().toISOString(),
        serverTime: serverTimestamp(),
        clientAgent: navigator.userAgent,
        status: 'ok'
      }, { merge: true });

      const elapsed = Math.round(performance.now() - start);
      setLastPingLatency(elapsed);
      setConnectionStatus('connected');
      setErrorMessage(null);
      setLastHeartbeat(new Date().toISOString());

      ApiSyncService.addDiagnosticLog({
        type: 'PING',
        pathOrCollection: '_system_health/heartbeat',
        details: `Live health check ping succeeded: ${elapsed}ms roundtrip`
      });
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - start);
      setLastPingLatency(elapsed);
      setErrorMessage(err?.message || 'Ping failed');
      setConnectionStatus(navigator.onLine ? 'error' : 'disconnected');

      ApiSyncService.addDiagnosticLog({
        type: 'ERROR',
        pathOrCollection: '_system_health/heartbeat',
        details: `Live health check ping failed (${elapsed}ms): ${err?.message || err}`
      });
    } finally {
      setIsPinging(false);
    }
  }, []);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            CONNECTED (Live Listener)
          </span>
        );
      case 'connecting':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
            CONNECTING...
          </span>
        );
      case 'disconnected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
            <WifiOff className="w-3 h-3 text-slate-400" />
            OFFLINE / DISCONNECTED
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            CONNECTION ERROR
          </span>
        );
    }
  };

  if (compact) {
    return (
      <div className={`p-3 rounded-2xl bg-slate-900/90 border border-slate-800 font-mono text-xs ${className}`}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-slate-200">Backend Connection</span>
          </div>
          {getStatusBadge()}
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
          <div>
            <span>Project:</span> <strong className="text-slate-200">{projectId}</strong>
          </div>
          <div className="text-right">
            <span>Latency:</span> <strong className="text-emerald-400">{lastPingLatency !== null ? `${lastPingLatency}ms` : 'Listening'}</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="firestore-connection-diagnostic-card" 
      className={`p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-xl space-y-3.5 font-mono text-xs ${className}`}
    >
      {/* Header with Title & Live Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-slate-100 text-xs tracking-wider uppercase">
                Firestore Connection Diagnostic
              </h4>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Real-time health check listener on <code className="text-slate-300 font-bold">_system_health/heartbeat</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <button
            id="btn-diagnostic-test-ping"
            onClick={executePing}
            disabled={isPinging}
            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            title="Execute test ping write/read to Firestore"
          >
            <Zap className={`w-3 h-3 text-amber-300 ${isPinging ? 'animate-bounce' : ''}`} />
            <span>{isPinging ? 'Pinging...' : 'Test Ping'}</span>
          </button>
        </div>
      </div>

      {/* Primary Connection Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Firebase Project ID */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase flex items-center gap-1 text-slate-300">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              Firebase Project ID
            </span>
            <button
              onClick={() => copyToClipboard(projectId, 'projectId')}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
              title="Copy Project ID"
            >
              {copiedField === 'projectId' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <div className="font-bold text-slate-100 text-xs truncate bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
            {projectId}
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Target Database:</span>
            <span className="text-blue-300 font-semibold">{databaseId}</span>
          </div>
        </div>

        {/* Database REST Endpoint / URL */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase flex items-center gap-1 text-slate-300">
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              Database REST URL
            </span>
            <button
              onClick={() => copyToClipboard(databaseRestUrl, 'dbUrl')}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
              title="Copy Database URL"
            >
              {copiedField === 'dbUrl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <div className="font-mono text-slate-300 text-[10px] truncate bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800" title={databaseRestUrl}>
            {databaseRestUrl}
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Console Access:</span>
            <a 
              href={consoleUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 text-[10px]"
            >
              Open Console <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Health Check Listener & Pipeline Status */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Health Check Listener Telemetry
          </span>
          <span className="text-slate-400 text-[10px]">
            Updates received: <strong className="text-slate-200">{healthCheckDocCount}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500 block">Transport Status</span>
            <span className={`font-bold mt-0.5 block ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isOnline ? 'Online (WebSocket/gRPC)' : 'Offline'}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500 block">Roundtrip Latency</span>
            <span className={`font-bold mt-0.5 block ${
              lastPingLatency === null 
                ? 'text-slate-400' 
                : lastPingLatency < 120 
                  ? 'text-emerald-400' 
                  : 'text-amber-400'
            }`}>
              {lastPingLatency !== null ? `${lastPingLatency} ms` : 'Standby'}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500 block">Cache Source</span>
            <span className="font-bold text-slate-200 mt-0.5 block">
              {isFromCache ? 'IndexedDB (Local)' : 'Cloud Firestore'}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500 block">Pending Sync Writes</span>
            <span className={`font-bold mt-0.5 block ${hasPendingWrites ? 'text-amber-400' : 'text-slate-300'}`}>
              {hasPendingWrites ? 'In Queue' : 'All Clear (0)'}
            </span>
          </div>
        </div>

        {lastHeartbeat && (
          <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Last Heartbeat Ack: <strong className="text-slate-300">{new Date(lastHeartbeat).toLocaleTimeString()}</strong>
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3 h-3" /> Realtime Sync Verified
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-2 p-2 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-300 text-[10px] flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
