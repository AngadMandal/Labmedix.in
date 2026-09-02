import React from 'react';
import { PrescriptionLayoutProps } from './smartLayoutTypes';
import { formatDate, formatDateTime } from '../../../utils/formatters';
import { PrescribedMedication, OrderedLabTest } from '../../../types';

export const ThermalSlipLayout: React.FC<PrescriptionLayoutProps> = ({
  encounter,
  patient,
  activeCard,
  activeMembership,
  company,
  securityHash,
  qrCodeUrl,
  options,
  appointmentSlotLabel,
  preferredTimeLabel,
  helplineNumber,
  hospitalName,
  hospitalTagline,
  hospitalAddress
}) => {
  const is58mm = options.thermalWidth === '58mm';
  const widthClass = is58mm ? 'max-w-[280px]' : 'max-w-[340px]';

  return (
    <div
      className={`mx-auto bg-white text-black p-4 border border-dashed border-slate-400 shadow-lg font-mono text-[11px] leading-tight ${widthClass}`}
      style={{ fontFamily: '"Courier New", Courier, monospace, sans-serif' }}
    >
      {/* Thermal Header Band */}
      <div className="text-center pb-2 border-b border-dashed border-black">
        <div className="font-black text-sm tracking-wider uppercase">{hospitalName}</div>
        <div className="text-[9px] text-gray-700 mt-0.5">{hospitalTagline}</div>
        <div className="text-[8.5px] text-gray-600 mt-0.5">{hospitalAddress}</div>
        <div className="text-[9px] font-bold mt-1">24x7 HELPLINE: {helplineNumber}</div>
        <div className="text-[9px] text-gray-600">{company.website || 'www.labmedix.org'}</div>
      </div>

      {/* Prescription Classification & Token */}
      <div className="py-2 border-b border-dashed border-black flex justify-between items-center text-[10px]">
        <div>
          <span className="font-bold uppercase">OPD PRESCRIPTION</span>
          <div className="text-[9px] text-gray-600">{formatDateTime(encounter.date)}</div>
        </div>
        <div className="text-right">
          <span className="font-bold text-xs">#{encounter.encounterNo}</span>
          <div className="text-[9px]">ROOM #104</div>
        </div>
      </div>

      {/* Doctor Info */}
      <div className="py-1.5 border-b border-dashed border-black">
        <div className="font-bold text-xs">{encounter.doctorName}</div>
        <div className="text-[9.5px]">{encounter.doctorSpeciality} • {encounter.department}</div>
        <div className="text-[8.5px] text-gray-600">REG NO: {encounter.doctorRegNo}</div>
      </div>

      {/* Patient Info */}
      <div className="py-1.5 border-b border-dashed border-black space-y-0.5 text-[10px]">
        <div className="flex justify-between">
          <span>PT: <strong>{encounter.patientName}</strong></span>
          <span>{patient?.age || '54'}Y / {patient?.gender || 'M'}</span>
        </div>
        <div className="flex justify-between text-[9px] text-gray-700">
          <span>UHID: {encounter.patientId}</span>
          <span>CARD: {activeCard?.cardNumber || 'NFC-ACTIVE'}</span>
        </div>
        {activeMembership && (
          <div className="text-[8.5px] font-bold text-gray-800">
            TIER: {activeMembership.name.toUpperCase()} ({activeMembership.labDiscount}% DISC)
          </div>
        )}
      </div>

      {/* Vitals Telemetry (If enabled) */}
      {options.showVitals && encounter.vitals && (
        <div className="py-1.5 border-b border-dashed border-black">
          <div className="text-[9px] font-bold uppercase tracking-wider mb-1">CLINICAL VITALS:</div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px]">
            <div>BP: <strong>{encounter.vitals.bpSystolic || 120}/{encounter.vitals.bpDiastolic || 80}</strong> mmHg</div>
            <div>PULSE: <strong>{encounter.vitals.pulseRate || 74}</strong> bpm</div>
            <div>TEMP: <strong>{encounter.vitals.temperature || 98.4}</strong> °F</div>
            <div>SPO2: <strong>{encounter.vitals.spo2 || 99}</strong>%</div>
            {encounter.vitals.bloodSugar && <div>RBS: <strong>{encounter.vitals.bloodSugar}</strong> mg/dL</div>}
            {encounter.vitals.bmi && <div>BMI: <strong>{encounter.vitals.bmi}</strong></div>}
          </div>
        </div>
      )}

      {/* Complaints & Diagnoses */}
      {options.includeDiagnosisICD && (
        <div className="py-1.5 border-b border-dashed border-black space-y-1">
          {encounter.chiefComplaints && encounter.chiefComplaints.length > 0 && (
            <div>
              <span className="text-[8.5px] font-bold uppercase text-gray-600 block">SYMPTOMS:</span>
              <div className="text-[9.5px]">{encounter.chiefComplaints.join(', ')}</div>
            </div>
          )}
          {encounter.diagnoses && encounter.diagnoses.length > 0 && (
            <div>
              <span className="text-[8.5px] font-bold uppercase text-gray-600 block">DIAGNOSIS (ICD-10):</span>
              <div className="text-[9.5px] font-bold">{encounter.diagnoses.join(', ')}</div>
            </div>
          )}
        </div>
      )}

      {/* ℞ MEDICINES LIST */}
      <div className="py-2 border-b border-dashed border-black">
        <div className="font-bold text-xs mb-1.5 flex items-center justify-between">
          <span>℞ PRESCRIBED MEDICINES:</span>
          <span className="text-[9px]">{encounter.medications.length} ITEMS</span>
        </div>

        <div className="space-y-2">
          {encounter.medications.map((m: PrescribedMedication, idx: number) => (
            <div key={idx} className="border-b border-dotted border-gray-300 pb-1.5 last:border-0 last:pb-0">
              <div className="flex items-start justify-between">
                <span className="font-bold text-[11px]">{idx + 1}. {m.name}</span>
                <span className="text-[10px] font-bold whitespace-nowrap ml-1">{m.dosage}</span>
              </div>
              {options.showSalts && m.composition && (
                <div className="text-[8.5px] text-gray-600 italic">Salt: {m.composition}</div>
              )}
              <div className="flex items-center justify-between text-[9.5px] font-bold mt-0.5">
                <span>Freq: {m.frequency} ({m.timing})</span>
                <span>Dur: {m.duration}</span>
              </div>
              {m.instructions && (
                <div className="text-[8.5px] text-gray-700 mt-0.5">Note: {m.instructions}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Diagnostic Tests (If any) */}
      {encounter.labOrders && encounter.labOrders.length > 0 && (
        <div className="py-1.5 border-b border-dashed border-black">
          <div className="font-bold text-[9.5px] uppercase mb-1">LAB INVESTIGATIONS ADVISED:</div>
          <div className="space-y-0.5 text-[9.5px]">
            {encounter.labOrders.map((lo: OrderedLabTest, i: number) => (
              <div key={i} className="flex justify-between">
                <span>• {lo.testName}</span>
                <span className="text-[8.5px] text-gray-600">({lo.category})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diet & Advice (If enabled) */}
      {options.showAdvice && encounter.dietAndAdvice && encounter.dietAndAdvice.length > 0 && (
        <div className="py-1.5 border-b border-dashed border-black">
          <div className="font-bold text-[9px] uppercase mb-0.5">ADVICE / INSTRUCTIONS:</div>
          <div className="text-[9px] text-gray-800 space-y-0.5">
            {encounter.dietAndAdvice.map((a: string, i: number) => (
              <div key={i}>- {a}</div>
            ))}
          </div>
        </div>
      )}

      {/* Follow-up Section */}
      {options.includeFollowupSlot && (
        <div className="py-1.5 border-b border-dashed border-black text-[9.5px]">
          <div className="font-bold uppercase">NEXT FOLLOW-UP:</div>
          <div>DATE: <strong>{formatDate(encounter.followUpDate || '')}</strong> ({encounter.followUpDays || 14} Days)</div>
          <div>SLOT: {appointmentSlotLabel} ({preferredTimeLabel})</div>
        </div>
      )}

      {/* QR Code & Verification Block */}
      <div className="pt-2 text-center space-y-1">
        {options.showQrCode && qrCodeUrl && (
          <div className="flex justify-center my-1">
            <img src={qrCodeUrl} alt="e-Rx QR" className="w-20 h-20 border border-black p-0.5 bg-white" />
          </div>
        )}
        <div className="text-[8px] font-mono break-all text-gray-600">
          HASH: {securityHash}
        </div>
        <div className="text-[8.5px] font-bold mt-1 uppercase">
          *** PHARMACY DISPENSING SLIP ***
        </div>
        <div className="text-[8px] text-gray-600">
          Electronically Signed by {encounter.doctorName}
        </div>
        <div className="text-[7.5px] text-gray-500 pt-1">
          Save Paper • Digital Records on LabMedix App
        </div>
      </div>
    </div>
  );
};
