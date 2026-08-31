import React, { useState } from 'react';
import { HealthCamp, NgoPartner } from '../../types';
import { Tent, X, Check, Calendar, MapPin, Stethoscope, Users } from 'lucide-react';

interface HealthCampModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (camp: HealthCamp) => void;
  campToEdit?: HealthCamp | null;
  ngoPartners: NgoPartner[];
}

export const HealthCampModal: React.FC<HealthCampModalProps> = ({
  isOpen,
  onClose,
  onSave,
  campToEdit,
  ngoPartners
}) => {
  const [formData, setFormData] = useState<Partial<HealthCamp>>(() => {
    if (campToEdit) return { ...campToEdit };
    const defaultPartner = ngoPartners[0];
    return {
      campCode: `CAMP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      title: '',
      ngoPartnerId: defaultPartner?.id || '',
      ngoPartnerName: defaultPartner?.name || '',
      category: 'diabetes_cardiac',
      campDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '15:00',
      venueName: '',
      locationAddress: '',
      villageOrPanchayat: '',
      district: 'South 24 Parganas',
      assignedDoctorIds: [],
      assignedDoctorNames: ['Dr. Primary Consultant (MD)'],
      coordinatorName: '',
      coordinatorPhone: '',
      targetBeneficiaries: 100,
      registeredCount: 0,
      attendedCount: 0,
      testsConductedCount: 0,
      freeCardsIssuedCount: 0,
      allocatedBudget: 20000,
      actualSpent: 0,
      status: 'scheduled',
      freeServicesOffered: [
        'Random Blood Sugar (RBS)',
        '12-Lead ECG Screening',
        'Blood Pressure & Vitals Check',
        'Free Doctor Consultation'
      ],
      summaryNotes: ''
    };
  });

  const [serviceInput, setServiceInput] = useState('');
  const [doctorInput, setDoctorInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.title?.trim()) errs.title = 'Camp title / name is required';
    if (!formData.venueName?.trim()) errs.venueName = 'Venue / Community Hall name is required';
    if (!formData.locationAddress?.trim()) errs.locationAddress = 'Location address is required';
    if (!formData.coordinatorName?.trim()) errs.coordinatorName = 'Coordinator name is required';
    if (!formData.coordinatorPhone?.trim()) errs.coordinatorPhone = 'Coordinator phone is required';
    if (!formData.ngoPartnerId) errs.ngoPartnerId = 'Please select a sponsoring NGO partner';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePartnerChange = (partnerId: string) => {
    const selected = ngoPartners.find(p => p.id === partnerId);
    setFormData({
      ...formData,
      ngoPartnerId: partnerId,
      ngoPartnerName: selected?.name || ''
    });
  };

  const handleAddService = () => {
    if (!serviceInput.trim()) return;
    const services = formData.freeServicesOffered || [];
    setFormData({
      ...formData,
      freeServicesOffered: [...services, serviceInput.trim()]
    });
    setServiceInput('');
  };

  const handleRemoveService = (index: number) => {
    const services = [...(formData.freeServicesOffered || [])];
    services.splice(index, 1);
    setFormData({ ...formData, freeServicesOffered: services });
  };

  const handleAddDoctor = () => {
    if (!doctorInput.trim()) return;
    const doctors = formData.assignedDoctorNames || [];
    setFormData({
      ...formData,
      assignedDoctorNames: [...doctors, doctorInput.trim()]
    });
    setDoctorInput('');
  };

  const handleRemoveDoctor = (index: number) => {
    const doctors = [...(formData.assignedDoctorNames || [])];
    doctors.splice(index, 1);
    setFormData({ ...formData, assignedDoctorNames: doctors });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const camp: HealthCamp = {
      id: campToEdit?.id || `camp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      campCode: formData.campCode || `CAMP-${Date.now().toString().slice(-4)}`,
      title: formData.title || '',
      ngoPartnerId: formData.ngoPartnerId || '',
      ngoPartnerName: formData.ngoPartnerName || '',
      category: formData.category || 'diabetes_cardiac',
      campDate: formData.campDate || new Date().toISOString().split('T')[0],
      startTime: formData.startTime || '09:00',
      endTime: formData.endTime || '16:00',
      venueName: formData.venueName || '',
      locationAddress: formData.locationAddress || '',
      villageOrPanchayat: formData.villageOrPanchayat || '',
      district: formData.district || '',
      assignedDoctorIds: formData.assignedDoctorIds || [],
      assignedDoctorNames: formData.assignedDoctorNames || ['Medical Officer'],
      coordinatorName: formData.coordinatorName || '',
      coordinatorPhone: formData.coordinatorPhone || '',
      targetBeneficiaries: Number(formData.targetBeneficiaries) || 100,
      registeredCount: campToEdit?.registeredCount || 0,
      attendedCount: campToEdit?.attendedCount || 0,
      testsConductedCount: campToEdit?.testsConductedCount || 0,
      freeCardsIssuedCount: campToEdit?.freeCardsIssuedCount || 0,
      allocatedBudget: Number(formData.allocatedBudget) || 0,
      actualSpent: Number(formData.actualSpent) || 0,
      status: formData.status || 'scheduled',
      freeServicesOffered: formData.freeServicesOffered || ['Blood Sugar (RBS)', 'ECG Check'],
      summaryNotes: formData.summaryNotes || '',
      createdAt: campToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(camp);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Tent className="w-6 h-6 text-teal-100" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {campToEdit ? 'Edit Rural Health Camp' : 'Schedule New Health Camp'}
              </h2>
              <p className="text-xs text-teal-100">
                Setup venue, doctors, free investigations, and community coordinator
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
          {/* Sponsoring Partner & Theme */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Camp Title / Outreach Event Name *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Free Rural Diabetes, Cardiac & Blood Sugar Screening Camp"
                className={`w-full px-3.5 py-2 text-sm rounded-xl border ${
                  errors.title ? 'border-red-500 bg-red-50' : 'border-slate-300'
                } focus:ring-2 focus:ring-teal-500 focus:outline-none`}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Sponsoring NGO / CSR Partner *
              </label>
              <select
                value={formData.ngoPartnerId || ''}
                onChange={e => handlePartnerChange(e.target.value)}
                className={`w-full px-3.5 py-2 text-sm rounded-xl border ${
                  errors.ngoPartnerId ? 'border-red-500 bg-red-50' : 'border-slate-300'
                } focus:ring-2 focus:ring-teal-500 focus:outline-none`}
              >
                <option value="">-- Select Sponsoring Partner --</option>
                {ngoPartners.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Bal: ₹{p.activeBalance.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Medical Focus Category</label>
              <select
                value={formData.category || 'diabetes_cardiac'}
                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="diabetes_cardiac">Diabetes & Cardiac Wellness</option>
                <option value="eye_vision">Eye Care, Vision & Cataract</option>
                <option value="pediatric_maternal">Pediatric & Maternal Nutrition</option>
                <option value="general_multispecialty">General Multi-Specialty Health</option>
                <option value="cancer_screening">Cancer & Tumor Marker Screening</option>
                <option value="orthopedic_geriatric">Orthopedic & Geriatric Health</option>
                <option value="blood_donation">Voluntary Blood Donation Drive</option>
              </select>
            </div>
          </div>

          {/* Date & Location */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" /> Schedule, Date & Venue Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Camp Date *</label>
                <input
                  type="date"
                  value={formData.campDate || ''}
                  onChange={e => setFormData({ ...formData, campDate: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime || '09:00'}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={formData.endTime || '16:00'}
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Venue / School / Community Hall Name *
                </label>
                <input
                  type="text"
                  value={formData.venueName || ''}
                  onChange={e => setFormData({ ...formData, venueName: e.target.value })}
                  placeholder="e.g. Sonarpur Gram Panchayat Community Hall"
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border ${
                    errors.venueName ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  } focus:ring-2 focus:ring-teal-500 focus:outline-none`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Gram Panchayat / Locality
                </label>
                <input
                  type="text"
                  value={formData.villageOrPanchayat || ''}
                  onChange={e => setFormData({ ...formData, villageOrPanchayat: e.target.value })}
                  placeholder="e.g. Sonarpur Gram Panchayat"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Location Address *
                </label>
                <input
                  type="text"
                  value={formData.locationAddress || ''}
                  onChange={e => setFormData({ ...formData, locationAddress: e.target.value })}
                  placeholder="Station Road, PO: Sonarpur, Dist: South 24 Parganas"
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border ${
                    errors.locationAddress ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  } focus:ring-2 focus:ring-teal-500 focus:outline-none`}
                />
              </div>
            </div>
          </div>

          {/* Coordinators & Doctors */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" /> On-Field Team & Coordinators
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Field Coordinator Name *
                </label>
                <input
                  type="text"
                  value={formData.coordinatorName || ''}
                  onChange={e => setFormData({ ...formData, coordinatorName: e.target.value })}
                  placeholder="e.g. Arup Biswas"
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border ${
                    errors.coordinatorName ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  } focus:ring-2 focus:ring-teal-500 focus:outline-none`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Coordinator Mobile No. *
                </label>
                <input
                  type="text"
                  value={formData.coordinatorPhone || ''}
                  onChange={e => setFormData({ ...formData, coordinatorPhone: e.target.value })}
                  placeholder="+91 98311 22334"
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border ${
                    errors.coordinatorPhone ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  } focus:ring-2 focus:ring-teal-500 focus:outline-none`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Assigned Doctors & Specialists
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={doctorInput}
                    onChange={e => setDoctorInput(e.target.value)}
                    placeholder="e.g. Dr. Subhashish Roy (MD Cardiology)"
                    className="flex-1 px-3.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDoctor();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddDoctor}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition"
                  >
                    + Add Doctor
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.assignedDoctorNames?.map((doc, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg text-xs font-medium"
                    >
                      <Stethoscope className="w-3 h-3 text-teal-600" />
                      {doc}
                      <button
                        type="button"
                        onClick={() => handleRemoveDoctor(idx)}
                        className="text-teal-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Free Tests & Services Offered */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" /> Free Services & Target Beneficiaries
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Target Beneficiaries Count
                </label>
                <input
                  type="number"
                  min="10"
                  value={formData.targetBeneficiaries || 100}
                  onChange={e => setFormData({ ...formData, targetBeneficiaries: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Allocated Camp Budget (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.allocatedBudget || 0}
                  onChange={e => setFormData({ ...formData, allocatedBudget: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Camp Status</label>
                <select
                  value={formData.status || 'scheduled'}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="scheduled">Scheduled / Upcoming</option>
                  <option value="active_today">Active Live Today</option>
                  <option value="completed">Completed & Audited</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Free Diagnostic Tests & Health Checks Offered
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={serviceInput}
                  onChange={e => setServiceInput(e.target.value)}
                  placeholder="e.g. 12-Lead ECG, Blood Sugar, Eye Refraction"
                  className="flex-1 px-3.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddService();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddService}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition"
                >
                  + Add Service
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.freeServicesOffered?.map((srv, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium"
                  >
                    ✓ {srv}
                    <button
                      type="button"
                      onClick={() => handleRemoveService(idx)}
                      className="text-emerald-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
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
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {campToEdit ? 'Update Camp Details' : 'Confirm & Schedule Camp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
