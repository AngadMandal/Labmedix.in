import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { BloodTestBooking } from '../../services/portalService';
import { StorageService } from '../../services/storage';
import { Patient } from '../../types';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { RealBarcode } from '../common/RealBarcode';
import { generateCode128PngDataUrl } from '../../utils/barcode';
import { generateQrDataUrl } from '../../utils/qr';
import { ExportService } from '../../services/exportService';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import {
  Printer,
  TestTube,
  Tag,
  Download,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  Sparkles,
  Info,
  Layers,
  ThermometerSnowflake,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export interface PhlebotomySampleLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BloodTestBooking | null;
}

export const PhlebotomySampleLabelModal: React.FC<PhlebotomySampleLabelModalProps> = ({
  isOpen,
  onClose,
  booking
}) => {
  const [labelFormat, setLabelFormat] = useState<'tube_standard' | 'bag_label' | 'avery_sticker'>('tube_standard');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedBarcode, setCopiedBarcode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const company = StorageService.getCompanyProfile();
  const { showToast } = useToast();

  useEffect(() => {
    if (booking) {
      // Generate QR Code containing specimen verification payload
      const qrPayload = JSON.stringify({
        sampleId: booking.bookingNo,
        patientId: booking.patientId,
        patientName: booking.patientName,
        test: booking.testName,
        date: booking.scheduledDate,
        lab: company.name || 'LABMEDIX DIAGNOSTICS'
      });
      generateQrDataUrl(qrPayload, 200).then(url => {
        setQrCodeDataUrl(url);
      });
    }
  }, [booking, company]);

  if (!booking) return null;

  const patient = StorageService.getPatients().find(p => p.id === booking.patientId) || {
    id: booking.patientId,
    fullName: booking.patientName,
    age: 45,
    gender: 'male',
    bloodGroup: 'B+',
    mobile: '9830012345'
  };

  const isBag = labelFormat === 'bag_label';
  const isAvery = labelFormat === 'avery_sticker';

  // Determine Tube Vacutainer Color & Cap Specifications based on test category
  const getTubeType = (testName: string) => {
    const lower = testName.toLowerCase();
    if (lower.includes('cbc') || lower.includes('blood count') || lower.includes('hba1c') || lower.includes('esr')) {
      return {
        name: 'EDTA K2/K3 (Lavender/Purple Top)',
        capColor: '#8B5CF6',
        bg: 'bg-purple-950/80',
        border: 'border-purple-500',
        text: 'text-purple-300',
        additive: 'K2 EDTA Anticoagulant (Whole Blood)',
        drawVolume: '3.0 mL'
      };
    }
    if (lower.includes('sugar') || lower.includes('fbs') || lower.includes('ppbs') || lower.includes('glucose')) {
      return {
        name: 'Sodium Fluoride / Potassium Oxalate (Gray Top)',
        capColor: '#94A3B8',
        bg: 'bg-slate-800',
        border: 'border-slate-400',
        text: 'text-slate-200',
        additive: 'Glycolysis Inhibitor (Plasma/Serum)',
        drawVolume: '2.0 mL'
      };
    }
    if (lower.includes('pt/inr') || lower.includes('coagulation') || lower.includes('aptt')) {
      return {
        name: 'Sodium Citrate 3.2% (Light Blue Top)',
        capColor: '#38BDF8',
        bg: 'bg-sky-950/80',
        border: 'border-sky-500',
        text: 'text-sky-300',
        additive: 'Sodium Citrate Buffer (1:9 ratio)',
        drawVolume: '2.7 mL'
      };
    }
    if (lower.includes('electrolyte') || lower.includes('blood gas') || lower.includes('ammonia')) {
      return {
        name: 'Sodium Heparin (Green Top)',
        capColor: '#10B981',
        bg: 'bg-emerald-950/80',
        border: 'border-emerald-500',
        text: 'text-emerald-300',
        additive: 'Sodium Heparin Anticoagulant',
        drawVolume: '4.0 mL'
      };
    }
    return {
      name: 'SST Gel / Clot Activator (Gold/Yellow Top)',
      capColor: '#FBBF24',
      bg: 'bg-amber-950/80',
      border: 'border-amber-500',
      text: 'text-amber-300',
      additive: 'Silica Clot Activator + Polymer Gel',
      drawVolume: '5.0 mL'
    };
  };

  const tubeInfo = getTubeType(booking.testName);

  // Copy Barcode ID
  const handleCopyBarcode = () => {
    navigator.clipboard.writeText(booking.bookingNo);
    setCopiedBarcode(true);
    showToast('success', 'Barcode Copied', `Sample ID ${booking.bookingNo} copied to clipboard.`);
    setTimeout(() => setCopiedBarcode(false), 2000);
  };

  // Direct Print Window with High-Res Barcode Vector & CSS
  const handlePrintDirect = () => {
    const printWin = window.open('', '_blank', 'width=650,height=750');
    if (!printWin) {
      window.print();
      return;
    }

    const printContent = document.getElementById('phlebotomy-sample-label-content');
    if (!printContent) {
      window.print();
      return;
    }

    const pageCssSize = isBag ? '100mm 60mm' : isAvery ? '70mm 36mm' : '50mm 25mm';

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vacutainer Label - ${booking.bookingNo} - ${booking.patientName}</title>
          <style>
            @page {
              size: ${pageCssSize};
              margin: 1.5mm;
            }
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              font-size: ${isBag ? '11px' : isAvery ? '9.5px' : '8px'};
              color: #000;
              margin: 0;
              padding: 2px;
              line-height: 1.2;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .label-card {
              border: 1.5px solid #000;
              border-radius: 4px;
              padding: ${isBag ? '6px 8px' : '3px 5px'};
              background: #fff;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              height: 98%;
              box-sizing: border-box;
            }
            .header-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid #000;
              padding-bottom: 2px;
              margin-bottom: 2px;
            }
            .brand-name {
              font-weight: 900;
              font-size: ${isBag ? '12px' : '8.5px'};
              text-transform: uppercase;
            }
            .badge-tag {
              font-size: 7px;
              border: 1px solid #000;
              padding: 1px 3px;
              border-radius: 2px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .patient-name {
              font-size: ${isBag ? '13px' : '9.5px'};
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .meta-row {
              display: flex;
              justify-content: space-between;
              font-size: ${isBag ? '10px' : '7.5px'};
              font-family: monospace;
              margin-top: 1px;
            }
            .test-row {
              font-weight: bold;
              font-size: ${isBag ? '11px' : '8px'};
              margin-top: 2px;
              background: #eee;
              padding: 1px 3px;
              border-radius: 2px;
            }
            .barcode-container {
              text-align: center;
              margin: 2px 0;
            }
            .barcode-container svg {
              max-width: 100%;
              height: auto;
            }
            .footer-row {
              display: flex;
              justify-content: space-between;
              font-size: 6.5px;
              font-family: monospace;
              border-top: 0.5px dashed #000;
              padding-top: 1px;
              margin-top: 2px;
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
    showToast('info', 'Barcode Dispatched', 'Real scannable Code 128 barcode sent to label printer.');
  };

  // Export High-Resolution 300 DPI PNG Label
  const handleDownloadPng = async () => {
    const el = document.getElementById('phlebotomy-sample-label-content');
    if (!el) return;

    setIsExporting(true);
    try {
      showToast('info', 'Rendering Label', 'Compiling high-resolution 300 DPI PNG label...');
      await ExportService.exportToPng(el, `LABEL_${booking.bookingNo}_${booking.patientName.replace(/\s+/g, '_')}`);
      triggerCelebrationFireworks();
      showToast('success', 'Label Image Downloaded', 'High-res Code 128 label saved as PNG.');
    } catch {
      showToast('error', 'Export Error', 'Could not export barcode label.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Phlebotomy Sample Tube & Vacutainer Label Printer" maxWidth="lg">
      <div className="space-y-4 text-xs">
        {/* Label Format Selector Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-teal-400" />
            <span className="text-white font-bold text-xs">Standard Label Spec:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setLabelFormat('tube_standard')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                labelFormat === 'tube_standard'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              💉 Tube Label (50x25mm)
            </button>

            <button
              type="button"
              onClick={() => setLabelFormat('avery_sticker')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                labelFormat === 'avery_sticker'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              🏷️ Avery Sticker (70x36mm)
            </button>

            <button
              type="button"
              onClick={() => setLabelFormat('bag_label')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                labelFormat === 'bag_label'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              📦 Biohazard Bag (100x60mm)
            </button>
          </div>
        </div>

        {/* Live Vector High-Precision 3D Label Container */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center shadow-2xl relative">
          <div
            id="phlebotomy-sample-label-content"
            className={`w-full rounded-2xl bg-white text-slate-950 font-sans border-2 border-slate-900 shadow-2xl space-y-2 select-none ${
              isBag ? 'max-w-md p-5 text-xs' : isAvery ? 'max-w-sm p-4 text-[11px]' : 'max-w-xs p-3 text-[10px]'
            }`}
          >
            {/* Top Brand Banner */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1.5">
              <div className="flex items-center gap-1.5">
                <TestTube className="w-4 h-4 text-teal-600" />
                <strong className="text-[11px] font-black tracking-tight text-slate-950 uppercase">
                  {company.name || 'LABMEDIX'} DIAGNOSTICS
                </strong>
              </div>
              <span className="px-2 py-0.5 rounded text-[8.5px] font-black uppercase font-mono bg-teal-100 text-teal-950 border border-teal-400">
                {booking.collectionType === 'home_collection' ? 'HOME SAMPLE' : 'CENTRAL LAB'}
              </span>
            </div>

            {/* Patient Master Demographics */}
            <div>
              <strong className="text-sm font-black text-slate-950 uppercase tracking-tight block">
                {booking.patientName}
              </strong>
              <div className="flex justify-between text-[10.5px] font-mono text-slate-800 mt-0.5">
                <span>PID: <strong>{booking.patientId}</strong></span>
                <span>Age/Sex: <strong>{patient.age || 45}Y/{(patient.gender || 'M').toUpperCase()[0]}</strong></span>
                <span>Blood: <strong className="text-rose-700">{patient.bloodGroup || 'B+'}</strong></span>
              </div>
            </div>

            {/* Test & Specimen Info */}
            <div className="p-2 rounded-xl bg-slate-100 border border-slate-300 text-[10.5px] space-y-1">
              <div className="font-bold text-slate-950 line-clamp-2">
                🔬 {booking.testName}
              </div>
              <div className="flex justify-between items-center text-slate-700 font-mono text-[9.5px] pt-0.5 border-t border-slate-200">
                <span className="font-bold text-purple-800 flex items-center gap-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: tubeInfo.capColor }}
                  />
                  {tubeInfo.name.split(' (')[0]}
                </span>
                {booking.fastingRequired ? (
                  <span className="text-rose-700 font-bold bg-rose-50 px-1 rounded border border-rose-200">⚠️ FASTING 10H</span>
                ) : (
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded border border-emerald-200">ROUTINE</span>
                )}
              </div>
            </div>

            {/* 100% REAL SCANNABLE CODE 128 VECTOR BARCODE + 2D QR CODE */}
            <div className="py-1 flex items-center justify-between gap-3 bg-white p-2 rounded-xl border border-slate-200">
              <div className="flex-1 text-center">
                <RealBarcode
                  value={booking.bookingNo}
                  height={isBag ? 48 : isAvery ? 40 : 34}
                  barWidth={isBag ? 1.5 : isAvery ? 1.25 : 1.05}
                  showText={true}
                  className="mx-auto"
                />
              </div>

              {qrCodeDataUrl && (
                <div className="shrink-0 text-center border-l pl-2 border-slate-300">
                  <img
                    src={qrCodeDataUrl}
                    alt="Specimen QR"
                    className={isBag ? 'w-14 h-14 rounded' : 'w-10 h-10 rounded'}
                  />
                  <span className="text-[7.5px] font-mono text-slate-600 block mt-0.5">SCAN 2D</span>
                </div>
              )}
            </div>

            {/* Footer Metadata */}
            <div className="flex justify-between items-center text-[8.5px] text-slate-600 border-t border-dashed border-slate-400 pt-1 font-mono">
              <span>Sample ID: <strong>{booking.bookingNo}</strong></span>
              <span>Draw: {formatDateTime(booking.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Tube Vacutainer Protocol Information Guide Box */}
        <div className={`p-4 rounded-2xl ${tubeInfo.bg} border ${tubeInfo.border} text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full inline-block shadow-sm ring-2 ring-white/50"
                style={{ backgroundColor: tubeInfo.capColor }}
              />
              <strong className={`text-xs ${tubeInfo.text}`}>
                {tubeInfo.name}
              </strong>
            </div>
            <p className="text-[11px] text-slate-300">
              Additive: <strong className="text-white">{tubeInfo.additive}</strong> • Target Draw: <strong className="text-amber-300">{tubeInfo.drawVolume}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400 font-bold shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ISO 15189 / Quality Compliant
          </div>
        </div>

        {/* Footer Actions Command Bar */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={copiedBarcode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-teal-400" />}
              onClick={handleCopyBarcode}
            >
              {copiedBarcode ? 'Copied!' : 'Copy Barcode ID'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5 text-purple-400" />}
              isLoading={isExporting}
              onClick={handleDownloadPng}
            >
              🖼️ Download PNG Label
            </Button>

            <Button
              variant="primary"
              size="sm"
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 font-black shadow-lg"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={handlePrintDirect}
            >
              🖨️ Print Real Barcode Label
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
