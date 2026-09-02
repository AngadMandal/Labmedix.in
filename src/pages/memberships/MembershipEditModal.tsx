import React, { useState } from 'react';
import { Membership, BenefitPackageItem, FamilyPlanPolicy } from '../../types';
import { MembershipTierService } from '../../services/membershipTierService';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Users2,
  User,
  Plus,
  Trash2,
  CheckCircle2,
  CreditCard,
  Percent,
  Sparkles,
  Gift,
  ShieldCheck,
  PackagePlus,
  Info
} from 'lucide-react';
import { generateUuid } from '../../utils/idGenerator';

interface MembershipEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  membership?: Membership | null;
  onSuccess: () => void;
}

type TabType = 'identity' | 'pricing' | 'discounts' | 'family' | 'benefits';

const PRESET_BENEFIT_BUNDLES: { category: BenefitPackageItem['category']; title: string; desc: string; value: number; limit: string }[] = [
  {
    category: 'preventive',
    title: 'Master Health Checkup Bundle',
    desc: 'CBC, Blood Sugar, Lipid Profile, LFT, KFT and ECG.',
    value: 2200,
    limit: '2 Full Checkups / Year'
  },
  {
    category: 'diagnostics',
    title: 'Complimentary Annual Blood Sugar & Lipid Profile',
    desc: 'Fasting glucose and total lipid biomarker assessment.',
    value: 650,
    limit: '1 Annual Voucher'
  },
  {
    category: 'consultation',
    title: '24/7 Priority Telemedicine Consultations',
    desc: 'Fast-track video consultation with certified Medical Officers.',
    value: 1200,
    limit: 'Unlimited Access'
  },
  {
    category: 'concierge',
    title: 'Zero-Fee Home Sample Collection',
    desc: 'Doorstep blood collection by certified phlebotomists.',
    value: 1500,
    limit: 'Unlimited Visits'
  },
  {
    category: 'hospital',
    title: 'VIP Fast-Track Clinic Queue',
    desc: 'Priority front-desk check-in and doctor appointment clearance.',
    value: 1000,
    limit: 'All Clinic Visits'
  },
  {
    category: 'pharmacy',
    title: 'Free Prescription Medicine Delivery',
    desc: 'Zero-fee home delivery of prescribed medications.',
    value: 800,
    limit: 'Unlimited Orders'
  }
];

export const MembershipEditModal: React.FC<MembershipEditModalProps> = ({
  isOpen,
  onClose,
  membership,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const isEditing = !!membership;

  const [activeTab, setActiveTab] = useState<TabType>('identity');

  // Tab 1: Identity
  const [name, setName] = useState(membership?.name || '');
  const [description, setDescription] = useState(membership?.description || '');
  const [color, setColor] = useState(membership?.color || '#0B4F9C');
  const [status, setStatus] = useState<'active' | 'inactive'>(membership?.status || 'active');
  const [isRecommended, setIsRecommended] = useState<boolean>(membership?.isRecommended || false);

  // Tab 2: Pricing & Validity
  const [registrationFee, setRegistrationFee] = useState(membership?.registrationFee || 499);
  const [annualRenewalFee, setAnnualRenewalFee] = useState(membership?.annualRenewalFee || 299);
  const [validityMonths, setValidityMonths] = useState(membership?.validityMonths || 12);
  const [cashbackPercentage, setCashbackPercentage] = useState(membership?.cashbackPercentage || 5);

  // Tab 3: Dynamic Multi-Department Discounts
  const [opdDiscount, setOpdDiscount] = useState(membership?.opdDiscount || 20);
  const [labDiscount, setLabDiscount] = useState(membership?.labDiscount || 25);
  const [pharmacyDiscount, setPharmacyDiscount] = useState(membership?.pharmacyDiscount || 10);
  const [homeCollectionDiscount, setHomeCollectionDiscount] = useState(membership?.homeCollectionDiscount || 50);
  const [emergencyDiscount, setEmergencyDiscount] = useState(membership?.emergencyDiscount || 15);
  const [ipdDiscount, setIpdDiscount] = useState(membership?.ipdDiscount || 10);
  const [teleconsultDiscount, setTeleconsultDiscount] = useState(membership?.teleconsultDiscount || 25);

  // Tab 4: Family Plan Policy & Limits
  const [isFamilyPlan, setIsFamilyPlan] = useState(membership?.isFamilyPlan || false);
  const [maxFamilyMembers, setMaxFamilyMembers] = useState(membership?.maxFamilyMembers || 4);
  const [primaryAgeMin, setPrimaryAgeMin] = useState(membership?.familyPolicy?.primaryAgeMinimum || 18);
  const [childAgeMax, setChildAgeMax] = useState(membership?.familyPolicy?.childAgeMaximum || 25);
  const [allowSharedWallet, setAllowSharedWallet] = useState(membership?.familyPolicy?.allowSharedWallet ?? true);
  const [allowDependentCards, setAllowDependentCards] = useState(membership?.familyPolicy?.allowDependentCards ?? true);
  const [additionalMemberFee, setAdditionalMemberFee] = useState(membership?.familyPolicy?.additionalMemberFee || 299);

  // Tab 5: Benefit Packages & Special Inclusions
  const [benefitsArray, setBenefitsArray] = useState<string[]>(
    membership?.specialBenefits?.length
      ? [...membership.specialBenefits]
      : [
          'Specialist Consultations Discount',
          'Pathology & Radiology Diagnostic Discounts',
          'Flat Pharmacy Prescription Discount'
        ]
  );

  const [benefitPackages, setBenefitPackages] = useState<BenefitPackageItem[]>(
    membership?.benefitPackages?.length
      ? [...membership.benefitPackages]
      : []
  );

  const handleAddBenefitString = () => {
    setBenefitsArray([...benefitsArray, '']);
  };

  const handleUpdateBenefitString = (index: number, value: string) => {
    const updated = [...benefitsArray];
    updated[index] = value;
    setBenefitsArray(updated);
  };

  const handleRemoveBenefitString = (index: number) => {
    setBenefitsArray(benefitsArray.filter((_, i) => i !== index));
  };

  const handleAddCustomPackage = () => {
    const newPkg: BenefitPackageItem = {
      id: `bp_${generateUuid().slice(0, 6)}`,
      title: 'New Clinical Benefit',
      category: 'preventive',
      description: 'Benefit description and diagnostic inclusion details.',
      quantityOrLimit: '1 Annual Voucher',
      valueInInr: 500
    };
    setBenefitPackages([...benefitPackages, newPkg]);
  };

  const handleAddPresetPackage = (preset: typeof PRESET_BENEFIT_BUNDLES[0]) => {
    const newPkg: BenefitPackageItem = {
      id: `bp_${generateUuid().slice(0, 6)}`,
      title: preset.title,
      category: preset.category,
      description: preset.desc,
      quantityOrLimit: preset.limit,
      valueInInr: preset.value
    };
    setBenefitPackages([...benefitPackages, newPkg]);
    showToast('info', 'Benefit Added', `Added "${preset.title}" to this tier package.`);
  };

  const handleRemovePackage = (id: string) => {
    setBenefitPackages(benefitPackages.filter(p => p.id !== id));
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

    const familyPolicy: FamilyPlanPolicy | undefined = isFamilyPlan
      ? {
          allowedRelationships: ['Self', 'Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Father-in-Law', 'Mother-in-Law'],
          primaryAgeMinimum: primaryAgeMin,
          childAgeMaximum: childAgeMax,
          allowSharedWallet,
          allowDependentCards,
          additionalMemberFee
        }
      : undefined;

    setIsSubmitting(true);

    try {
      if (isEditing && membership) {
        await MembershipTierService.update(
          membership.id,
          {
            name,
            description,
            validityMonths,
            registrationFee,
            annualRenewalFee,
            opdDiscount,
            labDiscount,
            pharmacyDiscount,
            homeCollectionDiscount,
            emergencyDiscount,
            ipdDiscount,
            teleconsultDiscount,
            cashbackPercentage,
            specialBenefits: finalBenefits,
            benefitPackages,
            color,
            isFamilyPlan,
            maxFamilyMembers: isFamilyPlan ? maxFamilyMembers : undefined,
            familyPolicy,
            isRecommended,
            status
          },
          userRole
        );
        showToast('success', 'Tier Updated', `${name} tier configuration updated and published system-wide.`);
      } else {
        await MembershipTierService.create(
          {
            name,
            slug: name.toLowerCase().replace(/\s+/g, '_'),
            description,
            validityMonths,
            registrationFee,
            annualRenewalFee,
            opdDiscount,
            labDiscount,
            pharmacyDiscount,
            homeCollectionDiscount,
            emergencyDiscount,
            ipdDiscount,
            teleconsultDiscount,
            cashbackPercentage,
            specialBenefits: finalBenefits,
            benefitPackages,
            color,
            badgeIcon: isFamilyPlan ? 'Users2' : 'Shield',
            isFamilyPlan,
            maxFamilyMembers: isFamilyPlan ? maxFamilyMembers : undefined,
            familyPolicy,
            isRecommended,
            status
          },
          userRole
        );
        showToast('success', 'Tier Created', `${name} membership tier created and published system-wide.`);
      }
      onSuccess();
    } catch (err: any) {
      showToast('error', 'Operation Blocked', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Configure Tier: ${membership?.name}` : 'Create Health Card Membership Tier'}
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-1 pb-1">
          {[
            { id: 'identity', label: '1. Identity & Style', icon: Sparkles },
            { id: 'pricing', label: '2. Pricing & Validity', icon: CreditCard },
            { id: 'discounts', label: '3. Dynamic Discounts', icon: Percent },
            { id: 'family', label: '4. Family Policy', icon: Users2 },
            { id: 'benefits', label: '5. Benefit Packages', icon: Gift }
          ].map(t => {
            const Icon = t.icon;
            const isSel = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as TabType)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  isSel
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: IDENTITY & STYLE */}
        {activeTab === 'identity' && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-blue" />
              Tier Identity &amp; Aesthetics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Membership Tier Name"
                placeholder="e.g. Gold Privilege"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Badge Color Hex
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Tier Description / Value Proposition
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Short summary of tier value, target patients, and clinical privileges."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-brand-blue"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Availability Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="active">Active (Available System-Wide for New Patients &amp; Renewals)</option>
                  <option value="inactive">Inactive (Hidden from Registration &amp; Offline Forms)</option>
                </select>
              </div>

              <div className="sm:col-span-2 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-500 font-black">★</span>
                    <strong className="text-xs font-black text-amber-950 dark:text-amber-200">
                      System Recommended Tier (Best Value Badge)
                    </strong>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300">
                    Flag this plan as the primary recommended choice. Pre-selected by default on patient registration and highlighted across public portals.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isRecommended}
                    onChange={e => setIsRecommended(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRICING & VALIDITY */}
        {activeTab === 'pricing' && (
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Tier Pricing &amp; Commercial Terms (INR ₹)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Initial Sign-up Fee (₹)"
                type="number"
                value={registrationFee}
                onChange={e => setRegistrationFee(Number(e.target.value))}
                required
                min={0}
              />
              <Input
                label="Annual Renewal Fee (₹)"
                type="number"
                value={annualRenewalFee}
                onChange={e => setAnnualRenewalFee(Number(e.target.value))}
                required
                min={0}
              />
              <Input
                label="Card Validity (Months)"
                type="number"
                value={validityMonths}
                onChange={e => setValidityMonths(Number(e.target.value))}
                required
                min={1}
                max={120}
              />
              <Input
                label="Health Wallet Cashback Rate (%)"
                type="number"
                value={cashbackPercentage}
                onChange={e => setCashbackPercentage(Number(e.target.value))}
                required
                min={0}
                max={50}
              />
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 text-xs flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span>Effective Monthly Cost:</span>
              <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-black">
                ₹{Math.round(registrationFee / Math.max(1, validityMonths))}/month
              </strong>
            </div>
          </div>
        )}

        {/* TAB 3: DYNAMIC MULTI-DEPARTMENT DISCOUNTS */}
        {activeTab === 'discounts' && (
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Percent className="w-4 h-4 text-brand-blue" />
              Dynamic Multi-Department Cashless Discounts (%)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="OPD Consultations (%)"
                type="number"
                value={opdDiscount}
                onChange={e => setOpdDiscount(Number(e.target.value))}
                required
                min={0}
                max={100}
              />
              <Input
                label="Lab Diagnostics (%)"
                type="number"
                value={labDiscount}
                onChange={e => setLabDiscount(Number(e.target.value))}
                required
                min={0}
                max={100}
              />
              <Input
                label="Pharmacy Prescriptions (%)"
                type="number"
                value={pharmacyDiscount}
                onChange={e => setPharmacyDiscount(Number(e.target.value))}
                required
                min={0}
                max={100}
              />
              <Input
                label="Home Phlebotomy (100 = Free)"
                type="number"
                value={homeCollectionDiscount}
                onChange={e => setHomeCollectionDiscount(Number(e.target.value))}
                required
                min={0}
                max={100}
              />
              <Input
                label="Emergency & Ambulance (%)"
                type="number"
                value={emergencyDiscount}
                onChange={e => setEmergencyDiscount(Number(e.target.value))}
                min={0}
                max={100}
              />
              <Input
                label="IPD / In-Patient Bed Rent (%)"
                type="number"
                value={ipdDiscount}
                onChange={e => setIpdDiscount(Number(e.target.value))}
                min={0}
                max={100}
              />
            </div>
          </div>
        )}

        {/* TAB 4: FAMILY PLAN POLICIES */}
        {activeTab === 'family' && (
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Users2 className="w-4 h-4 text-indigo-600" />
                Family Plan Governance &amp; Eligibility
              </h4>
            </div>

            <div className="p-1 rounded-xl bg-slate-200 dark:bg-slate-800 flex">
              <button
                type="button"
                onClick={() => setIsFamilyPlan(false)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  !isFamilyPlan ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'
                }`}
              >
                <User className="w-4 h-4" /> Individual Plan
              </button>
              <button
                type="button"
                onClick={() => setIsFamilyPlan(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  isFamilyPlan ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
                }`}
              >
                <Users2 className="w-4 h-4" /> Family Plan
              </button>
            </div>

            {isFamilyPlan && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Input
                  label="Max Family Members Allowed"
                  type="number"
                  value={maxFamilyMembers}
                  onChange={e => setMaxFamilyMembers(Number(e.target.value))}
                  required
                  min={2}
                  max={20}
                />
                <Input
                  label="Primary Account Min Age"
                  type="number"
                  value={primaryAgeMin}
                  onChange={e => setPrimaryAgeMin(Number(e.target.value))}
                  min={18}
                  max={100}
                />
                <Input
                  label="Child Max Dependent Age"
                  type="number"
                  value={childAgeMax}
                  onChange={e => setChildAgeMax(Number(e.target.value))}
                  min={18}
                  max={35}
                />
                <Input
                  label="Additional Member Add-on Fee (₹)"
                  type="number"
                  value={additionalMemberFee}
                  onChange={e => setAdditionalMemberFee(Number(e.target.value))}
                  min={0}
                />

                <div className="sm:col-span-2 space-y-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowSharedWallet}
                      onChange={e => setAllowSharedWallet(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-blue"
                    />
                    <span>Allow Shared Family Health Wallet for Cashless Deductions</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowDependentCards}
                      onChange={e => setAllowDependentCards(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-blue"
                    />
                    <span>Issue Individual CR80 Smart Health Cards for Each Dependent</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: BENEFIT PACKAGES & INCLUSIONS */}
        {activeTab === 'benefits' && (
          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 space-y-5">
            {/* Quick Add Presets */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 block mb-2">
                1-Click Quick Add Benefit Bundles
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_BENEFIT_BUNDLES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPresetPackage(preset)}
                    className="p-2 rounded-xl text-left border border-purple-200 dark:border-purple-800/80 bg-white dark:bg-slate-900 hover:border-purple-400 transition-all text-xs"
                  >
                    <strong className="text-[11px] font-black text-slate-900 dark:text-white block truncate">
                      + {preset.title}
                    </strong>
                    <span className="text-[10px] text-purple-600 font-mono block">Valued at ₹{preset.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Structured Benefit Packages List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-purple-600" />
                  Clinical Benefit Bundles ({benefitPackages.length})
                </h4>
                <button
                  type="button"
                  onClick={handleAddCustomPackage}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-purple-600 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 shadow-sm hover:bg-purple-50"
                >
                  + Add Custom Bundle
                </button>
              </div>

              {benefitPackages.map((pkg, idx) => (
                <div
                  key={pkg.id}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={pkg.title}
                      onChange={e => {
                        const updated = [...benefitPackages];
                        updated[idx].title = e.target.value;
                        setBenefitPackages(updated);
                      }}
                      className="font-black text-xs text-slate-900 dark:text-white bg-transparent outline-none flex-1 border-b border-transparent focus:border-purple-500"
                      placeholder="Benefit Title"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePackage(pkg.id)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <input
                      type="text"
                      value={pkg.description}
                      onChange={e => {
                        const updated = [...benefitPackages];
                        updated[idx].description = e.target.value;
                        setBenefitPackages(updated);
                      }}
                      placeholder="Short description of tests/privileges"
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                    <input
                      type="text"
                      value={pkg.quantityOrLimit || ''}
                      onChange={e => {
                        const updated = [...benefitPackages];
                        updated[idx].quantityOrLimit = e.target.value;
                        setBenefitPackages(updated);
                      }}
                      placeholder="e.g. 2 Visits / Year"
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                    <input
                      type="number"
                      value={pkg.valueInInr || 0}
                      onChange={e => {
                        const updated = [...benefitPackages];
                        updated[idx].valueInInr = Number(e.target.value);
                        setBenefitPackages(updated);
                      }}
                      placeholder="INR Value (₹)"
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bullet Points List */}
            <div className="space-y-2 pt-2 border-t border-purple-200 dark:border-purple-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Card Brochure Key Bullet Points ({benefitsArray.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddBenefitString}
                  className="text-xs font-bold text-purple-600 hover:underline"
                >
                  + Add Bullet
                </button>
              </div>
              {benefitsArray.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <input
                    type="text"
                    value={b}
                    onChange={e => handleUpdateBenefitString(i, e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveBenefitString(i)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-brand-blue" />
            <span>Changes sync system-wide instantly as the single source of truth.</span>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving Single Source of Truth...' : 'Save Membership Tier'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
