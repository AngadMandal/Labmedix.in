import React, { useState } from 'react';
import { MembershipService } from '../../services/membershipService';
import { Membership } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { MembershipEditModal } from './MembershipEditModal';
import { formatCurrency } from '../../utils/formatters';
import { Award, Plus, Edit, Check, Shield, Stethoscope, Microscope, PlusCircle, Home } from 'lucide-react';

export const MembershipListPage: React.FC = () => {
  const { can } = useAuth();
  const { showToast } = useToast();
  const [memberships, setMemberships] = useState<Membership[]>(() => MembershipService.getAll());
  const [editingMem, setEditingMem] = useState<Membership | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const refreshList = () => {
    setMemberships(MembershipService.getAll());
  };

  const handleToggleStatus = (id: string) => {
    MembershipService.toggleStatus(id);
    showToast('info', 'Status Toggled', 'Membership tier status updated.');
    refreshList();
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
            Configure tier discount percentages (OPD, Lab, Pharmacy, Home Collection) and annual renewal fees.
          </p>
        </div>

        {can('membership_manage') && (
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add New Tier
          </Button>
        )}
      </div>

      {/* Grid of Membership Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {memberships.map((mem) => (
          <div
            key={mem.id}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
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
                <Badge variant={mem.status === 'active' ? 'success' : 'neutral'} size="sm">
                  {mem.status}
                </Badge>
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
            {can('membership_manage') && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(mem.id)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  {mem.status === 'active' ? 'Deactivate Tier' : 'Activate Tier'}
                </button>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Edit className="w-3.5 h-3.5" />}
                  onClick={() => setEditingMem(mem)}
                >
                  Edit Benefits
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit / Create Modals */}
      {(editingMem || isCreateModalOpen) && (
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