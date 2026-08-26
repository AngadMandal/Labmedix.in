import React, { useState } from 'react';
import { WaitingQueueItem, EMRService } from '../../services/emrService';
import { ClinicalAIService, AIMedicineSuggestion, AIDiagnosisProtocol } from '../../services/clinicalAIService';
import { StorageService } from '../../services/storage';
import { ClinicalEncounter, PrescribedMedication, OrderedLabTest, ClinicalVitals, Patient, HealthCard, Membership } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Stethoscope,
  Pill,
  FlaskConical,
  Activity,
  CalendarCheck,
  Wand2,
  Bot,
  Trash2,
  Copy,
  ChevronDown,
  Printer,
  Sparkles,
  Check,
  ShieldCheck
} from 'lucide-react';

interface QueuePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  queueItem: WaitingQueueItem;
  onPrescriptionGenerated: (encounter: ClinicalEncounter) => void;
}

export const QueuePrescriptionModal: React.FC<QueuePrescriptionModalProps> = ({
  isOpen,
  onClose,
  queueItem,
  onPrescriptionGenerated
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const patients = StorageService.getPatients();
  const cards = StorageService.getCards();
  const memberships = StorageService.getMemberships();

  const patient = patients.find(p => p.id === queueItem.patientId);
  const activeCard = cards.find(c => c.patientId === queueItem.patientId && c.status === 'active');
  const activeMembership = activeCard ? memberships.find(m => m.id === activeCard.membershipId) : null;

  // Prescription Form State
  const [diagnosis, setDiagnosis] = useState<string>('I10 - Essential Hypertension, E78.5 - Hyperlipidemia');
  const [chiefComplaints, setChiefComplaints] = useState<string>(queueItem.chiefComplaint);
  const [hpi, setHpi] = useState<string>('Patient presented for routine OPD clinical review and management.');

  // Vitals
  const [vitals, setVitals] = useState<ClinicalVitals>({
    bpSystolic: 125,
    bpDiastolic: 82,
    pulseRate: 76,
    temperature: 98.4,
    spo2: 99,
    respiratoryRate: 16,
    bloodSugar: 112,
    weightKg: 72,
    heightCm: 170,
    bmi: '24.9'
  });

  // Prescribed Medications
  const [medications, setMedications] = useState<PrescribedMedication[]>([
    {
      id: 'med_q_1',
      name: 'Tab. Telmisartan + Amlodipine (Telma-AM)',
      composition: 'Telmisartan 40mg + Amlodipine 5mg',
      dosage: '40mg + 5mg',
      frequency: '1-0-0 (Morning)',
      timing: 'After Breakfast',
      duration: '30 Days',
      instructions: 'Take daily at fixed morning time'
    },
    {
      id: 'med_q_2',
      name: 'Tab. Rosuvastatin (Rozavel)',
      composition: 'Rosuvastatin 10mg',
      dosage: '10mg',
      frequency: '0-0-1 (Night)',
      timing: 'After Dinner',
      duration: '30 Days',
      instructions: 'Take at bedtime'
    }
  ]);

  // Lab Orders
  const [labOrders, setLabOrders] = useState<OrderedLabTest[]>([
    { id: 'lo_q_1', testName: 'Lipid Profile Comprehensive + Fasting Sugar', category: 'Biochemistry', urgency: 'routine', estimatedCost: 950 }
  ]);

  // Dietary Advice & Next Appointment (Patient Wish)
  const [dietAdvice, setDietAdvice] = useState<string>(
    'Low salt DASH diet (<3g/day)\nAvoid fried foods & sweets\n30 mins daily brisk walk'
  );
  const [followUpDays, setFollowUpDays] = useState<number>(14);
  const [appointmentSlot, setAppointmentSlot] = useState<string>('Morning OPD (09:00 AM - 01:00 PM)');
  const [patientPreferredTime, setPatientPreferredTime] = useState<string>('10:30 AM');

  // AI Drug Autocomplete
  const [aiMedQuery, setAiMedQuery] = useState<string>('');
  const [showAiDropdown, setShowAiDropdown] = useState<boolean>(false);
  const aiResults = ClinicalAIService.searchMedicines(aiMedQuery);

  const handleAddAIMedicine = (med: AIMedicineSuggestion) => {
    const newM: PrescribedMedication = {
      id: `med_q_${Date.now()}`,
      name: med.name,
      composition: med.generic,
      dosage: med.defaultDosage,
      frequency: med.defaultFrequency,
      timing: med.defaultTiming,
      duration: med.defaultDuration,
      instructions: med.instructions
    };
    setMedications([...medications, newM]);
    setAiMedQuery('');
    setShowAiDropdown(false);
    showToast('success', 'AI Medicine Added', `Added ${med.name} (${med.generic})`);
  };

  const handleApplyProtocol = (protocol: AIDiagnosisProtocol) => {
    setDiagnosis(`${protocol.diagnosisCode} - ${protocol.diagnosisName}`);
    setChiefComplaints(protocol.symptoms.join(', '));
    setMedications(protocol.recommendedMeds.map((m, idx) => ({
      id: `med_p_${Date.now()}_${idx}`,
      name: m.name,
      composition: m.name.includes('(') ? m.name.split('(')[1]?.replace(')', '') : m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      timing: m.timing,
      duration: m.duration,
      instructions: m.instructions
    })));
    setLabOrders(protocol.recommendedLabs.map((l, idx) => ({
      id: `lab_p_${Date.now()}_${idx}`,
      testName: l.testName,
      category: l.category,
      urgency: 'routine',
      estimatedCost: l.estimatedCost
    })));
    setDietAdvice(protocol.dietAndLifestyle.join('\n'));
    triggerCelebrationFireworks();
    showToast('success', 'Protocol Loaded', `Applied protocol for ${protocol.diagnosisName}`);
  };

  const handleGeneratePrescription = () => {
    const followUpTargetDate = new Date(Date.now() + followUpDays * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const doctorName = currentUser?.fullName || 'Dr. Subhashish Roy';
    const doctorRegNo = currentUser?.licenseNo || 'WBMC-88412';

    const complaintsArray = chiefComplaints.split(',').map(s => s.trim()).filter(Boolean);
    const diagnosesArray = diagnosis.split(',').map(s => s.trim()).filter(Boolean);
    const adviceArray = dietAdvice.split('\n').map(s => s.trim()).filter(Boolean);

    const encounter = EMRService.saveEncounter({
      patientId: queueItem.patientId,
      patientName: queueItem.patientName,
      doctorId: currentUser?.id || 'doc_1',
      doctorName,
      doctorSpeciality: currentUser?.designation || 'Sr. Consultant Cardiologist & Medical Director',
      doctorRegNo,
      department: currentUser?.department || 'Cardiology OPD',
      date: new Date().toISOString(),
      chiefComplaints: complaintsArray.length ? complaintsArray : [queueItem.chiefComplaint],
      historyOfPresentIllness: hpi,
      allergies: ['Penicillin (Mild)'],
      chronicConditions: ['Hypertension'],
      vitals,
      examinationNotes: 'Chest clear. S1 S2 normal. No pedal edema.',
      diagnoses: diagnosesArray.length ? diagnosesArray : ['Clinical Evaluation'],
      medications,
      labOrders,
      dietAndAdvice: adviceArray,
      followUpDays,
      followUpDate: followUpTargetDate,
      appointmentSlot,
      patientPreferredTime,
      appointmentType: 'patient_wish',
      status: 'completed'
    });

    triggerCelebrationFireworks();
    showToast('success', 'Prescription Generated', `Prescription ${encounter.encounterNo} signed for ${queueItem.patientName}.`);
    onPrescriptionGenerated(encounter);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Token #${queueItem.tokenNo}: Prescription & Appointment Wish`} maxWidth="4xl">
      <div className="space-y-4 text-xs">
        {/* Patient Token & Card Strip */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 via-slate-50 to-slate-50 dark:from-teal-950/40 dark:via-slate-800/60 dark:to-slate-800/60 border border-teal-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white font-black text-base flex items-center justify-center shadow">
              {queueItem.patientName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-sm font-black text-slate-900 dark:text-white">
                  {queueItem.patientName}
                </strong>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-slate-900 text-white font-mono">
                  TOKEN #{queueItem.tokenNo}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                  {queueItem.cardTier}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                ID: {queueItem.patientId} • Age: {queueItem.age} Y / {queueItem.gender} • Blood: {queueItem.bloodGroup} • Arrival: {queueItem.arrivalTime}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200 font-mono font-bold border border-teal-300">
              {activeMembership?.opdDiscount || 20}% Cardholder Discount
            </span>
          </div>
        </div>

        {/* 1-Click Protocol Chips */}
        <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border">
          <span className="text-[10px] font-bold text-purple-600 flex items-center gap-1">
            <Bot className="w-3.5 h-3.5" />
            AI Protocols:
          </span>
          {ClinicalAIService.getProtocols().slice(0, 3).map((p) => (
            <button
              key={p.diagnosisCode}
              type="button"
              onClick={() => handleApplyProtocol(p)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border hover:bg-purple-600 hover:text-white text-[10px] font-bold transition-all"
            >
              ⚡ {p.diagnosisName.split(' (')[0]}
            </button>
          ))}
        </div>

        {/* Complaints & Diagnosis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Chief Complaints</label>
            <input
              type="text"
              value={chiefComplaints}
              onChange={(e) => setChiefComplaints(e.target.value)}
              className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Primary Clinical Diagnosis</label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-xs font-bold text-teal-700 dark:text-teal-300"
            />
          </div>
        </div>

        {/* Vitals Quick Pad */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs font-mono">
          <div>
            <span className="text-[9px] text-slate-400 block font-bold">BP (mmHg)</span>
            <input
              type="number"
              value={vitals.bpSystolic}
              onChange={(e) => setVitals({ ...vitals, bpSystolic: parseInt(e.target.value) || 0 })}
              className="w-full p-1.5 rounded-lg border bg-white dark:bg-slate-900 font-bold text-center"
            />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block font-bold">Pulse (bpm)</span>
            <input
              type="number"
              value={vitals.pulseRate}
              onChange={(e) => setVitals({ ...vitals, pulseRate: parseInt(e.target.value) || 0 })}
              className="w-full p-1.5 rounded-lg border bg-white dark:bg-slate-900 font-bold text-center"
            />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block font-bold">Temp (°F)</span>
            <input
              type="number"
              step="0.1"
              value={vitals.temperature}
              onChange={(e) => setVitals({ ...vitals, temperature: parseFloat(e.target.value) || 0 })}
              className="w-full p-1.5 rounded-lg border bg-white dark:bg-slate-900 font-bold text-center"
            />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block font-bold">SpO2 (%)</span>
            <input
              type="number"
              value={vitals.spo2}
              onChange={(e) => setVitals({ ...vitals, spo2: parseInt(e.target.value) || 0 })}
              className="w-full p-1.5 rounded-lg border bg-white dark:bg-slate-900 font-bold text-center text-teal-600"
            />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block font-bold">RBS (mg/dL)</span>
            <input
              type="number"
              value={vitals.bloodSugar}
              onChange={(e) => setVitals({ ...vitals, bloodSugar: parseInt(e.target.value) || 0 })}
              className="w-full p-1.5 rounded-lg border bg-white dark:bg-slate-900 font-bold text-center"
            />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block font-bold">Weight (kg)</span>
            <input
              type="number"
              value={vitals.weightKg}
              onChange={(e) => setVitals({ ...vitals, weightKg: parseFloat(e.target.value) || 0 })}
              className="w-full p-1.5 rounded-lg border bg-white dark:bg-slate-900 font-bold text-center"
            />
          </div>
        </div>

        {/* Prescribed Medications Pad with Drug Composition */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between border-b pb-1">
            <span className="font-bold text-xs flex items-center gap-1 text-teal-700 dark:text-teal-400">
              <span className="text-base font-serif font-black">℞</span>
              Prescribed Medications ({medications.length})
            </span>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Type 1-5 letters (e.g. 'telm', 'metf')..."
                value={aiMedQuery}
                onChange={(e) => {
                  setAiMedQuery(e.target.value);
                  setShowAiDropdown(true);
                }}
                onFocus={() => setShowAiDropdown(true)}
                className="w-full text-[11px] p-1.5 rounded-lg border bg-white dark:bg-slate-900"
              />
              {showAiDropdown && aiResults.length > 0 && (
                <div className="absolute top-full right-0 z-30 mt-1 w-72 p-2 bg-white dark:bg-slate-900 border rounded-xl shadow-xl max-h-48 overflow-y-auto space-y-1">
                  {aiResults.map((m, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleAddAIMedicine(m)}
                      className="p-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/40 cursor-pointer text-[10px]"
                    >
                      <strong className="block text-slate-900 dark:text-white">{m.name}</strong>
                      <span className="text-teal-600 font-mono">🧪 Comp: {m.generic}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {medications.map((m, i) => (
              <div key={m.id} className="p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <strong className="text-slate-900 dark:text-white block">{m.name}</strong>
                  <span className="text-[10px] text-teal-700 dark:text-teal-400 font-mono italic">
                    🧪 Comp: {m.composition || m.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                    Dose: <strong>{m.dosage}</strong> • Freq: <strong>{m.frequency}</strong> ({m.timing}) • Duration: {m.duration}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMedications(medications.filter(x => x.id !== m.id))}
                  className="text-rose-500 hover:text-rose-700 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Patient Appointment Wish & Follow-up Module */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-400/60 text-amber-950 dark:text-amber-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-100 flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4 text-amber-600" />
              📅 Next Follow-up & Appointment (Patient Wish)
            </span>
            <span className="text-[10px] text-amber-700 font-mono font-bold">
              Target: {formatDate(new Date(Date.now() + followUpDays * 24 * 3600 * 1000).toISOString().slice(0, 10))}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-500">Days:</span>
            {[7, 14, 21, 30, 60].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setFollowUpDays(days)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                  followUpDays === days
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-amber-300'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
            <div>
              <label className="text-[10px] text-slate-500 block font-bold">Preferred Slot (Patient Wish)</label>
              <select
                value={appointmentSlot}
                onChange={(e) => setAppointmentSlot(e.target.value)}
                className="w-full p-2 rounded-xl border border-amber-300 bg-white dark:bg-slate-800 font-bold"
              >
                <option value="Morning OPD (09:00 AM - 01:00 PM)">🌅 Morning OPD (09:00 AM - 01:00 PM)</option>
                <option value="Afternoon OPD (02:00 PM - 05:00 PM)">🌆 Afternoon OPD (02:00 PM - 05:00 PM)</option>
                <option value="Evening OPD (05:00 PM - 08:30 PM)">🌙 Evening OPD (05:00 PM - 08:30 PM)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block font-bold">Exact Preferred Time (Patient Wish)</label>
              <input
                type="text"
                value={patientPreferredTime}
                onChange={(e) => setPatientPreferredTime(e.target.value)}
                placeholder="e.g. 10:30 AM"
                className="w-full p-2 rounded-xl border border-amber-300 bg-white dark:bg-slate-800 font-bold font-mono text-center"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            size="md"
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 font-bold shadow-lg"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={handleGeneratePrescription}
          >
            ✨ Generate & Print Official Prescription (A4)
          </Button>
        </div>
      </div>
    </Modal>
  );
};
