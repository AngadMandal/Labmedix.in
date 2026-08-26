import React, { useState, useEffect } from 'react';
import { MembershipService } from '../../services/membershipService';
import { Membership } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { MembershipEditModal } from './MembershipEditModal';
import { formatCurrency } from '../../utils/formatters';
import { Award, Plus, Edit, Check, ShieldAlert, Lock, Power } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Award className="w-7 h-7 text-brand-blue" />
            Health Card Membership Tiers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Centralized single source of truth for Health Card tier discounts, renewal fees, and benefit packages.
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
          <Badge variant="warning" className="px-3 py-1.5 gap-1.5 font-bold">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {memberships.map((mem) => (
          <div
            key={mem.id}
            className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border transition-all flex flex-col justify-between shadow-sm hover:shadow-md ${
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
                    className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: mem.color }}
                  />
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{mem.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={mem.status === 'active' ? 'success' : 'neutral'} size="sm">
                    {mem.status === 'active' ? 'ACTIVE SYSTEM-WIDE' : 'DEACTIVATED'}
                  </Badge>
                </div>
              </div>

              {/* Price & Validity */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 mb-4 border border-slate-100 dark:border-slate-800">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(mem.registrationFee)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ {mem.validityMonths} Months</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Renewal Fee: {formatCurrency(mem.annualRenewalFee)}
                </span>
              </div>

              {/* 4 Discount Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">OPD Discount</span>
                  <strong className="text-sm font-black text-brand-blue">{mem.opdDiscount}% OFF</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Lab Tests</span>
                  <strong className="text-sm font-black text-brand-green">{mem.labDiscount}% OFF</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Pharmacy</span>
                  <strong className="text-sm font-black text-amber-600">{mem.pharmacyDiscount}% OFF</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Home Blood</span>
                  <strong className="text-sm font-black text-purple-600">
                    {mem.homeCollectionDiscount === 100 ? 'FREE' : `${mem.homeCollectionDiscount}%`}
                  </strong>
                </div>
              </div>

              {/* Included Benefits List */}
              <div className="space-y-1.5 mb-6 text-xs text-slate-600 dark:text-slate-300">
                {mem.specialBenefits.slice(0, 3).map((b, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            {isSuperAdmin ? (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleStatus(mem.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                    mem.status === 'active'
                      ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {mem.status === 'active' ? 'Deactivate Tier' : 'Activate Tier'}
                </button>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Edit className="w-3.5 h-3.5" />}
                  onClick={() => setEditingMem(mem)}
                >
                  Edit Tier
                </Button>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-amber-500" />
                <span>Super Admin privilege required to modify</span>
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
