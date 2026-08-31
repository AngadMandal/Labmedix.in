import React, { useState } from 'react';
import { CampAttendee, HealthCamp, NgoPartner } from '../../types';
import { UserCheck, X, Check, Heart, Activity, Pill, CreditCard, Stethoscope } from 'lucide-react';

interface CampAttendeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attendee: CampAttendee, shouldCreateCard: boolean) => void;
  camp: HealthCamp;
  partner?: NgoPartner;
  attendeeToEdit?: CampAttendee | null;
  existingCount: number;
}

export const CampAttendeeModal: React.FC<CampAttendeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  camp,
  partner,
  attendeeToEdit,
  existingCount
}) => {
  const [fullName, setFullName] = useState(attendeeToEdit?.fullName || '');
  const [age, setAge] = useState<number | ''>(attendeeToEdit?.age || 45);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(
    attendeeToEdit?.gender || 'male'
  );
  const [phone, setPhone] = useState(attendeeToEdit?.phone || '');
  const [villageOrLocality, setVillageOrLocality] = useState(
    attendeeToEdit?.villageOrLocality || camp.villageOrPanchayat || ''
  );

  // Vitals
  const [bpSystolic, setBpSystolic] = useState<number | ''>(
    attendeeToEdit?.vitals?.bpSystolic || 120
  );
  const [bpDiastolic, setBpDiastolic] = useState<number | ''>(
    attendeeToEdit?.vitals?.bpDiastolic || 80
  );
  const [bloodSugar, setBloodSugar] = useState<number | ''>(
    attendeeToEdit?.vitals?.bloodSugar || 110
  );
  const [spo2, setSpo2] = useState<number | ''>(
    attendeeToEdit?.vitals?.spo2 || 98
  );
  const [pulseRate, setPulseRate] = useState<number | ''>(
    attendeeToEdit?.vitals?.pulseRate || 72
  );
  const [weightKg, setWeightKg] = useState<number | ''>(
    attendeeToEdit?.vitals?.weightKg || ''
  );

  const [doctorObservations, setDoctorObservations] = useState(
    attendeeToEdit?.doctorObservations || ''
  );
  const [freeMedicinesDispensed, setFreeMedicinesDispensed] = useState(
    attendeeToEdit?.freeMedicinesDispensed || ''
  );
  const [selectedTests, setSelectedTests] = useState<string[]>(
    attendeeToEdit?.prescribedTests || []
  );
  const [testInput, setTestInput] = useState('');
  const [issueHealthCard, setIssueHealthCard] = useState(
    attendeeToEdit?.healthCardIssued ?? true
  );
  const [status, setStatus] = useState<
    'registered' | 'screened' | 'prescribed' | 'investigated' | 'referred'
  >(attendeeToEdit?.status || 'investigated');

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleAddTest = (t: string) => {
    if (!t.trim() || selectedTests.includes(t.trim())) return;
    setSelectedTests([...selectedTests, t.trim()]);
    setTestInput('');
  };

  const handleRemoveTest = (t: string) => {
    setSelectedTests(selectedTests.filter(item => item !== t));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrors({ fullName: 'Beneficiary name is required' });
      return;
    }

    const tokenNum =
      attendeeToEdit?.tokenNumber ||
      `T-${String(existingCount + 1).padStart(3, '0')}`;

    const prefix = partner?.coBrandCardPrefix || 'SEVA';
    const generatedCardNum = `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const attendee: CampAttendee = {
      id: attendeeToEdit?.id || `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      campId: camp.id,
      campCode: camp.campCode,
      tokenNumber: tokenNum,
      fullName: fullName.trim(),
      age: Number(age) || 30,
      gender,
      phone: phone.trim(),
      villageOrLocality: villageOrLocality.trim(),
      vitals: {
        bpSystolic: bpSystolic ? Number(bpSystolic) : undefined,
        bpDiastolic: bpDiastolic ? Number(bpDiastolic) : undefined,
        bloodSugar: bloodSugar ? Number(bloodSugar) : undefined,
        spo2: spo2 ? Number(spo2) : undefined,
        pulseRate: pulseRate ? Number(pulseRate) : undefined,
        weightKg: weightKg ? Number(weightKg) : undefined
      },
      prescribedTests: selectedTests,
      doctorObservations: doctorObservations.trim(),
      freeMedicinesDispensed: freeMedicinesDispensed.trim(),
      healthCardIssued: issueHealthCard,
      cardNumber: attendeeToEdit?.cardNumber || (issueHealthCard ? generatedCardNum : undefined),
      subsidyAmount: (selectedTests.length * 250) + (issueHealthCard ? 200 : 0),
      registeredAt: attendeeToEdit?.registeredAt || new Date().toISOString(),
      status
    };

    onSave(attendee, issueHealthCard && !attendeeToEdit?.healthCardIssued);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <UserCheck className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {attendeeToEdit ? 'Edit Camp Beneficiary' : 'Camp On-Site Patient Registration & Screening'}
              </h2>
              <p className="text-xs text-emerald-100">
                {camp.title} ({camp.campCode})
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
          {/* Patient Bio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Beneficiary Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Haradhan Mondal"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Age (Years)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={e => setAge(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Mobile Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="9831100221"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Village / Locality</label>
              <input
                type="text"
                value={villageOrLocality}
                onChange={e => setVillageOrLocality(e.target.value)}
                placeholder="Sonarpur Village West"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Vitals Recording */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" /> Clinical Vitals & Rapid Diagnostics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  BP Systolic (mmHg)
                </label>
                <input
                  type="number"
                  placeholder="120"
                  value={bpSystolic}
                  onChange={e => setBpSystolic(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-1.5 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  BP Diastolic (mmHg)
                </label>
                <input
                  type="number"
                  placeholder="80"
                  value={bpDiastolic}
                  onChange={e => setBpDiastolic(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-1.5 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Blood Sugar (mg/dL)
                </label>
                <input
                  type="number"
                  placeholder="110"
                  value={bloodSugar}
                  onChange={e => setBloodSugar(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-1.5 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  SpO2 Saturation (%)
                </label>
                <input
                  type="number"
                  placeholder="98"
                  value={spo2}
                  onChange={e => setSpo2(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-1.5 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Pulse Rate (bpm)
                </label>
                <input
                  type="number"
                  placeholder="72"
                  value={pulseRate}
                  onChange={e => setPulseRate(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-1.5 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Weight (Kg)
                </label>
                <input
                  type="number"
                  placeholder="65"
                  value={weightKg}
                  onChange={e => setWeightKg(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-1.5 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Attendee Camp Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="registered">1. Registered Only</option>
                  <option value="screened">2. Vitals Screened</option>
                  <option value="investigated">3. Tests Investigated & Done</option>
                  <option value="prescribed">4. Doctor Prescribed & Meds Dispensed</option>
                  <option value="referred">5. Referred to Hospital / Higher Lab</option>
                </select>
              </div>
            </div>
          </div>

          {/* Doctor Observations & Prescriptions */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-600" /> Doctor Clinical Observations & Diagnosis
              </label>
              <textarea
                rows={2}
                value={doctorObservations}
                onChange={e => setDoctorObservations(e.target.value)}
                placeholder="e.g. Mild hypertension. Fasting blood sugar elevated. Advised low salt diet."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-emerald-600" /> Free Medicines Dispensed at Camp
              </label>
              <input
                type="text"
                value={freeMedicinesDispensed}
                onChange={e => setFreeMedicinesDispensed(e.target.value)}
                placeholder="e.g. Tab Metformin 500mg (1 Month), Calcium + D3, Paracetamol"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Prescribed Free Camp Diagnostic Tests
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {camp.freeServicesOffered?.map((srv, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddTest(srv)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition ${
                      selectedTests.includes(srv)
                        ? 'bg-emerald-600 text-white border-emerald-600 font-medium'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {selectedTests.includes(srv) ? '✓ ' : '+ '}
                    {srv}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testInput}
                  onChange={e => setTestInput(e.target.value)}
                  placeholder="Other custom test..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTest(testInput);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleAddTest(testInput)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition"
                >
                  Add Test
                </button>
              </div>
            </div>
          </div>

          {/* Instant Co-Branded Health Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950">
                  Issue Free Co-Branded Health Card ({partner?.coBrandCardPrefix || 'SEVA'})
                </p>
                <p className="text-[11px] text-emerald-800">
                  Enables instant subsidized lifelong lab diagnostics under {partner?.name || 'Welfare Trust'}
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={issueHealthCard}
              onChange={e => setIssueHealthCard(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500"
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
              Save Camp Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
