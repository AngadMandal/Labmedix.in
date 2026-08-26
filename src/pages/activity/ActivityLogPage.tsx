import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../../services/storage';
import { AuditService } from '../../services/auditService';
import { AuditLog, AuditModule, AuditSeverity } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import { formatDateTime } from '../../utils/formatters';
import {
  History,
  Shield,
  ShieldCheck,
  Download,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  FileSpreadsheet,
  RotateCcw,
  Sparkles,
  Lock,
  Terminal,
  Activity,
  Layers,
  ArrowUpRight,
  UserCheck,
  CreditCard,
  Wallet,
  Users2
} from 'lucide-react';

export const ActivityLogPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [logs, setLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Filters
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Chain Verification State
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    totalBlocks: number;
    corruptedBlocks: number;
    genesisHash: string;
    latestHash: string;
    details: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const refreshLogs = () => {
    setLogs(StorageService.getAuditLogs());
  };

  // Run Cryptographic Chain Verification
  const handleVerifyChain = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const res = AuditService.verifyChainIntegrity();
      setVerificationResult(res);
      setIsVerifying(false);
      if (res.verified) {
        triggerCelebrationFireworks();
        showToast('success', 'Cryptographic Chain Verified!', `All ${res.totalBlocks} ledger blocks validated with 0 discrepancies.`);
      } else {
        showToast('error', 'Integrity Alert', `Found ${res.corruptedBlocks} broken block links in the audit trail.`);
      }
    }, 400);
  };

  // Export Compliance Certificate
  const handleExportCertificate = () => {
    AuditService.exportAuditCertificate();
    triggerCelebrationFireworks();
    showToast('success', 'Audit Certificate Generated', 'Downloaded ISO/NABH compliant cryptographic certificate.');
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Block #', 'Timestamp', 'Severity', 'Module', 'Action', 'Actor Name', 'Actor Role', 'Reference ID', 'Block Hash', 'Description'];
    const rows = filteredLogs.map(l => [
      String(l.index || ''),
      `"${l.timestamp}"`,
      l.severity || 'info',
      l.module,
      `"${l.action}"`,
      `"${l.userName}"`,
      `"${l.userRole || 'USER'}"`,
      `"${l.referenceId || ''}"`,
      `"${l.hash || ''}"`,
      `"${l.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LABMEDIX_IMMUTABLE_AUDIT_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Audit CSV Exported', 'Downloaded activity trail dataset.');
  };

  // Filtered dataset
  const filteredLogs = useMemo(() => {
    const now = Date.now();
    return logs.filter(l => {
      // 1. Module filter
      if (selectedModule !== 'all' && l.module !== selectedModule) return false;

      // 2. Severity filter
      if (selectedSeverity !== 'all' && l.severity !== selectedSeverity) return false;

      // 3. Time filter
      if (timeFilter !== 'all') {
        const logTime = new Date(l.timestamp).getTime();
        const diffHours = (now - logTime) / (1000 * 60 * 60);
        if (timeFilter === 'today' && diffHours > 24) return false;
        if (timeFilter === '7days' && diffHours > 24 * 7) return false;
        if (timeFilter === '30days' && diffHours > 24 * 30) return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAction = l.action.toLowerCase().includes(q);
        const matchesUser = l.userName.toLowerCase().includes(q);
        const matchesDesc = l.description.toLowerCase().includes(q);
        const matchesRef = l.referenceId ? l.referenceId.toLowerCase().includes(q) : false;
        const matchesHash = l.hash ? l.hash.toLowerCase().includes(q) : false;
        return matchesAction || matchesUser || matchesDesc || matchesRef || matchesHash;
      }

      return true;
    });
  }, [logs, selectedModule, selectedSeverity, timeFilter, searchQuery]);

  // KPI Metrics Calculation
  const totalEvents = logs.length;
  const financialEvents = logs.filter(l => l.severity === 'financial').length;
  const securityEvents = logs.filter(l => l.severity === 'security').length;
  const criticalEvents = logs.filter(l => l.severity === 'critical').length;

  const getSeverityBadge = (severity?: AuditSeverity) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300">CRITICAL</span>;
      case 'financial':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300">FINANCIAL</span>;
      case 'security':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300">SECURITY</span>;
      case 'warning':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">WARNING</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">INFO</span>;
    }
  };

  const columns: Column<AuditLog>[] = [
    {
      header: 'Block & Time',
      accessor: (l) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            <span className="font-mono text-[10px] font-bold text-slate-400">
              #{l.index || 1}
            </span>
            <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
              {formatDateTime(l.timestamp)}
            </span>
          </div>
          {l.hash && (
            <span className="font-mono text-[9px] text-blue-500 truncate block max-w-[130px]">
              {l.hash}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Severity',
      accessor: (l) => getSeverityBadge(l.severity)
    },
    {
      header: 'Module / Action',
      accessor: (l) => (
        <div className="space-y-0.5">
          <span className="font-bold text-xs text-slate-900 dark:text-white block uppercase">
            {l.action.replace(/_/g, ' ')}
          </span>
          <span className="px-1.5 py-0.5 rounded font-mono text-[9px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 inline-block">
            {l.module}
          </span>
        </div>
      )
    },
    {
      header: 'Actor',
      accessor: (l) => (
        <div>
          <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            {l.userName}
          </strong>
          <span className="text-[10px] text-slate-400 uppercase font-mono">
            {l.userRole || 'STAFF'}
          </span>
        </div>
      )
    },
    {
      header: 'Description & Reference',
      accessor: (l) => (
        <div className="space-y-0.5 max-w-sm">
          <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
            {l.description}
          </p>
          {l.referenceId && (
            <span className="font-mono text-[10px] font-bold text-brand-blue dark:text-blue-400">
              Ref: {l.referenceId}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Inspect',
      accessor: (l) => (
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Eye className="w-3.5 h-3.5" />}
          onClick={() => {
            setSelectedLog(l);
            setIsInspectorOpen(true);
          }}
        >
          Inspect
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <History className="w-7 h-7 text-brand-blue" />
            Security & Cryptographic Audit Activity Trail
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Immutable SHA-256 blockchain-style ledger of all clinical updates, card issuances, and financial movements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
            onClick={handleVerifyChain}
            isLoading={isVerifying}
          >
            Verify Cryptographic Chain
          </Button>

          <Button
            variant="secondary"
            leftIcon={<FileCode className="w-4 h-4 text-purple-400" />}
            onClick={handleExportCertificate}
          >
            Audit Certificate
          </Button>

          <Button
            variant="primary"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCsv}
          >
            Export Audit CSV
          </Button>
        </div>
      </div>

      {/* 4 KPI Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Actions</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <strong className="text-2xl font-black text-slate-900 dark:text-white block">
            {totalEvents}
          </strong>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% Tamper Sealed
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Financial Ledgers</span>
            <Wallet className="w-4 h-4 text-purple-500" />
          </div>
          <strong className="text-2xl font-black text-purple-600 dark:text-purple-400 block">
            {financialEvents}
          </strong>
          <span className="text-[10px] text-slate-400 font-mono">
            Wallet credits & debits
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Security & Auth</span>
            <Lock className="w-4 h-4 text-indigo-500" />
          </div>
          <strong className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block">
            {securityEvents}
          </strong>
          <span className="text-[10px] text-slate-400 font-mono">
            Logins & permission audits
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Critical Actions</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <strong className="text-2xl font-black text-rose-600 dark:text-rose-400 block">
            {criticalEvents}
          </strong>
          <span className="text-[10px] text-slate-400 font-mono">
            Deletions & cancellations
          </span>
        </div>
      </div>

      {/* Cryptographic Chain Integrity Banner (if verified) */}
      {verificationResult && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 text-xs ${
          verificationResult.verified
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
        }`}>
          <div className="flex items-center gap-3">
            {verificationResult.verified ? (
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
            )}
            <div>
              <strong className="block font-bold text-sm">
                {verificationResult.verified ? 'Cryptographic Chain 100% Intact & Tamper-Free' : 'Audit Chain Discrepancy Detected'}
              </strong>
              <p className="text-[11px] opacity-90">
                {verificationResult.details} (Merkle Root: <code className="font-mono font-bold">{verificationResult.latestHash}</code>)
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/80 dark:bg-slate-900 border">
            {verificationResult.verified ? 'VERIFIED ✓' : 'FAILED ✗'}
          </span>
        </div>
      )}

      {/* Advanced Multi-Dimensional Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search action, actor, hash, ref ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Module Filter */}
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
          >
            <option value="all">All Modules</option>
            <option value="patient">Patients Module</option>
            <option value="card">Health Cards & Studio</option>
            <option value="wallet">Health Wallet & Ledger</option>
            <option value="family">Family Groups</option>
            <option value="membership">Membership Tiers</option>
            <option value="auth">Authentication & Login</option>
            <option value="backup">Backup & Restore</option>
            <option value="settings">Organization Settings</option>
            <option value="security">Security Center</option>
            <option value="users">Staff Management</option>
          </select>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
          >
            <option value="all">All Severities</option>
            <option value="info">Informational</option>
            <option value="financial">Financial Transactions</option>
            <option value="security">Security Events</option>
            <option value="warning">System Warnings</option>
            <option value="critical">Critical Actions</option>
          </select>

          {/* Timeframe Chips */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setTimeFilter('all')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${timeFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('today')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${timeFilter === 'today' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
            >
              24h
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('7days')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${timeFilter === '7days' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('30days')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${timeFilter === '30days' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
            >
              30 Days
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>Showing <strong>{filteredLogs.length}</strong> of {logs.length} cryptographically linked audit blocks</span>
          {(selectedModule !== 'all' || selectedSeverity !== 'all' || timeFilter !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedModule('all');
                setSelectedSeverity('all');
                setTimeFilter('all');
                setSearchQuery('');
              }}
              className="text-blue-600 font-bold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Audit Data Table */}
      <DataTable
        data={filteredLogs}
        columns={columns}
        keyExtractor={(l) => l.id}
        emptyTitle="No matching audit logs found"
        emptyDescription="Try clearing search filters or perform new actions across the system."
      />

      {/* Forensic Deep Inspector Modal */}
      {selectedLog && (
        <Modal
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          title={`Forensic Audit Block #${selectedLog.index || 1}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white uppercase">
                    {selectedLog.action.replace(/_/g, ' ')}
                  </span>
                  {getSeverityBadge(selectedLog.severity)}
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  Timestamp: {formatDateTime(selectedLog.timestamp)}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Operator</span>
                <strong className="text-slate-900 dark:text-white">{selectedLog.userName} ({selectedLog.userRole || 'USER'})</strong>
              </div>
            </div>

            {/* Cryptographic Chain Proof Box */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 font-mono text-[11px]">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-[10px] border-b border-white/10 pb-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Cryptographic Proof & Block Integrity</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Block Number:</span>
                  <strong className="text-white">#{selectedLog.index || 1}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Block Hash:</span>
                  <strong className="text-blue-400">{selectedLog.hash || 'N/A'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Previous Block Hash:</span>
                  <span className="text-slate-300 text-[10px] truncate max-w-[280px]">{selectedLog.prevHash || 'GENESIS'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">IP & Device Agent:</span>
                  <span className="text-slate-300 text-[10px]">{selectedLog.ipAddress || '127.0.0.1'}</span>
                </div>
              </div>
            </div>

            {/* Description & Reference Link */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border space-y-2">
              <strong className="block text-xs font-bold text-slate-900 dark:text-white">
                Action Summary
              </strong>
              <p className="text-slate-600 dark:text-slate-300">
                {selectedLog.description}
              </p>
              {selectedLog.referenceId && (
                <div className="pt-2 border-t flex items-center justify-between">
                  <span className="font-mono text-slate-500">Reference: <strong>{selectedLog.referenceId}</strong></span>
                  {selectedLog.referenceId.startsWith('LMDX-') && (
                    <Button size="sm" variant="outline" onClick={() => navigate(`/patients/${selectedLog.referenceId}`)}>
                      Open Patient Profile <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  )}
                  {selectedLog.referenceId.startsWith('LHC-') && (
                    <Button size="sm" variant="outline" onClick={() => navigate('/cards')}>
                      Open Health Cards <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Metadata Payload JSON Viewer (if present) */}
            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
              <div className="space-y-1.5">
                <strong className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Detailed Payload & State Diffs
                </strong>
                <pre className="p-3 bg-slate-950 text-emerald-400 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-48 scrollbar-none">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setIsInspectorOpen(false)}>
                Close Inspector
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};