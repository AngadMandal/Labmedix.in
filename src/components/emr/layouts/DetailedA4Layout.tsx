import React from 'react';
import { PrescriptionLayoutProps } from './smartLayoutTypes';
import { THEME_CONFIGS } from './themeConfigs';
import { formatDateTime, formatDate } from '../../../utils/formatters';
import { LabMedixLogo } from '../../common/LabMedixLogo';
import { PrescribedMedication, OrderedLabTest } from '../../../types';
import {
  Building2,
  Calendar,
  ShieldCheck,
  Activity,
  HeartPulse,
  Thermometer,
  Wind,
  Droplets,
  Scale,
  Crown,
  Pill,
  FlaskConical,
  CheckCheck,
  MapPin,
  PhoneCall
} from 'lucide-react';

export const DetailedA4Layout: React.FC<PrescriptionLayoutProps> = ({
  encounter,
  patient,
  activeCard,
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
  hospitalAddress
}) => {
  const currentTheme = THEME_CONFIGS[theme] || THEME_CONFIGS.apollo_modern;

  return (
    <div
      className={`p-6 sm:p-9 rounded-3xl border-2 shadow-2xl space-y-5 relative overflow-hidden transition-all ${currentTheme.bgClass} ${currentTheme.borderClass} ${currentTheme.fontClass}`}
    >
      {/* Top Header Banner with Prominent Logo & Title */}
      <div className={`p-5 sm:p-6 rounded-2xl text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${currentTheme.headerBg}`}>
        <div className="flex items-center gap-4">
          <div className="p-1.5 rounded-2xl bg-white/15 backdrop-blur-md border-2 border-white/30 shadow-md shrink-0 flex items-center justify-center">
            <LabMedixLogo logoUrl={company.logoUrl} variant="monogram" size="xl" theme="white" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-tight text-white flex items-center gap-2 leading-tight">
              <Building2 className="w-5 h-5 opacity-90 text-teal-300 shrink-0" />
              {hospitalName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-bold text-teal-200">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-white font-mono">
                ISO 9001:2015 ACCREDITED
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/25 border border-emerald-300/50 text-emerald-100 font-mono">
                NABH STANDARDS
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/25 border border-cyan-300/50 text-cyan-100 font-mono">
                DIAGNOSTIC LABS
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-teal-100 font-mono flex flex-wrap items-center gap-2.5 pt-0.5 font-medium">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 opacity-80" />
                {hospitalAddress}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-bold text-white bg-black/20 px-2 py-0.5 rounded-md">
                <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
                24x7 Helpline: {helplineNumber}
              </span>
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className="px-3 py-1 rounded-lg bg-black/40 border border-white/30 text-white font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider inline-block">
            {encounter.status === 'corrected' ? 'CORRECTED CLINICAL Rx' : 'OFFICIAL CLINICAL Rx'}
          </span>
          <strong className="font-mono text-base sm:text-lg text-white block mt-1.5 font-black">{encounter.encounterNo}</strong>
          <span className="text-xs text-teal-100 font-mono opacity-95">{formatDateTime(encounter.date)}</span>
        </div>
      </div>

      {/* Doctor Info Card */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between gap-3 ${currentTheme.cardBg}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-600/15 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-2xl border-2 border-teal-500/30 shrink-0">
            🩺
          </div>
          <div>
            <strong className="text-base sm:text-lg font-black text-slate-900 block leading-tight">
              {encounter.doctorName}
            </strong>
            <span className="text-xs sm:text-sm font-bold text-teal-700">
              {encounter.doctorSpeciality}
            </span>
          </div>
        </div>
        <div className="text-left sm:text-right text-xs sm:text-sm">
          <span className="text-slate-600 block">Department: <strong className="text-slate-900">{encounter.department}</strong> • OPD Room #104</span>
          <span className="font-mono text-slate-500 text-xs font-bold">Council Reg. No: <strong className="text-slate-900">{encounter.doctorRegNo}</strong> (MCI / WBMC)</span>
        </div>
      </div>

      {/* Patient Smart Profile Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
        <div>
          <span className="text-slate-400 text-[10.5px] uppercase font-bold block">Patient Name</span>
          <strong className="text-slate-900 font-black text-sm sm:text-base">{encounter.patientName}</strong>
        </div>
        <div>
          <span className="text-slate-400 text-[10.5px] uppercase font-bold block">UHID / NFC Card</span>
          <span className="font-mono text-xs sm:text-sm font-bold">{encounter.patientId} • <strong className="text-teal-700">{activeCard?.cardNumber || 'NFC Active'}</strong></span>
        </div>
        <div>
          <span className="text-slate-400 text-[10.5px] uppercase font-bold block">Age / Gender / Blood</span>
          <strong className="text-xs sm:text-sm">{patient?.age || '54'} Yrs / {patient?.gender || 'Male'} • ({patient?.bloodGroup || 'O+'})</strong>
        </div>
        <div>
          <span className="text-slate-400 text-[10.5px] uppercase font-bold block">Health Card Tier</span>
          <strong className="text-teal-800 text-xs sm:text-sm font-black flex items-center gap-1">
            <Crown className="w-4 h-4 text-amber-500" />
            {activeMembership?.name || 'Gold Privilege'}
          </strong>
        </div>
      </div>

      {/* Clinical Vitals Telemetry (If enabled) */}
      {options.showVitals && encounter.vitals && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
              <Activity className="w-3 h-3 text-blue-500" /> BP
            </div>
            <strong className="font-mono text-sm sm:text-base block text-slate-900 mt-1 font-black">
              {encounter.vitals.bpSystolic || 120}/{encounter.vitals.bpDiastolic || 80}
            </strong>
            <span className="text-[9px] text-slate-500 font-bold">mmHg</span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
              <HeartPulse className="w-3 h-3 text-rose-500" /> Pulse
            </div>
            <strong className="font-mono text-sm sm:text-base block text-rose-600 mt-1 font-black">
              {encounter.vitals.pulseRate || 74}
            </strong>
            <span className="text-[9px] text-slate-500 font-bold">bpm</span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
              <Thermometer className="w-3 h-3 text-amber-500" /> Temp
            </div>
            <strong className="font-mono text-sm sm:text-base block text-amber-600 mt-1 font-black">
              {encounter.vitals.temperature || 98.4}°F
            </strong>
            <span className="text-[9px] text-slate-500 font-bold">Afebrile</span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
              <Wind className="w-3 h-3 text-teal-500" /> SpO2
            </div>
            <strong className="font-mono text-sm sm:text-base block text-teal-600 mt-1 font-black">
              {encounter.vitals.spo2 || 99}%
            </strong>
            <span className="text-[9px] text-slate-500 font-bold">Optimal</span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
              <Droplets className="w-3 h-3 text-purple-500" /> Glucose
            </div>
            <strong className="font-mono text-sm sm:text-base block text-purple-600 mt-1 font-black">
              {encounter.vitals.bloodSugar || 110}
            </strong>
            <span className="text-[9px] text-slate-500 font-bold">mg/dL</span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
              <Scale className="w-3 h-3 text-emerald-500" /> Auto BMI
            </div>
            <strong className="font-mono text-sm sm:text-base block text-emerald-600 mt-1 font-black">
              {encounter.vitals.bmi || '24.2'}
            </strong>
            <span className="text-[9px] text-slate-500 font-bold">Normal</span>
          </div>
        </div>
      )}

      {/* TWO-COLUMN BODY LAYOUT */}
      <div className="flex gap-4">
        {/* LEFT SIDEBAR: Chief Complaints + Diagnoses */}
        <div className="flex flex-col gap-3 shrink-0" style={{ width: '210px', minWidth: '190px' }}>
          {/* Chief Complaints */}
          <div className="p-3.5 rounded-2xl bg-violet-50 border-2 border-violet-300 shadow-sm flex-1">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
                <Activity className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[10.5px] font-black uppercase text-violet-900 tracking-wide leading-tight">
                Chief Complaints
              </span>
            </div>
            {encounter.chiefComplaints && encounter.chiefComplaints.length > 0 ? (
              <ul className="list-none pl-0 space-y-1.5">
                {encounter.chiefComplaints.map((c: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] text-violet-950 font-semibold">
                    <span className="w-4 h-4 rounded-full bg-violet-200 text-violet-700 font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-slate-400 text-[11px] italic">Not recorded.</span>
            )}
          </div>

          {/* Diagnoses */}
          {options.includeDiagnosisICD && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 shadow-sm flex-1">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[10.5px] font-black uppercase text-emerald-900 tracking-wide leading-tight">
                  Clinical Diagnoses
                </span>
              </div>
              <span className="inline-block text-[9px] font-black bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full mb-2 tracking-wider">ICD-10 CODED</span>
              {encounter.diagnoses && encounter.diagnoses.length > 0 ? (
                <ul className="list-none pl-0 space-y-1.5">
                  {encounter.diagnoses.map((d: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-emerald-950 font-black">
                      <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-700 font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5">✓</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-slate-400 text-[11px] italic">Not diagnosed.</span>
              )}
            </div>
          )}

          {/* Quick Summary Box */}
          <div className="p-3 rounded-2xl bg-slate-100 border border-slate-300 text-center space-y-1.5">
            <span className="text-[10px] font-black uppercase text-slate-600 block tracking-wider">Summary</span>
            <div className="grid grid-cols-1 gap-1 text-[11px] font-bold text-slate-700">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><Pill className="w-3 h-3 text-teal-600" /> Drugs Rx</span>
                <span className="font-black text-teal-700 font-mono">{encounter.medications.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><FlaskConical className="w-3 h-3 text-purple-600" /> Lab Orders</span>
                <span className="font-black text-purple-700 font-mono">{encounter.labOrders?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-amber-600" /> Follow-up</span>
                <span className="font-black text-amber-700 font-mono">{encounter.followUpDays || 14}D</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT MAIN CONTENT */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Prescribed Medications Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b-2 pb-1.5">
              <div className="flex items-center gap-2 text-teal-900 font-black text-sm uppercase tracking-wide">
                <span className="text-2xl sm:text-3xl font-serif font-black text-teal-600">℞</span>
                <span>Prescribed Medications &amp; Therapeutic Regimen</span>
              </div>
              <span className="text-xs text-slate-500 font-mono font-bold">
                {encounter.medications.length} Drug(s) Prescribed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <thead className={`text-white uppercase text-[10.5px] sm:text-xs font-black ${currentTheme.tableHeadBg}`}>
                  <tr>
                    <th className="p-3 sm:p-3.5">Medicine Name &amp; Generic Salt</th>
                    <th className="p-3 sm:p-3.5">Dosage</th>
                    <th className="p-3 sm:p-3.5">Frequency &amp; Timing</th>
                    <th className="p-3 sm:p-3.5">Duration</th>
                    <th className="p-3 sm:p-3.5">Special Advice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800 bg-white text-xs sm:text-sm">
                  {encounter.medications.map((m: PrescribedMedication, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 sm:p-3.5">
                        <strong className="text-slate-900 text-sm sm:text-base block font-black">{m.name}</strong>
                        {options.showSalts && m.composition && (
                          <span className="text-xs text-teal-700 font-mono italic block mt-0.5 font-semibold">
                            🧪 Comp: {m.composition}
                          </span>
                        )}
                      </td>
                      <td className="p-3 sm:p-3.5 font-mono font-black text-sm">{m.dosage}</td>
                      <td className="p-3 sm:p-3.5">
                        <strong className="text-teal-700 text-sm font-mono font-black">{m.frequency}</strong>
                        <span className="text-xs text-teal-600 block font-bold">({m.timing})</span>
                      </td>
                      <td className="p-3 sm:p-3.5 font-mono font-bold text-sm">{m.duration}</td>
                      <td className="p-3 sm:p-3.5 text-xs text-slate-600 font-medium">{m.instructions || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Diagnostic Orders & Lifestyle Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Labs */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-purple-600" />
                  Diagnostic Investigations:
                </span>
                <span className="text-[10px] font-bold text-teal-700 font-mono bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  {activeMembership ? activeMembership.labDiscount + '% Card Disc.' : 'Cashless'}
                </span>
              </div>
              {encounter.labOrders && encounter.labOrders.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {encounter.labOrders.map((lo: OrderedLabTest, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 shadow-2xs">
                      {lo.testName}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 text-xs italic">No diagnostic pathology ordered.</span>
              )}
            </div>

            {/* Diet & Advice */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                🥗 Dietary &amp; Lifestyle Guidelines:
              </span>
              {options.showAdvice && encounter.dietAndAdvice && encounter.dietAndAdvice.length > 0 ? (
                <ul className="list-disc pl-5 text-xs text-slate-800 space-y-1 font-medium">
                  {encounter.dietAndAdvice.map((a: string, i: number) => <li key={i}>{a}</li>)}
                </ul>
              ) : (
                <span className="text-slate-400 text-xs italic">Maintain healthy balanced diet and hydration.</span>
              )}
            </div>
          </div>

          {/* Follow-up Card */}
          {options.includeFollowupSlot && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-50 to-amber-50/50 border-2 border-amber-400 text-amber-950 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black uppercase text-amber-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  Confirmed Follow-up Appointment Slot
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-600 text-white uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <CheckCheck className="w-3.5 h-3.5" />
                  CONFIRMED APPOINTMENT
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm pt-1">
                <div>
                  <span className="text-amber-800/80 text-[11px] block font-bold">Appointment Date</span>
                  <strong className="text-amber-950 font-mono text-sm font-black">{formatDate(encounter.followUpDate || '')} ({encounter.followUpDays || 14} Days)</strong>
                </div>
                <div>
                  <span className="text-amber-800/80 text-[11px] block font-bold">Preferred Slot</span>
                  <strong className="text-amber-950 font-bold">{appointmentSlotLabel}</strong>
                </div>
                <div>
                  <span className="text-amber-800/80 text-[11px] block font-bold">Time &amp; Chamber</span>
                  <strong className="text-amber-900 font-mono text-sm font-black">{preferredTimeLabel} • OPD Room #104</strong>
                </div>
              </div>
            </div>
          )}

          {/* Seal & Doctor Signature */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-slate-200">
            <div className="flex items-center gap-3">
              {options.showQrCode && qrCodeUrl && (
                <img src={qrCodeUrl} alt="e-Rx QR" className="w-12 h-12 border border-slate-300 p-0.5 bg-white rounded-lg shadow-2xs" />
              )}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 font-bold">
                <div className="flex items-center gap-1.5 text-teal-700 font-black">
                  <ShieldCheck className="w-4 h-4" />
                  <span>LABMEDIX EMR VERIFIED SEAL</span>
                </div>
                <span className="font-mono text-[9px] text-slate-500 block mt-0.5">SHA-256 Hash: {securityHash}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="font-serif italic text-xl text-slate-900 font-black">
                {encounter.doctorName}
              </div>
              <div className="border-t-2 border-slate-900 pt-1.5 text-xs sm:text-sm font-bold text-slate-900">
                <strong>{encounter.doctorName}</strong>
                <span className="text-xs text-slate-500 font-normal block font-mono">Council Reg. No: {encounter.doctorRegNo} (MCI / WBMC)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
