import React from 'react';
import { PrescriptionLayoutProps } from './smartLayoutTypes';
import { THEME_CONFIGS } from './themeConfigs';
import { formatDateTime, formatDate } from '../../../utils/formatters';
import { LabMedixLogo } from '../../common/LabMedixLogo';
import { PrescribedMedication, OrderedLabTest } from '../../../types';
import {
  Activity,
  ShieldCheck,
  Stethoscope,
  Pill,
  AlertTriangle
} from 'lucide-react';

export const ClinicalSummaryLayout: React.FC<PrescriptionLayoutProps> = ({
  encounter,
  patient,
  company,
  securityHash,
  qrCodeUrl,
  theme,
  options,
  appointmentSlotLabel,
  preferredTimeLabel,
  helplineNumber,
  hospitalName,
  hospitalTagline,
  hospitalAddress
}) => {
  const currentTheme = THEME_CONFIGS[theme] || THEME_CONFIGS.apollo_modern;

  return (
    <div
      className={`mx-auto bg-white p-6 sm:p-8 rounded-3xl border-2 shadow-2xl space-y-4 max-w-[800px] text-xs leading-relaxed ${currentTheme.borderClass} ${currentTheme.fontClass}`}
    >
      {/* Formal Clinical Header */}
      <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-900 text-white shrink-0">
            <LabMedixLogo logoUrl={company.logoUrl} variant="monogram" size="lg" theme="white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-950">
              {hospitalName}
            </h1>
            <p className="text-[11px] font-bold text-slate-600 uppercase">{hospitalTagline}</p>
            <p className="text-[10px] text-slate-500">{hospitalAddress} • 24x7 Emergency: {helplineNumber}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="px-2.5 py-1 rounded bg-slate-900 text-white font-mono text-[10px] font-black uppercase tracking-wider inline-block">
            CLINICAL CASE &amp; DISCHARGE SUMMARY
          </span>
          <div className="font-mono text-xs font-black mt-1">DOC #: {encounter.encounterNo}</div>
          <div className="text-[10px] text-slate-500 font-mono">Date: {formatDateTime(encounter.date)}</div>
        </div>
      </div>

      {/* Comprehensive Patient Demographics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-100/80 border border-slate-300 text-[11px]">
        <div>
          <span className="text-slate-500 text-[9.5px] uppercase font-bold block">Patient Full Name:</span>
          <strong className="text-slate-950 text-sm font-black">{encounter.patientName}</strong>
        </div>
        <div>
          <span className="text-slate-500 text-[9.5px] uppercase font-bold block">UHID / Patient ID:</span>
          <strong className="font-mono text-slate-900">{encounter.patientId}</strong>
        </div>
        <div>
          <span className="text-slate-500 text-[9.5px] uppercase font-bold block">Age / Gender / Blood:</span>
          <strong className="text-slate-900">{patient?.age || '54'} Yrs / {patient?.gender || 'Male'} ({patient?.bloodGroup || 'O+'})</strong>
        </div>
        <div>
          <span className="text-slate-500 text-[9.5px] uppercase font-bold block">Attending Consultant:</span>
          <strong className="text-slate-950 font-bold">{encounter.doctorName} ({encounter.department})</strong>
        </div>
      </div>

      {/* Baseline Vitals Record */}
      {options.showVitals && encounter.vitals && (
        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
          <div className="text-[10.5px] font-black uppercase text-slate-800 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            <span>Baseline Physiological Telemetry at Time of Review:</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px]">
            <div className="p-1.5 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-500 font-bold block text-[9px]">Blood Pressure</span>
              <strong className="font-mono text-xs">{encounter.vitals.bpSystolic || 120}/{encounter.vitals.bpDiastolic || 80} mmHg</strong>
            </div>
            <div className="p-1.5 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-500 font-bold block text-[9px]">Pulse Rate</span>
              <strong className="font-mono text-xs text-rose-600">{encounter.vitals.pulseRate || 74} bpm</strong>
            </div>
            <div className="p-1.5 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-500 font-bold block text-[9px]">Oral Temp</span>
              <strong className="font-mono text-xs text-amber-600">{encounter.vitals.temperature || 98.4}°F</strong>
            </div>
            <div className="p-1.5 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-500 font-bold block text-[9px]">SpO2 Saturation</span>
              <strong className="font-mono text-xs text-teal-600">{encounter.vitals.spo2 || 99}%</strong>
            </div>
            <div className="p-1.5 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-500 font-bold block text-[9px]">Random Glucose</span>
              <strong className="font-mono text-xs text-purple-600">{encounter.vitals.bloodSugar || 110} mg/dL</strong>
            </div>
            <div className="p-1.5 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-500 font-bold block text-[9px]">BMI (Body Index)</span>
              <strong className="font-mono text-xs text-emerald-600">{encounter.vitals.bmi || '24.2'}</strong>
            </div>
          </div>
        </div>
      )}

      {/* History & Diagnoses Narrative */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-violet-50/60 border border-violet-200 space-y-1">
          <div className="text-[11px] font-black uppercase text-violet-900 flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5 text-violet-600" />
            <span>Presenting Symptoms &amp; Clinical History:</span>
          </div>
          <ul className="list-disc pl-4 text-[11px] text-violet-950 font-medium space-y-0.5">
            {encounter.chiefComplaints && encounter.chiefComplaints.length > 0 ? (
              encounter.chiefComplaints.map((c: string, i: number) => <li key={i}>{c}</li>)
            ) : (
              <li>Routine follow-up and management of chronic status.</li>
            )}
          </ul>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
          <div className="text-[11px] font-black uppercase text-emerald-900 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Final Clinical Diagnoses (ICD-10):</span>
          </div>
          <ul className="list-disc pl-4 text-[11px] text-emerald-950 font-bold space-y-0.5">
            {encounter.diagnoses && encounter.diagnoses.length > 0 ? (
              encounter.diagnoses.map((d: string, i: number) => <li key={i}>{d}</li>)
            ) : (
              <li>Clinical status evaluation complete.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Prescribed Discharge Therapeutic Plan */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-black uppercase text-slate-900 flex items-center justify-between border-b pb-1">
          <span className="flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-teal-600" />
            <span>Prescribed Discharge Medications &amp; Therapeutic Plan:</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono font-bold">{encounter.medications.length} Regimen Drugs</span>
        </div>

        <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden text-[11px]">
          <thead className="bg-slate-900 text-white uppercase text-[9.5px] font-bold">
            <tr>
              <th className="p-2.5">Medication &amp; Active Salt</th>
              <th className="p-2.5">Dose</th>
              <th className="p-2.5">Frequency &amp; Route</th>
              <th className="p-2.5">Duration</th>
              <th className="p-2.5">Administration Rationale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {encounter.medications.map((m: PrescribedMedication, idx: number) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-2.5">
                  <strong className="text-slate-950 block font-bold">{m.name}</strong>
                  {options.showSalts && m.composition && (
                    <span className="text-[9.5px] text-slate-500 italic block">{m.composition}</span>
                  )}
                </td>
                <td className="p-2.5 font-mono font-bold">{m.dosage}</td>
                <td className="p-2.5">
                  <strong className="text-teal-800">{m.frequency}</strong>
                  <span className="text-[9.5px] text-slate-500 block">({m.timing})</span>
                </td>
                <td className="p-2.5 font-mono font-bold">{m.duration}</td>
                <td className="p-2.5 text-[10px] text-slate-600">{m.instructions || 'As clinically indicated'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Diagnostics Ordered & Lifestyle Instructions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
        {encounter.labOrders && encounter.labOrders.length > 0 && (
          <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1">
            <span className="font-black text-purple-950 uppercase block text-[10.5px]">🔬 Recommended Investigations:</span>
            <ul className="list-disc pl-4 text-purple-950 space-y-0.5 font-medium">
              {encounter.labOrders.map((lo: OrderedLabTest, i: number) => (
                <li key={i}>{lo.testName} ({lo.category})</li>
              ))}
            </ul>
          </div>
        )}

        {options.showAdvice && (
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
            <span className="font-black text-amber-950 uppercase block text-[10.5px]">🥗 Lifestyle &amp; Dietary Guidelines:</span>
            <ul className="list-disc pl-4 text-amber-950 space-y-0.5 font-medium">
              {encounter.dietAndAdvice && encounter.dietAndAdvice.length > 0 ? (
                encounter.dietAndAdvice.map((a: string, i: number) => <li key={i}>{a}</li>)
              ) : (
                <li>Maintain prescribed hydration, light walking, and sodium control.</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Emergency Red Flags & Follow-up Handover */}
      <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-[10.5px] text-rose-950 flex items-start gap-2.5">
        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-black uppercase text-rose-900 text-[11px]">⚠️ Emergency Warning Signs &amp; Immediate Red Flags:</strong>
          <span>In the event of acute chest tightness, sudden shortness of breath, severe dizziness, or high fever unresponsive to medication, present immediately to the 24x7 Emergency Room or call Helpline: {helplineNumber}.</span>
        </div>
      </div>

      {/* Follow-up schedule */}
      {options.includeFollowupSlot && (
        <div className="p-3 rounded-xl bg-slate-900 text-white flex justify-between items-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Scheduled Clinical Review:</span>
            <strong>{formatDate(encounter.followUpDate || '')} ({encounter.followUpDays || 14} Days)</strong>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Appointment Slot:</span>
            <strong className="text-amber-300">{appointmentSlotLabel} ({preferredTimeLabel})</strong>
          </div>
        </div>
      )}

      {/* Formal Signature & Verification */}
      <div className="flex justify-between items-end pt-3 border-t-2 border-slate-900 text-[10.5px]">
        <div className="space-y-0.5">
          {options.showQrCode && qrCodeUrl && (
            <img src={qrCodeUrl} alt="e-Rx QR" className="w-12 h-12 border border-slate-300 p-0.5 bg-white rounded mb-1" />
          )}
          <div className="font-bold text-slate-900">LABMEDIX HEALTHCARE INFORMATICS</div>
          <div className="font-mono text-[9px] text-slate-500">Document Cryptographic Hash: {securityHash}</div>
        </div>

        <div className="text-right">
          <div className="font-serif italic font-black text-base text-slate-900">{encounter.doctorName}</div>
          <div className="border-t border-slate-900 pt-1">
            <strong className="block">{encounter.doctorName}, {encounter.doctorSpeciality}</strong>
            <span className="text-slate-600 text-[9.5px]">Reg No: {encounter.doctorRegNo} • Dept: {encounter.department}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
