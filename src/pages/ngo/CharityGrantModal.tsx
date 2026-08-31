import React, { useState } from 'react';
import { CharityGrant, NgoPartner, Patient, CharityGrantCategory } from '../../types';
import { HeartHandshake, X, Check, FileCheck, IndianRupee, ShieldAlert } from 'lucide-react';

interface CharityGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (grant: CharityGrant) => void;
  ngoPartners: NgoPartner[];
  patients: Patient[];
  currentUserFullName: string;
}

export const CharityGrantModal: React.FC<CharityGrantModalProps> = ({
  isOpen,
  onClose,
  onSave,
  ngoPartners,
  patients,
  currentUserFullName
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [bplOrAadhaar, setBplOrAadhaar] = useState('');

  const [selectedNgoId, setSelectedNgoId] = useState(ngoPartners[0]?.id || '');
  const [medicalCaseTitle, setMedicalCaseTitle] = useState('');
  const [category, setCategory] = useState<CharityGrantCategory>('bpl_relief');

  const [estimatedTotalBill, setEstimatedTotalBill] = useState<number | ''>(15000);
  const [subsidyPercent, setSubsidyPercent] = useState<number>(100);
  const [justification, setJustification] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const selectedPartner = ngoPartners.find(p => p.id === selectedNgoId);

  const handlePatientSelect = (patId: string) => {
    setSelectedPatientId(patId);
    const pat = patients.find(p => p.id === patId);
    if (pat) {
      setPatientName(pat.fullName);
      setPatientPhone(pat.mobile);
    }
  };

  const calculatedGrantAmount = Math.round(
    ((Number(estimatedTotalBill) || 0) * (Number(subsidyPercent) || 0)) / 100
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setError('Patient name is required');
      return;
    }
    if (!medicalCaseTitle.trim()) {
      setError('Medical case title / condition description is required');
      return;
    }
    if (!selectedNgoId || !selectedPartner) {
      setError('Please select a sponsoring NGO grant partner');
      return;
    }
    if (!estimatedTotalBill || Number(estimatedTotalBill) <= 0) {
      setError('Please enter a valid estimated bill amount');
      return;
    }

    const grant: CharityGrant = {
      id: `grant_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      grantNumber: `GRANT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: selectedPatientId || `pat_direct_${Date.now()}`,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      bplOrAadhaar: bplOrAadhaar.trim(),
      ngoPartnerId: selectedPartner.id,
      ngoPartnerName: selectedPartner.name,
      medicalCaseTitle: medicalCaseTitle.trim(),
      category,
      estimatedTotalBill: Number(estimatedTotalBill),
      subsidyPercent: Number(subsidyPercent),
      approvedGrantAmount: calculatedGrantAmount,
      approvalStatus: 'approved',
      approvedBy: currentUserFullName || 'Chief Medical Administrator',
      approvalDate: new Date().toISOString().split('T')[0],
      disbursementDate: new Date().toISOString().split('T')[0],
      justification: justification.trim() || 'Verified low-income case recommended for welfare aid.',
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(grant);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <HeartHandshake className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Patient Charity Grant & Subsidy Request</h2>
              <p className="text-xs text-emerald-100">
                Direct relief subsidy approval funded by institutional NGO / CSR partners
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Sponsoring NGO Pool selection */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
            <label className="block text-xs font-semibold text-emerald-950 mb-1.5">
              Select Sponsoring NGO / CSR Grant Pool *
            </label>
            <select
              value={selectedNgoId}
              onChange={e => setSelectedNgoId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-emerald-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {ngoPartners.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — Available Grant: ₹{(p.activeBalance || 0).toLocaleString('en-IN')}
                </option>
              ))}
            </select>
            {selectedPartner && (
              <div className="mt-2 flex items-center justify-between text-xs text-emerald-800">
                <span>Registration No: {selectedPartner.registrationNumber}</span>
                <span className="font-bold">
                  Grant Pool: ₹{(selectedPartner.activeBalance || 0).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          {/* Patient Details */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" /> Beneficiary Patient Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Existing Registered Patient (Optional Autofill)
                </label>
                <select
                  value={selectedPatientId}
                  onChange={e => handlePatientSelect(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">-- Choose from Patient Master or enter below manually --</option>
                  {patients.slice(0, 50).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.mobile}) - Card: {p.healthCardId || 'None'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={e => {
                    setPatientName(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g. Ramesh Sardar"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Patient Mobile Phone
                </label>
                <input
                  type="tel"
                  value={patientPhone}
                  onChange={e => setPatientPhone(e.target.value)}
                  placeholder="+91 98300 12345"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  BPL Ration Card / Aadhaar / Disability Certificate No.
                </label>
                <input
                  type="text"
                  value={bplOrAadhaar}
                  onChange={e => setBplOrAadhaar(e.target.value)}
                  placeholder="e.g. BPL-WB-772190 or UIDAI-9912-4412-1102"
                  className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Medical Case & Diagnosis */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Medical Case & Financial Subsidy Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Medical Case Title & Diagnosis *
                </label>
                <input
                  type="text"
                  required
                  value={medicalCaseTitle}
                  onChange={e => {
                    setMedicalCaseTitle(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g. 100% Subsidized Renal Dialysis & Comprehensive Nephrology Lab Panel"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Grant Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="bpl_relief">Below Poverty Line (BPL) Relief</option>
                  <option value="cancer_care">Oncology / Cancer Diagnostic Aid</option>
                  <option value="dialysis_subsidy">Renal Dialysis & Nephrology Grant</option>
                  <option value="cardiac_surgery">Cardiac Echo / Angiography Aid</option>
                  <option value="pediatric_aid">Pediatric Malnutrition & Rare Disease</option>
                  <option value="general_welfare">General Indigent Patient Welfare</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Estimated Total Lab/Medical Bill (₹) *
                </label>
                <input
                  type="number"
                  min="100"
                  step="1"
                  required
                  value={estimatedTotalBill}
                  onChange={e => setEstimatedTotalBill(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3.5 py-2 text-sm font-bold font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Approved Subsidy Percentage
                </label>
                <select
                  value={subsidyPercent}
                  onChange={e => setSubsidyPercent(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value={100}>100% Full Free Aid (₹{Number(estimatedTotalBill || 0).toLocaleString('en-IN')})</option>
                  <option value={75}>75% Heavy Subsidy (₹{Math.round((Number(estimatedTotalBill || 0) * 0.75)).toLocaleString('en-IN')})</option>
                  <option value={50}>50% Co-Pay Subsidy (₹{Math.round((Number(estimatedTotalBill || 0) * 0.5)).toLocaleString('en-IN')})</option>
                  <option value={25}>25% Concession Aid (₹{Math.round((Number(estimatedTotalBill || 0) * 0.25)).toLocaleString('en-IN')})</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Net Disbursed Grant Amount
                </label>
                <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 font-mono font-bold text-base flex items-center justify-between">
                  <span>₹{calculatedGrantAmount.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-emerald-800 font-sans font-medium">Auto-Calculated</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Social Welfare Officer Justification & Verification Notes
                </label>
                <textarea
                  rows={2}
                  value={justification}
                  onChange={e => setJustification(e.target.value)}
                  placeholder="e.g. Patient verified daily wage earner with End-Stage Renal Disease. Approved under CSR Critical Dialysis Pool."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
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
              Approve & Disburse Grant Voucher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
