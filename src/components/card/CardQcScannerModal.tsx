import React, { useState } from 'react';
import { CardDispatchRecord } from '../../types';
import { CardDispatchService } from '../../services/cardDispatchService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import {
  ShieldCheck,
  X,
  Scan,
  CheckCircle2,
  AlertCircle,
  Cpu,
  QrCode,
  Radio,
  Layers
} from 'lucide-react';

interface CardQcScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: CardDispatchRecord | null;
  onPassed: (updated: CardDispatchRecord) => void;
}

export const CardQcScannerModal: React.FC<CardQcScannerModalProps> = ({
  isOpen,
  onClose,
  record,
  onPassed
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [scanning, setScanning] = useState(false);
  const [nfcUid, setNfcUid] = useState(record?.nfcUidVerified || '04:E2:89:1A:B5:4C:80');
  const [thermalPrintVerified, setThermalPrintVerified] = useState(true);
  const [antiScratchVerified, setAntiScratchVerified] = useState(true);
  const [barcodeVerified, setBarcodeVerified] = useState(true);
  const [qcNotes, setQcNotes] = useState('All 13.56 MHz RFID sectors and 2D barcode scannability verified.');

  if (!isOpen || !record) return null;

  const handleSimulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      const generatedUid = `04:${Math.floor(10 + Math.random() * 89).toString(16).toUpperCase()}:${Math.floor(10 + Math.random() * 89).toString(16).toUpperCase()}:${Math.floor(10 + Math.random() * 89).toString(16).toUpperCase()}:B5:4C:80`;
      setNfcUid(generatedUid);
      setScanning(false);
      showToast('success', 'NFC Contactless Chip read successfully: 13.56 MHz ISO/IEC 14443 Type A');
    }, 1200);
  };

  const handlePassQc = () => {
    const updated = CardDispatchService.markQcPassed(
      record.id,
      currentUser?.fullName || 'Senior Quality Auditor',
      nfcUid,
      qcNotes
    );
    if (updated) {
      onPassed(updated);
      showToast('success', `QC Passed for Card ${record.cardNumber}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Contactless NFC & Barcode Quality Check
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Card: {record.cardNumber} • {record.patientName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Card Info Banner */}
          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                CR80 PVC Inspection Target
              </div>
              <div className="text-base font-mono font-black text-slate-900 dark:text-white mt-0.5">
                {record.cardNumber}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                Cardholder: <strong className="text-slate-900 dark:text-white">{record.patientName}</strong> ({record.membershipName})
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-xs">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          {/* NFC UID Scanner Simulator */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-brand-blue" />
                13.56 MHz RFID / NFC Chip Hex UID
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSimulateScan}
                disabled={scanning}
                className="gap-1.5 text-brand-blue border-brand-blue/30"
              >
                <Scan className="w-3.5 h-3.5" />
                {scanning ? 'Reading Reader...' : 'Tap Card on USB Reader'}
              </Button>
            </div>
            <input
              type="text"
              value={nfcUid}
              onChange={e => setNfcUid(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono font-bold text-sm tracking-wider"
              placeholder="e.g. 04:E2:89:1A:B5:4C:80"
            />
          </div>

          {/* QC Inspection Checkpoints */}
          <div className="space-y-2 text-xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
              Quality Assurance Inspection Checklist
            </div>
            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={thermalPrintVerified}
                onChange={e => setThermalPrintVerified(e.target.checked)}
                className="w-4 h-4 rounded text-brand-blue"
              />
              <span>High-Density 300 DPI Thermal Dye Sublimation & Edge-to-Edge Alignment Verified</span>
            </label>
            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={antiScratchVerified}
                onChange={e => setAntiScratchVerified(e.target.checked)}
                className="w-4 h-4 rounded text-brand-blue"
              />
              <span>Anti-Scratch Clear Topcoat Lamination & Magnetic / Hologram Strip Intact</span>
            </label>
            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={barcodeVerified}
                onChange={e => setBarcodeVerified(e.target.checked)}
                className="w-4 h-4 rounded text-brand-blue"
              />
              <span>Laser Barcode & Emergency QR Scanner Test Decodes Instantly</span>
            </label>
          </div>

          {/* Inspector Notes */}
          <div className="text-xs">
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Auditor Remarks</label>
            <input
              type="text"
              value={qcNotes}
              onChange={e => setQcNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-medium"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handlePassQc}
            disabled={!thermalPrintVerified || !antiScratchVerified || !barcodeVerified}
            className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 shadow-md shadow-purple-600/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve & Sign QC Certificate
          </Button>
        </div>
      </div>
    </div>
  );
};
