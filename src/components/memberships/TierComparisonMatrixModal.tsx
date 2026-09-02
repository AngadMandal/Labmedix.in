import React from 'react';
import { Membership } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { Check, X, Users2, User, Sparkles, Download, FileText, Gift, Award } from 'lucide-react';
import { MembershipTierService } from '../../services/membershipTierService';
import { useToast } from '../../context/ToastContext';

interface TierComparisonMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  tiers: Membership[];
}

export const TierComparisonMatrixModal: React.FC<TierComparisonMatrixModalProps> = ({
  isOpen,
  onClose,
  tiers
}) => {
  const { showToast } = useToast();

  const handleExportCsv = () => {
    try {
      const csv = MembershipTierService.generateTierMasterCsv(tiers);
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

  const handlePrintMatrix = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Health Card Tiers & Benefit Policy Comparison Matrix" maxWidth="6xl">
      <div className="space-y-6">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-brand-blue flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Centralized Source of Truth
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              Comprehensive Health Card Pricing, Discounts &amp; Clinical Inclusions
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExportCsv}
            >
              Export CSV Master
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileText className="w-4 h-4" />}
              onClick={handlePrintMatrix}
            >
              Print Policy Sheet
            </Button>
          </div>
        </div>

        {/* Full Comparison Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5 font-black uppercase text-slate-500 tracking-wider sticky left-0 bg-slate-100 dark:bg-slate-900 z-10 w-48 min-w-[190px]">
                  Feature / Policy Matrix
                </th>
                {tiers.map(t => (
                  <th key={t.id} className="p-3.5 min-w-[160px] text-center border-l border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                      <strong className="font-black text-slate-900 dark:text-white text-xs">{t.name}</strong>
                    </div>
                    <Badge variant={t.status === 'active' ? 'success' : 'neutral'} size="sm">
                      {t.status.toUpperCase()}
                    </Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
              {/* Category: Pricing */}
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 font-bold text-slate-800 dark:text-slate-200">
                <td colSpan={tiers.length + 1} className="p-2.5 px-3.5 text-[11px] uppercase tracking-wider text-brand-blue">
                  💳 Pricing &amp; Validity Matrix
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-950">
                  Initial Sign-up Fee (₹)
                </td>
                {tiers.map(t => (
                  <td key={t.id} className="p-3.5 text-center font-black text-slate-900 dark:text-white border-l border-slate-100 dark:border-slate-800">
                    {formatCurrency(t.registrationFee)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-950">
                  Annual Renewal Fee (₹)
                </td>
                {tiers.map(t => (
                  <td key={t.id} className="p-3.5 text-center font-bold text-slate-600 dark:text-slate-400 border-l border-slate-100 dark:border-slate-800">
                    {formatCurrency(t.annualRenewalFee)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-950">
                  Card Validity Period
                </td>
                {tiers.map(t => (
                  <td key={t.id} className="p-3.5 text-center font-bold text-slate-800 dark:text-slate-200 border-l border-slate-100 dark:border-slate-800">
                    {t.validityMonths} Months
                  </td>
                ))}
              </tr>

              {/* Category: Family Plan Policy */}
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 font-bold text-slate-800 dark:text-slate-200">
                <td colSpan={tiers.length + 1} className="p-2.5 px-3.5 text-[11px] uppercase tracking-wider text-indigo-600">
                  👨‍👩‍👧‍👦 Family Plan Policies &amp; Coverage
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-950">
                  Plan Scope Classification
                </td>
                {tiers.map(t => (
                  <td key={t.id} className="p-3.5 text-center border-l border-slate-100 dark:border-slate-800">
                    <span className={`inline-flex items-center gap-1 font-bold ${t.isFamilyPlan ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                      {t.isFamilyPlan ? <Users2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      {t.isFamilyPlan ? 'Family Plan' : 'Individual'}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-950">
                  Max Family Members Covered
                </td>
                {tiers.map(t => (
                  <td key={t.id} className="p-3.5 text-center font-bold text-slate-800 dark:text-slate-200 border-l border-slate-100 dark:border-slate-800">
                    {t.isFamilyPlan ? `${t.maxFamilyMembers || 4} Members` : '1 (Self only)'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-950">
                  Shared Family Wallet Sync
                </td>
                {tiers.map(t => (
                  <td key={t.id} className="p-3.5 text-center border-l border-slate-100 dark:border-slate-800">
                    {t.isFamilyPlan ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-400 mx-auto" />}
                  </td>
                ))}
              </tr>

              {/* Category: Dynamic Discounts */}
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 font-bold text-slate-800 dark:text-slate-200">
                <td colSpan={tiers.length + 1} className="p-2.5 px-3.5 text-[11px] uppercase tracking-wider text-emerald-600">
                  ⚡ Dynamic Multi-Department Discounts
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-950">
                  OPD Doctor Consultation Discount
                </td>
                {tiers.map(t => (
                  <td key={t.id} className="p-3.5 text-center font-black text-blue-600 dark:text-blue-400 border-l border-slate-100 dark:border-slate-800">
                    {t.opdDiscount}% OFF
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-950">
                  Lab Tests &amp; Diagnostics Discount
                </td>
                {tiers.map(t => (
                  <td key={t.id} className="p-3.5 text-center font-black text-emerald-600 dark:text-emerald-400 border-l border-slate-100 dark:border-slate-800">
                    {t.labDiscount}% OFF
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-950">
                  Pharmacy Prescription Discount
                </td>
                {tiers.map(t => (
                  <td key={t.id} className="p-3.5 text-center font-black text-amber-600 dark:text-amber-400 border-l border-slate-100 dark:border-slate-800">
                    {t.pharmacyDiscount}% OFF
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-950">
                  Home Blood Sample Draw Charge
                </td>
                {tiers.map(t => (
                  <td key={t.id} className="p-3.5 text-center font-black text-purple-600 dark:text-purple-400 border-l border-slate-100 dark:border-slate-800">
                    {t.homeCollectionDiscount === 100 ? '100% FREE' : `${t.homeCollectionDiscount}% OFF`}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-950">
                  Health Wallet Cashback Rate
                </td>
                {tiers.map(t => (
                  <td key={t.id} className="p-3.5 text-center font-black text-slate-700 dark:text-slate-300 border-l border-slate-100 dark:border-slate-800">
                    {t.cashbackPercentage || 0}%
                  </td>
                ))}
              </tr>

              {/* Category: Benefit Packages */}
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 font-bold text-slate-800 dark:text-slate-200">
                <td colSpan={tiers.length + 1} className="p-2.5 px-3.5 text-[11px] uppercase tracking-wider text-purple-600">
                  🎁 Clinical Benefit Bundles &amp; Vouchers
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-950">
                  Total Benefit Inclusions Count
                </td>
                {tiers.map(t => (
                  <td key={t.id} className="p-3.5 text-center font-bold text-slate-800 dark:text-slate-200 border-l border-slate-100 dark:border-slate-800">
                    {(t.specialBenefits || []).length} Inclusions
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-950">
                  Estimated Benefit Value (INR)
                </td>
                {tiers.map(t => (
                  <td key={t.id} className="p-3.5 text-center font-black text-emerald-600 dark:text-emerald-400 border-l border-slate-100 dark:border-slate-800">
                    ~{formatCurrency(MembershipTierService.calculateTotalBenefitPackageValue(t))}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="primary" onClick={onClose}>
            Close Matrix
          </Button>
        </div>
      </div>
    </Modal>
  );
};
