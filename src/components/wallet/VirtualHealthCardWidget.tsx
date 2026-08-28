import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';
import { LabMedixLogo } from '../common/LabMedixLogo';
import { CompanyProfile } from '../../types';
import { Wifi, ShieldCheck, RotateCcw, Heart, Activity, Phone, AlertCircle } from 'lucide-react';

interface VirtualHealthCardWidgetProps {
  balance: number;
  totalCredits: number;
  totalDebits: number;
  company?: CompanyProfile;
  holderName?: string;
  patientId?: string;
  cardNumber?: string;
  bloodGroup?: string;
  emergencyPhone?: string;
}

export const VirtualHealthCardWidget: React.FC<VirtualHealthCardWidgetProps> = ({
  balance,
  totalCredits,
  totalDebits,
  company,
  holderName = 'LABMEDIX PREPAID FLOAT',
  patientId = 'LMDX-HQ-FLOAT',
  cardNumber = '•••• •••• •••• 8842',
  bloodGroup = 'O+ POSITIVE',
  emergencyPhone
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const triggerHaptic = (pattern: number | number[] = [35, 25, 45]) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Safe fallback for environments without vibration permission
      }
    }
  };

  const handleCardFlip = () => {
    triggerHaptic(isFlipped ? 30 : [40, 20, 50]);
    setIsFlipped(prev => !prev);
  };

  const companyName = company?.name || 'LABMEDIX';
  const logoUrl = company?.logoUrl;
  const tagline = company?.tagline || 'HEALTH WALLET • ESCROW';

  return (
    <div className="relative w-full max-w-sm h-56 perspective-1200 select-none group cursor-pointer" onClick={handleCardFlip}>
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        initial={false}
        transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
        className="w-full h-full relative preserve-3d rounded-3xl shadow-2xl"
      >
        {/* ================= FRONT SIDE ================= */}
        <div className="absolute inset-0 backface-hidden rounded-3xl p-6 bg-gradient-to-tr from-slate-950 via-slate-900 to-teal-950 text-white shadow-2xl border-2 border-teal-500/50 overflow-hidden flex flex-col justify-between">
          {/* Holographic Refraction Sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400/15 to-transparent pointer-events-none -rotate-45 scale-150 group-hover:translate-x-full transition-transform duration-1000" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Top Header with Dynamic Company Logo */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <LabMedixLogo logoUrl={logoUrl} variant="monogram" size="sm" theme="white" />
              <div className="text-left">
                <span className="text-sm font-black tracking-wider uppercase block text-white leading-none">
                  {companyName}
                </span>
                <span className="text-[8.5px] text-teal-300 font-bold tracking-wider uppercase">
                  {tagline}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Wifi className="w-4 h-4 rotate-90 text-teal-300 animate-pulse" />
              <span className="text-[8px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30">
                NFC PASS
              </span>
            </div>
          </div>

          {/* Golden EMV Smart Chip & Balance */}
          <div className="relative z-10 flex items-center justify-between my-auto">
            {/* Gold EMV Chip */}
            <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 border border-amber-500 shadow-md flex items-center justify-center p-1">
              <div className="w-full h-full border border-amber-950/40 rounded-xs flex items-center justify-center">
                <div className="w-3 h-3 border-r border-l border-amber-950/40" />
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                Available Float Balance
              </span>
              <div className="text-2xl font-black text-emerald-400 drop-shadow-md font-mono">
                {formatCurrency(balance)}
              </div>
            </div>
          </div>

          {/* Card Number & Holder */}
          <div className="relative z-10 space-y-1">
            <div className="text-xs font-mono tracking-widest text-slate-300">
              {cardNumber}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
              <span className="tracking-wider uppercase font-bold text-white truncate max-w-[170px]">
                {holderName}
              </span>
              <span className="text-teal-400 font-bold flex items-center gap-1 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                <RotateCcw className="w-3 h-3 animate-spin" /> Tap for Clinical Specs
              </span>
            </div>
          </div>
        </div>

        {/* ================= BACK SIDE ================= */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl p-5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white shadow-2xl border-2 border-emerald-500/50 overflow-hidden flex flex-col justify-between">
          {/* HiCo Magnetic Stripe */}
          <div className="w-full h-7 bg-black -mx-5 px-5 flex items-center justify-between border-b border-slate-800">
            <span className="text-[7.5px] font-mono text-emerald-400 font-bold uppercase flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" /> CLINICAL DETAILS & RECONCILED ESCROW
            </span>
            <span className="text-[7.5px] font-mono text-rose-300 font-bold flex items-center gap-0.5">
              <Heart className="w-2.5 h-2.5 fill-current text-rose-400" /> {bloodGroup}
            </span>
          </div>

          {/* Security & Clinical Specs */}
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700">
              <div>
                <span className="text-[8px] text-slate-400 uppercase font-mono block">Patient Reference</span>
                <strong className="text-xs font-mono text-teal-300">{patientId}</strong>
              </div>
              <div className="text-right">
                <span className="text-[8px] text-slate-400 uppercase font-mono block">Emergency Helpline</span>
                <strong className="text-xs font-mono text-amber-300">{emergencyPhone || company?.helpline || '1800-889-9911'}</strong>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-teal-950/40 border border-teal-500/30 text-[9px] text-slate-200 leading-tight space-y-1">
              <div className="flex items-center justify-between font-bold text-teal-300">
                <span>🩺 Clinical Clearances:</span>
                <span className="text-emerald-400">Cashless Verified</span>
              </div>
              <p>• Pre-approved OPD, Diagnostics & Pharmacy Escrow Settlement.</p>
              <p>• Baseline Vitals: BP 120/80 mmHg | Pulse 72 bpm | SpO2 98%.</p>
            </div>
          </div>

          {/* Bottom Stamp */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[9px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Reconciled Escrow
            </span>
            <span className="text-teal-300 font-bold flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Tap to Flip Back
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
