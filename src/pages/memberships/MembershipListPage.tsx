import React, { useState, useEffect } from 'react';
import { MembershipService } from '../../services/membershipService';
import { Membership } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { MembershipEditModal } from './MembershipEditModal';
import { formatCurrency } from '../../utils/formatters';
import { Award, Plus, Edit, Check, ShieldAlert, Lock, Power, Trash2, Users2, User } from 'lucide-react';

export const MembershipListPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const [memberships, setMemberships] = useState<Membership[]>(() => MembershipService.getAll());
  const [editingMem, setEditingMem] = useState<Membership | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const refreshList = () => {
    setMemberships(MembershipService.getAll());
  };

  useEffect(() => {
    refreshList();
    const handleSync = () => refreshList();
    window.addEventListener('labmedix_data_synced', handleSync);
    return () => window.removeEventListener('labmedix_data_synced', handleSync);
  }, []);

  const handleToggleStatus = (id: string) => {
    if (!isSuperAdmin || !currentUser) {
      showToast('error', 'Security Violation', 'Only Super Admin can activate or deactivate Membership Tiers.');
      return;
    }
    try {
      const updated = MembershipService.toggleStatus(id, currentUser.role);
      if (updated) {
        showToast(
          'info',
          `Tier ${updated.status === 'active' ? 'Activated' : 'Deactivated'}`,
          `Membership tier "${updated.name}" is now ${updated.status.toUpperCase()} system-wide.`
        );
        refreshList();
      }
    } catch (e: any) {
      showToast('error', 'Operation Failed', e.message);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (!isSuperAdmin || !currentUser) {
      showToast('error', 'Security Violation', 'Only Super Admin can delete Membership Tiers.');
      return;
    }
    if (window.confirm(`CRITICAL WARNING: Are you sure you want to permanently delete the "${name}" tier? This action cannot be undone and may break existing user cards linked to this tier.`)) {
      try {
        const success = MembershipService.delete(id, currentUser.role);
        if (success) {
          showToast('success', 'Tier Deleted', `Membership tier "${name}" has been permanently removed.`);
          refreshList();
        }
      } catch (e: any) {
        showToast('error', 'Delete Failed', e.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Award className="w-7 h-7 text-brand-blue" />
            Health Card Membership Tiers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Centralized single source of truth for Health Card tier pricing, family plan policies, dynamic discounts, and benefit packages.
          </p>
        </div>

        {isSuperAdmin ? (
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add New Tier
          </Button>
        ) : (
          <Badge variant="warning" className="px-3 py-1.5 gap-1.5 font-bold shadow-sm">
            <Lock className="w-3.5 h-3.5" />
            Super Admin Exclusive Control Mode
          </Badge>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start sm:items-center gap-3 text-xs shadow-sm">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <div className="space-y-0.5">
            <strong className="font-black text-amber-950 dark:text-amber-100 block">Super Admin Exclusive Control Enforcement</strong>
            <p>
              Only the <strong>Super Administrator</strong> can Create, Edit, Activate, Deactivate, or Delete Health Card Membership Tiers. You are viewing configured tiers in read-only operational mode.
            </p>
          </div>
        </div>
      )}

      {/* Grid of Membership Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {memberships.map((mem) => (
          <div
            key={mem.id}
            className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border transition-all flex flex-col justify-between shadow-sm hover:shadow-lg hover:-translate-y-1 duration-300 ${
              mem.status === 'active'
                ? 'border-slate-200 dark:border-slate-800'
                : 'border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/30 opacity-80'
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: mem.color }}
                  />
                  <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    {mem.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={mem.status === 'active' ? 'success' : 'neutral'} size="sm">
                    {mem.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </div>
              </div>

              {/* Scope & Scale */}
              <div className="mb-4 flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${mem.isFamilyPlan ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {mem.isFamilyPlan ? <Users2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  {mem.isFamilyPlan ? 'Family Plan' : 'Individual'}
                </span>
                {mem.isFamilyPlan && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    Max: {mem.maxFamilyMembers} Members
                  </span>
                )}
              </div>

              {/* Price & Validity */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 mb-5 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(mem.registrationFee)}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mt-1">
                    Sign-up Fee
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-slate-700 dark:text-slate-300">
                    {mem.validityMonths} Months
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mt-1">
                    Renews at {formatCurrency(mem.annualRenewalFee)}
                  </span>
                </div>
              </div>

              {/* 4 Discount Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-5">
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 flex flex-col items-center text-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">OPD Consult</span>
                  <strong className="text-lg font-black text-brand-blue dark:text-blue-400">{mem.opdDiscount}% OFF</strong>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 flex flex-col items-center text-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">Lab Tests</span>
                  <strong className="text-lg font-black text-brand-green dark:text-emerald-400">{mem.labDiscount}% OFF</strong>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 flex flex-col items-center text-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">Pharmacy</span>
                  <strong className="text-lg font-black text-amber-600 dark:text-amber-400">{mem.pharmacyDiscount}% OFF</strong>
                </div>
                <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 flex flex-col items-center text-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">Home Draw</span>
                  <strong className="text-lg font-black text-purple-600 dark:text-purple-400">
                    {mem.homeCollectionDiscount === 100 ? 'FREE' : `${mem.homeCollectionDiscount}%`}
                  </strong>
                </div>
              </div>

              {/* Included Benefits List */}
              <div className="space-y-2 mb-6 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-[10px] uppercase tracking-wider block mb-2">Key Benefits</span>
                {mem.specialBenefits.slice(0, 3).map((b, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">{b}</span>
                  </div>
                ))}
                {mem.specialBenefits.length > 3 && (
                  <div className="text-[10px] font-bold text-slate-400 pl-5 pt-1">
                    + {mem.specialBenefits.length - 3} more benefits
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isSuperAdmin ? (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleToggleStatus(mem.id)}
                  className={`text-[11px] font-bold px-2 py-2 rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                    mem.status === 'active'
                      ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {mem.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => setEditingMem(mem)}
                  className="text-[11px] font-bold px-2 py-2 rounded-xl border transition-all flex items-center justify-center gap-1.5 bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Tier
                </button>
                <button
                  onClick={() => handleDelete(mem.id, mem.name)}
                  className="col-span-2 text-[11px] font-bold px-2 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:text-rose-400 dark:hover:bg-rose-950/50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Permanently Delete Tier
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-amber-500" />
                <span>Super Admin Access Required</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit / Create Modals */}
      {isSuperAdmin && (editingMem || isCreateModalOpen) && (
        <MembershipEditModal
          isOpen={!!editingMem || isCreateModalOpen}
          onClose={() => {
            setEditingMem(null);
            setIsCreateModalOpen(false);
          }}
          membership={editingMem}
          onSuccess={() => {
            setEditingMem(null);
            setIsCreateModalOpen(false);
            refreshList();
          }}
        />
      )}
    </div>
  );
};
