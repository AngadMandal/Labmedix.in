import React from 'react';
import { PrescriptionLayoutProps } from './smartLayoutTypes';
import { THEME_CONFIGS } from './themeConfigs';
import { formatDateTime, formatDate } from '../../../utils/formatters';
import { LabMedixLogo } from '../../common/LabMedixLogo';
import { PrescribedMedication, OrderedLabTest } from '../../../types';
import { ShieldCheck } from 'lucide-react';

export const CompactA5Layout: React.FC<PrescriptionLayoutProps> = ({
  encounter,
  patient,
  activeMembership,
  company,
  securityHash,
  qrCodeUrl,
  theme,
  options,
  appointmentSlotLabel,
  preferredTimeLabel,
  helplineNumber,
  hospitalName,
  hospitalTagline
}) => {
  const currentTheme = THEME_CONFIGS[theme] || THEME_CONFIGS.apollo_modern;

  return (
    <div
      className={`mx-auto bg-white p-5 rounded-2xl border-2 shadow-lg space-y-3.5 max-w-[560px] text-xs leading-normal ${currentTheme.borderClass} ${currentTheme.fontClass}`}
    >
      {/* Compact Header */}
      <div className={`p-3.5 rounded-xl text-white flex items-center justify-between gap-3 ${currentTheme.headerBg}`}>
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-xl bg-white/20 border border-white/40 shrink-0">
            <LabMedixLogo logoUrl={company.logoUrl} variant="monogram" size="md" theme="white" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-tight text-white leading-tight">
              {hospitalName}
            </h2>
            <p className="text-[10px] text-teal-100 font-medium">{hospitalTagline}</p>
            <p className="text-[9px] text-teal-200 font-mono">24x7: {helplineNumber}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="px-2 py-0.5 rounded bg-black/40 border border-white/30 text-[9px] font-mono font-bold text-white uppercase">
            A5 OPD Rx
          </span>
          <strong className="font-mono text-xs block text-white mt-1 font-black">{encounter.encounterNo}</strong>
          <span className="text-[9px] text-teal-100 opacity-90 block">{formatDateTime(encounter.date)}</span>
        </div>
      </div>

      {/* Doctor & Patient Split Bar */}
      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
        <div>
          <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Consulting Specialist:</span>
          <strong className="text-slate-900 font-black block text-xs">{encounter.doctorName}</strong>
          <span className="text-[10px] text-teal-700 font-bold">{encounter.doctorSpeciality} ({encounter.department})</span>
          <span className="text-[9px] text-slate-500 font-mono block">Reg: {encounter.doctorRegNo}</span>
        </div>
        <div className="border-l pl-2 border-slate-200">
          <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Patient Profile:</span>
          <strong className="text-slate-900 font-black block text-xs">{encounter.patientName}</strong>
          <span className="text-[10px] text-slate-700">{patient?.age || '54'} Yrs / {patient?.gender || 'Male'} • Blood: {patient?.bloodGroup || 'O+'}</span>
          <span className="text-[9px] text-slate-500 font-mono block">UHID: {encounter.patientId} • {activeMembership?.name || 'Standard'}</span>
        </div>
      </div>

      {/* Vitals Telemetry (If enabled) */}
      {options.showVitals && encounter.vitals && (
        <div className="grid grid-cols-6 gap-1.5 p-2 rounded-xl bg-slate-100 border border-slate-200 text-center text-[10px]">
          <div>
            <span className="text-[8.5px] text-slate-500 font-bold block">BP</span>
            <strong className="font-mono text-[11px]">{encounter.vitals.bpSystolic || 120}/{encounter.vitals.bpDiastolic || 80}</strong>
          </div>
          <div>
            <span className="text-[8.5px] text-slate-500 font-bold block">PULSE</span>
            <strong className="font-mono text-[11px] text-rose-600">{encounter.vitals.pulseRate || 74}</strong>
          </div>
          <div>
            <span className="text-[8.5px] text-slate-500 font-bold block">TEMP</span>
            <strong className="font-mono text-[11px] text-amber-600">{encounter.vitals.temperature || 98.4}°F</strong>
          </div>
          <div>
            <span className="text-[8.5px] text-slate-500 font-bold block">SPO2</span>
            <strong className="font-mono text-[11px] text-teal-600">{encounter.vitals.spo2 || 99}%</strong>
          </div>
          <div>
            <span className="text-[8.5px] text-slate-500 font-bold block">SUGAR</span>
            <strong className="font-mono text-[11px] text-purple-600">{encounter.vitals.bloodSugar || 110}</strong>
          </div>
          <div>
            <span className="text-[8.5px] text-slate-500 font-bold block">BMI</span>
            <strong className="font-mono text-[11px] text-emerald-600">{encounter.vitals.bmi || '24.2'}</strong>
          </div>
        </div>
      )}

      {/* Diagnoses summary */}
      {options.includeDiagnosisICD && encounter.diagnoses && encounter.diagnoses.length > 0 && (
        <div className="px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[10.5px] text-emerald-900 flex items-center justify-between">
          <span><strong>Diagnosis (ICD-10):</strong> {encounter.diagnoses.join(', ')}</span>
          {encounter.chiefComplaints && encounter.chiefComplaints.length > 0 && (
            <span className="text-[9.5px] text-emerald-700 italic">Sx: {encounter.chiefComplaints.join(', ')}</span>
          )}
        </div>
      )}

      {/* ℞ Prescribed Medications */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between border-b pb-1">
          <div className="flex items-center gap-1 text-teal-900 font-black text-xs uppercase tracking-wide">
            <span className="text-lg font-serif font-black text-teal-600">℞</span>
            <span>Prescribed Regimen</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">{encounter.medications.length} Drug(s)</span>
        </div>

        <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden text-[10.5px]">
          <thead className={`text-white uppercase text-[9.5px] font-bold ${currentTheme.tableHeadBg}`}>
            <tr>
              <th className="p-2">Drug &amp; Salt</th>
              <th className="p-2">Dose</th>
              <th className="p-2">Schedule</th>
              <th className="p-2">Duration</th>
              <th className="p-2">Instructions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {encounter.medications.map((m: PrescribedMedication, idx: number) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-2">
                  <strong className="text-slate-900 block font-bold text-[11px]">{m.name}</strong>
                  {options.showSalts && m.composition && (
                    <span className="text-[9px] text-teal-700 italic block">{m.composition}</span>
                  )}
                </td>
                <td className="p-2 font-mono font-bold">{m.dosage}</td>
                <td className="p-2">
                  <strong className="text-teal-700 font-mono">{m.frequency}</strong>
                  <span className="text-[9px] text-slate-500 block">({m.timing})</span>
                </td>
                <td className="p-2 font-mono font-bold">{m.duration}</td>
                <td className="p-2 text-[9.5px] text-slate-600">{m.instructions || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Labs & Advice */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        {encounter.labOrders && encounter.labOrders.length > 0 && (
          <div className="p-2 rounded-lg bg-purple-50/70 border border-purple-200">
            <span className="font-bold text-purple-900 block mb-1">🔬 Advised Labs:</span>
            <div className="space-y-0.5">
              {encounter.labOrders.map((lo: OrderedLabTest, i: number) => (
                <div key={i} className="text-purple-950 font-medium">• {lo.testName}</div>
              ))}
            </div>
          </div>
        )}

        {options.showAdvice && encounter.dietAndAdvice && encounter.dietAndAdvice.length > 0 && (
          <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200">
            <span className="font-bold text-amber-900 block mb-1">🥗 Clinical Advice:</span>
            <div className="space-y-0.5 text-amber-950 font-medium">
              {encounter.dietAndAdvice.map((a: string, i: number) => (
                <div key={i}>• {a}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Follow-up & Footer */}
      {options.includeFollowupSlot && (
        <div className="p-2 rounded-lg bg-amber-50 border border-amber-300 flex justify-between items-center text-[10.5px] text-amber-900">
          <div>
            <strong>Next Follow-up:</strong> {formatDate(encounter.followUpDate || '')} ({encounter.followUpDays || 14} Days)
          </div>
          <div className="font-bold text-amber-800">
            {appointmentSlotLabel} ({preferredTimeLabel})
          </div>
        </div>
      )}

      {/* Signature & Seal */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[10px]">
        <div className="flex items-center gap-2">
          {options.showQrCode && qrCodeUrl && (
            <img src={qrCodeUrl} alt="e-Rx QR" className="w-10 h-10 border border-slate-300 p-0.5 bg-white rounded" />
          )}
          <div>
            <div className="flex items-center gap-1 font-bold text-teal-800 text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>LabMedix EMR Signed</span>
            </div>
            <span className="font-mono text-[8.5px] text-slate-500">{securityHash}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="font-serif italic font-black text-sm text-slate-900">{encounter.doctorName}</div>
          <div className="border-t border-slate-800 pt-0.5 text-[9.5px]">
            <strong>{encounter.doctorName}</strong> ({encounter.doctorRegNo})
          </div>
        </div>
      </div>
    </div>
  );
};
