import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { BloodTestBooking, PortalService } from '../../services/portalService';
import { StorageService } from '../../services/storage';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import {
  TestTube,
  Truck,
  UserCheck,
  Tag,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Sparkles,
  Phone,
  ThermometerSnowflake,
  Box
} from 'lucide-react';

export interface PhlebotomySampleDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BloodTestBooking | null;
  onStatusUpdated: () => void;
  onOpenLabelPrinter: (booking: BloodTestBooking) => void;
}

const PHLEBOTOMIST_PRESETS = [
  { id: 'phleb_1', name: 'Ramesh Kumar', phone: '+91 98301 88221', badge: 'Sr. Field Phlebotomist (Bag #B-14)' },
  { id: 'phleb_2', name: 'Sunil Das', phone: '+91 98302 44332', badge: 'Express Home Collector (Bag #B-09)' },
  { id: 'phleb_3', name: 'Amit Roy', phone: '+91 98303 99110', badge: 'Central Lab Phlebotomy Lead' },
  { id: 'phleb_4', name: 'Priya Sen', phone: '+91 98304 66778', badge: 'Pediatric & Geriatric Specialist' }
];

export const PhlebotomySampleDispatchModal: React.FC<PhlebotomySampleDispatchModalProps> = ({
  isOpen,
  onClose,
  booking,
  onStatusUpdated,
  onOpenLabelPrinter
}) => {
  const { showToast } = useToast();
  const company = StorageService.getCompanyProfile();

  const [selectedPhlebId, setSelectedPhlebId] = useState(PHLEBOTOMIST_PRESETS[0].id);
  const [customPhlebName, setCustomPhlebName] = useState('');
  const [tubeType, setTubeType] = useState('edta_purple');
  const [boxSealBarcode, setBoxSealBarcode] = useState(() => `BOX-CC-${Math.floor(1000 + Math.random() * 9000)}`);
  const [scheduledSlot, setScheduledSlot] = useState(booking?.scheduledTime || '07:30 AM - 08:30 AM (Fasting)');
  const [targetStatus, setTargetStatus] = useState<BloodTestBooking['status']>(
    booking?.status === 'confirmed' ? 'phlebotomist_assigned' : 'sample_collected'
  );
  const [isProcessing, setIsProcessing] = useState(false);

  if (!booking) return null;

  const patient = StorageService.getPatients().find(p => p.id === booking.patientId) || {
    id: booking.patientId,
    fullName: booking.patientName,
    mobile: '9830012345',
    bloodGroup: 'B+',
    age: 45,
    gender: 'male',
    address: { fullAddress: 'Salt Lake Sector 2, Kolkata 700091' }
  };

  const selectedPhleb = PHLEBOTOMIST_PRESETS.find(p => p.id === selectedPhlebId) || PHLEBOTOMIST_PRESETS[0];
  const finalPhlebName = customPhlebName.trim() || selectedPhleb.name;

  const tubeOptions = [
    { value: 'edta_purple', label: 'EDTA K2/K3 (Lavender/Purple Top) - CBC, HbA1c, Blood Group', color: '#8B5CF6' },
    { value: 'sst_gold', label: 'SST Gel / Clot Activator (Gold/Yellow Top) - Lipid, LFT, KFT, Thyroid', color: '#FBBF24' },
    { value: 'fluoride_gray', label: 'Sodium Fluoride (Gray Top) - Fasting Sugar, PPBS, Glucose', color: '#94A3B8' },
    { value: 'citrate_blue', label: 'Sodium Citrate 3.2% (Light Blue Top) - PT/INR, Coagulation', color: '#38BDF8' },
    { value: 'heparin_green', label: 'Sodium Heparin (Green Top) - Electrolytes, Blood Gases', color: '#10B981' }
  ];

  const handleDispatchAndSave = (nextState?: BloodTestBooking['status']) => {
    const statusToSet = nextState || targetStatus;
    setIsProcessing(true);

    setTimeout(() => {
      // Update in portal service
      PortalService.updateLabBookingStatus(booking.id, statusToSet);
      setIsProcessing(false);
      triggerCelebrationFireworks();

      const statusLabels: Record<string, string> = {
        phlebotomist_assigned: `Phlebotomist ${finalPhlebName} Dispatched with Box ${boxSealBarcode}`,
        sample_collected: `Sample Collected & Verified in Cold-Chain Box ${boxSealBarcode}`,
        processing: `Sample Received at Central Diagnostic Lab & Processing Started`,
        report_ready: `Official Diagnostic Report Ready & Uploaded`
      };

      showToast(
        'success',
        'Sample Logistics Updated',
        `${booking.bookingNo}: ${statusLabels[statusToSet] || statusToSet}.`
      );

      onStatusUpdated();
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Phlebotomy Sample Dispatch & Logistics: ${booking.bookingNo}`}
      maxWidth="2xl"
    >
      <div className="space-y-6 text-xs">
        {/* Header Summary Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 border border-teal-500/40 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center shrink-0">
              <TestTube className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  {booking.bookingNo}
                </span>
                <span className="text-[10px] font-bold uppercase text-amber-400 font-mono">
                  {booking.collectionType === 'home_collection' ? '🏠 Home Collection' : '🏥 Lab Visit'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white mt-1">
                {booking.testName}
              </h3>
              <p className="text-[11px] text-slate-300">
                Patient: <strong className="text-white">{booking.patientName}</strong> ({booking.patientId}) • Scheduled: <strong className="text-amber-300">{formatDate(booking.scheduledDate)}</strong>
              </p>
            </div>
          </div>

          <div className="text-right font-mono shrink-0">
            <span className="text-[10px] text-slate-400 block font-sans">Current Status:</span>
            <span className="px-2.5 py-1 rounded-xl text-xs font-black uppercase bg-slate-950 text-teal-400 border border-slate-700 block mt-0.5">
              {booking.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Dispatch Configuration Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Box: Phlebotomist Assignment */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <UserCheck className="w-4 h-4 text-teal-600" />
                Assign Certified Field Phlebotomist
              </span>
              <span className="text-[10px] text-emerald-600 font-mono font-bold">Verified Staff</span>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                Select Available Collector:
              </label>
              <select
                value={selectedPhlebId}
                onChange={(e) => setSelectedPhlebId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
              >
                {PHLEBOTOMIST_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.badge} ({p.phone})
                  </option>
                ))}
              </select>

              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-[11px] space-y-1">
                <div className="flex justify-between font-bold text-teal-900 dark:text-teal-200">
                  <span>Assigned Phlebotomist:</span>
                  <span>{selectedPhleb.name}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Mobile:</span>
                  <span className="font-mono">{selectedPhleb.phone}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Kit / Bag ID:</span>
                  <span className="font-mono text-teal-600 font-bold">{selectedPhleb.badge.split(' (')[1]?.replace(')', '') || 'Bag #B-14'}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Collection Slot / Time:
              </label>
              <Input
                value={scheduledSlot}
                onChange={(e) => setScheduledSlot(e.target.value)}
                placeholder="e.g. 07:30 AM - 08:30 AM (Fasting Slot)"
              />
            </div>
          </div>

          {/* Right Box: Specimen & Cold-Chain Logistics */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <Box className="w-4 h-4 text-purple-600" />
                Specimen & Cold-Chain Logistics
              </span>
              <span className="text-[10px] text-purple-600 font-mono font-bold">2°C - 8°C Monitored</span>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                Primary Vacutainer Tube Specimen:
              </label>
              <select
                value={tubeType}
                onChange={(e) => setTubeType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              >
                {tubeOptions.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>

              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-[11px] space-y-1">
                <div className="flex justify-between items-center text-purple-900 dark:text-purple-200">
                  <span className="font-bold">Vacutainer Cap Color:</span>
                  <span className="flex items-center gap-1.5 font-bold font-mono">
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block shadow-sm"
                      style={{ backgroundColor: tubeOptions.find(o => o.value === tubeType)?.color }}
                    />
                    {tubeType.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Biohazard Box Seal:</span>
                  <span className="font-mono text-purple-700 dark:text-purple-300 font-bold">{boxSealBarcode}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Fasting Protocol:</span>
                  <span className="font-bold text-amber-600">{booking.fastingRequired ? '⚠️ 10-12 Hours Fasting' : 'Routine Specimen'}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Bio-Safety Carrier Seal Barcode:
              </label>
              <Input
                value={boxSealBarcode}
                onChange={(e) => setBoxSealBarcode(e.target.value)}
                placeholder="e.g. BOX-CC-4921"
              />
            </div>
          </div>
        </div>

        {/* Step-by-Step Status Lifecycle Progression Selector */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
            Step-by-Step Sample Lifecycle Pipeline:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <button
              type="button"
              onClick={() => setTargetStatus('phlebotomist_assigned')}
              className={`p-3 rounded-xl border transition-all text-xs font-bold ${
                targetStatus === 'phlebotomist_assigned'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4 mx-auto mb-1 text-amber-400" />
              1. Dispatch Collector
            </button>

            <button
              type="button"
              onClick={() => setTargetStatus('sample_collected')}
              className={`p-3 rounded-xl border transition-all text-xs font-bold ${
                targetStatus === 'sample_collected'
                  ? 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-md ring-1 ring-teal-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <TestTube className="w-4 h-4 mx-auto mb-1 text-teal-400" />
              2. Sample Collected
            </button>

            <button
              type="button"
              onClick={() => setTargetStatus('processing')}
              className={`p-3 rounded-xl border transition-all text-xs font-bold ${
                targetStatus === 'processing'
                  ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-md ring-1 ring-purple-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 mx-auto mb-1 text-purple-400" />
              3. Lab Processing
            </button>

            <button
              type="button"
              onClick={() => setTargetStatus('report_ready')}
              className={`p-3 rounded-xl border transition-all text-xs font-bold ${
                targetStatus === 'report_ready'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md ring-1 ring-emerald-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
              4. Report Ready
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Tag className="w-3.5 h-3.5 text-purple-600" />}
              onClick={() => {
                onClose();
                onOpenLabelPrinter(booking);
              }}
            >
              Print Tube Barcode Label
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-gradient-to-r from-teal-600 to-emerald-600 font-black shadow-lg"
              leftIcon={<Truck className="w-4 h-4" />}
              isLoading={isProcessing}
              onClick={() => handleDispatchAndSave()}
            >
              Confirm Dispatch & Update Pipeline
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
