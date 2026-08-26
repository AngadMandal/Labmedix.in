import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DoctorMasterItem, DoctorMasterService, DoctorCommissionPayoutRecord } from '../../services/doctorMasterService';
import { StorageService } from '../../services/storage';
import { DoctorMasterEditModal } from '../../components/emr/DoctorMasterEditModal';
import { DoctorCommissionPayoutModal } from '../../components/emr/DoctorCommissionPayoutModal';
import { LabMedixLogo } from '../../components/common/LabMedixLogo';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDateTime, formatDate } from '../../utils/formatters';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import {
  Crown,
  Stethoscope,
  KeyRound,
  DollarSign,
  TestTube,
  TrendingUp,
  Receipt,
  UserPlus,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  Building,
  Phone,
  Mail,
  Award,
  Eye,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Printer
} from 'lucide-react';

export const DoctorMasterPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const company = StorageService.getCompanyProfile();

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const [doctors, setDoctors] = useState<DoctorMasterItem[]>(() => DoctorMasterService.getAllDoctors());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'on_leave' | 'inactive'>('all');
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorMasterItem | null>(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutDoctor, setPayoutDoctor] = useState<DoctorMasterItem | null>(null);
  const [showPayoutHistoryModal, setShowPayoutHistoryModal] = useState(false);

  const refreshList = () => {
    setDoctors(DoctorMasterService.getAllDoctors());
  };

  const togglePinReveal = (docId: string) => {
    if (!isSuperAdmin) {
      showToast('error', 'Access Restricted', 'Only Super Administrator has authority to view doctor security PINs.');
      return;
    }
    setRevealedPins(prev => ({ ...prev, [docId]: !prev[docId] }));
  };

  const handleToggleStatus = (doc: DoctorMasterItem) => {
    if (!isSuperAdmin) {
      showToast('error', 'Access Restricted', 'Only Super Administrator can change doctor status.');
      return;
    }
    const nextStatus = doc.status === 'active' ? 'on_leave' : doc.status === 'on_leave' ? 'inactive' : 'active';
    DoctorMasterService.updateDoctor(doc.id, { status: nextStatus }, 'super_admin');
    showToast('info', 'Status Updated', `${doc.name} status updated to ${nextStatus.toUpperCase().replace('_', ' ')}.`);
    refreshList();
  };

  // Filtered Doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = doc.name.toLowerCase().includes(q);
        const matchesCode = doc.doctorCode.toLowerCase().includes(q);
        const matchesSpec = doc.speciality.toLowerCase().includes(q);
        const matchesDept = doc.department.toLowerCase().includes(q);
        const matchesReg = doc.regNumber.toLowerCase().includes(q);
        const matchesUser = doc.username.toLowerCase().includes(q);
        return matchesName || matchesCode || matchesSpec || matchesDept || matchesReg || matchesUser;
      }
      return true;
    });
  }, [doctors, statusFilter, searchQuery]);

  // Aggregate Metrics
  const totalDoctors = doctors.length;
  const activeDoctors = doctors.filter(d => d.status === 'active').length;
  const totalConsultations = doctors.reduce((sum, d) => sum + d.totalConsultationsCompleted, 0);
  const totalFeesCollected = doctors.reduce((sum, d) => sum + d.totalFeesCollected, 0);
  const totalReferredTests = doctors.reduce((sum, d) => sum + d.totalTestsReferredCount, 0);
  const totalLabRevenueReferred = doctors.reduce((sum, d) => sum + d.totalReferredLabRevenue, 0);
  const totalCommissionEarned = doctors.reduce((sum, d) => sum + d.totalCommissionEarned, 0);
  const totalCommissionPaid = doctors.reduce((sum, d) => sum + d.totalCommissionPaid, 0);
  const totalPayableBalance = doctors.reduce((sum, d) => sum + d.payableCommissionBalance, 0);

  const payoutHistory = DoctorMasterService.getPayoutHistory();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. TOP HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-950 p-6 sm:p-8 text-white border border-slate-700/80 shadow-2xl">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono text-xs font-bold border border-purple-500/30 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                SUPER ADMIN ROOT CLEARANCE
              </span>
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 font-mono text-xs font-bold border border-teal-500/30">
                CLINICAL FINANCIAL MASTER
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>👨‍⚕️ Doctor Master & Commission Suite</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Complete physician master directory with automated user ID & credentials generator, clinical consultation fees collection in Indian Rupee (₹), and diagnostic pathology & blood test referral commission ledger.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-200 hover:bg-slate-800 font-bold"
              leftIcon={<Receipt className="w-3.5 h-3.5 text-teal-400" />}
              onClick={() => setShowPayoutHistoryModal(true)}
            >
              Payout History ({payoutHistory.length})
            </Button>

            {isSuperAdmin ? (
              <Button
                variant="primary"
                size="sm"
                className="bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 text-white font-black shadow-lg shadow-purple-500/20 border-none"
                leftIcon={<UserPlus className="w-4 h-4 text-white" />}
                onClick={() => {
                  setEditingDoctor(null);
                  setIsEditModalOpen(true);
                }}
              >
                ➕ Register Physician to Master
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="opacity-40 cursor-not-allowed"
                leftIcon={<Lock className="w-3.5 h-3.5" />}
              >
                Add Doctor (Super Admin Only)
              </Button>
            )}
          </div>
        </div>

        {/* Bottom Information Strip */}
        <div className="mt-6 pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between text-xs text-slate-300 font-mono gap-3">
          <div className="flex items-center gap-2">
            <span className="text-teal-400 font-bold">Governance Mode:</span>
            <strong>Super Admin Exclusive Modification Rights</strong>
          </div>
          <div className="flex items-center gap-4">
            <span>Active Physicians: <strong className="text-emerald-400">{activeDoctors} / {totalDoctors}</strong></span>
            <span>Total Consultations: <strong className="text-teal-300">{totalConsultations}</strong></span>
            <span>Total Referred Tests: <strong className="text-purple-300">{totalReferredTests}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. FOUR FINANCIAL & OPERATIONAL KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Card 1: Registered Physicians */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Registered Physicians</span>
            <Stethoscope className="w-4 h-4 text-teal-500" />
          </div>
          <strong className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white block">
            {totalDoctors} Doctors
          </strong>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {activeDoctors} Active in OPD Clinics
          </span>
        </div>

        {/* Card 2: Consultation Fees Collected */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Fees Collected (₹)</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <strong className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 block">
            {formatCurrency(totalFeesCollected)}
          </strong>
          <span className="text-[11px] text-slate-500 font-mono">
            {totalConsultations} Completed Consultations
          </span>
        </div>

        {/* Card 3: Diagnostic Lab Referral Commission */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Lab Referral Volume</span>
            <TestTube className="w-4 h-4 text-purple-500" />
          </div>
          <strong className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 block">
            {formatCurrency(totalCommissionEarned)}
          </strong>
          <span className="text-[11px] text-slate-500 font-mono">
            {totalReferredTests} Tests ({formatCurrency(totalLabRevenueReferred)} Gross)
          </span>
        </div>

        {/* Card 4: Net Payable Commission Balance */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Payable Balance (Due)</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <strong className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 block">
            {formatCurrency(totalPayableBalance)}
          </strong>
          <span className="text-[11px] text-emerald-500 font-bold">
            {formatCurrency(totalCommissionPaid)} Settled / Disbursed
          </span>
        </div>
      </div>

      {/* 3. SEARCH & STATUS FILTER TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search physician by name, code, speciality, department, or reg no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all' as const, label: `All Doctors (${doctors.length})` },
            { id: 'active' as const, label: `Active (${doctors.filter(d => d.status === 'active').length})` },
            { id: 'on_leave' as const, label: `On Leave (${doctors.filter(d => d.status === 'on_leave').length})` },
            { id: 'inactive' as const, label: `Inactive (${doctors.filter(d => d.status === 'inactive').length})` }
          ].map(filter => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setStatusFilter(filter.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === filter.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. PHYSICIAN DIRECTORY CARDS */}
      <div className="space-y-4">
        {filteredDoctors.map((doc) => {
          const isRevealed = revealedPins[doc.id];
          return (
            <div
              key={doc.id}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-teal-500/40 transition-all"
            >
              {/* Doctor Main Header Row */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-teal-500/50 shadow-md shrink-0">
                    <img src={doc.avatarUrl} alt={doc.name} className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <strong className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {doc.name}
                      </strong>
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-500/30 text-teal-600 dark:text-teal-400 font-mono text-[11px] font-bold">
                        {doc.doctorCode}
                      </span>
                      <Badge variant={doc.status === 'active' ? 'success' : doc.status === 'on_leave' ? 'warning' : 'danger'} size="sm">
                        {doc.status.toUpperCase().replace('_', ' ')}
                      </Badge>
                    </div>

                    <span className="text-xs sm:text-sm text-teal-600 dark:text-teal-400 font-bold block truncate">
                      {doc.qualification} • {doc.speciality}
                    </span>

                    <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                      Reg No: <strong className="text-slate-300">{doc.regNumber}</strong> • {doc.department} • {doc.opdRoom} ({doc.opdTiming})
                    </span>
                  </div>
                </div>

                {/* Super Admin Action Controls */}
                <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-center justify-start lg:justify-end">
                  {/* Disburse Commission Button */}
                  {isSuperAdmin ? (
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-950 font-black shadow-md"
                      leftIcon={<DollarSign className="w-3.5 h-3.5 text-slate-950" />}
                      onClick={() => {
                        setPayoutDoctor(doc);
                        setIsPayoutModalOpen(true);
                      }}
                      disabled={doc.payableCommissionBalance <= 0}
                    >
                      Disburse Payout ({formatCurrency(doc.payableCommissionBalance)})
                    </Button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-mono text-xs font-bold">
                      Due: {formatCurrency(doc.payableCommissionBalance)}
                    </span>
                  )}

                  {/* Edit Doctor Profile & Financials */}
                  {isSuperAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                      leftIcon={<Edit3 className="w-3.5 h-3.5 text-amber-500" />}
                      onClick={() => {
                        setEditingDoctor(doc);
                        setIsEditModalOpen(true);
                      }}
                    >
                      Edit Profile & Rates
                    </Button>
                  )}

                  {/* Toggle Status */}
                  {isSuperAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Change Status (Active / On Leave / Inactive)"
                      onClick={() => handleToggleStatus(doc)}
                    >
                      <Lock className="w-4 h-4 text-slate-400 hover:text-amber-400" />
                    </Button>
                  )}
                </div>
              </div>

              {/* 3 Detailed Cards Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-mono">
                {/* 1. Staff Credentials Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      🔐 Staff Login Account:
                    </span>
                    <span className="text-[9.5px] text-teal-400 font-bold">Role: Doctor</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Username:</span>
                      <strong className="text-teal-500 text-xs">@{doc.username}</strong>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block">Security PIN:</span>
                      {isSuperAdmin ? (
                        <button
                          type="button"
                          onClick={() => togglePinReveal(doc.id)}
                          className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-[11px] font-bold text-amber-400 flex items-center gap-1 transition-colors"
                        >
                          <KeyRound className="w-3 h-3 text-amber-400" />
                          <span>{isRevealed ? doc.pinCode : '••••'}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>•••• (Locked)</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Consultation Fee Matrix Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      💵 Consultation Fees Matrix (₹):
                    </span>
                    <span className="text-[9.5px] text-emerald-500 font-bold">{doc.totalConsultationsCompleted} Visits</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-1 text-[10.5px]">
                    <div>
                      <span className="text-slate-400 text-[9.5px] block">Standard:</span>
                      <strong className="text-emerald-500">{formatCurrency(doc.standardFee)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9.5px] block">Follow-up:</span>
                      <strong className="text-slate-300">{formatCurrency(doc.followUpFee)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9.5px] block">Telemed:</span>
                      <strong className="text-purple-400">{formatCurrency(doc.telemedicineFee)}</strong>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800 flex justify-between">
                    <span>Total Fees Collected:</span>
                    <strong className="text-white">{formatCurrency(doc.totalFeesCollected)}</strong>
                  </div>
                </div>

                {/* 3. Pathology & Blood Referral Commission Box */}
                <div className="p-3.5 rounded-2xl bg-teal-950/30 border border-teal-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">
                      🩸 Diagnostic Referral ({doc.bloodCommissionPercent}%):
                    </span>
                    <span className="text-[9.5px] text-purple-300 font-bold">{doc.totalTestsReferredCount} Tests</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-1 text-[10.5px]">
                    <div>
                      <span className="text-slate-400 text-[9.5px] block">Earned:</span>
                      <strong className="text-emerald-400">{formatCurrency(doc.totalCommissionEarned)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9.5px] block">Settled:</span>
                      <strong className="text-blue-400">{formatCurrency(doc.totalCommissionPaid)}</strong>
                    </div>
                    <div>
                      <span className="text-amber-300 text-[9.5px] block font-bold">Due Balance:</span>
                      <strong className="text-amber-300 font-black">{formatCurrency(doc.payableCommissionBalance)}</strong>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 pt-1 border-t border-teal-500/20 flex justify-between">
                    <span>Gross Lab Revenue Referred:</span>
                    <strong className="text-teal-300">{formatCurrency(doc.totalReferredLabRevenue)}</strong>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. PAYOUT HISTORY MODAL */}
      {showPayoutHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-teal-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Doctor Referral Commission Settlement History
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPayoutHistoryModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 text-xs font-mono">
              {payoutHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No commission payout settlements recorded yet.
                </div>
              ) : (
                payoutHistory.map((payout) => (
                  <div
                    key={payout.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 dark:text-white">{payout.doctorName}</strong>
                        <span className="text-teal-500 font-bold">{payout.payoutNo}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {payout.paymentMode} • Ref: {payout.referenceNo} • {formatDateTime(payout.paidAt)}
                      </span>
                    </div>

                    <div className="text-right">
                      <strong className="text-emerald-500 text-sm block">
                        {formatCurrency(payout.amount)}
                      </strong>
                      <span className="text-[10px] text-slate-400">Paid by Super Admin</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t flex justify-end shrink-0">
              <Button size="sm" variant="outline" onClick={() => setShowPayoutHistoryModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 6. SUPER ADMIN DOCTOR MASTER EDIT MODAL */}
      {isEditModalOpen && (
        <DoctorMasterEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingDoctor(null);
          }}
          doctor={editingDoctor}
          onSaved={refreshList}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      {/* 7. SUPER ADMIN COMMISSION PAYOUT MODAL */}
      {isPayoutModalOpen && (
        <DoctorCommissionPayoutModal
          isOpen={isPayoutModalOpen}
          onClose={() => {
            setIsPayoutModalOpen(false);
            setPayoutDoctor(null);
          }}
          doctor={payoutDoctor}
          onPayoutCompleted={refreshList}
          isSuperAdmin={isSuperAdmin}
        />
      )}
    </div>
  );
};
