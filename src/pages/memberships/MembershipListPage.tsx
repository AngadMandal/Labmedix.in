import React, { useState, useEffect, useMemo } from 'react';
import { MembershipTierService } from '../../services/membershipTierService';
import { Membership } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { MembershipEditModal } from './MembershipEditModal';
import { DynamicDiscountSimulatorModal } from '../../components/memberships/DynamicDiscountSimulatorModal';
import { TierComparisonMatrixModal } from '../../components/memberships/TierComparisonMatrixModal';
import { FamilyPolicyRulesModal } from '../../components/memberships/FamilyPolicyRulesModal';
import { formatCurrency } from '../../utils/formatters';
import {
  Award,
  Plus,
  Edit,
  Check,
  ShieldAlert,
  Lock,
  Power,
  Trash2,
  Users2,
  User,
  Calculator,
  Table,
  LayoutGrid,
  Download,
  Search,
  CheckCircle2,
  Gift,
  Stethoscope,
  FlaskConical,
  Pill,
  Home,
  Star
} from 'lucide-react';

export const MembershipListPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const [memberships, setMemberships] = useState<Membership[]>(() => MembershipTierService.getAll());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMem, setEditingMem] = useState<Membership | null>(null);

  // Additional Modals
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorTierId, setSimulatorTierId] = useState<string | undefined>(undefined);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);

  // Filters & Views
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'family'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'individual' | 'family'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    const unsubscribe = MembershipTierService.subscribeToTiers((tiers) => {
      setMemberships(tiers);
    });
    return () => unsubscribe();
  }, []);

  // Filtered list
  const filteredMemberships = useMemo(() => {
    return memberships.filter(m => {
      if (!m || !m.name) return false; // skip corrupted entries
      const matchesSearch =
        (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.description || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        filterType === 'all' ||
        (filterType === 'family' && m.isFamilyPlan) ||
        (filterType === 'individual' && !m.isFamilyPlan);

      const matchesStatus =
        filterStatus === 'all' || m.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [memberships, searchTerm, filterType, filterStatus]);

  // Executive Statistics
  const stats = useMemo(() => {
    const valid = memberships.filter(m => m && m.name); // only count valid entries
    const total = valid.length;
    const active = valid.filter(m => m.status === 'active').length;
    const familyPlans = valid.filter(m => m.isFamilyPlan).length;
    const avgLabDiscount = total > 0
      ? Math.round(valid.reduce((acc, m) => acc + (m.labDiscount || 0), 0) / total)
      : 0;
    const totalBenefitValue = valid.reduce((acc, m) => acc + MembershipTierService.calculateTotalBenefitPackageValue(m), 0);

    return {
      total,
      active,
      familyPlans,
      avgLabDiscount,
      totalBenefitValue
    };
  }, [memberships]);

  const handleToggleStatus = async (id: string, currentStatus: 'active' | 'inactive') => {
    if (!isSuperAdmin || !currentUser) {
      showToast('error', 'Security Violation', 'Only Super Admin can activate or deactivate Membership Tiers.');
      return;
    }

    const newStatus: 'active' | 'inactive' = currentStatus === 'active' ? 'inactive' : 'active';
    // Optimistic UI update
    setMemberships(prev => prev.map(m => (m.id === id ? { ...m, status: newStatus } : m)));

    try {
      await MembershipTierService.toggleStatus(id, currentStatus, currentUser.role);
      showToast(
        newStatus === 'active' ? 'success' : 'info',
        `Tier Status Changed: ${newStatus.toUpperCase()}`,
        `Membership tier is now ${newStatus.toUpperCase()} and reflected instantly across all registration forms and portals.`
      );
    } catch (e: any) {
      showToast('error', 'Operation Failed', e.message);
      // Revert from local storage
      setMemberships(MembershipTierService.getAll());
    }
  };

  const handleSetRecommended = async (id: string, name: string) => {
    if (!isSuperAdmin || !currentUser) {
      showToast('error', 'Security Violation', 'Only Super Admin can change the recommended tier.');
      return;
    }

    // Optimistic UI update
    setMemberships(prev => prev.map(m => ({ ...m, isRecommended: m.id === id })));

    try {
      await MembershipTierService.setRecommended(id, currentUser.role);
      showToast(
        'success',
        'Recommended Tier Configured',
        `"${name}" is now marked as the System Recommended Tier across patient registrations and offline forms.`
      );
    } catch (e: any) {
      showToast('error', 'Update Failed', e.message);
      setMemberships(MembershipTierService.getAll());
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!isSuperAdmin || !currentUser) {
      showToast('error', 'Security Violation', 'Only Super Admin can delete Membership Tiers.');
      return;
    }
    if (window.confirm(`CRITICAL CONFIRMATION: Are you sure you want to permanently delete the "${name}" tier? It will be removed from all registration forms, patient intake, and print sheets.`)) {
      // Optimistic UI update
      setMemberships(prev => prev.filter(m => m.id !== id && m.slug !== id));

      try {
        await MembershipTierService.delete(id, currentUser.role);
        showToast('success', 'Tier Deleted', `Membership tier "${name}" has been permanently removed.`);
      } catch (e: any) {
        showToast('error', 'Delete Failed', e.message);
        setMemberships(MembershipTierService.getAll());
      }
    }
  };

  const handleOpenSimulator = (tierId?: string) => {
    setSimulatorTierId(tierId);
    setIsSimulatorOpen(true);
  };

  const handleExportCsv = () => {
    try {
      const csv = MembershipTierService.generateTierMasterCsv(memberships);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `LabMedix_Health_Card_Tiers_Master_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('success', 'Master Sheet Exported', 'Health Card Tier Master pricing & policy sheet exported to CSV.');
    } catch (e: any) {
      showToast('error', 'Export Failed', e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Core Action Center */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-brand-blue dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              Single Source of Truth
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              Live Real-Time Sync
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-1 flex items-center gap-2.5">
            <Award className="w-8 h-8 text-brand-blue" />
            Health Card Membership Tiers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Centralized single source of truth for Health Card tier pricing, family plan policies, dynamic discounts, and benefit packages.
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Calculator className="w-4 h-4 text-brand-blue" />}
            onClick={() => handleOpenSimulator()}
          >
            Discount Simulator
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Table className="w-4 h-4 text-emerald-600" />}
            onClick={() => setIsMatrixOpen(true)}
          >
            Policy Matrix
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Users2 className="w-4 h-4 text-indigo-600" />}
            onClick={() => setIsFamilyModalOpen(true)}
          >
            Family Policies
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCsv}
          >
            Export CSV
          </Button>

          {isSuperAdmin ? (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Add New Tier
            </Button>
          ) : (
            <Badge variant="warning" className="px-3 py-1.5 gap-1.5 font-bold shadow-sm">
              <Lock className="w-3.5 h-3.5" />
              Super Admin Exclusive
            </Badge>
          )}
        </div>
      </div>

      {/* RBAC Notice for non-super admins */}
      {!isSuperAdmin && (
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start sm:items-center gap-3 text-xs shadow-sm">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <div className="space-y-0.5">
            <strong className="font-black text-amber-950 dark:text-amber-100 block">Super Admin Exclusive Control Enforcement</strong>
            <p>
              Only the <strong>Super Administrator</strong> is authorized to Create, Edit, Activate, Deactivate, Set Recommended, or Delete Health Card Membership Tiers. You are viewing configured tiers in read-only operational mode.
            </p>
          </div>
        </div>
      )}

      {/* Executive KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Card Tiers</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</span>
            <Badge variant="success" size="sm">{stats.active} Active</Badge>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Family Health Plans</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{stats.familyPlans}</span>
            <span className="text-xs font-bold text-slate-500">Multi-Card</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Avg Lab Diagnostics</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.avgLabDiscount}%</span>
            <span className="text-xs font-bold text-slate-500">Discount</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Estimated Benefits Catalog</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono">
              {formatCurrency(stats.totalBenefitValue)}
            </span>
            <span className="text-[10px] font-bold text-slate-400">Total Inclusions</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Central Registry</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-sm font-black text-brand-blue flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> POS Synced
            </span>
            <span className="text-[10px] font-mono text-slate-400">100% SLA</span>
          </div>
        </div>
      </div>

      {/* Filter & View Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tiers by name, slug or benefits..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-brand-blue"
            />
          </div>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
          >
            <option value="all">All Plan Types</option>
            <option value="individual">Individual Plans</option>
            <option value="family">Family Plans Only</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
          >
            <option value="all">All Status ({memberships.length})</option>
            <option value="active">Active Only ({memberships.filter(m => m.status === 'active').length})</option>
            <option value="inactive">Inactive ({memberships.filter(m => m.status === 'inactive').length})</option>
          </select>
        </div>

        {/* View Switch */}
        <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Grid
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Table className="w-3.5 h-3.5" /> Table Matrix
          </button>
          <button
            onClick={() => setViewMode('family')}
            className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'family'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Users2 className="w-3.5 h-3.5" /> Family Governance
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: INTERACTIVE CARD GRID */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMemberships.map((membership) => {
            const benefitValue = MembershipTierService.calculateTotalBenefitPackageValue(membership);
            const isRec = Boolean(membership.isRecommended);

            return (
              <div
                key={membership.id}
                className={`flex flex-col justify-between rounded-2xl border transition-all duration-300 relative overflow-hidden bg-white dark:bg-slate-900 shadow-sm hover:shadow-md ${
                  isRec ? 'ring-2 ring-amber-400 dark:ring-amber-500 shadow-amber-100 dark:shadow-none' : ''
                } ${
                  membership.status === 'inactive' ? 'opacity-65 border-dashed border-slate-300 dark:border-slate-800' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Top Accent Strip */}
                <div className="h-2 w-full" style={{ backgroundColor: membership.color || '#0B4F9C' }} />

                {/* Recommended Badge Banner */}
                {isRec && (
                  <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase px-3 py-1 flex items-center justify-between shadow-sm">
                    <span className="flex items-center gap-1.5">
                      <Star className="w-3 h-3 fill-slate-950" /> System Recommended Tier
                    </span>
                    <span className="text-[9px] font-bold bg-white/80 px-1.5 py-0.2 rounded text-slate-900">
                      Default Selection
                    </span>
                  </div>
                )}

                <div className="p-5 space-y-4 flex-1">
                  {/* Title & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: membership.color }} />
                        <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">
                          {membership.name}
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 block font-bold">
                        slug: {membership.slug}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={membership.status === 'active' ? 'success' : 'neutral'} size="sm">
                        {membership.status.toUpperCase()}
                      </Badge>
                      {membership.isFamilyPlan ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                          <Users2 className="w-3 h-3" /> Family ({membership.maxFamilyMembers || 4})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          <User className="w-3 h-3" /> Individual
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {membership.description || 'Standard centralized healthcare protection tier.'}
                  </p>

                  {/* Pricing Box */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Initial Fee</span>
                      <strong className="text-lg font-black text-slate-900 dark:text-white font-mono">
                        {formatCurrency(membership.registrationFee)}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Renewal / Validity</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {formatCurrency(membership.annualRenewalFee)} / {membership.validityMonths}m
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Discounts Grid */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Dynamic Departmental Discounts
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-blue-900 dark:text-blue-300">
                          <Stethoscope className="w-3 h-3 text-blue-500" /> OPD Doctor
                        </span>
                        <strong className="font-mono text-blue-700 dark:text-blue-400 font-black">{membership.opdDiscount}%</strong>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-900 dark:text-emerald-300">
                          <FlaskConical className="w-3 h-3 text-emerald-500" /> Lab Tests
                        </span>
                        <strong className="font-mono text-emerald-700 dark:text-emerald-400 font-black">{membership.labDiscount}%</strong>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-900 dark:text-amber-300">
                          <Pill className="w-3 h-3 text-amber-500" /> Pharmacy
                        </span>
                        <strong className="font-mono text-amber-700 dark:text-amber-400 font-black">{membership.pharmacyDiscount}%</strong>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-purple-900 dark:text-purple-300">
                          <Home className="w-3 h-3 text-purple-500" /> Home Draw
                        </span>
                        <strong className="font-mono text-purple-700 dark:text-purple-400 font-black">
                          {membership.homeCollectionDiscount === 100 ? 'FREE' : `${membership.homeCollectionDiscount}%`}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Benefits Preview */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5 text-purple-600" />
                        Clinical Inclusions ({(membership.specialBenefits || []).length})
                      </span>
                      <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        Est. Val: ~{formatCurrency(benefitValue)}
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {(membership.specialBenefits || []).slice(0, 3).map((benefit, i) => (
                        <li key={i} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="truncate">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenSimulator(membership.id)}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-brand-blue bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 hover:bg-blue-100 flex items-center gap-1 transition-all"
                  >
                    <Calculator className="w-3.5 h-3.5" /> Simulate Bill
                  </button>

                  <div className="flex items-center gap-1.5">
                    {isSuperAdmin && (
                      <>
                        {/* Star / Recommend Button */}
                        <button
                          type="button"
                          onClick={() => handleSetRecommended(membership.id, membership.name)}
                          className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
                            isRec
                              ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800'
                              : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:text-amber-500'
                          }`}
                          title={isRec ? 'Currently Recommended Tier' : 'Set as System Recommended Tier'}
                        >
                          <Star className={`w-3.5 h-3.5 ${isRec ? 'fill-amber-500 text-amber-500' : ''}`} />
                          <span className="hidden sm:inline text-[11px]">{isRec ? 'Recommended' : 'Recommend'}</span>
                        </button>

                        {/* Edit Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingMem(membership)}
                          className="h-8 px-2.5"
                          title="Edit Tier Configuration"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>

                        {/* Active/Inactive Power Toggle */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(membership.id, membership.status)}
                          className={`h-8 px-2.5 ${
                            membership.status === 'active'
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800'
                              : 'text-slate-500 bg-slate-100 border-slate-300 dark:bg-slate-800'
                          }`}
                          title={membership.status === 'active' ? 'Click to Deactivate Tier' : 'Click to Activate Tier'}
                        >
                          <Power className="w-3.5 h-3.5 mr-1" />
                          <span className="text-[10px] font-bold">{membership.status === 'active' ? 'Active' : 'Inactive'}</span>
                        </Button>

                        {/* Delete Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(membership.id, membership.name)}
                          className="h-8 px-2.5 text-rose-600 hover:bg-rose-50 border-rose-200 dark:border-rose-900/50"
                          title="Delete Tier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: TABLE MATRIX */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <th className="p-3.5 font-black uppercase tracking-wider">Tier Name</th>
                <th className="p-3.5 font-black uppercase tracking-wider">Type</th>
                <th className="p-3.5 font-black uppercase tracking-wider">Recommended</th>
                <th className="p-3.5 font-black uppercase tracking-wider">Sign-up Fee</th>
                <th className="p-3.5 font-black uppercase tracking-wider">Renewal</th>
                <th className="p-3.5 font-black uppercase tracking-wider">Validity</th>
                <th className="p-3.5 font-black uppercase tracking-wider text-blue-600">OPD %</th>
                <th className="p-3.5 font-black uppercase tracking-wider text-emerald-600">Lab %</th>
                <th className="p-3.5 font-black uppercase tracking-wider text-amber-600">Pharm %</th>
                <th className="p-3.5 font-black uppercase tracking-wider text-purple-600">Home Draw</th>
                <th className="p-3.5 font-black uppercase tracking-wider">Est. Benefit</th>
                <th className="p-3.5 font-black uppercase tracking-wider">Status</th>
                <th className="p-3.5 font-black uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMemberships.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                      <span className="font-black text-slate-900 dark:text-white">{m.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    {m.isFamilyPlan ? (
                      <span className="text-indigo-600 font-bold flex items-center gap-1">
                        <Users2 className="w-3.5 h-3.5" /> Family ({m.maxFamilyMembers})
                      </span>
                    ) : (
                      <span className="text-slate-500 font-bold flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> Individual
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {m.isRecommended ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-black border border-amber-300 dark:border-amber-800">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Recommended
                      </span>
                    ) : isSuperAdmin ? (
                      <button
                        onClick={() => handleSetRecommended(m.id, m.name)}
                        className="text-slate-400 hover:text-amber-500 text-[10px] font-bold flex items-center gap-1"
                      >
                        <Star className="w-3 h-3" /> Set
                      </button>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="p-3.5 font-black font-mono text-slate-900 dark:text-white">
                    {formatCurrency(m.registrationFee)}
                  </td>
                  <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                    {formatCurrency(m.annualRenewalFee)}
                  </td>
                  <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">
                    {m.validityMonths}m
                  </td>
                  <td className="p-3.5 font-black text-blue-600">{m.opdDiscount}%</td>
                  <td className="p-3.5 font-black text-emerald-600">{m.labDiscount}%</td>
                  <td className="p-3.5 font-black text-amber-600">{m.pharmacyDiscount}%</td>
                  <td className="p-3.5 font-black text-purple-600">
                    {m.homeCollectionDiscount === 100 ? 'Free' : `${m.homeCollectionDiscount}%`}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-emerald-600">
                    ~{formatCurrency(MembershipTierService.calculateTotalBenefitPackageValue(m))}
                  </td>
                  <td className="p-3.5">
                    <button
                      disabled={!isSuperAdmin}
                      onClick={() => handleToggleStatus(m.id, m.status)}
                      className="cursor-pointer"
                      title={isSuperAdmin ? 'Click to toggle status' : ''}
                    >
                      <Badge variant={m.status === 'active' ? 'success' : 'neutral'} size="sm">
                        {m.status.toUpperCase()}
                      </Badge>
                    </button>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenSimulator(m.id)}
                        className="p-1.5 rounded-lg text-brand-blue hover:bg-blue-50"
                        title="Simulate Bill"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                      </button>
                      {isSuperAdmin && (
                        <>
                          <button
                            onClick={() => setEditingMem(m)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                            title="Edit Tier"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(m.id, m.status)}
                            className={`p-1.5 rounded-lg ${m.status === 'active' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                            title={m.status === 'active' ? 'Deactivate Tier' : 'Activate Tier'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id, m.name)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                            title="Delete Tier"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW MODE 3: FAMILY GOVERNANCE VIEW */}
      {viewMode === 'family' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 flex items-center justify-between text-xs text-indigo-950 dark:text-indigo-200">
            <div className="flex items-center gap-3">
              <Users2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <strong className="block text-sm font-black text-slate-900 dark:text-white">
                  Family Health Shield Governance Matrix
                </strong>
                <span>All multi-member household healthcare plans, primary cardholder validation rules, and dependent relationships.</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFamilyModalOpen(true)}
              className="bg-white dark:bg-slate-900"
            >
              View Full Rules
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memberships.filter(m => m.isFamilyPlan).map(tier => {
              const pol = tier.familyPolicy;
              return (
                <div
                  key={tier.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: tier.color }} />
                      <div>
                        <strong className="text-sm font-black text-slate-900 dark:text-white">{tier.name}</strong>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          {formatCurrency(tier.registrationFee)} / {tier.validityMonths} months
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={tier.status === 'active' ? 'success' : 'neutral'} size="sm">
                        {tier.status.toUpperCase()}
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        Max {tier.maxFamilyMembers || 4} Enrolled
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block font-bold">OPD Doctor</span>
                      <strong className="text-blue-600 font-black font-mono">{tier.opdDiscount}%</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block font-bold">Diagnostics</span>
                      <strong className="text-emerald-600 font-black font-mono">{tier.labDiscount}%</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block font-bold">Pharmacy</span>
                      <strong className="text-amber-600 font-black font-mono">{tier.pharmacyDiscount}%</strong>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                      Eligible Dependent Relations
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(pol?.allowedRelationships || ['Self', 'Spouse', 'Son', 'Daughter', 'Father', 'Mother']).map((rel, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                        >
                          {rel}
                        </span>
                      ))}
                    </div>
                  </div>

                  {isSuperAdmin && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Edit className="w-3.5 h-3.5" />}
                        onClick={() => setEditingMem(tier)}
                      >
                        Edit Family Policy
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {(isCreateModalOpen || editingMem) && (
        <MembershipEditModal
          isOpen={true}
          membership={editingMem}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingMem(null);
          }}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            setEditingMem(null);
            setMemberships(MembershipTierService.getAll());
          }}
        />
      )}

      {/* Dynamic Discount Simulator Modal */}
      {isSimulatorOpen && (
        <DynamicDiscountSimulatorModal
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          tiers={memberships}
          initialTierId={simulatorTierId}
        />
      )}

      {/* Policy Comparison Matrix Modal */}
      {isMatrixOpen && (
        <TierComparisonMatrixModal
          isOpen={isMatrixOpen}
          onClose={() => setIsMatrixOpen(false)}
          tiers={memberships}
        />
      )}

      {/* Family Policy Rules Modal */}
      {isFamilyModalOpen && (
        <FamilyPolicyRulesModal
          isOpen={isFamilyModalOpen}
          onClose={() => setIsFamilyModalOpen(false)}
          tiers={memberships}
        />
      )}
    </div>
  );
};
