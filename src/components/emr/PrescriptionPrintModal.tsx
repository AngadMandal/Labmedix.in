import React, { useState, useEffect } from 'react';
import { ClinicalEncounter, Patient } from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ExportService } from '../../services/exportService';
import { useToast } from '../../context/ToastContext';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import { formatDateTime, formatDate } from '../../utils/formatters';
import { generateQrDataUrl, buildVerificationUrl } from '../../utils/qr';
import {
  SmartPrescriptionLayoutMode,
  PrescriptionTemplateTheme,
  SmartLayoutOptions,
  PrescriptionLayoutProps
} from './layouts/smartLayoutTypes';
import { THEME_CONFIGS } from './layouts/themeConfigs';
import { DetailedA4Layout } from './layouts/DetailedA4Layout';
import { ThermalSlipLayout } from './layouts/ThermalSlipLayout';
import { CompactA5Layout } from './layouts/CompactA5Layout';
import { ClinicalSummaryLayout } from './layouts/ClinicalSummaryLayout';
import { generatePrescriptionPrintHtml } from './layouts/printHtmlGenerator';
import {
  Printer,
  Download,
  Share2,
  Sparkles,
  Receipt,
  FileText,
  Layers,
  Sliders,
  CheckCircle2,
  QrCode,
  Activity,
  Pill,
  BadgeCheck,
  RotateCcw,
  Sparkle
} from 'lucide-react';

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
  const [layoutMode, setLayoutMode] = useState<SmartPrescriptionLayoutMode>('detailed_a4');
  const [templateTheme, setTemplateTheme] = useState<PrescriptionTemplateTheme>('apollo_modern');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  
  // Smart Layout Options & Customization State
  const [options, setOptions] = useState<SmartLayoutOptions>({
    showVitals: true,
    showSalts: true,
    showAdvice: true,
    showQrCode: true,
    thermalWidth: '80mm',
    fontSizeScale: 'normal',
    includeDiagnosisICD: true,
    includeFollowupSlot: true
  });

  const company = StorageService.getCompanyProfile();
  const cards = StorageService.getCards();
  const memberships = StorageService.getMemberships();
  const { showToast } = useToast();

  const activeCard = cards.find(c => c.patientId === encounter.patientId && c.status === 'active');
  const activeMembership = activeCard ? memberships.find(m => m.id === activeCard.membershipId) : null;
  const securityHash = `EMR-RX-${encounter.encounterNo}-${encounter.patientId}`.slice(0, 24);

  const appointmentSlotLabel = encounter.appointmentSlot || 'Morning OPD (09:00 AM - 01:00 PM)';
  const preferredTimeLabel = encounter.patientPreferredTime || '10:30 AM';
  const hospitalName = company.name || 'LABMEDIX MULTI-SPECIALITY HEALTHCARE & RESEARCH CENTRE';
  const hospitalTagline = 'Confident In Care • ISO 9001:2015 ACCREDITED • NABH STANDARDS • DIAGNOSTIC LABS';
  const hospitalAddress = 'Main Health Expressway, Medical Square';
  const helplineNumber = '+91 98765 43210';

  // Generate high-resolution QR Verification Data URL
  useEffect(() => {
    const verifyUrl = buildVerificationUrl(securityHash);
    generateQrDataUrl(verifyUrl, 200).then(url => {
      setQrCodeUrl(url);
    });
  }, [securityHash]);

  const currentTheme = THEME_CONFIGS[templateTheme];

  const layoutProps: PrescriptionLayoutProps = {
    encounter,
    patient,
    activeCard,
    activeMembership,
    company,
    securityHash,
    qrCodeUrl,
    theme: templateTheme,
    options,
    appointmentSlotLabel,
    preferredTimeLabel,
    helplineNumber,
    hospitalName,
    hospitalTagline,
    hospitalAddress
  };

  const handlePrintDirect = () => {
    const printWin = window.open('', '_blank', 'width=1050,height=1250');
    if (!printWin) {
      window.print();
      return;
    }
    const html = generatePrescriptionPrintHtml(layoutProps, layoutMode);
    printWin.document.write(html);
    printWin.document.close();
  };

  const handleDownloadPng = async () => {
    const el = document.getElementById('doctor-prescription-content');
    if (!el) return;
    try {
      showToast('info', 'Rendering Prescription', 'Exporting digital prescription PNG...');
      await ExportService.exportToPng(el, `PRESCRIPTION_${layoutMode.toUpperCase()}_${encounter.encounterNo}_${encounter.patientName}.png`);
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
      showToast('info', 'Generating PDF', `Compiling ${layoutMode === 'thermal_slip' ? 'Thermal 80mm' : layoutMode === 'compact_a5' ? 'A5' : 'A4'} PDF...`);
      await ExportService.exportPrescriptionToPdf(
        el,
        `PRESCRIPTION_${layoutMode.toUpperCase()}_${encounter.encounterNo}_${encounter.patientName}.pdf`,
        layoutMode
      );
      triggerCelebrationFireworks();
      showToast('success', 'PDF Ready', 'Official Prescription PDF downloaded.');
    } catch {
      handlePrintDirect();
    }
  };

  const handleSendWhatsApp = () => {
    let summaryText = '';
    if (layoutMode === 'thermal_slip') {
      summaryText = `Hello ${encounter.patientName},\n\nYour Express Prescription Slip from LABMEDIX Healthcare is ready.\n\nRx Token: #${encounter.encounterNo}\nDoctor: Dr. ${encounter.doctorName}\nMedications (${encounter.medications.length}):\n${encounter.medications.map((m, i) => `${i + 1}. ${m.name} - ${m.dosage} (${m.frequency})`).join('\n')}\n\nNext Visit: ${formatDate(encounter.followUpDate || '')}\nHelpline: ${helplineNumber}`;
    } else {
      summaryText = `Hello ${encounter.patientName},\n\nYour official digital prescription from LABMEDIX Healthcare is ready.\n\nEncounter No: ${encounter.encounterNo}\nDoctor: Dr. ${encounter.doctorName} (${encounter.department})\nNext Follow-up: ${formatDate(encounter.followUpDate || '')} (${appointmentSlotLabel} • ${preferredTimeLabel})\n\nPrescription Security Hash: ${securityHash}\nLABMEDIX Helpline: ${helplineNumber}`;
    }

    const msg = `https://wa.me/?text=${encodeURIComponent(summaryText)}`;
    window.open(msg, '_blank');
    showToast('success', 'WhatsApp Dispatch Ready', 'Opened WhatsApp dispatch.');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Clinical Prescription Suite: ${encounter.encounterNo}`} maxWidth="6xl">
      <div className="space-y-4 text-xs sm:text-sm">
        
        {/* SMART LAYOUT SELECTION & CONTROLS RIBBON */}
        <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-3.5 shadow-2xl">
          {/* Header & Mode Segmented Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-teal-400 font-mono flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-teal-400" />
                  Smart Layout Engine
                </span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono text-[10px] font-bold border border-teal-400/30">
                  Doctor Precision Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Switch layout templates dynamically for thermal receipt rolls, standard A4 records, or compact OPD sheets.
              </p>
            </div>

            {/* Layout Toggle Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setLayoutMode('detailed_a4')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  layoutMode === 'detailed_a4'
                    ? 'bg-teal-600 text-white shadow-md font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>Detailed A4</span>
              </button>

              <button
                type="button"
                onClick={() => setLayoutMode('thermal_slip')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  layoutMode === 'thermal_slip'
                    ? 'bg-amber-600 text-white shadow-md font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Receipt className="w-3.5 h-3.5 shrink-0" />
                <span>Thermal 80mm</span>
              </button>

              <button
                type="button"
                onClick={() => setLayoutMode('compact_a5')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  layoutMode === 'compact_a5'
                    ? 'bg-indigo-600 text-white shadow-md font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span>Compact A5</span>
              </button>

              <button
                type="button"
                onClick={() => setLayoutMode('clinical_summary')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  layoutMode === 'clinical_summary'
                    ? 'bg-rose-600 text-white shadow-md font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Case Summary</span>
              </button>
            </div>
          </div>

          {/* Sub-Controls: Themes for Detailed A4 OR Sizing for Thermal OR Quick Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {layoutMode === 'detailed_a4' && (
              <div className="w-full space-y-2">
                <div className="text-[11px] text-slate-400 font-mono font-bold flex items-center justify-between">
                  <span>Letterhead Themes (6 Clinical Archetypes):</span>
                  <span className="text-teal-300 font-bold">{currentTheme.name}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
                  {(Object.keys(THEME_CONFIGS) as PrescriptionTemplateTheme[]).map((themeKey) => {
                    const cfg = THEME_CONFIGS[themeKey];
                    const isSelected = templateTheme === themeKey;
                    return (
                      <button
                        key={themeKey}
                        type="button"
                        onClick={() => setTemplateTheme(themeKey)}
                        className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-teal-600 border-teal-400 text-white shadow-md font-black'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-base">{cfg.icon}</span>
                        <div className="truncate">
                          <span className="text-[11px] block truncate">{cfg.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {layoutMode === 'thermal_slip' && (
              <div className="w-full flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center gap-2 text-amber-300 font-mono text-[11px]">
                  <Receipt className="w-4 h-4 text-amber-400" />
                  <span>Thermal Roll Spooler Target:</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOptions(prev => ({ ...prev, thermalWidth: '80mm' }))}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                      options.thermalWidth === '80mm'
                        ? 'bg-amber-600 border-amber-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    80mm Standard POS
                  </button>
                  <button
                    type="button"
                    onClick={() => setOptions(prev => ({ ...prev, thermalWidth: '58mm' }))}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                      options.thermalWidth === '58mm'
                        ? 'bg-amber-600 border-amber-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    58mm Pocket POS
                  </button>
                </div>
              </div>
            )}

            {/* Smart Layout Detail Toggles */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400 font-mono">Include:</span>
              
              <button
                type="button"
                onClick={() => setOptions(prev => ({ ...prev, showVitals: !prev.showVitals }))}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 ${
                  options.showVitals
                    ? 'bg-teal-950/80 border-teal-500 text-teal-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <Activity className="w-3 h-3" />
                <span>Vitals</span>
                {options.showVitals && ' ✓'}
              </button>

              <button
                type="button"
                onClick={() => setOptions(prev => ({ ...prev, showSalts: !prev.showSalts }))}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 ${
                  options.showSalts
                    ? 'bg-teal-950/80 border-teal-500 text-teal-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <Pill className="w-3 h-3" />
                <span>Generic Salts</span>
                {options.showSalts && ' ✓'}
              </button>

              <button
                type="button"
                onClick={() => setOptions(prev => ({ ...prev, showAdvice: !prev.showAdvice }))}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 ${
                  options.showAdvice
                    ? 'bg-teal-950/80 border-teal-500 text-teal-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <span>🥗 Lifestyle Advice</span>
                {options.showAdvice && ' ✓'}
              </button>

              <button
                type="button"
                onClick={() => setOptions(prev => ({ ...prev, showQrCode: !prev.showQrCode }))}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 ${
                  options.showQrCode
                    ? 'bg-teal-950/80 border-teal-500 text-teal-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <QrCode className="w-3 h-3" />
                <span>Verification QR</span>
                {options.showQrCode && ' ✓'}
              </button>
            </div>
          </div>
        </div>

        {/* PRESCRIPTION PREVIEW CANVAS */}
        <div id="doctor-prescription-content" className="transition-all">
          {layoutMode === 'detailed_a4' && <DetailedA4Layout {...layoutProps} />}
          {layoutMode === 'thermal_slip' && <ThermalSlipLayout {...layoutProps} />}
          {layoutMode === 'compact_a5' && <CompactA5Layout {...layoutProps} />}
          {layoutMode === 'clinical_summary' && <ClinicalSummaryLayout {...layoutProps} />}
        </div>

        {/* ACTION BUTTONS TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
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
              📄 Download {layoutMode === 'thermal_slip' ? 'Thermal PDF' : layoutMode === 'compact_a5' ? 'A5 PDF' : 'PDF'}
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
              className={`font-black shadow-md text-sm ${
                layoutMode === 'thermal_slip'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : layoutMode === 'compact_a5'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : layoutMode === 'clinical_summary'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white'
              }`}
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={handlePrintDirect}
            >
              🖨️ Print Direct ({layoutMode === 'thermal_slip' ? 'Thermal POS' : layoutMode === 'compact_a5' ? 'A5 Sheet' : 'A4 Letterhead'})
            </Button>
          </div>
        </div>

      </div>
    </Modal>
  );
};
