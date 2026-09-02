import React, { useState, useMemo } from 'react';
import { Membership } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import { Calculator, Sparkles, Stethoscope, FlaskConical, Pill, Home, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { MembershipTierService } from '../../services/membershipTierService';

interface DynamicDiscountSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tiers: Membership[];
  initialTierId?: string;
}

export const DynamicDiscountSimulatorModal: React.FC<DynamicDiscountSimulatorModalProps> = ({
  isOpen,
  onClose,
  tiers,
  initialTierId
}) => {
  const activeTiers = useMemo(() => tiers.filter(t => t.status === 'active'), [tiers]);
  const [selectedTierId, setSelectedTierId] = useState<string>(initialTierId || activeTiers[0]?.id || '');
  
  // Custom mock invoice inputs
  const [opdBill, setOpdBill] = useState<number>(1000);
  const [labBill, setLabBill] = useState<number>(3500);
  const [pharmacyBill, setPharmacyBill] = useState<number>(1800);
  const [homeDrawSelected, setHomeDrawSelected] = useState<boolean>(true);
  const [homeDrawBaseFee, setHomeDrawBaseFee] = useState<number>(300);

  const selectedTier = useMemo(() => {
    return tiers.find(t => t.id === selectedTierId) || activeTiers[0] || tiers[0];
  }, [tiers, activeTiers, selectedTierId]);

  // Calculations
  const simulation = useMemo(() => {
    if (!selectedTier) {
      const gross = opdBill + labBill + pharmacyBill + (homeDrawSelected ? homeDrawBaseFee : 0);
      return {
        gross,
        opdDiscountAmt: 0,
        labDiscountAmt: 0,
        pharmacyDiscountAmt: 0,
        homeDrawDiscountAmt: 0,
        totalDiscount: 0,
        netPayable: gross,
        cashbackEarned: 0,
        effectiveDiscountPct: 0
      };
    }

    const opdRes = MembershipTierService.calculateDynamicDiscount(selectedTier, 'opd', opdBill);
    const labRes = MembershipTierService.calculateDynamicDiscount(selectedTier, 'lab', labBill);
    const pharmRes = MembershipTierService.calculateDynamicDiscount(selectedTier, 'pharmacy', pharmacyBill);
    const homeRes = homeDrawSelected
      ? MembershipTierService.calculateDynamicDiscount(selectedTier, 'home_collection', homeDrawBaseFee)
      : { discountPct: 0, discountAmount: 0, finalPayable: 0, cashbackEarned: 0 };

    const gross = opdBill + labBill + pharmacyBill + (homeDrawSelected ? homeDrawBaseFee : 0);
    const totalDiscount = opdRes.discountAmount + labRes.discountAmount + pharmRes.discountAmount + homeRes.discountAmount;
    const netPayable = Math.max(0, gross - totalDiscount);
    const cashbackPct = selectedTier.cashbackPercentage || 0;
    const cashbackEarned = Math.round((netPayable * cashbackPct) / 100);
    const effectiveDiscountPct = gross > 0 ? Math.round((totalDiscount / gross) * 100) : 0;

    return {
      gross,
      opdDiscountAmt: opdRes.discountAmount,
      labDiscountAmt: labRes.discountAmount,
      pharmacyDiscountAmt: pharmRes.discountAmount,
      homeDrawDiscountAmt: homeRes.discountAmount,
      totalDiscount,
      netPayable,
      cashbackEarned,
      effectiveDiscountPct
    };
  }, [selectedTier, opdBill, labBill, pharmacyBill, homeDrawSelected, homeDrawBaseFee]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dynamic Discount & Billing Simulator" maxWidth="4xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-950 dark:text-blue-200">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-brand-blue shrink-0" />
            <div>
              <strong className="block font-black text-slate-900 dark:text-white">Centralized Dynamic Discount Engine</strong>
              <span>Test live POS auto-deductions and multi-department rate discounts applied from the single source of truth.</span>
            </div>
          </div>
        </div>

        {/* Tier Selector Chips */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Select Health Card Tier to Test:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {tiers.map(t => {
              const isSelected = t.id === selectedTier?.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTierId(t.id)}
                  className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-blue bg-blue-50/60 dark:bg-blue-950/40 shadow-sm ring-2 ring-brand-blue/30'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="text-[11px] font-black text-slate-900 dark:text-white truncate">{t.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    {formatCurrency(t.registrationFee)}/yr
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2 Column: Left Inputs, Right Simulated Invoice */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Departmental Bill Inputs */}
          <div className="md:col-span-6 space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-brand-blue" />
              Sample Invoice Charges (₹)
            </h4>

            {/* OPD */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-blue-500" /> OPD Doctor Consultation
                </span>
                <span className="text-blue-600 font-mono font-bold">{selectedTier?.opdDiscount || 0}% OFF</span>
              </div>
              <input
                type="number"
                value={opdBill}
                onChange={e => setOpdBill(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none focus:border-brand-blue"
              />
            </div>

            {/* Lab */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-emerald-500" /> Pathology & Diagnostics
                </span>
                <span className="text-emerald-600 font-mono font-bold">{selectedTier?.labDiscount || 0}% OFF</span>
              </div>
              <input
                type="number"
                value={labBill}
                onChange={e => setLabBill(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none focus:border-brand-blue"
              />
            </div>

            {/* Pharmacy */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-amber-500" /> Pharmacy & Prescriptions
                </span>
                <span className="text-amber-600 font-mono font-bold">{selectedTier?.pharmacyDiscount || 0}% OFF</span>
              </div>
              <input
                type="number"
                value={pharmacyBill}
                onChange={e => setPharmacyBill(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none focus:border-brand-blue"
              />
            </div>

            {/* Home Collection */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={homeDrawSelected}
                    onChange={e => setHomeDrawSelected(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-blue bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                  <span className="flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-purple-500" /> Home Sample Phlebotomy
                  </span>
                </label>
                <span className="text-purple-600 font-mono text-xs font-bold">
                  {selectedTier?.homeCollectionDiscount === 100 ? '100% FREE' : `${selectedTier?.homeCollectionDiscount || 0}% OFF`}
                </span>
              </div>
              {homeDrawSelected && (
                <input
                  type="number"
                  value={homeDrawBaseFee}
                  onChange={e => setHomeDrawBaseFee(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  placeholder="Standard Home Visit Base Fee"
                />
              )}
            </div>
          </div>

          {/* Real-time Dynamic Billing Summary */}
          <div className="md:col-span-6 flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-lg">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedTier?.color }} />
                  <strong className="text-sm font-black">{selectedTier?.name} Shield</strong>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {simulation.effectiveDiscountPct}% Combined Savings
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Gross Hospital Bill:</span>
                  <span className="font-mono">{formatCurrency(simulation.gross)}</span>
                </div>
                <div className="flex justify-between text-blue-400">
                  <span>OPD Consultation Discount ({selectedTier?.opdDiscount || 0}%):</span>
                  <span className="font-mono">- {formatCurrency(simulation.opdDiscountAmt)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Lab Investigations Discount ({selectedTier?.labDiscount || 0}%):</span>
                  <span className="font-mono">- {formatCurrency(simulation.labDiscountAmt)}</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>Pharmacy Discount ({selectedTier?.pharmacyDiscount || 0}%):</span>
                  <span className="font-mono">- {formatCurrency(simulation.pharmacyDiscountAmt)}</span>
                </div>
                {homeDrawSelected && (
                  <div className="flex justify-between text-purple-400">
                    <span>Home Phlebotomy Discount ({selectedTier?.homeCollectionDiscount === 100 ? 'Free' : `${selectedTier?.homeCollectionDiscount}%`}):</span>
                    <span className="font-mono">- {formatCurrency(simulation.homeDrawDiscountAmt)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-emerald-300 text-sm">
                  <span>Total Cashless Discount:</span>
                  <span className="font-mono">- {formatCurrency(simulation.totalDiscount)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Final Patient Payable</span>
                  <span className="text-2xl font-black text-white">{formatCurrency(simulation.netPayable)}</span>
                </div>
                {simulation.cashbackEarned > 0 && (
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">+ Wallet Cashback</span>
                    <span className="text-sm font-black font-mono text-amber-300">+{formatCurrency(simulation.cashbackEarned)}</span>
                  </div>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-[11px] text-slate-300">
                <span>Annual Membership Sign-up Fee:</span>
                <span className="font-bold text-white">{formatCurrency(selectedTier?.registrationFee || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="primary" onClick={onClose}>
            Close Simulator
          </Button>
        </div>
      </div>
    </Modal>
  );
};
