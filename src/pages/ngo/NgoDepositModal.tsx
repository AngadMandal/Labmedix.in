import React, { useState } from 'react';
import { NgoPartner, NgoFundTransaction } from '../../types';
import { IndianRupee, X, Check, Receipt, ShieldCheck, AlertCircle } from 'lucide-react';

interface NgoDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: NgoPartner | null;
  onSuccess: (txn: NgoFundTransaction) => void;
  currentUserFullName: string;
}

export const NgoDepositModal: React.FC<NgoDepositModalProps> = ({
  isOpen,
  onClose,
  partner,
  onSuccess,
  currentUserFullName
}) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<
    'bank_transfer' | 'cheque' | 'neft_rtgs' | 'upi_csr' | 'grant_allocation'
  >('neft_rtgs');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [purpose, setPurpose] = useState(
    'CSR Health Grant Pool & BPL Patient Diagnostic Subsidy Allocation'
  );
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [issue80GReceipt, setIssue80GReceipt] = useState(true);
  const [error, setError] = useState('');

  if (!isOpen || !partner) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid deposit amount');
      return;
    }
    if (!referenceNumber.trim()) {
      setError('Bank/Transaction reference number or cheque number is required');
      return;
    }

    const numAmount = Number(amount);
    const newBalance = (partner.activeBalance || 0) + numAmount;

    const newTxn: NgoFundTransaction = {
      id: `ngotx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      receiptNumber: `80G-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      ngoPartnerId: partner.id,
      ngoPartnerName: partner.name,
      type: 'deposit',
      amount: numAmount,
      paymentMethod,
      referenceNumber: referenceNumber.trim(),
      date,
      purpose,
      taxExemption80GIssued: issue80GReceipt,
      balanceAfter: newBalance,
      recordedBy: currentUserFullName || 'System Admin',
      createdAt: new Date().toISOString()
    };

    onSuccess(newTxn);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <IndianRupee className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Deposit CSR / Donation Grant</h2>
              <p className="text-xs text-emerald-100">
                Credit funds to {partner.name.substring(0, 32)}...
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Card */}
        <div className="px-6 pt-5 pb-2">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-800 font-medium">Current Active Grant Balance</p>
              <p className="text-xl font-bold text-emerald-900 font-mono">
                ₹{(partner.activeBalance || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-700">80G Reg. No.</p>
              <p className="text-xs font-mono font-bold text-emerald-900">
                {partner.taxExemption80G || 'Registered'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Deposit Amount (INR ₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold">₹</span>
              <input
                type="number"
                min="100"
                step="1"
                required
                value={amount}
                onChange={e => {
                  setAmount(e.target.value ? Number(e.target.value) : '');
                  setError('');
                }}
                placeholder="50000"
                className="w-full pl-8 pr-4 py-2.5 text-base font-bold font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Payment Mode</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="neft_rtgs">NEFT / RTGS / IMPS</option>
                <option value="bank_transfer">Direct Bank Transfer</option>
                <option value="cheque">Bank Cheque / DD</option>
                <option value="upi_csr">UPI / Corporate QR</option>
                <option value="grant_allocation">Direct Trust Allocation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Deposit Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Transaction / UTR / Cheque Reference Number *
            </label>
            <input
              type="text"
              required
              value={referenceNumber}
              onChange={e => {
                setReferenceNumber(e.target.value);
                setError('');
              }}
              placeholder="e.g. UTR-HDFC-9918239012 or CHQ-00129"
              className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Grant Purpose / CSR Memo
            </label>
            <input
              type="text"
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              placeholder="e.g. Sonarpur Camp Corpus, Dialysis Subsidy"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-xs font-medium text-slate-800">Generate 80G Tax Exemption Receipt</p>
                <p className="text-[11px] text-slate-500">
                  Ready to print receipt under Section 80G Income Tax Act
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={issue80GReceipt}
              onChange={e => setIssue80GReceipt(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Confirm & Credit Fund Pool
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
