import React, { useState, useEffect } from 'react';
import { PatientAppointment, Patient, HealthCard, Membership } from '../../types';
import { StorageService } from '../../services/storage';
import { WalletService } from '../../services/walletService';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { LabMedixLogo } from '../common/LabMedixLogo';
import { useToast } from '../../context/ToastContext';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import { formatCurrency, formatDateTime, formatDate } from '../../utils/formatters';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Sparkles,
  ShieldCheck,
  Activity,
  HeartPulse,
  Share2,
  Send,
  MessageSquare,
  FileText,
  Stethoscope,
  Maximize2,
  CheckCircle2,
  Clock,
  Wifi,
  Radio,
  BadgePercent,
  Wallet,
  Check,
  Copy
} from 'lucide-react';

interface TelemedicineVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: PatientAppointment;
  onLaunchPrescription: (appointment: PatientAppointment) => void;
}

export const TelemedicineVideoModal: React.FC<TelemedicineVideoModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onLaunchPrescription
}) => {
  const { showToast } = useToast();
  const company = StorageService.getCompanyProfile();
  const cards = StorageService.getCards();
  const memberships = StorageService.getMemberships();

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(142); // 2 mins 22 sec initial
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [isDebitProcessed, setIsDebitProcessed] = useState<boolean>(appointment.walletDebitStatus === 'paid');

  const activeCard = cards.find(c => c.patientId === appointment.patientId && c.status === 'active');
  const activeMembership = activeCard ? memberships.find(m => m.id === activeCard.membershipId) : null;
  const wallet = WalletService.getByPatientId(appointment.patientId);

  // Telemedicine discount calculation
  const discountPercent = activeMembership?.opdDiscount || 20;
  const netTelemedicineFee = Math.round(appointment.consultationFee * (1 - discountPercent / 100));

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleProcessTelemedicineDebit = () => {
    if (!wallet) {
      showToast('error', 'No Health Wallet', 'Patient does not have an active health wallet.');
      return;
    }
    const result = WalletService.addTransaction(
      appointment.patientId,
      'debit',
      netTelemedicineFee,
      `Telemedicine Video Consultation Fee: ${appointment.appointmentNo} with ${appointment.doctorName}`,
      {
        customRef: appointment.appointmentNo,
        grossAmount: appointment.consultationFee,
        discountAmount: appointment.consultationFee - netTelemedicineFee,
        discountPercentage: discountPercent
      }
    );

    if (result.transaction) {
      setIsDebitProcessed(true);
      triggerCelebrationFireworks();
      showToast('success', 'Fee Settled from Health Wallet', `Debited ${formatCurrency(netTelemedicineFee)} (${discountPercent}% Cardholder Discount Applied).`);
    } else {
      showToast('error', 'Debit Failed', result.error || 'Insufficient wallet balance.');
    }
  };

  const handleSendWhatsAppLink = () => {
    const msg = `https://wa.me/?text=${encodeURIComponent(
      `Hello ${appointment.patientName}, your Telemedicine Consultation Video Room is live with ${appointment.doctorName}.\n\nJoin Encrypted Room: ${appointment.telemedicineRoomUrl || 'https://telemed.labmedix.org/room/telemed-live'}\n\nLABMEDIX Healthcare System Helpline: ${company.helpline || '1800-889-9911'}`
    )}`;
    window.open(msg, '_blank');
    showToast('success', 'WhatsApp Dispatch Ready', 'Opened WhatsApp dispatch for patient.');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Telemedicine Video Room: ${appointment.patientName}`} maxWidth="4xl">
      <div className="space-y-4 text-xs">
        {/* Top Video Session Header */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-teal-950 to-slate-900 text-white border border-teal-500/40 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="w-3 h-3 rounded-full bg-emerald-500 block animate-ping" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 block absolute inset-0" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-sm font-black text-white">
                  {appointment.patientName}
                </strong>
                <Badge variant="blue" size="sm">
                  {appointment.cardTier}
                </Badge>
              </div>
              <span className="text-[10px] text-teal-300 font-mono">
                {appointment.appointmentNo} • Mode: 🌐 HD Telemedicine WebRTC Encrypted
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700 text-emerald-400 font-bold">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              {formatCallTime(callDuration)} • 1080p 60fps (24ms)
            </span>
            <button
              type="button"
              onClick={handleSendWhatsAppLink}
              className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 font-bold text-[10px]"
            >
              <Send className="w-3 h-3" />
              WhatsApp Link
            </button>
          </div>
        </div>

        {/* Video Simulation Canvas */}
        <div className="relative w-full aspect-video rounded-3xl bg-slate-950 overflow-hidden border-2 border-slate-800 shadow-2xl flex items-center justify-center">
          {/* Patient Remote Video Feed */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80"
              alt="Patient Remote Stream"
              className="w-full h-full object-cover filter brightness-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
          </div>

          {/* Remote Patient Live Telemetry Overlay */}
          <div className="absolute top-4 left-4 z-20 space-y-2 pointer-events-none">
            <div className="p-2.5 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-white space-y-1 max-w-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-teal-400 font-mono font-bold flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-teal-400" />
                  Remote Patient Live Telemetry
                </span>
                <span className="text-[9px] text-emerald-400 font-mono">Synced</span>
              </div>
              <p className="text-[11px] font-mono text-slate-200">
                Pulse: <strong>78 bpm</strong> • SpO2: <strong className="text-teal-400">99%</strong> • Temp: <strong>98.4°F</strong>
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                Complaint: {appointment.chiefComplaint}
              </p>
            </div>
          </div>

          {/* Doctor Picture-in-Picture Self Video Feed */}
          <div className="absolute bottom-4 right-4 z-20 w-44 sm:w-56 aspect-video rounded-2xl bg-slate-900 border-2 border-teal-500/80 shadow-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80"
              alt="Doctor Stream"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1.5 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[9px] font-bold text-teal-300 font-mono">
              {appointment.doctorName} (You)
            </div>
          </div>

          {/* Center Call Controls Bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-2 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-700 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2.5 rounded-xl text-white font-bold transition-all ${
                isMuted ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-800 hover:bg-slate-700'
              }`}
              title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-2.5 rounded-xl text-white font-bold transition-all ${
                isVideoOff ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-800 hover:bg-slate-700'
              }`}
              title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
            >
              {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => {
                onLaunchPrescription(appointment);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black flex items-center gap-1.5 shadow-lg shadow-teal-500/20"
            >
              <Stethoscope className="w-4 h-4" />
              Prescribe (Rx)
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
              title="End Video Consultation"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Telemedicine Fee & Health Wallet Cardholder Settlement */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/20 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-sm border border-teal-500/30">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  Telemedicine Consultation Fee: {formatCurrency(netTelemedicineFee)}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300">
                  {discountPercent}% Card Discount
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Patient Wallet Balance: <strong>{formatCurrency(wallet?.balance || 2500)}</strong> • Card: {activeCard?.cardNumber || 'NFC Active'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isDebitProcessed ? (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 font-mono font-bold flex items-center gap-1.5 border border-emerald-300">
                <Check className="w-4 h-4 text-emerald-600" />
                100% Cashless Paid
              </span>
            ) : (
              <Button
                size="sm"
                variant="primary"
                className="bg-teal-600 hover:bg-teal-700 font-bold"
                onClick={handleProcessTelemedicineDebit}
              >
                Auto-Deduct from Health Wallet
              </Button>
            )}

            <Button
              size="sm"
              variant="primary"
              className="bg-gradient-to-r from-amber-500 to-teal-500 text-slate-950 font-black border-none"
              leftIcon={<Stethoscope className="w-3.5 h-3.5" />}
              onClick={() => {
                onLaunchPrescription(appointment);
                onClose();
              }}
            >
              Start Clinical Rx
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
