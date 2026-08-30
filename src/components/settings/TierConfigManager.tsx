import React, { useState, useEffect } from 'react';
import { MembershipTierService } from '../../services/membershipTierService';
import { Membership } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Edit, Trash2, CheckCircle2, Plus, X, Power, Crown, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const TierConfigManager: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const [tiers, setTiers] = useState<Membership[]>([]);
  const [editingTier, setEditingTier] = useState<Membership | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [opdDiscount, setOpdDiscount] = useState(0);
  const [annualRenewalFee, setAnnualRenewalFee] = useState(0);
  const [specialBenefits, setSpecialBenefits] = useState('');

  useEffect(() => {
    const unsubscribe = MembershipTierService.subscribeToTiers(setTiers);
    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setName('');
    setOpdDiscount(0);
    setAnnualRenewalFee(0);
    setSpecialBenefits('');
    setEditingTier(null);
    setIsFormOpen(false);
  };

  const handleEdit = (tier: Membership) => {
    setName(tier.name);
    setOpdDiscount(tier.opdDiscount);
    setAnnualRenewalFee(tier.annualRenewalFee);
    setSpecialBenefits(tier.specialBenefits.join('\n'));
    setEditingTier(tier);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string, tierName: string) => {
    if (!isSuperAdmin) return;
    if (window.confirm(`Are you sure you want to permanently delete the "${tierName}" tier?`)) {
      try {
        await MembershipTierService.delete(id, currentUser.role);
        showToast('success', 'Tier Deleted', `Successfully removed ${tierName}.`);
      } catch (e: any) {
        showToast('error', 'Delete Failed', e.message);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: 'active' | 'inactive') => {
    if (!isSuperAdmin) return;
    try {
      await MembershipTierService.toggleStatus(id, currentStatus, currentUser.role);
      showToast('info', 'Status Updated', 'Tier status has been changed system-wide.');
    } catch (e: any) {
      showToast('error', 'Update Failed', e.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin || !currentUser) return;

    const benefitsArray = specialBenefits.split('\n').map(b => b.trim()).filter(Boolean);

    setIsSubmitting(true);
    try {
      if (editingTier) {
        await MembershipTierService.update(
          editingTier.id,
          {
            name,
            opdDiscount,
            annualRenewalFee,
            specialBenefits: benefitsArray,
          },
          currentUser.role
        );
        showToast('success', 'Tier Updated', `${name} has been updated.`);
      } else {
        await MembershipTierService.create(
          {
            name,
            slug: name.toLowerCase().replace(/\s+/g, '_'),
            validityMonths: 12,
            registrationFee: annualRenewalFee,
            annualRenewalFee,
            opdDiscount,
            labDiscount: opdDiscount, // Defaulting for simplicity in this manager
            pharmacyDiscount: opdDiscount,
            homeCollectionDiscount: opdDiscount,
            specialBenefits: benefitsArray,
            color: '#0B4F9C',
            badgeIcon: 'Shield',
            isFamilyPlan: false,
            status: 'active',
          },
          currentUser.role
        );
        showToast('success', 'Tier Created', `${name} has been created system-wide.`);
      }
      resetForm();
    } catch (e: any) {
      showToast('error', 'Operation Failed', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-6 bg-rose-50 dark:bg-rose-950/30 rounded-2xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-rose-800 dark:text-rose-300">Access Denied</h4>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
            Only Super Admins can manage Tier Configurations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          Membership Tiers
        </h3>
        {!isFormOpen && (
          <Button size="sm" onClick={() => setIsFormOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Add New Tier
          </Button>
        )}
      </div>

      {/* Form / Editor */}
      {isFormOpen && (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {editingTier ? `Edit Tier: ${editingTier.name}` : 'Create New Tier'}
            </h4>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Tier Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Gold"
              />
              <Input
                label="Discount (%)"
                type="number"
                value={opdDiscount}
                onChange={(e) => setOpdDiscount(Number(e.target.value))}
                required
              />
              <Input
                label="Annual Fee (₹)"
                type="number"
                value={annualRenewalFee}
                onChange={(e) => setAnnualRenewalFee(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Special Benefits (One per line)
              </label>
              <textarea
                className="w-full px-3.5 py-3 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                rows={4}
                value={specialBenefits}
                onChange={(e) => setSpecialBenefits(e.target.value)}
                placeholder="e.g. Free OPD Consultations&#10;Free Ambulance Service"
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (editingTier ? 'Update Tier' : 'Create Tier')}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Dynamic List View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`p-4 rounded-xl border transition-all ${
              tier.status === 'active'
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Crown className="w-4 h-4 text-brand-blue" />
                  {tier.name}
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Fee: {formatCurrency(tier.annualRenewalFee)}/yr • {tier.opdDiscount}% Discount
                </p>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                tier.status === 'active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
              }`}>
                {tier.status}
              </span>
            </div>

            <div className="space-y-1.5 mb-4 text-xs text-slate-600 dark:text-slate-300">
              {tier.specialBenefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleToggleStatus(tier.id, tier.status)}
                className="flex-1 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-300"
              >
                <Power className="w-3.5 h-3.5" />
                {tier.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handleEdit(tier)}
                className="p-1.5 text-slate-400 hover:text-brand-blue transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(tier.id, tier.name)}
                className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {tiers.length === 0 && (
          <div className="col-span-full py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
            No membership tiers configured yet.
          </div>
        )}
      </div>
    </div>
  );
};
