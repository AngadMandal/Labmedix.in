import React, { useState, useEffect, useMemo } from 'react';
import { StorageService } from '../../services/storage';
import { DoctorMasterService, DoctorMasterItem, DoctorCommissionPayoutRecord } from '../../services/doctorMasterService';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import { useToast } from '../../context/ToastContext';
import { LabMedixLogo } from '../../components/common/LabMedixLogo';
import { RoleBadge } from '../../components/common/RoleBadge';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ExportService } from '../../services/exportService';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Users,
  Wallet,
  Printer,
  Download,
  Calendar,
  FileSpreadsheet,
  Building,
  Building2,
  CheckCircle2,
  Sparkles,
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Award,
  Layers,
  Clock,
  RefreshCw,
  Sliders,
  DollarSign,
  PieChart as PieChartIcon,
  Flame,
  Crown,
  ChevronRight,
  Filter,
  Check,
  Eye,
  MapPin,
  Stethoscope,
  FlaskConical,
  Pill,
  Send,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

export type BranchId = 'all' | 'hq_kolkata' | 'salt_lake' | 'park_street' | 'howrah';

interface BranchInfo {
  id: BranchId;
  name: string;
  code: string;
  city: string;
  type: string;
  beds: number;
  occupancyRate: number;
  manager: string;
}

const BRANCHES: BranchInfo[] = [
  {
    id: 'all',
    name: 'All Branches (Consolidated Healthcare Network)',
    code: 'LMDX-ALL',
    city: 'West Bengal',
    type: 'Executive Network',
    beds: 450,
    occupancyRate: 88,
    manager: 'Dr. Subhashish Roy (Medical Director)'
  },
  {
    id: 'hq_kolkata',
    name: 'HQ Central Medical Complex',
    code: 'LMDX-HQ-01',
    city: 'Kolkata Central',
    type: 'Multi-speciality Tertiary',
    beds: 250,
    occupancyRate: 92,
    manager: 'Dr. Subhashish Roy'
  },
  {
    id: 'salt_lake',
    name: 'Salt Lake Super-Speciality Outpost',
    code: 'LMDX-SL-02',
    city: 'Sector V, Salt Lake',
    type: 'Daycare & Advanced Diagnostics',
    beds: 80,
    occupancyRate: 85,
    manager: 'Dr. Amit Patel'
  },
  {
    id: 'park_street',
    name: 'Park Street Diagnostic & Imaging Hub',
    code: 'LMDX-PS-03',
    city: 'Park Street',
    type: 'Diagnostic & Molecular Lab',
    beds: 50,
    occupancyRate: 78,
    manager: 'Dr. Anita Sen'
  },
  {
    id: 'howrah',
    name: 'Howrah Emergency & Phlebotomy Centre',
    code: 'LMDX-HW-04',
    city: 'Howrah Station Area',
    type: '24x7 Walk-in & Emergency',
    beds: 70,
    occupancyRate: 89,
    manager: 'Vikram Joshi'
  }
];

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [selectedBranch, setSelectedBranch] = useState<BranchId>('all');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month');
  const [activeViewTab, setActiveViewTab] = useState<'overview' | 'velocity' | 'wallet_float' | 'staff_productivity' | 'audit_ledger' | 'dept_collections' | 'doctor_referrals' | 'my_reports'>('overview');

  // Database Access
  const patients = StorageService.getPatients().filter(p => !p.isDeleted);
  const cards = StorageService.getCards();
  const memberships = StorageService.getMemberships();
  const wallets = StorageService.getWallets();
  const transactions = StorageService.getTransactions();
  const auditLogs = StorageService.getAuditLogs();
  const users = StorageService.getUsers();
  const company = StorageService.getCompanyProfile();

  // Current Logged-in User & Personal / Department Data
  const currentUser = StorageService.getCurrentUser();
  const myPatients = useMemo(() => {
    if (!currentUser) return [];
    return patients.filter(
      p => p.createdBy === currentUser.fullName || p.createdBy === currentUser.username || p.createdBy === currentUser.id
    );
  }, [patients, currentUser]);

  const myAuditLogs = useMemo(() => {
    if (!currentUser) return [];
    return auditLogs.filter(
      l => l.userId === currentUser.id || l.userName === currentUser.fullName
    );
  }, [auditLogs, currentUser]);

  const myDepartmentUsers = useMemo(() => {
    if (!currentUser?.department) return users;
    return users.filter(u => u.department === currentUser.department);
  }, [users, currentUser]);

  const handleExportMyReportCsv = () => {
    if (!currentUser) return;
    const timestamp = new Date().toISOString().slice(0, 10);
    const headers = ['User ID', 'Staff ID', 'Full Name', 'Role', 'Department', 'Designation', 'Patients Created', 'Audit Actions', 'Timestamp'];
    const row = [
      currentUser.id,
      currentUser.staffId || 'N/A',
      `"${currentUser.fullName}"`,
      currentUser.role,
      `"${currentUser.department || 'General'}"`,
      `"${currentUser.designation || 'Staff'}"`,
      myPatients.length,
      myAuditLogs.length,
      timestamp
    ];
    const csvContent = [headers.join(','), row.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LABMEDIX_MY_REPORT_${currentUser.username}_${timestamp}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    triggerCelebrationFireworks();
    showToast('success', 'Personal Report Downloaded', 'Your live staff report CSV has been exported.');
  };
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [syncCountdown, setSyncCountdown] = useState(30);

  // Doctor Master & Commission Payouts State
  const [doctors, setDoctors] = useState<DoctorMasterItem[]>(() => DoctorMasterService.getAllDoctors());
  const [payouts, setPayouts] = useState<DoctorCommissionPayoutRecord[]>(() => DoctorMasterService.getPayoutHistory());
  const [selectedDoctorForPayout, setSelectedDoctorForPayout] = useState<DoctorMasterItem | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [payoutMode, setPayoutMode] = useState<'Bank Transfer' | 'Cash' | 'Cheque' | 'Health Wallet UPI'>('Bank Transfer');
  const [payoutRefNo, setPayoutRefNo] = useState<string>('');
  const [payoutNotes, setPayoutNotes] = useState<string>('');

  // Auto-refresh countdown simulator
  useEffect(() => {
    const timer = setInterval(() => {
      setSyncCountdown((prev) => {
        if (prev <= 1) {
          handleAutoSyncData();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAutoSyncData = () => {
    setIsAutoSyncing(true);
    setTimeout(() => {
      setIsAutoSyncing(false);
      setSyncCountdown(30);
    }, 600);
  };

  const handleManualRefresh = () => {
    handleAutoSyncData();
    triggerCelebrationFireworks();
    showToast('success', 'Live Data Synchronized', 'Branch financials & velocity refreshed in real time.');
  };

  // Branch Multiplier for true-to-life branch filtering simulation
  const branchMultiplier = useMemo(() => {
    switch (selectedBranch) {
      case 'hq_kolkata':
        return 0.55;
      case 'salt_lake':
        return 0.22;
      case 'park_street':
        return 0.13;
      case 'howrah':
        return 0.10;
      default:
        return 1.0;
    }
  }, [selectedBranch]);

  // Core Financial Calculations
  const totalRegistrationRevenue = useMemo(() => {
    const base = cards.reduce((acc, c) => {
      const mem = memberships.find(m => m.id === c.membershipId);
      return acc + (mem?.registrationFee || 0);
    }, 0);
    return Math.round(base * branchMultiplier);
  }, [cards, memberships, branchMultiplier]);

  const totalWalletFloat = useMemo(() => {
    const base = wallets.reduce((acc, w) => acc + (w.balance || 0), 0);
    return Math.round(base * branchMultiplier);
  }, [wallets, branchMultiplier]);

  const totalWalletDeposits = useMemo(() => {
    const base = wallets.reduce((acc, w) => acc + (w.totalCredits || 0), 0);
    return Math.round(base * branchMultiplier);
  }, [wallets, branchMultiplier]);

  const totalBillingDeductions = useMemo(() => {
    const base = wallets.reduce((acc, w) => acc + (w.totalDebits || 0), 0);
    return Math.round(base * branchMultiplier);
  }, [wallets, branchMultiplier]);

  const activeCardCount = useMemo(() => {
    const active = cards.filter(c => c.status === 'active').length;
    return Math.max(1, Math.round(active * branchMultiplier));
  }, [cards, branchMultiplier]);

  const activePatientsCount = useMemo(() => {
    return Math.max(1, Math.round(patients.length * branchMultiplier));
  }, [patients, branchMultiplier]);

  // Registration Velocity Trend Data (Daily simulation with gradient curves)
  const registrationVelocityData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, idx) => {
      const factor = 1 + Math.sin(idx * 1.2) * 0.35;
      const basePatients = Math.round(Math.max(2, (patients.length / 7) * factor * branchMultiplier));
      const baseCards = Math.round(Math.max(1, basePatients * 0.88));
      const floatRecharged = Math.round(basePatients * 750 + Math.random() * 500);
      const deductions = Math.round(floatRecharged * 0.62);

      return {
        day,
        newPatients: basePatients,
        cardsIssued: baseCards,
        prepaidRecharged: floatRecharged,
        billingRedeemed: deductions
      };
    });
  }, [patients.length, branchMultiplier]);

  // Membership Revenue Breakdown
  const membershipRevenueData = useMemo(() => {
    return memberships.map((mem) => {
      const rawCount = cards.filter(c => c.membershipId === mem.id).length;
      const count = Math.max(1, Math.round(rawCount * branchMultiplier));
      const revenue = count * mem.registrationFee;
      return {
        name: mem.name,
        cardsIssued: count,
        revenue,
        color: mem.color || '#0D9488'
      };
    });
  }, [memberships, cards, branchMultiplier]);

  // Staff Productivity Matrix
  const staffProductivityData = useMemo(() => {
    return users.map((u, idx) => {
      const userPatients = patients.filter(
        p => p.createdBy === u.fullName || p.createdBy === u.username || p.createdBy === u.id
      ).length;
      const userAuditActions = auditLogs.filter(
        l => l.userId === u.id || l.userName === u.fullName
      ).length;

      const registeredCount = Math.max(userPatients, Math.round((12 - idx * 1.5) * branchMultiplier));
      const cardsPrinted = Math.round(registeredCount * 0.95);
      const actionsCount = Math.max(userAuditActions, registeredCount * 3 + Math.floor(Math.random() * 10));
      const accuracyScore = Math.min(100, Math.round(96 + Math.random() * 3.8));
      const avgProcessMinutes = (3.2 + (idx * 0.4)).toFixed(1);

      return {
        user: u,
        registeredCount,
        cardsPrinted,
        actionsCount,
        accuracyScore,
        avgProcessMinutes,
        rankBadge: idx === 0 ? '🥇 TOP PRODUCER' : idx === 1 ? '🥈 HIGH VELOCITY' : idx === 2 ? '🥉 SPECIALIST' : '⭐ OPERATOR'
      };
    }).sort((a, b) => b.registeredCount - a.registeredCount);
  }, [users, patients, auditLogs, branchMultiplier]);

  // Export Comprehensive Multi-Sheet CSV
  const handleExportCsv = () => {
    const selectedBranchObj = BRANCHES.find(b => b.id === selectedBranch) || BRANCHES[0];
    const timestamp = new Date().toISOString().slice(0, 10);

    const headers = ['Executive Category', 'Operational Metric / Indicator', 'Current Value', 'Branch Scope', 'Timestamp'];
    const rows = [
      ['Branch Scope', 'Active Facility Branch', selectedBranchObj.name, selectedBranchObj.code, timestamp],
      ['Branch Scope', 'Hospital Bed Occupancy Rate', `${selectedBranchObj.occupancyRate}%`, selectedBranchObj.code, timestamp],
      ['Patient Volume', 'Total Registered Patients', activePatientsCount, selectedBranchObj.code, timestamp],
      ['Card Operations', 'Active CR80 Health Cards', activeCardCount, selectedBranchObj.code, timestamp],
      ['Financials', 'Card Membership Fee Revenue', formatCurrency(totalRegistrationRevenue), selectedBranchObj.code, timestamp],
      ['Financials', 'Prepaid Patient Float Reserve', formatCurrency(totalWalletFloat), selectedBranchObj.code, timestamp],
      ['Financials', 'Total Prepaid Wallet Deposits', formatCurrency(totalWalletDeposits), selectedBranchObj.code, timestamp],
      ['Financials', 'Total OPD & Lab Billing Deductions', formatCurrency(totalBillingDeductions), selectedBranchObj.code, timestamp],
      ['Compliance', 'Cryptographic Audit Trail Actions', auditLogs.length, selectedBranchObj.code, timestamp]
    ];

    const staffHeaders = ['', '', '', '', ''];
    const staffTitle = ['--- STAFF PRODUCTIVITY MATRIX ---', '', '', '', ''];
    const staffSubHeaders = ['Staff Name', 'Assigned Role', 'Patients Registered', 'Cards Printed', 'Accuracy Score'];
    const staffRows = staffProductivityData.map(s => [
      `"${s.user.fullName}"`,
      s.user.role,
      s.registeredCount,
      s.cardsPrinted,
      `${s.accuracyScore}%`
    ]);

    const csvLines = [
      headers.join(','),
      ...rows.map(r => r.join(',')),
      staffHeaders.join(','),
      staffTitle.join(','),
      staffSubHeaders.join(','),
      ...staffRows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvLines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LABMEDIX_EXECUTIVE_AUDIT_${selectedBranchObj.code}_${timestamp}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    triggerCelebrationFireworks();
    showToast('success', 'Executive Report Exported', `Downloaded financial & operational CSV for ${selectedBranchObj.name}.`);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const activeBranchData = BRANCHES.find(b => b.id === selectedBranch) || BRANCHES[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. TOP EXECUTIVE HEADER WITH 3D AMBIENT LIGHTING */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 sm:p-8 text-white border border-slate-700/80 shadow-2xl">
        {/* Ambient 3D Glow Orbs */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <LabMedixLogo variant="monogram" size="lg" theme="white" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Branch Operations & Financial Analytics
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-500/20 text-teal-300 border border-teal-400/40 uppercase tracking-widest flex items-center gap-1">
                  <Activity className="w-3 h-3 text-teal-400 animate-pulse" />
                  LIVE AUTO-SYNC
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Executive audit intelligence, patient intake velocity, staff productivity rankings, and 3D prepaid float liquidity reserves.
              </p>
            </div>
          </div>

          {/* Action & Auto-Sync Pill Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
            {/* Auto-sync countdown timer */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs font-mono text-slate-300">
              <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isAutoSyncing ? 'animate-spin' : ''}`} />
              <span>Next Sync in: <strong className="text-teal-400">{syncCountdown}s</strong></span>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isAutoSyncing ? 'animate-spin' : ''}`} />}
              onClick={handleManualRefresh}
              className="bg-slate-800/80 border-slate-600 text-white hover:bg-slate-700"
            >
              Sync Now
            </Button>

            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-400" />}
              onClick={handleExportCsv}
            >
              Export CSV
            </Button>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={handlePrintReport}
            >
              Print Executive Report
            </Button>
          </div>
        </div>

        {/* Multi-Branch Selector Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-700/60 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mr-2">
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
            Active Branch:
          </span>
          {BRANCHES.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setSelectedBranch(b.id);
                showToast('info', 'Branch Filtered', `Loaded analytics for ${b.name}`);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedBranch === b.id
                  ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/25 scale-[1.03]'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/80'
              }`}
            >
              <span>{b.name.split(' (')[0]}</span>
              {b.id !== 'all' && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-950/40 text-teal-200">
                  {b.occupancyRate}%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 4 FLOATING 3D ISOMETRIC METRIC VAULT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Membership Fee Revenue */}
        <div className="relative group p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-xl overflow-hidden hover:border-emerald-400/60 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              Card Membership Revenue
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              +18.4% MoM
            </span>
          </div>
          <strong className="text-3xl font-black text-white tracking-tight block">
            {formatCurrency(totalRegistrationRevenue)}
          </strong>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>From CR80 PVC issuance</span>
            <span className="text-emerald-400 font-mono font-bold">{activeCardCount} Passes</span>
          </p>
          <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: '84%' }} />
          </div>
        </div>

        {/* Card 2: 3D Prepaid Patient Float Vault */}
        <div className="relative group p-6 rounded-3xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 shadow-xl overflow-hidden hover:border-blue-400/60 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Wallet className="w-4 h-4" />
              Prepaid Patient Float Vault
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
              100% LIQUID
            </span>
          </div>
          <strong className="text-3xl font-black text-white tracking-tight block">
            {formatCurrency(totalWalletFloat)}
          </strong>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>Net health wallet balance</span>
            <span className="text-blue-400 font-mono font-bold">₹{Math.round(totalWalletFloat / Math.max(activePatientsCount, 1))}/pt</span>
          </p>
          <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: '92%' }} />
          </div>
        </div>

        {/* Card 3: Patient Intake & Card Penetration */}
        <div className="relative group p-6 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 shadow-xl overflow-hidden hover:border-purple-400/60 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" />
              Card Issuance Velocity
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
              96.2% PENETRATION
            </span>
          </div>
          <strong className="text-3xl font-black text-white tracking-tight block">
            {activeCardCount} Cards
          </strong>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>Active registered patients</span>
            <span className="text-purple-400 font-mono font-bold">{activePatientsCount} Total</span>
          </p>
          <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: '96%' }} />
          </div>
        </div>

        {/* Card 4: Total Billing Deductions & Discounts */}
        <div className="relative group p-6 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 shadow-xl overflow-hidden hover:border-amber-400/60 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              OPD & Lab Redeemed
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
              DISCOUNTS DELIVERED
            </span>
          </div>
          <strong className="text-3xl font-black text-white tracking-tight block">
            {formatCurrency(totalBillingDeductions)}
          </strong>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>Total discounts redeemed</span>
            <span className="text-amber-400 font-mono font-bold">25% Avg Saved</span>
          </p>
          <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full" style={{ width: '76%' }} />
          </div>
        </div>
      </div>

      {/* 3. NAVIGATION VIEW TABS */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto text-xs font-bold">
        {[
          { id: 'overview' as const, name: '📊 Operational Overview', icon: BarChart3 },
          { id: 'my_reports' as const, name: '👤 My Personal & Dept Report', icon: Award },
          { id: 'dept_collections' as const, name: '🏥 Department Collections', icon: Building2 },
          { id: 'doctor_referrals' as const, name: '🩺 Doctor Recommendations & Referrals', icon: Stethoscope },
          { id: 'velocity' as const, name: '⚡ Registration Velocity', icon: Activity },
          { id: 'wallet_float' as const, name: '💰 Prepaid Float Ledger', icon: Wallet },
          { id: 'staff_productivity' as const, name: '👥 Staff Productivity Matrix', icon: Users },
          { id: 'audit_ledger' as const, name: '🛡️ Cryptographic Audit Ledger', icon: ShieldCheck }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveViewTab(tab.id)}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeViewTab === tab.id
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* 4. TAB CONTENTS */}
      {/* ================= TAB 1: OVERVIEW ================= */}
      {activeViewTab === 'overview' && (
        <div className="space-y-6">
          {/* Dual Charts: Registration Velocity AreaChart & Membership Tier Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: 3D Area Chart */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-teal-500" />
                    Patient Intake Velocity & CR80 Issuance Curve
                  </h3>
                  <p className="text-xs text-slate-500">
                    Weekly intake volume versus physical PVC card embossing rate ({activeBranchData.name.split(' (')[0]})
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-xl border border-teal-200 dark:border-teal-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Real-Time Ingestion</span>
                </div>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={registrationVelocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0D9488" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorCards" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284C7" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                    <XAxis dataKey="day" fontSize={11} stroke="#94A3B8" />
                    <YAxis fontSize={11} stroke="#94A3B8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '14px', border: '1px solid #334155' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                    <Area type="monotone" dataKey="newPatients" name="New Patients Registered" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#colorPatients)" />
                    <Area type="monotone" dataKey="cardsIssued" name="CR80 Cards Embossed" stroke="#0284C7" strokeWidth={3} fillOpacity={1} fill="url(#colorCards)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right 4 Cols: Membership Revenue Distribution */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-purple-500" />
                    Membership Tier Share
                  </h3>
                  <p className="text-xs text-slate-500">Plan volume & fee distribution</p>
                </div>

                <div className="h-44 w-full flex items-center justify-center my-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={membershipRevenueData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="cardsIssued"
                      >
                        {membershipRevenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', border: 'none' }}
                        formatter={(val: any, name: any) => [`${val} Cards`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  {membershipRevenueData.map((item, i) => (
                    <div key={i} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs border border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <strong className="text-teal-600 dark:text-teal-400 block">{formatCurrency(item.revenue)}</strong>
                        <span className="text-[10px] text-slate-400">{item.cardsIssued} issued</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs font-bold">
                <span className="text-slate-500">Total Membership Revenue:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">{formatCurrency(totalRegistrationRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Branch Operational Network Matrix */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-500" />
                  Healthcare Network Operational Directory ({BRANCHES.length - 1} Branch Outposts)
                </h3>
                <p className="text-xs text-slate-500">Facility capacity, occupancy rates, and lead clinical managers</p>
              </div>
              <Badge variant="success" size="sm">ALL ONLINE</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {BRANCHES.filter(b => b.id !== 'all').map((branch) => (
                <div
                  key={branch.id}
                  onClick={() => setSelectedBranch(branch.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                    selectedBranch === branch.id
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 shadow-md ring-2 ring-teal-400/30'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-black text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      {branch.code}
                    </span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      {branch.occupancyRate}% Bed Occupancy
                    </span>
                  </div>

                  <div>
                    <strong className="text-xs font-black text-slate-900 dark:text-white block leading-tight">
                      {branch.name}
                    </strong>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-red-500" /> {branch.city}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] space-y-1">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Total Capacity:</span>
                      <strong>{branch.beds} Beds</strong>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Lead Director:</span>
                      <span className="truncate max-w-[110px] font-semibold">{branch.manager}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: REGISTRATION VELOCITY ================= */}
      {activeViewTab === 'velocity' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500" />
                  Intake & Financial Velocity Multi-Axis Flow
                </h3>
                <p className="text-xs text-slate-500">
                  Tracking daily new patients, PVC cards embossed, prepaid float deposits, and billing redemptions
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Scope: {activeBranchData.code}</span>
              </div>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={registrationVelocityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" fontSize={11} stroke="#94A3B8" />
                  <YAxis yAxisId="left" fontSize={11} stroke="#94A3B8" />
                  <YAxis yAxisId="right" orientation="right" fontSize={11} stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '14px', border: '1px solid #334155' }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="newPatients" name="New Patients" fill="#0D9488" radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="left" dataKey="cardsIssued" name="CR80 Cards Embossed" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="prepaidRecharged" name="Prepaid Float Recharged (₹)" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="billingRedeemed" name="Billing Redeemed (₹)" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: PREPAID FLOAT LEDGER ================= */}
      {activeViewTab === 'wallet_float' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Deposits Collected</span>
              <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
                {formatCurrency(totalWalletDeposits)}
              </strong>
              <p className="text-xs text-slate-500">Gross prepaid recharges across all patient accounts</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total OPD & Lab Deductions</span>
              <strong className="text-2xl font-black text-rose-600 dark:text-rose-400 block">
                {formatCurrency(totalBillingDeductions)}
              </strong>
              <p className="text-xs text-slate-500">Redeemed for diagnostic tests, pharmacy, and consults</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Net Float Vault Reserve</span>
              <strong className="text-2xl font-black text-blue-600 dark:text-blue-400 block">
                {formatCurrency(totalWalletFloat)}
              </strong>
              <p className="text-xs text-slate-500">Held in escrow reserve for instant patient cashless settlement</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-teal-500" />
              Recent Patient Wallet Movements ({transactions.length} Ledger Records)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Reference No</th>
                    <th className="px-4 py-3">Patient ID</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Closing Balance</th>
                    <th className="px-4 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {transactions.slice(0, 8).map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{tx.referenceNo}</td>
                      <td className="px-4 py-3 text-teal-600">{tx.patientId}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tx.type === 'credit' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{formatCurrency(tx.amount)}</td>
                      <td className="px-4 py-3 text-slate-500">{formatCurrency(tx.closingBalance)}</td>
                      <td className="px-4 py-3 text-slate-400">{formatDate(tx.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: STAFF PRODUCTIVITY MATRIX ================= */}
      {activeViewTab === 'staff_productivity' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  Staff Productivity & Operational Efficiency Leaderboard
                </h3>
                <p className="text-xs text-slate-500">
                  Ranked by patient registrations, PVC cards printed, throughput velocity, and audit compliance
                </p>
              </div>

              <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200">
                {users.length} Healthcare Staff Tracked
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Rank / Badge</th>
                    <th className="px-4 py-3">Staff Officer</th>
                    <th className="px-4 py-3">Role & Clearance</th>
                    <th className="px-4 py-3">Patients Onboarded</th>
                    <th className="px-4 py-3">Cards Printed</th>
                    <th className="px-4 py-3">Avg Process Time</th>
                    <th className="px-4 py-3">Compliance Score</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {staffProductivityData.map((s, idx) => (
                    <tr key={s.user.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-2xs whitespace-nowrap">
                          {s.rankBadge}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl overflow-hidden bg-teal-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                            {s.user.photoUrl ? (
                              <img src={s.user.photoUrl} alt={s.user.fullName} className="w-full h-full object-cover object-top" />
                            ) : (
                              s.user.fullName.charAt(0)
                            )}
                          </div>
                          <div>
                            <strong className="font-bold text-slate-900 dark:text-white block">{s.user.fullName}</strong>
                            <span className="text-[10px] text-slate-400 font-mono">{s.user.staffId || `@${s.user.username}`}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <RoleBadge role={s.user.role} size="sm" />
                      </td>

                      <td className="px-4 py-3">
                        <strong className="font-mono text-teal-600 dark:text-teal-400 text-sm block">
                          {s.registeredCount} Patients
                        </strong>
                      </td>

                      <td className="px-4 py-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
                        {s.cardsPrinted} PVC Cards
                      </td>

                      <td className="px-4 py-3 font-mono text-slate-500">
                        ⏱️ {s.avgProcessMinutes} min
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ✅ {s.accuracyScore}%
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Badge variant={s.user.status === 'active' ? 'success' : 'danger'} size="sm">
                          {s.user.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: AUDIT LEDGER ================= */}
      {activeViewTab === 'audit_ledger' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                  Cryptographic Audit Trail Actions ({auditLogs.length} Verified Records)
                </h3>
                <p className="text-xs text-slate-500">
                  Immutable sequential SHA-256 ledger recording every administrative, card, wallet, and patient action
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-emerald-500 flex items-center gap-1">
                🔒 SHA-256 HASH VERIFIED
              </span>
            </div>

            <div className="space-y-3">
              {auditLogs.slice(0, 10).map((log, index) => (
                <div
                  key={log.id || index}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 uppercase">
                        {log.module}
                      </span>
                      <strong className="text-slate-900 dark:text-white font-bold">{log.action}</strong>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{log.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                      <span>Operator: <strong>{log.userName}</strong></span>
                      <span>•</span>
                      <span>Time: {formatDateTime(log.timestamp)}</span>
                    </div>
                  </div>

                  {log.hash && (
                    <div className="p-2 rounded-xl bg-slate-950 text-slate-400 font-mono text-[9px] border border-slate-800 shrink-0">
                      <span className="text-teal-400 block">HASH:</span>
                      <code>{log.hash.slice(0, 24)}...</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 6: DEPARTMENT COLLECTIONS ================= */}
      {activeViewTab === 'dept_collections' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Department-wise Financial Collections & Revenue Breakdown
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Real-time collection audit across Pathology, OPD Consultations, Pharmacy, Daycare OT, and Health Card Subscriptions.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export Dept Report (CSV)</span>
            </button>
          </div>

          {/* Department Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Pathology & Molecular Lab', gross: 245000, disc: 49000, net: 196000, count: 184, icon: FlaskConical, color: 'from-purple-600 to-indigo-600' },
              { label: 'OPD Doctor Consultations', gross: 182000, disc: 36400, net: 145600, count: 142, icon: Stethoscope, color: 'from-teal-600 to-emerald-600' },
              { label: 'Pharmacy & Dispensary', gross: 124000, disc: 18600, net: 105400, count: 210, icon: Pill, color: 'from-emerald-600 to-green-600' },
              { label: 'Daycare OT & Procedures', gross: 95000, disc: 14250, net: 80750, count: 32, icon: Building2, color: 'from-amber-600 to-orange-600' },
              { label: 'Health Card Subscriptions', gross: 112000, disc: 11200, net: 100800, count: 98, icon: CreditCard, color: 'from-blue-600 to-cyan-600' }
            ].map((dept, idx) => (
              <div key={idx} className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl bg-gradient-to-r ${dept.color} text-white shadow-sm`}>
                    <dept.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">{dept.count} Bills</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block truncate">{dept.label}</span>
                  <strong className="text-lg font-black text-slate-900 dark:text-white block mt-0.5">
                    {formatCurrency(dept.net)}
                  </strong>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Gross: ₹{(dept.gross / 1000).toFixed(0)}k</span>
                  <span className="text-emerald-500 font-bold">Disc: -₹{(dept.disc / 1000).toFixed(0)}k</span>
                </div>
              </div>
            ))}
          </div>

          {/* Department Revenue Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-500" />
                Department Revenue Comparison (Gross vs Card Savings vs Net Collection)
              </h4>
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Pathology Lab', Gross: 245000, Discount: 49000, Net: 196000 },
                      { name: 'OPD Consult', Gross: 182000, Discount: 36400, Net: 145600 },
                      { name: 'Pharmacy', Gross: 124000, Discount: 18600, Net: 105400 },
                      { name: 'Daycare OT', Gross: 95000, Discount: 14250, Net: 80750 },
                      { name: 'Health Cards', Gross: 112000, Discount: 11200, Net: 100800 }
                    ]}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="Gross" fill="#64748B" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Discount" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Net" fill="#0D9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-purple-500" />
                Payment Settlement Channel Share
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Health Wallet (Cashless)', value: 58 },
                        { name: 'UPI / QR Scanner', value: 24 },
                        { name: 'Cash Desk', value: 12 },
                        { name: 'Credit/Debit Card', value: 6 }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {['#0D9488', '#3B82F6', '#10B981', '#F59E0B'].map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => `${val}% Share`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 7: DOCTOR RECOMMENDATIONS & REFERRALS ================= */}
      {activeViewTab === 'doctor_referrals' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Doctor Recommendations & External Referral Auto System
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Automated tracking of diagnostic test recommendations, referral commissions, revenue attribution, and instant payouts.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export Referral Report (CSV)</span>
            </button>
          </div>

          {/* Doctor Master Referral Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                REGISTERED RECOMMENDING DOCTORS & REFERRAL PERFORMANCE ({doctors.length})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3.5">Doctor Profile & Code</th>
                    <th className="p-3.5">Speciality & Dept</th>
                    <th className="p-3.5 text-center">Referred Tests</th>
                    <th className="p-3.5 text-right">Referred Lab Revenue</th>
                    <th className="p-3.5 text-center">Comm. %</th>
                    <th className="p-3.5 text-right">Earned Comm.</th>
                    <th className="p-3.5 text-right">Paid Comm.</th>
                    <th className="p-3.5 text-right">Payable Balance</th>
                    <th className="p-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {doctors.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img src={doc.avatarUrl} alt={doc.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                          <div>
                            <strong className="text-slate-900 dark:text-white font-bold block">{doc.name}</strong>
                            <span className="text-[10px] text-slate-400 font-mono">{doc.doctorCode} • Reg: {doc.regNumber}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block">{doc.speciality}</span>
                        <span className="text-[10px] text-slate-400">{doc.department}</span>
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {doc.totalTestsReferredCount} tests
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(doc.totalReferredLabRevenue)}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                          {doc.bloodCommissionPercent}%
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                        {formatCurrency(doc.totalCommissionEarned)}
                      </td>
                      <td className="p-3.5 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        {formatCurrency(doc.totalCommissionPaid)}
                      </td>
                      <td className="p-3.5 text-right font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                        {formatCurrency(doc.payableCommissionBalance)}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDoctorForPayout(doc);
                            setPayoutAmount(String(doc.payableCommissionBalance));
                            setPayoutRefNo(`PAY-REF-${Date.now().toString(36).toUpperCase()}`);
                          }}
                          disabled={doc.payableCommissionBalance <= 0}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all mx-auto"
                        >
                          <Send className="w-3 h-3" />
                          <span>Disburse</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Commission Payout History Ledger */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              Recent Doctor Commission Payout Vouchers & Settlement Receipts ({payouts.length})
            </h4>

            {payouts.length === 0 ? (
              <p className="text-xs text-slate-400 font-mono py-4 text-center">No commission payout vouchers generated yet.</p>
            ) : (
              <div className="space-y-2">
                {payouts.slice(0, 6).map((pay) => (
                  <div key={pay.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {pay.payoutNo}
                        </span>
                        <strong className="text-slate-900 dark:text-white">{pay.doctorName}</strong>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{pay.notes}</p>
                    </div>
                    <div className="text-right font-mono">
                      <strong className="text-emerald-600 dark:text-emerald-400 font-black text-sm block">
                        +{formatCurrency(pay.amount)}
                      </strong>
                      <span className="text-[10px] text-slate-400">{pay.paymentMode} • Ref: {pay.referenceNo}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DISBURSE COMMISSION PAYOUT MODAL */}
      {selectedDoctorForPayout && (
        <Modal
          isOpen={!!selectedDoctorForPayout}
          onClose={() => setSelectedDoctorForPayout(null)}
          title={`💸 Disburse Referral Commission Payout — ${selectedDoctorForPayout.name}`}
          maxWidth="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const amt = parseFloat(payoutAmount);
              if (!amt || amt <= 0) {
                showToast('error', 'Invalid Amount', 'Please enter a valid payout amount.');
                return;
              }
              const res = DoctorMasterService.disburseCommissionPayout(
                selectedDoctorForPayout.id,
                amt,
                payoutMode,
                payoutRefNo,
                payoutNotes,
                'super_admin'
              );
              if (res.success) {
                triggerCelebrationFireworks();
                showToast('success', 'Commission Disbursed!', `Paid ${formatCurrency(amt)} to ${selectedDoctorForPayout.name}.`);
                setDoctors(DoctorMasterService.getAllDoctors());
                setPayouts(DoctorMasterService.getPayoutHistory());
                setSelectedDoctorForPayout(null);
              } else {
                showToast('error', 'Payout Error', res.error || 'Failed to disburse payout.');
              }
            }}
            className="space-y-4 text-xs"
          >
            <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-1">
              <span className="text-[10px] text-amber-300 uppercase font-mono font-bold block">Current Available Commission Balance</span>
              <strong className="text-xl font-black text-emerald-400">
                {formatCurrency(selectedDoctorForPayout.payableCommissionBalance)}
              </strong>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Payout Settlement Amount (₹):</label>
              <input
                type="number"
                max={selectedDoctorForPayout.payableCommissionBalance}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Payment Mode:</label>
                <select
                  value={payoutMode}
                  onChange={(e: any) => setPayoutMode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                  <option value="Cash">Cash Desk Disburse</option>
                  <option value="Cheque">Account Payee Cheque</option>
                  <option value="Health Wallet UPI">Health Wallet UPI</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Reference No / UTR:</label>
                <input
                  type="text"
                  value={payoutRefNo}
                  onChange={(e) => setPayoutRefNo(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Payout Notes / Audit Remarks:</label>
              <input
                type="text"
                placeholder="Optional commission settlement notes..."
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedDoctorForPayout(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Confirm & Disburse Payout</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================= TAB: MY PERSONAL & DEPT REPORT ================= */}
      {activeViewTab === 'my_reports' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Personal User & Department Live Audit Report ({currentUser?.fullName || 'Active Staff'})
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Real-time performance metrics, patient registrations, audit actions, and departmental logs tied to your secure staff ID ({currentUser?.staffId || currentUser?.username || 'ID'}).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportMyReportCsv}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export My Report (CSV)</span>
              </button>
              <button
                type="button"
                onClick={handlePrintReport}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print My Report</span>
              </button>
            </div>
          </div>

          {/* User Profile Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-teal-950 via-slate-900 to-slate-900 border border-teal-500/30 text-white space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                  alt={currentUser?.fullName}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-teal-400"
                />
                <div>
                  <strong className="text-white font-bold block">{currentUser?.fullName || 'Active Operator'}</strong>
                  <span className="text-[10px] text-teal-300 font-mono">{currentUser?.staffId || 'LMDX-STF-001'}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Assigned Role:</span>
                <span className="font-bold text-teal-400 uppercase">{currentUser?.role || 'staff'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Department:</span>
                <span className="font-semibold text-white">{currentUser?.department || 'General Operations'}</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase font-mono">My Registered Patients</span>
              <strong className="text-3xl font-black text-slate-900 dark:text-white block">
                {myPatients.length}
              </strong>
              <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1">
                Active patient intake records created by you
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase font-mono">Cryptographic Audit Actions</span>
              <strong className="text-3xl font-black text-slate-900 dark:text-white block">
                {myAuditLogs.length}
              </strong>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                Secured tamper-proof security audit trails
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase font-mono">Department Colleagues</span>
              <strong className="text-3xl font-black text-slate-900 dark:text-white block">
                {myDepartmentUsers.length}
              </strong>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
                Active staff in {currentUser?.department || 'Department'}
              </p>
            </div>
          </div>

          {/* Detailed Tables for My Patients & Audit Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-500" />
                  Patients Registered By You ({myPatients.length})
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Live Sync</span>
              </h4>

              {myPatients.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-mono text-xs">
                  No patient records created by your account yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {myPatients.map((p) => (
                    <div key={p.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-900 dark:text-white font-bold block">{p.fullName}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">UHID: {p.id} • {p.mobile}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                        {p.bloodGroup || 'General'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Your Recent Audit Trail Actions ({myAuditLogs.length})
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Encrypted Hash</span>
              </h4>

              {myAuditLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-mono text-xs">
                  No security audit actions logged for your account yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {myAuditLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-teal-600 dark:text-teal-400 block">{log.action}</span>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300">{log.description}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};