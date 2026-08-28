import { AuthService } from '../../services/authService';
import React, { useState } from 'react';
import { Patient, HealthCard, Membership, CompanyProfile, CardThemePreset, CardMaterial } from '../../types';
import { StorageService } from '../../services/storage';
import { CR80CardFront } from './CR80CardFront';
import { CR80CardBack } from './CR80CardBack';
import { CardCustomizer } from './CardCustomizer';
import { FamilyLinkageModal } from '../family/FamilyLinkageModal';
import { CardPrintConfirmationModal } from './CardPrintConfirmationModal';
import { ExportService } from '../../services/exportService';
import { PrintService } from '../../services/printService';
import { CardService } from '../../services/cardService';
import { useToast } from '../../context/ToastContext';
import { triggerConfetti, triggerCelebrationFireworks } from '../../utils/confetti';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import {
  RotateCw,
  Download,
  Printer,
  Layers,
  FileText,
  CheckCircle2,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Sliders,
  Columns2,
  HelpCircle,
  Users2,
  Heart,
  Activity,
  AlertTriangle,
  Copy
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CardStudioProps {
  patient: Patient;
  card: HealthCard;
  membership: Membership;
  company: CompanyProfile;
  onCardUpdated?: (updated: HealthCard) => void;
}

export const CardStudio: React.FC<CardStudioProps> = ({
  patient,
  card: initialCard,
  membership,
  company,
  onCardUpdated
}) => {
  const [card, setCard] = useState<HealthCard>(initialCard);
  const [isFlipped, setIsFlipped] = useState(false);

  const triggerHaptic = (pattern: number | number[] = [35, 25, 45]) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Safe fallback
      }
    }
  };

  const handleCardFlip = () => {
    triggerHaptic(isFlipped ? 30 : [40, 20, 50]);
    setIsFlipped(prev => !prev);
  };
  const [displayMode, setDisplayMode] = useState<'3d_flip' | 'dual_view'>('3d_flip');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showBleedGuides, setShowBleedGuides] = useState(false);
  const [isCalibrationModalOpen, setIsCalibrationModalOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [tiltAngle, setTiltAngle] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const { showToast } = useToast();

  const families = StorageService.getFamilies();
  const family = families.find(f =>
    f.primaryPatientId === patient.id ||
    f.members.some(m => m.patientId === patient.id) ||
    patient.familyId === f.id
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (displayMode !== '3d_flip') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    // 3D Tilt calculation (max 12 deg tilt)
    const tiltY = ((percentX - 50) / 50) * 12;
    const tiltX = -((percentY - 50) / 50) * 12;

    setMousePos({ x: percentX, y: percentY });
    setTiltAngle({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    setTiltAngle({ x: 0, y: 0 });
  };

  const handleDesignChange = (preset: CardThemePreset, material: CardMaterial, customTagline?: string, showFamilyBadge?: boolean) => {
    const updatedConfig = {
      ...card.designConfig,
      preset,
      material,
      customTagline: customTagline !== undefined ? customTagline : card.designConfig?.customTagline,
      showFamilyBadge: showFamilyBadge !== undefined ? showFamilyBadge : card.designConfig?.showFamilyBadge
    };
    const saved = CardService.updateDesign(card.id, updatedConfig);
    if (saved) {
      setCard({ ...saved });
      onCardUpdated?.(saved);
      showToast('success', 'Design Updated', `Applied ${preset.replace('_', ' ')} finish.`);
    }
  };

  // 1. Export High-Res PNG
  const handleExportPng = async (side: 'FRONT' | 'BACK' | 'BOTH') => {
    try {
      setIsExportingPng(true);
      const frontEl = document.getElementById('card-export-front');
      const backEl = document.getElementById('card-export-back');

      if (side === 'FRONT' || side === 'BOTH') {
        if (!frontEl) throw new Error('Card front element not ready');
        const filename = `${patient.fullName.replace(/\s+/g, '_')}_${card.cardNumber}_FRONT.png`;
        await ExportService.exportToPng(frontEl, filename);
      }
      if (side === 'BACK' || side === 'BOTH') {
        if (!backEl) throw new Error('Card back element not ready');
        const filename = `${patient.fullName.replace(/\s+/g, '_')}_${card.cardNumber}_BACK.png`;
        await ExportService.exportToPng(backEl, filename);
      }

      triggerConfetti();
      showToast('success', 'PNG Exported!', '300+ DPI high-resolution image downloaded.');
    } catch (err: any) {
      showToast('error', 'Export Failed', err.message || 'Image generation failed.');
    } finally {
      setIsExportingPng(false);
    }
  };

  // 2. Export CR80 Vector PDF (Double Sided)
  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      const frontEl = document.getElementById('card-export-front');
      const backEl = document.getElementById('card-export-back');
      if (!frontEl || !backEl) throw new Error('Card elements not ready for PDF generation');

      const filename = `${patient.fullName.replace(/\s+/g, '_')}_${card.cardNumber}_CR80_PVC.pdf`;
      await ExportService.exportCardToPdf(frontEl, backEl, filename);
      triggerCelebrationFireworks();
      showToast('success', 'CR80 Vector PDF Ready!', 'Double-sided PVC printable PDF downloaded.');
    } catch (err: any) {
      showToast('error', 'PDF Generation Failed', err.message || 'Failed to create PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 3. Direct Print PVC Card (triggered after confirmation modal)
  const handlePrintPvc = (settings?: { printerName: string; layoutMode: string; scale: string; margins: string }) => {
    const frontEl = document.getElementById('card-export-front');
    const backEl = document.getElementById('card-export-back');
    if (!frontEl) {
      window.print();
      return;
    }
    PrintService.printCR80Card(frontEl, backEl, `${patient.fullName} - CR80 PVC Card`);
    showToast('info', 'Printer Window Opened', `CR80 Card sent to spooler [${settings?.printerName || 'Default'}].`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* 1. Main Interactive 3D Stage */}
      <div className="flex-1 w-full flex flex-col items-center space-y-4">
        {/* Stage Utility Header */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Display Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setDisplayMode('3d_flip')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                displayMode === '3d_flip' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>3D Flip Mode</span>
            </button>
            <button
              onClick={() => setDisplayMode('dual_view')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                displayMode === 'dual_view' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Dual View (Both Sides)</span>
            </button>
          </div>

          {/* Family Group & Zoom Controls */}
          <div className="flex items-center gap-2">
            {/* Family Group Quick Button */}
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Users2 className="w-3.5 h-3.5 text-brand-blue" />}
              onClick={() => setIsFamilyModalOpen(true)}
            >
              {family ? `Family Shield (${family.members.length + 1})` : 'Family Linkage'}
            </Button>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.1))}
                className="p-1 rounded text-slate-500 hover:text-slate-700"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono font-bold text-slate-700 dark:text-slate-300">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
                className="p-1 rounded text-slate-500 hover:text-slate-700"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <Button
              size="sm"
              variant="ghost"
              leftIcon={<HelpCircle className="w-3.5 h-3.5" />}
              onClick={() => setIsCalibrationModalOpen(true)}
              title="Printer Calibration"
            >
              Profiles
            </Button>
          </div>
        </div>

        {/* Interactive 3D Card Stage Container */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-2xl w-full flex flex-col items-center justify-center min-h-[460px] overflow-hidden select-none"
        >
          {/* Ambient Glow */}
          <div className="absolute w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

          {displayMode === '3d_flip' ? (
            /* 3D Perspective Flip Mode */
            <div
              className="perspective-1000 my-4"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease-out'
              }}
            >
              <motion.div
                animate={{
                  rotateY: isFlipped ? 180 : tiltAngle.y,
                  rotateX: isFlipped ? 0 : tiltAngle.x
                }}
                transition={{ duration: isFlipped ? 0.6 : 0.05, ease: 'easeOut' }}
                className="relative preserve-3d cursor-pointer"
                onClick={handleCardFlip}
              >
                {/* Front Face */}
                <div className={`backface-hidden ${isFlipped ? 'pointer-events-none' : ''}`}>
                  <CR80CardFront
                    patient={patient}
                    card={card}
                    membership={membership}
                    company={company}
                    showBleedGuides={showBleedGuides}
                    mousePosition={mousePos}
                  />
                </div>

                {/* Back Face */}
                <div className={`backface-hidden rotate-y-180 absolute inset-0 ${!isFlipped ? 'pointer-events-none' : ''}`}>
                  <CR80CardBack
                    patient={patient}
                    card={card}
                    membership={membership}
                    company={company}
                    showBleedGuides={showBleedGuides}
                    mousePosition={mousePos}
                    onOpenFamilyModal={() => setIsFamilyModalOpen(true)}
                  />
                </div>
              </motion.div>
            </div>
          ) : (
            /* Dual View Mode: Front and Back side-by-side */
            <div
              className="flex flex-col xl:flex-row items-center justify-center gap-8 my-4"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease-out'
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">FRONT FACE</span>
                <CR80CardFront
                  patient={patient}
                  card={card}
                  membership={membership}
                  company={company}
                  showBleedGuides={showBleedGuides}
                />
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">BACK FACE</span>
                <CR80CardBack
                  patient={patient}
                  card={card}
                  membership={membership}
                  company={company}
                  showBleedGuides={showBleedGuides}
                  onOpenFamilyModal={() => setIsFamilyModalOpen(true)}
                />
              </div>
            </div>
          )}

          {/* Flip Toggle Bar in 3D Mode */}
          {displayMode === '3d_flip' && (
            <div className="flex flex-col items-center gap-3 mt-6 z-10 w-full max-w-xl">
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<RotateCw className="w-4 h-4" />}
                  onClick={handleCardFlip}
                >
                  Flip to {isFlipped ? 'Front Side' : 'Back Side & Clinical Specs'}
                </Button>
                <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                  Click card or button to flip in 3D.
                </span>
              </div>

              {/* Framer Motion Clinical Specs Reveal on Flip */}
              {isFlipped && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.35 }}
                  className="w-full p-4 rounded-2xl bg-slate-900/90 border border-teal-500/40 text-left text-xs space-y-2.5 shadow-xl"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-extrabold text-teal-300 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      Revealed Patient Clinical Profile
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-black text-[10px] border border-rose-500/30 flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-current" />
                      {patient.bloodGroup || 'O+ POSITIVE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block uppercase font-sans">BP</span>
                      <strong className="text-emerald-400">{patient.vitalsAtReg?.bp || '120/80 mmHg'}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block uppercase font-sans">Pulse</span>
                      <strong className="text-rose-400">{patient.vitalsAtReg?.pulse || 72} bpm</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block uppercase font-sans">SpO2</span>
                      <strong className="text-cyan-400">{patient.vitalsAtReg?.spo2 || 98}%</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block uppercase font-sans">RBS</span>
                      <strong className="text-amber-400">{patient.vitalsAtReg?.rbs || '105 mg/dL'}</strong>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-rose-950/20 border border-rose-500/20 text-[11px]">
                    <span className="text-rose-300 font-bold flex items-center gap-1 text-[10px] uppercase">
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      Allergies & Alerts:
                    </span>
                    <p className="text-slate-300 mt-0.5">{patient.medicalInfo?.allergies || 'No Known Drug Allergies (NKDA)'}</p>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* 2. Production Action Buttons Toolbar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
          <Button
            variant="outline"
            leftIcon={<Download className="w-4 h-4 text-blue-600" />}
            onClick={() => handleExportPng(isFlipped ? 'BACK' : 'FRONT')}
            isLoading={isExportingPng}
          >
            Export PNG (300 DPI)
          </Button>

          <Button
            variant="outline"
            leftIcon={<FileText className="w-4 h-4 text-emerald-600" />}
            onClick={handleExportPdf}
            isLoading={isExportingPdf}
          >
            CR80 Vector PDF
          </Button>

          <Button
            variant="primary"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={() => setIsPrintModalOpen(true)}
          >
            Direct Print PVC
          </Button>

          <Button
            variant="secondary"
            leftIcon={<Layers className="w-4 h-4" />}
            onClick={() => {
              window.location.href = `/cards/print-sheet?patientId=${patient.id}`;
            }}
          >
            A4 Multi-Card Sheet
          </Button>
        </div>
      </div>

      {/* 3. Right Customizer Panel */}
      <div className="w-full lg:w-96 shrink-0">
        <CardCustomizer
          card={card}
          membership={membership}
          onDesignChange={handleDesignChange}
          showBleedGuides={showBleedGuides}
          onToggleBleedGuides={() => setShowBleedGuides(!showBleedGuides)}
          onOpenFamilyModal={() => setIsFamilyModalOpen(true)}
          hasFamilyGroup={!!family}
        />
      </div>

      {/* Family Linkage Modal */}
      <FamilyLinkageModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        patient={patient}
        onSwitchCard={(pId) => {
          window.location.href = `/card-studio?patientId=${pId}`;
        }}
      />

      {/* Printer Calibration Modal */}
      {isCalibrationModalOpen && (
        <Modal
          isOpen={isCalibrationModalOpen}
          onClose={() => setIsCalibrationModalOpen(false)}
          title="CR80 PVC Printer Calibration Profiles"
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              The LABMEDIX Card Studio produces vector-grade double-sided exports calibrated for commercial PVC dye-sublimation and desktop card printers:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong className="text-slate-900 dark:text-white block font-bold">Evolis Primacy / Zenius</strong>
                <p className="text-slate-500 mt-1">Direct PVC Print mode. Set margin to 0mm and enable Dual-Sided Flip.</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong className="text-slate-900 dark:text-white block font-bold">Zebra ZC300 / ZXP Series</strong>
                <p className="text-slate-500 mt-1">Export 300 DPI PNG or PDF. Set resolution to 300 DPI Edge-to-Edge.</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong className="text-slate-900 dark:text-white block font-bold">HID Fargo DTC1250e</strong>
                <p className="text-slate-500 mt-1">Compatible with magnetic stripe encoding and CR80 30-mil card stock.</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong className="text-slate-900 dark:text-white block font-bold">Desktop Inkjet PVC Tray (Epson/Canon)</strong>
                <p className="text-slate-500 mt-1">Use our "A4 Multi-Card Sheet" layout with 2, 4, or 8 cards per page with cut guides.</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="primary" onClick={() => setIsCalibrationModalOpen(false)}>
                Close Guide
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Render Targets for Exporting High-Res PNGs & PDFs (Positioned in-DOM cleanly) */}
      <div style={{ position: 'fixed', top: 0, left: 0, opacity: 0, pointerEvents: 'none', zIndex: -999 }}>
        <CR80CardFront
          id="card-export-front"
          patient={patient}
          card={card}
          membership={membership}
          company={company}
          scale={1}
        />
        <CR80CardBack
          id="card-export-back"
          patient={patient}
          card={card}
          membership={membership}
          company={company}
          scale={1}
        />
      </div>

      <CardPrintConfirmationModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onConfirmPrint={(settings) => handlePrintPvc(settings)}
        printType="pvc_single"
        cardTitle={`${patient.fullName} (${card.cardNumber})`}
      />
    </div>
  );
};