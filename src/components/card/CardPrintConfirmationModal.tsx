import React, { useState } from 'react';
import { Printer, Settings, CheckCircle2, AlertTriangle, X, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';

interface CardPrintConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPrint: (settings: {
    printerName: string;
    layoutMode: string;
    scale: string;
    margins: string;
  }) => void;
  printType: 'pvc_single' | 'a4_sheet';
  cardTitle?: string;
}

export const CardPrintConfirmationModal: React.FC<CardPrintConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirmPrint,
  printType,
  cardTitle = 'Health Card'
}) => {
  const [selectedPrinter, setSelectedPrinter] = useState<string>(
    printType === 'pvc_single' ? 'Magicard / Fargo CR80 Direct PVC Printer' : 'Default System Laser / Inkjet Printer (A4)'
  );
  const [layoutOrientation, setLayoutOrientation] = useState<string>(printType === 'pvc_single' ? 'Landscape (CR80 Standard)' : 'Portrait (A4 Standard)');
  const [printScale, setPrintScale] = useState<string>('100% (Actual Size - No Scaling)');
  const [margins, setMargins] = useState<string>(printType === 'pvc_single' ? 'None (Borderless CR80)' : 'Default (Minimal Margins)');
  const [confirmedChecklist, setConfirmedChecklist] = useState({
    printerReady: true,
    paperLoaded: true,
    scaleVerified: true
  });

  if (!isOpen) return null;

  const handleProceed = () => {
    onConfirmPrint({
      printerName: selectedPrinter,
      layoutMode: layoutOrientation,
      scale: printScale,
      margins
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black">Confirm Card Print Settings</h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Ensure printer selection, scale, and layout before sending to spooler.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Print Target Notice */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                Print Job: {cardTitle} ({printType === 'pvc_single' ? 'CR80 PVC Card' : 'A4 Multi-Card Sheet'})
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                {printType === 'pvc_single'
                  ? 'CR80 standard dimensions (85.6mm × 54mm) require 100% scale and borderless settings for precise edge-to-edge plastic printing.'
                  : 'A4 multi-card sheets include alignment crop marks. Ensure scale is set to 100% to preserve exact ID card proportions.'}
              </p>
            </div>
          </div>

          {/* Printer Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              1. Select Target Printer
            </label>
            <select
              value={selectedPrinter}
              onChange={(e) => setSelectedPrinter(e.target.value)}
              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="Magicard / Fargo CR80 Direct PVC Printer">Magicard / Fargo CR80 Direct PVC Printer (USB / Network)</option>
              <option value="Zebra ZXP Series Card Printer">Zebra ZXP Series Card Printer</option>
              <option value="Evo / Datacard ID Printer">Evo / Datacard ID Printer</option>
              <option value="Default System Laser / Inkjet Printer (A4)">Default System Laser / Inkjet Printer (A4)</option>
              <option value="Save as PDF (Virtual Printer)">Save as PDF (Virtual Printer)</option>
            </select>
          </div>

          {/* Layout & Orientation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                2. Orientation & Layout
              </label>
              <select
                value={layoutOrientation}
                onChange={(e) => setLayoutOrientation(e.target.value)}
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Landscape (CR80 Standard)">Landscape (CR80 Standard)</option>
                <option value="Portrait (CR80 Standard)">Portrait (CR80 Standard)</option>
                <option value="Portrait (A4 Standard)">Portrait (A4 Standard)</option>
                <option value="Landscape (A4 Standard)">Landscape (A4 Standard)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                3. Print Scale & Margins
              </label>
              <select
                value={printScale}
                onChange={(e) => setPrintScale(e.target.value)}
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="100% (Actual Size - No Scaling)">100% (Actual Size - Recommended)</option>
                <option value="Fit to Printable Area">Fit to Printable Area</option>
                <option value="Custom 95%">Custom 95%</option>
              </select>
            </div>
          </div>

          {/* Pre-flight Checklist */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Pre-Print Verification Checklist
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedChecklist.printerReady}
                  onChange={(e) => setConfirmedChecklist(prev => ({ ...prev, printerReady: e.target.checked }))}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="font-medium">Selected printer is powered on, online, and loaded with correct stock.</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedChecklist.scaleVerified}
                  onChange={(e) => setConfirmedChecklist(prev => ({ ...prev, scaleVerified: e.target.checked }))}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="font-medium">Print Scale is locked to 100% (Actual Size) to prevent card distortion.</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md hover:from-blue-700 hover:to-indigo-700"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={handleProceed}
            disabled={!confirmedChecklist.printerReady || !confirmedChecklist.scaleVerified}
          >
            Confirm & Send to Printer Spooler
          </Button>
        </div>
      </div>
    </div>
  );
};
