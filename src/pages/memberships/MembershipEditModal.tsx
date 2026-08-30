import React, { useState } from 'react';
import { Membership } from '../../types';
import { MembershipTierService } from '../../services/membershipTierService';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Users2, User, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface MembershipEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  membership?: Membership | null;
  onSuccess: () => void;
}

export const MembershipEditModal: React.FC<MembershipEditModalProps> = ({
  isOpen,
  onClose,
  membership,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const isEditing = !!membership;

  const [name, setName] = useState(membership?.name || '');
  const [validityMonths, setValidityMonths] = useState(membership?.validityMonths || 12);
  const [registrationFee, setRegistrationFee] = useState(membership?.registrationFee || 499);
  const [annualRenewalFee, setAnnualRenewalFee] = useState(membership?.annualRenewalFee || 299);
  const [opdDiscount, setOpdDiscount] = useState(membership?.opdDiscount || 20);
  const [labDiscount, setLabDiscount] = useState(membership?.labDiscount || 25);
  const [pharmacyDiscount, setPharmacyDiscount] = useState(membership?.pharmacyDiscount || 10);
  const [homeCollectionDiscount, setHomeCollectionDiscount] = useState(membership?.homeCollectionDiscount || 50);
  const [status, setStatus] = useState<'active' | 'inactive'>(membership?.status || 'active');
  const [isFamilyPlan, setIsFamilyPlan] = useState(membership?.isFamilyPlan || false);
  const [maxFamilyMembers, setMaxFamilyMembers] = useState(membership?.maxFamilyMembers || 4);
  const [color, setColor] = useState(membership?.color || '#0B4F9C');

  // Dynamic Array for Special Benefits
  const [benefitsArray, setBenefitsArray] = useState<string[]>(
    membership?.specialBenefits?.length 
      ? [...membership.specialBenefits] 
      : [
          'Specialist Consultations Discount',
          'Pathology & Radiology Test Discounts',
          'Pharmacy Flat Discount'
        ]
  );

  const handleAddBenefit = () => {
    setBenefitsArray([...benefitsArray, '']);
  };

  const handleUpdateBenefit = (index: number, value: string) => {
    const newBenefits = [...benefitsArray];
    newBenefits[index] = value;
    setBenefitsArray(newBenefits);
  };

  const handleRemoveBenefit = (index: number) => {
    const newBenefits = benefitsArray.filter((_, i) => i !== index);
    setBenefitsArray(newBenefits);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userRole = currentUser?.role || 'user';
    if (userRole !== 'super_admin') {
      showToast('error', 'Security Violation', 'Only Super Admin can modify membership tiers.');
      return;
    }

    const finalBenefits = benefitsArray.map(s => s.trim()).filter(Boolean);

    setIsSubmitting(true);

    try {
      if (isEditing && membership) {
        await MembershipTierService.update(
          membership.id,
          {
            name,
            validityMonths,
            registrationFee,
            annualRenewalFee,
            opdDiscount,
            labDiscount,
            pharmacyDiscount,
            homeCollectionDiscount,
            specialBenefits: finalBenefits,
            color,
            isFamilyPlan,
            maxFamilyMembers: isFamilyPlan ? maxFamilyMembers : undefined,
            status
          },
          userRole
        );
        showToast('success', 'Tier Updated', `${name} tier configuration saved and synced system-wide.`);
      } else {
        await MembershipTierService.create(
          {
            name,
            slug: name.toLowerCase().replace(/\s+/g, '_'),
            validityMonths,
            registrationFee,
            annualRenewalFee,
            opdDiscount,
            labDiscount,
            pharmacyDiscount,
            homeCollectionDiscount,
            specialBenefits: finalBenefits,
            color,
            badgeIcon: 'Shield',
            isFamilyPlan,
            maxFamilyMembers: isFamilyPlan ? maxFamilyMembers : undefined,
            status
          },
          userRole
        );
        showToast('success', 'Tier Created', `${name} membership tier created and published system-wide.`);
      }
      onSuccess();
    } catch (err: any) {
      showToast('error', 'Operation Blocked', err.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? `Edit ${membership?.name}` : 'Create Membership Tier'} maxWidth="2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Tier Identity & Core Settings */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Identity & Plan Type
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Membership Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Badge Color (Hex)" value={color} onChange={(e) => setColor(e.target.value)} required />
            
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  Plan Scope (Individual / Family)
                </label>
                <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setIsFamilyPlan(false)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${
                      !isFamilyPlan ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <User className="w-4 h-4" /> Individual Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFamilyPlan(true)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${
                      isFamilyPlan ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-blue dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Users2 className="w-4 h-4" /> Family Plan
                  </button>
                </div>
              </div>
              
              {isFamilyPlan && (
                <Input 
                  label="Max Family Members" 
                  type="number" 
                  value={maxFamilyMembers} 
                  onChange={(e) => setMaxFamilyMembers(Number(e.target.value))} 
                  required 
                  min={1} 
                  max={20}
                />
              )}
            </div>
          </div>
        </div>

        {/* Financials & Discounts */}
        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 space-y-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Fees & Global Discounts
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Registration Fee (₹)" type="number" value={registrationFee} onChange={(e) => setRegistrationFee(Number(e.target.value))} required />
            <Input label="Renewal Fee (₹)" type="number" value={annualRenewalFee} onChange={(e) => setAnnualRenewalFee(Number(e.target.value))} required />
            <Input label="Validity (Months)" type="number" value={validityMonths} onChange={(e) => setValidityMonths(Number(e.target.value))} required />
            
            <Input label="OPD Discount (%)" type="number" value={opdDiscount} onChange={(e) => setOpdDiscount(Number(e.target.value))} required />
            <Input label="Lab Discount (%)" type="number" value={labDiscount} onChange={(e) => setLabDiscount(Number(e.target.value))} required />
            <Input label="Pharmacy (%)" type="number" value={pharmacyDiscount} onChange={(e) => setPharmacyDiscount(Number(e.target.value))} required />
            <Input label="Home Collection (%) - 100 for Free" type="number" value={homeCollectionDiscount} onChange={(e) => setHomeCollectionDiscount(Number(e.target.value))} required />
            
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              >
                <option value="active">Active (Available System-Wide)</option>
                <option value="inactive">Inactive (Hidden from New Card Selections)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Special Benefits Builder */}
        <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Special Benefits
            </h4>
            <button
              type="button"
              onClick={handleAddBenefit}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Benefit
            </button>
          </div>
          
          <div className="space-y-2.5">
            {benefitsArray.length === 0 && (
              <div className="text-xs text-slate-500 dark:text-slate-400 italic py-2 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                No special benefits added yet.
              </div>
            )}
            
            {benefitsArray.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2 group">
                <div className="mt-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 dark:text-indigo-500 shrink-0" />
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => handleUpdateBenefit(index, e.target.value)}
                    placeholder="e.g. 1 Free General Physician Consultation"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveBenefit(index)}
                  className="mt-1 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                  title="Remove Benefit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Membership Tier'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

