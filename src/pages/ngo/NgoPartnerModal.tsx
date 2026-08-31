import React, { useState } from 'react';
import { NgoPartner } from '../../types';
import { Building2, X, Check, FileText, Percent, CreditCard, ShieldCheck } from 'lucide-react';

interface NgoPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (partner: NgoPartner) => void;
  partnerToEdit?: NgoPartner | null;
}

export const NgoPartnerModal: React.FC<NgoPartnerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  partnerToEdit
}) => {
  const [formData, setFormData] = useState<Partial<NgoPartner>>(() => {
    if (partnerToEdit) return { ...partnerToEdit };
    return {
      name: '',
      ngoCode: `NGO-${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'charity_trust',
      registrationNumber: '',
      taxExemption80G: '',
      taxExemption12A: '',
      contactPerson: '',
      designation: 'Welfare Coordinator',
      phone: '',
      email: '',
      address: '',
      district: '',
      state: 'West Bengal',
      mouSignedDate: new Date().toISOString().split('T')[0],
      mouValidTill: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mouScope: '100% Free Rural Diagnostic Camps & BPL Patient Subsidy Pool',
      totalGrantDeposited: 0,
      totalAidDisbursed: 0,
      activeBalance: 0,
      status: 'active',
      coBrandedCardEnabled: true,
      coBrandCardPrefix: 'SEVA',
      defaultDiscountPercent: 100,
      notes: ''
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name?.trim()) errs.name = 'Organization/NGO name is required';
    if (!formData.contactPerson?.trim()) errs.contactPerson = 'Contact person name is required';
    if (!formData.phone?.trim()) errs.phone = 'Contact phone number is required';
    if (!formData.registrationNumber?.trim()) errs.registrationNumber = 'Registration number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const partner: NgoPartner = {
      id: partnerToEdit?.id || `ngo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ngoCode: formData.ngoCode || `NGO-${Date.now().toString().slice(-4)}`,
      name: formData.name || '',
      category: formData.category || 'charity_trust',
      registrationNumber: formData.registrationNumber || '',
      taxExemption80G: formData.taxExemption80G || '',
      taxExemption12A: formData.taxExemption12A || '',
      contactPerson: formData.contactPerson || '',
      designation: formData.designation || 'Director',
      phone: formData.phone || '',
      email: formData.email || '',
      address: formData.address || '',
      district: formData.district || '',
      state: formData.state || 'West Bengal',
      logoUrl: formData.logoUrl || '',
      mouSignedDate: formData.mouSignedDate || new Date().toISOString().split('T')[0],
      mouValidTill: formData.mouValidTill || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mouScope: formData.mouScope || '',
      totalGrantDeposited: partnerToEdit?.totalGrantDeposited || 0,
      totalAidDisbursed: partnerToEdit?.totalAidDisbursed || 0,
      activeBalance: partnerToEdit?.activeBalance || 0,
      status: formData.status || 'active',
      coBrandedCardEnabled: formData.coBrandedCardEnabled ?? true,
      coBrandCardPrefix: formData.coBrandCardPrefix?.toUpperCase() || 'SEVA',
      defaultDiscountPercent: Number(formData.defaultDiscountPercent) || 100,
      notes: formData.notes || '',
      createdAt: partnerToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(partner);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Building2 className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {partnerToEdit ? 'Edit NGO / CSR Partner' : 'Register New NGO / CSR Partner'}
              </h2>
              <p className="text-xs text-emerald-100">
                Setup institutional health partnerships, 80G tax details, and co-branded welfare cards
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Organization Details */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Organization & Legal Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Organization / Trust / Foundation Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rotary Club Healthcare & Rural Relief Foundation"
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  } focus:ring-2 focus:ring-emerald-500 focus:outline-none`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Partner Category</label>
                <select
                  value={formData.category || 'charity_trust'}
                  onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="rotary_lions">Rotary / Lions International Club</option>
                  <option value="corporate_csr">Corporate CSR Social Trust</option>
                  <option value="charity_trust">Registered Charitable Health Trust</option>
                  <option value="religious_mission">Ramakrishna Mission / Religious Seva</option>
                  <option value="international_aid">International Aid Organization</option>
                  <option value="government_grant">Government Grant / Zilla Parishad</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Registration / Trust Act No. *
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber || ''}
                  onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })}
                  placeholder="e.g. TR/WB/2012/88129"
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border ${
                    errors.registrationNumber ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  } focus:ring-2 focus:ring-emerald-500 focus:outline-none`}
                />
                {errors.registrationNumber && <p className="text-xs text-red-500 mt-1">{errors.registrationNumber}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  80G Income Tax Exemption Reg. No.
                </label>
                <input
                  type="text"
                  value={formData.taxExemption80G || ''}
                  onChange={e => setFormData({ ...formData, taxExemption80G: e.target.value })}
                  placeholder="e.g. AAATR8812E20211"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  12A Income Tax Exemption No.
                </label>
                <input
                  type="text"
                  value={formData.taxExemption12A || ''}
                  onChange={e => setFormData({ ...formData, taxExemption12A: e.target.value })}
                  placeholder="e.g. 12A-CIT-KOL-8812"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Contact Person */}
          <div className="border-t border-slate-200 pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" /> Point of Contact & Communication
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Authorized Contact Person *
                </label>
                <input
                  type="text"
                  value={formData.contactPerson || ''}
                  onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="e.g. Mr. Arvind Roy"
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border ${
                    errors.contactPerson ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  } focus:ring-2 focus:ring-emerald-500 focus:outline-none`}
                />
                {errors.contactPerson && <p className="text-xs text-red-500 mt-1">{errors.contactPerson}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Designation / Role</label>
                <input
                  type="text"
                  value={formData.designation || ''}
                  onChange={e => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Welfare Director / General Secretary"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Contact Phone / Mobile *</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98310 99221"
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border ${
                    errors.phone ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  } focus:ring-2 focus:ring-emerald-500 focus:outline-none`}
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="csr@foundation.org"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Address & Headquarters</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address, City, District"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* MoU & Welfare Scheme */}
          <div className="border-t border-slate-200 pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" /> MoU Validity & Co-Branded Card Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">MoU Signed Date</label>
                <input
                  type="date"
                  value={formData.mouSignedDate || ''}
                  onChange={e => setFormData({ ...formData, mouSignedDate: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">MoU Valid Till</label>
                <input
                  type="date"
                  value={formData.mouValidTill || ''}
                  onChange={e => setFormData({ ...formData, mouValidTill: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Default Aid Subsidy %</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.defaultDiscountPercent || 100}
                    onChange={e => setFormData({ ...formData, defaultDiscountPercent: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none pr-8"
                  />
                  <Percent className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Co-Branded Health Card Prefix
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={formData.coBrandCardPrefix || 'SEVA'}
                    onChange={e => setFormData({ ...formData, coBrandCardPrefix: e.target.value.toUpperCase() })}
                    placeholder="e.g. ROTARY-SEVA, LIONS-VISION"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase"
                  />
                  <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.coBrandedCardEnabled ?? true}
                      onChange={e => setFormData({ ...formData, coBrandedCardEnabled: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    Enable Cards
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Partner Status</label>
                <select
                  value={formData.status || 'active'}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="active">Active & Sponsoring</option>
                  <option value="inactive">Inactive / Paused</option>
                  <option value="mou_expired">MoU Expired</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  MoU Scope & Healthcare Mandate
                </label>
                <textarea
                  rows={2}
                  value={formData.mouScope || ''}
                  onChange={e => setFormData({ ...formData, mouScope: e.target.value })}
                  placeholder="Describe agreed health camps, BPL subsidy coverage, dialysis sponsorships, etc."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {partnerToEdit ? 'Update Partner' : 'Save & Register Partner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
