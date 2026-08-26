import React, { useState } from 'react';
import { DoctorMasterItem, DoctorMasterService, DoctorCommissionPayoutRecord } from '../../services/doctorMasterService';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useToast } from '../../context/ToastContext';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import { formatCurrency, formatDateTime, formatDate } from '../../utils/formatters';
import {
  Crown,
  DollarSign,
  TestTube,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Receipt,
  ArrowRight,
  Sparkles,
  Building,
  CreditCard
} from 'lucide-react';

interface DoctorCommissionPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: DoctorMasterItem | null;
  onPayoutCompleted: () => void;
  isSuperAdmin: boolean;
}

export const DoctorCommissionPayoutModal: React.FC<DoctorCommissionPayoutModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onPayoutCompleted,
  isSuperAdmin
}) => {
  const { showToast } = useToast();
  const company = StorageService.getCompanyProfile();

  const [payoutAmount, setPayoutAmount] = useState<number>(doctor?.payableCommissionBalance || 0);
  const [paymentMode, setPaymentMode] = useState<'Bank Transfer' | 'Cash' | 'Cheque' | 'Health Wallet UPI'>('Bank Transfer');
  const [referenceNo, setReferenceNo] = useState<string>(`NEFT-${Math.floor(100000 + Math.random() * 900000)}`);
  const [notes, setNotes] = useState<string>('Bi-weekly pathology & diagnostic referral commission settlement.');
  const [disbursedPayout, setDisbursedPayout] = useState<DoctorCommissionPayoutRecord | null>(null);

  React.useEffect(() => {
    if (doctor) {
      setPayoutAmount(doctor.payableCommissionBalance);
      setReferenceNo(`NEFT-${Math.floor(100000 + Math.random() * 900000)}`);
      setDisbursedPayout(null);
    }
  }, [doctor, isOpen]);

  const handleDisburse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      showToast('error', 'Super Admin Required', 'Only Super Administrator has authority to disburse commission payouts.');
      return;
    }

    if (!doctor) return;

    if (payoutAmount <= 0 || payoutAmount > doctor.payableCommissionBalance) {
      showToast('error', 'Invalid Amount', `Payout amount must be between ₹1 and ₹${doctor.payableCommissionBalance}.`);
      return;
    }

    const res = DoctorMasterService.disburseCommissionPayout(
      doctor.id,
      payoutAmount,
      paymentMode,
      referenceNo,
      notes,
      'super_admin'
    );

    if (res.success && res.payout) {
      triggerCelebrationFireworks();
      setDisbursedPayout(res.payout);
      showToast('success', 'Commission Disbursed', `Settled ₹${payoutAmount} to ${doctor.name} (${res.payout.payoutNo}).`);
      onPayoutCompleted();
    } else {
      showToast('error', 'Payout Failed', res.error);
    }
  };

  const handlePrintVoucher = () => {
    window.print();
  };

  if (!doctor) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`👑 Super Admin: Doctor Commission Settlement - ${doctor.name}`}
      maxWidth="md"
    >
      <div className="space-y-4 text-xs font-sans">
        {/* Top Summary Banner */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <strong className="text-sm font-black text-white block">{doctor.name}</strong>
              <span className="text-[11px] text-teal-400 font-mono">{doctor.doctorCode} • {doctor.speciality}</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold border border-purple-500/30">
              🩸 {doctor.bloodCommissionPercent}% Referral Rate
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Total Tests Referred:</span>
              <strong className="text-white text-xs">{doctor.totalTestsReferredCount} Tests ({formatCurrency(doctor.totalReferredLabRevenue)})</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Total Commission Earned:</span>
              <strong className="text-emerald-400 text-xs">{formatCurrency(doctor.totalCommissionEarned)}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Already Paid Out:</span>
              <strong className="text-blue-400 text-xs">{formatCurrency(doctor.totalCommissionPaid)}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
              <span className="text-emerald-300 block text-[10px] font-bold">Payable Balance:</span>
              <strong className="text-emerald-400 text-sm font-black">{formatCurrency(doctor.payableCommissionBalance)}</strong>
            </div>
          </div>
        </div>

        {/* Payout Form or Success Receipt */}
        {!disbursedPayout ? (
          <form onSubmit={handleDisburse} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                Disbursement Amount (₹ INR):
              </label>
              <Input
                type="number"
                max={doctor.payableCommissionBalance}
                min={1}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Payment Mode:
                </label>
                <Select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  options={[
                    { value: 'Bank Transfer', label: '🏦 Bank Transfer (NEFT/RTGS)' },
                    { value: 'Health Wallet UPI', label: '📱 Health Wallet UPI / Instant' },
                    { value: 'Cash', label: '💵 Cash Payout' },
                    { value: 'Cheque', label: '📄 Bank Cheque' }
                  ]}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Transaction Ref No / UTR:
                </label>
                <Input
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                Settlement Notes / Remarks:
              </label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-950 font-black shadow-lg"
                disabled={doctor.payableCommissionBalance <= 0 || !isSuperAdmin}
              >
                Disburse {formatCurrency(payoutAmount)} Commission
              </Button>
            </div>
          </form>
        ) : (
          /* OFFICIAL PRINTABLE COMMISSION VOUCHER */
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 rounded-3xl bg-slate-950 border border-emerald-500/50 text-slate-200 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <strong className="text-white text-sm block">{company.name}</strong>
                  <span className="text-[10px] text-slate-400">Doctor Referral Commission Settlement Voucher</span>
                </div>
                <span className="text-emerald-400 font-bold">{disbursedPayout.payoutNo}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Beneficiary Doctor:</span>
                  <strong className="text-white">{disbursedPayout.doctorName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Disbursed Amount:</span>
                  <strong className="text-emerald-400 text-sm">{formatCurrency(disbursedPayout.amount)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Payment Mode:</span>
                  <span className="text-white">{disbursedPayout.paymentMode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Reference No:</span>
                  <span className="text-white">{disbursedPayout.referenceNo}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Disbursed By: {disbursedPayout.paidBy}</span>
                <span>Date: {formatDateTime(disbursedPayout.paidAt)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<Printer className="w-4 h-4 text-teal-400" />}
                onClick={handlePrintVoucher}
              >
                Print Voucher Slip
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onClose}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
