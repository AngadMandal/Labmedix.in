import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { PortalService } from '../../services/portalService';
import { CardApplicationRequest } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  User,
  Phone,
  Mail,
  ShieldCheck,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

export interface ApplicationStatusTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginWithApprovedCard?: (patientId: string) => void;
}

export const ApplicationStatusTrackModal: React.FC<ApplicationStatusTrackModalProps> = ({
  isOpen,
  onClose,
  onLoginWithApprovedCard
}) => {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<CardApplicationRequest | null>(null);
  const [error, setError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSearched(true);

    const term = query.trim().toLowerCase();
    if (!term) {
      setError('Please enter your Application Reference No or Mobile Number.');
      return;
    }

    const applications = PortalService.getCardApplications();
    const found = applications.find(
      a =>
        a.applicationNo.toLowerCase() === term ||
        a.mobile.includes(term) ||
        (a.email && a.email.toLowerCase().includes(term))
    );

    if (found) {
      setResult(found);
      setError('');
    } else {
      setResult(null);
      setError('No card application found with this Reference ID or Mobile Number. Please check your tracking slip.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Track Health Card Application Status"
      maxWidth="lg"
    >
      <div className="space-y-5 text-xs">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-3">
          <Input
            label="Application Reference No or Mobile Number"
            placeholder="e.g. APP-2026-00412 or 9830112233"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            required
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-gradient-to-r from-teal-600 to-emerald-600 font-bold shadow-md"
              leftIcon={<Search className="w-4 h-4" />}
            >
              Track Status
            </Button>
          </div>
        </form>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-300 flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Search Result Box */}
        {searched && result && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            {/* Status Banner */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              result.status === 'approved'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                : result.status === 'pending_approval'
                ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                : 'bg-rose-950/80 border-rose-500 text-rose-200'
            }`}>
              <div className="flex items-center gap-2.5">
                {result.status === 'approved' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : result.status === 'pending_approval' ? (
                  <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider block">APPLICATION STATUS</span>
                  <strong className="text-sm font-black uppercase">
                    {result.status === 'approved'
                      ? 'CARD ISSUED & ACTIVE ✅'
                      : result.status === 'pending_approval'
                      ? 'PENDING SUPER ADMIN REVIEW ⏳'
                      : 'APPLICATION REJECTED ❌'}
                  </strong>
                </div>
              </div>

              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-black/40 border border-white/20">
                {result.applicationNo}
              </span>
            </div>

            {/* Application Summary Grid */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block font-sans">Applicant Name</span>
                <strong className="text-white font-sans">{result.fullName}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block font-sans">Selected Card Tier</span>
                <strong className="text-amber-400 font-sans">{result.membershipName}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block font-sans">Registration Fee</span>
                <strong className="text-emerald-400">{formatCurrency(result.totalPaidAmount)}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block font-sans">Applied Date</span>
                <span className="text-slate-300">{formatDate(result.createdAt)}</span>
              </div>
            </div>

            {/* If Approved, show Patient ID & Direct Login Link */}
            {result.status === 'approved' && result.approvedPatientId && (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400">ASSIGNED PATIENT ID</span>
                    <strong className="text-base font-black text-white font-mono block">
                      {result.approvedPatientId}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400">HEALTH CARD NUMBER</span>
                    <strong className="text-base font-black text-amber-300 font-mono block">
                      {result.approvedCardNumber || 'LHC-2026-ACTIVE'}
                    </strong>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-sans space-y-1">
                  <div className="flex items-center gap-1.5 text-teal-300 font-bold">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Dispatched Credentials SMS & Email:</span>
                  </div>
                  <p className="text-[10.5px] font-mono text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800">
                    {result.smsContent || 'SMS credentials dispatched.'}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 font-black shadow-lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => {
                    if (onLoginWithApprovedCard && result.approvedPatientId) {
                      onLoginWithApprovedCard(result.approvedPatientId);
                    }
                  }}
                >
                  Log In to CARD LOGIN / SIGN UP with ID ({result.approvedPatientId})
                </Button>
              </div>
            )}

            {/* If Pending */}
            {result.status === 'pending_approval' && (
              <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/30 text-[11.5px] text-slate-300 space-y-1">
                <span className="font-bold text-amber-300 block">⏳ Under Super Admin Review</span>
                <p>Your application and payment (Ref: <span className="font-mono text-amber-300">{result.paymentReference}</span>) are currently queued for Super Admin approval. Once verified, you will receive an instant SMS and Email with your Patient ID.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
