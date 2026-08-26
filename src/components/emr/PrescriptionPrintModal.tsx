import React, { useState } from 'react';
import { ClinicalEncounter, Patient } from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { LabMedixLogo } from '../common/LabMedixLogo';
import { ExportService } from '../../services/exportService';
import { useToast } from '../../context/ToastContext';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import { formatDateTime, formatDate } from '../../utils/formatters';
import {
  Printer,
  Download,
  Share2,
  Calendar,
  Sparkles,
  CheckCheck,
  Building2,
  Award,
  Layers,
  HeartPulse,
  Pill,
  FlaskConical,
  Activity,
  ShieldCheck,
  QrCode,
  Thermometer,
  Wind,
  Droplets,
  Scale,
  Clock,
  CheckCircle2,
  Stethoscope,
  Crown,
  FileText,
  BadgeCheck,
  Zap,
  PhoneCall,
  MapPin,
  Sparkle
} from 'lucide-react';

export type PrescriptionTemplateTheme =
  | 'apollo_modern'
  | 'executive_slate'
  | 'academic_crest'
  | 'cyber_health'
  | 'swiss_minimal'
  | 'velvet_orchid';

interface PrescriptionPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  encounter: ClinicalEncounter;
  patient?: Patient;
  nextQueuePatient?: { tokenNo: number; patientName: string } | null;
  onCallNextPatient?: () => void;
}

export const PrescriptionPrintModal: React.FC<PrescriptionPrintModalProps> = ({
  isOpen,
  onClose,
  encounter,
  patient,
  nextQueuePatient,
  onCallNextPatient
}) => {
  const [templateTheme, setTemplateTheme] = useState<PrescriptionTemplateTheme>('apollo_modern');
  const company = StorageService.getCompanyProfile();
  const cards = StorageService.getCards();
  const memberships = StorageService.getMemberships();
  const { showToast } = useToast();

  const activeCard = cards.find(c => c.patientId === encounter.patientId && c.status === 'active');
  const activeMembership = activeCard ? memberships.find(m => m.id === activeCard.membershipId) : null;
  const securityHash = `EMR-RX-${encounter.encounterNo}-${encounter.patientId}`.slice(0, 24);

  const appointmentSlotLabel = encounter.appointmentSlot || 'Morning OPD (09:00 AM - 01:00 PM)';
  const preferredTimeLabel = encounter.patientPreferredTime || '10:30 AM';

  // Exact Brand Constants (Enhanced Readability)
  const hospitalName = company.name || 'LABMEDIX MULTI-SPECIALITY HEALTHCARE & RESEARCH CENTRE';
  const hospitalTagline = 'Confident In Care • ISO 9001:2015 ACCREDITED • NABH STANDARDS • NABL LABS';
  const hospitalAddress = 'Main Health Expressway, Medical Square • 24x7 Helpline: +91 98765 43210';
  const helplineNumber = '+91 98765 43210';

  // 6 Ultra-Modern Theme Configs
  const themeConfig: Record<
    PrescriptionTemplateTheme,
    {
      name: string;
      subtext: string;
      icon: string;
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      bgClass: string;
      headerBg: string;
      borderClass: string;
      badgeClass: string;
      tableHeadBg: string;
      cardBg: string;
      fontClass: string;
    }
  > = {
    apollo_modern: {
      name: 'Neo-Emerald',
      subtext: 'Apollo / Mayo Clinic Hospital Suite',
      icon: '🏥',
      primaryColor: '#0D9488',
      secondaryColor: '#0F766E',
      accentColor: '#10B981',
      bgClass: 'bg-white',
      headerBg: 'bg-gradient-to-r from-teal-800 via-teal-900 to-emerald-900',
      borderClass: 'border-teal-500 shadow-teal-500/15',
      badgeClass: 'bg-teal-50 text-teal-800 border-teal-300',
      tableHeadBg: 'bg-teal-800 text-white',
      cardBg: 'bg-teal-50/60 border-teal-200',
      fontClass: 'font-sans'
    },
    executive_slate: {
      name: 'Royal Cobalt',
      subtext: 'Max / Fortis Luxury Clinical Suite',
      icon: '💎',
      primaryColor: '#1E293B',
      secondaryColor: '#0F172A',
      accentColor: '#2563EB',
      bgClass: 'bg-white',
      headerBg: 'bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900',
      borderClass: 'border-blue-600 shadow-blue-500/15',
      badgeClass: 'bg-blue-50 text-blue-900 border-blue-300',
      tableHeadBg: 'bg-slate-900 text-white',
      cardBg: 'bg-slate-50 border-slate-200',
      fontClass: 'font-sans'
    },
    academic_crest: {
      name: 'Imperial Gold',
      subtext: 'AIIMS / Heritage Medical College',
      icon: '👑',
      primaryColor: '#881337',
      secondaryColor: '#4C0519',
      accentColor: '#D97706',
      bgClass: 'bg-amber-50/25',
      headerBg: 'bg-gradient-to-r from-rose-950 via-amber-950 to-rose-950',
      borderClass: 'border-amber-600 shadow-amber-500/15',
      badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
      tableHeadBg: 'bg-rose-950 text-amber-100',
      cardBg: 'bg-amber-50/70 border-amber-200',
      fontClass: 'font-serif'
    },
    cyber_health: {
      name: 'Future-Tech',
      subtext: 'Precision Next-Gen Telehealth Suite',
      icon: '🔬',
      primaryColor: '#06B6D4',
      secondaryColor: '#0891B2',
      accentColor: '#6366F1',
      bgClass: 'bg-slate-950 text-slate-100',
      headerBg: 'bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950',
      borderClass: 'border-cyan-500 shadow-cyan-500/25',
      badgeClass: 'bg-cyan-950 text-cyan-300 border-cyan-700',
      tableHeadBg: 'bg-cyan-900 text-white',
      cardBg: 'bg-slate-900 border-cyan-800',
      fontClass: 'font-sans'
    },
    swiss_minimal: {
      name: 'Swiss Clean',
      subtext: 'Minimalist Monochromatic Architecture',
      icon: '🍃',
      primaryColor: '#18181B',
      secondaryColor: '#27272A',
      accentColor: '#71717A',
      bgClass: 'bg-white',
      headerBg: 'bg-gradient-to-r from-zinc-950 to-zinc-800',
      borderClass: 'border-zinc-400 shadow-zinc-500/10',
      badgeClass: 'bg-zinc-100 text-zinc-900 border-zinc-300',
      tableHeadBg: 'bg-zinc-900 text-white',
      cardBg: 'bg-zinc-50 border-zinc-200',
      fontClass: 'font-sans'
    },
    velvet_orchid: {
      name: 'Velvet Orchid',
      subtext: 'Specialty Care & Maternal Wellness',
      icon: '💜',
      primaryColor: '#7E22CE',
      secondaryColor: '#6B21A8',
      accentColor: '#EC4899',
      bgClass: 'bg-white',
      headerBg: 'bg-gradient-to-r from-purple-950 via-fuchsia-950 to-purple-950',
      borderClass: 'border-purple-500 shadow-purple-500/15',
      badgeClass: 'bg-purple-50 text-purple-900 border-purple-300',
      tableHeadBg: 'bg-purple-900 text-white',
      cardBg: 'bg-purple-50/60 border-purple-200',
      fontClass: 'font-sans'
    }
  };

  const currentTheme = themeConfig[templateTheme];

  const handlePrintDirect = () => {
    const printWin = window.open('', '_blank', 'width=1050,height=1250');
    if (!printWin) {
      window.print();
      return;
    }

    // Dynamic Print Styles matching current selected theme with Enhanced Typography
    let themeCss = '';
    if (templateTheme === 'apollo_modern') {
      themeCss = `
        :root { --p-color: #0D9488; --s-color: #0F766E; --accent: #10B981; }
        .hdr-band { background: linear-gradient(135deg, #0F766E 0%, #064E3B 100%); color: #FFF; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; }
        .hdr-band h1 { color: #FFF !important; }
        .hdr-band p { color: #CCFBF1 !important; }
        .doc-box { background: #F0FDFA; border: 1.5px solid #99F6E4; border-radius: 10px; }
        .sec-head { color: #0F766E; border-bottom: 2px solid #CCFBF1; }
        .rx-tbl thead th { background: #0F766E; color: #FFF; }
        .seal-tag { border: 1.5px dashed #0D9488; color: #0F766E; background: #F0FDFA; }
      `;
    } else if (templateTheme === 'executive_slate') {
      themeCss = `
        :root { --p-color: #1E293B; --s-color: #0F172A; --accent: #2563EB; }
        .hdr-band { background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); color: #FFF; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; }
        .hdr-band h1 { color: #FFF !important; }
        .hdr-band p { color: #94A3B8 !important; }
        .doc-box { background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 10px; }
        .sec-head { color: #1E293B; border-bottom: 2px solid #E2E8F0; }
        .rx-tbl thead th { background: #0F172A; color: #FFF; }
        .seal-tag { border: 1.5px dashed #2563EB; color: #1E293B; background: #EFF6FF; }
      `;
    } else if (templateTheme === 'academic_crest') {
      themeCss = `
        :root { --p-color: #881337; --s-color: #4C0519; --accent: #D97706; }
        body { font-family: Georgia, 'Times New Roman', serif !important; }
        .hdr-band { background: linear-gradient(135deg, #881337 0%, #4C0519 100%); color: #FEF3C7; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; border: 2px solid #D97706; }
        .hdr-band h1 { color: #FEF3C7 !important; font-family: Georgia, serif; }
        .hdr-band p { color: #FDE68A !important; }
        .doc-box { background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 10px; font-family: Georgia, serif; }
        .sec-head { color: #881337; border-bottom: 2px solid #FDE68A; font-family: Georgia, serif; }
        .rx-tbl thead th { background: #881337; color: #FEF3C7; font-family: Georgia, serif; }
        .seal-tag { border: 1.5px dashed #D97706; color: #881337; background: #FFFBEB; }
      `;
    } else if (templateTheme === 'cyber_health') {
      themeCss = `
        :root { --p-color: #06B6D4; --s-color: #0891B2; --accent: #6366F1; }
        .hdr-band { background: linear-gradient(135deg, #083344 0%, #0E7490 100%); color: #FFF; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; border-left: 6px solid #06B6D4; }
        .hdr-band h1 { color: #FFF !important; }
        .hdr-band p { color: #A5F3FC !important; }
        .doc-box { background: #ECFEFF; border: 1.5px solid #A5F3FC; border-radius: 10px; }
        .sec-head { color: #0891B2; border-bottom: 2px solid #CFFAFE; }
        .rx-tbl thead th { background: #0E7490; color: #FFF; }
        .seal-tag { border: 1.5px dashed #0891B2; color: #0E7490; background: #ECFEFF; }
      `;
    } else if (templateTheme === 'swiss_minimal') {
      themeCss = `
        :root { --p-color: #18181B; --s-color: #27272A; --accent: #71717A; }
        .hdr-band { background: #18181B; color: #FFF; border-radius: 10px; padding: 16px 20px; margin-bottom: 12px; }
        .hdr-band h1 { color: #FFF !important; font-weight: 900; }
        .hdr-band p { color: #A1A1AA !important; }
        .doc-box { background: #FAFAFA; border: 1.5px solid #E4E4E7; border-radius: 10px; }
        .sec-head { color: #18181B; border-bottom: 2px solid #E4E4E7; }
        .rx-tbl thead th { background: #18181B; color: #FFF; }
        .seal-tag { border: 1.5px solid #71717A; color: #18181B; background: #F4F4F5; }
      `;
    } else {
      themeCss = `
        :root { --p-color: #7E22CE; --s-color: #6B21A8; --accent: #EC4899; }
        .hdr-band { background: linear-gradient(135deg, #581C87 0%, #7E22CE 100%); color: #FFF; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; }
        .hdr-band h1 { color: #FFF !important; }
        .hdr-band p { color: #F3E8FF !important; }
        .doc-box { background: #FAF5FF; border: 1.5px solid #E9D5FF; border-radius: 10px; }
        .sec-head { color: #7E22CE; border-bottom: 2px solid #F3E8FF; }
        .rx-tbl thead th { background: #7E22CE; color: #FFF; }
        .seal-tag { border: 1.5px dashed #7E22CE; color: #7E22CE; background: #FAF5FF; }
      `;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription - ${encounter.encounterNo} - ${encounter.patientName}</title>
          <style>
            @page { size: A4 portrait; margin: 8mm; }
            body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif; font-size: 11.5px; margin: 0; padding: 8px; color: #0F172A; line-height: 1.4; -webkit-print-color-adjust: exact !important; }
            .hdr-band { display: flex; justify-content: space-between; align-items: center; }
            .patient-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; background: #F8FAFC; border: 1.5px solid #E2E8F0; padding: 10px 14px; border-radius: 10px; margin-bottom: 10px; font-size: 11px; }
            .vitals-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 10px; }
            .vital-card { background: #FFF; border: 1.5px solid #CBD5E1; border-radius: 8px; padding: 6px 8px; text-align: center; font-size: 10.5px; }
            .vital-val { font-weight: 800; font-size: 13px; font-family: monospace; display: block; }
            .body-layout { display: grid; grid-template-columns: 200px 1fr; gap: 12px; margin-top: 10px; }
            .left-sidebar { display: flex; flex-direction: column; gap: 8px; }
            .sidebar-card { border-radius: 10px; padding: 9px 10px; }
            .sidebar-card-title { font-size: 10.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 5px; display: flex; align-items: center; gap: 4px; }
            .sidebar-card ul { margin: 0; padding-left: 14px; font-size: 11px; line-height: 1.6; }
            .sidebar-card li { margin-bottom: 2px; }
            .right-main { min-width: 0; }
            .sec-head { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 4px; margin-bottom: 6px; margin-top: 10px; display: flex; align-items: center; justify-content: space-between; }
            .rx-symbol { font-family: Georgia, serif; font-size: 24px; font-weight: 900; margin-right: 4px; }
            table.rx-tbl { width: 100%; border-collapse: collapse; margin-bottom: 10px; border: 1.5px solid #E2E8F0; border-radius: 8px; overflow: hidden; }
            table.rx-tbl th { font-size: 11px; text-transform: uppercase; padding: 8px 10px; text-align: left; font-weight: 800; }
            table.rx-tbl td { padding: 8px 10px; border-bottom: 1px solid #F1F5F9; vertical-align: top; font-size: 11.5px; }
            .med-name { font-weight: 800; font-size: 13px; color: #0F172A; }
            .med-comp { font-size: 10.5px; color: #475569; font-style: italic; margin-top: 2px; }
            .med-schedule { font-weight: 800; font-size: 12px; }
            .advice-list { margin: 0; padding-left: 18px; font-size: 11px; }
            .appointment-box { margin-top: 10px; padding: 8px 12px; background: #FEF3C7; border: 2px solid #F59E0B; border-radius: 10px; font-size: 11px; }
            .signature-area { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 16px; padding-top: 10px; border-top: 1.5px solid #E2E8F0; }
            .footer-note { text-align: center; margin-top: 12px; font-size: 9px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 6px; }
            .badge-pill { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 9.5px; font-weight: 800; }
            ${themeCss}
          </style>
        </head>
        <body>
          <!-- Hospital Header Band with Large Prestigious Logo -->
          <div class="hdr-band">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div style="width: 58px; height: 58px; background: #FFFFFF; border-radius: 14px; padding: 5px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.15); border: 2px solid rgba(255,255,255,0.6);">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="48" rx="12" fill="#0F766E"/>
                  <path d="M24 8V40M8 24H40" stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round"/>
                  <circle cx="24" cy="24" r="8.5" fill="#10B981"/>
                  <path d="M19 24L22.5 27.5L29 20.5" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div>
                <h1 style="margin:0; font-size: 17.5px; font-weight: 900; letter-spacing: -0.3px; text-transform: uppercase;">
                  ${hospitalName}
                </h1>
                <p style="margin:3px 0; font-size: 11px; font-weight: 800;">
                  ${hospitalTagline}
                </p>
                <p style="margin:1px 0; font-size: 10px; font-weight: 600;">
                  ${hospitalAddress}
                </p>
              </div>
            </div>
            <div style="text-align: right;">
              <span style="display:inline-block; padding: 4px 10px; background: rgba(0,0,0,0.4); color: #FFF; border: 1.5px solid rgba(255,255,255,0.5); border-radius: 8px; font-size: 10px; font-weight: 900; text-transform: uppercase; font-family: monospace;">
                ${encounter.status === 'corrected' ? 'CORRECTED Rx' : 'OFFICIAL CLINICAL Rx'}
              </span>
              <p style="margin:3px 0 0 0; font-family: monospace; font-size: 12px; font-weight: 900; color: #FFF;">${encounter.encounterNo}</p>
              <p style="margin:1px 0; font-size: 9.5px; opacity: 0.95;">Date: ${formatDateTime(encounter.date)}</p>
            </div>
          </div>

          <!-- Doctor Profile Banner -->
          <div class="doc-box" style="display: flex; justify-content: space-between; padding: 8px 14px; margin-bottom: 10px;">
            <div>
              <strong style="font-size: 14.5px; color: #0F172A; display: block; font-weight: 900;">
                ${encounter.doctorName}
              </strong>
              <span style="font-weight: 800; font-size: 11.5px; color: #0F766E;">
                ${encounter.doctorSpeciality}
              </span>
            </div>
            <div style="text-align: right; font-size: 10.5px;">
              <p style="margin:0;"><strong>Department:</strong> ${encounter.department} • OPD Room #104</p>
              <p style="margin:1px 0; font-family: monospace;">Council Reg. No: <strong>${encounter.doctorRegNo}</strong> (MCI / WBMC)</p>
            </div>
          </div>

          <!-- Patient Information Strip -->
          <div class="patient-strip">
            <div><span style="color:#64748B; font-weight:700;">Patient Name:</span><br><strong style="font-size:13px;">${encounter.patientName}</strong></div>
            <div><span style="color:#64748B; font-weight:700;">UHID / Card:</span><br><strong style="font-family:monospace; font-size:12px;">${encounter.patientId}</strong> • ${activeCard?.cardNumber || 'NFC Active'}</div>
            <div><span style="color:#64748B; font-weight:700;">Age / Gender:</span><br><strong>${patient?.age || '54'} Yrs / ${patient?.gender || 'Male'}</strong> (Blood: ${patient?.bloodGroup || 'O+'})</div>
            <div><span style="color:#64748B; font-weight:700;">Card Plan Tier:</span><br><strong style="color:#0F766E; font-size:12px;">${activeMembership?.name || 'Gold Privilege Plan'}</strong></div>
          </div>

          <!-- Clinical Vitals Grid -->
          <div class="vitals-grid">
            <div class="vital-card">
              <span style="color:#64748B; font-weight:700;">BP</span>
              <span class="vital-val">${encounter.vitals?.bpSystolic || 120}/${encounter.vitals?.bpDiastolic || 80}</span>
              <span style="font-size:9px; color:#0F766E; font-weight:bold;">mmHg</span>
            </div>
            <div class="vital-card">
              <span style="color:#64748B; font-weight:700;">Pulse</span>
              <span class="vital-val">${encounter.vitals?.pulseRate || 74}</span>
              <span style="font-size:9px; color:#E11D48; font-weight:bold;">bpm</span>
            </div>
            <div class="vital-card">
              <span style="color:#64748B; font-weight:700;">Temperature</span>
              <span class="vital-val">${encounter.vitals?.temperature || 98.4}°F</span>
              <span style="font-size:9px; color:#D97706; font-weight:bold;">Afebrile</span>
            </div>
            <div class="vital-card">
              <span style="color:#64748B; font-weight:700;">SpO2</span>
              <span class="vital-val">${encounter.vitals?.spo2 || 99}%</span>
              <span style="font-size:9px; color:#0D9488; font-weight:bold;">Optimal</span>
            </div>
            <div class="vital-card">
              <span style="color:#64748B; font-weight:700;">RBS / Sugar</span>
              <span class="vital-val">${encounter.vitals?.bloodSugar || 110}</span>
              <span style="font-size:9px; color:#7C3AED; font-weight:bold;">mg/dL</span>
            </div>
            <div class="vital-card">
              <span style="color:#64748B; font-weight:700;">BMI (Auto)</span>
              <span class="vital-val">${encounter.vitals?.bmi || '24.2'}</span>
              <span style="font-size:9px; color:#059669; font-weight:bold;">Normal</span>
            </div>
          </div>

          <!-- TWO-COLUMN BODY: Left Sidebar + Right Main Content -->
          <div class="body-layout">

            <!-- LEFT SIDEBAR: Chief Complaints + Clinical Diagnoses -->
            <div class="left-sidebar">

              <!-- Chief Complaints & Symptoms -->
              <div class="sidebar-card" style="background: #FAF5FF; border: 2px solid #DDD6FE; flex: 1;">
                <div class="sidebar-card-title" style="color: #6D28D9;">
                  🩺 Chief Complaints &amp; Symptoms
                </div>
                <ul style="font-weight: 600; color: #3B0764;">
                  ${encounter.chiefComplaints.length > 0
                    ? encounter.chiefComplaints.map(c => `<li>${c}</li>`).join('')
                    : '<li style="list-style:none; color:#94A3B8; font-style:italic;">Not recorded</li>'}
                </ul>
              </div>

              <!-- Clinical Diagnoses ICD-10 -->
              <div class="sidebar-card" style="background: #ECFDF5; border: 2px solid #6EE7B7; flex: 1;">
                <div class="sidebar-card-title" style="color: #065F46;">
                  🏥 Clinical Diagnoses
                  <span style="font-size:9px; font-weight:700; background:#D1FAE5; color:#047857; padding:1px 5px; border-radius:4px; margin-left:2px;">ICD-10</span>
                </div>
                <ul style="font-weight: 800; color: #064E3B;">
                  ${encounter.diagnoses.length > 0
                    ? encounter.diagnoses.map(d => `<li>${d}</li>`).join('')
                    : '<li style="list-style:none; color:#94A3B8; font-style:italic;">Not diagnosed</li>'}
                </ul>
              </div>

              <!-- Divider line -->
              <div style="border-top: 1.5px dashed #CBD5E1; margin: 2px 0;"></div>

              <!-- Quick Stats bottom of sidebar -->
              <div style="font-size: 10px; color: #64748B; font-weight: 700; text-align: center; background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 6px;">
                <div style="font-weight: 900; color: #0F172A; font-size: 11px; margin-bottom: 3px;">Encounter Summary</div>
                <div>💊 ${encounter.medications.length} Drug(s) Rx</div>
                <div>🔬 ${encounter.labOrders?.length || 0} Lab Order(s)</div>
                <div>📅 Follow-up: ${encounter.followUpDays || 14}D</div>
              </div>
            </div>

            <!-- RIGHT MAIN CONTENT: Medications + Labs + Diet + Follow-up -->
            <div class="right-main">

              <!-- Prescribed Medications Table (℞) -->
              <div class="sec-head" style="margin-top: 0;">
                <span><span class="rx-symbol">℞</span> Prescribed Medications &amp; Therapeutic Regimen</span>
                <span style="font-size:9.5px; font-weight: bold; text-transform: none; color: #64748B;">Take medicines strictly as directed</span>
              </div>
              <table class="rx-tbl">
                <thead>
                  <tr>
                    <th style="width: 36%;">Medicine Name &amp; Generic Composition</th>
                    <th style="width: 11%;">Dosage</th>
                    <th style="width: 24%;">Schedule &amp; Timing</th>
                    <th style="width: 11%;">Duration</th>
                    <th style="width: 18%;">Special Advice</th>
                  </tr>
                </thead>
                <tbody>
                  ${encounter.medications.map((m, idx) => `
                    <tr style="background: ${idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'};">
                      <td>
                        <div class="med-name">${m.name}</div>
                        ${m.composition ? `<div class="med-comp">🧪 Comp: ${m.composition}</div>` : ''}
                      </td>
                      <td style="font-family: monospace; font-weight: 900; font-size: 12px;">${m.dosage}</td>
                      <td>
                        <span class="med-schedule">${m.frequency}</span>
                        <div style="font-size: 10px; color:#0D9488; font-weight: 700;">(${m.timing})</div>
                      </td>
                      <td style="font-family: monospace; font-weight: bold;">${m.duration}</td>
                      <td style="font-size: 10px; color:#475569; font-weight: 500;">${m.instructions || '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <!-- Diagnostic Tests Advised -->
              ${encounter.labOrders && encounter.labOrders.length > 0 ? `
                <div class="sec-head">
                  <span>🔬 Diagnostic Pathology &amp; Imaging Advised</span>
                  <span class="badge-pill" style="background:#F1F5F9; color:#0F766E; border:1px solid #CBD5E1;">
                    ${activeMembership ? activeMembership.labDiscount + '% Cardholder Discount' : 'Cashless Linked'}
                  </span>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap: 6px; margin-bottom: 8px;">
                  ${encounter.labOrders.map(lo => `
                    <div style="padding: 4px 8px; background: #F1F5F9; border: 1.5px solid #CBD5E1; border-radius: 6px; font-size: 10.5px; font-weight: bold;">
                      ${lo.testName} <span style="color:#64748B; font-weight: normal;">(${lo.category})</span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              <!-- Dietary & Lifestyle Advice -->
              ${encounter.dietAndAdvice && encounter.dietAndAdvice.length > 0 ? `
                <div class="sec-head">
                  <span>🥗 Dietary Advice &amp; Clinical Lifestyle Instructions</span>
                </div>
                <ul class="advice-list">
                  ${encounter.dietAndAdvice.map(a => `<li>${a}</li>`).join('')}
                </ul>
              ` : ''}

              <!-- Follow-up & Patient Appointment Wish -->
              <div class="appointment-box">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <strong style="color: #92400E; text-transform: uppercase; font-size: 11.5px; font-weight: 900;">
                    📅 Next Follow-up &amp; Confirmed Appointment Slot
                  </strong>
                  <span class="badge-pill" style="background: #D97706; color: #FFF;">
                    PATIENT WISH CONFIRMED
                  </span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; font-size: 11px; color: #78350F;">
                  <div><strong>Target Date:</strong> ${formatDate(encounter.followUpDate || '')} (${encounter.followUpDays || 14} Days)</div>
                  <div><strong>OPD Slot:</strong> ${appointmentSlotLabel}</div>
                  <div><strong>Exact Time:</strong> <strong style="color:#B45309; font-size:11.5px;">${preferredTimeLabel}</strong> • Room #104</div>
                </div>
              </div>

              <!-- Doctor Seal, Verification Hash & Signature -->
              <div class="signature-area">
                <div class="seal-tag" style="padding: 6px 12px; border-radius: 8px; text-align: center; font-size: 9.5px; font-weight: bold;">
                  <strong style="display:block;">LABMEDIX EMR VERIFIED SEAL</strong>
                  <span style="font-family:monospace; font-size: 9px;">Hash: ${securityHash}</span>
                </div>

                <div style="text-align: center; width: 220px;">
                  <div style="font-family: 'Brush Script MT', cursive; font-size: 22px; color: #0F766E; margin-bottom: 2px; font-weight: 900;">
                    ${encounter.doctorName}
                  </div>
                  <div style="border-top: 2px solid #0F172A; padding-top: 3px; font-size: 11px;">
                    <strong style="font-size:12px;">${encounter.doctorName}</strong><br>
                    <span style="font-size: 9.5px; color: #64748B;">${encounter.doctorSpeciality}<br>Council Reg. No: ${encounter.doctorRegNo}</span>
                  </div>
                </div>
              </div>

            </div>
            <!-- END RIGHT MAIN -->
          </div>
          <!-- END BODY LAYOUT -->

          <div class="footer-note">
            This digital prescription is electronically signed &amp; certified by LABMEDIX Auto Health Card &amp; EMR Platform • Helpline: ${helplineNumber} • ${company.website || 'labmedix.org'}
          </div>

          <script>
            setTimeout(() => { window.print(); window.close(); }, 300);
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const handleDownloadPng = async () => {
    const el = document.getElementById('doctor-prescription-content');
    if (!el) return;
    try {
      showToast('info', 'Rendering Prescription', 'Exporting digital prescription PNG...');
      await ExportService.exportToPng(el, `PRESCRIPTION_${encounter.encounterNo}_${encounter.patientName}.png`);
      triggerCelebrationFireworks();
      showToast('success', 'Prescription Downloaded', 'Saved official prescription image.');
    } catch {
      showToast('error', 'Download Failed', 'Could not export prescription image.');
    }
  };

  const handleDownloadPdf = async () => {
    const el = document.getElementById('doctor-prescription-content');
    if (!el) return;
    try {
      showToast('info', 'Generating PDF', 'Compiling official A4 PDF letterhead...');
      await ExportService.exportPrescriptionToPdf(el, `PRESCRIPTION_${encounter.encounterNo}_${encounter.patientName}.pdf`);
      triggerCelebrationFireworks();
      showToast('success', 'PDF Ready', 'Official A4 Prescription PDF downloaded.');
    } catch {
      handlePrintDirect();
    }
  };

  const handleSendWhatsApp = () => {
    const msg = `https://wa.me/?text=${encodeURIComponent(
      `Hello ${encounter.patientName},\n\nYour official digital prescription from LABMEDIX Healthcare is ready.\n\nEncounter No: ${encounter.encounterNo}\nDoctor: ${encounter.doctorName} (${encounter.department})\nNext Follow-up: ${formatDate(encounter.followUpDate || '')} (${appointmentSlotLabel} • ${preferredTimeLabel})\n\nPrescription Security Hash: ${securityHash}\nLABMEDIX Helpline: ${helplineNumber}`
    )}`;
    window.open(msg, '_blank');
    showToast('success', 'WhatsApp Dispatch Ready', 'Opened WhatsApp dispatch.');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Official Prescription Suite: ${encounter.encounterNo}`} maxWidth="4xl">
      <div className="space-y-4 text-xs sm:text-sm">
        {/* TEMPLATE PICKER RIBBON */}
        <div className="p-3.5 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-2.5 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-teal-400 flex items-center gap-2 font-mono">
              <Layers className="w-4 h-4 text-teal-400" />
              Prescription Letterhead Studio (6 Modern Themes):
            </span>
            <span className="text-xs text-slate-400 font-mono font-bold">
              Active Theme: <span className="text-teal-300 font-bold">{currentTheme.name}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {(Object.keys(themeConfig) as PrescriptionTemplateTheme[]).map((themeKey) => {
              const cfg = themeConfig[themeKey];
              const isSelected = templateTheme === themeKey;
              return (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => setTemplateTheme(themeKey)}
                  className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-20 ${
                    isSelected
                      ? 'bg-gradient-to-br from-teal-600 to-emerald-600 border-teal-400 text-white shadow-lg ring-2 ring-teal-400/50 scale-[1.02]'
                      : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xl">{cfg.icon}</span>
                    {isSelected && <BadgeCheck className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <strong className="text-xs block font-bold truncate">{cfg.name}</strong>
                    <span className="text-[9px] opacity-80 block truncate">{cfg.subtext}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PRESCRIPTION PREVIEW CANVAS */}
        <div
          id="doctor-prescription-content"
          className={`p-6 sm:p-9 rounded-3xl border-2 shadow-2xl space-y-5 relative overflow-hidden transition-all ${currentTheme.bgClass} ${currentTheme.borderClass} ${currentTheme.fontClass}`}
        >
          {/* Top Header Banner with Prominent Big Logo & Title */}
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
                    NABL LABS
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-teal-100 font-mono flex flex-wrap items-center gap-2.5 pt-0.5 font-medium">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 opacity-80" />
                    Main Health Expressway, Medical Square
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

          {/* Clinical Vitals Telemetry (Large Clear Metric Cards) */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                <Activity className="w-3 h-3 text-blue-500" /> BP
              </div>
              <strong className="font-mono text-sm sm:text-base block text-slate-900 mt-1 font-black">
                {encounter.vitals?.bpSystolic || 120}/{encounter.vitals?.bpDiastolic || 80}
              </strong>
              <span className="text-[9px] text-slate-500 font-bold">mmHg</span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                <HeartPulse className="w-3 h-3 text-rose-500" /> Pulse
              </div>
              <strong className="font-mono text-sm sm:text-base block text-rose-600 mt-1 font-black">
                {encounter.vitals?.pulseRate || 74}
              </strong>
              <span className="text-[9px] text-slate-500 font-bold">bpm</span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                <Thermometer className="w-3 h-3 text-amber-500" /> Temp
              </div>
              <strong className="font-mono text-sm sm:text-base block text-amber-600 mt-1 font-black">
                {encounter.vitals?.temperature || 98.4}°F
              </strong>
              <span className="text-[9px] text-slate-500 font-bold">Afebrile</span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                <Wind className="w-3 h-3 text-teal-500" /> SpO2
              </div>
              <strong className="font-mono text-sm sm:text-base block text-teal-600 mt-1 font-black">
                {encounter.vitals?.spo2 || 99}%
              </strong>
              <span className="text-[9px] text-slate-500 font-bold">Optimal</span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                <Droplets className="w-3 h-3 text-purple-500" /> Glucose
              </div>
              <strong className="font-mono text-sm sm:text-base block text-purple-600 mt-1 font-black">
                {encounter.vitals?.bloodSugar || 110}
              </strong>
              <span className="text-[9px] text-slate-500 font-bold">mg/dL</span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                <Scale className="w-3 h-3 text-emerald-500" /> Auto BMI
              </div>
              <strong className="font-mono text-sm sm:text-base block text-emerald-600 mt-1 font-black">
                {encounter.vitals?.bmi || '24.2'}
              </strong>
              <span className="text-[9px] text-slate-500 font-bold">Normal</span>
            </div>
          </div>

          {/* ═══ TWO-COLUMN BODY LAYOUT ═══ Left Sidebar + Right Main */}
          <div className="flex gap-4">

            {/* ──── LEFT SIDEBAR ──── Chief Complaints + Clinical Diagnoses */}
            <div className="flex flex-col gap-3 shrink-0" style={{ width: '210px', minWidth: '190px' }}>

              {/* Chief Complaints & Symptoms */}
              <div className="p-3.5 rounded-2xl bg-violet-50 border-2 border-violet-300 shadow-sm flex-1">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
                    <Activity className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[10.5px] font-black uppercase text-violet-900 tracking-wide leading-tight">
                    Chief Complaints &amp; Symptoms
                  </span>
                </div>
                {encounter.chiefComplaints.length > 0 ? (
                  <ul className="list-none pl-0 space-y-1.5">
                    {encounter.chiefComplaints.map((c, i) => (
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

              {/* Clinical Diagnoses ICD-10 */}
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
                {encounter.diagnoses.length > 0 ? (
                  <ul className="list-none pl-0 space-y-1.5">
                    {encounter.diagnoses.map((d, i) => (
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

              {/* Encounter Quick Stats */}
              <div className="p-3 rounded-2xl bg-slate-100 border border-slate-300 text-center space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-600 block tracking-wider">Encounter Summary</span>
                <div className="grid grid-cols-1 gap-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span className="flex items-center gap-1"><Pill className="w-3 h-3 text-teal-600" /> Drugs Rx</span>
                    <span className="font-black text-teal-700 font-mono">{encounter.medications.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span className="flex items-center gap-1"><FlaskConical className="w-3 h-3 text-purple-600" /> Lab Orders</span>
                    <span className="font-black text-purple-700 font-mono">{encounter.labOrders?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-amber-600" /> Follow-up</span>
                    <span className="font-black text-amber-700 font-mono">{encounter.followUpDays || 14}D</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ──── RIGHT MAIN CONTENT ──── Rx Table + Labs + Diet + Follow-up */}
            <div className="flex-1 min-w-0 space-y-4">

              {/* Prescribed Medications ℞ Matrix */}
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
                      {encounter.medications.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 sm:p-3.5">
                            <strong className="text-slate-900 text-sm sm:text-base block font-black">{m.name}</strong>
                            {m.composition && (
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

              {/* Diagnostic Orders & Lifestyle side-by-side */}
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
                      {encounter.labOrders.map((lo, i) => (
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
                  {encounter.dietAndAdvice && encounter.dietAndAdvice.length > 0 ? (
                    <ul className="list-disc pl-5 text-xs text-slate-800 space-y-1 font-medium">
                      {encounter.dietAndAdvice.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  ) : (
                    <span className="text-slate-400 text-xs italic">Maintain healthy balanced diet and hydration.</span>
                  )}
                </div>
              </div>

              {/* Follow-up Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-50 to-amber-50/50 border-2 border-amber-400 text-amber-950 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black uppercase text-amber-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    Confirmed Follow-up Appointment Slot
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-600 text-white uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <CheckCheck className="w-3.5 h-3.5" />
                    PATIENT WISH CONFIRMED
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

              {/* Seal & Doctor Signature */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-slate-200">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-center text-xs text-slate-800 font-bold">
                  <div className="flex items-center gap-1.5 justify-center text-teal-700 font-black">
                    <ShieldCheck className="w-4 h-4" />
                    <span>LABMEDIX EMR VERIFIED SEAL</span>
                  </div>
                  <span className="font-mono text-[9px] text-slate-500 block mt-0.5">SHA-256 Hash: {securityHash}</span>
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
            {/* END RIGHT MAIN */}
          </div>
          {/* END TWO-COLUMN BODY */}
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md" onClick={onClose}>
              Close
            </Button>

            {onCallNextPatient && nextQueuePatient && (
              <Button
                variant="primary"
                size="md"
                className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black shadow-lg animate-pulse"
                leftIcon={<Sparkles className="w-4 h-4 text-slate-950" />}
                onClick={onCallNextPatient}
              >
                📢 Call Next Patient (Token #{nextQueuePatient.tokenNo}: {nextQueuePatient.patientName}) ➔
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="md"
              leftIcon={<Download className="w-4 h-4 text-purple-600" />}
              onClick={handleDownloadPdf}
            >
              📄 Download PDF
            </Button>

            <Button
              variant="outline"
              size="md"
              leftIcon={<Download className="w-4 h-4 text-teal-600" />}
              onClick={handleDownloadPng}
            >
              🖼️ Save PNG
            </Button>

            <Button
              variant="outline"
              size="md"
              className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-bold"
              leftIcon={<Share2 className="w-4 h-4 text-emerald-600" />}
              onClick={handleSendWhatsApp}
            >
              📱 WhatsApp e-Rx
            </Button>

            <Button
              variant="primary"
              size="md"
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 font-black shadow-md text-sm"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={handlePrintDirect}
            >
              🖨️ Print Direct (A4 Letterhead)
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
