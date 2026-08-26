import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CardApplicationRequest, HealthCard, Patient, CashDeskVoucher } from '../../types';
import { PortalService } from '../../services/portalService';
import { StorageService } from '../../services/storage';
import { CashDeskVoucherService } from '../../services/cashDeskVoucherService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import {
  CheckCircle2,
  XCircle,
  CreditCard,
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  ShieldCheck,
  Zap,
  MessageSquare,
  QrCode,
  Check,
  Send,
  Calendar,
  AlertTriangle,
  Copy,
  Ticket,
  Lock,
  Building2,
  FileCheck2,
  ShieldAlert
} from 'lucide-react';

export interface CardApplicationReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: CardApplicationRequest | null;
  onApproved: (card?: HealthCard, patient?: Patient) => void;
  onRejected: () => void;
}

export const CardApplicationReviewModal: React.FC<CardApplicationReviewModalProps> = ({
  isOpen,
  onClose,
  application,
  onApproved,
  onRejected
}) => {
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [isBankReconciled, setIsBankReconciled] = useState(false);
  const company = StorageService.getCompanyProfile();
  const currentUser = StorageService.getCurrentUser();

  // Find linked Cash Desk Voucher if paid by voucher
  const linkedVoucher = useMemo<CashDeskVoucher | null>(() => {
    if (!application || !application.paymentReference) return null;
    const ref = application.paymentReference.toUpperCase();
    const allVouchers = CashDeskVoucherService.getPublicVouchers();
    return allVouchers.find(v => ref.includes(v.voucherCode.toUpperCase()) || v.voucherCode.toUpperCase() === ref) || null;
  }, [application]);

  if (!application) return null;

  const isUtrPayment = application.paymentMethod?.toLowerCase().includes('utr') ||
                       application.paymentReference?.toUpperCase().startsWith('UTR:') ||
                       application.paymentMethod?.toLowerCase().includes('upi');

  const isVoucherPayment = application.paymentMethod?.toLowerCase().includes('voucher') ||
                           application.paymentReference?.toUpperCase().startsWith('VCH:') ||
                           !!linkedVoucher;

  const cleanUtrNumber = isUtrPayment
    ? application.paymentReference.replace(/^UTR:\s*/i, '').trim()
    : null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(true);
    showToast('info', 'Copied to Clipboard', text);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleApprove = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const res = PortalService.approveCardApplication(
        application.id,
        currentUser?.fullName || 'Super Administrator'
      );
      setIsProcessing(false);

      if (res.success && res.patient && res.card) {
        triggerCelebrationFireworks();
        showToast(
          'success',
          'Official Health Card Minted & Issued! 🚀',
          `Patient ${res.patient.fullName} (${res.patient.id}) registered. Health Card ${res.card.cardNumber} active! Moving to Issued Cards Deck...`
        );
        onApproved(res.card, res.patient);
        onClose();
      } else {
        showToast('error', 'Approval Error', res.error || 'Failed to approve application.');
      }
    }, 800);
  };

  const handleReject = () => {
    const reason = prompt('Please enter rejection reason / remarks:', 'Verification documents incomplete or invalid payment reference.');
    if (!reason) return;

    setIsProcessing(true);
    setTimeout(() => {
      const res = PortalService.rejectCardApplication(
        application.id,
        reason,
        currentUser?.fullName || 'Super Administrator'
      );
      setIsProcessing(false);

      if (res.success) {
        showToast('info', 'Application Rejected', `Application ${application.applicationNo} marked as rejected.`);
        onRejected();
        onClose();
      } else {
        showToast('error', 'Error', res.error || 'Failed to reject application.');
      }
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review Online Health Card Application: ${application.applicationNo}`}
      maxWidth="4xl"
    >
      <div className="space-y-6 text-xs">
        {/* Status Header Banner */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          application.status === 'approved'
            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
            : application.status === 'pending_approval'
            ? 'bg-amber-950/80 border-amber-500 text-amber-200'
            : 'bg-rose-950/80 border-rose-500 text-rose-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/20">
              {application.status === 'approved' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : application.status === 'pending_approval' ? (
                <Zap className="w-6 h-6 text-amber-400 animate-pulse" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block">APPLICATION STATUS</span>
              <strong className="text-sm font-black uppercase">
                {application.status === 'approved'
                  ? 'OFFICIAL HEALTH CARD ISSUED & ACTIVE'
                  : application.status === 'pending_approval'
                  ? 'PENDING SUPER ADMIN APPROVAL & MINTING'
                  : 'APPLICATION REJECTED'}
              </strong>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block font-sans">Payment Verified:</span>
            <strong className="text-emerald-400 text-sm font-black">{formatCurrency(application.totalPaidAmount)}</strong>
          </div>
        </div>

        {/* Applicant Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left: Photo & Identification */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-center">
            <img
              src={application.photoUrl || '/logo.jpg'}
              alt={application.fullName}
              className="w-24 h-24 rounded-2xl object-cover mx-auto ring-2 ring-teal-500/50 shadow-md"
            />
            <div>
              <strong className="text-sm font-black text-white block">{application.fullName}</strong>
              <span className="text-[11px] text-teal-400 font-mono block">
                {application.gender.toUpperCase()} • {application.age} Y • Blood: {application.bloodGroup}
              </span>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase font-mono bg-amber-950 text-amber-300 border border-amber-500/40">
                {application.membershipName}
              </span>
            </div>
          </div>

          {/* Center & Right: Contact, Postal, Medical */}
          <div className="md:col-span-2 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Applicant Profile & Contact Details:
            </span>

            <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
              <div>
                <span className="text-[9.5px] text-slate-500 uppercase block font-sans">Phone / Mobile:</span>
                <strong className="text-white font-bold">{application.mobile}</strong>
              </div>
              <div>
                <span className="text-[9.5px] text-slate-500 uppercase block font-sans">Email Address:</span>
                <strong className="text-white truncate block">{application.email || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-[9.5px] text-slate-500 uppercase block font-sans">Emergency Contact:</span>
                <span>{application.emergencyContact.name} ({application.emergencyContact.relationship} - {application.emergencyContact.mobile})</span>
              </div>
              <div>
                <span className="text-[9.5px] text-slate-500 uppercase block font-sans">Allergies / Chronic:</span>
                <span className="text-amber-300">{application.medicalInfo.allergies || 'None'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[9.5px] text-slate-500 uppercase block font-sans">Full Residential Address:</span>
                <span className="text-slate-200 font-sans">{application.address.fullAddress}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Transaction & Super Admin Reconciliation Proof Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Super Admin Payment & Checkout Reconciliation:
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
              application.paymentStatus === 'paid'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                : 'bg-amber-950 text-amber-300 border-amber-500'
            }`}>
              {application.paymentStatus === 'paid' ? 'PAYMENT VERIFIED & REDEEMED' : 'PENDING BANK UTR RECONCILIATION'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase block font-sans">Plan Fee:</span>
              <strong className="text-white">{formatCurrency(application.membershipPrice)}</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase block font-sans">Initial Float Deposit:</span>
              <strong className="text-teal-400">{formatCurrency(application.initialDeposit || 0)}</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase block font-sans">Payment Channel:</span>
              <span className="text-slate-200 font-sans truncate block">{application.paymentMethod}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase block font-sans">Total Collected:</span>
              <strong className="text-emerald-400 truncate block">{formatCurrency(application.totalPaidAmount)}</strong>
            </div>
          </div>

          {/* Option 1: Super Admin 12-Digit UTR Bank Settlement Verification */}
          {isUtrPayment && (
            <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/50 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-mono font-bold text-teal-400 uppercase block">
                      Submitted Bank UTR / UPI Ref:
                    </span>
                    <strong className="text-sm font-mono font-black text-white tracking-wider">
                      {cleanUtrNumber || application.paymentReference}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(cleanUtrNumber || application.paymentReference)}
                    className="border-teal-500/50 text-teal-300 hover:bg-teal-900 text-xs py-1"
                    leftIcon={copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  >
                    {copiedRef ? 'Copied UTR' : 'Copy UTR Number'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setIsBankReconciled(!isBankReconciled)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border transition-all flex items-center gap-1.5 ${
                      isBankReconciled
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-teal-400'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isBankReconciled ? 'text-white' : 'text-slate-500'}`} />
                    {isBankReconciled ? 'Bank Verified ✓' : 'Mark Bank Reconciled'}
                  </button>
                </div>
              </div>

              <div className="text-[10.5px] text-slate-300 flex items-center gap-2 pt-1 border-t border-teal-900/60">
                <Building2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                <span>Reconcile this 12-digit UTR in Hospital Bank Ledger (VPA: 7047108226@okbizaxis) before issuing card.</span>
              </div>
            </div>
          )}

          {/* Option 2: Super Admin Cash Desk Voucher Ledger Verification & Single-Use Lock */}
          {isVoucherPayment && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/50 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">
                      Hospital Cash Desk Voucher Redeemed:
                    </span>
                    <strong className="text-sm font-mono font-black text-amber-200 tracking-wider">
                      {linkedVoucher ? linkedVoucher.voucherCode : application.paymentReference}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-500 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    SINGLE-USE REDEEMED
                  </span>
                  {linkedVoucher && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(linkedVoucher.voucherCode)}
                      className="border-amber-500/50 text-amber-300 hover:bg-amber-900 text-xs py-1"
                      leftIcon={copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    >
                      {copiedRef ? 'Copied' : 'Copy Code'}
                    </Button>
                  )}
                </div>
              </div>

              {linkedVoucher && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10.5px] font-mono pt-1 text-slate-300">
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                    <span className="text-[9px] text-slate-400 block font-sans">Face Value:</span>
                    <strong className="text-emerald-400">{formatCurrency(linkedVoucher.amount)}</strong>
                  </div>
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                    <span className="text-[9px] text-slate-400 block font-sans">Auth Seal:</span>
                    <strong className="text-amber-300">{linkedVoucher.authSealCode}</strong>
                  </div>
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                    <span className="text-[9px] text-slate-400 block font-sans">Category:</span>
                    <strong className="text-white truncate block">{linkedVoucher.categoryName}</strong>
                  </div>
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                    <span className="text-[9px] text-slate-400 block font-sans">Redeemed At:</span>
                    <strong className="text-slate-300 truncate block">{formatDate(linkedVoucher.redeemedAt || linkedVoucher.updatedAt)}</strong>
                  </div>
                </div>
              )}

              <div className="text-[10.5px] text-emerald-300 flex items-center gap-2 pt-1 border-t border-amber-900/60 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Anti-Duplicate Certified: This voucher is debited from hospital cash ledger and locked permanently from reuse.</span>
              </div>
            </div>
          )}
        </div>

        {/* Family Shield Dependents List (if any) */}
        {application.familyMembers && application.familyMembers.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 font-mono">
                👨‍👩‍👧‍👦 1-Card Family Shield Dependents ({application.familyMembers.length} Members Linked):
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500">
                100% SHARED BENEFITS & FLOAT
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {application.familyMembers.map((fm, idx) => (
                <div key={fm.id || idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-white font-bold block">{fm.fullName}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {fm.relationship} • {fm.age} yrs • Blood: {fm.bloodGroup}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-teal-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {fm.mobile || application.mobile}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Dispatched SMS & Email Credentials Template Preview */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
              Automated Dispatched Patient Credentials (SMS & Email Preview):
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              Dispatched Instantly Upon Approval
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            {/* SMS Preview */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[9.5px] font-bold text-teal-400 uppercase block font-sans">
                📱 High-Priority Transactional SMS:
              </span>
              <p className="text-[10.5px] text-slate-300 leading-relaxed font-mono">
                Dear {application.fullName}, Welcome to {company.name}! Your Health Card (Tier: {application.membershipName}) is APPROVED & ACTIVE. Your Patient ID is [AUTO-MINTED]. Access your portal at https://labmedix.health/portal. Helpline: {company.helpline || '1800-889-9911'}
              </p>
            </div>

            {/* Email Preview */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[9.5px] font-bold text-purple-400 uppercase block font-sans">
                📧 Branded Welcome Email Notification:
              </span>
              <p className="text-[10.5px] text-slate-300 leading-relaxed font-mono">
                Subject: Official Welcome to {company.name} - Health Card & Patient ID Activated. Details: Plan: {application.membershipName}, Float: ₹{application.initialDeposit || 0}. Ready for cashless OPD & Labs.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls for Super Admin */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Close Window
          </Button>

          {application.status === 'pending_approval' && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-rose-500/50 text-rose-400 hover:bg-rose-950"
                onClick={handleReject}
                isLoading={isProcessing}
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Reject Request
              </Button>
              <Button
                type="button"
                variant="primary"
                className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white font-black shadow-xl"
                onClick={handleApprove}
                isLoading={isProcessing}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Approve & Issue Official Health Card
              </Button>
            </div>
          )}

          {application.status === 'approved' && (
            <span className="text-emerald-400 font-mono font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Card Issued: {application.approvedCardNumber} [Patient ID: {application.approvedPatientId}]
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
};
