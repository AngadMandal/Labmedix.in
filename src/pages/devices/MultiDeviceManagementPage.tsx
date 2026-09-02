import React, { useState, useEffect } from 'react';
import { 
  Laptop, 
  Smartphone, 
  Tablet, 
  Monitor, 
  ShieldCheck, 
  Radio, 
  RefreshCw, 
  Activity, 
  Zap, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  User, 
  Trash2, 
  PowerOff, 
  Play, 
  Edit3, 
  Save, 
  Database, 
  HardDrive, 
  Cloud, 
  Layers, 
  Fingerprint,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { MultiDeviceSyncService } from '../../services/multiDeviceSyncService';
import { DeviceSessionRecord, MultiDeviceSyncEvent, CentralMultiDeviceMetrics } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ApiSyncService } from '../../services/apiSyncService';
import { FirestoreBackupService } from '../../services/firestoreBackupService';

export const MultiDeviceManagementPage: React.FC = () => {
  const { currentUser, can } = useAuth();
  const { showToast } = useToast();

  const [devices, setDevices] = useState<DeviceSessionRecord[]>([]);
  const [syncEvents, setSyncEvents] = useState<MultiDeviceSyncEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [latencyMs, setLatencyMs] = useState<number>(28);
  const [walPendingCount, setWalPendingCount] = useState<number>(0);
  
  // Custom Device Name Editing
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [customNameInput, setCustomNameInput] = useState<string>('');

  const currentDeviceId = MultiDeviceSyncService.getDeviceId();
  const currentDevice = devices.find(d => d.deviceId === currentDeviceId) || MultiDeviceSyncService.getCurrentDeviceSession(currentUser);

  useEffect(() => {
    // 1. Subscribe to Live Device Fleet in Firestore
    const unsubDevices = MultiDeviceSyncService.subscribeToDeviceFleet((deviceList) => {
      setDevices(deviceList);
      setIsLoading(false);
    });

    // 2. Subscribe to Real-Time Sync Events
    const unsubEvents = MultiDeviceSyncService.onSyncEvents((events) => {
      setSyncEvents(events);
    });

    // 3. Check WAL count & Initial Latency
    FirestoreBackupService.getPendingWalCount().then(setWalPendingCount).catch(() => {});
    MultiDeviceSyncService.measureCentralLatency().then(setLatencyMs);

    return () => {
      unsubDevices();
      unsubEvents();
    };
  }, []);

  const handlePingLatency = async () => {
    setIsPinging(true);
    const ms = await MultiDeviceSyncService.measureCentralLatency();
    setLatencyMs(ms);
    setIsPinging(false);
    showToast('info', 'Central Firestore Ping', `Round-trip latency to Google Cloud Firestore: ${ms}ms`);
  };

  const handleSaveDeviceName = () => {
    if (!customNameInput.trim()) return;
    MultiDeviceSyncService.setCustomDeviceName(customNameInput);
    setIsEditingName(false);
    showToast('success', 'Device Renamed', `This device is now identified as "${customNameInput.trim()}".`);
  };

  const handleRevokeSession = async (targetDeviceId: string, deviceName: string) => {
    if (targetDeviceId === currentDeviceId) {
      if (!window.confirm('Are you sure you want to revoke THIS device session? You will be immediately logged out.')) {
        return;
      }
    } else {
      if (!window.confirm(`Revoke remote access for "${deviceName}"? Any active user on that device will be instantly disconnected.`)) {
        return;
      }
    }

    const success = await MultiDeviceSyncService.revokeDeviceSession(targetDeviceId, currentUser?.fullName);
    if (success) {
      showToast('warning', 'Session Revoked', `Device "${deviceName}" has been revoked and disconnected from Central Firestore.`);
    } else {
      showToast('error', 'Revocation Failed', 'Could not revoke session in Firestore.');
    }
  };

  const handleRestoreSession = async (targetDeviceId: string, deviceName: string) => {
    const success = await MultiDeviceSyncService.restoreDeviceSession(targetDeviceId);
    if (success) {
      showToast('success', 'Session Re-authorized', `Device "${deviceName}" access re-activated.`);
    }
  };

  const handleDeleteRecord = async (targetDeviceId: string, deviceName: string) => {
    if (!window.confirm(`Permanently remove record for "${deviceName}" from the active device registry?`)) {
      return;
    }
    const success = await MultiDeviceSyncService.removeDeviceRecord(targetDeviceId);
    if (success) {
      showToast('info', 'Device Removed', `Record for "${deviceName}" purged from central registry.`);
    }
  };

  const handleSimulateUpdate = async (type: 'patient' | 'card' | 'appointment') => {
    setIsSimulating(true);
    const res = await MultiDeviceSyncService.simulateCrossDeviceUpdate(type);
    setIsSimulating(false);
    if (res.success) {
      showToast('success', 'Multi-Device Sync Broadcasted ⚡', res.message);
    } else {
      showToast('error', 'Simulation Failed', res.message);
    }
  };

  const metrics: CentralMultiDeviceMetrics = MultiDeviceSyncService.calculateMetrics(devices);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Mobile':
        return <Smartphone className="w-5 h-5 text-indigo-500" />;
      case 'Tablet':
        return <Tablet className="w-5 h-5 text-purple-500" />;
      case 'Laptop':
        return <Laptop className="w-5 h-5 text-blue-500" />;
      default:
        return <Monitor className="w-5 h-5 text-emerald-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Online & Active
          </span>
        );
      case 'idle':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Idle
          </span>
        );
      case 'revoked':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            Revoked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Offline
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                CENTRALIZED CLOUD SOURCE OF TRUTH
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                GOOGLE CLOUD FIRESTORE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Radio className="w-8 h-8 text-indigo-400 animate-pulse" />
              Centralized Multi-Device Management
            </h1>
            <p className="text-xs md:text-sm text-indigo-200/80 max-w-2xl">
              All critical healthcare, patient, health card, clinical EMR, and financial data is centrally unified in Google Cloud Firestore. Local storage functions strictly as zero-data-loss WAL & offline cache.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePingLatency}
              disabled={isPinging}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all flex items-center gap-2 border border-slate-700 shadow-md"
            >
              <Activity className={`w-4 h-4 text-emerald-400 ${isPinging ? 'animate-spin' : ''}`} />
              Ping Latency ({latencyMs}ms)
            </button>

            <button
              onClick={() => handleSimulateUpdate('patient')}
              disabled={isSimulating}
              className="px-4 py-2 rounded-xl bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-xs font-bold text-white transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Play className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
              Simulate Device B Update ⚡
            </button>
          </div>
        </div>

        {/* 4-Stat Metric Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-indigo-500/20">
          <div className="bg-slate-950/40 rounded-2xl p-3 border border-indigo-500/10">
            <div className="text-[11px] font-medium text-indigo-300 uppercase tracking-wider">Total Authorized Devices</div>
            <div className="text-xl font-black text-white mt-1">{devices.length} Devices</div>
          </div>
          <div className="bg-slate-950/40 rounded-2xl p-3 border border-indigo-500/10">
            <div className="text-[11px] font-medium text-emerald-300 uppercase tracking-wider">Online & Active Now</div>
            <div className="text-xl font-black text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              {metrics.activeDevicesCount} Connected
            </div>
          </div>
          <div className="bg-slate-950/40 rounded-2xl p-3 border border-indigo-500/10">
            <div className="text-[11px] font-medium text-cyan-300 uppercase tracking-wider">Central Sync Latency</div>
            <div className="text-xl font-black text-cyan-400 mt-1">{latencyMs} ms</div>
          </div>
          <div className="bg-slate-950/40 rounded-2xl p-3 border border-indigo-500/10">
            <div className="text-[11px] font-medium text-amber-300 uppercase tracking-wider">Zero-Loss WAL Queue</div>
            <div className="text-xl font-black text-amber-400 mt-1">{walPendingCount} Pending</div>
          </div>
        </div>
      </div>

      {/* Multi-Device Architecture Flow Diagram */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Real-Time Multi-Device Synchronization Pipeline
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Zero-data-loss architecture: Local mutations write to IndexedDB WAL first, sync immediately to Firestore, and broadcast live to all connected devices.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            Bi-Directional Real-Time
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
          {/* Node 1: User Device */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between relative group hover:border-indigo-500/50 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mb-3 border border-indigo-200 dark:border-indigo-800">
                <Laptop className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Step 1</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">Origin Device</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Authorized user operates from Desktop, Laptop, Tablet, or Mobile.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 font-mono">
              Status: {currentDevice.isCurrentDevice ? 'This Device (Active)' : 'Connected'}
            </div>
          </div>

          {/* Node 2: Local WAL / Cache */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between relative group hover:border-indigo-500/50 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold mb-3 border border-amber-200 dark:border-amber-800">
                <HardDrive className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Step 2</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">Local WAL & Cache</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                IndexedDB WAL writes immediately. Survives offline disconnects & page reloads.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-amber-600 dark:text-amber-400 font-mono font-bold">
              Queue: {walPendingCount} pending items
            </div>
          </div>

          {/* Node 3: Central Google Cloud Firestore */}
          <div className="bg-linear-to-b from-indigo-50/50 to-blue-50/30 dark:from-indigo-950/40 dark:to-slate-900 rounded-2xl p-4 border-2 border-indigo-500/50 flex flex-col justify-between relative group shadow-md">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold mb-3 shadow-md shadow-indigo-600/30">
                <Cloud className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Step 3 (SSOT)</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">Central Cloud Firestore</div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Single Source of Truth. Real-time ACID commits, snapshots, and security rules.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-indigo-200 dark:border-indigo-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Cloud Synced
            </div>
          </div>

          {/* Node 4: Other Authorized Devices */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between relative group hover:border-indigo-500/50 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold mb-3 border border-purple-200 dark:border-purple-800">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Step 4</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">Connected Fleet</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                All connected tablets, phones, and clinic stations receive live updates instantly.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-purple-600 dark:text-purple-400 font-mono font-bold">
              Fleet: {devices.length} devices synchronized
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Current Device Profile & Live Cross-Device Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1/3: Current Device Details Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">This Device Session</h3>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ONLINE & REGISTERED
                </span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              CURRENT
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Device Name */}
            <div>
              <div className="text-slate-400 font-medium mb-1">Device Identification</div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customNameInput}
                    onChange={(e) => setCustomNameInput(e.target.value)}
                    placeholder="e.g. Dr. Roy's iPad OPD Bay"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-indigo-400 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                  />
                  <button
                    onClick={handleSaveDeviceName}
                    className="p-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white">{currentDevice.deviceName}</span>
                  <button
                    onClick={() => {
                      setCustomNameInput(currentDevice.deviceName);
                      setIsEditingName(true);
                    }}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[11px] font-semibold"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Rename
                  </button>
                </div>
              )}
            </div>

            {/* Device ID */}
            <div>
              <div className="text-slate-400 font-medium mb-1">Unique Device Fingerprint</div>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-950 font-mono text-[10px] text-slate-600 dark:text-slate-300 break-all border border-slate-200 dark:border-slate-800">
                {currentDeviceId}
              </div>
            </div>

            {/* Hardware & OS Details */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-400 text-[10px]">Operating System</div>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">{currentDevice.os}</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-400 text-[10px]">Web Browser</div>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">{currentDevice.browser}</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-400 text-[10px]">Logged-in User</div>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5 truncate">{currentUser?.fullName || 'Super Admin'}</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-400 text-[10px]">Role / Zone</div>
                <div className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 uppercase">{currentUser?.role || 'super_admin'}</div>
              </div>
            </div>

            {/* Zero-Loss Cloud Sync Badge */}
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Device-Independent Security Active
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400/90 leading-relaxed">
                If this device is replaced, reset, or lost, zero data is lost. Log in from any other authorized device to immediately continue where you left off.
              </p>
            </div>
          </div>
        </div>

        {/* Right 2/3: Live Cross-Device Sync Events Stream */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Multi-Device Activity Stream</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time mutations propagated across connected devices via Firestore listeners
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSimulateUpdate('card')}
                  disabled={isSimulating}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  + Simulate Card Issue
                </button>
                <button
                  onClick={() => handleSimulateUpdate('appointment')}
                  disabled={isSimulating}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  + Simulate OPD Appt
                </button>
              </div>
            </div>

            {/* Events List */}
            <div className="mt-4 space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {syncEvents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Cloud className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-xs">Listening for multi-device events across the cluster...</p>
                  <button
                    onClick={() => handleSimulateUpdate('patient')}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 underline"
                  >
                    Click to trigger a simulated cross-device event
                  </button>
                </div>
              ) : (
                syncEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-[11px] ${
                        evt.action === 'delete' 
                          ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400' 
                          : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                      }`}>
                        {evt.action === 'delete' ? 'DEL' : 'SYNC'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{evt.collection.toUpperCase()} #{evt.docId}</span>
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {evt.originDeviceName || 'Connected Device'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Origin User: <span className="font-semibold">{evt.originUser || 'Staff'}</span>
                          {evt.payloadSnippet && <span className="ml-1 text-slate-400">({evt.payloadSnippet})</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[10px] text-slate-400 font-mono">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Real-time listener connected to <code className="font-mono text-indigo-500">_system_sync_events</code></span>
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Stream Active
            </span>
          </div>
        </div>
      </div>

      {/* Authorized Devices Fleet Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Connected Device Fleet Registry
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage authorized devices, track active sessions, and remotely revoke access across desktop, laptop, tablet, and mobile clients.
            </p>
          </div>

          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {devices.length} Registered Devices in Central Firestore
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Device & Hardware</th>
                <th className="py-3 px-4">Active User & Role</th>
                <th className="py-3 px-4">Browser & OS</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Last Active</th>
                <th className="py-3 px-4 text-right">Session Security</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {devices.map((dev) => (
                <tr 
                  key={dev.deviceId}
                  className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                    dev.isCurrentDevice ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  {/* Device Name & Hardware */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        {getPlatformIcon(dev.platform)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{dev.deviceName}</span>
                          {dev.isCurrentDevice && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-600 text-white">
                              THIS DEVICE
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate max-w-xs">
                          {dev.deviceId}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Active User */}
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {dev.userFullName || dev.username || 'System Administrator'}
                    </div>
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
                      {dev.userRole || 'super_admin'}
                    </div>
                  </td>

                  {/* Browser & OS */}
                  <td className="py-3 px-4">
                    <div className="text-slate-800 dark:text-slate-200 font-medium">{dev.browser}</div>
                    <div className="text-[10px] text-slate-400">{dev.os}</div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(dev.status)}
                  </td>

                  {/* Last Active */}
                  <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                    {dev.lastActiveAt ? new Date(dev.lastActiveAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {dev.status === 'revoked' ? (
                        <button
                          onClick={() => handleRestoreSession(dev.deviceId, dev.deviceName)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors"
                        >
                          Re-authorize
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRevokeSession(dev.deviceId, dev.deviceName)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors ${
                            dev.isCurrentDevice 
                              ? 'bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 dark:text-rose-300'
                              : 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs'
                          }`}
                        >
                          Revoke Access
                        </button>
                      )}

                      {!dev.isCurrentDevice && (
                        <button
                          onClick={() => handleDeleteRecord(dev.deviceId, dev.deviceName)}
                          title="Purge device record"
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6 Core Architectural Pillars Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Centralized Multi-Device Architecture Guarantees
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <Cloud className="w-4 h-4" /> 1. Central Single Source of Truth
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              Google Cloud Firestore serves as the central authoritative data layer. Local storage is strictly a high-speed cache and recovery buffer.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Zap className="w-4 h-4" /> 2. Real-Time Multi-Device Sync
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              Mutations made from one station (e.g. Front Desk intake) propagate instantly to doctor OPD stations and lab tablets without page reloads.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <HardDrive className="w-4 h-4" /> 3. Zero-Data-Loss WAL Protection
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              If network drops, Write-Ahead Logs in IndexedDB preserve all mutations locally and auto-flush to Central Firestore upon reconnection.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-4 h-4" /> 4. Device-Independent Continuity
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              Losing, replacing, or wiping a laptop or tablet causes zero data loss. Authorized users simply log in on a new device to access all current records.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
              <Clock className="w-4 h-4" /> 5. Conflict Resolution & Last-Write-Wins
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              Granular revision tracking with ISO timestamps prevents conflicting or duplicate mutations from overwriting clinical records.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-4 h-4" /> 6. Remote Session Revocation
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              Administrators can remotely terminate any active device session from this dashboard, triggering immediate logout and audit log recording.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
