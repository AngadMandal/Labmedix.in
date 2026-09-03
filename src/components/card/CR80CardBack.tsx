import { AuthService } from '../../services/authService';
import React from 'react';
import { Patient, HealthCard, Membership, CompanyProfile } from '../../types';
import { StorageService } from '../../services/storage';
import { Phone, Globe, Shield, Stethoscope, FlaskConical, Pill, Home, Lock, CheckCircle2, Users2, Crown, Wifi } from 'lucide-react';

interface CR80CardBackProps {
  patient: Patient;
  card: HealthCard;
  membership: Membership;
  company: CompanyProfile;
  scale?: number;
  id?: string;
  previewOnly?: boolean;
  showBleedGuides?: boolean;
  mousePosition?: { x: number; y: number } | null;
  onOpenFamilyModal?: () => void;
  maskCvv?: boolean;
}

export const CR80CardBack: React.FC<CR80CardBackProps> = ({
  patient,
  card,
  membership,
  company,
  scale = 1,
  id = 'cr80-back',
  previewOnly = false,
  showBleedGuides = false,
  mousePosition = null,
  onOpenFamilyModal,
  maskCvv: passedMaskCvv
}) => {
  const cfg = card?.designConfig || {};
  const currentUser = AuthService.getCurrentUser();
  const maskCvv = passedMaskCvv !== undefined ? passedMaskCvv : (currentUser ? currentUser.role !== 'super_admin' : false);
  const preset = cfg.preset || 'executive_navy';
  const material = cfg.material || 'gloss';
  const showFamilyBadge = cfg.showFamilyBadge !== false;

  // Check if patient belongs to a family group
  const families = StorageService.getFamilies();
  const family = families.find(f =>
    f.primaryPatientId === patient.id ||
    f.members.some(m => m.patientId === patient.id) ||
    patient.familyId === f.id
  );

  const isFamilyHead = family ? family.primaryPatientId === patient.id : false;
  const familyMemberCount = family ? family.members.length + 1 : 0;

  const themeStyles: Record<string, { bg: string; text: string; accent: string; border: string }> = {
    executive_navy: {
      bg: 'linear-gradient(135deg, #021226 0%, #062E5F 60%, #03132B 100%)',
      text: '#FFFFFF',
      accent: '#38BDF8',
      border: 'border-blue-500/40'
    },
    emerald_health: {
      bg: 'linear-gradient(135deg, #011712 0%, #054C38 60%, #02241C 100%)',
      text: '#FFFFFF',
      accent: '#6EE7B7',
      border: 'border-emerald-500/40'
    },
    royal_gold: {
      bg: 'linear-gradient(135deg, #0F0701 0%, #3B1602 60%, #150F08 100%)',
      text: '#FEF3C7',
      accent: '#FBBF24',
      border: 'border-amber-500/40'
    },
    platinum_elite: {
      bg: 'linear-gradient(135deg, #080C14 0%, #1A2436 60%, #020617 100%)',
      text: '#F8FAFC',
      accent: '#E2E8F0',
      border: 'border-slate-500/40'
    },
    clean_minimal: {
      bg: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 60%, #CBD5E1 100%)',
      text: '#0F172A',
      accent: '#0B4F9C',
      border: 'border-slate-300'
    },
    crimson_care: {
      bg: 'linear-gradient(135deg, #1A0107 0%, #700F2D 60%, #330310 100%)',
      text: '#FFFFFF',
      accent: '#FDA4AF',
      border: 'border-rose-500/40'
    }
  };

  const theme = themeStyles[preset] || themeStyles.executive_navy;

  return (
    <div
      id={id}
      style={{
        width: '500px',
        height: '315px',
        background: theme.bg,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        color: theme.text,
        boxShadow: '0 20px 45px rgba(0,0,0,0.35)'
      }}
      className={`relative rounded-[18px] select-none border ${theme.border} overflow-hidden flex flex-col justify-between ${
        material === 'metallic' ? 'metallic-shine' :
        material === 'hologram' ? 'hologram-shimmer' :
        material === 'matte' ? 'matte-finish' : ''
      }`}
    >
      {/* 3D Specular Light Follower */}
      {mousePosition && material !== 'matte' && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-200"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.18) 0%, transparent 60%)`,
            mixBlendMode: 'overlay'
          }}
        />
      )}

      {/* Safe Bleed Margins */}
      {showBleedGuides && (
        <div className="absolute inset-2 border-2 border-dashed border-red-400/70 rounded-[14px] pointer-events-none z-30 flex items-start justify-between p-1">
          <span className="text-[7px] font-mono bg-red-600 text-white px-1 rounded">SAFE 3mm ZONE</span>
          <span className="text-[7px] font-mono bg-red-600 text-white px-1 rounded">CR80 PVC BACK</span>
        </div>
      )}

      {/* 1. TOP: Magnetic Stripe */}
      <div>
        <div className="w-full h-11 bg-black shadow-inner flex items-center px-4 justify-between">
          <span className="text-[8px] font-mono text-slate-400 tracking-widest uppercase">HiCo 2750 Oe Magnetic Track 1/2/3</span>
          <span className="text-[8px] font-mono text-slate-500 font-bold">{card.verificationCode}</span>
        </div>

        {/* 2. Authorized Signature Panel & Security CVV Code */}
        <div className="px-5 mt-2 flex items-center gap-3">
          <div className="flex-1 h-7 bg-white rounded flex items-center px-3 border border-slate-300 justify-between shadow-inner">
            <span className="font-serif italic text-slate-800 text-[11px] select-none font-bold">
              {patient.fullName}
            </span>
            <span className="text-[7px] font-mono text-slate-400 uppercase">Authorized Signature</span>
          </div>

          <div className="h-7 px-3 bg-slate-900 text-white rounded flex items-center justify-center border border-slate-700 font-mono text-xs font-black shadow-sm gap-1">
            <span className="text-[7.5px] text-slate-400 font-bold uppercase">CVV:</span>
            {maskCvv ? (
              <span className="text-amber-400 font-mono tracking-widest flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5 text-amber-400" /> •••
              </span>
            ) : (
              <span className="text-amber-300">{card.cvv || (card.verificationCode ? card.verificationCode.slice(-3) : '821')}</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. FAMILY LINKAGE EMBEDDED BANNER ON CARD BACK */}
      {showFamilyBadge && family && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onOpenFamilyModal?.();
          }}
          className="mx-5 my-0.5 p-1.5 px-3 rounded-xl bg-gradient-to-r from-blue-950/80 via-indigo-950/80 to-blue-950/80 border border-blue-400/50 flex items-center justify-between text-[8.5px] cursor-pointer hover:border-amber-300 transition-all shadow-xs"
          title="Click to view Family Linkage Group Modal"
        >
          <div className="flex items-center gap-1.5 font-bold text-white">
            <Users2 className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-amber-200">Family Shield:</span>
            <strong className="text-white">{family.familyName}</strong>
            <span className="text-[7.5px] text-blue-300">({familyMemberCount} Covered)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[8px] font-bold">
            {isFamilyHead ? (
              <span className="px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 border border-amber-400/40 flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5 text-yellow-300" /> Head
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-200 border border-blue-400/40">
                Dependent
              </span>
            )}
            <span className="text-amber-300 text-[10px]">↗</span>
          </div>
        </div>
      )}

      {/* 4. 4 CORE HEALTHCARE PILLARS WITH LIVE DISCOUNTS */}
      <div className="px-5 py-0.5">
        <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-xl bg-black/35 border border-white/10 text-center">
          <div className="flex flex-col items-center">
            <Stethoscope className="w-3.5 h-3.5 text-blue-400 mb-0.5" />
            <span className="text-[8.5px] font-bold tracking-tight">OPD Doctor</span>
            <span className="text-[7.5px] text-emerald-300 font-black">{membership?.opdDiscount || 20}% Discount</span>
          </div>
          <div className="flex flex-col items-center">
            <FlaskConical className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
            <span className="text-[8.5px] font-bold tracking-tight">Diagnostics</span>
            <span className="text-[7.5px] text-emerald-300 font-black">{membership?.labDiscount || 20}% Discount</span>
          </div>
          <div className="flex flex-col items-center">
            <Pill className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
            <span className="text-[8.5px] font-bold tracking-tight">Pharmacy</span>
            <span className="text-[7.5px] text-emerald-300 font-black">{membership?.pharmacyDiscount || 10}% Discount</span>
          </div>
          <div className="flex flex-col items-center">
            <Home className="w-3.5 h-3.5 text-cyan-400 mb-0.5" />
            <span className="text-[8.5px] font-bold tracking-tight">Home Blood</span>
            <span className="text-[7.5px] text-emerald-300 font-black">{membership?.homeCollectionDiscount === 100 ? 'Free' : `${membership?.homeCollectionDiscount || 15}% Off`}</span>
          </div>
        </div>
      </div>

      {/* 5. Terms of Use & NFC Tag Identification */}
      <div className="px-5 text-[8px] opacity-85 space-y-0.5">
        <div className="flex items-center justify-between font-mono text-[7.5px] text-teal-300">
          <span className="flex items-center gap-1">
            <Wifi className="w-2.5 h-2.5 rotate-90" />
            NFC UID: {card.nfcUid || '04:E2:89:1A:B5:4C:80'}
          </span>
          <span className="text-slate-400">13.56 MHz ISO 14443-A</span>
        </div>
        <p>• Present this card, NFC tap, or QR at LABMEDIX front desk to redeem medical discounts.</p>
        <p>• Non-transferable. If found, please return to any LABMEDIX healthcare facility.</p>
      </div>

      {/* 6. Emergency Helpline & Organization Footer */}
      <div className="px-5 pb-3 pt-1.5 border-t border-white/15 flex items-center justify-between text-[9px]">
        <div className="flex items-center gap-1.5 font-bold">
          <Phone className="w-3 h-3 text-emerald-400" />
          <span>24x7 Helpline: <strong className="text-white">{company.helpline}</strong></span>
        </div>

        <div className="flex items-center gap-2 text-[8px] opacity-85 font-mono">
          <span>Reg: {company.registrationNo}</span>
          <span>•</span>
          <span>{company.website}</span>
        </div>
      </div>
    </div>
  );
};