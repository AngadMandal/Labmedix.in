import React, { useRef } from 'react';
import { CampAttendee, HealthCamp, NgoPartner } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { Printer, X, Heart, Activity, Pill, Stethoscope, QrCode } from 'lucide-react';

interface CampAttendeePrintSlipProps {
  isOpen: boolean;
  onClose: () => void;
  attendee: CampAttendee | null;
  camp: HealthCamp | null;
  partner?: NgoPartner | null;
}

export const CampAttendeePrintSlip: React.FC<CampAttendeePrintSlipProps> = ({
  isOpen,
  onClose,
  attendee,
  camp,
  partner
}) => {
  const { companyProfile } = useSettings();
  const profile = companyProfile;
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !attendee || !camp) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Stethoscope className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold">Camp Health Token & Prescription Slip</h2>
              <p className="text-xs text-slate-400">
                Token {attendee.tokenNumber} — {attendee.fullName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Print Token Slip
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
            className="w-full max-w-xl bg-white p-6 rounded-xl shadow-xs border border-slate-200 text-slate-800 font-sans print:shadow-none print:border-none print:p-4"
          >
            {/* Top Bar */}
            <div className="border-b border-slate-300 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-black text-slate-900 leading-tight">
                  {profile.name || 'LABMEDIX'} RURAL HEALTH OUTREACH
                </h1>
                <p className="text-[11px] text-slate-600 font-medium">
                  Sponsored By: <span className="font-bold text-emerald-800">{camp.ngoPartnerName}</span>
                </p>
                <p className="text-[10px] text-slate-500">
                  Venue: {camp.venueName}, {camp.villageOrPanchayat}
                </p>
              </div>
              <div className="text-right">
                <div className="px-3 py-1 bg-emerald-700 text-white rounded-lg font-mono font-black text-lg">
                  {attendee.tokenNumber}
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  {camp.campDate}
                </p>
              </div>
            </div>

            {/* Patient Info Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">Patient Name:</span>{' '}
                <span className="font-bold text-slate-900 text-sm block">{attendee.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500">Age / Gender:</span>{' '}
                <span className="font-bold text-slate-900 block">{attendee.age} Yrs / {attendee.gender.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-slate-500">Phone:</span>{' '}
                <span className="font-mono block">{attendee.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500">Village / Area:</span>{' '}
                <span className="block">{attendee.villageOrLocality || 'Local Resident'}</span>
              </div>
              {attendee.cardNumber && (
                <div className="col-span-2 pt-1 border-t border-slate-200 flex justify-between items-center text-emerald-800">
                  <span className="font-medium">Free Health Card Issued:</span>
                  <span className="font-mono font-bold">{attendee.cardNumber}</span>
                </div>
              )}
            </div>

            {/* Vitals Summary */}
            <div className="border border-slate-200 rounded-xl p-3 mb-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600" /> Recorded Vitals
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Blood Pressure</span>
                  <span className="font-mono font-bold text-slate-900">
                    {attendee.vitals?.bpSystolic || '--'} / {attendee.vitals?.bpDiastolic || '--'} mmHg
                  </span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Blood Sugar (RBS)</span>
                  <span className="font-mono font-bold text-slate-900">
                    {attendee.vitals?.bloodSugar ? `${attendee.vitals.bloodSugar} mg/dL` : '--'}
                  </span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">SpO2 / Pulse</span>
                  <span className="font-mono font-bold text-slate-900">
                    {attendee.vitals?.spo2 || '--'}% / {attendee.vitals?.pulseRate || '--'} bpm
                  </span>
                </div>
              </div>
            </div>

            {/* Tests & Prescriptions */}
            <div className="border border-slate-200 rounded-xl p-3 mb-4 space-y-2.5 text-xs">
              {attendee.prescribedTests && attendee.prescribedTests.length > 0 && (
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Free Diagnostic Investigations:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {attendee.prescribedTests.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 font-medium">
                        ✓ {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {attendee.doctorObservations && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-700 block mb-0.5">Doctor Clinical Advice:</span>
                  <p className="text-slate-800 italic bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                    "{attendee.doctorObservations}"
                  </p>
                </div>
              )}

              {attendee.freeMedicinesDispensed && (
                <div className="pt-2 border-t border-slate-100 flex items-start gap-2">
                  <Pill className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-700">Free Camp Medicines Dispensed:</span>
                    <p className="text-slate-800 font-medium">{attendee.freeMedicinesDispensed}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-[10px] text-slate-500">
              <div>
                <p>On-Duty Camp Medical Officer</p>
                <p className="font-semibold text-slate-700">{camp.assignedDoctorNames?.[0] || 'Medical Officer'}</p>
              </div>
              <div className="text-right">
                <p className="font-mono">Helpline: {profile.phone || profile.helpline || '1800-000-0000'}</p>
                <p className="text-emerald-700 font-bold">100% Free Rural Welfare Initiative</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
