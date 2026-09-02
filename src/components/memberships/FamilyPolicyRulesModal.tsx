import React from 'react';
import { Membership } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { Users2, ShieldCheck, HeartHandshake, CreditCard, UserCheck, AlertCircle } from 'lucide-react';

interface FamilyPolicyRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  tiers: Membership[];
}

export const FamilyPolicyRulesModal: React.FC<FamilyPolicyRulesModalProps> = ({
  isOpen,
  onClose,
  tiers
}) => {
  const familyTiers = tiers.filter(t => t.isFamilyPlan);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Family Plan Policies & Eligibility Rules" maxWidth="4xl">
      <div className="space-y-6">
        <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-950 dark:text-indigo-200">
          <div className="flex items-start gap-3">
            <Users2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-black text-slate-900 dark:text-white block text-sm">
                Centralized Family Healthcare Governance Protocol
              </strong>
              <p>
                Family plans extend cashless discounts, individual CR80 PVC Smart Cards, and shared wallet pooling across verified household dependents.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Core Pillars of Family Policy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <strong className="text-xs font-black text-slate-900 dark:text-white block">Primary Verification</strong>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Primary cardholder must be at least 18 years old and serves as the legal account administrator.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <strong className="text-xs font-black text-slate-900 dark:text-white block">Eligible Relations</strong>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Spouse, biological/adopted children (up to 25 yrs), dependent parents, and parents-in-law.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600">
              <CreditCard className="w-4 h-4" />
            </div>
            <strong className="text-xs font-black text-slate-900 dark:text-white block">Individual CR80 Cards</strong>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Every enrolled dependent receives their own distinct NFC/QR Health Card linked to the family hub.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600">
              <UserCheck className="w-4 h-4" />
            </div>
            <strong className="text-xs font-black text-slate-900 dark:text-white block">Shared Wallet Pool</strong>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              One centralized prepaid balance covers all family OPD, lab diagnostic tests, and pharmacy bills.
            </p>
          </div>
        </div>

        {/* Active Family Tiers Breakdown */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Active Family Tier Specifications ({familyTiers.length} Configured Plans)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {familyTiers.map(tier => {
              const pol = tier.familyPolicy;
              return (
                <div
                  key={tier.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: tier.color }} />
                      <div>
                        <strong className="text-sm font-black text-slate-900 dark:text-white">{tier.name}</strong>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          {formatCurrency(tier.registrationFee)} / {tier.validityMonths} months
                        </span>
                      </div>
                    </div>
                    <Badge variant="success" size="sm">
                      Max {tier.maxFamilyMembers || 4} Members
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {tier.description || 'Full family healthcare protection plan with multi-card support.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-bold p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-slate-500">
                      Primary Min Age: <span className="text-slate-900 dark:text-white">{pol?.primaryAgeMinimum || 18} yrs</span>
                    </div>
                    <div className="text-slate-500">
                      Child Max Age: <span className="text-slate-900 dark:text-white">{pol?.childAgeMaximum || 25} yrs</span>
                    </div>
                    <div className="text-slate-500">
                      Shared Wallet: <span className="text-emerald-600">Enabled</span>
                    </div>
                    <div className="text-slate-500">
                      Dependent Cards: <span className="text-emerald-600">Issued Free</span>
                    </div>
                  </div>

                  {/* Allowed Relationships */}
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                      Permitted Family Member Relationships
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
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={onClose}>
            Close Policies
          </Button>
        </div>
      </div>
    </Modal>
  );
};
