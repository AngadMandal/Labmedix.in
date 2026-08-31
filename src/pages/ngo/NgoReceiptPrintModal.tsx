import React, { useRef } from 'react';
import { NgoFundTransaction, NgoPartner, CharityGrant } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { Printer, X, ShieldCheck, HeartHandshake, Download } from 'lucide-react';

interface NgoReceiptPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: NgoFundTransaction | null;
  grant?: CharityGrant | null;
  partner?: NgoPartner | null;
}

export const NgoReceiptPrintModal: React.FC<NgoReceiptPrintModalProps> = ({
  isOpen,
  onClose,
  transaction,
  grant,
  partner
}) => {
  const { companyProfile } = useSettings();
  const profile = companyProfile;
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {transaction ? 'Section 80G Tax Exemption Receipt' : 'Patient Charity Grant Certificate'}
              </h2>
              <p className="text-xs text-slate-400">
                Official Institutional Welfare Voucher & Tax Audit Certificate
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Print Certificate
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-8 overflow-y-auto bg-slate-50 flex-1 flex justify-center print:p-0 print:bg-white">
          <div
            ref={printRef}
            className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-xs border border-slate-200 text-slate-800 font-sans print:shadow-none print:border-none print:p-6"
          >
            {/* Header / Letterhead */}
            <div className="border-b-2 border-slate-800 pb-4 mb-6 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {profile.name || 'LABMEDIX DIAGNOSTIC & CLINICAL NETWORKS'}
                </h1>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  {profile.tagline || 'Institutional Healthcare & Community Welfare Foundation'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-md">
                  {profile.address || 'Registered Medical Institution & Central Laboratory'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Govt Reg No: <span className="font-mono font-semibold">{profile.registrationNo || 'MED-WB-2026-0812'}</span> | Helpline: {profile.phone || profile.helpline || '1800-000-0000'}
                </p>
              </div>
              <div className="text-right">
                <div className="inline-block px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-bold font-mono">
                  {transaction ? '80G DONATION RECEIPT' : 'CHARITY GRANT VOUCHER'}
                </div>
                <p className="text-xs font-mono font-bold text-slate-700 mt-2">
                  {transaction?.receiptNumber || grant?.grantNumber || 'DOC-2026-001'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Date: {transaction?.date || grant?.approvalDate || new Date().toISOString().split('T')[0]}
                </p>
              </div>
            </div>

            {/* Content for 80G Donation Receipt */}
            {transaction && (
              <div className="space-y-4">
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
                  <p className="text-xs text-emerald-800 uppercase tracking-wider font-semibold">
                    Donor / Sponsoring Trust Information
                  </p>
                  <p className="text-base font-bold text-emerald-950 mt-1">
                    {partner?.name || transaction.ngoPartnerName}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-slate-700">
                    <div>
                      <span className="text-slate-500">80G Reg No:</span>{' '}
                      <span className="font-mono font-bold">{partner?.taxExemption80G || 'AAATR8812E20211'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">12A Reg No:</span>{' '}
                      <span className="font-mono font-bold">{partner?.taxExemption12A || '12A-CIT-KOL-8812'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Trust Reg:</span>{' '}
                      <span className="font-mono">{partner?.registrationNumber || 'TR/WB/2012/88129'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Contact:</span>{' '}
                      <span>{partner?.phone || '+91 98310 99221'}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-xs text-slate-500">Donation / CSR Corpus Amount:</span>
                    <span className="text-xl font-bold font-mono text-slate-900">
                      ₹{transaction.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Payment Mode:</span>
                    <span className="font-medium uppercase">{transaction.paymentMethod.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Transaction / UTR Reference:</span>
                    <span className="font-mono font-semibold">{transaction.referenceNumber}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Grant Purpose:</span>
                    <span className="font-medium text-right max-w-xs">{transaction.purpose}</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-[11px] text-amber-900">
                  <p className="font-bold">Statutory Tax Exemption Clause:</p>
                  <p className="mt-0.5">
                    Donations made to this foundation are eligible for deduction under Section 80G(5)(vi) of the Income Tax Act, 1961. This receipt is digitally verified and valid for CSR compliance filings.
                  </p>
                </div>
              </div>
            )}

            {/* Content for Patient Charity Grant Voucher */}
            {grant && (
              <div className="space-y-4">
                <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-4">
                  <p className="text-xs text-teal-800 uppercase tracking-wider font-semibold">
                    Beneficiary Patient & Grant Allocation
                  </p>
                  <p className="text-lg font-bold text-teal-950 mt-1">
                    {grant.patientName}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-slate-700">
                    <div>
                      <span className="text-slate-500">BPL / Aadhaar No:</span>{' '}
                      <span className="font-mono font-bold">{grant.bplOrAadhaar || 'Verified BPL'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Mobile Phone:</span>{' '}
                      <span>{grant.patientPhone || 'N/A'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500">Sponsoring NGO:</span>{' '}
                      <span className="font-semibold text-teal-900">{grant.ngoPartnerName}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Medical Case / Procedure:</span>
                    <span className="font-bold text-slate-800">{grant.medicalCaseTitle}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Estimated Total Bill:</span>
                    <span className="font-mono">₹{grant.estimatedTotalBill.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Approved Subsidy:</span>
                    <span className="font-bold text-emerald-700">{grant.subsidyPercent}% Full Aid</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200 pt-2 text-sm">
                    <span className="font-bold text-slate-900">Total Net Disbursed Grant:</span>
                    <span className="text-xl font-bold font-mono text-emerald-700">
                      ₹{grant.approvedGrantAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700">
                  <p className="font-semibold text-slate-800">Officer Verification Notes:</p>
                  <p className="mt-0.5 italic">{grant.justification}</p>
                </div>
              </div>
            )}

            {/* Signature & Seal Footer */}
            <div className="border-t border-slate-300 mt-8 pt-6 flex justify-between items-end">
              <div className="text-center">
                <div className="h-10 flex items-center justify-center">
                  <div className="w-20 h-10 border-b border-dashed border-slate-400 flex items-end justify-center">
                    <span className="text-[10px] text-slate-400">Verified</span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-800 mt-1">
                  {transaction?.recordedBy || grant?.approvedBy || 'Medical Superintendent'}
                </p>
                <p className="text-[10px] text-slate-500">Authorized Medical Officer</p>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 rounded-full border-2 border-emerald-600/30 flex items-center justify-center p-2 text-center">
                  <p className="text-[8px] uppercase tracking-wider font-bold text-emerald-800 leading-tight">
                    {profile.name || 'LABMEDIX'}<br />★ OFFICIAL SEAL ★<br />WELFARE DIVISION
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="h-10 flex items-center justify-center">
                  <div className="w-20 h-10 border-b border-dashed border-slate-400 flex items-end justify-center">
                    <span className="text-[10px] text-slate-400">Audited</span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-800 mt-1">Trustee / CSR Chair</p>
                <p className="text-[10px] text-slate-500">Sponsoring NGO Partner</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
