import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CardApplicationRequest } from '../../types';
import { StorageService } from '../../services/storage';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Printer, Shield, QrCode, CheckCircle2, AlertTriangle, FileText, Phone, Mail, MapPin } from 'lucide-react';

interface CardRequestSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: CardApplicationRequest | null;
}

export const CardRequestSlipModal: React.FC<CardRequestSlipModalProps> = ({
  isOpen,
  onClose,
  application
}) => {
  if (!application) return null;

  const company = StorageService.getCompanyProfile();
  const trackingNumber = application.trackingId || application.applicationNo;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Health Card Creation Request Slip"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Printable Card Request Slip Content */}
        <div id="printable-card-request-slip" className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 text-slate-800 dark:text-slate-100 shadow-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div className="flex items-center gap-3">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-teal-500/30" />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-black text-xl shadow-md">
                  LM
                </div>
              )}
              <div>
                <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{company.name}</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Digital Healthcare & Cashless Medical Card Services</p>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">OFFICIAL CARD REQUEST SLIP</span>
              <strong className="text-base font-black text-teal-700 dark:text-teal-400 block">{trackingNumber}</strong>
              <span className="text-[11px] text-slate-500 block">{formatDate(application.createdAt)}</span>
            </div>
          </div>

          {/* Tracking Barcode & Status Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                <QrCode className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">TRACKING ID / REF NO</span>
                <strong className="text-sm font-mono font-black text-slate-900 dark:text-white">{trackingNumber}</strong>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Use this ID to track approval status at portal or helpdesk</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border ${
                application.status === 'approved' || application.status === 'issued'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                  : application.status === 'rejected' || application.status === 'cancelled'
                  ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                STATUS: {application.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Applicant Details */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[11px] flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                <FileText className="w-3.5 h-3.5 text-teal-600" />
                Applicant Information
              </h3>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Full Name:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{application.fullName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gender & Age:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">{application.gender} • {application.age} Yrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Blood Group:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{application.bloodGroup}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mobile Number:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{application.mobile}</span>
                </div>
                {application.email && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email Address:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{application.email}</span>
                  </div>
                )}
                {application.address?.district && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">District / Address:</span>
                    <span className="text-slate-800 dark:text-slate-200">{application.address.district}, {application.address.state}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Membership Tier & Payment Details */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[11px] flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                Selected Membership & Payment Details
              </h3>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Membership Tier:</span>
                  <strong className="text-teal-700 dark:text-teal-400 font-black">{application.membershipName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tier Fee / Deposit:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(application.totalPaidAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 uppercase">{application.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Ref / UTR:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{application.paymentReference || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Verification:</span>
                  <span className="font-bold uppercase text-emerald-600 dark:text-emerald-400">{application.paymentStatus}</span>
                </div>
                {application.doctorRecommendation && (
                  <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Recommendation:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{application.doctorRecommendation}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Family Members Covered */}
          {application.familyMembers && application.familyMembers.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-2 text-xs">
              <h4 className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider text-[10.5px]">
                👨‍👩‍👧‍👦 Covered Family Dependents ({application.familyMembers.length} Members Linked)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {application.familyMembers.map((fm, i) => (
                  <div key={i} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-800/50 flex justify-between">
                    <div>
                      <strong className="text-slate-900 dark:text-white font-bold block">{fm.fullName}</strong>
                      <span className="text-[10px] text-slate-500">{fm.relationship} • {fm.age} Yrs • Blood: {fm.bloodGroup}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Office Verification Section */}
          <div className="pt-4 border-t border-dashed border-slate-300 dark:border-slate-700 grid grid-cols-2 gap-6 text-xs text-slate-500">
            <div className="space-y-2">
              <span className="font-bold uppercase tracking-wider text-[10px] block text-slate-400">Physical Verification Check</span>
              <div className="h-12 border border-slate-200 dark:border-slate-800 rounded-xl p-2 flex items-center justify-between text-[11px]">
                <span>Identity Verified: [  ]</span>
                <span>Payment Verified: [  ]</span>
              </div>
            </div>

            <div className="space-y-2 text-right">
              <span className="font-bold uppercase tracking-wider text-[10px] block text-slate-400">Super Admin Approval Stamp</span>
              <div className="h-12 border border-slate-200 dark:border-slate-800 rounded-xl p-2 flex items-end justify-end text-[10px] font-mono">
                <span>Authorized Signatory & Seal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-lg"
          >
            Print Request Slip
          </Button>
        </div>
      </div>
    </Modal>
  );
};
